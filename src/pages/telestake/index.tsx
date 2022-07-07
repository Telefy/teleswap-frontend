import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Button from 'farm-components/Button'
import Typography from 'farm-components/Typography'
import { Chef, PairType } from 'features/onsen/enum'
import useFarmRewards from 'hooks/useFarmRewards'
import useFuse from 'hooks/useFuse'
import { TridentBody, TridentHeader } from 'layouts/Trident'
import { useActiveWeb3React } from 'hooks/web3'
import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useIsDarkMode } from '../../state/user/hooks'
import Icon from '../../assets/svg/teleicon.svg'
import styled from 'styled-components'
import { MouseoverTooltip, MouseoverTooltipContent } from 'components/Tooltip'
import { Info } from 'react-feather'
import { Input } from 'reactstrap'
import { useWalletModalToggle } from '../../state/application/hooks'
import 'rc-slider/assets/index.css'
import LockedModalComponent from './LockedModalComponent'
import ConvertLockedModalComponent from './ConvertLockedModalComponent'
import FlexibleModalComponent from './FlexibleModalComponent'
import StakeModalComponent from './StakeModalComponent'
import UnstakeModalComponent from './UnstakeModalComponent'

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

  const { chainId, account } = useActiveWeb3React()

  const param = useLocation().search
  const router = new URLSearchParams(param)

  const type = !router.get('filter') ? 'all' : (router.get('filter') as string)
  const darkMode = useIsDarkMode()

  const FILTER = {
    // @ts-ignore TYPE NEEDS FIXING
    all: (farm) => farm.allocPoint !== '0' && farm.chef !== Chef.OLD_FARMS,
    // @ts-ignore TYPE NEEDS FIXING
    portfolio: (farm) => farm?.amount && !farm.amount.isZero(),
    // @ts-ignore TYPE NEEDS FIXING
    sushi: (farm) => farm.pair.type === PairType.SWAP && farm.allocPoint !== '0',
    // @ts-ignore TYPE NEEDS FIXING
    kashi: (farm) => farm.pair.type === PairType.KASHI && farm.allocPoint !== '0',
    // @ts-ignore TYPE NEEDS FIXING
    '2x': (farm) =>
      (farm.chef === Chef.DIALER_CONTRACT || farm.chef === Chef.MINICHEF) &&
      farm.rewards.length > 1 &&
      farm.allocPoint !== '0',
    // @ts-ignore TYPE NEEDS FIXING
    old: (farm) => farm.chef === Chef.OLD_FARMS,
  }

  const rewards = useFarmRewards({ chainId })
  const data = rewards.filter((farm: any) => {
    // @ts-ignore TYPE NEEDS FIXING
    return type in FILTER ? FILTER[type](farm) : true
  })

  const options = {
    keys: ['pair.id', 'pair.token0.symbol', 'pair.token1.symbol'],
    threshold: 0,
  }

  const { result, term, search } = useFuse({
    data,
    options,
  })
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
  const buttonHandler = () => {
    setFlexibleLockedBoxShown(!isFlexibleLockedBoxShown)
  }

  return (
    <>
      {/* <NextSeo title="Farm" description="Farm SUSHI" /> */}
      <TridentHeader className="sm:!flex-row justify-between items-center" pattern="bg-bubble">
        <div className={darkMode ? 'telestake-title' : 'telestake-title-light'}>
          <Typography variant="h2" style={{ color: darkMode ? 'white' : '#6e087a' }} weight={700}>
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
      <div className={darkMode ? 'divider-dark' : 'divider-light'}></div>
      <TridentBody>
        <div className="flex flex-col w-full items-center justify-between gap-6">
          <div className={darkMode ? 'telecard-dark' : 'telecard-light'}>
            <div className="telecard-header">
              <img src={Icon} alt="teleicon" />
              <h1 className="font-md">Tele Stake</h1>
              <p>Stake, Earn - And More!</p>
            </div>
            {!isStakedAlready && (
              <div className="telecard-content">
                <div className="apy-block">
                  <div className="box-content-top">
                    <div className="box-content-top-item">
                      <div>Flexible Staking APY :</div>
                      <div className="bold">35.33%</div>
                    </div>
                    <div className="box-content-top-item">
                      <div>Locked Staking APY :</div> <div className="bold">Up to 91.06%</div>
                    </div>
                  </div>
                </div>
                {!account && (
                  <div className="connect-wal-btn">
                    <div className="title">Start Earning</div>
                    <Button onClick={toggleWalletModal}>Connect Wallet</Button>
                  </div>
                )}
                {account && !isFlexibleLockedBoxShown && (
                  <div className="connect-wal-btn">
                    <div className="title">Stake TELE</div>
                    <Button onClick={buttonHandler}>Enable</Button>
                  </div>
                )}
                {!isStakedAlready && isFlexibleLockedBoxShown && (
                  <div className="mt-1 flexiblelocked-btn-group">
                    <div className="title">Stake TELE</div>
                    <div className="stake-tele-block">
                      <div className="flexible">
                        <Button onClick={flexibleModal}>Flexible</Button>
                      </div>
                      <div className="locked">
                        <Button
                          onClick={() => {
                            setLockedModal(true)
                          }}
                        >
                          Locked
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div>
              {isStakedAlready && (
                <div className="telecard-content">
                  <div className="title">My Position</div>
                  <div className="custom-input2">
                    <Input type="text" value="13456.12" />
                    <div className="stk-btn-holder">
                      <Button onClick={unStakeModal}>&#8722;</Button>
                      <Button onClick={stakeModal}>&#43;</Button>
                    </div>
                    {/* <div className={darkMode ? 'divider-dark' : 'divider-light'}></div> */}
                    <div className="input-caption-left2">-2637738 USD</div>
                  </div>
                  <div className="apy-block2">
                    <div className="box-content-top">
                      <div className="box-content-top-item">
                        <div>APY :</div> <div className="bold">4.25%</div>
                      </div>
                      <div className="box-content-top-item">
                        <div>Recent TELE Profit :</div> <div className="bold">91.06%</div>
                      </div>
                    </div>
                  </div>
                  <div className="unstakefee">
                    <div>0.2% nnstaking fee before</div>
                    <div className="time">1d:12m:05s</div>
                  </div>
                  <div className="lock-stake-info">
                    <p>
                      <span className="alert-icon">&#9888;</span> Lock stacking offers higher APY while providing other
                      benefits.{' '}
                      <a className="link">
                        Learn More <span>&gt;&gt;</span>
                      </a>
                    </p>
                    <Button onClick={convertLockedModal}>Convert to Lock</Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              {isStakedAlready && (
                <div className="telecard-content">
                  <div className="confirm-lock-title">
                    <div className="title">My Position</div>
                    <div>Locked</div>
                  </div>
                  <div className="tele-lock-unlock-block">
                    <div className="tele-lock-unlock-block-item">
                      <div className="inner-title">TELE Locked</div>
                      <div className="locked-value">155098.00</div>
                      <div className="bottom-value">-2637738 USD</div>
                    </div>
                    <div className="tele-lock-unlock-block-item">
                      <div className="inner-title">Unlocks In</div>
                      <div className="locked-value">5 Weeks</div>
                      <div className="bottom-value">08 July 2022</div>
                    </div>
                  </div>
                  <div className="stake-tele-block mt-1">
                    <div className="flexible">
                      <Button onClick={stakeModal}>Add TELE</Button>
                    </div>
                    <div className="locked">
                      <Button onClick={convertLockedModal}>Extend</Button>
                    </div>
                  </div>
                  <div className="apy-block2">
                    <div className="box-content-top">
                      <div className="box-content-top-item">
                        <div>APY :</div> <div className="bold">4.25%</div>
                      </div>
                      <div className="box-content-top-item">
                        <div>Lock Duration : </div> <div className="bold">10 Weeks</div>
                      </div>
                      <div className="box-content-top-item">
                        <div>Yield Boost : </div> <div className="bold">4.8x</div>
                      </div>
                      <div className="box-content-top-item">
                        <div>Recent TELE Profit : </div> <div className="bold">200.20</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isStakedAlready && (
              <div className="telecard-footer">
                <div className="box-content">
                  <div className="box-content-item">
                    <div>
                      Total staked:
                      {/* <MouseoverTooltipContent content={'Total amount of CAKE staked in this pool'}>
                      <StyledInfo />
                    </MouseoverTooltipContent> */}
                    </div>{' '}
                    <div className="foot-value">187,539,941 TELE</div>
                  </div>
                  <div className="box-content-item">
                    <div>Total locked:</div> <div className="foot-value">155,023,652 TELE</div>
                  </div>
                  <div className="box-content-item">
                    <div>Average lock duration:</div> <div className="foot-value">38 weeks</div>
                  </div>
                  <div className="box-content-item">
                    <div>Performance Fee</div> <div className="foot-value">0~2%</div>
                  </div>
                </div>
                <div className="box-link">
                  <a
                    target="_blank"
                    href="https://rinkeby-info.telefy.finance/token/0xf1e345ea7c33fd6c05f5512a780eb5839ee31674"
                    rel="noreferrer"
                  >
                    See Token Info
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </TridentBody>

      {modalLocked && <LockedModalComponent />}
      {modalFlexible && <FlexibleModalComponent />}
      {modalStake && <StakeModalComponent />}
      {modalUnStake && <UnstakeModalComponent />}
      {modalConvertLocked && <ConvertLockedModalComponent />}
    </>
  )
}
