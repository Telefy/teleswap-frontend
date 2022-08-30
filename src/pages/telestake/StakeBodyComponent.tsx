/* eslint-disable react/react-in-jsx-scope */
import { useMemo, useState, useCallback } from 'react'
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import { Input } from 'reactstrap'
import { useActiveWeb3React } from 'hooks/web3'
import { usePoolsWithVault } from 'state/pools/hooks'
import StakingCommonApy from './StakingApyComponent'
import {
  DeserializedLockedVaultUser,
  DeserializedPool,
  DeserializedPoolVault,
  DeserializedVaultFees,
} from 'state/types'
import orderBy from 'lodash/orderBy'
import partition from 'lodash/partition'
import { getCakeVaultEarnings } from 'utils/poolHelpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { formatUnits } from 'ethers/lib/utils'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import { useUserPoolStakedOnly } from 'state/user/hooks'
import { useInitialBlock } from 'state/block/hooks'
import { latinise } from 'utils/latinise'
import BigNumber from 'bignumber.js'
import { useLocation } from 'react-router-dom'
import { useAverageBlockTime } from 'services/graph'
import { ChainId } from '@telefy/teleswap-core-sdk'
import { useVaultPoolByKey } from 'state/pools/hooks'
import VaultCardActions from './VaultCardActions'
import { VaultPositionTagWithLabel } from 'components/Vault/VaultPositionTag'
import { StakingApyBodyComponent } from 'components/Vault/StakingApyBodyComponent'
import PoolStatsInfo from './PoolStatsInfo'
import { ZERO_ADDRESS } from 'constants/misc'

const NUMBER_OF_POOLS_VISIBLE = 12

function StakeBodyComponent({ isStakedAlready, toggleWalletModal, unStakeModal, stakeModal, convertLockedModal }: any) {
  const darkMode = useIsDarkMode()
  const { account, chainId } = useActiveWeb3React()
  const { pools, userDataLoaded } = usePoolsWithVault(chainId || ChainId.MAINNET)
  const [sortOption, setSortOption] = useState('hot')
  const [numberOfPoolsVisible, setNumberOfPoolsVisible] = useState(NUMBER_OF_POOLS_VISIBLE)
  const [searchQuery, setSearchQuery] = useState('')
  const [stakedOnly, setStakedOnly] = useUserPoolStakedOnly()
  const initialBlock = useInitialBlock()
  const location = useLocation()
  const { data: averageBlockTime } = useAverageBlockTime({ chainId })

  const POOL_START_BLOCK_THRESHOLD = (60 / averageBlockTime) * 4
  const showFinishedPools = location.pathname.includes('history')

  const [finishedPools, openPools] = useMemo(() => partition(pools, (pool) => pool.isFinished), [pools])
  const openPoolsWithStartBlockFilter = useMemo(
    () =>
      openPools.filter((pool) =>
        initialBlock > 0 && pool.startBlock ? Number(pool.startBlock) < initialBlock + POOL_START_BLOCK_THRESHOLD : true
      ),
    [initialBlock, openPools]
  )
  const stakedOnlyFinishedPools = useMemo(
    () =>
      finishedPools.filter((pool) => {
        if (pool.vaultKey) {
          const vault = pool as DeserializedPoolVault
          return vault.userData?.userShares && vault.userData.userShares.gt(0)
        }
        return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
      }),
    [finishedPools]
  )
  const stakedOnlyOpenPools = useCallback(() => {
    return openPoolsWithStartBlockFilter.filter((pool) => {
      if (pool.vaultKey) {
        const vault = pool as DeserializedPoolVault
        return vault.userData?.userShares && vault.userData.userShares.gt(0)
      }
      return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
    })
  }, [openPoolsWithStartBlockFilter])

  let chosenPools: any
  if (showFinishedPools) {
    chosenPools = stakedOnly ? stakedOnlyFinishedPools : finishedPools
  } else {
    chosenPools = stakedOnly ? stakedOnlyOpenPools() : openPoolsWithStartBlockFilter
  }

  chosenPools = useMemo(() => {
    const sortedPools = sortPools(account || '', sortOption, pools, chosenPools).slice(0, numberOfPoolsVisible)

    if (searchQuery) {
      const lowercaseQuery = latinise(searchQuery.toLowerCase())
      return sortedPools.filter((pool) =>
        latinise(pool.earningToken.symbol?.toLowerCase() || '').includes(lowercaseQuery)
      )
    }
    return sortedPools
  }, [account, sortOption, pools, chosenPools, numberOfPoolsVisible, searchQuery])

  const vaultPool = useVaultPoolByKey(chosenPools.length ? chosenPools[0].vaultKey : 'teleVault')
  const { userData, fees } = vaultPool
  const { userShares, isLoading: isVaultUserDataLoading } = userData as DeserializedLockedVaultUser
  const { performanceFeeAsDecimal } = fees as DeserializedVaultFees
  const accountHasSharesStaked = userShares && userShares.gt(0)
  const isLoading = !chosenPools.length || !chosenPools[0].userData || isVaultUserDataLoading
  console.log(account, userData)
  return chosenPools.length ? (
    <div className="flex flex-col w-full items-center justify-between gap-6">
      <div className={darkMode ? 'telecard-dark' : 'telecard-light'}>
        <div className="telecard-header">
          <img src={Icon} alt="teleicon" />
          <h1 className="font-md">Tele Stake</h1>
          <p>Stake, Earn - And More!</p>
        </div>
        {!isStakedAlready && (
          <div className="telecard-content">
            {account && userData && <VaultPositionTagWithLabel userData={userData} />}
            {account && userData ? (
              <StakingApyBodyComponent userData={userData} pool={chosenPools[0]} />
            ) : (
              <StakingCommonApy pool={chosenPools[0]} />
            )}
            {account ? (
              vaultPool?.userData?.locked ? (
                <></>
              ) : (
                <VaultCardActions
                  pool={chosenPools[0]}
                  accountHasSharesStaked={accountHasSharesStaked}
                  isLoading={isLoading}
                  performanceFee={performanceFeeAsDecimal}
                />
              )
            ) : (
              <div className="connect-wal-btn">
                <div className="title">Start Earning</div>
                <Button onClick={toggleWalletModal}>Connect Wallet</Button>
              </div>
            )}
          </div>
        )}

        <div className="telecard-footer">
          <PoolStatsInfo pool={chosenPools[0]} account={account || ZERO_ADDRESS} />
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  )
}
const sortPools = (account: string, sortOption: string, pools: DeserializedPool[], poolsToSort: DeserializedPool[]) => {
  switch (sortOption) {
    case 'apr':
      // Ternary is needed to prevent pools without APR (like MIX) getting top spot
      return orderBy(poolsToSort, (pool: DeserializedPool) => (pool.apr ? pool.apr : 0), 'desc')
    case 'earned':
      return orderBy(
        poolsToSort,
        (pool: DeserializedPool) => {
          if (!pool.userData || !pool.earningTokenPrice) {
            return 0
          }

          if (pool.vaultKey) {
            const vault = pool as DeserializedPoolVault
            if (!vault.userData || !vault.userData.userShares) {
              return 0
            }
            return getCakeVaultEarnings(
              account,
              vault.userData.teleAtLastUserAction,
              vault.userData.userShares,
              vault.pricePerFullShare || BIG_ZERO,
              vault.earningTokenPrice || 0,
              vault.userData.currentOverdueFee.plus(vault.userData.currentPerformanceFee)
            ).autoUsdToDisplay
          }
          return pool.userData.pendingReward.times(pool.earningTokenPrice).toNumber()
        },
        'desc'
      )
    case 'totalStaked': {
      return orderBy(
        poolsToSort,
        (pool: DeserializedPool) => {
          let totalStaked = Number.NaN
          if (pool.vaultKey) {
            const vault = pool as DeserializedPoolVault
            if (pool.stakingTokenPrice && vault.totalCakeInVault?.isFinite()) {
              totalStaked =
                +formatUnits(EthersBigNumber.from(vault.totalCakeInVault.toString()), pool.stakingToken.decimals) *
                pool.stakingTokenPrice
            }
          } else if (pool.totalStaked?.isFinite() && pool.stakingTokenPrice) {
            totalStaked =
              +formatUnits(EthersBigNumber.from(pool.totalStaked.toString()), pool.stakingToken.decimals) *
              pool.stakingTokenPrice
          }
          return Number.isFinite(totalStaked) ? totalStaked : 0
        },
        'desc'
      )
    }
    case 'latest':
      return orderBy(poolsToSort, (pool: DeserializedPool) => Number(pool.sousId), 'desc')
    default:
      return poolsToSort
  }
}
export default StakeBodyComponent
