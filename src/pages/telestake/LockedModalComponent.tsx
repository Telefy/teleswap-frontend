/* eslint-disable react/react-in-jsx-scope */
import React, { useState } from 'react'
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import { Modal, ModalFooter, ModalHeader, ModalBody, Input } from 'reactstrap'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

function LockedModalComponent() {
  const darkMode = useIsDarkMode()
  const [modalLocked, setLockedModal] = React.useState(true)
  // const closeModal = () => {
  //   setLockedModal(!modalLocked)
  // }
  const [value, setValue] = useState()
  const sliderProps = {
    min: 0,
    max: 100,
    step: 25,
    marks: { 0: 0, 25: 25, 50: 50, 75: 75, 100: 100 },
  }
  return (
    <div>
      <div>
        <Modal
          className={`animated flexible-modal fadeIn ${darkMode ? 'locked-modal-dark' : 'locked-modal-light'}`}
          isOpen={modalLocked}
          backdrop={false}
        >
          <ModalHeader>
            <div className="flexiblecard-header">
              {/* <img src={Icon} alt="teleicon" /> */}
              <h1>Convert to Lock</h1>
              {/* <p>Stake, Earn - And More!</p> */}
              <div
                className="modal-close-btn"
                onClick={() => {
                  setLockedModal(false)
                }}
              >
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
                <Slider value={value} onChange={(val) => setValue(value)} {...sliderProps} />
                <div className="button-group-flex2 mt-1">
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
