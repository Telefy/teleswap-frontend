/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import { Modal, ModalFooter, ModalHeader, ModalBody, Input } from 'reactstrap'
import { AddTeleToLockedModalComponentPropsType } from 'constants/types'
import BalanceField from 'components/Vault/LockedModal/BalanceField'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount, getBalanceNumber, getDecimalAmount } from 'utils/formatBalance'
import { useUSDCTeleAmount } from 'hooks/useUSDCPrice'
import { convertTimeToSeconds } from 'utils/timeHelper'
import Overview from 'components/Vault/LockedModal/Overview'
import { ONE_WEEK_DEFAULT } from 'constants/pools'
import { differenceInSeconds } from 'date-fns'
import _noop from 'lodash/noop'
import useLockedPool from 'hooks/useLockedPool'
import { LockedStakeButton } from './VaultCardActions/LockedStakeButton'
import LockedModalBodyComponent from './LockedModalBodyComponent'
import Checkbox from 'components/Checkbox'

const RenewDuration = ({
  setCheckedState,
  checkedState,
}: {
  setCheckedState: Dispatch<SetStateAction<boolean>>
  checkedState: boolean
}) => {
  return (
    <>
      {!checkedState && (
        <div>
          {
            'Adding more CAKE will renew your lock, setting it to remaining duration. Due to shorter lock period, benefits decrease. To keep similar benefits, extend your lock.'
          }
        </div>
      )}
      <div>
        <Checkbox checked={checkedState} onChange={() => setCheckedState((prev) => !prev)} />
        <p>{'Renew and extend your lock to keep similar benefits.'}</p>
      </div>
    </>
  )
}

// add 60s buffer in order to make sure minium duration by pass on renew extension
const MIN_DURATION_BUFFER = 60

function AddTeleToLockedModalComponent({
  isOpen,
  onDismiss,
  currentBalance,
  currentLockedAmount,
  stakingToken,
  lockStartTime,
  lockEndTime,
  stakingTokenBalance,
}: AddTeleToLockedModalComponentPropsType) {
  const darkMode = useIsDarkMode()
  const [lockedAmount, setLockedAmount] = useState('')
  const [checkedState, setCheckedState] = useState(false)
  const lockedAmountAsBigNumber = !Number.isNaN(new BigNumber(lockedAmount).toNumber())
    ? new BigNumber(lockedAmount)
    : BIG_ZERO
  const totalLockedAmount: number = getBalanceNumber(
    currentLockedAmount.plus(getDecimalAmount(lockedAmountAsBigNumber))
  )
  const currentLockedAmountAsBalance = getBalanceAmount(currentLockedAmount)

  const usdValueStaked = useUSDCTeleAmount(lockedAmountAsBigNumber.toNumber())
  const usdValueNewStaked = useUSDCTeleAmount(totalLockedAmount)

  const remainingDuration = differenceInSeconds(new Date(convertTimeToSeconds(lockEndTime as string)), new Date())
  const passedDuration = differenceInSeconds(new Date(), new Date(convertTimeToSeconds(lockStartTime as string)))

  // if you locked for 1 week, then add cake without renew the extension, it's possible that remainingDuration + passedDuration less than 1 week.
  const atLeastOneWeekNewDuration = Math.max(ONE_WEEK_DEFAULT + MIN_DURATION_BUFFER, remainingDuration + passedDuration)

  const prepConfirmArg = useCallback(() => {
    const extendDuration = atLeastOneWeekNewDuration - remainingDuration
    return {
      finalDuration: checkedState ? extendDuration : 0,
    }
  }, [atLeastOneWeekNewDuration, checkedState, remainingDuration])

  const { duration, setDuration, pendingTx, handleConfirmClick } = useLockedPool({
    stakingToken,
    onDismiss: onDismiss as () => void,
    lockedAmount: new BigNumber(lockedAmount),
    prepConfirmArg,
  })

  const customOverview = useCallback(
    () => (
      <Overview
        isValidDuration
        openCalculator={_noop}
        duration={remainingDuration}
        newDuration={checkedState ? atLeastOneWeekNewDuration : undefined}
        lockedAmount={currentLockedAmountAsBalance.toNumber()}
        newLockedAmount={totalLockedAmount}
        usdValueStaked={usdValueNewStaked || 0}
        lockEndTime={lockEndTime}
      />
    ),
    [
      remainingDuration,
      checkedState,
      currentLockedAmountAsBalance,
      atLeastOneWeekNewDuration,
      totalLockedAmount,
      usdValueNewStaked,
      lockEndTime,
    ]
  )
  return (
    <div>
      <div>
        <Modal
          className={`animated flexible-modal fadeIn ${darkMode ? 'locked-modal-dark' : 'locked-modal-light'}`}
          isOpen={isOpen}
          onDismiss={onDismiss}
          backdrop={false}
        >
          <ModalHeader>
            <div className="flexiblecard-header">
              {/* <img src={Icon} alt="teleicon" /> */}
              <h1>Add TELE to Lock</h1>
              {/* <p>Stake, Earn - And More!</p> */}
              <div className="modal-close-btn" onClick={onDismiss}>
                &times;
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div>
              <BalanceField
                stakingAddress={stakingToken.address}
                stakingSymbol={stakingToken.symbol || 'TELE'}
                stakingDecimals={stakingToken.decimals}
                lockedAmount={lockedAmount}
                usedValueStaked={usdValueStaked}
                stakingMax={currentBalance}
                setLockedAmount={setLockedAmount}
                stakingTokenBalance={stakingTokenBalance}
              />

              <LockedModalBodyComponent
                currentBalance={currentBalance}
                stakingToken={stakingToken}
                onDismiss={onDismiss}
                lockedAmount={lockedAmountAsBigNumber}
                usdValueStaked={usdValueStaked}
                duration={duration}
                setDuration={setDuration}
                editAmountOnly={<RenewDuration checkedState={checkedState} setCheckedState={setCheckedState} />}
                customOverview={customOverview}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <LockedStakeButton
              currentBalance={currentBalance}
              stakingToken={stakingToken}
              onDismiss={onDismiss}
              lockedAmount={new BigNumber(lockedAmount)}
              duration={duration}
              pendingTx={pendingTx}
              handleConfirmClick={handleConfirmClick}
            />
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}
export default AddTeleToLockedModalComponent
