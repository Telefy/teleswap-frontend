import { Currency, TradeType } from '@telefy/teleswap-core-sdk'
import { Trade as V2Trade } from '@mazelon/teleswap-sdk'
import { Trade as V3Trade } from '@mazelon/teleswap-v3-sdk'
import { Version } from '../hooks/useToggledVersion'

export function getTradeVersion(
  trade?: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
): Version | undefined {
  if (!trade) return undefined
  if (trade instanceof V2Trade) return Version.v2
  return Version.v3
}
