/* eslint-disable react/prop-types */
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Dots from 'farm-components/Dots'
import { HeadlessUiModal } from 'farm-components/Modal'
import Typography from 'farm-components/Typography'
import { OnsenModalView } from 'features/onsen/enum'
import FarmListItemDetails from 'features/onsen/FarmListItemDetails'
import { usePositions } from 'features/onsen/hooks'
import { selectOnsen, setOnsenModalOpen, setOnsenModalState, setOnsenModalView } from 'features/onsen/onsenSlice'
import { TABLE_TR_TH_CLASSNAME, TABLE_WRAPPER_DIV_CLASSNAME } from 'features/trident/constants'
import { classNames } from 'functions'
import { useInfiniteScroll } from 'hooks/useInfiniteScroll'
import useSortableData from 'hooks/useSortableData'
import { useActiveWeb3React } from 'hooks/web3'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import React, { FC, useCallback, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useIsDarkMode } from '../../state/user/hooks'

import FarmListItem from './FarmListItem'

const SortIcon: FC<{ id?: string; direction?: 'ascending' | 'descending'; active: boolean }> = ({
  id,
  active,
  direction,
}) => {
  if (!id || !direction || !active) return <></>
  if (direction === 'ascending') return <ChevronUpIcon width={12} height={12} />
  if (direction === 'descending') return <ChevronDownIcon width={12} height={12} />
  return <></>
}

// @ts-ignore TYPE NEEDS FIXING
const FarmList = ({ farms, term }) => {
  const { items, requestSort, sortConfig } = useSortableData(farms, { key: 'roiPerYear', direction: 'descending' })
  const { chainId } = useActiveWeb3React()
  const positions = usePositions(chainId)
  const { i18n } = useLingui()
  const [numDisplayed, setNumDisplayed] = useInfiniteScroll(items)
  const [selectedFarm, setSelectedFarm] = useState<any>()
  const dispatch = useAppDispatch()
  const { open } = useAppSelector(selectOnsen)
  const darkMode = useIsDarkMode()
  const handleDismiss = useCallback(() => {
    setSelectedFarm(undefined)
    dispatch(setOnsenModalView(undefined))
  }, [dispatch])

  const positionIds = positions.map((el) => el.id)

  return items ? (
    <>
      <div className={darkMode ? 'grid-dark' : 'grid-light'}>
        <div className="grid grid-cols-5 min-w-[768px] grid-header-custom">
          <div
            className={classNames(
              'flex gap-1 items-center grid-header-text cursor-pointer',
              TABLE_TR_TH_CLASSNAME(0, 5)
            )}
            onClick={() => requestSort('pair.token0.symbol')}
          >
            <Typography variant="sm" weight={700}>
              {i18n._(t`Pool`)}
            </Typography>
            <SortIcon id={sortConfig.key} direction={sortConfig.direction} active={sortConfig.key === 'symbol'} />
          </div>
          <div
            className={classNames(
              'flex gap-1 items-center grid-header-text cursor-pointer justify-end',
              TABLE_TR_TH_CLASSNAME(1, 5)
            )}
            onClick={() => requestSort('tvl')}
          >
            <Typography variant="sm" weight={700}>
              {i18n._(t`TVL`)}
            </Typography>
            <SortIcon id={sortConfig.key} direction={sortConfig.direction} active={sortConfig.key === 'tvl'} />
          </div>
          <div className={classNames('grid-header-text', TABLE_TR_TH_CLASSNAME(2, 5))}>
            <Typography variant="sm" weight={700}>
              {i18n._(t`Multiplier`)}
            </Typography>
          </div>
          <div className={classNames('grid-header-text', TABLE_TR_TH_CLASSNAME(3, 5))}>
            <Typography variant="sm" weight={700}>
              {i18n._(t`Rewards`)}
            </Typography>
          </div>
          <div
            className={classNames(
              'flex gap-1 items-center grid-header-text cursor-pointer justify-end',
              TABLE_TR_TH_CLASSNAME(4, 5)
            )}
            onClick={() => requestSort('roiPerYear')}
          >
            <Typography variant="sm" weight={700}>
              {i18n._(t`APR`)}
            </Typography>
            <SortIcon id={sortConfig.key} direction={sortConfig.direction} active={sortConfig.key === 'roiPerYear'} />
          </div>
        </div>
        <div className="divide-y divide-dark-900  min-w-[768px]">
          <InfiniteScroll
            dataLength={numDisplayed}
            next={() => setNumDisplayed(numDisplayed + 5)}
            hasMore={true}
            loader={null}
          >
            {items.slice(0, numDisplayed).map((farm, index) => (
              <FarmListItem
                key={index}
                farm={farm}
                onClick={() => {
                  setSelectedFarm(farm)
                  dispatch(
                    setOnsenModalState({
                      view: positionIds.includes(farm.id) ? OnsenModalView.Position : OnsenModalView.Liquidity,
                      open: true,
                    })
                  )
                }}
              />
            ))}
          </InfiniteScroll>
        </div>
      </div>
      <HeadlessUiModal.Controlled
        isOpen={open}
        onDismiss={() => dispatch(setOnsenModalOpen(false))}
        afterLeave={handleDismiss}
      >
        {selectedFarm && (
          <FarmListItemDetails farm={selectedFarm} onDismiss={() => dispatch(setOnsenModalOpen(false))} />
        )}
      </HeadlessUiModal.Controlled>
    </>
  ) : (
    <div className="w-full py-6 text-center">{term ? <span>No Results.</span> : <Dots>Loading</Dots>}</div>
  )
}

export default FarmList
