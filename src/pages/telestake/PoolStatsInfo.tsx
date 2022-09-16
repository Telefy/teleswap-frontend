/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { memo } from 'react'
import { useVaultPoolByKey } from 'state/pools/hooks'
import { DeserializedPool, DeserializedVaultFees, VaultKey } from 'state/types'
import { getAddress, getTelePoolAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { getPoolBlockInfo } from './helpers'
import { AprInfo, DurationAvg, PerformanceFee, TotalLocked, TotalStaked } from './Stat'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { useActiveWeb3React } from 'hooks/web3'
import { ChainId } from '@telefy/teleswap-core-sdk'
import AddTeleToMetamask from './AddTeleToMetamask'
import { useBlock } from 'services/graph'

interface ExpandedFooterProps {
  pool: DeserializedPool
  account: string
  showTotalStaked?: boolean
}

const PoolStatsInfo: React.FC<ExpandedFooterProps> = ({ pool, account, showTotalStaked = true }) => {
  const { chainId } = useActiveWeb3React()

  const { stakingToken, earningToken, totalStaked, contractAddress, vaultKey, userData: poolUserData } = pool

  const stakedBalance = poolUserData?.stakedBalance ? poolUserData.stakedBalance : BIG_ZERO

  const { totalCakeInVault, totalLockedAmount, fees, userData } = useVaultPoolByKey(vaultKey as VaultKey)
  const { performanceFeeAsDecimal } = fees as DeserializedVaultFees

  const tokenAddress = earningToken.address || ''
  const poolContractAddress = getAddress(contractAddress, chainId)
  const cakeVaultContractAddress = getTelePoolAddress(chainId || ChainId.MAINNET)
  const isMetaMaskInScope = !!window.ethereum?.isMetaMask

  return (
    <>
      <div className="box-content">
        {!vaultKey && <AprInfo pool={pool} />}
        {showTotalStaked && (
          <TotalStaked
            totalStaked={vaultKey ? totalCakeInVault || BIG_ZERO : totalStaked || BIG_ZERO}
            stakingToken={stakingToken}
          />
        )}
        {vaultKey && <TotalLocked totalLocked={totalLockedAmount || BIG_ZERO} lockedToken={stakingToken} />}
        {/* {vaultKey && <DurationAvg />} */}
        {vaultKey && <PerformanceFee userData={userData} performanceFeeAsDecimal={performanceFeeAsDecimal} />}
      </div>
      <div className="box-link">
        <a
          target="_blank"
          href={getExplorerLink(chainId || ChainId.MAINNET, earningToken.address, ExplorerDataType.ADDRESS)}
          rel="noreferrer"
        >
          See Token Info
        </a>
      </div>
      {poolContractAddress && (
        <div className="box-link">
          <a
            target="_blank"
            href={getExplorerLink(
              chainId || ChainId.MAINNET,
              vaultKey ? cakeVaultContractAddress : poolContractAddress,
              ExplorerDataType.ADDRESS
            )}
            rel="noreferrer"
          >
            View Contract
          </a>
        </div>
      )}
      {account && isMetaMaskInScope && tokenAddress && <AddTeleToMetamask token={earningToken} />}
    </>
  )
}

export default memo(PoolStatsInfo)
