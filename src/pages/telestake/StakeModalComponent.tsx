/* eslint-disable react/react-in-jsx-scope */
import React, { useState } from 'react'
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import { Modal, ModalFooter, ModalHeader, ModalBody, Input } from 'reactstrap'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

function StakeModalComponent() {
  const darkMode = useIsDarkMode()
  const [modalStake, setModalStake] = React.useState(true)
  const closeModal = () => {
    setModalStake(!modalStake)
  }
  const stakeModal = () => setModalStake(!modalStake)
  const [value, setValue] = useState()
  const sliderProps = {
    min: 0,
    max: 100,
    step: 25,
    marks: { 0: 0, 25: 25, 50: 50, 75: 75, 100: 100 },
  }
  return (
    <div>
      <Modal
        className={`animated flexible-modal fadeIn ${darkMode ? 'locked-modal-dark' : 'locked-modal-light'}`}
        isOpen={modalStake}
        toggle={stakeModal}
        backdrop={false}
      >
        <ModalHeader toggle={stakeModal}>
          <div className="flexiblecard-header">
            {/* <img src={Icon} alt="teleicon" /> */}
            <h1 className="font-md">Stake</h1>
            {/* <p>Stake, Earn - And More!</p> */}
            <div className="modal-close-btn" onClick={stakeModal}>
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
              <Slider value={value} onChange={(val) => setValue(value)} {...sliderProps} />
            </div>
            <div className="button-group-flex mt-1">
              <div>
                <Button>25%</Button>
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
        </ModalBody>
        <ModalFooter>
          <div className="footer-buttons">
            <Button onClick={stakeModal}>Confirm</Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  )
}
export default StakeModalComponent
