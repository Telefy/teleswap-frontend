import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import transactions from './transactions/reducer'
import swap from './swap/reducer'
import poolsReducer from './pools'
import mint from './mint/reducer'
import mintV3 from './mint/v3/reducer'
import lists from './lists/reducer'
import burn from './burn/reducer'
import burnV3 from './burn/v3/reducer'
import multicall from './multicall/reducer'
import onsen from 'features/onsen/onsenSlice'
import slippage from './slippage/slippageSlice'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists']
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    swap,
    pools: poolsReducer,
    mint,
    mintV3,
    burn,
    burnV3,
    multicall,
    lists,
    onsen,
    slippage,
  },
  middleware: [
    ...getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
    }),
    save({ states: PERSISTED_KEYS, debounce: 1000 }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
