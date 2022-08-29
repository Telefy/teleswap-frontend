/* eslint-disable react/jsx-key */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import _toNumber from 'lodash/toNumber'
import { secondsToWeeks, weeksToSeconds } from 'utils/formatSecondsToWeeks'
import { LockDurationFieldPropsType } from 'constants/types'
import Button from 'farm-components/Button'
import { Input } from 'reactstrap'

const DURATIONS = [1, 5, 10, 25, 52]

const LockDurationField: React.FC<LockDurationFieldPropsType> = ({ duration, setDuration, isOverMax }) => {
  return (
    <>
      <div className="mt-1">Lock Duration</div>
      <div className="button-group-flex">
        {DURATIONS.map((week) => (
          <div>
            <Button onClick={() => setDuration(weeksToSeconds(week))}>{week}W</Button>
          </div>
        ))}
      </div>
      <div className="input-box">
        <div className="input-inner">
          <Input
            value={secondsToWeeks(duration)}
            autoComplete="off"
            pattern="^[0-9]+$"
            inputMode="numeric"
            onChange={(e) => {
              const weeks = _toNumber(e?.target?.value)

              // Prevent large number input which cause NaN
              // Why 530, just want to avoid user get laggy experience
              // For example, allow user put 444 which they still get warning no more than 52
              if (e.currentTarget.validity.valid && weeks < 530) {
                setDuration(weeksToSeconds(_toNumber(e?.target?.value)))
              }
            }}
          />
        </div>
        <div>Week</div>
        {isOverMax && <div className="bold">{'Total lock duration exceeds 52 weeks'}</div>}
      </div>
    </>
  )
}

export default LockDurationField
