/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import Button from 'farm-components/Button'
import { FC, useMemo } from 'react'
import { LockedModalBodyButtonPropsType, ModalValidator } from 'constants/types'
import { MAX_LOCK_DURATION } from 'constants/pools'
import { getBalanceAmount } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'

export const LockedStakeButton: FC<LockedModalBodyButtonPropsType> = ({
  lockedAmount,
  currentBalance,
  onDismiss,
  duration,
  validator,
  pendingTx,
  handleConfirmClick,
}) => {
  const { isValidAmount, isValidDuration }: ModalValidator = useMemo(() => {
    return typeof validator === 'function'
      ? validator({
          duration,
        })
      : {
          isValidAmount: lockedAmount?.toNumber() > 0 && getBalanceAmount(currentBalance || BIG_ZERO).gte(lockedAmount),
          isValidDuration: duration > 0 && duration <= MAX_LOCK_DURATION,
          isOverMax: duration > MAX_LOCK_DURATION,
        }
  }, [validator, currentBalance, lockedAmount, duration])
  console.log(isValidDuration, isValidAmount)
  return (
    <div className="footer-buttons">
      <Button disabled={pendingTx || !(isValidAmount && isValidDuration)} onClick={handleConfirmClick}>
        {pendingTx ? 'Confirming' : 'Confirm'}
      </Button>
    </div>
  )
}
