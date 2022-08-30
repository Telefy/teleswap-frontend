/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { useMemo, useState, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { getVaultPosition, VaultPosition } from 'utils/telePool'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceNumber } from 'utils/formatBalance'
import AfterLockedActions from './AfterLockedActions'
import { LockedActionsPropsType } from 'constants/types'
import Button from 'farm-components/Button'
import AddTeleToLockedModalComponent from 'pages/telestake/AddTeleToLockedModalComponent'
import ExtendLockedModalComponent from 'pages/telestake/ExtendLockedModalComponent'

const LockedActions: React.FC<LockedActionsPropsType> = ({
  userShares,
  locked,
  lockEndTime,
  lockStartTime,
  stakingToken,
  stakingTokenBalance,
  lockedAmount,
}) => {
  const position = useMemo(
    () =>
      getVaultPosition({
        userShares,
        locked,
        lockEndTime,
      }),
    [userShares, locked, lockEndTime]
  )
  const lockedAmountAsNumber = getBalanceNumber(lockedAmount)

  const currentBalance = useMemo(
    () => (stakingTokenBalance ? new BigNumber(stakingTokenBalance) : BIG_ZERO),
    [stakingTokenBalance]
  )
  const currentDuration = useMemo(() => Number(lockEndTime) - Number(lockStartTime), [lockEndTime, lockStartTime])

  const [modalAddTeleOpen, setModalAddTeleOpen] = useState(false)
  const handleDismissModalAddCake = useCallback(() => {
    setModalAddTeleOpen(false)
  }, [setModalAddTeleOpen])
  const [modalExtendTeleOpen, setModalExtendTeleOpen] = useState(false)
  const handleDismissModalExtendTele = useCallback(() => {
    setModalExtendTeleOpen(false)
  }, [setModalExtendTeleOpen])
  const onAddTeleButtonClick = () => setModalAddTeleOpen(true)
  const onExtendTeleButtonClick = () => setModalExtendTeleOpen(true)

  if (position === VaultPosition.Locked) {
    return (
      <>
        <div className="stake-tele-block mt-1">
          <div className="flexible">
            <Button onClick={onAddTeleButtonClick}>Add TELE</Button>
          </div>
          <div className="locked">
            <Button onClick={onExtendTeleButtonClick}>Extend</Button>
          </div>
        </div>
        <AddTeleToLockedModalComponent
          isOpen={modalAddTeleOpen}
          onDismiss={handleDismissModalAddCake}
          currentLockedAmount={lockedAmount}
          currentBalance={currentBalance}
          stakingToken={stakingToken}
          lockStartTime={lockStartTime}
          lockEndTime={lockEndTime}
          stakingTokenBalance={stakingTokenBalance}
        />
        <ExtendLockedModalComponent
          isOpen={modalExtendTeleOpen}
          onDismiss={handleDismissModalExtendTele}
          modalTitle={'Extend Lock Duration'}
          stakingToken={stakingToken}
          lockStartTime={lockStartTime}
          currentLockedAmount={lockedAmountAsNumber}
          currentDuration={currentDuration}
        />
      </>
    )
  }

  return (
    <AfterLockedActions
      lockEndTime={lockEndTime || '0'}
      lockStartTime={lockStartTime}
      position={position}
      currentLockedAmount={lockedAmountAsNumber}
      stakingToken={stakingToken}
    />
  )
}

export default LockedActions
