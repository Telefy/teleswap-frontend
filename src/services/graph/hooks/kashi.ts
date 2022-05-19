import { ChainId } from '@telefy/teleswap-core-sdk'
import { getKashiPairs } from 'services/graph/fetchers'
import stringify from 'fast-json-stable-stringify'
import useSWR from 'swr'

import { GraphProps } from '../interfaces'

export function useKashiPairs({
  chainId = ChainId.MAINNET,
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: GraphProps) {
  return useSWR(
    shouldFetch ? () => ['kashiPairs', chainId, stringify(variables)] : null,
    // @ts-ignore
    (_, chainId) => getKashiPairs(chainId, variables),
    swrConfig
  )
}
