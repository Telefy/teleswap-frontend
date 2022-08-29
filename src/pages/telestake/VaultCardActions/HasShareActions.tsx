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
import { useCallback, useState } from 'react'
import UnstakingFeeCountdownRow from '../UnstakingFeeCountdownRow'
import { useTelePrice } from 'services/graph'
import { ChainId } from '@telefy/teleswap-core-sdk'
import { useActiveWeb3React } from 'hooks/web3'
import { formatNumberDecimals } from 'functions'
import { ConvertToLockButton } from 'components/Vault/ConvertToLockButton'
import FlexibleModalComponent from '../FlexibleModalComponent'

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

  const onPresentTokenRequired = () => setNotEnoughModelIsOpen(true)
  const onPresentStake = () => setStakeModelIsOpen(true)
  const onPresentUnstake = () => setUnStakeModelIsOpen(true)

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
      <ConvertToLockButton stakingToken={stakingToken} currentStakedAmount={cakeAsNumberBalance} />
      <FlexibleModalComponent
        isOpen={unStakeModelIsOpen}
        onDismiss={handleDismissModalUnStake}
        stakingMax={cakeAsBigNumber}
        pool={pool}
        isRemovingStake
      />
      <FlexibleModalComponent
        isOpen={stakeModelIsOpen}
        onDismiss={handleDismissModalStake}
        stakingMax={stakingTokenBalance}
        performanceFee={performanceFee}
        pool={pool}
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
