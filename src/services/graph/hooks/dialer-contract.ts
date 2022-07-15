import { ChainId } from '@telefy/teleswap-core-sdk'
import { Chef } from 'features/onsen/enum'
import {
  getMasterChefV1Farms,
  getMasterChefV1PairAddreses,
  getMasterChefV1SushiPerBlock,
  getMasterChefV1TotalAllocPoint,
  getDialerContractFarms,
  getDialerContractPairAddreses,
  getMiniChefFarms,
  getMiniChefPairAddreses,
  getOldMiniChefFarms,
} from 'services/graph/fetchers'
import { useActiveWeb3React } from 'hooks/web3'
import concat from 'lodash/concat'
import { useMemo } from 'react'
import useSWR, { SWRConfiguration } from 'swr'

export function useMasterChefV1TotalAllocPoint(swrConfig = undefined) {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && chainId === ChainId.MAINNET
  return useSWR(shouldFetch ? 'masterChefV1TotalAllocPoint' : null, () => getMasterChefV1TotalAllocPoint(), swrConfig)
}

export function useMasterChefV1SushiPerBlock(swrConfig = undefined) {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && chainId === ChainId.MAINNET
  return useSWR(shouldFetch ? 'masterChefV1SushiPerBlock' : null, () => getMasterChefV1SushiPerBlock(), swrConfig)
}

interface useFarmsProps {
  chainId: number
  swrConfig?: SWRConfiguration
}

export function useMasterChefV1Farms({ chainId, swrConfig = undefined }: useFarmsProps) {
  const shouldFetch = chainId && chainId === ChainId.MAINNET
  const { data } = useSWR(shouldFetch ? ['masterChefV1Farms'] : null, () => getMasterChefV1Farms(undefined), swrConfig)
  return useMemo(() => {
    if (!data) return []
    // @ts-ignore TYPE NEEDS FIXING
    return data.map((data) => ({ ...data, chef: Chef.DIALER_CONTRACT }))
  }, [data])
}

export function useDialerContractFarms({ chainId, swrConfig = undefined }: useFarmsProps) {
  const shouldFetch = chainId && (chainId === ChainId.MAINNET || chainId === ChainId.RINKEBY)
  const { data } = useSWR(shouldFetch ? 'DialerContractFarms' : null, () => getDialerContractFarms(chainId), swrConfig)

  return useMemo(() => {
    if (!data) return []
    // @ts-ignore TYPE NEEDS FIXING
    return data.map((data) => ({ ...data, chef: Chef.DIALER_CONTRACT }))
  }, [data])
}

// @ts-ignore TYPE NEEDS FIXING
export function useOldMiniChefFarms(swrConfig: SWRConfiguration = undefined) {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && chainId === ChainId.CELO
  const { data } = useSWR(
    shouldFetch ? ['oldMiniChefFarms', chainId] : null,
    (_, chainId) => getOldMiniChefFarms(chainId),
    swrConfig
  )

  return useMemo(() => {
    if (!data) return []
    // @ts-ignore TYPE NEEDS FIXING
    return data.map((data) => ({ ...data, chef: Chef.OLD_FARMS }))
  }, [data])
}

export function useMiniChefFarms({ chainId, swrConfig = undefined }: useFarmsProps) {
  const shouldFetch =
    chainId &&
    [
      ChainId.MATIC,
      ChainId.XDAI,
      ChainId.HARMONY,
      ChainId.ARBITRUM_ONE,
      ChainId.CELO,
      ChainId.MOONRIVER,
      ChainId.FUSE,
      ChainId.FANTOM,
      ChainId.MOONBEAM,
    ].includes(chainId)
  const { data } = useSWR(
    shouldFetch ? ['miniChefFarms', chainId] : null,
    (_, chainId) => getMiniChefFarms(chainId),
    swrConfig
  )
  return useMemo(() => {
    if (!data) return []
    // @ts-ignore TYPE NEEDS FIXING
    return data.map((data) => ({ ...data, chef: Chef.MINICHEF }))
  }, [data])
}

export function useFarms({ chainId, swrConfig = undefined }: useFarmsProps) {
  const DialerContractFarms = useDialerContractFarms({ chainId })
  // const miniChefFarms = useMiniChefFarms({ chainId })
  // const oldMiniChefFarms = useOldMiniChefFarms()
  return useMemo(
    () => DialerContractFarms.filter((pool: any) => pool && pool.pair),
    // () => concat(DialerContractFarms, miniChefFarms, oldMiniChefFarms).filter((pool) => pool && pool.pair),
    [DialerContractFarms]
    // [DialerContractFarms, miniChefFarms, oldMiniChefFarms]
  )
}

export function useMasterChefV1PairAddresses() {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && chainId === ChainId.MAINNET
  return useSWR(shouldFetch ? ['masterChefV1PairAddresses', chainId] : null, (_) => getMasterChefV1PairAddreses())
}

export function useDialerContractPairAddresses() {
  const { chainId } = useActiveWeb3React()
  const shouldFetch = chainId && chainId === ChainId.MAINNET
  return useSWR(shouldFetch ? ['DialerContractPairAddresses', chainId] : null, (_) => getDialerContractPairAddreses())
}

export function useMiniChefPairAddresses() {
  const { chainId } = useActiveWeb3React()
  const shouldFetch =
    chainId &&
    [
      ChainId.MATIC,
      ChainId.XDAI,
      ChainId.HARMONY,
      ChainId.ARBITRUM_ONE,
      ChainId.CELO,
      ChainId.MOONRIVER,
      ChainId.FUSE,
      ChainId.FANTOM,
    ].includes(chainId)
  return useSWR(shouldFetch ? ['miniChefPairAddresses', chainId] : null, (_, chainId) =>
    getMiniChefPairAddreses(chainId)
  )
}

export function useFarmPairAddresses() {
  const { data: masterChefV1PairAddresses } = useMasterChefV1PairAddresses()
  const { data: DialerContractPairAddresses } = useDialerContractPairAddresses()
  const { data: miniChefPairAddresses } = useMiniChefPairAddresses()
  return useMemo(
    () => concat(masterChefV1PairAddresses ?? [], DialerContractPairAddresses ?? [], miniChefPairAddresses ?? []),
    [masterChefV1PairAddresses, DialerContractPairAddresses, miniChefPairAddresses]
  )
}
