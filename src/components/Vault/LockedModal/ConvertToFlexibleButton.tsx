/* eslint-disable react/react-in-jsx-scope */
import { memo, useCallback } from 'react'

import { useAppDispatch } from 'state/hooks'
import { fetchCakeVaultUserData } from 'state/pools'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useTelePoolContract } from 'hooks/useContract'
import { vaultPoolConfig } from 'constants/pools'
import { VaultKey } from 'state/types'
import { useActiveWeb3React } from 'hooks/web3'
import Button, { ButtonProps } from 'farm-components/Button'
import { ZERO_ADDRESS } from 'constants/misc'

const ConvertToFlexibleButton: React.FC<ButtonProps> = (props) => {
  const dispatch = useAppDispatch()

  const { account } = useActiveWeb3React()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const vaultPoolContract = useTelePoolContract()
  const { callWithGasPrice } = useCallWithGasPrice()

  const handleUnlock = useCallback(async () => {
    const callOptions = {
      gasLimit: vaultPoolConfig[VaultKey.TeleVault].gasLimit,
    }
    if (vaultPoolContract) {
      const receipt = await fetchWithCatchTxError(() => {
        const methodArgs = [account]
        return callWithGasPrice(vaultPoolContract, 'unlock', methodArgs, callOptions)
      }, 'Staked! Your funds have been staked in the pool')

      if (receipt?.status) {
        // dispatch(fetchCakeVaultUserData({ account || ZERO_ADDRESS }))
      }
    }
  }, [account, callWithGasPrice, fetchWithCatchTxError, vaultPoolContract])

  return (
    <Button disabled={pendingTx} onClick={() => handleUnlock()}>
      {pendingTx ? 'Converting...' : 'Convert to Flexible'}
    </Button>
  )
}

export default memo(ConvertToFlexibleButton)
