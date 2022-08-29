/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
import { getAddress } from '@ethersproject/address'
import { ChainId, Currency, NATIVE, TELE, Token } from '@telefy/teleswap-core-sdk'
import { XDAI_TOKENS } from 'config/tokens'
import { Feature } from 'enums'
import { Chef, PairType } from 'features/onsen/enum'
import { usePositions } from 'features/onsen/hooks'
import { featureEnabled } from 'functions'
import { aprToApy } from 'functions/convert'
import {
  useAverageBlockTime,
  useBlock,
  useCeloPrice,
  useEthPrice,
  useFantomPrice,
  useFarms,
  useFusePrice,
  useGlimmerPrice,
  useGnoPrice,
  useKashiPairs,
  useMagicPrice,
  useMasterChefV1SushiPerBlock,
  useMasterChefV1TotalAllocPoint,
  useMaticPrice,
  useMovrPrice,
  useOhmPrice,
  useOneDayBlock,
  useOnePrice,
  useSpellPrice,
  useSushiPairs,
  useTelePrice,
} from 'services/graph'
import { useCallback, useMemo } from 'react'

export default function useFarmRewards({ chainId = ChainId.MAINNET }) {
  const positions = usePositions(chainId)
  const { data: block1d } = useOneDayBlock({ chainId, shouldFetch: !!chainId })

  const farms = useFarms({ chainId })

  const farmAddresses = useMemo(() => farms.map((farm: any) => farm.pair.toLowerCase()), [farms])

  const { data: swapPairs } = useSushiPairs({
    chainId,
    variables: {
      where: {
        id_in: farmAddresses,
      },
    },
    shouldFetch: !!farmAddresses,
  })

  const { data: swapPairs1d } = useSushiPairs({
    chainId,
    variables: {
      block: block1d,
      where: {
        id_in: farmAddresses,
      },
    },
    shouldFetch: !!block1d && !!farmAddresses,
  })

  const { data: kashiPairs } = useKashiPairs({
    chainId,
    variables: { where: { id_in: farmAddresses } },
    shouldFetch: !!farmAddresses && featureEnabled(Feature.KASHI, chainId),
  })

  const { data: averageBlockTime } = useAverageBlockTime({ chainId }) // 15.072
  const { data: currentBlock } = useBlock({ chainId })
  const { data: masterChefV1TotalAllocPoint } = useMasterChefV1TotalAllocPoint()
  const { data: masterChefV1SushiPerBlock } = useMasterChefV1SushiPerBlock()

  const { data: telePrice } = useTelePrice(chainId)

  const { data: ethPrice } = useEthPrice()
  const { data: maticPrice } = useMaticPrice()
  const { data: gnoPrice } = useGnoPrice()
  const { data: onePrice } = useOnePrice()
  const { data: spellPrice } = useSpellPrice()
  const { data: celoPrice } = useCeloPrice()
  const { data: fantomPrice } = useFantomPrice()
  const { data: movrPrice } = useMovrPrice()
  const { data: ohmPrice } = useOhmPrice()
  const { data: fusePrice } = useFusePrice()
  const { data: magicPrice } = useMagicPrice()
  const { data: glimmerPrice } = useGlimmerPrice()

  const blocksPerDay = 86400 / Number(averageBlockTime) // 5732.484076433121019

  // @ts-ignore TYPE NEEDS FIXING
  const map = useCallback(
    // @ts-ignore TYPE NEEDS FIXING
    (pool) => {
      // TODO: Deal with inconsistencies between properties on subgraph
      pool.owner = pool?.owner || pool?.dialerContract || pool?.miniChef
      pool.balance = pool?.balance || pool?.slpBalance

      // @ts-ignore TYPE NEEDS FIXING
      const swapPair = swapPairs?.find((pair) => pair.id === pool.pair)
      // @ts-ignore TYPE NEEDS FIXING
      const swapPair1d = swapPairs1d?.find((pair) => pair.id === pool.pair)
      // @ts-ignore TYPE NEEDS FIXING
      const kashiPair = kashiPairs?.find((pair) => pair.id === pool.pair)

      const pair = swapPair || kashiPair

      const type = swapPair ? PairType.SWAP : PairType.KASHI

      const blocksPerHour = 3600 / averageBlockTime // 238.853503184713376

      function getRewards() {
        const bonusMultiplier =
          pool?.owner?.bonusEndBlock >= currentBlock?.number ? pool?.owner?.bonusMultiplier : 1 || 1
        // const bonusMultiplier = 10

        // TODO: Some subgraphs give telePerBlock & sushiPerSecond, and DialerContract gives nothing
        const telePerBlock =
          (pool?.owner?.telePerBlock / 1e18) * bonusMultiplier ||
          (pool?.owner?.telePerSecond / 1e18) * averageBlockTime ||
          masterChefV1SushiPerBlock
        // 100

        // @ts-ignore TYPE NEEDS FIXING
        const rewardPerBlock = (pool.allocPoint / Number(pool.owner.totalAllocPoint)) * Number(telePerBlock)
        // const rewardPerBlock = (pool.allocPoint / 10) * telePerBlock

        const defaultReward = {
          currency: TELE[chainId],
          rewardPerBlock,
          rewardPerDay: rewardPerBlock * blocksPerDay,
          rewardPrice: telePrice,
        }

        let rewards: { currency: Currency; rewardPerBlock: number; rewardPerDay: number; rewardPrice: number }[] = [
          // @ts-ignore TYPE NEEDS FIXING
          defaultReward,
        ]

        if (pool.chef === Chef.DIALER_CONTRACT) {
          // CVX-WETH hardcode 0 rewards since ended, can remove after swapping out rewarder
          if (pool.id === '1') {
            pool.rewarder.rewardPerSecond = 0
          }

          // vestedQUARTZ to QUARTZ adjustments
          if (pool.rewarder.rewardToken === '0x5dd8905aec612529361a35372efd5b127bb182b3') {
            pool.rewarder.rewardToken = '0xba8a621b4a54e61c442f5ec623687e2a942225ef'
            pool.rewardToken.id = '0xba8a621b4a54e61c442f5ec623687e2a942225ef'
            pool.rewardToken.symbol = 'vestedQUARTZ'
            pool.rewardToken.derivedETH = pair.token1.derivedETH
            pool.rewardToken.decimals = 18
          }

          const decimals = 10 ** pool.rewardToken.decimals

          if (pool.rewarder.rewardToken !== '0x0000000000000000000000000000000000000000') {
            const rewardPerBlock =
              pool.rewardToken.symbol === 'ALCX'
                ? pool.rewarder.rewardPerSecond / decimals
                : pool.rewardToken.symbol === 'LDO'
                ? (19290123456790123 / decimals) * averageBlockTime
                : (pool.rewarder.rewardPerSecond / decimals) * averageBlockTime

            const rewardPerDay =
              pool.rewardToken.symbol === 'ALCX'
                ? (pool.rewarder.rewardPerSecond / decimals) * blocksPerDay
                : pool.rewardToken.symbol === 'LDO'
                ? (19290123456790123 / decimals) * averageBlockTime * blocksPerDay
                : (pool.rewarder.rewardPerSecond / decimals) * averageBlockTime * blocksPerDay

            const rewardPrice = pool.rewardToken.derivedETH * ethPrice

            const reward = {
              currency: new Token(
                chainId,
                getAddress(pool.rewardToken.id),
                Number(pool.rewardToken.decimals),
                pool.rewardToken.symbol,
                pool.rewardToken.name
              ),
              rewardPerBlock,
              rewardPerDay,
              rewardPrice,
            }
            rewards[1] = reward
          }
        } else if (pool.chef === Chef.MINICHEF && chainId !== ChainId.MATIC && chainId !== ChainId.ARBITRUM_ONE) {
          const telePerSecond = ((pool.allocPoint / pool.miniChef.totalAllocPoint) * pool.miniChef.telePerSecond) / 1e18
          const telePerBlock = telePerSecond * averageBlockTime
          const telePerDay = telePerBlock * blocksPerDay

          const rewardPerSecond =
            ((pool.allocPoint / pool.miniChef.totalAllocPoint) * pool.rewarder.rewardPerSecond) / 1e18

          const rewardPerBlock = rewardPerSecond * averageBlockTime

          const rewardPerDay = rewardPerBlock * blocksPerDay

          const reward = {
            [ChainId.MATIC]: {
              currency: NATIVE[ChainId.MATIC],
              rewardPerBlock,
              rewardPerDay: rewardPerSecond * 86400,
              rewardPrice: maticPrice,
            },
            [ChainId.XDAI]: {
              currency: XDAI_TOKENS.GNO,
              rewardPerBlock,
              rewardPerDay: rewardPerSecond * 86400,
              rewardPrice: gnoPrice,
            },
            [ChainId.HARMONY]: {
              currency: NATIVE[ChainId.HARMONY],
              rewardPerBlock,
              rewardPerDay: rewardPerSecond * 86400,
              rewardPrice: onePrice,
            },
            [ChainId.CELO]: {
              currency: NATIVE[ChainId.CELO],
              rewardPerBlock,
              rewardPerDay: rewardPerSecond * 86400,
              rewardPrice: celoPrice,
            },
            [ChainId.MOONRIVER]: {
              currency: NATIVE[ChainId.MOONRIVER],
              rewardPerBlock,
              rewardPerDay: rewardPerSecond * 86400,
              rewardPrice: movrPrice,
            },
            [ChainId.FUSE]: {
              currency: NATIVE[ChainId.FUSE],
              rewardPerBlock,
              rewardPerDay: rewardPerSecond * 86400,
              rewardPrice: fusePrice,
            },
            [ChainId.FANTOM]: {
              currency: NATIVE[ChainId.FANTOM],
              rewardPerBlock,
              rewardPerDay: rewardPerSecond * 86400,
              rewardPrice: fantomPrice,
            },
            [ChainId.MOONBEAM]: {
              currency: NATIVE[ChainId.MOONBEAM],
              rewardPerBlock,
              rewardPerDay: rewardPerSecond * 86400,
              rewardPrice: glimmerPrice,
            },
          }

          if (chainId === ChainId.FUSE) {
            // Secondary reward only
            rewards[0] = reward[ChainId.FUSE]
          } else {
            // @ts-ignore TYPE NEEDS FIXING
            rewards[0] = {
              ...defaultReward,
              rewardPerBlock: telePerBlock,
              rewardPerDay: telePerDay,
            }
            // @ts-ignore TYPE NEEDS FIXING
            if (chainId in reward) {
              // @ts-ignore TYPE NEEDS FIXING
              rewards[1] = reward[chainId]
            }
          }
        } else if (chainId === ChainId.MATIC || chainId === ChainId.ARBITRUM_ONE) {
          if (pool.rewarder.rewardPerSecond !== '0') {
            const rewardPerSecond =
              pool.rewarder.totalAllocPoint === '0'
                ? pool.rewarder.rewardPerSecond / 10 ** pool.rewardToken.decimals
                : ((pool.allocPoint / pool.rewarder.totalAllocPoint) * pool.rewarder.rewardPerSecond) / 1e18
            const rewardPerBlock = rewardPerSecond * averageBlockTime
            const rewardPerDay = rewardPerBlock * blocksPerDay
            const rewardPrice = pool.rewardToken.derivedETH * ethPrice

            rewards[1] = {
              currency: new Token(
                chainId,
                getAddress(pool.rewardToken.id),
                Number(pool.rewardToken.decimals),
                pool.rewardToken.symbol,
                pool.rewardToken.name
              ),
              rewardPerBlock,
              rewardPerDay,
              rewardPrice,
            }
          }
        } else if (pool.chef === Chef.OLD_FARMS) {
          const telePerSecond = ((pool.allocPoint / pool.miniChef.totalAllocPoint) * pool.miniChef.telePerSecond) / 1e18
          const telePerBlock = telePerSecond * averageBlockTime
          const telePerDay = telePerBlock * blocksPerDay

          const rewardPerSecond =
            ((pool.allocPoint / pool.miniChef.totalAllocPoint) * pool.rewarder.rewardPerSecond) / 1e18

          const rewardPerBlock = rewardPerSecond * averageBlockTime

          const rewardPerDay = rewardPerBlock * blocksPerDay

          const reward = {
            [ChainId.CELO]: {
              currency: NATIVE[ChainId.CELO],
              rewardPerBlock,
              rewardPerDay: rewardPerSecond * 86400,
              rewardPrice: celoPrice,
            },
          }

          // @ts-ignore TYPE NEEDS FIXING
          rewards[0] = {
            ...defaultReward,
            rewardPerBlock: telePerBlock,
            rewardPerDay: telePerDay,
          }

          // @ts-ignore TYPE NEEDS FIXING
          if (chainId in reward) {
            // @ts-ignore TYPE NEEDS FIXING
            rewards[1] = reward[chainId]
          }
        }

        return rewards
      }

      const rewards = getRewards()

      const balance = swapPair ? Number(pool.balance / 1e18) : pool.balance / 10 ** kashiPair.token0.decimals

      const tvl = swapPair
        ? (balance / Number(swapPair.totalSupply)) * Number(swapPair.reserveUSD)
        : balance * kashiPair.token0.derivedETH * ethPrice

      const feeApyPerYear =
        swapPair && swapPair1d
          ? aprToApy((((pair?.volumeUSD - swapPair1d?.volumeUSD) * 0.00225 * 365) / pair?.reserveUSD) * 100, 3650) / 100
          : 0

      const feeApyPerMonth = feeApyPerYear / 12
      const feeApyPerDay = feeApyPerMonth / 30
      const feeApyPerHour = feeApyPerDay / blocksPerHour

      const roiPerBlock =
        rewards.reduce((previousValue, currentValue) => {
          return previousValue + currentValue.rewardPerBlock * currentValue.rewardPrice
        }, 0) / tvl

      const rewardAprPerHour = roiPerBlock * blocksPerHour
      const rewardAprPerDay = rewardAprPerHour * 24
      const rewardAprPerMonth = rewardAprPerDay * 30
      const rewardAprPerYear = rewardAprPerMonth * 12

      const roiPerHour = rewardAprPerHour + feeApyPerHour
      const roiPerMonth = rewardAprPerMonth + feeApyPerMonth
      const roiPerDay = rewardAprPerDay + feeApyPerDay
      const roiPerYear = rewardAprPerYear + feeApyPerYear

      const position = positions.find((position) => position.id === pool.id && position.chef === pool.chef)

      return {
        ...pool,
        ...position,
        pair: {
          ...pair,
          decimals: pair.type === PairType.KASHI ? Number(pair.asset.tokenInfo.decimals) : 18,
          type,
        },
        balance,
        feeApyPerHour,
        feeApyPerDay,
        feeApyPerMonth,
        feeApyPerYear,
        rewardAprPerHour,
        rewardAprPerDay,
        rewardAprPerMonth,
        rewardAprPerYear,
        roiPerBlock,
        roiPerHour,
        roiPerDay,
        roiPerMonth,
        roiPerYear,
        rewards,
        tvl,
      }
    },
    [
      averageBlockTime,
      blocksPerDay,
      celoPrice,
      chainId,
      ethPrice,
      fantomPrice,
      fusePrice,
      glimmerPrice,
      gnoPrice,
      kashiPairs,
      masterChefV1SushiPerBlock,
      masterChefV1TotalAllocPoint,
      maticPrice,
      movrPrice,
      onePrice,
      positions,
      telePrice,
      swapPairs,
      swapPairs1d,
    ]
  )

  const filter = useCallback(
    (farm) => {
      return (
        // @ts-ignore TYPE NEEDS FIXING
        (swapPairs && swapPairs.find((pair) => pair.id === farm.pair)) ||
        // @ts-ignore TYPE NEEDS FIXING
        (kashiPairs && kashiPairs.find((pair) => pair.id === farm.pair))
      )
    },
    [kashiPairs, swapPairs]
  )

  return useMemo(() => farms.filter(filter).map(map), [farms, filter, map])
}
