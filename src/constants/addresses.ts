import { FACTORY_ADDRESS as V2_FACTORY_ADDRESS } from '@mazelon/teleswap-sdk'
import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from '@mazelon/teleswap-v3-sdk'
import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

type AddressMap = { [chainId: number]: string }

export const UNI_ADDRESS: AddressMap = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', false)
// export const UNI_ADDRESS: AddressMap = constructSameAddressMap('0xdE31bCDBCfa603C0E4923b93811b828F1dE86356', false)

export const MULTICALL2_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696', false),
  // ...constructSameAddressMap('0x78B1f110FFCf7eD179bf1e146995bA65D6aAc11f', false),
  [SupportedChainId.ARBITRUM_KOVAN]: '0xc80e33a6f02cf08557a0ca3d94d1474d73f64bc1',
  [SupportedChainId.ARBITRUM_ONE]: '0x7262248e04a0917178b1ea8250fb2cad2cb00c2a',
}
export const V2_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(
  // '0x1eD4f76F9e4AA7a89a0D8182264dE423f1791825',
  V2_FACTORY_ADDRESS,
  false
)
// console.log(V2_FACTORY_ADDRESS, '99999999999999999')

export const V2_ROUTER_ADDRESS: AddressMap = constructSameAddressMap(
  // '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  '0x43A5D560D7e6d7c09fb3903224616607Ad45864A',
  false
)

// most current governance contract address should always be the 0 index
// only support governance on mainnet
export const GOVERNANCE_ADDRESSES: AddressMap[] = [
  {
    [SupportedChainId.MAINNET]: '0x8280AF4D9D68F04d734f86d6AcC51680B68eb3FD',
  },
  {
    [SupportedChainId.MAINNET]: '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F',
  },
]
export const TIMELOCK_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0xE94F9458cCc9b236e3e8D3a82Cf75c79404e9897',
}

export const MERKLE_DISTRIBUTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e',
}
export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8',
}
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...constructSameAddressMap(V3_FACTORY_ADDRESS, true),
  [SupportedChainId.ARBITRUM_KOVAN]: '0xf594DEF7751440197879149f46E98b334E6DF1fa',
}
export const QUOTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', true),
  [SupportedChainId.ARBITRUM_KOVAN]: '0xAC06b88FA9adB7584A659b190F37F085352cB783',
}
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0xC36442b4a4522E871399CD717aBDD847Ab11FE88', true),
  [SupportedChainId.ARBITRUM_KOVAN]: '0x9E1498aE1F508E86462e8A0F213CF385A6622464',
}
export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.ROPSTEN]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.RINKEBY]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
}
export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x65770b5283117639760beA3F867b69b3697a91dd',
}
export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0xE592427A0AEce92De3Edee1F18E0157C05861564', true),
  [SupportedChainId.ARBITRUM_KOVAN]: '0x6ae2DE23F2BE35B3921ba15DA52e4b173667dCb9',
}
export const V3_MIGRATOR_ADDRESSES: AddressMap = constructSameAddressMap(
  '0xA5644E29708357803b5A882D272c41cC0dF92B34',
  true
)
