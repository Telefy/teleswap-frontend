/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createAsyncThunk, createSlice, PayloadAction, isAnyOf } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import poolsConfig from 'constants/pools'
import {
  PoolsState,
  SerializedPool,
  SerializedVaultFees,
  SerializedCakeVault,
  SerializedLockedVaultUser,
} from 'state/types'
import { BIG_ZERO } from 'utils/bigNumber'
import cakeAbi from 'abis/tele.json'
import { getTelePoolAddress } from 'utils/addressHelpers'
import { multicallv2 } from 'utils/multicall'
// import { getBalanceNumber } from 'utils/formatBalance'
// import priceHelperLpsConfig from 'constants/priceHelperLps'
// import fetchFarms from '../farms/fetchFarms'
// import getFarmsPrices from '../farms/getFarmsPrices'
import {
  fetchPoolsBlockLimits,
  // fetchPoolsProfileRequirement,
  // fetchPoolsStakingLimits,
  fetchPoolsTotalStaking,
} from './fetchPools'
import {
  fetchPoolsAllowance,
  fetchUserBalances,
  fetchUserPendingRewards,
  fetchUserStakeBalances,
} from './fetchPoolsUser'
import { fetchVaultFees } from './fetchVaultPublic'
import fetchVaultUser from './fetchVaultUser'
import { getTokenPricesFromFarm } from './helpers'
import { resetUserState } from 'state/global/actions'
import { ChainId, ChainTokenMap, TELE_ADDRESS } from '@telefy/teleswap-core-sdk'
import { useActiveWeb3React } from 'hooks/web3'
import { Contract } from 'ethers'
import { MulticallStake } from 'abis/types'
import { Interface } from 'ethers/lib/utils'
import { CallState, OptionalMethodInputs } from 'state/multicall/hooks'
import { ListenerOptions } from 'state/multicall/actions'
import { useMemo } from 'react'

export const initialPoolVaultState = Object.freeze({
  totalShares: null,
  totalLockedAmount: null,
  pricePerFullShare: null,
  totalCakeInVault: null,
  fees: {
    performanceFee: null,
    withdrawalFee: null,
    withdrawalFeePeriod: null,
  },
  userData: {
    isLoading: true,
    userShares: '',
    teleAtLastUserAction: '',
    lastDepositedTime: '',
    lastUserActionTime: '',
    credit: '',
    locked: true,
    lockStartTime: '',
    lockEndTime: '',
    userBoostedShare: '',
    lockedAmount: '',
    currentOverdueFee: '',
    currentPerformanceFee: '',
  },
  creditStartBlock: null,
})

const initialState: PoolsState = {
  data: [...poolsConfig],
  userDataLoaded: false,
  teleVault: initialPoolVaultState as unknown as SerializedCakeVault,
}

export const fetchCakePoolPublicDataAsync =
  () =>
  async (
    dispatch: (arg0: { payload: any; type: string }) => void,
    getState: () => { (): any; new (): any; farms: { (): any; new (): any; data: any } },
    chainId: number
  ) => {
    const farmsData = getState().farms.data
    const prices: any = getTokenPricesFromFarm(farmsData)

    const cakePool = poolsConfig.filter((p) => p.sousId === 0)[0]

    const stakingTokenAddress =
      cakePool.stakingToken[chainId ? (chainId as keyof ChainTokenMap) : ChainId.MAINNET]?.address.toLowerCase() || null
    const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0

    const earningTokenAddress =
      cakePool.earningToken[chainId ? (chainId as keyof ChainTokenMap) : ChainId.MAINNET]?.address.toLowerCase() || null
    const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0

    dispatch(
      setPoolPublicData({
        sousId: 0,
        data: {
          stakingTokenPrice,
          earningTokenPrice,
        },
      })
    )
  }

export const fetchCakePoolUserDataAsync =
  (account: string) =>
  async (
    dispatch: (arg0: { payload: any; type: string }) => void,
    chainId: number,
    multicallContract: MulticallStake
  ) => {
    const teleVaultAddress = getTelePoolAddress(chainId || ChainId.MAINNET)
    const allowanceCall = {
      address: TELE_ADDRESS[chainId ? chainId : ChainId.MAINNET],
      name: 'allowance',
      params: [account, teleVaultAddress],
    }
    const balanceOfCall = {
      address: TELE_ADDRESS[chainId ? chainId : ChainId.MAINNET],
      name: 'balanceOf',
      params: [account],
    }
    const cakeContractCalls = [allowanceCall, balanceOfCall]
    const [[allowance], [stakingTokenBalance]] = await multicallv2(multicallContract, cakeAbi, cakeContractCalls)

    dispatch(
      setPoolUserData({
        sousId: 0,
        data: {
          allowance: new BigNumber(allowance.toString()).toJSON(),
          stakingTokenBalance: new BigNumber(stakingTokenBalance.toString()).toJSON(),
        },
      })
    )
  }
/*
export const fetchPoolsPublicDataAsync = (currentBlockNumber: number) => async (dispatch, getState) => {
  try {
    const { chainId } = useActiveWeb3React()
    const [totalStakings, profileRequirements, currentBlock] = await Promise.all([
      fetchPoolsTotalStaking(),
      fetchPoolsProfileRequirement(),
      currentBlockNumber ? Promise.resolve(currentBlockNumber) : simpleRpcProvider.getBlockNumber(),
    ])

    const liveData = poolsConfig.map((pool) => {
      const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
      const isPoolFinished = pool.isFinished

      const stakingTokenAddress =
        pool.stakingToken[chainId ? (chainId as keyof ChainTokenMap) : ChainId.MAINNET]?.address.toLowerCase() || null
      // const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0

      const earningTokenAddress = pool.earningToken[chainId ? chainId : ChainId.MAINNET]?.address.toLowerCase() || null
      // const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0
      // const apr = !isPoolFinished
      //   ? getPoolApr(
      //       stakingTokenPrice,
      //       earningTokenPrice,
      //       getBalanceNumber(new BigNumber(totalStaking.totalStaked), pool.stakingToken.decimals),
      //       parseFloat(pool.tokenPerBlock)
      //     )
      //   : 0

      const profileRequirement = profileRequirements[pool.sousId] ? profileRequirements[pool.sousId] : undefined

      return {
        ...totalStaking,
        profileRequirement,
        // stakingTokenPrice,
        // earningTokenPrice,
        // apr,
        isFinished: isPoolFinished,
      }
    })

    dispatch(setPoolsPublicData(liveData))
  } catch (error) {
    console.error('[Pools Action] error when getting public data', error)
  }
}


export const fetchPoolsStakingLimitsAsync = () => async (dispatch, getState) => {
  const poolsWithStakingLimit = getState()
    .pools.data.filter(({ stakingLimit }) => stakingLimit !== null && stakingLimit !== undefined)
    .map((pool) => pool.sousId)

  try {
    const stakingLimits = await fetchPoolsStakingLimits(poolsWithStakingLimit)

    const stakingLimitData = poolsConfig.map((pool) => {
      if (poolsWithStakingLimit.includes(pool.sousId)) {
        return { sousId: pool.sousId }
      }
      const { stakingLimit, numberBlocksForUserLimit } = stakingLimits[pool.sousId] || {
        stakingLimit: BIG_ZERO,
        numberBlocksForUserLimit: 0,
      }
      return {
        sousId: pool.sousId,
        stakingLimit: stakingLimit.toJSON(),
        numberBlocksForUserLimit,
      }
    })

    dispatch(setPoolsPublicData(stakingLimitData))
  } catch (error) {
    console.error('[Pools Action] error when getting staking limits', error)
  }
}
*/
interface LooseNumberObject {
  [key: string]: any
}
export const updateUserAllowance = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number; multicallContract: MulticallStake }
>('pool/updateUserAllowance', async ({ sousId, account, chainId, multicallContract }) => {
  const allowances: LooseNumberObject = await fetchPoolsAllowance(account, chainId, multicallContract)
  return { sousId, field: 'allowance', value: allowances[sousId] }
})

export const updateUserBalance = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number; multicallContract: MulticallStake }
>('pool/updateUserBalance', async ({ sousId, account, chainId, multicallContract }) => {
  const tokenBalances = await fetchUserBalances(account, chainId, multicallContract)
  return { sousId, field: 'stakingTokenBalance', value: tokenBalances[sousId] }
})

export const updateUserStakedBalance = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number; multicallContract: MulticallStake }
>('pool/updateUserStakedBalance', async ({ sousId, account, chainId, multicallContract }) => {
  const stakedBalances = await fetchUserStakeBalances(account, chainId, multicallContract)
  return { sousId, field: 'stakedBalance', value: stakedBalances[sousId] }
})

export const updateUserPendingReward = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number; multicallContract: MulticallStake }
>('pool/updateUserPendingReward', async ({ sousId, account, chainId, multicallContract }) => {
  const pendingRewards = await fetchUserPendingRewards(account, chainId, multicallContract)
  return { sousId, field: 'pendingReward', value: pendingRewards[sousId] }
})

// export const fetchCakeVaultPublicData = createAsyncThunk<
//   SerializedCakeVault,
//   {
//     chainId: number
//     teleContract: Contract
//   }
// >('teleVault/fetchPublicData', async ({ chainId, teleContract }) => {
//   // return useMemo(() => {
//   //   return fetchPublicVaultData(chainId, teleContract)
//   // }, [chainId, teleContract])

//   // const publicVaultInfo = await fetchPublicVaultData(chainId, teleContract)
//   // return publicVaultInfo
// })

export const fetchCakeVaultFees = createAsyncThunk<
  SerializedVaultFees,
  { chainId: number; multicallContract: MulticallStake }
>('teleVault/fetchFees', async ({ chainId, multicallContract }) => {
  const vaultFees = await fetchVaultFees(chainId, multicallContract)
  return vaultFees
})

export const PoolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {
    setPoolPublicData: (state, action) => {
      const { sousId } = action.payload
      const poolIndex = state.data.findIndex((pool) => pool.sousId === sousId)
      state.data[poolIndex] = {
        ...state.data[poolIndex],
        ...action.payload.data,
      }
    },
    setPoolUserData: (state, action) => {
      const { sousId } = action.payload
      state.data = state.data.map((pool) => {
        if (pool.sousId === sousId) {
          return { ...pool, userDataLoaded: true, userData: action.payload.data }
        }
        return pool
      })
    },
    setPoolsPublicData: (state, action) => {
      const livePoolsData: SerializedPool[] = action.payload
      state.data = state.data.map((pool) => {
        const livePoolData = livePoolsData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, ...livePoolData }
      })
    },
    // Vault public data that updates frequently
    fetchCakeVaultPublicData: (state, action: PayloadAction<SerializedCakeVault>) => {
      state.teleVault = { ...state.teleVault, ...action.payload }
    },
    fetchPoolsUserDataAsync: (
      state,
      action: PayloadAction<
        { sousId: number; allowance: any; stakingTokenBalance: any; stakedBalance: any; pendingReward: any }[]
      >
    ) => {
      const userData = action.payload
      state.data = state.data.map((pool) => {
        const userPoolData = userData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, userDataLoaded: true, userData: userPoolData }
      })
      state.userDataLoaded = true
    },
    // Vault user data
    fetchCakeVaultUserData: (state, action: PayloadAction<SerializedLockedVaultUser>) => {
      const userData = action.payload
      userData.isLoading = false
      state.teleVault = { ...state.teleVault, userData }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state.data = state.data.map(({ userData, ...pool }) => {
        return { ...pool }
      })
      state.userDataLoaded = false
      state.teleVault = { ...state.teleVault, userData: initialPoolVaultState.userData }
    })
    // Vault public data that updates frequently

    // Vault fees
    builder.addCase(fetchCakeVaultFees.fulfilled, (state, action: PayloadAction<SerializedVaultFees>) => {
      const fees = action.payload
      state.teleVault = { ...state.teleVault, fees }
    })
    builder.addMatcher(
      isAnyOf(
        updateUserAllowance.fulfilled,
        updateUserBalance.fulfilled,
        updateUserStakedBalance.fulfilled,
        updateUserPendingReward.fulfilled
      ),
      (state, action: PayloadAction<{ sousId: number; field: string; value: any }>) => {
        const { field, value, sousId } = action.payload
        const index = state.data.findIndex((p) => p.sousId === sousId)

        if (index >= 0) {
          state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData!, [field]: value } }
        }
      }
    )
  },
})

// Actions
export const {
  setPoolsPublicData,
  setPoolPublicData,
  setPoolUserData,
  fetchCakeVaultPublicData,
  fetchPoolsUserDataAsync,
  fetchCakeVaultUserData,
} = PoolsSlice.actions

export default PoolsSlice.reducer
