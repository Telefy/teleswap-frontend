/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import BigNumber from 'bignumber.js'
import { DeserializedPool } from 'state/types'
import { BIG_ZERO } from 'utils/bigNumber'
import VaultApprovalAction from './VaultApprovalAction'
import VaultStakeActions from './VaultStakeActions'
import { useCheckVaultApprovalStatus } from 'hooks/useApprove'

const CakeVaultCardActions: React.FC<{
  pool: DeserializedPool
  accountHasSharesStaked: boolean
  isLoading: boolean
  performanceFee: number
}> = ({ pool, accountHasSharesStaked, isLoading, performanceFee }) => {
  const { stakingToken, userData } = pool
  const stakingTokenBalance = userData?.stakingTokenBalance ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO

  const { isVaultApproved, setLastUpdated } = useCheckVaultApprovalStatus()

  return (
    <div>
      <div className="title mt-1">
        {accountHasSharesStaked ? stakingToken.symbol : 'Stake'}{' '}
        {accountHasSharesStaked ? 'Staked' : `${stakingToken.symbol}`}
      </div>
      {isVaultApproved ? (
        <VaultStakeActions
          pool={pool}
          stakingTokenBalance={stakingTokenBalance}
          accountHasSharesStaked={accountHasSharesStaked}
          performanceFee={performanceFee}
        />
      ) : (
        <VaultApprovalAction setLastUpdated={setLastUpdated} isLoading={isLoading} />
      )}
    </div>
  )
}

export default CakeVaultCardActions
