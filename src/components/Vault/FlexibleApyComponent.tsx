/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useRef, useState } from 'react'
import { DeserializedPool } from 'state/types'
import { useVaultApy } from 'hooks/useVaultApy'
import { CountUp } from 'use-count-up'
import RecentCakeProfitRow from 'pages/telestake/RecentCakeProfitRow'

function FlexibleApyComponent({ pool }: { pool: DeserializedPool }) {
  const { flexibleApy } = useVaultApy()
  const flexPreviousValue = useRef(0)
  useEffect(() => {
    flexPreviousValue.current = parseFloat(flexibleApy || '0')
  }, [flexibleApy])

  return (
    <div className="apy-block">
      <div className="box-content-top">
        <div className="box-content-top-item">
          <div>APY :</div>{' '}
          <div className="bold">
            <CountUp
              start={flexPreviousValue.current}
              end={parseFloat(flexibleApy || '0')}
              suffix="%"
              decimalPlaces={2}
              duration={1}
              thousandsSeparator=","
            />
          </div>
        </div>
        <RecentCakeProfitRow pool={pool} />
      </div>
    </div>
  )
}
export default FlexibleApyComponent
