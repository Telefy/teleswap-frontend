import { useMemo } from 'react'
import { BOOST_WEIGHT, DURATION_FACTOR } from 'constants/pools'
import BigNumber from 'bignumber.js'
import _toNumber from 'lodash/toNumber'
import { useCakeVault } from 'state/pools/hooks'
import { BIG_ONE, BIG_TEN, BIG_ZERO } from 'utils/bigNumber'

import formatSecondsToWeeks from 'utils/formatSecondsToWeeks'

export default function useAvgLockDuration() {
  const { totalLockedAmount, totalShares, totalCakeInVault, pricePerFullShare } = useCakeVault()

  const avgLockDurationsInSeconds = useMemo(() => {
    const flexibleCakeAmount = totalCakeInVault?.minus(totalLockedAmount || BIG_ZERO)
    const flexibleCakeShares = flexibleCakeAmount?.div(pricePerFullShare || BIG_ONE).times(BIG_TEN.pow(18))
    const lockedCakeBoostedShares = totalShares?.minus(flexibleCakeShares || BIG_ZERO)
    const lockedCakeOriginalShares = totalLockedAmount?.div(pricePerFullShare || BIG_ONE).times(BIG_TEN.pow(18))
    const avgBoostRatio = lockedCakeBoostedShares?.div(
      lockedCakeOriginalShares ? (lockedCakeOriginalShares.isZero() ? BIG_ONE : lockedCakeOriginalShares) : BIG_ONE
    )

    return avgBoostRatio
      ?.minus(1)
      .times(new BigNumber(DURATION_FACTOR.toString()))
      .div(new BigNumber(BOOST_WEIGHT.toString()).div(BIG_TEN.pow(12)))
      .toFixed(0)
  }, [totalCakeInVault, totalLockedAmount, pricePerFullShare, totalShares])

  const avgLockDurationsInWeeks = useMemo(
    () => formatSecondsToWeeks(avgLockDurationsInSeconds),
    [avgLockDurationsInSeconds]
  )

  return {
    avgLockDurationsInWeeks,
    avgLockDurationsInSeconds: _toNumber(avgLockDurationsInSeconds),
  }
}
