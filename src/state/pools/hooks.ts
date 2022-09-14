import { useEffect, useMemo } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { useAppDispatch } from 'state/hooks'
import { useFastRefreshEffect } from 'hooks/useRefreshEffect'
import {
  fetchPoolsUserDataAsync,
  fetchCakeVaultPublicData,
  fetchCakeVaultFees,
  fetchCakeVaultUserData,
  setPoolsPublicData,
} from '.'
import { DeserializedPool, SerializedLockedVaultUser, VaultKey } from 'state/types'
import {
  poolsWithUserDataLoadingSelector,
  makePoolWithUserDataLoadingSelector,
  makeVaultPoolByKey,
  poolsWithVaultSelector,
} from './selectors'
import { useTeleContract, useMulticallContract, useTelePoolContract } from 'hooks/useContract'
import { ChainId, ChainTokenMap, TELE_ADDRESS } from '@telefy/teleswap-core-sdk'
import { useActiveWeb3React } from 'hooks/web3'
import { useMultipleContractMultipleData, useMultipleContractSingleData, useSingleCallResult } from '../multicall/hooks'
import { getTelePoolAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import poolsConfig from 'constants/pools'
import { ethers } from 'ethers'
import TELE_POOL_ABI from 'abis/tele-pool.json'
import ERC20_ABI from 'abis/erc20.json'
import SousChef_ABI from 'abis/sous-chef.json'
import { arrayUniq } from 'utils/prices'
import { ZERO_ADDRESS } from 'constants/misc'
import { useTelePrice } from 'services/graph'

export const useFetchPublicPoolsData = () => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveWeb3React()
  const { data: telePrice } = useTelePrice(chainId || ChainId.MAINNET)

  useEffect(() => {
    const liveData = poolsConfig.map((pool) => {
      const totalStaking = { totalStaked: '0' }
      const isPoolFinished = pool.isFinished

      const stakingTokenAddress =
        pool.stakingToken[(chainId as keyof ChainTokenMap) || ChainId.MAINNET]?.address.toLowerCase() || null
      const stakingTokenPrice =
        stakingTokenAddress === TELE_ADDRESS[chainId || ChainId.MAINNET].toLowerCase() ? telePrice : 0

      const earningTokenAddress =
        pool.earningToken[(chainId as keyof ChainTokenMap) || ChainId.MAINNET]?.address.toLowerCase() || null
      const earningTokenPrice =
        earningTokenAddress === TELE_ADDRESS[chainId || ChainId.MAINNET].toLowerCase() ? telePrice : 0
      const apr = 0

      const profileRequirement = {
        required: false,
        thresholdPoints: BIG_ZERO,
      }

      return {
        ...totalStaking,
        profileRequirement,
        stakingTokenPrice,
        earningTokenPrice,
        apr,
        isFinished: isPoolFinished,
      }
    })
    batch(() => {
      dispatch(setPoolsPublicData(liveData))
    })
  }, [chainId, dispatch, telePrice])
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

export const usePools = (chainId: number): { pools: DeserializedPool[]; userDataLoaded: boolean } => {
  return useSelector(poolsWithUserDataLoadingSelector(chainId))
}

export const usePool = (sousId: number): { pool: DeserializedPool; userDataLoaded: boolean } => {
  const { chainId } = useActiveWeb3React()

  const poolWithUserDataLoadingSelector = useMemo(
    () => makePoolWithUserDataLoadingSelector(sousId, chainId || ChainId.MAINNET),
    [sousId]
  )
  return useSelector(poolWithUserDataLoadingSelector)
}

export const usePoolsWithVault = (chainId: number) => useSelector(poolsWithVaultSelector(chainId))

export const usePoolsPageFetch = () => {
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const teleContract = useTeleContract()
  const telePoolContract = useTelePoolContract()
  useFetchPublicPoolsData()

  // ---- fetchCakeVaultPublicData
  const vaultPoolContractAddress = getTelePoolAddress(chainId || ChainId.MAINNET)
  const { result: sharePriceCall } = useSingleCallResult(telePoolContract, 'getPricePerFullShare', undefined)
  const { result: sharesCall } = useSingleCallResult(telePoolContract, 'totalShares', undefined)
  const { result: totalLockedAmountCall } = useSingleCallResult(telePoolContract, 'totalLockedAmount', undefined)
  const { result: totalCakeInVaultCall } = useSingleCallResult(teleContract, 'balanceOf', [vaultPoolContractAddress])
  const { result: performanceFeeCall } = useSingleCallResult(telePoolContract, 'performanceFee', undefined)
  const { result: withdrawFeeCall } = useSingleCallResult(telePoolContract, 'withdrawFee', undefined)
  const { result: withdrawFeePeriodCall } = useSingleCallResult(telePoolContract, 'withdrawFeePeriod', undefined)

  // ------- fetchPoolsUserDataAsync
  const nonMasterPools = poolsConfig.filter((pool) => pool.sousId !== 0)
  const poolTokenAddresses = poolsConfig.map(
    (pool) => pool.stakingToken[(chainId as keyof ChainTokenMap) || ChainId.MAINNET]?.address
  )
  const vaultPoolArgs = poolsConfig.map((pool) => [
    [account || ZERO_ADDRESS, pool.contractAddress[chainId || ChainId.MAINNET]],
  ])
  const poolTokensUniq = arrayUniq(poolTokenAddresses)
  const nonMasterPoolContractAddresses = nonMasterPools.map((pool) => pool.contractAddress[chainId || ChainId.MAINNET])
  const tokenInterface = new ethers.utils.Interface(ERC20_ABI)
  const poolInterface = new ethers.utils.Interface(TELE_POOL_ABI)
  const sousChefPoolInterface = new ethers.utils.Interface(SousChef_ABI)

  const poolAllowanceRes = useMultipleContractMultipleData(
    poolTokenAddresses,
    tokenInterface,
    'allowance',
    vaultPoolArgs
  )
  const tokenBalanceRes = useMultipleContractSingleData(poolTokensUniq, tokenInterface, 'balanceOf', [
    account || ZERO_ADDRESS,
  ])
  const userStakeBalanceRes = useMultipleContractSingleData(
    nonMasterPoolContractAddresses,
    sousChefPoolInterface,
    'userInfo',
    [account || ZERO_ADDRESS]
  )
  const userPendingRewardsRes = useMultipleContractSingleData(
    nonMasterPoolContractAddresses,
    sousChefPoolInterface,
    'pendingReward',
    [account || ZERO_ADDRESS]
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
    return balanceRes ? { ...acc, [token]: balanceRes[0].toString() } : { ...acc }
  }, {})

  const poolTokenBalances: {
    [key: string]: string
  } = poolsConfig.reduce((acc, pool, index) => {
    return {
      ...acc,
      [pool.sousId]: new BigNumber(
        tokenBalances[pool.stakingToken[(chainId as keyof ChainTokenMap) || ChainId.MAINNET]?.address || '']
      ).toJSON(),
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

  // ------- fetchCakeVaultUserData
  const { result: vaultUserInfoRes } = useSingleCallResult(telePoolContract, 'userInfo', [account || ZERO_ADDRESS])
  const { result: vaultCalculatePerformanceFeeRes } = useSingleCallResult(telePoolContract, 'calculatePerformanceFee', [
    account || ZERO_ADDRESS,
  ])
  const { result: vaultCalculateOverdueFeeRes } = useSingleCallResult(telePoolContract, 'calculateOverdueFee', [
    account || ZERO_ADDRESS,
  ])

  let fetchVaultUserInfo: SerializedLockedVaultUser
  if (vaultUserInfoRes && vaultCalculatePerformanceFeeRes && vaultCalculateOverdueFeeRes) {
    fetchVaultUserInfo = {
      isLoading: false,
      userShares: new BigNumber(vaultUserInfoRes.shares.toString()).toJSON(),
      lastDepositedTime: vaultUserInfoRes.lastDepositedTime.toString(),
      lastUserActionTime: vaultUserInfoRes.lastUserActionTime.toString(),
      teleAtLastUserAction: new BigNumber(vaultUserInfoRes.teleAtLastUserAction.toString()).toJSON(),
      userBoostedShare: new BigNumber(vaultUserInfoRes.userBoostedShare.toString()).toJSON(),
      locked: vaultUserInfoRes.locked,
      lockEndTime: vaultUserInfoRes.lockEndTime.toString(),
      lockStartTime: vaultUserInfoRes.lockStartTime.toString(),
      lockedAmount: new BigNumber(vaultUserInfoRes.lockedAmount.toString()).toJSON(),
      currentPerformanceFee: new BigNumber(vaultCalculatePerformanceFeeRes[0].toString()).toJSON(),
      currentOverdueFee: new BigNumber(vaultCalculateOverdueFeeRes[0].toString()).toJSON(),
    }
  } else {
    fetchVaultUserInfo = {
      isLoading: true,
      userShares: '',
      lastDepositedTime: '',
      lastUserActionTime: '',
      teleAtLastUserAction: '',
      userBoostedShare: '',
      lockEndTime: '',
      lockStartTime: '',
      locked: true,
      lockedAmount: '',
      currentPerformanceFee: '',
      currentOverdueFee: '',
    }
  }

  // console.log(
  //   {
  //     totalShares: totalSharesAsBigNumber.toJSON(),
  //     totalLockedAmount: totalLockedAmountAsBigNumber.toJSON(),
  //     pricePerFullShare: sharePriceAsBigNumber.toJSON(),
  //     totalCakeInVault: totalCakeInVaultAsBigNumber.toJSON(),
  //   },
  //   'cakeVaultPublicData --- 1'
  // )
  // console.log(userData, 'userData ---- 2')
  // console.log(fetchVaultUserInfo, 'fetchVaultUserInfo --- 3')
  useEffect(() => {
    const totalSharesAsBigNumber = sharesCall && sharesCall.length ? new BigNumber(sharesCall[0].toString()) : BIG_ZERO
    const totalLockedAmountAsBigNumber =
      totalLockedAmountCall && totalLockedAmountCall.length
        ? new BigNumber(totalLockedAmountCall[0].toString())
        : BIG_ZERO
    const sharePriceAsBigNumber =
      sharePriceCall && sharePriceCall.length ? new BigNumber(sharePriceCall[0].toString()) : BIG_ZERO
    const totalCakeInVaultAsBigNumber =
      totalCakeInVaultCall && totalCakeInVaultCall.length ? new BigNumber(totalCakeInVaultCall[0].toString()) : BIG_ZERO
    batch(() => {
      // fetchPublicVaultData(chainId, teleContract)
      dispatch(
        fetchCakeVaultPublicData({
          totalShares: totalSharesAsBigNumber.toJSON(),
          totalLockedAmount: totalLockedAmountAsBigNumber.toJSON(),
          pricePerFullShare: sharePriceAsBigNumber.toJSON(),
          totalCakeInVault: totalCakeInVaultAsBigNumber.toJSON(),
        })
      )

      dispatch(fetchPoolsUserDataAsync(userData))
      dispatch(fetchCakeVaultUserData(fetchVaultUserInfo))
    })
  }, [dispatch, fetchVaultUserInfo, sharePriceCall, sharesCall, totalCakeInVaultCall, totalLockedAmountCall, userData])

  useEffect(() => {
    const performanceFeeAsBigNumber =
      performanceFeeCall && performanceFeeCall.length ? new BigNumber(performanceFeeCall[0].toString()) : BIG_ZERO
    const withdrawFeeAsBigNumber =
      withdrawFeeCall && withdrawFeeCall.length ? new BigNumber(withdrawFeeCall[0].toString()) : BIG_ZERO
    const withdrawFeePeriodAsBigNumber =
      withdrawFeePeriodCall && withdrawFeePeriodCall.length
        ? new BigNumber(withdrawFeePeriodCall[0].toString())
        : BIG_ZERO
    batch(() => {
      dispatch(
        fetchCakeVaultFees({
          performanceFee: performanceFeeAsBigNumber.toNumber(),
          withdrawalFee: withdrawFeeAsBigNumber.toNumber(),
          withdrawalFeePeriod: withdrawFeePeriodAsBigNumber.toNumber(),
        })
      )
    })
  }, [dispatch, performanceFeeCall, withdrawFeeCall, withdrawFeePeriodCall])
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

export const useUpdateCakeVaultUserData = () => {
  const { account } = useActiveWeb3React()
  const dispatch = useDispatch()
  const telePoolContract = useTelePoolContract()
  // useFetchPublicPoolsData()

  // ------- fetchCakeVaultUserData
  const { result: vaultUserInfoRes } = useSingleCallResult(telePoolContract, 'userInfo', [account || ZERO_ADDRESS])
  const { result: vaultCalculatePerformanceFeeRes } = useSingleCallResult(telePoolContract, 'calculatePerformanceFee', [
    account || ZERO_ADDRESS,
  ])
  const { result: vaultCalculateOverdueFeeRes } = useSingleCallResult(telePoolContract, 'calculateOverdueFee', [
    account || ZERO_ADDRESS,
  ])

  let fetchVaultUserInfo: SerializedLockedVaultUser
  if (vaultUserInfoRes && vaultCalculatePerformanceFeeRes && vaultCalculateOverdueFeeRes) {
    fetchVaultUserInfo = {
      isLoading: false,
      userShares: new BigNumber(vaultUserInfoRes.shares.toString()).toJSON(),
      lastDepositedTime: vaultUserInfoRes.lastDepositedTime.toString(),
      lastUserActionTime: vaultUserInfoRes.lastUserActionTime.toString(),
      teleAtLastUserAction: new BigNumber(vaultUserInfoRes.teleAtLastUserAction.toString()).toJSON(),
      userBoostedShare: new BigNumber(vaultUserInfoRes.userBoostedShare.toString()).toJSON(),
      locked: vaultUserInfoRes.locked,
      lockEndTime: vaultUserInfoRes.lockEndTime.toString(),
      lockStartTime: vaultUserInfoRes.lockStartTime.toString(),
      lockedAmount: new BigNumber(vaultUserInfoRes.lockedAmount.toString()).toJSON(),
      currentPerformanceFee: new BigNumber(vaultCalculatePerformanceFeeRes[0].toString()).toJSON(),
      currentOverdueFee: new BigNumber(vaultCalculateOverdueFeeRes[0].toString()).toJSON(),
    }
  } else {
    fetchVaultUserInfo = {
      isLoading: true,
      userShares: '',
      lastDepositedTime: '',
      lastUserActionTime: '',
      teleAtLastUserAction: '',
      userBoostedShare: '',
      lockEndTime: '',
      lockStartTime: '',
      locked: true,
      lockedAmount: '',
      currentPerformanceFee: '',
      currentOverdueFee: '',
    }
  }
  useEffect(() => {
    dispatch(fetchCakeVaultUserData(fetchVaultUserInfo))
  }, [dispatch, fetchVaultUserInfo])
}
