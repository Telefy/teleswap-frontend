/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ChainId, ChainTokenMap } from '@telefy/teleswap-core-sdk'
import BigNumber from 'bignumber.js'
import {
  SerializedFarm,
  DeserializedPool,
  SerializedPool,
  SerializedCakeVault,
  DeserializedCakeVault,
} from 'state/types'
import { deserializeToken } from 'state/user/helpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { convertSharesToCake } from 'utils/poolHelpers'

type UserData =
  | DeserializedPool['userData']
  | {
      allowance: number | string
      stakingTokenBalance: number | string
      stakedBalance: number | string
      pendingReward: number | string
    }

export const transformUserData = (userData: UserData) => {
  return {
    allowance: userData ? new BigNumber(userData.allowance) : BIG_ZERO,
    stakingTokenBalance: userData ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO,
    stakedBalance: userData ? new BigNumber(userData.stakedBalance) : BIG_ZERO,
    pendingReward: userData ? new BigNumber(userData.pendingReward) : BIG_ZERO,
  }
}

const transformProfileRequirement = (profileRequirement?: { required: boolean; thresholdPoints: string }) => {
  return profileRequirement
    ? {
        required: profileRequirement.required,
        thresholdPoints: profileRequirement.thresholdPoints
          ? new BigNumber(profileRequirement.thresholdPoints)
          : BIG_ZERO,
      }
    : undefined
}

export const transformPool = (pool: SerializedPool, chainId: number): DeserializedPool => {
  const {
    totalStaked,
    stakingLimit,
    numberBlocksForUserLimit,
    userData,
    stakingToken,
    earningToken,
    profileRequirement,
    startBlock,
    ...rest
  } = pool
  return {
    ...rest,
    startBlock,
    profileRequirement: transformProfileRequirement(profileRequirement),
    stakingToken: deserializeToken(stakingToken[chainId ? (chainId as keyof ChainTokenMap) : ChainId.MAINNET]!),
    earningToken: deserializeToken(earningToken[chainId ? (chainId as keyof ChainTokenMap) : ChainId.MAINNET]!),
    userData: transformUserData(userData),
    totalStaked: new BigNumber(totalStaked ? totalStaked : ''),
    stakingLimit: new BigNumber(stakingLimit ? stakingLimit : ''),
    stakingLimitEndBlock: numberBlocksForUserLimit && startBlock ? numberBlocksForUserLimit + startBlock : 0,
  }
}

export const transformLockedVault = (vault: SerializedCakeVault): DeserializedCakeVault => {
  const {
    totalShares: totalSharesAsString,
    totalLockedAmount: totalLockedAmountAsString,
    pricePerFullShare: pricePerFullShareAsString,
    totalCakeInVault: totalCakeInVaultAsString,
    fees,
    userData,
  } = vault

  const { performanceFee, withdrawalFee, withdrawalFeePeriod } = fees!
  const {
    isLoading,
    userShares: userSharesAsString,
    teleAtLastUserAction: teleAtLastUserActionAsString,
    lastDepositedTime,
    lastUserActionTime,
    userBoostedShare: userBoostedShareAsString,
    lockEndTime,
    lockStartTime,
    locked,
    lockedAmount: lockedAmountAsString,
    currentOverdueFee: currentOverdueFeeAsString,
    currentPerformanceFee: currentPerformanceFeeAsString,
  } = userData!

  const totalShares = totalSharesAsString ? new BigNumber(totalSharesAsString) : BIG_ZERO
  const totalLockedAmount = new BigNumber(totalLockedAmountAsString ? totalLockedAmountAsString : '')
  const pricePerFullShare = pricePerFullShareAsString ? new BigNumber(pricePerFullShareAsString) : BIG_ZERO
  const totalCakeInVault = new BigNumber(totalCakeInVaultAsString ? totalCakeInVaultAsString : '')
  const userShares = new BigNumber(userSharesAsString)
  const teleAtLastUserAction = new BigNumber(teleAtLastUserActionAsString)
  const lockedAmount = new BigNumber(lockedAmountAsString)
  const userBoostedShare = new BigNumber(userBoostedShareAsString)
  const currentOverdueFee = currentOverdueFeeAsString ? new BigNumber(currentOverdueFeeAsString) : BIG_ZERO
  const currentPerformanceFee = currentPerformanceFeeAsString ? new BigNumber(currentPerformanceFeeAsString) : BIG_ZERO

  const performanceFeeAsDecimal = performanceFee && performanceFee / 100

  const balance = convertSharesToCake(
    userShares,
    pricePerFullShare,
    undefined,
    undefined,
    currentOverdueFee.plus(currentPerformanceFee).plus(userBoostedShare)
  )

  return {
    totalShares,
    totalLockedAmount,
    pricePerFullShare,
    totalCakeInVault,
    fees: { performanceFee, withdrawalFee, withdrawalFeePeriod, performanceFeeAsDecimal },
    userData: {
      isLoading,
      userShares,
      teleAtLastUserAction,
      lastDepositedTime,
      lastUserActionTime,
      lockEndTime,
      lockStartTime,
      locked,
      lockedAmount,
      userBoostedShare,
      currentOverdueFee,
      currentPerformanceFee,
      balance,
    },
  }
}

export const getTokenPricesFromFarm = (farms: SerializedFarm[]) => {
  return farms.reduce((prices: any, farm) => {
    const quoteTokenAddress = farm.quoteToken.address.toLocaleLowerCase()
    const tokenAddress = farm.token.address.toLocaleLowerCase()
    /* eslint-disable no-param-reassign */
    if (prices) {
      if (!prices[quoteTokenAddress]) {
        prices[quoteTokenAddress] = new BigNumber(farm.quoteTokenPriceBusd!).toNumber()
      }
      if (!prices[tokenAddress]) {
        prices[tokenAddress] = new BigNumber(farm.tokenPriceBusd!).toNumber()
      }
    }
    /* eslint-enable no-param-reassign */
    return prices
  })
}
