/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import useWithdrawalFeeTimer from 'hooks/useWithdrawalFeeTimer'
import { secondsToHours } from 'date-fns'
import { useVaultPoolByKey } from 'state/pools/hooks'
import { secondsToDay } from 'utils/timeHelper'
import { DeserializedLockedVaultUser, DeserializedVaultFees, VaultKey } from 'state/types'
import WithdrawalFeeTimer from './WithdrawalFeeTimer'
import { useActiveWeb3React } from 'hooks/web3'

interface UnstakingFeeCountdownRowProps {
  isTableVariant?: boolean
  vaultKey: VaultKey
}

const UnstakingFeeCountdownRow: React.FC<UnstakingFeeCountdownRowProps> = ({ isTableVariant, vaultKey }) => {
  const { account } = useActiveWeb3React()
  const { userData, fees } = useVaultPoolByKey(vaultKey)

  const { lastDepositedTime, userShares } = userData as DeserializedLockedVaultUser
  const { withdrawalFee, withdrawalFeePeriod } = fees as DeserializedVaultFees

  const feeAsDecimal = withdrawalFee / 100 || '-'

  const { secondsRemaining, hasUnstakingFee } = useWithdrawalFeeTimer(
    parseInt(lastDepositedTime, 10),
    userShares,
    withdrawalFeePeriod
  )

  // The user has made a deposit, but has no fee
  const noFeeToPay = lastDepositedTime && !hasUnstakingFee && userShares.gt(0)

  // Show the timer if a user is connected, has deposited, and has an unstaking fee
  const shouldShowTimer = account && lastDepositedTime && hasUnstakingFee

  const withdrawalFeePeriodHour = withdrawalFeePeriod ? secondsToHours(withdrawalFeePeriod) : '-'

  const getRowText = () => {
    if (noFeeToPay) {
      return 'Unstaking Fee'
    }
    if (shouldShowTimer) {
      return 'unstaking fee before'
    }
    return 'unstaking fee if withdrawn within ' + withdrawalFeePeriodHour + 'h'
  }

  return (
    <>
      <div className="unstakefee">
        <div>
          {noFeeToPay ? '0' : feeAsDecimal}% {getRowText()}
        </div>
        {shouldShowTimer && <WithdrawalFeeTimer secondsRemaining={secondsRemaining} />}
      </div>
    </>
  )
}

export default UnstakingFeeCountdownRow
