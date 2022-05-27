import { Contract } from '@ethersproject/contracts'
import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { abi as UNI_ABI } from '@uniswap/governance/build/Uni.json'
import { abi as STAKING_REWARDS_ABI } from '@uniswap/liquidity-staker/build/StakingRewards.json'
import { abi as MERKLE_DISTRIBUTOR_ABI } from '@uniswap/merkle-distributor/build/MerkleDistributor.json'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { abi as V3FactoryABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import { abi as V3PoolABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { abi as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import { abi as V2MigratorABI } from '@uniswap/v3-periphery/artifacts/contracts/V3Migrator.sol/V3Migrator.json'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'

import ARGENT_WALLET_DETECTOR_ABI from 'abis/argent-wallet-detector.json'
import ENS_PUBLIC_RESOLVER_ABI from 'abis/ens-public-resolver.json'
import ENS_ABI from 'abis/ens-registrar.json'
import ERC20_ABI from 'abis/erc20.json'
import ERC20_BYTES32_ABI from 'abis/erc20_bytes32.json'
import MULTICALL_ABI from 'abis/multicall2.json'
import { Unisocks } from 'abis/types/Unisocks'
import UNISOCKS_ABI from 'abis/unisocks.json'
import WETH_ABI from 'abis/weth.json'
import EIP_2612 from 'abis/eip_2612.json'

// sushi staking
import BENTOBOX_ABI from 'abis/bentobox.json'
import BORING_HELPER_ABI from 'abis/boring-helper.json'
import DIALER_CONTRACT_ABI from 'abis/dialer-contract.json'
import MINICHEF_ABI from 'abis/minichef-v2.json'
import TELE_ABI from 'abis/tele.json'
import CLONE_REWARDER_ABI from 'abis/clone-rewarder.json'
import COMPLEX_REWARDER_ABI from 'abis/complex-rewarder.json'

import {
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  QUOTER_ADDRESSES,
  V3_CORE_FACTORY_ADDRESSES,
  V3_MIGRATOR_ADDRESSES,
  ARGENT_WALLET_DETECTOR_ADDRESS,
  GOVERNANCE_ADDRESSES,
  MERKLE_DISTRIBUTOR_ADDRESS,
  MULTICALL2_ADDRESSES,
  V2_ROUTER_ADDRESS,
  ENS_REGISTRAR_ADDRESSES,
  SOCKS_CONTROLLER_ADDRESSES,
} from 'constants/addresses'

// sushi staking
import {
  BENTOBOX_ADDRESS,
  BORING_HELPER_ADDRESS,
  DIALER_CONTRACT_ADDRESS,
  MINICHEF_ADDRESS,
  TELE_ADDRESS,
} from '@telefy/teleswap-core-sdk'
import { OLD_FARMS } from 'config/farms'
// sushi staking

import { abi as NFTPositionManagerABI } from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { useMemo } from 'react'
import { Quoter, UniswapV3Factory, UniswapV3Pool } from 'types/v3'
import { NonfungiblePositionManager } from 'types/v3/NonfungiblePositionManager'
import { V3Migrator } from 'types/v3/V3Migrator'
import { getContract } from 'utils'
import { Erc20, ArgentWalletDetector, EnsPublicResolver, EnsRegistrar, Multicall2, Weth } from '../abis/types'
import { UNI, WETH9_EXTENDED } from '../constants/tokens'
import { useActiveWeb3React } from './web3'
import { SupportedChainId as ChainId } from 'constants/chains'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account, chainId } = useActiveWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]) as T
}

export function useV2MigratorContract() {
  return useContract<V3Migrator>(V3_MIGRATOR_ADDRESSES, V2MigratorABI, true)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean) {
  const { chainId } = useActiveWeb3React()
  return useContract<Weth>(chainId ? WETH9_EXTENDED[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract() {
  return useContract<ArgentWalletDetector>(ARGENT_WALLET_DETECTOR_ADDRESS, ARGENT_WALLET_DETECTOR_ABI, false)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
  return useContract<EnsRegistrar>(ENS_REGISTRAR_ADDRESSES, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean) {
  return useContract<EnsPublicResolver>(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useV2RouterContract(): Contract | null {
  return useContract(V2_ROUTER_ADDRESS, IUniswapV2Router02ABI, true)
}

export function useMulticall2Contract() {
  return useContract<Multicall2>(MULTICALL2_ADDRESSES, MULTICALL_ABI, false) as Multicall2
}

export function useMerkleDistributorContract() {
  return useContract(MERKLE_DISTRIBUTOR_ADDRESS, MERKLE_DISTRIBUTOR_ABI, true)
}

export function useGovernanceContracts(): (Contract | null)[] {
  const { library, account, chainId } = useActiveWeb3React()

  return useMemo(() => {
    if (!library || !chainId) {
      return []
    }

    return GOVERNANCE_ADDRESSES.filter((addressMap) => Boolean(addressMap[chainId])).map((addressMap) => {
      try {
        return getContract(addressMap[chainId], GOVERNANCE_ABI, library, account ? account : undefined)
      } catch (error) {
        console.error('Failed to get contract', error)
        return null
      }
    })
  }, [library, chainId, account])
}

export function useUniContract() {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? UNI[chainId]?.address : undefined, UNI_ABI, true)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean) {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
}

export function useSocksController(): Unisocks | null {
  return useContract<Unisocks>(SOCKS_CONTROLLER_ADDRESSES, UNISOCKS_ABI, false)
}

export function useV3NFTPositionManagerContract(withSignerIfPossible?: boolean): NonfungiblePositionManager | null {
  return useContract<NonfungiblePositionManager>(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
    NFTPositionManagerABI,
    withSignerIfPossible
  )
}

export function useV3Factory() {
  return useContract<UniswapV3Factory>(V3_CORE_FACTORY_ADDRESSES, V3FactoryABI) as UniswapV3Factory | null
}

export function useV3Pool(address: string | undefined) {
  return useContract<UniswapV3Pool>(address, V3PoolABI)
}

export function useV3Quoter() {
  return useContract<Quoter>(QUOTER_ADDRESSES, QuoterABI)
}

// Sushi Staking
export function useBoringHelperContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  // TODO ramin update in sdk
  return useContract(
    chainId
      ? chainId === ChainId.KOVAN
        ? '0x5bd6e4eFA335192FDA5D6B42a344ccA3d45894B8'
        : BORING_HELPER_ADDRESS[chainId]
      : undefined,
    BORING_HELPER_ABI,
    false
  )
}
export function useBentoBoxContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? BENTOBOX_ADDRESS[chainId] : undefined, BENTOBOX_ABI, withSignerIfPossible)
}
export function useDialerContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? DIALER_CONTRACT_ADDRESS[chainId] : undefined, DIALER_CONTRACT_ABI, withSignerIfPossible)
}
export function useMiniChefContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MINICHEF_ADDRESS[chainId] : undefined, MINICHEF_ABI, withSignerIfPossible)
}
export function useOldFarmsContract(withSignerIfPossibe?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? OLD_FARMS[chainId] : undefined, MINICHEF_ABI, withSignerIfPossibe)
}
export function useTeleContract(withSignerIfPossible = true): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? TELE_ADDRESS[chainId] : undefined, TELE_ABI, withSignerIfPossible)
}
// @ts-ignore TYPE NEEDS FIXING
export function useComplexRewarderContract(address, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, COMPLEX_REWARDER_ABI, withSignerIfPossible)
}
// @ts-ignore TYPE NEEDS FIXING
export function useCloneRewarderContract(address, withSignerIfPossibe?: boolean): Contract | null {
  return useContract(address, CLONE_REWARDER_ABI, withSignerIfPossibe)
}
const MULTICALL_ADDRESS = {
  [ChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [ChainId.ROPSTEN]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [ChainId.RINKEBY]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [ChainId.GOERLI]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [ChainId.KOVAN]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [ChainId.CELO]: '0x3d0B3b816DC1e0825808F27510eF7Aa5E3136D75',
  [ChainId.FUSE]: '0x393B6DC9B00E18314888678721eC0e923FC5f49D',
}
export function useInterfaceMulticall(): Contract | null | undefined {
  return useContract(MULTICALL_ADDRESS, MULTICALL_ABI, false)
}
