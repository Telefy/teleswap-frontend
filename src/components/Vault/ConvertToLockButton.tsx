/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { FC, useCallback, useState } from 'react'
import useAvgLockDuration from 'hooks/useAvgLockDuration'
import { Token } from '@telefy/teleswap-core-sdk'
import Button from 'farm-components/Button'
import { useVaultApy } from 'hooks/useVaultApy'
import ExtendLockedModalComponent from 'pages/telestake/ExtendLockedModalComponent'

export const ConvertToLockButton: FC<{ stakingToken: Token; currentStakedAmount: number }> = ({
  stakingToken,
  currentStakedAmount,
}) => {
  const { avgLockDurationsInSeconds } = useAvgLockDuration()
  const { lockedApy } = useVaultApy({ duration: avgLockDurationsInSeconds })

  const [convertToLockModelIsOpen, setConvertToLockModelIsOpen] = useState(false)
  const handleDismissModalConvertToLock = useCallback(() => {
    setConvertToLockModelIsOpen(false)
  }, [setConvertToLockModelIsOpen])
  const openConvetToLockModal = () => setConvertToLockModelIsOpen(true)

  return (
    <>
      <div className="lock-stake-info">
        <p>
          <span className="alert-icon">&#9888;</span> Lock stacking offers higher APY while providing other benefits.{' '}
          {/* <a className="link">
            Learn More <span>&gt;&gt;</span>
          </a> */}
        </p>
        <Button className="convert-lock-btn" onClick={openConvetToLockModal}>
          Convert to Lock
        </Button>
        <p>
          Lock staking users are earning an average of {lockedApy ? parseFloat(lockedApy).toFixed(2) : 0}% APY. More
          benefits are coming soon.
        </p>
      </div>
      <ExtendLockedModalComponent
        isOpen={convertToLockModelIsOpen}
        onDismiss={handleDismissModalConvertToLock}
        modalTitle={'Convert to Lock'}
        stakingToken={stakingToken}
        lockStartTime={'0'}
        currentLockedAmount={currentStakedAmount}
        currentDuration={0}
      />
    </>
  )
}
