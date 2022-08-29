/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Trans } from '@lingui/macro'
import { FC, ReactNode, useMemo } from 'react'
import { DeserializedLockedVaultUser, DeserializedPool } from 'state/types'
import { VaultPosition, getVaultPosition } from 'utils/telePool'
import StakingApy from 'pages/telestake/StakingApyComponent'
import FlexibleApyComponent from './FlexibleApyComponent'
import { LockedApyComponent } from './LockedApyComponent'

const positionLabel: Record<VaultPosition, ReactNode> = {
  [VaultPosition.None]: '',
  [VaultPosition.Flexible]: <Trans>Flexible</Trans>,
  [VaultPosition.Locked]: <Trans>Locked</Trans>,
  [VaultPosition.LockedEnd]: <Trans>Locked End</Trans>,
  [VaultPosition.AfterBurning]: <Trans>After Burning</Trans>,
}

export const StakingApyBodyComponent: FC<{ userData: DeserializedLockedVaultUser; pool: DeserializedPool }> = ({
  userData,
  pool,
  ...props
}) => {
  const position = useMemo(() => getVaultPosition(userData), [userData])

  if (position) {
    return (
      <>
        {position == 1 ? (
          <FlexibleApyComponent pool={pool} />
        ) : position > 1 ? (
          <LockedApyComponent pool={pool} />
        ) : (
          <></>
        )}
      </>
    )
  }

  return <StakingApy pool={pool} />
}
