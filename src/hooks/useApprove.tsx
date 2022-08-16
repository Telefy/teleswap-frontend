/* eslint-disable react/react-in-jsx-scope */
import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { MaxUint256 } from '@ethersproject/constants'
import { useTeleContract, useTelePoolContract } from 'hooks/useContract'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import useCatchTxError from 'hooks/useCatchTxError'
import { useSWRContract, UseSWRContractKey } from 'hooks/useSWRContract'
import { useTransactionAdder, useHasPendingApproval } from '../state/transactions/hooks'
import { useAppDispatch } from 'state/hooks'
import { addTransaction } from 'state/transactions/actions'

// Approve TELE auto pool
export const useVaultApprove = (setLastUpdated: () => void) => {
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const vaultPoolContract = useTelePoolContract()
  const { callWithGasPrice } = useCallWithGasPrice()
  const teleContract = useTeleContract()
  const dispatch = useAppDispatch()

  const handleApprove = async () => {
    let receipt: any
    if (vaultPoolContract && teleContract) {
      receipt = await fetchWithCatchTxError(() => {
        return callWithGasPrice(teleContract, 'approve', [vaultPoolContract.address, MaxUint256])
      }, 'Contract Enabled! You can now stake in the TELE vault!')
      if (receipt?.status) {
        setLastUpdated()
      }
    }
  }

  return { handleApprove, pendingTx }
}

export const useCheckVaultApprovalStatus = () => {
  const { account } = useWeb3React()
  const teleContract = useTeleContract()
  const vaultPoolContract = useTelePoolContract()

  const key = useMemo<UseSWRContractKey>(
    () =>
      account
        ? {
            contract: teleContract,
            methodName: 'allowance',
            params: [account, vaultPoolContract?.address],
          }
        : null,
    [account, teleContract, vaultPoolContract?.address]
  )

  const { data, mutate } = useSWRContract(key)

  return { isVaultApproved: data ? data.gt(0) : false, setLastUpdated: mutate }
}
