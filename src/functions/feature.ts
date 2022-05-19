import { ChainId } from '@telefy/teleswap-core-sdk'
import features from 'config/features'
import { Feature } from 'enums'

export function featureEnabled(feature: Feature, chainId: ChainId = ChainId.MAINNET): boolean {
  // @ts-ignore TYPE NEEDS FIXING
  return chainId && chainId in features && features[chainId].includes(feature)
}

export function chainsWithFeature(feature: Feature): ChainId[] {
  return (
    Object.keys(features)
      // @ts-ignore TYPE NEEDS FIXING
      .filter((chainKey) => featureEnabled(feature, ChainId[chainKey]))
      // @ts-ignore TYPE NEEDS FIXING
      .map((chain) => ChainId[chain])
  )
}
