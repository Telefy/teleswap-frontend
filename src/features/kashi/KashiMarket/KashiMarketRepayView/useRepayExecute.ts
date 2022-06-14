/* eslint-disable prettier/prettier */
import { defaultAbiCoder } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { hexConcat, hexlify } from '@ethersproject/bytes'
import { AddressZero } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import {
  Currency,
  CurrencyAmount,
  KASHI_ADDRESS,
  TELESWAP_MULTI_EXACT_SWAPPER_ADDRESS,
  TradeType,
  toShare,
} from '@telefy/teleswap-core-sdk'
import JSBI from 'jsbi'
import { Trade as LegacyTrade } from '@mazelon/teleswap-sdk'
import KashiCooker from 'entities/KashiCooker'
import { useKashiMarket } from 'features/kashi/KashiMarket'
import { ZERO as BigNumberZERO } from 'functions'
import { useActiveWeb3React } from 'hooks/web3'
import { useAppSelector } from 'state/hooks'
import { selectSlippage } from 'state/slippage/slippageSlice'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useCallback } from 'react'

const ZERO = JSBI.BigInt(0)

export interface RepayExecutePayload {
  repayAmount?: CurrencyAmount<Currency>
  removeAmount?: CurrencyAmount<Currency>
  repayFromWallet: boolean
  removeToWallet: boolean
  closePosition: boolean
  trade?: LegacyTrade<Currency, Currency, TradeType.EXACT_OUTPUT>
  removeMax: boolean
  repayMax: boolean
}

type UseRepayExecute = () => (x: RepayExecutePayload) => Promise<TransactionResponse | undefined>

export const useRepayExecute: UseRepayExecute = () => {
  const { i18n } = useLingui()
  const { account, library, chainId } = useActiveWeb3React()
  const masterContract = chainId && KASHI_ADDRESS[chainId]
  const addTransaction = useTransactionAdder()
  const allowedSlippage = useAppSelector(selectSlippage)
  const { market } = useKashiMarket()

  return useCallback(
    async ({
      trade,
      repayAmount,
      removeAmount,
      removeMax,
      repayMax,
      removeToWallet,
      repayFromWallet,
      closePosition,
    }) => {
      if (!account || !library || !chainId || !masterContract) {
        console.error('Dependencies unavailable')
        return
      }

      const cooker = new KashiCooker(market, account, library, chainId)

      if (closePosition && trade) {
        const borrowed = CurrencyAmount.fromRawAmount(market.asset.token, market.userBorrowPart)
        const amountIn = trade.maximumAmountIn(allowedSlippage)
        const path = trade.route.path.map((token) => token.address) || []

        cooker.removeCollateral(BigNumber.from(market.userCollateralShare.toString()), true)
        cooker.bentoTransferCollateral(
          BigNumber.from(market.userCollateralShare.toString()),
          TELESWAP_MULTI_EXACT_SWAPPER_ADDRESS[chainId || 1]
        )
        cooker.repayShare(BigNumber.from(market.userBorrowPart.toString()))
        cooker.action(
          TELESWAP_MULTI_EXACT_SWAPPER_ADDRESS[chainId || 1],
          BigNumberZERO,
          hexConcat([
            hexlify('0x3087d742'),
            defaultAbiCoder.encode(
              ['address', 'address', 'uint256', 'address', 'address', 'address', 'uint256'],
              [
                market.collateral.token.address,
                market.asset.token.address,
                amountIn.quotient.toString(),
                path.length > 2 ? path[1] : AddressZero,
                path.length > 3 ? path[2] : AddressZero,
                account,
                BigNumber.from(market.userCollateralShare.toString()),
              ]
            ),
          ]),
          true,
          false,
          1
        )

        cooker.repayPart(BigNumber.from(market.userBorrowPart.toString()), true)

        if (removeToWallet) {
          cooker.bentoWithdrawCollateral(BigNumberZERO, BigNumber.from(-1))
        }

        // Batch all actions
        const result = await cooker.cook()

        if (result.success) {
          addTransaction(result.tx, {
            summary: i18n._(
              t`Repay ${borrowed.toSignificant(6)} ${borrowed.currency.symbol} using ${amountIn.toSignificant(6)} ${amountIn.currency.symbol
                } as collateral`
            ),
          })

          return result.tx
        }
      } else {
        let summary
        if (repayMax && JSBI.greaterThan(market.userBorrowPart, JSBI.BigInt(0))) {
          cooker.repayPart(BigNumber.from(market.userBorrowPart.toString()), !repayFromWallet)
          summary = 'Repay max'
        } else if (repayAmount?.greaterThan(ZERO)) {
          cooker.repay(BigNumber.from(repayAmount.quotient.toString()), !repayFromWallet)
          summary = 'Repay'
        }

        let share
        if (removeMax) {
          share = market.userCollateralShare
          summary = 'and remove max collateral'
        } else if (removeAmount?.greaterThan(ZERO)) {
          share = toShare(market.collateral, removeAmount.quotient)
          summary = 'and remove collateral'
        }

        if (share) {
          cooker.removeCollateral(BigNumber.from(share.toString()), !removeToWallet)
        }

        const result = await cooker.cook()
        if (result.success) {
          addTransaction(result.tx, { summary })
          return result.tx
        }
      }

      return undefined
    },
    [account, addTransaction, allowedSlippage, chainId, i18n, library, market, masterContract]
  )
}