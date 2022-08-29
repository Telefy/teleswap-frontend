/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import BigNumber from 'bignumber.js'
import { DeserializedPool } from 'state/types'
// import HasSharesActions from './HasSharesActions'
import Button from 'farm-components/Button'
import { useCallback, useState } from 'react'
import LockedModalComponent from '../LockedModalComponent'
import FlexibleModalComponent from '../FlexibleModalComponent'

interface VaultStakeActionsProps {
  pool: DeserializedPool
  stakingTokenBalance: BigNumber
  accountHasSharesStaked: boolean
  performanceFee: number
}

const VaultStakeActions: React.FC<VaultStakeActionsProps> = ({
  pool,
  stakingTokenBalance,
  accountHasSharesStaked,
  performanceFee,
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
  const onFlexibleButtonClick = () => {
    console.log(document.body.style.overflowY)
    if (document.getElementsByTagName('html')[0].style.overflow !== 'hidden') {
      document.getElementsByTagName('html')[0].style.overflow = 'hidden'
    }
    setModalFlexiblelOpen(true)
  }
  const onLockedButtonClick = () => {
    if (document.getElementsByTagName('html')[0].style.overflow !== 'hidden') {
      document.getElementsByTagName('html')[0].style.overflow = 'hidden'
    }
    setModalLockedlOpen(true)
  }

  // const [onPresentTokenRequired] = useModal(<NotEnoughTokensModal tokenSymbol={stakingToken.symbol} />)
  // const [onPresentStake] = useModal(
  //   <VaultStakeModal stakingMax={stakingTokenBalance} pool={pool} performanceFee={performanceFee} />
  // )
  // const [openPresentLockedStakeModal] = useModal(
  //   <LockedStakeModal
  //     currentBalance={stakingTokenBalance}
  //     stakingToken={stakingToken}
  //     stakingTokenBalance={stakingTokenBalance}
  //   />
  // )

  const renderStakeAction = () => {
    return (
      // accountHasSharesStaked ? (
      // <HasSharesActions pool={pool} stakingTokenBalance={stakingTokenBalance} performanceFee={performanceFee} />
      // ) : (
      <div className="mt-1 flexiblelocked-btn-group">
        <div className="stake-tele-block">
          <div className="flexible">
            <Button onClick={onFlexibleButtonClick}>Flexible</Button>
            {/* <Button>Flexible</Button> */}
          </div>
          <div className="locked">
            <Button onClick={onLockedButtonClick}>Locked</Button>
          </div>
        </div>
      </div>
      // )
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

      <LockedModalComponent isOpen={modalLockedOpen} onDismiss={handleDismissModalLocked} />
      <FlexibleModalComponent isOpen={modalFlexibleOpen} onDismiss={handleDismissModalFlexible} />
    </>
  )
}

export default VaultStakeActions
