/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { memo, ReactNode, useCallback, useMemo, useState } from 'react'
import { VaultPosition } from 'utils/telePool'

import { AfterLockedActionsPropsType } from 'constants/types'
import ConvertToFlexibleButton from './ConvertToFlexibleButton'
import Button from 'farm-components/Button'
import { MAX_LOCK_DURATION, ONE_WEEK_DEFAULT } from 'constants/pools'
import ExtendLockedModalComponent from 'pages/telestake/ExtendLockedModalComponent'

const msg: Record<VaultPosition, ReactNode> = {
  [VaultPosition.None]: null,
  [VaultPosition.Flexible]: null,
  [VaultPosition.Locked]: null,
  [VaultPosition.LockedEnd]:
    'The lock period has ended. Convert to flexible staking or renew your position to start a new lock staking.',
  [VaultPosition.AfterBurning]:
    'The lock period has ended. To avoid more rewards being burned, convert to flexible staking or renew your position to start a new lock staking.',
}

const AfterLockedActions: React.FC<AfterLockedActionsPropsType> = ({
  currentLockedAmount,
  stakingToken,
  position,
  isInline,
}) => {
  const nowInSeconds = Date.now() / 1000
  const currentDuration = 0
  const currentDurationLeftInSeconds = useMemo(() => 0 - nowInSeconds, [nowInSeconds])
  const [modalExtendDurationOpen, setModalExtendDurationOpen] = useState(false)
  const handleDismissModalExtendDuration = useCallback(() => {
    setModalExtendDurationOpen(false)
  }, [setModalExtendDurationOpen])
  const onExtendDurationButtonClick = () => setModalExtendDurationOpen(true)
  return (
    <>
      <div className="lock-stake-info">
        <ConvertToFlexibleButton />
        <Button
          className="renew-button"
          disabled={
            Number.isFinite(currentDurationLeftInSeconds) &&
            MAX_LOCK_DURATION - currentDurationLeftInSeconds < ONE_WEEK_DEFAULT
          }
          onClick={onExtendDurationButtonClick}
        >
          Renew
        </Button>
        <p>
          <span className="alert-icon">&#9888;</span> {msg[position]}
        </p>
      </div>

      <ExtendLockedModalComponent
        isOpen={modalExtendDurationOpen}
        onDismiss={handleDismissModalExtendDuration}
        modalTitle={'Extend Lock Duration'}
        stakingToken={stakingToken}
        lockStartTime={'0'}
        currentLockedAmount={currentLockedAmount}
        currentDuration={currentDuration}
      />
    </>
  )
}

export default memo(AfterLockedActions)
