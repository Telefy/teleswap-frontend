/* eslint-disable react/react-in-jsx-scope */
import React, { useState } from 'react'
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import { Modal, ModalFooter, ModalHeader, ModalBody, Input } from 'reactstrap'
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css'
import RangeSlider from 'react-bootstrap-range-slider'

interface LockedModalComponentProps {
  isOpen: boolean
  onDismiss: () => void
}

function LockedModalComponent({ isOpen, onDismiss }: LockedModalComponentProps) {
  const darkMode = useIsDarkMode()
  const [value, setValue] = useState<any | 0>(0)
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
              <h1>Lock TELE</h1>
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
                        <div className="bold">1438.46</div>
                      </div>
                      <div>
                        <div className="text-under">-67465979 USD</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="balance">Balance - 197595.066</div> */}
              </div>
              <div className="stake-slider2">
                <RangeSlider
                  value={value}
                  min={0}
                  max={100}
                  tooltipPlacement="top"
                  tooltip="on"
                  onChange={(changeEvent) => setValue(changeEvent.target.value)}
                />
                <div className="slider-placeholder mb-1">
                  <div>0</div>
                  <div>100</div>
                </div>
                <div className={darkMode ? 'divider-dark' : 'divider-light'}></div>
                <div className="button-group-flex2">
                  <div>
                    <Button className="bg-purple">25%</Button>
                  </div>
                  <div>
                    <Button>50%</Button>
                  </div>
                  <div>
                    <Button>75%</Button>
                  </div>
                  <div>
                    <Button>MAX</Button>
                  </div>
                </div>
              </div>
              {/* <div className="stake-slider2">
                <Slider value={value} onChange={(val) => setValue(value)} {...sliderProps} />
              </div> */}

              <div className="mt-1">Lock Duration</div>
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
export default LockedModalComponent
