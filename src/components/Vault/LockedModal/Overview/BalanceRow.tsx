/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { memo, useEffect, useRef } from 'react'
import isUndefinedOrNull from 'utils/isUndefinedOrNull'
import _toNumber from 'lodash/toNumber'

interface DiffBalancePropsType {
  value: number | string
  newValue?: number | string
  decimals: number
  prefix: string
  suffix: string
}

const DiffBalance: React.FC<DiffBalancePropsType> = ({ value, newValue, decimals, prefix, suffix }) => {
  const flexPreviousValue1 = useRef(0)
  useEffect(() => {
    flexPreviousValue1.current = parseFloat(String(value))
  }, [value])
  const flexPreviousValue2 = useRef(0)
  useEffect(() => {
    flexPreviousValue2.current = parseFloat(String(newValue))
  }, [newValue])

  if (isUndefinedOrNull(newValue) || !value || value === newValue || _toNumber(newValue) === 0) {
    return (
      <div className="bold">
        {prefix}
        {Number(parseFloat(String(value)).toFixed(decimals)) || 0}
        {suffix}
      </div>
    )
  }
  return (
    <>
      <div className="bold">
        {prefix}
        {parseFloat(String(value)).toFixed(decimals)}
        {suffix}
        {`->`}
        {prefix}
        {parseFloat(String(newValue)).toFixed(decimals)}
        {suffix}
      </div>
    </>
  )
}

export default memo(DiffBalance)
