/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import isUndefinedOrNull from 'utils/isUndefinedOrNull'

interface DiffTextPropsType {
  value: string
  newValue?: string
  prefix?: string
}

const DiffText: React.FC<DiffTextPropsType> = ({ value, newValue, prefix }) => {
  prefix = prefix === undefined ? '' : prefix
  if (
    isUndefinedOrNull(newValue) ||
    isUndefinedOrNull(value) ||
    value === newValue ||
    parseFloat(newValue || '0') === 0
  ) {
    return (
      <div className="bold">
        {prefix}
        {value || '-'}
      </div>
    )
  }

  return (
    <>
      <div className="bold">
        {prefix}
        {value}
        {<span className="arrow-icon">&#8658;</span>}
        {prefix}
        {newValue}
      </div>
    </>
  )
}

export default DiffText
