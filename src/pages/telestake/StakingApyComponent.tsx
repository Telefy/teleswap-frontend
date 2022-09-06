/* eslint-disable react/react-in-jsx-scope */
import React from 'react'
import { useVaultApy } from 'hooks/useVaultApy'

function StakingApyComponent() {
  const { flexibleApy, lockedApy } = useVaultApy()

  return (
    <div className="apy-block">
      <div className="box-content-top">
        <div className="box-content-top-item">
          <div>Flexible Staking APY :</div>
          <div className="bold">{parseFloat(flexibleApy || '0').toFixed(2)}%</div>
        </div>
        <div className="box-content-top-item">
          <div>Locked Staking APY :</div>{' '}
          <div className="bold">
            Up to&nbsp;
            {parseFloat(lockedApy || '0').toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}
export default StakingApyComponent
