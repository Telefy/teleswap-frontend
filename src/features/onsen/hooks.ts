import { Zero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { CurrencyAmount, DIALER_CONTRACT_ADDRESS, MINICHEF_ADDRESS, TELE } from '@telefy/teleswap-core-sdk'
import JSBI from 'jsbi'
import { OLD_FARMS } from 'config/farms'
import { useDialerContract, useMiniChefContract, useOldFarmsContract } from 'hooks/useContract'
import { NEVER_RELOAD, useSingleCallResult, useSingleContractMultipleData } from 'state/multicall/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import concat from 'lodash/concat'
import zip from 'lodash/zip'
import { useCallback, useMemo } from 'react'

import { Chef } from './enum'

export function useChefContract(chef: Chef) {
  const DialerContract = useDialerContract()
  const miniChefContract = useMiniChefContract()
  const oldFarmsContract = useOldFarmsContract()
  const contracts = useMemo(
    () => ({
      [Chef.DIALER_CONTRACT]: DialerContract,
      [Chef.MINICHEF]: miniChefContract,
      [Chef.OLD_FARMS]: oldFarmsContract,
    }),
    [DialerContract, miniChefContract, oldFarmsContract]
  )
  return useMemo(() => {
    return contracts[chef]
  }, [contracts, chef])
}

export function useChefContracts(chefs: Chef[]) {
  const DialerContract = useDialerContract()
  const miniChefContract = useMiniChefContract()
  const oldFarmsContract = useOldFarmsContract()
  const contracts = useMemo(
    () => ({
      [Chef.DIALER_CONTRACT]: DialerContract,
      [Chef.MINICHEF]: miniChefContract,
      [Chef.OLD_FARMS]: oldFarmsContract,
    }),
    [DialerContract, miniChefContract, oldFarmsContract]
  )
  return chefs.map((chef) => contracts[chef])
}

// @ts-ignore TYPE NEEDS FIXING
export function useUserInfo(farm, token) {
  const { account } = useActiveWeb3React()

  const contract = useChefContract(farm.chef)

  const args = useMemo(() => {
    if (!account) {
      return
    }
    return [String(farm.id), String(account)]
  }, [farm, account])

  const result = useSingleCallResult(args ? contract : null, 'userInfo', args)?.result

  const value = result?.[0]

  const amount = value ? JSBI.BigInt(value.toString()) : undefined

  return amount ? CurrencyAmount.fromRawAmount(token, amount) : undefined
}

// @ts-ignore TYPE NEEDS FIXING
export function usePendingTele(farm) {
  const { account, chainId } = useActiveWeb3React()

  const contract = useChefContract(farm.chef)

  const args = useMemo(() => {
    if (!account) {
      return
    }
    return [String(farm.id), String(account)]
  }, [farm, account])

  const result = useSingleCallResult(args ? contract : null, 'pendingTele', args)?.result

  const value = result?.[0]

  const amount = value ? JSBI.BigInt(value.toString()) : undefined

  // @ts-ignore TYPE NEEDS FIXING
  return amount ? CurrencyAmount.fromRawAmount(TELE[chainId], amount) : undefined
}

// @ts-ignore TYPE NEEDS FIXING
export function usePendingToken(farm, contract) {
  const { account } = useActiveWeb3React()

  const args = useMemo(() => {
    if (!account || !farm) {
      return
    }
    return [String(farm.pid), String(account)]
  }, [farm, account])

  const pendingTokens = useSingleContractMultipleData(
    args ? contract : null,
    'pendingTokens',
    // @ts-ignore TYPE NEEDS FIXING
    args.map((arg) => [...arg, '0'])
  )

  return useMemo(() => pendingTokens, [pendingTokens])
}

export function useChefPositions(contract?: Contract | null, rewarder?: Contract | null, chainId?: number) {
  const { account } = useActiveWeb3React()

  const numberOfPools = useSingleCallResult(contract ? contract : null, 'poolLength', undefined, NEVER_RELOAD)
    ?.result?.[0]

  const args = useMemo(() => {
    if (!account || !numberOfPools) {
      return
    }
    return [...Array(numberOfPools.toNumber()).keys()].map((pid) => [String(pid), String(account)])
  }, [numberOfPools, account])

  // @ts-ignore TYPE NEEDS FIXING
  const pendingTele = useSingleContractMultipleData(args ? contract : null, 'pendingTele', args)

  // @ts-ignore TYPE NEEDS FIXING
  const userInfo = useSingleContractMultipleData(args ? contract : null, 'userInfo', args)

  // const pendingTokens = useSingleContractMultipleData(
  //     rewarder,
  //     'pendingTokens',
  //     args.map((arg) => [...arg, '0'])
  // )

  const getChef = useCallback(() => {
    // @ts-ignore TYPE NEEDS FIXING
    if (DIALER_CONTRACT_ADDRESS[chainId] === contract.address) {
      return Chef.DIALER_CONTRACT
      // @ts-ignore TYPE NEEDS FIXING
    } else if (MINICHEF_ADDRESS[chainId] === contract.address) {
      return Chef.MINICHEF
      // @ts-ignore TYPE NEEDS FIXING
    } else if (OLD_FARMS[chainId] === contract.address) {
      return Chef.OLD_FARMS
    } else {
      return undefined
    }
  }, [chainId, contract])

  return useMemo(() => {
    if (!pendingTele && !userInfo) {
      return []
    }
    return zip(pendingTele, userInfo)
      .map((data, i) => ({
        // @ts-ignore TYPE NEEDS FIXING
        id: args[i][0],
        // @ts-ignore TYPE NEEDS FIXING
        pendingTele: data[0].result?.[0] || Zero,
        // @ts-ignore TYPE NEEDS FIXING
        amount: data[1].result?.[0] || Zero,
        chef: getChef(),
        // pendingTokens: data?.[2]?.result,
      }))
      .filter(({ pendingTele, amount }) => {
        return (pendingTele && !pendingTele.isZero()) || (amount && !amount.isZero())
      })
  }, [args, getChef, pendingTele, userInfo])
}

const toRet: any[] = []

export function usePositions(chainId?: number) {
  const DialerContract = useDialerContract()
  const miniChefContract = useMiniChefContract()
  const DialerContractPositions = useChefPositions(DialerContract, undefined, chainId)
  const miniChefPositions = useChefPositions(miniChefContract, undefined, chainId)

  const data = useMemo(() => {
    return concat(DialerContractPositions, miniChefPositions)
  }, [DialerContractPositions, miniChefPositions])

  return data.length > 0 ? data : toRet
}
