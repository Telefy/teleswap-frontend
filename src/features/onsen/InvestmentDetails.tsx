/* eslint-disable react/prop-types */
import { getAddress } from '@ethersproject/address'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { SupportedChainId as ChainId } from 'constants/chains'
import JSBI from 'jsbi'
import { CurrencyAmount, Token, toAmount } from '@telefy/teleswap-core-sdk'
import Button from 'farm-components/Button'
import { CurrencyLogo } from 'farm-components/CurrencyLogo'
import { HeadlessUiModal } from 'farm-components/Modal'
import Typography from 'farm-components/Typography'
import { formatNumber } from 'functions'
import { useCurrency } from 'hooks/Tokens'
import useUSDCPriceSubgraph from 'hooks/useUSDCSubgraph'
import { useActiveWeb3React } from 'hooks/web3'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useHistory } from 'react-router-dom'
import React, { useMemo, useState } from 'react'

import { useKashiMediumRiskLendingPair } from '../kashi/hooks'
import { PairType } from './enum'
import { usePendingTele, useUserInfo } from './hooks'
import useDialerContract from './useDialerContract'
import usePendingReward from './usePendingReward'

// @ts-ignore TYPE NEEDS FIXING
const RewardRow = ({ value, symbol }) => {
  return (
    <Typography weight={700} className="text-high-emphesis">
      {value}{' '}
      <Typography component="span" className="text-secondary">
        {symbol}
      </Typography>
    </Typography>
  )
}

// @ts-ignore TYPE NEEDS FIXING
const InvestmentDetails = ({ farm }) => {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()
  const { harvest } = useDialerContract(farm.chef)
  const router = useHistory()
  const addTransaction = useTransactionAdder()
  const kashiPair = useKashiMediumRiskLendingPair(account, farm.pair.id)
  const [pendingTx, setPendingTx] = useState(false)
  const token0 = useCurrency(farm.pair.token0.id)
  const token1 = useCurrency(farm.pair.token1.id)

  console.log({ farm })

  const liquidityToken = useMemo(
    () =>
      chainId
        ? new Token(
            chainId,
            getAddress(farm.pair.id),
            farm.pair.type === PairType.KASHI ? Number(farm.pair.asset.decimals) : 18,
            farm.pair.symbol ?? farm.pair.type === PairType.KASHI ? 'KMP' : 'TEL-LP',
            farm.pair.name
          )
        : undefined,
    [chainId, farm]
  )

  const stakedAmount = useUserInfo(farm, liquidityToken)

  const kashiAssetAmount = useMemo(() => {
    let amountArgument: JSBI
    if (stakedAmount?.greaterThan(0) && kashiPair) {
      amountArgument = toAmount(kashiPair.asset, stakedAmount.quotient)
    } else {
      amountArgument = JSBI.BigInt(0)
    }
    return kashiPair ? CurrencyAmount.fromRawAmount(kashiPair.asset.token, amountArgument) : undefined
  }, [kashiPair, stakedAmount])

  const pendingTele = usePendingTele(farm)
  const pendingReward = usePendingReward(farm)

  const positionFiatValue = useUSDCPriceSubgraph(kashiPair ? kashiPair.asset.token : undefined)

  const secondaryRewardOnly = chainId && [ChainId.FUSE].includes(chainId)

  const rewardValue = !secondaryRewardOnly
    ? (farm?.rewards?.[0]?.rewardPrice ?? 0) * Number(pendingTele?.toExact() ?? 0) +
      (farm?.rewards?.[1]?.rewardPrice ?? 0) * Number(pendingReward ?? 0)
    : (farm?.rewards?.[0]?.rewardPrice ?? 0) * Number(pendingReward ?? 0)

  async function onHarvest() {
    setPendingTx(true)
    try {
      const tx = await harvest(farm.id)
      addTransaction(tx, {
        summary: i18n._(t`Harvest ${farm.pair.token0.name}/${farm.pair.token1.name}`),
      })
    } catch (error) {
      console.error(error)
    }
    setPendingTx(false)
  }

  return (
    <>
      <HeadlessUiModal.BorderedContent className="flex flex-col gap-2 bg-dark-1000/40">
        <div className="flex justify-between">
          <Typography variant="xs" weight={700} className="text-secondary">
            {i18n._(t`Your Deposits`)}
          </Typography>
          <Typography variant="xs" className="flex gap-1 text-secondary">
            {formatNumber(stakedAmount?.toSignificant(6) ?? 0)} {farm.pair.token0.symbol}-{farm.pair.token1.symbol}
            <Typography variant="xs" weight={700} className="text-high-emphesis" component="span">
              {formatNumber(positionFiatValue?.toSignificant(6) ?? 0, true)}
            </Typography>
          </Typography>
        </div>
        {[PairType.KASHI, PairType.SWAP].includes(farm.pair.type) && (
          <div className="flex items-center gap-2">
            {/*@ts-ignore TYPE NEEDS FIXING*/}
            {token0 && <CurrencyLogo currency={token0} size={18} />}
            {farm.pair.type === PairType.KASHI && (
              <RewardRow
                symbol={token0?.symbol}
                // @ts-ignore TYPE NEEDS FIXING
                value={kashiAssetAmount?.toSignificant(6)}
              />
            )}
            {farm.pair.type === PairType.SWAP && (
              <RewardRow
                value={formatNumber(
                  (farm.pair.reserve0 * Number(stakedAmount?.toExact() ?? 0)) / farm.pair.totalSupply
                )}
                symbol={token0?.symbol}
              />
            )}
          </div>
        )}
        {farm.pair.type === PairType.SWAP && (
          <div className="flex items-center gap-2">
            {token1 && <CurrencyLogo currency={token1} size={18} />}
            <RewardRow
              value={formatNumber((farm.pair.reserve1 * Number(stakedAmount?.toExact() ?? 0)) / farm.pair.totalSupply)}
              symbol={token1?.symbol}
            />
          </div>
        )}
      </HeadlessUiModal.BorderedContent>
      <HeadlessUiModal.BorderedContent className="flex flex-col gap-2 bg-dark-1000/40">
        <div className="flex justify-between">
          <Typography variant="xs" weight={700} className="text-secondary">
            {i18n._(t`Your Rewards`)}
          </Typography>
          <Typography variant="xs" weight={700} className="text-high-emphesis" component="span">
            {formatNumber(rewardValue, true)}
          </Typography>
        </div>

        {/* @ts-ignore TYPE NEEDS FIXING */}
        {farm?.rewards?.map((reward, i) => {
          return (
            <div className="flex items-center gap-2" key={i}>
              <CurrencyLogo currency={reward.currency} size={18} />
              {!secondaryRewardOnly ? (
                <>
                  {i === 0 && (
                    <RewardRow
                      value={formatNumber(pendingTele?.toSignificant(6) ?? 0)}
                      symbol={reward.currency.symbol}
                    />
                  )}
                  {i === 1 && <RewardRow value={formatNumber(pendingReward)} symbol={reward.currency.symbol} />}
                </>
              ) : (
                <RewardRow value={formatNumber(pendingReward)} symbol={reward.currency.symbol} />
              )}
            </div>
          )
        })}
      </HeadlessUiModal.BorderedContent>
      {farm.pair.type === PairType.KASHI && (
        <Button
          fullWidth
          color="pink"
          variant="empty"
          size="sm"
          className="!italic"
          onClick={() => router.push(`/lend/${farm.pair.id}`)}
        >
          {i18n._(t`View details on Kashi`)}
        </Button>
      )}
      <Button
        loading={pendingTx}
        fullWidth
        color="blue"
        disabled={
          pendingTx ||
          !((pendingTele && pendingTele.greaterThan(JSBI.BigInt(0))) || (pendingReward && Number(pendingReward) > 0))
        }
        onClick={onHarvest}
      >
        {i18n._(t`Harvest Rewards`)}
      </Button>
    </>
  )
}

export default InvestmentDetails