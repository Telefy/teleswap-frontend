/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import getTimePeriods from 'utils/getTimePeriods'

const WithdrawalFeeTimer: React.FC<{ secondsRemaining: number }> = ({ secondsRemaining }) => {
  const { days, hours, minutes } = getTimePeriods(secondsRemaining)

  return <div className="time">{`${days}d:${hours}h:${minutes}m`}</div>
}

export default WithdrawalFeeTimer
