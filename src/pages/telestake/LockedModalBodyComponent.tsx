/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { useMemo } from 'react'
import _noop from 'lodash/noop'
import { MAX_LOCK_DURATION } from 'constants/pools'
import { getBalanceAmount } from 'utils/formatBalance'

import { LockedModalBodyPropsType, ModalValidator } from 'constants/types'

import Overview from 'components/Vault/LockedModal/Overview'
import LockDurationField from 'components/Vault/LockedModal/LockDurationField'
import { BIG_ZERO } from 'utils/bigNumber'

const LockedModalBodyComponent: React.FC<LockedModalBodyPropsType> = ({
  lockedAmount,
  currentBalance,
  editAmountOnly,
  validator,
  customOverview,
  duration,
  setDuration,
  usdValueStaked,
}) => {
  const { isValidDuration, isOverMax }: ModalValidator = useMemo(() => {
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

  return (
    <>
      {editAmountOnly || <LockDurationField isOverMax={isOverMax} setDuration={setDuration} duration={duration} />}
      {customOverview ? (
        customOverview({
          isValidDuration,
          duration,
        })
      ) : (
        <Overview
          isValidDuration={isValidDuration}
          openCalculator={_noop}
          duration={duration}
          lockedAmount={lockedAmount?.toNumber()}
          usdValueStaked={usdValueStaked || 0}
          showLockWarning
        />
      )}
    </>
  )
}

export default LockedModalBodyComponent
