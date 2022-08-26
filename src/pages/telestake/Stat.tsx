/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import BigNumber from 'bignumber.js'
import { FC } from 'react'
import { getBalanceNumber } from 'utils/formatBalance'
import { DeserializedLockedVaultUser, DeserializedPool } from 'state/types'
import { isLocked, isStaked } from 'utils/telePool'
import useAvgLockDuration from 'hooks/useAvgLockDuration'
import { Token } from '@telefy/teleswap-core-sdk'

export const PerformanceFee: FC<{ userData?: DeserializedLockedVaultUser; performanceFeeAsDecimal?: number }> = ({
  userData,
  performanceFeeAsDecimal,
}) => {
  const isLock = isLocked(userData as DeserializedLockedVaultUser)
  const isStake = isStaked(userData as DeserializedLockedVaultUser)

  if (!performanceFeeAsDecimal || isLock) {
    return null
  }

  return (
    <div className="box-content-item">
      <div>Performance Fee</div>{' '}
      <div className="foot-value">{isStake ? `${performanceFeeAsDecimal}%` : `0~${performanceFeeAsDecimal}%`}</div>
    </div>
  )
}

export const TotalLocked: FC<{ totalLocked: BigNumber; lockedToken: Token }> = ({ totalLocked, lockedToken }) => {
  return (
    <div className="box-content-item">
      <div>Total locked:</div>{' '}
      <div className="foot-value">{getBalanceNumber(totalLocked, lockedToken.decimals)} TELE</div>
    </div>
  )
}

export const DurationAvg = () => {
  const { avgLockDurationsInWeeks } = useAvgLockDuration()

  return (
    <div className="box-content-item">
      <div>Average lock duration:</div> <div className="foot-value">{avgLockDurationsInWeeks}</div>
    </div>
  )
}

export const TotalStaked: FC<{ totalStaked: BigNumber; stakingToken: Token }> = ({ totalStaked, stakingToken }) => {
  return (
    <div className="box-content-item">
      <div>Total staked:</div>{' '}
      <div className="foot-value">{getBalanceNumber(totalStaked, stakingToken.decimals)} TELE</div>
    </div>
  )
}

export const AprInfo: FC<{ pool: DeserializedPool }> = ({ pool }) => {
  const { isFinished, apr } = pool
  return (
    <div className="box-content-item">
      <div>APR:</div> <div className="foot-value">{isFinished ? 0 : apr} TELE</div>
    </div>
  )
}
