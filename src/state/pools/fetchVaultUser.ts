import BigNumber from 'bignumber.js'
import { SerializedLockedVaultUser } from 'state/types'
import { getTelePoolAddress } from 'utils/addressHelpers'
import telePoolAbi from 'abis/tele-pool.json'
import { multicallv2 } from 'utils/multicall'
import { MulticallStake } from 'abis/types'

const fetchVaultUser = async (
  account: string,
  chainId: number,
  multicallContract: MulticallStake
): Promise<SerializedLockedVaultUser> => {
  try {
    const telePoolAddress = getTelePoolAddress(chainId)
    const calls = ['userInfo', 'calculatePerformanceFee', 'calculateOverdueFee'].map((method) => ({
      address: telePoolAddress ? telePoolAddress : '',
      name: method,
      params: [account],
    }))

    const [userContractResponse, [currentPerformanceFee], [currentOverdueFee]] = await multicallv2(
      multicallContract,
      telePoolAbi,
      calls
    )
    return {
      isLoading: false,
      userShares: new BigNumber(userContractResponse.shares.toString()).toJSON(),
      lastDepositedTime: userContractResponse.lastDepositedTime.toString(),
      lastUserActionTime: userContractResponse.lastUserActionTime.toString(),
      cakeAtLastUserAction: new BigNumber(userContractResponse.cakeAtLastUserAction.toString()).toJSON(),
      userBoostedShare: new BigNumber(userContractResponse.userBoostedShare.toString()).toJSON(),
      locked: userContractResponse.locked,
      lockEndTime: userContractResponse.lockEndTime.toString(),
      lockStartTime: userContractResponse.lockStartTime.toString(),
      lockedAmount: new BigNumber(userContractResponse.lockedAmount.toString()).toJSON(),
      currentPerformanceFee: new BigNumber(currentPerformanceFee.toString()).toJSON(),
      currentOverdueFee: new BigNumber(currentOverdueFee.toString()).toJSON(),
    }
  } catch (error) {
    return {
      isLoading: true,
      userShares: '',
      lastDepositedTime: '',
      lastUserActionTime: '',
      cakeAtLastUserAction: '',
      userBoostedShare: '',
      lockEndTime: '',
      lockStartTime: '',
      locked: true,
      lockedAmount: '',
      currentPerformanceFee: '',
      currentOverdueFee: '',
    }
  }
}

export default fetchVaultUser
