/* eslint-disable react/react-in-jsx-scope */
import { useState } from 'react'
import { useIsDarkMode } from '../../state/user/hooks'
import { Modal, ModalFooter, ModalHeader, ModalBody } from 'reactstrap'
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css'
import { Token } from '@telefy/teleswap-core-sdk'
import BigNumber from 'bignumber.js'
import LockedBalanceInputComponent from 'components/Vault/LockedBalanceInputComponent'
import { useUSDCTeleAmount } from 'hooks/useUSDCPrice'
import _toNumber from 'lodash/toNumber'
import { LockedStakeButton } from './VaultCardActions/LockedStakeButton'
import LockedModalBodyComponent from './LockedModalBodyComponent'
import useLockedPool from 'hooks/useLockedPool'

export interface LockedModalComponentProps {
  onDismiss?: () => void
  stakingToken: Token
  currentBalance: BigNumber
  stakingTokenBalance: BigNumber
  isOpen: boolean
}

function LockedModalComponent({
  isOpen,
  onDismiss,
  currentBalance,
  stakingToken,
  stakingTokenBalance,
}: LockedModalComponentProps) {
  const darkMode = useIsDarkMode()
  const [lockedAmount, setLockedAmount] = useState('0')
  const usdValueStaked = useUSDCTeleAmount(_toNumber(lockedAmount))

  const { duration, setDuration, pendingTx, handleConfirmClick } = useLockedPool({
    stakingToken,
    onDismiss: onDismiss as () => void,
    lockedAmount: new BigNumber(lockedAmount),
  })

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
              <h1>Lock {stakingToken.symbol}</h1>
              {/* <p>Stake, Earn - And More!</p> */}
              <div className="modal-close-btn" onClick={onDismiss}>
                &times;
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div>
              <LockedBalanceInputComponent
                stakingAddress={stakingToken.address}
                stakingSymbol={stakingToken.symbol || 'TELE'}
                stakingDecimals={stakingToken.decimals}
                lockedAmount={lockedAmount}
                stakingMax={currentBalance}
                setLockedAmount={setLockedAmount}
                usedValueStaked={usdValueStaked}
                stakingTokenBalance={stakingTokenBalance}
              />
              {/* <div className="stake-slider2">
                <Slider value={value} onChange={(val) => setValue(value)} {...sliderProps} />
              </div> */}
              <LockedModalBodyComponent
                currentBalance={currentBalance}
                stakingToken={stakingToken}
                onDismiss={onDismiss}
                lockedAmount={new BigNumber(lockedAmount)}
                usdValueStaked={usdValueStaked}
                duration={duration}
                setDuration={setDuration}
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
export default LockedModalComponent
