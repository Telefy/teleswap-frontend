/* eslint-disable react/react-in-jsx-scope */
import React, { memo, useEffect, useRef, useState } from 'react'
import { DeserializedPool } from 'state/types'
import { useVaultApy } from 'hooks/useVaultApy'
import { CountUp } from 'use-count-up'

function StakingApyComponent({ pool }: { pool: DeserializedPool }) {
  const { flexibleApy, lockedApy } = useVaultApy()
  const flexPreviousValue = useRef(0)
  const lockPreviousValue = useRef(0)
  useEffect(() => {
    flexPreviousValue.current = parseFloat(flexibleApy || '0')
  }, [flexibleApy])
  useEffect(() => {
    lockPreviousValue.current = parseFloat(lockedApy || '0')
  }, [lockedApy])

  return (
    <div className="box-content-top">
      <div className="box-content-top-item">
        <div>Flexible Staking APY :</div>
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
      <div className="box-content-top-item">
        <div>Locked Staking APY :</div>{' '}
        <div className="bold">
          <span className="font-normal">Up to&nbsp;</span>
          <CountUp
            start={lockPreviousValue.current}
            end={parseFloat(lockedApy || '0')}
            suffix="%"
            decimalPlaces={2}
            duration={1}
            thousandsSeparator=","
          />
        </div>
      </div>
    </div>
  )
}
export default StakingApyComponent
