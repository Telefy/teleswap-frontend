import { BigNumber } from '@ethersproject/bignumber'
import { useTeleContract } from 'hooks/useContract'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback } from 'react'

import { Chef } from './enum'
import { useChefContract } from './hooks'

export default function useDialerContract(chef: Chef) {
  const { account } = useActiveWeb3React()

  const tele = useTeleContract()

  const contract = useChefContract(chef)

  // Deposit
  const deposit = useCallback(
    async (pid: number, amount: BigNumber) => {
      try {
        let tx

        if (chef === Chef.DIALER_CONTRACT) {
          tx = await contract?.deposit(pid, amount, account)
        }

        return tx
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [account, chef, contract]
  )

  // Withdraw
  const withdraw = useCallback(
    async (pid: number, amount: BigNumber) => {
      try {
        let tx

        if (chef === Chef.DIALER_CONTRACT) {
          tx = await contract?.withdraw(pid, amount, account)
        } else if (chef === Chef.MINICHEF || chef === Chef.OLD_FARMS) {
          tx = await contract?.withdrawAndHarvest(pid, amount, account)
        }

        return tx
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [account, chef, contract]
  )

  const harvest = useCallback(
    async (pid: number) => {
      try {
        let tx

        if (chef === Chef.DIALER_CONTRACT) {
          const pendingTele = await contract?.pendingTele(pid, account)

          const balanceOf = await tele?.balanceOf(contract?.address)

          // If DialerContract doesn't have enough sushi to harvest, batch in a harvest.
          if (pendingTele.gt(balanceOf)) {
            tx = await contract?.batch(
              [
                contract?.interface?.encodeFunctionData('harvestFromDialerContract'),
                contract?.interface?.encodeFunctionData('harvest', [pid, account]),
              ],
              true
            )
          } else {
            tx = await contract?.harvest(pid, account)
          }
        } else if (chef === Chef.MINICHEF || chef === Chef.OLD_FARMS) {
          tx = await contract?.harvest(pid, account)
        }

        return tx
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [account, chef, contract, tele]
  )

  return { deposit, withdraw, harvest }
}
