/* eslint-disable react/react-in-jsx-scope */
import { DeserializedPool } from 'state/types'
import { useVaultApy } from 'hooks/useVaultApy'
import RecentCakeProfitRow from 'pages/telestake/RecentCakeProfitRow'

function FlexibleApyComponent({ pool }: { pool: DeserializedPool }) {
  const { flexibleApy } = useVaultApy()

  return (
    <div className="apy-block">
      <div className="box-content-top">
        <div className="box-content-top-item">
          <div>APY :</div> <div className="bold">{parseFloat(flexibleApy || '0').toFixed(2)}%</div>
        </div>
        <RecentCakeProfitRow pool={pool} />
      </div>
    </div>
  )
}
export default FlexibleApyComponent
