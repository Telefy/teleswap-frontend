import { t, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Button from 'farm-components/Button'
import Typography from 'farm-components/Typography'
import { Chef, PairType } from 'features/onsen/enum'
import useFarmRewards from 'hooks/useFarmRewards'
import useFuse from 'hooks/useFuse'
import { TridentBody, TridentHeader } from 'layouts/Trident'
import { useActiveWeb3React } from 'hooks/web3'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import styled from 'styled-components'
import { Info } from 'react-feather'
import { Input } from 'reactstrap'
import { useWalletModalToggle } from '../../state/application/hooks'
import StakeBodyComponent from './StakeBodyComponent'
import LockedModalComponent from './LockedModalComponent'
import ConvertLockedModalComponent from './ConvertLockedModalComponent'
import FlexibleModalComponent from './FlexibleModalComponent'
import StakeModalComponent from './StakeModalComponent'
import UnstakeModalComponent from './UnstakeModalComponent'
import { useVaultApprove, useCheckVaultApprovalStatus } from '../../hooks/useApprove'
import { usePoolsPageFetch, usePoolsWithVault } from 'state/pools/hooks'

const StyledInfo = styled(Info)`
  opacity: 0.4;
  color: ${({ theme }) => theme.text1};
  height: 16px;
  width: 16px;
  :hover {
    opacity: 0.8;
  }
`

export default function TeleStake(): JSX.Element {
  const { i18n } = useLingui()

  const param = useLocation().search
  const router = new URLSearchParams(param)

  const type = !router.get('filter') ? 'all' : (router.get('filter') as string)
  const darkMode = useIsDarkMode()

  const [modalFlexible, setFlexibleModal] = React.useState(false)
  const [modalLocked, setLockedModal] = React.useState(false)
  const [modalConvertLocked, setConvertLockedModal] = React.useState(false)
  const [isStakedAlready, setIsStakedAlready] = useState(false)
  const [isConvertToLock, setIsConvertToLock] = useState(false)
  const [modalStake, setModalStake] = React.useState(false)
  const [modalUnStake, setModalUnStake] = React.useState(false)
  const flexibleModal = () => {
    setFlexibleModal(!modalFlexible)
    setIsStakedAlready(true)
  }
  const convertLockedModal = () => {
    setConvertLockedModal(!modalConvertLocked)
    setFlexibleModal(false)
    setIsStakedAlready(false)
  }
  // const lockedModal = () => setLockedModal(!modalLocked)
  const toggleWalletModal = useWalletModalToggle()
  const [isFlexibleLockedBoxShown, setFlexibleLockedBoxShown] = useState(false)
  const stakeModal = () => setModalStake(!modalStake)
  const unStakeModal = () => setModalUnStake(!modalUnStake)
  const enableButtonHandler = () => {
    setFlexibleLockedBoxShown(!isFlexibleLockedBoxShown)
  }

  // Integration code starts
  const { isVaultApproved, setLastUpdated } = useCheckVaultApprovalStatus()
  const { handleApprove, pendingTx } = useVaultApprove(setLastUpdated)
  // const { pools, userDataLoaded } = usePoolsWithVault()
  // console.log(pools, 'pools')
  usePoolsPageFetch()

  return (
    <>
      {/* <NextSeo title="Farm" description="Farm SUSHI" /> */}
      <TridentHeader
        className={`sm:!flex-row justify-between items-center ${
          darkMode ? 'staking-header-title-dark' : 'staking-header-title-light'
        }`}
        pattern="bg-bubble"
      >
        <div className={darkMode ? 'telestake-title' : 'telestake-title-light'}>
          <Typography className="title-main" style={{ color: darkMode ? 'white' : '#6e087a' }}>
            {i18n._(t`Tele Staking `)}
          </Typography>
          {/* <Typography variant="sm" weight={400}>
            {i18n._(t`Earn fees and rewards by depositing and staking your tokens to the platform.`)}
          </Typography> */}
        </div>

        {/* <div className="flex gap-3">
          <Button id="btn-create-new-pool" size="sm" className={darkMode ? 'background-dark' : 'background-light'}>
            <img width={'30px'} src={Icon} alt="teleicon" />
            <a target="_blank" rel="noreferrer">
              {i18n._(t`Apply for Telefy Farms`)}
            </a>
          </Button>
        </div> */}
      </TridentHeader>
      {/* <div className={darkMode ? 'divider-dark' : 'divider-light'}></div> */}
      <TridentBody>
        <StakeBodyComponent
          isStakedAlready={isStakedAlready}
          toggleWalletModal={toggleWalletModal}
          isVaultApproved={isVaultApproved}
          handleApprove={handleApprove}
          pendingTx={pendingTx}
          flexibleModal={flexibleModal}
          setLockedModal={setLockedModal}
          unStakeModal={unStakeModal}
          stakeModal={stakeModal}
          convertLockedModal={convertLockedModal}
        />
      </TridentBody>

      {modalLocked && <LockedModalComponent />}
      {modalFlexible && <FlexibleModalComponent />}
      {modalStake && <StakeModalComponent />}
      {modalUnStake && <UnstakeModalComponent />}
      {modalConvertLocked && <ConvertLockedModalComponent />}
    </>
  )
}
