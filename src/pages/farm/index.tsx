import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { SupportedChainId as ChainId } from 'constants/chains'
import Button from 'farm-components/Button'
import ExternalLink from 'farm-components/ExternalLink'
import Search from 'farm-components/Search'
import Typography from 'farm-components/Typography'
import { Chef, PairType } from 'features/onsen/enum'
import FarmList from 'features/onsen/FarmList'
import OnsenFilter from 'features/onsen/FarmMenu'
import useFarmRewards from 'hooks/useFarmRewards'
import useFuse from 'hooks/useFuse'
import { TridentBody, TridentHeader } from 'layouts/Trident'
import { useActiveWeb3React } from 'hooks/web3'
import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useIsDarkMode } from '../../state/user/hooks'

export default function Farm(): JSX.Element {
  const { i18n } = useLingui()

  const { chainId, account } = useActiveWeb3React()

  const param = useLocation().search
  const router = new URLSearchParams(param)

  const type = !router.get('filter') ? 'all' : (router.get('filter') as string)
  const darkMode = useIsDarkMode()
  const queryOrActiveAccount = useMemo(
    () => (router.get('account') ? (router.get('account') as string) : account),
    [account, router.get('account')]
  )
  // console.log({ queryOrActiveAccount })

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

  const data = rewards.filter((farm) => {
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

  return (
    <>
      {/* <NextSeo title="Farm" description="Farm SUSHI" /> */}
      <TridentHeader className="sm:!flex-row justify-between items-center" pattern="bg-bubble">
        <div>
          <Typography variant="h2" style={{ color: darkMode ? 'white' : '#6e087a' }} weight={700}>
            {i18n._(t`Onsen Menu`)}
          </Typography>
          <Typography variant="sm" weight={400}>
            {i18n._(t`Earn fees and rewards by depositing and staking your tokens to the platform.`)}
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button id="btn-create-new-pool" size="sm" className={darkMode ? 'background-dark' : 'background-light'}>
            <a
              href="https://docs.google.com/document/d/1VcdrqAn1sR8Wa0BSSU-jAl68CfoECR62LCzIyzUpZ_U"
              target="_blank"
              rel="noreferrer"
            >
              {i18n._(t`Apply for Onsen`)}
            </a>
          </Button>
        </div>
      </TridentHeader>
      <TridentBody>
        <div className="flex flex-col w-full gap-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className={darkMode ? 'search-dark' : 'search-light'}>
              <Search search={search} term={term} />
            </div>
            <OnsenFilter account={account} chainId={chainId} />
          </div>
          <FarmList farms={result} term={term} />
          {chainId && chainId === ChainId.CELO && (
            <Typography variant="xs" weight={700} className="italic text-center text-secondary">
              {i18n._(t`Users can now bridge back to Celo using a new version of Optics.`)}{' '}
              <ExternalLink
                color="blue"
                id={`celo-optics-info-link`}
                href="https://medium.com/@0xJiro/celo-farms-update-migrating-to-the-optics-v2-bridge-e8075d1c9ea"
              >
                {i18n._(t`Click for more info on Optics V1 Migration.`)}
              </ExternalLink>
            </Typography>
          )}
        </div>
      </TridentBody>
    </>
  )
}
