import { ChainId } from '@telefy/teleswap-core-sdk'
import { GRAPH_HOST } from 'services/graph/constants'
import { getTokenSubset } from 'services/graph/fetchers/exchange'
import {
  masterChefV1PairAddressesQuery,
  masterChefV1SushiPerBlockQuery,
  masterChefV1TotalAllocPointQuery,
  DialerContractPairAddressesQuery,
  miniChefPairAddressesQuery,
  miniChefPoolsQuery,
  miniChefPoolsQueryV2,
  poolsQuery,
  poolsV2Query,
} from 'services/graph/queries'
import { request } from 'graphql-request'

export const MINICHEF = {
  [ChainId.MATIC]: 'jiro-ono/minichef-staging-updates',
  [ChainId.XDAI]: 'teleswap/xdai-minichef',
  [ChainId.HARMONY]: 'teleswap/harmony-minichef',
  [ChainId.ARBITRUM_ONE]: 'jiro-ono/arbitrum-minichef-staging',
  [ChainId.CELO]: 'teleswap/celo-minichef-v2',
  [ChainId.MOONRIVER]: 'teleswap/moonriver-minichef',
  [ChainId.FUSE]: 'teleswap/fuse-minichef',
  [ChainId.FANTOM]: 'teleswap/fantom-minichef',
  [ChainId.MOONBEAM]: 'teleswap/moonbeam-minichef',
}

export const OLD_MINICHEF = {
  [ChainId.CELO]: 'teleswap/celo-minichef',
}

// @ts-ignore TYPE NEEDS FIXING
export const miniChef = async (query, chainId = ChainId.MAINNET, variables = undefined) =>
  // @ts-ignore TYPE NEEDS FIXING
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${MINICHEF[chainId]}`, query, variables)

// @ts-ignore TYPE NEEDS FIXING
export const oldMiniChef = async (query, chainId = ChainId.MAINNET) =>
  // @ts-ignore TYPE NEEDS FIXING
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${OLD_MINICHEF[chainId]}`, query)

export const DIALER_CONTRACT = {
  [ChainId.MAINNET]: 'telefy/teleswap-dialer-subgraph-rinkeby',
  [ChainId.RINKEBY]: 'telefy/teleswap-dialer-subgraph-rinkeby',
}

// @ts-ignore TYPE NEEDS FIXING
export const DialerContract = async (query, chainId = ChainId.MAINNET, variables = undefined) =>
  // @ts-ignore TYPE NEEDS FIXING
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${DIALER_CONTRACT[chainId]}`, query, variables)

export const MASTERCHEF_V1 = {
  [ChainId.MAINNET]: 'teleswap/master-chef',
}

// @ts-ignore TYPE NEEDS FIXING
export const masterChefV1 = async (query, chainId = ChainId.MAINNET, variables = undefined) =>
  // @ts-ignore TYPE NEEDS FIXING
  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${MASTERCHEF_V1[chainId]}`, query, variables)

export const getMasterChefV1TotalAllocPoint = async () => {
  const {
    masterChef: { totalAllocPoint },
  } = await masterChefV1(masterChefV1TotalAllocPointQuery)
  return totalAllocPoint
}

export const getMasterChefV1SushiPerBlock = async () => {
  const {
    masterChef: { sushiPerBlock },
  } = await masterChefV1(masterChefV1SushiPerBlockQuery)
  return sushiPerBlock / 1e18
}

export const getMasterChefV1Farms = async (variables = undefined) => {
  const { pools } = await masterChefV1(poolsQuery, undefined, variables)
  return pools
}

export const getMasterChefV1PairAddreses = async () => {
  const { pools } = await masterChefV1(masterChefV1PairAddressesQuery)
  // @ts-ignore
  return pools?.map((pool) => pool.pair)
}

export const getDialerContractFarms = async (variables = undefined) => {
  const { pools } = await DialerContract(poolsV2Query, undefined, variables)
  const tokens = await getTokenSubset(ChainId.MAINNET, {
    // @ts-ignore TYPE NEEDS FIXING
    tokenAddresses: Array.from(pools.map((pool) => pool.rewarder.rewardToken)),
  })

  // @ts-ignore TYPE NEEDS FIXING
  return pools.map((pool) => ({
    ...pool,
    rewardToken: {
      // @ts-ignore TYPE NEEDS FIXING
      ...tokens.find((token) => token.id === pool.rewarder.rewardToken),
    },
  }))
}

export const getDialerContractPairAddreses = async () => {
  const { pools } = await DialerContract(DialerContractPairAddressesQuery)
  // @ts-ignore
  return pools?.map((pool) => pool.pair)
}

export const getOldMiniChefFarms = async (chainId = ChainId.MAINNET) => {
  const { pools } = await oldMiniChef(miniChefPoolsQuery, chainId)
  return pools
}

export const getMiniChefFarms = async (chainId = ChainId.MAINNET, variables = undefined) => {
  const v2Query = chainId && [ChainId.MATIC, ChainId.ARBITRUM_ONE].includes(chainId)

  if (v2Query) {
    const { pools } = await miniChef(miniChefPoolsQueryV2, chainId, variables)
    const tokens = await getTokenSubset(chainId, {
      // @ts-ignore TYPE NEEDS FIXING
      tokenAddresses: Array.from(pools.map((pool) => pool.rewarder.rewardToken)),
    })

    // @ts-ignore TYPE NEEDS FIXING
    return pools.map((pool) => ({
      ...pool,
      rewardToken: {
        // @ts-ignore TYPE NEEDS FIXING
        ...tokens.find((token) => token.id === pool.rewarder.rewardToken),
      },
    }))
  } else {
    const { pools } = await miniChef(miniChefPoolsQuery, chainId, variables)
    return pools
  }
}

export const getMiniChefPairAddreses = async (chainId = ChainId.MAINNET) => {
  console.debug('getMiniChefPairAddreses')
  const { pools } = await miniChef(miniChefPairAddressesQuery, chainId)
  // @ts-ignore
  return pools?.map((pool) => pool.pair)
}
