import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import poolsConfig from 'constants/pools'
import erc20ABI from 'abis/erc20.json'
import dialerContractABI from 'abis/dialer-contract.json'
import multicall from 'utils/multicall'
import { getAddress } from 'utils/addressHelpers'
import { useActiveWeb3React } from 'hooks/web3'
import { SupportedChainId as ChainId } from 'constants/chains'
import { ChainTokenMap } from '@telefy/teleswap-core-sdk'
import { MulticallStake } from 'abis/types'
// import { BIG_ZERO } from 'utils/bigNumber'

const poolsWithEnd = poolsConfig.filter((p: { sousId: number }) => p.sousId !== 0)

const startEndBlockCalls = poolsWithEnd.flatMap((poolConfig: { contractAddress: any }) => {
  const { chainId } = useActiveWeb3React()
  return [
    {
      address: getAddress(poolConfig.contractAddress, chainId),
      name: 'startBlock',
    },
    {
      address: getAddress(poolConfig.contractAddress, chainId),
      name: 'bonusEndBlock',
    },
  ]
})

export const fetchPoolsBlockLimits = async (multicallContract: MulticallStake) => {
  const startEndBlockRaw = await multicall(multicallContract, dialerContractABI, startEndBlockCalls)

  const startEndBlockResult = startEndBlockRaw.reduce((resultArray: any[][], item: any, index: number) => {
    const chunkIndex = Math.floor(index / 2)

    if (!resultArray[chunkIndex]) {
      // eslint-disable-next-line no-param-reassign
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])

  return poolsWithEnd.map((cakePoolConfig: { sousId: any }, index: string | number) => {
    const [[startBlock], [endBlock]] = startEndBlockResult[index]
    return {
      sousId: cakePoolConfig.sousId,
      startBlock: startBlock.toNumber(),
      endBlock: endBlock.toNumber(),
    }
  })
}

const poolsBalanceOf = poolsConfig.map((poolConfig) => {
  const { chainId } = useActiveWeb3React()
  return {
    address: poolConfig.stakingToken[chainId ? (chainId as keyof ChainTokenMap) : ChainId.MAINNET]?.address || '',
    name: 'balanceOf',
    params: [getAddress(poolConfig.contractAddress, chainId)],
  }
})

export const fetchPoolsTotalStaking = async (multicallContract: MulticallStake) => {
  const poolsTotalStaked = await multicall(multicallContract, erc20ABI, poolsBalanceOf)

  return poolsConfig.map((p: { sousId: any }, index: string | number) => ({
    sousId: p.sousId,
    totalStaked: new BigNumber(poolsTotalStaked[index]).toJSON(),
  }))
}

// export const fetchPoolsStakingLimits = async (
//   poolsWithStakingLimit: number[],
// ): Promise<{ [key: string]: { stakingLimit: BigNumber; numberBlocksForUserLimit: number } }> => {
//   const validPools = poolsConfig
//     .filter((p: { stakingToken: { symbol: string }; isFinished: any }) => p.stakingToken.symbol !== 'BNB' && !p.isFinished)
//     .filter((p: { sousId: number }) => !poolsWithStakingLimit.includes(p.sousId))

//   // Get the staking limit for each valid pool
//   const poolStakingCalls = validPools
//     .map((validPool: { contractAddress: any }) => {
//       const contractAddress = getAddress(validPool.contractAddress)
//       return ['hasUserLimit', 'poolLimitPerUser', 'numberBlocksForUserLimit'].map((method) => ({
//         address: contractAddress,
//         name: method,
//       }))
//     })
//     .flat()

//   const poolStakingResultRaw = await multicallv2(sousChefV2, poolStakingCalls, { requireSuccess: false })
//   const chunkSize = poolStakingCalls.length / validPools.length
//   const poolStakingChunkedResultRaw = chunk(poolStakingResultRaw.flat(), chunkSize)
//   return poolStakingChunkedResultRaw.reduce((accum, stakingLimitRaw, index) => {
//     const hasUserLimit = stakingLimitRaw[0]
//     const stakingLimit = hasUserLimit && stakingLimitRaw[1] ? new BigNumber(stakingLimitRaw[1].toString()) : BIG_ZERO
//     const numberBlocksForUserLimit = stakingLimitRaw[2] ? (stakingLimitRaw[2] as EthersBigNumber).toNumber() : 0
//     return {
//       ...accum,
//       [validPools[index].sousId]: { stakingLimit, numberBlocksForUserLimit },
//     }
//   }, {})
// }

// export const fetchPoolsProfileRequirement = async (): Promise<{
//   [key: string]: {
//     required: boolean
//     thresholdPoints: BigNumber
//   }
// }> => {
//   const poolProfileRequireCalls = poolsWithV3
//     .map((validPool: { contractAddress: any }) => {
//       const contractAddress = getAddress(validPool.contractAddress)
//       return ['pancakeProfileIsRequested', 'pancakeProfileThresholdPoints'].map((method) => ({
//         address: contractAddress,
//         name: method,
//       }))
//     })
//     .flat()

//   const poolProfileRequireResultRaw = await multicallv2(sousChefV3, poolProfileRequireCalls, { requireSuccess: false })
//   const chunkSize = poolProfileRequireCalls.length / poolsWithV3.length
//   const poolStakingChunkedResultRaw = chunk(poolProfileRequireResultRaw.flat(), chunkSize)
//   return poolStakingChunkedResultRaw.reduce((accum, poolProfileRequireRaw, index) => {
//     const hasProfileRequired = poolProfileRequireRaw[0]
//     const profileThresholdPoints = poolProfileRequireRaw[1]
//       ? new BigNumber(poolProfileRequireRaw[1].toString())
//       : BIG_ZERO
//     return {
//       ...accum,
//       [poolsWithV3[index].sousId]: {
//         required: hasProfileRequired,
//         thresholdPoints: profileThresholdPoints.toJSON(),
//       },
//     }
//   }, {})
// }
