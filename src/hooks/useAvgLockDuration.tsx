import { useMemo } from 'react'
import { BOOST_WEIGHT, DURATION_FACTOR } from 'constants/pools'
import BigNumber from 'bignumber.js'
import _toNumber from 'lodash/toNumber'
import { useCakeVault } from 'state/pools/hooks'
import { BIG_ONE, BIG_TEN, BIG_ZERO } from 'utils/bigNumber'

import formatSecondsToWeeks from 'utils/formatSecondsToWeeks'

export default function useAvgLockDuration() {
  // console.log(
  //   totalLockedAmount?.toJSON(),
  //   totalShares?.toJSON(),
  //   totalCakeInVault?.toJSON(),
  //   pricePerFullShare?.toJSON()
  // )

  const avgLockDurationsInSeconds = 0

  const avgLockDurationsInWeeks = useMemo(
    () => formatSecondsToWeeks(avgLockDurationsInSeconds),
    [avgLockDurationsInSeconds]
  )

  return {
    avgLockDurationsInWeeks: avgLockDurationsInWeeks.length < 1 ? '<1 week' : avgLockDurationsInWeeks,
    avgLockDurationsInSeconds: _toNumber(avgLockDurationsInSeconds),
  }
}
