/* eslint-disable react-hooks/rules-of-hooks */
import poolsConfig from 'constants/pools'
import sousChefABI from 'abis/dialer-contract.json'
import erc20ABI from 'abis/erc20.json'
import multicall from 'utils/multicall'
import { getAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import uniq from 'lodash/uniq'
import { ChainId, ChainTokenMap } from '@telefy/teleswap-core-sdk'
import { MulticallStake } from 'abis/types'

interface LooseStringObject {
  [key: string]: any
}

interface LooseNumberObject {
  [key: string]: any
}
// Pool 0, Tele / Tele is a different kind of contract (master chef)
// BNB pools use the native BNB token (wrapping ? unwrapping is done at the contract level)
const nonBnbPools = poolsConfig
const nonMasterPools = poolsConfig.filter((pool) => pool.sousId !== 0)

export const fetchPoolsAllowance = async (
  account: string,
  chainId: number | undefined,
  multicallContract: MulticallStake
): Promise<LooseNumberObject> => {
  const calls = nonBnbPools.map((pool) => ({
    address:
      pool.stakingToken[chainId ? (chainId as keyof ChainTokenMap) : ChainId.MAINNET]?.address.toLowerCase() || '',
    name: 'allowance',
    params: [account, getAddress(pool.contractAddress, chainId)],
  }))
  console.log(calls, 'fetchPoolsAllowance')

  const allowances = await multicall(multicallContract, erc20ABI, calls)
  return nonBnbPools.reduce(
    (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index]).toJSON() }),
    {}
  )
}

export const fetchUserBalances = async (
  account: string,
  chainId: number | undefined,
  multicallContract: MulticallStake
): Promise<LooseNumberObject> => {
  // Non BNB pools
  const tokens = uniq(
    nonBnbPools.map(
      (pool) =>
        pool.stakingToken[chainId ? (chainId as keyof ChainTokenMap) : ChainId.MAINNET]?.address.toLowerCase() || ''
    )
  )
  const calls = tokens.map((token) => ({
    address: token,
    name: 'balanceOf',
    params: [account],
  }))
  console.log('fetchUserBalances')
  const tokenBalancesRaw = await multicall(multicallContract, erc20ABI, calls)
  const tokenBalances: LooseStringObject = tokens.reduce(
    (acc, token, index) => ({ ...acc, [token]: tokenBalancesRaw[index] }),
    {}
  )
  const poolTokenBalances = nonBnbPools.reduce(
    (acc, pool) => ({
      ...acc,
      ...(tokenBalances[pool.stakingToken[chainId as keyof ChainTokenMap]?.address || ''] && {
        [pool.sousId]: new BigNumber(
          tokenBalances[pool.stakingToken[chainId as keyof ChainTokenMap]?.address || '']
        ).toJSON(),
      }),
    }),
    {}
  )

  return { ...poolTokenBalances }
}

export const fetchUserStakeBalances = async (
  account: string,
  chainId: number | undefined,
  multicallContract: MulticallStake
): Promise<LooseNumberObject> => {
  const calls = nonMasterPools.map((p) => ({
    address: getAddress(p.contractAddress, chainId),
    name: 'userInfo',
    params: [account],
  }))
  console.log('fetchUserStakeBalances')

  const userInfo = await multicall(multicallContract, sousChefABI, calls)
  return nonMasterPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userInfo[index].amount._hex).toJSON(),
    }),
    {}
  )
}

export const fetchUserPendingRewards = async (
  account: string,
  chainId: number | undefined,
  multicallContract: MulticallStake
): Promise<LooseNumberObject> => {
  const calls = nonMasterPools.map((p) => ({
    address: getAddress(p.contractAddress, chainId),
    name: 'pendingReward',
    params: [account],
  }))
  console.log('fetchUserPendingRewards')
  const res = await multicall(multicallContract, sousChefABI, calls)
  return nonMasterPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(res[index]).toJSON(),
    }),
    {}
  )
}
