import { useState, useCallback, Dispatch, SetStateAction } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useAppDispatch } from 'state/hooks'
import _noop from 'lodash/noop'
import { useUSDCTeleAmount } from 'hooks/useUSDCPrice'
import { useTelePoolContract } from 'hooks/useContract'
import BigNumber from 'bignumber.js'
import { getDecimalAmount } from 'utils/formatBalance'
import useCatchTxError from 'hooks/useCatchTxError'
import { fetchCakeVaultUserData } from 'state/pools'
import { ONE_WEEK_DEFAULT, vaultPoolConfig } from 'constants/pools'
import { VaultKey } from 'state/types'

import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { PrepConfirmArg } from 'constants/types'
import { Token } from '@telefy/teleswap-core-sdk'

interface HookArgs {
  lockedAmount: BigNumber
  stakingToken: Token
  onDismiss: () => void
  prepConfirmArg?: PrepConfirmArg
}

interface HookReturn {
  usdValueStaked: number
  duration: number
  setDuration: Dispatch<SetStateAction<number>>
  pendingTx: boolean
  handleConfirmClick: () => Promise<void>
}

export default function useLockedPool(hookArgs: HookArgs): HookReturn {
  const { lockedAmount, stakingToken, onDismiss, prepConfirmArg } = hookArgs

  const { account } = useWeb3React()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const vaultPoolContract = useTelePoolContract()
  const { callWithGasPrice } = useCallWithGasPrice()

  const [duration, setDuration] = useState(ONE_WEEK_DEFAULT)
  const usdValueStaked = useUSDCTeleAmount(lockedAmount.toNumber())

  const handleDeposit = useCallback(
    async (convertedStakeAmount: BigNumber, lockDuration: number) => {
      const callOptions = {
        gasLimit: vaultPoolConfig[VaultKey.TeleVault].gasLimit,
      }
      if (vaultPoolContract) {
        const receipt = await fetchWithCatchTxError(() => {
          // .toString() being called to fix a BigNumber error in prod
          // as suggested here https://github.com/ChainSafe/web3.js/issues/2077
          const methodArgs = [convertedStakeAmount.toString(), lockDuration]
          return callWithGasPrice(vaultPoolContract, 'deposit', methodArgs, callOptions)
        }, 'Staked! Your funds have been staked in the pool')

        if (receipt?.status) {
          onDismiss?.()
          // dispatch(fetchCakeVaultUserData({ account }))
        }
      }
    },
    [fetchWithCatchTxError, onDismiss, vaultPoolContract, callWithGasPrice]
  )

  const handleConfirmClick = useCallback(async () => {
    const { finalLockedAmount = lockedAmount, finalDuration = duration } =
      typeof prepConfirmArg === 'function' ? prepConfirmArg({ duration }) : {}

    const convertedStakeAmount: BigNumber = getDecimalAmount(new BigNumber(finalLockedAmount), stakingToken.decimals)

    handleDeposit(convertedStakeAmount, finalDuration)
  }, [prepConfirmArg, stakingToken, handleDeposit, duration, lockedAmount])

  return { usdValueStaked: usdValueStaked || 0, duration, setDuration, pendingTx, handleConfirmClick }
}
