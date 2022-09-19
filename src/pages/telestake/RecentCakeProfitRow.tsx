/* eslint-disable react/react-in-jsx-scope */
import { ChainId } from '@telefy/teleswap-core-sdk'
import { formatNumberDecimals, toAmount } from 'functions'
import { useActiveWeb3React } from 'hooks/web3'
import { useTelePrice } from 'services/graph'
import { useVaultPoolByKey } from 'state/pools/hooks'
import { DeserializedLockedVaultUser, DeserializedPool, VaultKey } from 'state/types'
import { BIG_ZERO } from 'utils/bigNumber'
import { getCakeVaultEarnings } from './helpers'

const RecentCakeProfitCountdownRow = ({ pool }: { pool: DeserializedPool }) => {
  const { account, chainId } = useActiveWeb3React()
  const { pricePerFullShare, userData } = useVaultPoolByKey(pool.vaultKey as VaultKey)
  const { teleAtLastUserAction, userShares, currentOverdueFee, currentPerformanceFee } =
    userData as DeserializedLockedVaultUser
  const { data: telePrice } = useTelePrice(chainId || ChainId.MAINNET)
  const { hasAutoEarnings, autoCakeToDisplay } = getCakeVaultEarnings(
    account || '',
    teleAtLastUserAction,
    userShares,
    pricePerFullShare || BIG_ZERO,
    telePrice,
    currentPerformanceFee.plus(currentOverdueFee)
  )

  if (!(userShares.gt(0) && account)) {
    return null
  }

  return (
    <div className="box-content-top-item">
      <div>Recent TELE Profit :</div>{' '}
      <div className="bold">{hasAutoEarnings && formatNumberDecimals(autoCakeToDisplay, 5)}</div>
    </div>
  )
}

export default RecentCakeProfitCountdownRow
