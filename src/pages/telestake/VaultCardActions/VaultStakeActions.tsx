/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import BigNumber from 'bignumber.js'
import { DeserializedPool } from 'state/types'
// import HasSharesActions from './HasSharesActions'
import Button from 'farm-components/Button'
import { useCallback, useState } from 'react'
import LockedModalComponent from '../LockedModalComponent'
import FlexibleModalComponent from '../FlexibleModalComponent'
import HasSharesActions from './HasShareActions'

interface VaultStakeActionsProps {
  pool: DeserializedPool
  stakingTokenBalance: BigNumber
  accountHasSharesStaked: boolean
  performanceFee: number
  handleReRenderToggle: VoidFunction
}

const VaultStakeActions: React.FC<VaultStakeActionsProps> = ({
  pool,
  stakingTokenBalance,
  accountHasSharesStaked,
  performanceFee,
  handleReRenderToggle,
}) => {
  const { stakingToken, userDataLoaded } = pool

  const [modalFlexibleOpen, setModalFlexiblelOpen] = useState(false)
  const handleDismissModalFlexible = useCallback(() => {
    setModalFlexiblelOpen(false)
  }, [setModalFlexiblelOpen])
  const [modalLockedOpen, setModalLockedlOpen] = useState(false)
  const handleDismissModalLocked = useCallback(() => {
    setModalLockedlOpen(false)
  }, [setModalLockedlOpen])
  const onFlexibleButtonClick = () => setModalFlexiblelOpen(true)
  const onLockedButtonClick = () => setModalLockedlOpen(true)

  const renderStakeAction = () => {
    return accountHasSharesStaked ? (
      <HasSharesActions
        pool={pool}
        stakingTokenBalance={stakingTokenBalance}
        performanceFee={performanceFee}
        handleReRenderToggle={handleReRenderToggle}
      />
    ) : (
      <div className="mt-1 flexiblelocked-btn-group">
        <div className="stake-tele-block">
          <div className="flexible">
            <Button onClick={onFlexibleButtonClick}>Flexible</Button>
          </div>
          <div className="locked">
            <Button onClick={onLockedButtonClick}>Locked</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {userDataLoaded ? (
        renderStakeAction()
      ) : (
        <div className="connect-wal-btn">
          <Button disabled={true}>Loading</Button>
        </div>
      )}

      <LockedModalComponent
        isOpen={modalLockedOpen}
        onDismiss={handleDismissModalLocked}
        currentBalance={stakingTokenBalance}
        stakingToken={stakingToken}
        stakingTokenBalance={stakingTokenBalance}
      />
      <FlexibleModalComponent
        isOpen={modalFlexibleOpen}
        stakingMax={stakingTokenBalance}
        performanceFee={performanceFee}
        pool={pool}
        onDismiss={handleDismissModalFlexible}
        handleReRenderToggle={handleReRenderToggle}
      />
    </>
  )
}

export default VaultStakeActions
