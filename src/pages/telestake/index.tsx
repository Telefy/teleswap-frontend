import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Typography from 'farm-components/Typography'
import { TridentBody, TridentHeader } from 'layouts/Trident'
import React, { useState } from 'react'
import { useIsDarkMode } from '../../state/user/hooks'
import StakeBodyComponent from './StakeBodyComponent'
import { usePoolsPageFetch } from 'state/pools/hooks'

export default function TeleStake(): JSX.Element {
  const { i18n } = useLingui()

  const darkMode = useIsDarkMode()
  const [reRenderToggle, setReRenderToggle] = useState(true)
  const handleReRenderToggle = () => {
    setReRenderToggle(!reRenderToggle)
  }
  // Integration code starts
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
        <StakeBodyComponent handleReRenderToggle={handleReRenderToggle} />
      </TridentBody>
    </>
  )
}
