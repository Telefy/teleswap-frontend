/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import BigNumber from 'bignumber.js'
import { getBalanceNumber } from 'utils/formatBalance'
import { DeserializedLockedVaultUser, DeserializedPool, VaultKey } from 'state/types'
import { useVaultPoolByKey } from 'state/pools/hooks'
import Button from 'farm-components/Button'
import NotEnoughTokensModal from 'components/Vault/Modals/NotEnoughTokensModal'
import StakeModalComponent from '../StakeModalComponent'
import UnstakeModalComponent from '../UnstakeModalComponent'
import { useVaultApy } from 'hooks/useVaultApy'
import useAvgLockDuration from 'hooks/useAvgLockDuration'
import ConvertLockedModalComponent from '../ConvertLockedModalComponent'
import { useCallback, useState } from 'react'
import UnstakingFeeCountdownRow from '../UnstakingFeeCountdownRow'
import RecentCakeProfitRow from '../RecentCakeProfitRow'
import { useTelePrice } from 'services/graph'
import { ChainId } from '@telefy/teleswap-core-sdk'
import { useActiveWeb3React } from 'hooks/web3'
import { formatNumberDecimals } from 'functions'

interface HasStakeActionProps {
  pool: DeserializedPool
  stakingTokenBalance: BigNumber
  performanceFee: number
}

const HasSharesActions: React.FC<HasStakeActionProps> = ({ pool, stakingTokenBalance, performanceFee }) => {
  const { chainId } = useActiveWeb3React()
  const { userData } = useVaultPoolByKey(pool.vaultKey as VaultKey)
  const {
    balance: { cakeAsBigNumber, cakeAsNumberBalance },
  } = userData as DeserializedLockedVaultUser
  const { stakingToken } = pool
  const { avgLockDurationsInSeconds } = useAvgLockDuration()
  const { lockedApy } = useVaultApy({ duration: avgLockDurationsInSeconds })

  const { data: telePrice } = useTelePrice(chainId || ChainId.MAINNET)
  const telePriceAsBigNumber = new BigNumber(telePrice)

  const stakedDollarValue = telePriceAsBigNumber.gt(0)
    ? getBalanceNumber(cakeAsBigNumber.multipliedBy(telePriceAsBigNumber), stakingToken.decimals)
    : 0
  const [stakeModelIsOpen, setStakeModelIsOpen] = useState(false)
  const handleDismissModalStake = useCallback(() => {
    setStakeModelIsOpen(false)
  }, [setStakeModelIsOpen])
  const [unStakeModelIsOpen, setUnStakeModelIsOpen] = useState(false)
  const handleDismissModalUnStake = useCallback(() => {
    setUnStakeModelIsOpen(false)
  }, [setUnStakeModelIsOpen])
  const [notEnoughModelIsOpen, setNotEnoughModelIsOpen] = useState(false)
  const handleDismissModalNotEnough = useCallback(() => {
    setNotEnoughModelIsOpen(false)
  }, [setNotEnoughModelIsOpen])
  const [convertToLockModelIsOpen, setConvertToLockModelIsOpen] = useState(false)
  const handleDismissModalConvertToLock = useCallback(() => {
    setConvertToLockModelIsOpen(false)
  }, [setConvertToLockModelIsOpen])

  const onPresentTokenRequired = () => setNotEnoughModelIsOpen(true)
  const onPresentStake = () => setStakeModelIsOpen(true)
  const onPresentUnstake = () => setUnStakeModelIsOpen(true)
  const openConvetToLockModal = () => setConvertToLockModelIsOpen(true)

  return (
    <>
      <div className="custom-input2">
        <div className="locked-value">{cakeAsNumberBalance}</div>
        <div className="stk-btn-holder">
          <Button onClick={onPresentUnstake}>&#8722;</Button>
          <Button onClick={stakingTokenBalance.gt(0) ? onPresentStake : onPresentTokenRequired}>&#43;</Button>
        </div>
        {/* <div className={darkMode ? 'divider-dark' : 'divider-light'}></div> */}
        <div className="input-caption-left2">-{formatNumberDecimals(stakedDollarValue, 2)} USD</div>
      </div>
      <UnstakingFeeCountdownRow vaultKey={pool.vaultKey as VaultKey} />
      <div className="lock-stake-info">
        <p>
          <span className="alert-icon">&#9888;</span> Lock stacking offers higher APY while providing other benefits.{' '}
          <a className="link">
            Learn More <span>&gt;&gt;</span>
          </a>
        </p>
        <Button onClick={openConvetToLockModal}>Convert to Lock</Button>
        <p>
          Lock staking users are earning an average of {lockedApy ? parseFloat(lockedApy).toFixed(2) : 0}% APY. More
          benefits are coming soon.
        </p>
      </div>
      <UnstakeModalComponent
        isOpen={unStakeModelIsOpen}
        onDismiss={handleDismissModalUnStake}
        stakingMax={cakeAsBigNumber}
        pool={pool}
        isRemovingStake
      />
      <StakeModalComponent
        isOpen={stakeModelIsOpen}
        onDismiss={handleDismissModalStake}
        stakingMax={stakingTokenBalance}
        performanceFee={performanceFee}
        pool={pool}
      />
      <ConvertLockedModalComponent
        isOpen={convertToLockModelIsOpen}
        onDismiss={handleDismissModalConvertToLock}
        modalTitle={'Convert to Lock'}
        stakingToken={stakingToken}
        lockStartTime={'0'}
        currentLockedAmount={cakeAsNumberBalance}
        currentDuration={0}
      />
      <NotEnoughTokensModal
        isOpen={notEnoughModelIsOpen}
        onDismiss={handleDismissModalNotEnough}
        tokenSymbol={stakingToken.symbol || ''}
      />
    </>
  )
}

export default HasSharesActions
