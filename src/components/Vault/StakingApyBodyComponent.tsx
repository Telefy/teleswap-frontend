/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { FC, useMemo } from 'react'
import { DeserializedLockedVaultUser, DeserializedPool } from 'state/types'
import { getVaultPosition } from 'utils/telePool'
import StakingApy from 'pages/telestake/StakingApyComponent'
import FlexibleApyComponent from './FlexibleApyComponent'
import LockedApyComponent from './LockedApyComponent'
import { BIG_ZERO } from 'utils/bigNumber'

export const StakingApyBodyComponent: FC<{
  userData: DeserializedLockedVaultUser
  pool: DeserializedPool
}> = ({ userData, pool }) => {
  const position = useMemo(() => getVaultPosition(userData), [userData])

  if (position) {
    return (
      <>
        {position == 1 ? (
          <FlexibleApyComponent pool={pool} />
        ) : position > 1 ? (
          <LockedApyComponent
            userData={userData}
            stakingToken={pool?.stakingToken}
            stakingTokenBalance={pool?.userData?.stakingTokenBalance || BIG_ZERO}
          />
        ) : (
          <></>
        )}
      </>
    )
  }

  return <StakingApy />
}
