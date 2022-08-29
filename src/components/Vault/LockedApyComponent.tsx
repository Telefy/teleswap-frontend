/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Trans } from '@lingui/macro'
import { FC, ReactNode } from 'react'
import { DeserializedPool } from 'state/types'
import { VaultPosition } from 'utils/telePool'

const positionLabel: Record<VaultPosition, ReactNode> = {
  [VaultPosition.None]: '',
  [VaultPosition.Flexible]: <Trans>Flexible</Trans>,
  [VaultPosition.Locked]: <Trans>Locked</Trans>,
  [VaultPosition.LockedEnd]: <Trans>Locked End</Trans>,
  [VaultPosition.AfterBurning]: <Trans>After Burning</Trans>,
}

export const LockedApyComponent: FC<{ pool: DeserializedPool }> = ({ pool, ...props }) => {
  return (
    <div className="confirm-lock-title">
      <div className="title">My Position</div>
      <div>Locked</div>
    </div>
  )
}
