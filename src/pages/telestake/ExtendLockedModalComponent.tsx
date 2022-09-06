/* eslint-disable react/react-in-jsx-scope */
import React, { useCallback, useState } from 'react'
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import { Modal, ModalFooter, ModalHeader, ModalBody, Input } from 'reactstrap'
import { Token } from '@telefy/teleswap-core-sdk'
import Overview from 'components/Vault/LockedModal/Overview'
import { useUSDCTeleAmount } from 'hooks/useUSDCPrice'
import { MAX_LOCK_DURATION } from 'constants/pools'
import _noop from 'lodash/noop'
import { formatNumberDecimals } from 'functions'
import LockedModalBodyComponent from './LockedModalBodyComponent'
import useLockedPool from 'hooks/useLockedPool'
import BigNumber from 'bignumber.js'
import { LockedStakeButton } from './VaultCardActions/LockedStakeButton'

interface ExtendDurationButtonPropsType {
  stakingToken: Token
  currentLockedAmount: number
  modalTitle?: string
  currentDuration: number
  lockStartTime: string
  isOpen: boolean
  onDismiss?: () => void
}
function ExtendLockedModalComponent({
  isOpen,
  onDismiss,
  modalTitle,
  stakingToken,
  currentLockedAmount,
  lockStartTime,
  currentDuration,
  ...rest
}: ExtendDurationButtonPropsType) {
  const darkMode = useIsDarkMode()

  const usdValueStaked = useUSDCTeleAmount(currentLockedAmount)

  const validator = useCallback(
    ({ duration }) => {
      const isValidAmount = currentLockedAmount ? currentLockedAmount > 0 : false
      const totalDuration = currentDuration + duration

      const isValidDuration = duration > 0 && totalDuration > 0 && totalDuration <= MAX_LOCK_DURATION

      return {
        isValidAmount,
        isValidDuration,
        isOverMax: totalDuration > MAX_LOCK_DURATION,
      }
    },
    [currentLockedAmount, currentDuration]
  )

  const prepConfirmArg = useCallback(({ duration }) => ({ finalDuration: duration, finalLockedAmount: 0 }), [])

  const { duration, setDuration, pendingTx, handleConfirmClick } = useLockedPool({
    stakingToken,
    onDismiss: onDismiss as () => void,
    lockedAmount: new BigNumber(currentLockedAmount),
    prepConfirmArg,
  })

  const customOverview = useCallback(
    ({ isValidDuration, duration }) => (
      <Overview
        lockStartTime={lockStartTime}
        isValidDuration={isValidDuration}
        openCalculator={_noop}
        duration={currentDuration || duration}
        newDuration={currentDuration + duration}
        lockedAmount={currentLockedAmount}
        usdValueStaked={usdValueStaked || 0}
        showLockWarning={!+lockStartTime}
      />
    ),
    [lockStartTime, currentDuration, currentLockedAmount, usdValueStaked]
  )
  return (
    <div>
      <div>
        <Modal
          className={`animated flexible-modal fadeIn ${darkMode ? 'locked-modal-dark' : 'locked-modal-light'}`}
          isOpen={isOpen}
          backdrop={false}
        >
          <ModalHeader>
            <div className="flexiblecard-header">
              {/* <img src={Icon} alt="teleicon" /> */}
              <h1>{modalTitle}</h1>
              {/* <p>Stake, Earn - And More!</p> */}
              <div className="modal-close-btn" onClick={onDismiss}>
                &times;
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div>
              <div className="flexiblecard-content">
                <div className="box-content">
                  <div className="box-content-item">{modalTitle}</div>
                  {/* <div className="box-content-item">
                    <img src={Icon} alt="teleicon" width={20} /> TELE
                  </div> */}
                </div>
                <div className="apy-block">
                  <div className="locked-content-top">
                    <div className="locked-content-top-item">
                      <img src={Icon} alt="teleicon" width={20} /> TELE
                    </div>
                    <div className="locked-content-right-item">
                      <div>
                        <div className="bold">{formatNumberDecimals(currentLockedAmount, 5)}</div>
                      </div>
                      <div>
                        <div className="text-under">~{usdValueStaked} USD</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <LockedModalBodyComponent
                stakingToken={stakingToken}
                onDismiss={onDismiss}
                lockedAmount={new BigNumber(currentLockedAmount)}
                usdValueStaked={usdValueStaked}
                validator={validator}
                setDuration={setDuration}
                customOverview={customOverview}
                duration={duration}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <LockedStakeButton
              validator={validator}
              stakingToken={stakingToken}
              onDismiss={onDismiss}
              lockedAmount={new BigNumber(currentLockedAmount)}
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
export default ExtendLockedModalComponent
