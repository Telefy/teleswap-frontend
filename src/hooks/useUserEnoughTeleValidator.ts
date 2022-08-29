import BigNumber from 'bignumber.js'
import { getBalanceAmount } from 'utils/formatBalance'

import { useMemo } from 'react'

export const useUserEnoughTeleValidator = (TeleAmount: string, stakingTokenBalance: BigNumber) => {
  const errorMessage = 'Insufficient TELE balance'

  const userNotEnoughTele = useMemo(() => {
    if (new BigNumber(TeleAmount).gt(getBalanceAmount(stakingTokenBalance, 18))) return true
    return false
  }, [TeleAmount, stakingTokenBalance])
  return { userNotEnoughTele, notEnoughErrorMessage: errorMessage }
}
