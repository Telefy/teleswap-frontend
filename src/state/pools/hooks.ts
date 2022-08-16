import { useEffect, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { batch, useDispatch, useSelector } from 'react-redux'
import { useAppDispatch } from 'state/hooks'
import { useFastRefreshEffect, useSlowRefreshEffect } from 'hooks/useRefreshEffect'
import {
  // fetchPoolsPublicDataAsync,
  fetchPoolsUserDataAsync,
  fetchCakeVaultPublicData,
  fetchCakeVaultUserData,
  fetchCakeVaultFees,
  // fetchPoolsStakingLimitsAsync,
} from '.'
import { DeserializedPool, VaultKey } from 'state/types'
import {
  poolsWithUserDataLoadingSelector,
  makePoolWithUserDataLoadingSelector,
  makeVaultPoolByKey,
  poolsWithVaultSelector,
} from './selectors'
import { AnyAction } from '@reduxjs/toolkit'
import { useTeleContract, useMulticallContract, useTelePoolContract } from 'hooks/useContract'
import { AddressMap, ChainId, ChainTokenMap } from '@telefy/teleswap-core-sdk'
import { useActiveWeb3React } from 'hooks/web3'
import {
  NEVER_RELOAD,
  useMultipleContractMultipleData,
  useMultipleContractSingleData,
  useSingleCallResult,
} from '../multicall/hooks'
import { getTelePoolAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import poolsConfig from 'constants/pools'
import { ethers } from 'ethers'
import TELE_POOL_ABI from 'abis/tele-pool.json'
import ERC20_ABI from 'abis/erc20.json'
import { arrayUniq } from 'utils/prices'

export const useFetchPublicPoolsData = () => {
  const dispatch = useAppDispatch()

  useSlowRefreshEffect(
    (currentBlock) => {
      const fetchPoolsData = async () => {
        batch(() => {
          // dispatch(fetchPoolsPublicDataAsync(currentBlock))
          // dispatch(fetchPoolsStakingLimitsAsync())
        })
      }

      fetchPoolsData()
    },
    [dispatch]
  )
}

export const useFetchUserPools = (account: string, chainId: number) => {
  const dispatch = useAppDispatch()
  const multicallContract = useMulticallContract(true)

  useFastRefreshEffect(() => {
    if (account) {
      // dispatch(fetchPoolsUserDataAsync({ account, chainId, multicallContract }) as unknown as AnyAction)
    }
  }, [account, dispatch])
}

export const usePools = (): { pools: DeserializedPool[]; userDataLoaded: boolean } => {
  return useSelector(poolsWithUserDataLoadingSelector)
}

export const usePool = (sousId: number): { pool: DeserializedPool; userDataLoaded: boolean } => {
  const { chainId } = useActiveWeb3React()
  const poolWithUserDataLoadingSelector = useMemo(
    () => makePoolWithUserDataLoadingSelector(sousId, chainId || ChainId.MAINNET),
    [sousId]
  )
  return useSelector(poolWithUserDataLoadingSelector)
}

export const usePoolsWithVault = () => {
  return useSelector(poolsWithVaultSelector)
}

export const usePoolsPageFetch = () => {
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const teleContract = useTeleContract()
  const telePoolContract = useTelePoolContract()
  const multicallContract = useMulticallContract(true)
  // useFetchPublicPoolsData()

  // ---- fetchCakeVaultPublicData
  const vaultPoolContractAddress = getTelePoolAddress(chainId || ChainId.MAINNET)
  const { result: sharePriceCall } = useSingleCallResult(
    telePoolContract,
    'getPricePerFullShare',
    undefined,
    NEVER_RELOAD
  )
  const { result: sharesCall } = useSingleCallResult(telePoolContract, 'totalShares', undefined, NEVER_RELOAD)
  const { result: totalLockedAmountCall } = useSingleCallResult(
    telePoolContract,
    'totalLockedAmount',
    undefined,
    NEVER_RELOAD
  )
  const { result: totalCakeInVaultCall } = useSingleCallResult(
    teleContract,
    'balanceOf',
    [vaultPoolContractAddress],
    NEVER_RELOAD
  )
  const totalSharesAsBigNumber = sharesCall && sharesCall.length ? new BigNumber(sharesCall[0].toString()) : BIG_ZERO
  const totalLockedAmountAsBigNumber =
    totalLockedAmountCall && totalLockedAmountCall.length
      ? new BigNumber(totalLockedAmountCall[0].toString())
      : BIG_ZERO
  const sharePriceAsBigNumber =
    sharePriceCall && sharePriceCall.length ? new BigNumber(sharePriceCall[0].toString()) : BIG_ZERO
  const totalCakeInVaultAsBigNumber =
    totalCakeInVaultCall && totalCakeInVaultCall.length ? new BigNumber(totalCakeInVaultCall[0].toString()) : BIG_ZERO

  // ------- fetchPoolsUserDataAsync
  const nonMasterPools = poolsConfig.filter((pool) => pool.sousId !== 0)
  const poolTokenAddresses = poolsConfig.map(
    (pool) => pool.stakingToken[(chainId as keyof ChainTokenMap) || ChainId.MAINNET]?.address
  )
  const vaultPoolArgs = poolsConfig.map((pool) => [[account || '', pool.contractAddress[chainId || ChainId.MAINNET]]])
  const poolTokensUniq = arrayUniq(poolTokenAddresses)
  const nonMasterPoolContractAddresses = nonMasterPools.map((pool) => pool.contractAddress[chainId || ChainId.MAINNET])
  const tokenInterface = new ethers.utils.Interface(ERC20_ABI)
  const poolInterface = new ethers.utils.Interface(TELE_POOL_ABI)

  const poolAllowanceRes = useMultipleContractMultipleData(
    poolTokenAddresses,
    tokenInterface,
    'allowance',
    vaultPoolArgs,
    NEVER_RELOAD
  )
  const tokenBalanceRes = useMultipleContractSingleData(
    poolTokensUniq,
    tokenInterface,
    'balanceOf',
    [account || ''],
    NEVER_RELOAD
  )
  const userStakeBalanceRes = useMultipleContractSingleData(
    nonMasterPoolContractAddresses,
    poolInterface,
    'userInfo',
    [account || ''],
    NEVER_RELOAD
  )
  const userPendingRewardsRes = useMultipleContractSingleData(
    nonMasterPoolContractAddresses,
    poolInterface,
    'pendingReward',
    [account || ''],
    NEVER_RELOAD
  )
  const allowances: {
    [key: string]: string
  } = poolsConfig.reduce((acc, pool, index) => {
    const { result: allowanceRes } = poolAllowanceRes[index][0]
    return {
      ...acc,
      [pool.sousId]: new BigNumber(allowanceRes ? allowanceRes[0].toString() : '0').toJSON(),
    }
  }, {})
  const tokenBalances = poolTokensUniq.reduce((acc, token, index) => {
    const { result: balanceRes } = tokenBalanceRes[index]
    return balanceRes ? { ...acc, [token]: balanceRes[0] } : { ...acc }
  }, {})
  const poolTokenBalances: {
    [key: string]: string
  } = poolsConfig.reduce((acc, pool, index) => {
    return {
      ...acc,
      ...{
        [pool.sousId]: new BigNumber(
          tokenBalances[pool.stakingToken[(chainId as keyof ChainTokenMap) || ChainId.MAINNET]?.address || '']
        ).toJSON(),
      },
    }
  }, {})
  const stakedBalances: {
    [key: string]: string
  } = nonMasterPools.reduce((acc, pool, index) => {
    const { result: balanceRes } = userStakeBalanceRes[index]
    return {
      ...acc,
      [pool.sousId]: balanceRes ? new BigNumber(balanceRes[0].amount._hex).toJSON() : '0',
    }
  }, {})
  const userPendingRewards: {
    [key: string]: string
  } = nonMasterPools.reduce((acc, pool, index) => {
    const { result: balanceRes } = userPendingRewardsRes[index]
    return {
      ...acc,
      [pool.sousId]: balanceRes ? new BigNumber(balanceRes[index]).toJSON() : '0',
    }
  }, {})

  const userData = poolsConfig.map((pool) => ({
    sousId: pool.sousId,
    allowance: allowances[pool.sousId],
    stakingTokenBalance: poolTokenBalances[pool.sousId],
    stakedBalance: stakedBalances[pool.sousId],
    pendingReward: userPendingRewards[pool.sousId],
  }))

  useFastRefreshEffect(() => {
    // batch(() => {

    // fetchPublicVaultData(chainId, teleContract)
    dispatch(
      fetchCakeVaultPublicData({
        totalShares: totalSharesAsBigNumber.toJSON(),
        totalLockedAmount: totalLockedAmountAsBigNumber.toJSON(),
        pricePerFullShare: sharePriceAsBigNumber.toJSON(),
        totalCakeInVault: totalCakeInVaultAsBigNumber.toJSON(),
      })
    )
    console.log(userData, 'userData')

    dispatch(fetchPoolsUserDataAsync(userData))
    // dispatch(fetchCakeVaultUserData({ account, chainId: chainId || ChainId.MAINNET, multicallContract }))
    // })
  }, [account, dispatch])

  useEffect(() => {
    batch(() => {
      dispatch(
        fetchCakeVaultFees({
          chainId: chainId || ChainId.MAINNET,
          multicallContract,
        })
      )
    })
  }, [dispatch])
}

export const useCakeVault = () => {
  return useVaultPoolByKey(VaultKey.TeleVault)
}

export const useVaultPools = () => {
  const teleVault = useVaultPoolByKey(VaultKey.TeleVault)
  const vaults = useMemo(() => {
    return {
      [VaultKey.TeleVault]: teleVault,
    }
  }, [teleVault])
  return vaults
}

export const useVaultPoolByKey = (key: VaultKey) => {
  const vaultPoolByKey = useMemo(() => makeVaultPoolByKey(key), [key])

  return useSelector(vaultPoolByKey)
}