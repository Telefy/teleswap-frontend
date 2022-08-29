/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import isUndefinedOrNull from 'utils/isUndefinedOrNull'

interface DiffTextPropsType {
  value: string
  newValue?: string
}

const DiffText: React.FC<DiffTextPropsType> = ({ value, newValue }) => {
  if (isUndefinedOrNull(newValue) || isUndefinedOrNull(value) || value === newValue) {
    return <div className="bold">{value || '-'}</div>
  }

  return (
    <>
      <div className="bold">{value}</div>
      {`->`}
      <div className="bold">{newValue}</div>
    </>
  )
}

export default DiffText
