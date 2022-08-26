/* eslint-disable react/react-in-jsx-scope */
import React, { useState } from 'react'
import Button from 'farm-components/Button'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import { Modal, ModalFooter, ModalHeader, ModalBody } from 'reactstrap'
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css'
import RangeSlider from 'react-bootstrap-range-slider'
import { Input as NumericalInput } from 'components/NumericalInput'
import BigNumber from 'bignumber.js'
import { BIG_TEN } from 'utils/bigNumber'
import { DeserializedPool } from 'state/types'
import { useActiveWeb3React } from 'hooks/web3'
import { useAppDispatch } from 'state/hooks'
import useCatchTxError from 'hooks/useCatchTxError'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { formatNumberDecimals } from 'functions'

interface FlexibleModalComponentProps {
  pool: DeserializedPool
  stakingMax: BigNumber
  performanceFee?: number
  isRemovingStake?: boolean
  isOpen: boolean
  onDismiss: () => void
}

function FlexibleModalComponent({ stakingMax, performanceFee, pool, isOpen, onDismiss }: FlexibleModalComponentProps) {
  const darkMode = useIsDarkMode()
  const dispatch = useAppDispatch()
  const { stakingToken, earningTokenPrice, vaultKey } = pool
  const { account } = useActiveWeb3React()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const [percent, setPercent] = useState(0)
  const [stakeAmount, setStakeAmount] = useState('')

  const handleStakeInputChange = (input: string) => {
    if (input) {
      const convertedInput = new BigNumber(input).multipliedBy(BIG_TEN.pow(stakingToken.decimals))
      const percentage = Math.floor(convertedInput.dividedBy(stakingMax).multipliedBy(100).toNumber())
      setPercent(percentage > 100 ? 100 : percentage)
    } else {
      setPercent(0)
    }
    setStakeAmount(input)
  }
  const handleChangePercent = (sliderPercent: number) => {
    if (sliderPercent > 0) {
      const percentageOfStakingMax = stakingMax.dividedBy(100).multipliedBy(sliderPercent)
      const amountToStake = getFullDisplayBalance(percentageOfStakingMax, stakingToken.decimals, stakingToken.decimals)
      setStakeAmount(amountToStake)
    } else {
      setStakeAmount('')
    }
    setPercent(sliderPercent)
  }
  return (
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
            <h1 className="font-md">Stake TELE</h1>
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
                <div className="box-content-item title">Stake</div>
                <div className="box-content-item">
                  <img src={Icon} alt="teleicon" width={20} /> TELE
                </div>
              </div>
              <div className="apy-block">
                <div className="box-content-top">
                  <div className="box-content-top-item">
                    <div className="tele-input">
                      <NumericalInput
                        className="token-amount-input w100"
                        value={formatNumberDecimals(stakeAmount, 5)}
                        onUserInput={handleStakeInputChange}
                      />
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
                value={percent}
                min={0}
                max={100}
                tooltipPlacement="top"
                tooltip="on"
                onChange={(changeEvent) => handleChangePercent(Number(changeEvent.target.value))}
              />
              <div className="slider-placeholder">
                <div>0</div>
                <div>100</div>
              </div>
            </div>
            <div className="button-group-flex mt-1">
              <div>
                <Button className={percent === 25 ? 'bg-purple' : ''} onClick={() => handleChangePercent(25)}>
                  25%
                </Button>
              </div>
              <div>
                <Button className={percent === 50 ? 'bg-purple' : ''} onClick={() => handleChangePercent(50)}>
                  50%
                </Button>
              </div>
              <div>
                <Button className={percent === 75 ? 'bg-purple' : ''} onClick={() => handleChangePercent(75)}>
                  75%
                </Button>
              </div>
              <div>
                <Button className={percent === 100 ? 'bg-purple' : ''} onClick={() => handleChangePercent(100)}>
                  MAX
                </Button>
              </div>
            </div>
            <div className="bottom-block">
              <div className="box-content-bottom">
                <div className="box-content-bottom-item">
                  <div>Annual ROI :</div> <div className="bold">$12684.089</div>
                </div>
                <div className="box-content-bottom-item">
                  <div>Performance Fee :</div> <div className="bold">{performanceFee || 0}%</div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="footer-buttons">
            <Button onClick={onDismiss}>Confirm</Button>
            <Button onClick={onDismiss} className="btn-outline">
              Get TELE
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default FlexibleModalComponent
