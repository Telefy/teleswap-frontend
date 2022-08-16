/* eslint-disable react/react-in-jsx-scope */
import React, { useState } from 'react'
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import { Modal, ModalFooter, ModalHeader, ModalBody, Input } from 'reactstrap'
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css'
import RangeSlider from 'react-bootstrap-range-slider'

function FlexibleModalComponent() {
  const darkMode = useIsDarkMode()
  const [modalFlexible, setFlexibleModal] = React.useState(true)
  const closeModal = () => {
    setFlexibleModal(!modalFlexible)
  }
  const [value, setValue] = useState<any | 0>(0)

  return (
    <div>
      <Modal
        className={`animated flexible-modal fadeIn ${darkMode ? 'locked-modal-dark' : 'locked-modal-light'}`}
        isOpen={modalFlexible}
        backdrop={false}
      >
        <ModalHeader toggle={closeModal}>
          <div className="flexiblecard-header">
            {/* <img src={Icon} alt="teleicon" /> */}
            <h1 className="font-md">Stake TELE</h1>
            {/* <p>Stake, Earn - And More!</p> */}
            <div className="modal-close-btn" onClick={closeModal}>
              &times;
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div>
            <div className="flexiblecard-content">
              <div className="box-content">
                <div className="box-content-item title">Stake</div>
                <div className="box-content-item">
                  <img src={Icon} alt="teleicon" width={20} /> TELE
                </div>
              </div>
              <div className="apy-block">
                <div className="box-content-top">
                  <div className="box-content-top-item">
                    <div className="tele-input">
                      <Input placeholder="000.00" />
                    </div>
                  </div>
                  <div className="box-content-top-item">
                    <div className="text-under">-67465979 USD</div>
                  </div>
                </div>
              </div>
              <div className="balance">Balance - 197595.066</div>
            </div>
            <div className="stake-slider">
              <RangeSlider
                value={value}
                min={0}
                max={100}
                tooltipPlacement="top"
                tooltip="on"
                onChange={(changeEvent) => setValue(changeEvent.target.value)}
              />
              <div className="slider-placeholder">
                <div>0</div>
                <div>100</div>
              </div>
            </div>
            <div className="button-group-flex mt-1">
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
            <div className="bottom-block">
              <div className="box-content-bottom">
                <div className="box-content-bottom-item">
                  <div>Annual ROI :</div> <div className="bold">$12684.089</div>
                </div>
                <div className="box-content-bottom-item">
                  <div>Performance Fee :</div> <div className="bold">3%</div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="footer-buttons">
            <Button onClick={closeModal}>Confirm</Button>
            <Button onClick={closeModal} className="btn-outline">
              Get TELE
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default FlexibleModalComponent