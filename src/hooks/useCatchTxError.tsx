import { useCallback, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { useAppDispatch } from 'state/hooks'
import { addTransaction } from 'state/transactions/actions'
import { logError, isUserRejected } from 'utils/sentry'

export type TxResponse = TransactionResponse | null

export type CatchTxErrorReturn = {
  fetchWithCatchTxError: (fn: () => Promise<TxResponse>, summary: string) => Promise<TransactionReceipt | null>
  loading: boolean
}

type ErrorData = {
  code: number
  message: string
}

type TxError = {
  data: ErrorData
  error: string
}

// -32000 is insufficient funds for gas * price + value
const isGasEstimationError = (err: TxError): boolean => err?.data?.code === -32000

export default function useCatchTxError(): CatchTxErrorReturn {
  const { chainId, account, library } = useWeb3React()
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const handleNormalError = useCallback(
    (error, tx?: TxResponse) => {
      logError(error)

      if (chainId && account) {
        if (tx) {
          dispatch(
            addTransaction({
              hash: tx.hash,
              from: account,
              chainId,
              approval: undefined,
              summary: 'Please try again. Confirm the transaction and make sure you are paying enough gas!',
              claim: undefined,
            })
          )
        } else {
          dispatch(
            addTransaction({
              hash: '',
              from: account,
              chainId,
              approval: undefined,
              summary: 'Please try again. Confirm the transaction and make sure you are paying enough gas!',
              claim: undefined,
            })
          )
        }
      }
    },
    [account, chainId, dispatch]
  )

  const fetchWithCatchTxError = useCallback(
    async (callTx: () => Promise<TxResponse>, summary: string): Promise<TransactionReceipt | null> => {
      let tx: TxResponse = null

      try {
        setLoading(true)

        /**
         * https://github.com/vercel/swr/pull/1450
         *
         * wait for useSWRMutation finished, so we could apply SWR in case manually trigger tx call
         */
        tx = await callTx()
        if (tx && account && chainId) {
          dispatch(
            addTransaction({
              hash: tx.hash,
              from: account,
              chainId,
              approval: undefined,
              summary,
              claim: undefined,
            })
          )
          const receipt = await tx.wait()

          return receipt
        }
      } catch (error: any) {
        if (!isUserRejected(error)) {
          if (!tx) {
            handleNormalError(error)
          } else {
            library
              .call(tx, tx.blockNumber)
              .then(() => {
                handleNormalError(error, tx)
              })
              .catch((err: any) => {
                if (isGasEstimationError(err)) {
                  handleNormalError(error, tx)
                } else {
                  logError(err)

                  let recursiveErr = err

                  let reason: string | undefined

                  // for MetaMask
                  if (recursiveErr?.data?.message) {
                    reason = recursiveErr?.data?.message
                  } else {
                    // for other wallets
                    // Reference
                    // https://github.com/Uniswap/interface/blob/ac962fb00d457bc2c4f59432d7d6d7741443dfea/src/hooks/useSwapCallback.tsx#L216-L222
                    while (recursiveErr) {
                      reason = recursiveErr.reason ?? recursiveErr.message ?? reason
                      recursiveErr = recursiveErr.error ?? recursiveErr.data?.originalError
                    }
                  }

                  const REVERT_STR = 'execution reverted: '
                  const indexInfo = reason?.indexOf(REVERT_STR)
                  const isRevertedError = indexInfo ? indexInfo >= 0 : false

                  if (isRevertedError) reason = reason?.substring(indexInfo ? indexInfo + REVERT_STR.length : 0)

                  const summaryErr = isRevertedError
                    ? `Transaction failed with error: ${reason}`
                    : 'Transaction failed. For detailed error message:'
                  if (tx && account && chainId)
                    dispatch(
                      addTransaction({
                        hash: tx.hash,
                        from: account,
                        chainId,
                        approval: undefined,
                        summary: summaryErr,
                        claim: undefined,
                      })
                    )
                }
              })
          }
        }
      } finally {
        setLoading(false)
      }

      return null
    },
    [account, chainId, dispatch, handleNormalError, library]
  )

  return {
    fetchWithCatchTxError,
    loading,
  }
}
