/* eslint-disable react/react-in-jsx-scope */
import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { SerializedPoolConfig, PoolCategory } from './types'
import { TELE, TELE_POOL_ADDRESS } from '@telefy/teleswap-core-sdk'

export const MAX_LOCK_DURATION = 31536000
export const UNLOCK_FREE_DURATION = 604800
export const ONE_WEEK_DEFAULT = 604800
export const BOOST_WEIGHT = BigNumber.from('20000000000000')
export const DURATION_FACTOR = BigNumber.from('31536000')

export const vaultPoolConfig = {
  teleVault: {
    name: <Trans>Stake TELE</Trans>,
    description: <Trans>Stake, Earn – And more!</Trans>,
    autoCompoundFrequency: 5000,
    gasLimit: 500000,
    tokenImage: {
      primarySrc: `/images/telecoin.svg`,
      secondarySrc: '/images/telecoin.svg',
    },
  },
} as const

const pools: SerializedPoolConfig[] = [
  {
    sousId: 0,
    stakingToken: TELE,
    earningToken: TELE,
    contractAddress: TELE_POOL_ADDRESS,
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '10',
    sortOrder: 1,
    isFinished: false,
  },
]

export default pools
