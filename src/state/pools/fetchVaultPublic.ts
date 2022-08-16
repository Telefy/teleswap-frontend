import BigNumber from 'bignumber.js'
import { multicallv2 } from 'utils/multicall'
import teleVaultAbi from 'abis/tele-pool.json'
import { getTelePoolAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { Contract, ethers } from 'ethers'
import { MulticallStake } from 'abis/types'
import { Interface } from 'ethers/lib/utils'
import { ListenerOptions } from 'state/multicall/actions'
import { useMultipleContractMultipleData } from 'state/multicall/hooks'
import { useMemo } from 'react'

// export const fetchPublicVaultData = async (
//   chainId: number,
//   teleContract: Contract | null,
//   teleVaultAddress?: string
// ) => {
//   try {
//     const vaultPoolContractAddress = getTelePoolAddress(chainId)
//     if (!teleVaultAddress) teleVaultAddress = vaultPoolContractAddress
//     const calls = ['getPricePerFullShare', 'totalShares', 'totalLockedAmount'].map((method) => ({
//       address: teleVaultAddress ? teleVaultAddress : '',
//       name: method,
//     }))
//     console.log(teleContract, 'teleContracts')
//     if (teleContract) {
//       const [[[sharePrice], [shares], totalLockedAmount], totalCakeInVault] = await Promise.all([
//         multicallv2(multicallContract, teleVaultAbi, calls, {
//           requireSuccess: false,
//         }),
//         teleContract.balanceOf(vaultPoolContractAddress),
//       ])

//       const totalSharesAsBigNumber = shares ? new BigNumber(shares.toString()) : BIG_ZERO
//       const totalLockedAmountAsBigNumber = totalLockedAmount ? new BigNumber(totalLockedAmount[0].toString()) : BIG_ZERO
//       const sharePriceAsBigNumber = sharePrice ? new BigNumber(sharePrice.toString()) : BIG_ZERO
//       return {
//         totalShares: totalSharesAsBigNumber.toJSON(),
//         totalLockedAmount: totalLockedAmountAsBigNumber.toJSON(),
//         pricePerFullShare: sharePriceAsBigNumber.toJSON(),
//         totalCakeInVault: new BigNumber(totalCakeInVault.toString()).toJSON(),
//       }
//     } else throw new Error('Empty contract')
//   } catch (error) {
//     return {
//       totalShares: undefined,
//       totalLockedAmount: undefined,
//       pricePerFullShare: undefined,
//       totalCakeInVault: undefined,
//     }
//   }
// }

export const fetchVaultFees = async (chainId: number, multicallContract: MulticallStake, teleVaultAddress?: string) => {
  try {
    const vaultPoolContractAddress = getTelePoolAddress(chainId)
    if (!teleVaultAddress) teleVaultAddress = vaultPoolContractAddress
    const calls = ['performanceFee', 'withdrawFee', 'withdrawFeePeriod'].map((method) => ({
      address: teleVaultAddress ? teleVaultAddress : '',
      name: method,
    }))

    const [[performanceFee], [withdrawalFee], [withdrawalFeePeriod]] = await multicallv2(
      multicallContract,
      teleVaultAbi,
      calls
    )

    return {
      performanceFee: performanceFee.toNumber(),
      withdrawalFee: withdrawalFee.toNumber(),
      withdrawalFeePeriod: withdrawalFeePeriod.toNumber(),
    }
  } catch (error) {
    return {
      performanceFee: null,
      withdrawalFee: null,
      withdrawalFeePeriod: null,
    }
  }
}
