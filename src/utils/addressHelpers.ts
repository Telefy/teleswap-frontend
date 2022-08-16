/* eslint-disable react-hooks/rules-of-hooks */
import { DIALER_CONTRACT_ADDRESS, ChainTokenMap, ChainId, TELE_POOL_ADDRESS } from '@telefy/teleswap-core-sdk'
import { AddressMap } from 'constants/types'

export const getAddress = (address: AddressMap, chainId: number | undefined): string => {
  return chainId ? (address[chainId] ? address[chainId] : address[ChainId.MAINNET]) : address[ChainId.MAINNET]
}

export const getTelePoolAddress = (chainId: number): string => {
  return getAddress(TELE_POOL_ADDRESS, chainId)
}

export const getDialerContractAddress = (chainId: number) => {
  return getAddress(DIALER_CONTRACT_ADDRESS, chainId)
}
// export const getMulticallAddress = () => {
//   return getAddress(addresses.multiCall)
// }

// export const getTradingCompetitionAddressMobox = () => {
//   return getAddress(addresses.tradingCompetitionMobox)
// }

// export const getTradingCompetitionAddressMoD = () => {
//   return getAddress(addresses.tradingCompetitionMoD)
// }

// export const getEasterNftAddress = () => {
//   return getAddress(addresses.easterNft)
// }

// export const getCakeVaultAddress = () => {
//   return getAddress(addresses.cakeVault)
// }

// export const getChainlinkOracleAddress = () => {
//   return getAddress(addresses.chainlinkOracle)
// }
// export const getBunnySpecialCakeVaultAddress = () => {
//   return getAddress(addresses.bunnySpecialCakeVault)
// }
// export const getBunnySpecialPredictionAddress = () => {
//   return getAddress(addresses.bunnySpecialPrediction)
// }
// export const getBunnySpecialLotteryAddress = () => {
//   return getAddress(addresses.bunnySpecialLottery)
// }
// export const getBunnySpecialXmasAddress = () => {
//   return getAddress(addresses.bunnySpecialXmas)
// }
// export const getFarmAuctionAddress = () => {
//   return getAddress(addresses.farmAuction)
// }
// export const getAnniversaryAchievement = () => {
//   return getAddress(addresses.AnniversaryAchievement)
// }
// export const getGalaxyNFTClaimingAddress = () => {
//   return getAddress(addresses.galaxyNftClaiming)
// }
// export const getNftMarketAddress = () => {
//   return getAddress(addresses.nftMarket)
// }
// export const getNftSaleAddress = () => {
//   return getAddress(addresses.nftSale)
// }
// export const getPancakeSquadAddress = () => {
//   return getAddress(addresses.pancakeSquad)
// }
