/* eslint-disable react/prop-types */
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ChainId } from '@telefy/teleswap-core-sdk'
import Typography from 'farm-components/Typography'
import { useWalletModalToggle } from 'state/application/hooks'
import React, { FC, Fragment, ReactNode, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useIsDarkMode } from '../../state/user/hooks'

const MenuLink: FC<{ href?: string; label: string; onClick?(): void }> = ({ href, label, onClick }) => {
  const router = useHistory()

  if (onClick) {
    return (
      <Menu.Item>
        {({ active }) => {
          return (
            <Typography variant="sm" weight={700} onClick={onClick} className={active ? 'text-white' : 'text-primary'}>
              {label}
            </Typography>
          )
        }}
      </Menu.Item>
    )
  }

  if (href) {
    return (
      <Menu.Item onClick={() => router.push(href)}>
        {({ active }) => {
          return (
            <Typography variant="sm" weight={700} onClick={onClick} className={active ? 'text-white' : 'text-primary'}>
              {label}
            </Typography>
          )
        }}
      </Menu.Item>
    )
  }

  return <></>
}

enum FarmFilter {
  All = 'All Farms',
  Portfolio = 'Your Farms',
  Lending = 'Lending Farms',
  TelLp = 'TEL-LP Farms',
  Old = 'Old Farms',
}

const filters: Record<string, FarmFilter> = {
  portfolio: FarmFilter.Portfolio,
  farm: FarmFilter.All,
  lending: FarmFilter.Lending,
  old: FarmFilter.Old,
  telLp: FarmFilter.TelLp,
}

const OnsenFilter = ({ account, chainId }: { account?: string | null; chainId?: number }) => {
  const { i18n } = useLingui()

  const { search } = useLocation()

  const filter = search as string

  const toggleWalletModal = useWalletModalToggle()
  const darkMode = useIsDarkMode()
  const [selected, setSelected] = useState<FarmFilter>(filters[filter] || FarmFilter.All)

  const items = useMemo(() => {
    const map: Record<string, ReactNode> = {
      [FarmFilter.All]: <MenuLink href={'/farm'} label={i18n._(t`All Farms`)} />,
      [FarmFilter.Portfolio]: account ? (
        <MenuLink href={`/farm?account=${account}&filter=portfolio`} label={i18n._(t`Your Farms`)} />
      ) : (
        <MenuLink onClick={toggleWalletModal} label={i18n._(t`Your Farms`)} />
      ),
      [FarmFilter.Lending]:
        chainId && [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.RINKEBY].includes(chainId) && false ? (
          <MenuLink href={'/farm?filter=lending'} label={i18n._(t`Lending Farms`)} />
        ) : undefined,
      [FarmFilter.TelLp]:
        chainId && [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.RINKEBY].includes(chainId) && false ? (
          <MenuLink href={'/farm?filter=telLp'} label={i18n._(t`TEL-LP Farms`)} />
        ) : undefined,
      // @ts-ignore TYPE NEEDS FIXING
      [FarmFilter.Old]:
        chainId && [ChainId.CELO].includes(chainId) ? (
          <MenuLink href={'/farm?filter=old'} label={i18n._(t`Old Farms`)} />
        ) : undefined,
    }

    return Object.entries(map).reduce<Record<string, ReactNode>>((acc, [k, v]) => {
      if (v && selected !== k) acc[k] = v
      return acc
    }, {})
  }, [chainId, i18n, account, selected, toggleWalletModal])

  return (
    <div className="flex gap-2 items-center w-[180px]">
      <Menu as="div" className="relative inline-block w-full text-left">
        <div>
          <Menu.Button
            className={`w-full px-4 py-2.5 text-sm font-bold bg-transparent rounded shadow-sm text-primary border-dark-800 hover:bg-dark-900 ${
              darkMode ? 'select-input-border-dark' : 'select-input-border-light'
            }`}
          >
            <div className="flex flex-row items-center justify-between">
              <Typography
                weight={700}
                variant="sm"
                className={darkMode ? 'select-text-color-dark' : 'select-text-color-light'}
              >
                {selected}
              </Typography>
              <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
            </div>
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            static
            className="absolute z-10 w-full mt-2 border divide-y rounded shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border-dark-900 bg-theme divide-dark-900"
          >
            {Object.entries(items).map(([k, v], index) => (
              <div
                key={index}
                onClick={() => setSelected(k as FarmFilter)}
                className="px-3 py-2 cursor-pointer hover:bg-dark-900/40"
              >
                {v}
              </div>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

export default OnsenFilter
