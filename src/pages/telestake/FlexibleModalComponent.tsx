/* eslint-disable react/react-in-jsx-scope */
import React, { useState } from 'react'
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import { Modal, ModalFooter, ModalHeader, ModalBody } from 'reactstrap'
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css'
import RangeSlider from 'react-bootstrap-range-slider'
import { Input as NumericalInput } from 'components/NumericalInput'
import BigNumber from 'bignumber.js'
import { BIG_TEN } from 'utils/bigNumber'
import { DeserializedLockedVaultUser, DeserializedPool, VaultKey } from 'state/types'
import { useActiveWeb3React } from 'hooks/web3'
import { useAppDispatch } from 'state/hooks'
import useCatchTxError from 'hooks/useCatchTxError'
import { formatNumber, getDecimalAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { formatNumberDecimals } from 'functions'
import { useTelePrice } from 'services/graph'
import { ChainId } from '@telefy/teleswap-core-sdk'
import { useVaultApy } from 'hooks/useVaultApy'
import { getInterestBreakdown } from 'utils/compoundApyHelpers'
import { ButtonLight, ButtonSecondary } from 'components/Button'
import { ConvertToLockButton } from 'components/Vault/ConvertToLockButton'
import { Link } from 'react-router-dom'
import { usePoolsPageFetch, useUpdateCakeVaultUserData, useVaultPoolByKey } from 'state/pools/hooks'
import { fetchCakeVaultUserData } from 'state/pools'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useTelePoolContract } from 'hooks/useContract'
import { vaultPoolConfig } from 'constants/pools'
import { BIG_NUMBER_FMT, ZERO_ADDRESS } from 'constants/misc'
import { UpdateUserDataComponent } from 'components/Vault/UpdateUserDataComponent'

// min deposit and withdraw amount
const MIN_AMOUNT = new BigNumber(10000000000000)

interface FlexibleModalComponentProps {
  pool: DeserializedPool
  stakingMax: BigNumber
  performanceFee?: number
  isRemovingStake?: boolean
  isOpen: boolean
  onDismiss: () => void
  handleReRenderToggle: VoidFunction
}

function FlexibleModalComponent({
  stakingMax,
  performanceFee,
  pool,
  isOpen,
  onDismiss,
  isRemovingStake = false,
  handleReRenderToggle,
}: FlexibleModalComponentProps) {
  const darkMode = useIsDarkMode()
  const dispatch = useAppDispatch()
  const { chainId } = useActiveWeb3React()
  const { stakingToken, earningTokenPrice, vaultKey } = pool

  const { account } = useActiveWeb3React()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const [percent, setPercent] = useState(0)
  const [loadUserData, setLoadUserData] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('')
  const { data: telePrice } = useTelePrice(chainId || ChainId.MAINNET)
  const telePriceAsBigNumber = new BigNumber(telePrice)
  const usdValueStaked = new BigNumber(stakeAmount).times(telePriceAsBigNumber)
  const formattedUsdValueStaked =
    telePriceAsBigNumber.gt(0) && stakeAmount ? formatNumber(usdValueStaked.toNumber()) : ''
  const { flexibleApy } = useVaultApy()
  const { userData } = useVaultPoolByKey(pool.vaultKey as VaultKey)
  const {
    lastDepositedTime,
    userShares,
    balance: { cakeAsBigNumber, cakeAsNumberBalance },
  } = userData as DeserializedLockedVaultUser
  const { callWithGasPrice } = useCallWithGasPrice()
  const vaultPoolContract = useTelePoolContract()
  const callOptions = {
    gasLimit: vaultPoolConfig[pool.vaultKey as VaultKey].gasLimit,
  }
  // console.log({
  //   principalInUSD: !usdValueStaked.isNaN() ? usdValueStaked.toNumber() : 0,
  //   apr: +flexibleApy,
  //   earningTokenPrice: earningTokenPrice || 0,
  //   performanceFee,
  //   compoundFrequency: 0,
  // })

  const interestBreakdown = getInterestBreakdown({
    principalInUSD: !usdValueStaked.isNaN() ? usdValueStaked.toNumber() : 0,
    apr: +flexibleApy,
    earningTokenPrice: telePrice || 0,
    performanceFee,
    compoundFrequency: 0,
  })
  const getTokenLink = stakingToken.address ? `/swap?use=V2&outputCurrency=${stakingToken.address}` : '/swap?use=V2'
  const annualRoi = interestBreakdown[3] * (pool.earningTokenPrice || 1)
  const formattedAnnualRoi = formatNumber(annualRoi, annualRoi > 10000 ? 0 : 2, annualRoi > 10000 ? 0 : 2)
  const convertedStakeAmount = getDecimalAmount(new BigNumber(stakeAmount), stakingToken.decimals)
  const handleStakeInputChange = (input: string) => {
    if (input) {
      const convertedInput = new BigNumber(input).multipliedBy(BIG_TEN.pow(stakingToken.decimals))
      const percentage = Math.floor(convertedInput.dividedBy(stakingMax).multipliedBy(100).toNumber())
      setPercent(percentage > 100 ? 100 : percentage)
    } else {
      setPercent(0)
    }
    setStakeAmount(input)
  }
  const handleChangePercent = (sliderPercent: number) => {
    if (sliderPercent > 0) {
      const percentageOfStakingMax = stakingMax.dividedBy(100).multipliedBy(sliderPercent)
      const amountToStake = getFullDisplayBalance(percentageOfStakingMax, stakingToken.decimals, stakingToken.decimals)
      setStakeAmount(amountToStake)
    } else {
      setStakeAmount('')
    }
    setPercent(sliderPercent)
  }
  const handleWithdrawal = async () => {
    // trigger withdrawAll function if the withdrawal will leave 0.00001 CAKE or less
    const isWithdrawingAll = stakingMax.minus(convertedStakeAmount).lte(MIN_AMOUNT)
    if (vaultPoolContract) {
      const receipt = await fetchWithCatchTxError(() => {
        // .toString() being called to fix a BigNumber error in prod
        // as suggested here https://github.com/ChainSafe/web3.js/issues/2077
        return isWithdrawingAll
          ? callWithGasPrice(vaultPoolContract, 'withdrawAll', undefined, callOptions)
          : callWithGasPrice(
              vaultPoolContract,
              'withdrawByAmount',
              [convertedStakeAmount.toFormat(BIG_NUMBER_FMT)],
              callOptions
            )
      }, 'Unstaked! Your earnings have also been harvested to your wallet!')

      if (receipt?.status) {
        handleReRenderToggle()
        // setLoadUserData(true)
        onDismiss?.()
        // useUpdateCakeVaultUserData()
      }
    }
  }
  const handleDeposit = async (lockDuration = 0) => {
    if (vaultPoolContract) {
      const receipt = await fetchWithCatchTxError(() => {
        // .toString() being called to fix a BigNumber error in prod
        // as suggested here https://github.com/ChainSafe/web3.js/issues/2077
        const methodArgs = [convertedStakeAmount.toFormat(BIG_NUMBER_FMT), lockDuration.toString()]
        return callWithGasPrice(vaultPoolContract, 'deposit', methodArgs, callOptions)
      }, 'Staked! Your funds have been staked in the pool')

      if (receipt?.status) {
        handleReRenderToggle()
        // setLoadUserData(true)
        onDismiss?.()
      }
    }
  }
  const handleConfirmClick = async () => {
    if (isRemovingStake) {
      // unstaking
      handleWithdrawal()
    } else {
      // staking
      handleDeposit()
    }
  }
  return (
    <>
      <div>
        <Modal
          className={`animated flexible-modal fadeIn ${darkMode ? 'locked-modal-dark' : 'locked-modal-light'}`}
          isOpen={isOpen}
          backdrop={false}
        >
          <ModalHeader>
            <div className="flexiblecard-header">
              {/* <img src={Icon} alt="teleicon" /> */}
              <h1 className="font-md">{isRemovingStake ? 'Unstake TELE' : 'Stake TELE'}</h1>
              {/* <p>Stake, Earn - And More!</p> */}
              <div className="modal-close-btn" onClick={onDismiss}>
                &times;
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div>
              <div className="flexiblecard-content">
                <div className="box-content">
                  <div className="box-content-item title">{isRemovingStake ? 'Unstake' : 'Stake'}</div>
                  <div className="box-content-item">
                    <img src={Icon} alt="teleicon" width={20} /> TELE
                  </div>
                </div>
                <div className="apy-block">
                  <div className="box-content-top">
                    <div className="box-content-top-item">
                      <div className="tele-input">
                        <NumericalInput
                          className="token-amount-input w100"
                          value={formatNumberDecimals(stakeAmount, 5)}
                          onUserInput={handleStakeInputChange}
                        />
                      </div>
                    </div>
                    <div className="box-content-top-item">
                      <div className="text-under">
                        {telePriceAsBigNumber.gt(0) && `~${formattedUsdValueStaked || 0} USD`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="balance">Balance - {getFullDisplayBalance(stakingMax, stakingToken.decimals)}</div>
              </div>
              <div className="stake-slider">
                <RangeSlider
                  value={percent}
                  min={0}
                  max={100}
                  tooltipPlacement="top"
                  tooltip="on"
                  onChange={(changeEvent) => handleChangePercent(Number(changeEvent.target.value))}
                />
                <div className="slider-placeholder">
                  <div>0</div>
                  <div>100</div>
                </div>
              </div>
              <div className="button-group-flex mt-1">
                <div>
                  <Button className={percent === 25 ? 'bg-purple' : ''} onClick={() => handleChangePercent(25)}>
                    25%
                  </Button>
                </div>
                <div>
                  <Button className={percent === 50 ? 'bg-purple' : ''} onClick={() => handleChangePercent(50)}>
                    50%
                  </Button>
                </div>
                <div>
                  <Button className={percent === 75 ? 'bg-purple' : ''} onClick={() => handleChangePercent(75)}>
                    75%
                  </Button>
                </div>
                <div>
                  <Button className={percent === 100 ? 'bg-purple' : ''} onClick={() => handleChangePercent(100)}>
                    MAX
                  </Button>
                </div>
              </div>
              {!isRemovingStake && (
                <div className="bottom-block">
                  <div className="box-content-bottom">
                    <div className="box-content-bottom-item">
                      <div>Annual ROI :</div>{' '}
                      <div className="bold">${Number.isFinite(annualRoi) ? formattedAnnualRoi : 0}</div>
                    </div>
                    <div className="box-content-bottom-item">
                      <div>Performance Fee :</div> <div className="bold">{performanceFee || 0}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="footer-buttons">
              {cakeAsNumberBalance ? (
                <ConvertToLockButton stakingToken={stakingToken} currentStakedAmount={cakeAsNumberBalance} />
              ) : null}
              <Button onClick={handleConfirmClick} disabled={pendingTx}>
                {pendingTx ? 'Confirming...' : 'Confirm'}
              </Button>
              {!isRemovingStake && (
                <ButtonLight as={Link} padding="14px 8px" to={getTokenLink}>
                  Get TELE
                </ButtonLight>
              )}
            </div>
          </ModalFooter>
        </Modal>
      </div>
    </>
  )
}

export default FlexibleModalComponent
