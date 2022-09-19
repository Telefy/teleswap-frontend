/* eslint-disable react/react-in-jsx-scope */
import React, { useState } from 'react'
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import { Modal, ModalFooter, ModalHeader, ModalBody, Input } from 'reactstrap'
import { Token } from '@telefy/teleswap-core-sdk'

interface ExtendDurationButtonPropsType {
  stakingToken: Token
  currentLockedAmount: number
  modalTitle?: string
  currentDuration: number
  lockStartTime: string
  isOpen: boolean
  onDismiss?: () => void
}
function ConvertLockedModalComponent({
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
              <h1>Convert to Lock</h1>
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
                  <div className="box-content-item">Add TELE to Lock</div>
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
                        <div className="tele-input">
                          <Input placeholder="000.00" />
                        </div>
                      </div>
                      <div>
                        <div className="text-under">-67465979 USD</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="balance">Balance - 197595.066</div> */}
              </div>

              <div className="mt-1">Add Duration</div>
              <div className="button-group-flex">
                <div>
                  <Button>1W</Button>
                </div>
                <div>
                  <Button>5W</Button>
                </div>
                <div>
                  <Button>10W</Button>
                </div>
                <div>
                  <Button>25W</Button>
                </div>
                <div>
                  <Button>52W</Button>
                </div>
              </div>
              <div className="input-box">
                <div className="input-inner">
                  <Input placeholder="0" />
                </div>
                <div>Week</div>
              </div>
              <div className="mt-1">Lock Overview</div>
              <div className="bottom-block">
                <div className="box-content-bottom">
                  <div className="box-content-bottom-item">
                    <div>TELE to be blocked :</div> <div className="bold">12684.12</div>
                  </div>
                  <div className="box-content-bottom-item">
                    <div>APY :</div> <div className="bold">38%</div>
                  </div>
                  <div className="box-content-bottom-item">
                    <div>Duration :</div> <div className="bold">1 Week</div>
                  </div>
                  <div className="box-content-bottom-item">
                    <div>Unlock On :</div> <div className="bold">June 29 2022, 12:00</div>
                  </div>
                  <div className="box-content-bottom-item">
                    <div>Estimated ROI :</div> <div className="bold">$436.54</div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="footer-buttons">
              <Button>Confirm</Button>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}
export default ConvertLockedModalComponent
