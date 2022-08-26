/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Trans } from '@lingui/macro'
import { FC, ReactNode, useMemo } from 'react'
import { DeserializedLockedVaultUser } from 'state/types'
import { VaultPosition, getVaultPosition } from 'utils/telePool'

const positionLabel: Record<VaultPosition, ReactNode> = {
  [VaultPosition.None]: '',
  [VaultPosition.Flexible]: <Trans>Flexible</Trans>,
  [VaultPosition.Locked]: <Trans>Locked</Trans>,
  [VaultPosition.LockedEnd]: <Trans>Locked End</Trans>,
  [VaultPosition.AfterBurning]: <Trans>After Burning</Trans>,
}

export const VaultPositionTagWithLabel: FC<{ userData: DeserializedLockedVaultUser }> = ({ userData, ...props }) => {
  const position = useMemo(() => getVaultPosition(userData), [userData])

  if (position) {
    return (
      <div className="confirm-lock-title">
        <div className="title">My Position</div>
        <div>{positionLabel[position]}</div>
      </div>
    )
  }

  return null
}
