import { Percent } from '@telefy/teleswap-core-sdk'
import JSBI from 'jsbi'

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}
