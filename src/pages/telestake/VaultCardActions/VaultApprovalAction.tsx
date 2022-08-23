/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Trans } from '@lingui/macro'
import Button from 'farm-components/Button'
import { useVaultApprove } from '../../../hooks/useApprove'

interface ApprovalActionProps {
  setLastUpdated: () => void
  isLoading?: boolean
}

const VaultApprovalAction: React.FC<ApprovalActionProps> = ({ setLastUpdated, isLoading }) => {
  const { handleApprove, pendingTx } = useVaultApprove(setLastUpdated)

  return (
    <>
      <div className="connect-wal-btn">
        {isLoading ? (
          <Button disabled={true}>Loading</Button>
        ) : (
          <Button onClick={handleApprove} disabled={pendingTx}>
            {pendingTx ? <Trans>Enabling...</Trans> : <Trans>Enable</Trans>}
          </Button>
        )}
      </div>
    </>
  )
}

export default VaultApprovalAction
