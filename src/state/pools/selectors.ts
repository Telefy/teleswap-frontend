/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createSelector } from '@reduxjs/toolkit'
import { PoolsState, State, VaultKey, SerializedCakeVault } from '../types'
import { transformPool, transformLockedVault } from './helpers'
import { initialPoolVaultState } from './index'

const selectPoolsData = (state: State) => {
  return state.pools.data
}
const selectPoolData = (sousId: number) => (state: State) => state.pools.data.find((p) => p.sousId === sousId)
const selectUserDataLoaded = (state: State) => state.pools.userDataLoaded
const selectVault = (key: VaultKey) => (state: State) =>
  key ? state.pools[key as unknown as keyof PoolsState] : initialPoolVaultState

export const makePoolWithUserDataLoadingSelector = (sousId: number, chainId: number) =>
  createSelector([selectPoolData(sousId), selectUserDataLoaded], (pool, userDataLoaded) => {
    return { pool: transformPool(pool!, chainId), userDataLoaded }
  })

export const poolsWithUserDataLoadingSelector = createSelector(
  [selectPoolsData, selectUserDataLoaded],
  (pools, userDataLoaded) => {
    return { pools: pools.map(transformPool), userDataLoaded }
  }
)

export const makeVaultPoolByKey = (key: VaultKey) =>
  createSelector([selectVault(key)], (vault) => transformLockedVault(vault as SerializedCakeVault))

export const poolsWithVaultSelector = createSelector(
  [poolsWithUserDataLoadingSelector, makeVaultPoolByKey(VaultKey.TeleVault)],
  (poolsWithUserDataLoading, deserializedCakeVault) => {
    const { pools, userDataLoaded } = poolsWithUserDataLoading
    const cakePool = pools.find((pool) => !pool.isFinished && pool.sousId === 0)
    const withoutCakePool = pools.filter((pool) => pool.sousId !== 0)

    const cakeAutoVault = {
      ...cakePool,
      ...deserializedCakeVault,
      vaultKey: VaultKey.TeleVault,
      userData: { ...cakePool?.userData, ...deserializedCakeVault.userData },
    }

    const cakeAutoVaultWithApr = {
      ...cakeAutoVault,
    }
    return { pools: [cakeAutoVaultWithApr, ...withoutCakePool], userDataLoaded }
  }
)
