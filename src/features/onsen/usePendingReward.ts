/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId } from '@telefy/teleswap-core-sdk'
import { Fraction } from 'entities/bignumber'
import { useCloneRewarderContract, useComplexRewarderContract } from 'hooks/useContract'
import { useBlockNumber } from 'state/application/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useEffect, useMemo, useState } from 'react'
import { AddressZero } from '@ethersproject/constants'
import { isAddress } from 'functions/validate'
import { Chef } from './enum'

// @ts-ignore TYPE NEEDS FIXING
const usePending = (farm) => {
  const [balance, setBalance] = useState<string>('0')

  const { chainId, account, library } = useActiveWeb3React()
  const currentBlockNumber = useBlockNumber()
  let cloneRewarder: Contract | null = null
  let complexRewarder: Contract | null = null
  if (isAddress(farm?.rewarder?.id) && farm?.rewarder?.id !== AddressZero) {
    cloneRewarder = useCloneRewarderContract(farm?.rewarder?.id)
    complexRewarder = useComplexRewarderContract(farm?.rewarder?.id)
  }

  const contract = useMemo(
    () => ({
      [ChainId.MAINNET]: cloneRewarder,
      [ChainId.MATIC]: complexRewarder,
      [ChainId.XDAI]: complexRewarder,
      [ChainId.HARMONY]: complexRewarder,
      [ChainId.ARBITRUM_ONE]: cloneRewarder,
      [ChainId.CELO]: complexRewarder,
      [ChainId.MOONRIVER]: complexRewarder,
      [ChainId.FUSE]: complexRewarder,
      [ChainId.FANTOM]: complexRewarder,
      [ChainId.MOONBEAM]: complexRewarder,
    }),
    [complexRewarder, cloneRewarder]
  )

  useEffect(() => {
    async function fetchPendingReward() {
      try {
        // @ts-ignore TYPE NEEDS FIXING
        const pending = await contract[chainId]?.pendingTokens(farm.id, account, '0')
        // todo: do not assume [0] or that rewardToken has 18 decimals (only works w/ mastechefv2 currently)
        const formatted = farm.rewardToken
          ? Fraction.from(
            BigNumber.from(pending?.rewardAmounts[0]),
            BigNumber.from(10).pow(farm.rewardToken.decimals || 18)
          ).toString(farm.rewardToken.decimals || 18)
          : Fraction.from(BigNumber.from(pending?.rewardAmounts[0]), BigNumber.from(10).pow(18)).toString(18)
        setBalance(formatted)
      } catch (error) {
        console.error(error)
      }
    }
    // id = 0 is evaluated as false
    if (
      account &&
      cloneRewarder &&
      farm &&
      library &&
      (farm.chef === Chef.DIALER_CONTRACT || farm.chef === Chef.MINICHEF || farm.chef === Chef.OLD_FARMS)
    ) {
      fetchPendingReward()
    }
  }, [account, currentBlockNumber, cloneRewarder, complexRewarder, farm, library, contract, chainId])

  return balance
}

export default usePending
