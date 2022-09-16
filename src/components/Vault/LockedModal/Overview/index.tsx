/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { useMemo } from 'react'
import { addSeconds, format } from 'date-fns'
import { useVaultApy } from 'hooks/useVaultApy'
import _toNumber from 'lodash/toNumber'
import { convertTimeToSeconds } from 'utils/timeHelper'
import formatSecondsToWeeks from 'utils/formatSecondsToWeeks'
import DiffBalance from './BalanceRow'
import formatRoi from 'utils/formatRoi'
import { OverviewPropsType } from 'constants/types'
import DiffText from './TextRow'

const Overview: React.FC<OverviewPropsType> = ({
  usdValueStaked,
  lockedAmount,
  duration,
  isValidDuration,
  newDuration,
  newLockedAmount,
  lockStartTime,
  lockEndTime,
  showLockWarning,
}) => {
  const { getLockedApy, getBoostFactor } = useVaultApy()

  const lockedApy = useMemo(() => getLockedApy(duration), [getLockedApy, duration])
  const boostFactor = useMemo(() => getBoostFactor(duration), [getBoostFactor, duration])
  const newLockedApy = useMemo(() => (newDuration && getLockedApy(newDuration)) || '0', [getLockedApy, newDuration])
  const newBoost = useMemo(() => (newDuration && getBoostFactor(newDuration)) || 0, [getBoostFactor, newDuration])

  const formattedRoi = useMemo(() => {
    return formatRoi({ usdValueStaked, lockedApy: lockedApy || '', duration })
  }, [lockedApy, usdValueStaked, duration])

  const newFormattedRoi = useMemo(() => {
    return newLockedApy && formatRoi({ usdValueStaked, lockedApy: newLockedApy, duration: newDuration || 0 })
  }, [newLockedApy, usdValueStaked, newDuration])

  const now = new Date()

  const unlockDate = newDuration
    ? addSeconds(Number(lockStartTime) ? new Date(convertTimeToSeconds(lockStartTime as string)) : now, newDuration)
    : Number(lockEndTime)
    ? new Date(convertTimeToSeconds(lockEndTime as string))
    : addSeconds(now, duration)

  return (
    <>
      <div className="mt-1">Lock Overview</div>
      <div className="bottom-block">
        <div className="box-content-bottom">
          <div className="box-content-bottom-item">
            <div>TELE to be locked :</div>{' '}
            <DiffBalance value={lockedAmount} newValue={newLockedAmount} decimals={2} suffix="" prefix="" />
          </div>
          <div className="box-content-bottom-item">
            <div>APY :</div>{' '}
            <DiffBalance
              value={_toNumber(lockedApy)}
              newValue={_toNumber(newLockedApy)}
              decimals={2}
              suffix=""
              prefix=""
            />
          </div>
          <div className="box-content-bottom-item">
            <div>Duration :</div>{' '}
            <DiffText
              value={isValidDuration ? formatSecondsToWeeks(duration) : '0 weeks'}
              newValue={isValidDuration && newDuration ? formatSecondsToWeeks(newDuration) : undefined}
            />
          </div>
          <div className="box-content-bottom-item">
            <div>Yield boost :</div>{' '}
            <DiffBalance
              value={_toNumber(boostFactor)}
              newValue={_toNumber(newBoost)}
              decimals={2}
              suffix="x"
              prefix=""
            />
          </div>
          <div className="box-content-bottom-item">
            <div>Unlock On :</div>{' '}
            <div className="bold">{isValidDuration && unlockDate ? format(unlockDate, 'MMM do, yyyy HH:mm') : '-'}</div>
          </div>
          <div className="box-content-bottom-item">
            <div>Estimated ROI :</div> <DiffText value={formattedRoi} newValue={newFormattedRoi} prefix={'$'} />
          </div>
        </div>
      </div>

      {showLockWarning && (
        <>
          <div className="mt-1">Warning</div>
          <div>
            {'You will be able to withdraw the staked TELE and profit only when the staking position is unlocked'}
          </div>
        </>
      )}
    </>
  )
}

export default Overview
