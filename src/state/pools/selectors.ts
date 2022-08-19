/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createSelector } from '@reduxjs/toolkit'
import { PoolsState, State, VaultKey, SerializedCakeVault, DeserializedPool } from '../types'
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

export const poolsWithUserDataLoadingSelector = (chainId: number) =>
  createSelector([selectPoolsData, selectUserDataLoaded], (pools, userDataLoaded) => {
    return { pools: pools.map((pool) => transformPool(pool, chainId)), userDataLoaded }
  })

export const makeVaultPoolByKey = (key: VaultKey) =>
  createSelector([selectVault(key)], (vault) => transformLockedVault(vault as SerializedCakeVault))

export const poolsWithVaultSelector = (chainId: number) =>
  createSelector(
    [poolsWithUserDataLoadingSelector(chainId), makeVaultPoolByKey(VaultKey.TeleVault)],
    (poolsWithUserDataLoading, deserializedCakeVault) => {
      const { pools, userDataLoaded } = poolsWithUserDataLoading
      const cakePool = pools.find((pool) => !pool.isFinished && pool.sousId === 0)
      const withoutCakePool = pools.filter((pool) => pool.sousId !== 0)

      const cakeAutoVault = {
        ...cakePool,
        ...deserializedCakeVault,
        vaultKey: VaultKey.TeleVault,
        userData:
          cakePool && cakePool.userData && deserializedCakeVault.userData
            ? {
                ...cakePool.userData,
                ...deserializedCakeVault.userData,
              }
            : undefined,
      }

      return { pools: [cakeAutoVault as DeserializedPool, ...withoutCakePool], userDataLoaded }
    }
  )
