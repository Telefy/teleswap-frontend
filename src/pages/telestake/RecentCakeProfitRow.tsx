/* eslint-disable react/react-in-jsx-scope */
// import { usePriceCakeBusd } from 'state/farms/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useVaultPoolByKey } from 'state/pools/hooks'
import { DeserializedLockedVaultUser, DeserializedPool, VaultKey } from 'state/types'
import { BIG_ZERO } from 'utils/bigNumber'
import { getCakeVaultEarnings } from './helpers'

const RecentCakeProfitCountdownRow = ({ pool }: { pool: DeserializedPool }) => {
  const { account } = useActiveWeb3React()
  const { pricePerFullShare, userData } = useVaultPoolByKey(pool.vaultKey as VaultKey)
  const { teleAtLastUserAction, userShares, currentOverdueFee, currentPerformanceFee } =
    userData as DeserializedLockedVaultUser
  // const cakePriceBusd = usePriceCakeBusd()
  const { hasAutoEarnings, autoCakeToDisplay } = getCakeVaultEarnings(
    account || '',
    teleAtLastUserAction,
    userShares,
    pricePerFullShare || BIG_ZERO,
    // cakePriceBusd.toNumber(),
    0.2,
    currentPerformanceFee.plus(currentOverdueFee)
  )

  if (!(userShares.gt(0) && account)) {
    return null
  }

  return (
    <div className="box-content-top-item">
      <div>Recent TELE Profit :</div> <div className="bold">{hasAutoEarnings && autoCakeToDisplay}</div>
    </div>
  )
}

export default RecentCakeProfitCountdownRow
