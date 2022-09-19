import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
import { WeiPerEther } from '@ethersproject/constants'
import _toString from 'lodash/toString'
import { VAULT_POOL_TELE_PER_BLOCK } from '@telefy/teleswap-core-sdk'
import { useCallback, useMemo } from 'react'
import { useCakeVault } from 'state/pools/hooks'
import { BIG_ZERO } from 'utils/bigNumber'
import { BOOST_WEIGHT, DURATION_FACTOR, MAX_LOCK_DURATION } from 'constants/pools'
import { useAverageBlockTime } from 'services/graph'
import { useActiveWeb3React } from './web3'
import { BIG_NUMBER_FMT } from 'constants/misc'

// default
const DEFAULT_PERFORMANCE_FEE_DECIMALS = 2

const PRECISION_FACTOR = BigNumber.from('1000000000000')

const getFlexibleApy = (
  totalCakePoolEmissionPerYear: FixedNumber,
  pricePerFullShare: FixedNumber,
  totalShares: FixedNumber
) =>
  totalCakePoolEmissionPerYear
    .mulUnsafe(FixedNumber.from(WeiPerEther))
    .divUnsafe(pricePerFullShare)
    .divUnsafe(totalShares)
    .mulUnsafe(FixedNumber.from(100))

const _getBoostFactor = (boostWeight: BigNumber, duration: number, durationFactor: BigNumber) => {
  return FixedNumber.from(boostWeight)
    .mulUnsafe(FixedNumber.from(Math.max(duration, 0).toLocaleString().replace(/,/g, '')))
    .divUnsafe(FixedNumber.from(durationFactor))
    .divUnsafe(FixedNumber.from(PRECISION_FACTOR))
}

const getLockedApy = (flexibleApy: string, boostFactor: FixedNumber) =>
  FixedNumber.from(flexibleApy).mulUnsafe(boostFactor.addUnsafe(FixedNumber.from('1')))

export function useVaultApy({ duration = MAX_LOCK_DURATION }: { duration?: number } = {}) {
  const {
    totalShares = BIG_ZERO, // 100000
    pricePerFullShare = BIG_ZERO, // 10000
    fees: { performanceFeeAsDecimal } = { performanceFeeAsDecimal: DEFAULT_PERFORMANCE_FEE_DECIMALS },
  } = useCakeVault()
  const { chainId } = useActiveWeb3React()
  const { data: averageBlockTime } = useAverageBlockTime({ chainId })
  // console.log(totalShares, pricePerFullShare, performanceFeeAsDecimal, averageBlockTime)

  const totalSharesAsEtherBN = useMemo(() => FixedNumber.from(totalShares.toFormat(BIG_NUMBER_FMT)), [totalShares])
  const pricePerFullShareAsEtherBN = useMemo(
    () => FixedNumber.from(pricePerFullShare.toFormat(BIG_NUMBER_FMT)),
    [pricePerFullShare]
  )

  const totalCakePoolEmissionPerYear = useMemo(() => {
    const BLOCKS_PER_YEAR = (60 / (averageBlockTime || 1)) * 60 * 24 * 365
    return FixedNumber.from(VAULT_POOL_TELE_PER_BLOCK.toString()).mulUnsafe(
      FixedNumber.from(BLOCKS_PER_YEAR.toString() || '0')
    )
  }, [averageBlockTime])

  const flexibleApy = useMemo(
    () =>
      totalCakePoolEmissionPerYear &&
      !pricePerFullShareAsEtherBN.isZero() &&
      !totalSharesAsEtherBN.isZero() &&
      getFlexibleApy(totalCakePoolEmissionPerYear, pricePerFullShareAsEtherBN, totalSharesAsEtherBN).toString(),
    [pricePerFullShareAsEtherBN, totalCakePoolEmissionPerYear, totalSharesAsEtherBN]
  )

  const boostFactor = useMemo(() => _getBoostFactor(BOOST_WEIGHT, duration, DURATION_FACTOR), [duration])

  const lockedApy = useMemo(() => {
    return flexibleApy ? getLockedApy(flexibleApy, boostFactor).toString() : '0'
  }, [boostFactor, flexibleApy])

  const getBoostFactor = useCallback(
    (adjustDuration: number) => _getBoostFactor(BOOST_WEIGHT, adjustDuration, DURATION_FACTOR),
    []
  )

  const flexibleApyNoFee = useMemo(() => {
    if (flexibleApy && performanceFeeAsDecimal) {
      const rewardPercentageNoFee = _toString(1 - performanceFeeAsDecimal / 100)

      return FixedNumber.from(flexibleApy).mulUnsafe(FixedNumber.from(rewardPercentageNoFee)).toString()
    }

    return flexibleApy
  }, [flexibleApy, performanceFeeAsDecimal])

  return {
    flexibleApy: flexibleApyNoFee,
    lockedApy,
    getLockedApy: useCallback(
      (adjustDuration: number) => flexibleApy && getLockedApy(flexibleApy, getBoostFactor(adjustDuration)).toString(),
      [flexibleApy, getBoostFactor]
    ),
    boostFactor: useMemo(() => boostFactor.addUnsafe(FixedNumber.from('1')), [boostFactor]),
    getBoostFactor: useCallback(
      (adjustDuration: number) => getBoostFactor(adjustDuration).addUnsafe(FixedNumber.from('1')),
      [getBoostFactor]
    ),
  }
}
