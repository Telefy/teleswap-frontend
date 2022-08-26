import formatDuration from 'date-fns/formatDuration'
import differenceInWeeks from 'date-fns/differenceInWeeks'
import addSeconds from 'date-fns/addSeconds'

export const secondsToWeeks = (seconds: number) => {
  const now = new Date()
  const addedDate = addSeconds(now, seconds)

  return differenceInWeeks(new Date(addedDate), now)
}

export const weeksToSeconds = (weeks: number) => weeks * 7 * 24 * 60 * 60

const formatSecondsToWeeks = (secondDuration: any) => formatDuration({ weeks: secondsToWeeks(secondDuration) })

export default formatSecondsToWeeks
