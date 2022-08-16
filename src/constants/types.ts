import BigNumber from 'bignumber.js'
import { ChainTokenMap, Token } from '@telefy/teleswap-core-sdk'
export enum FetchStatus {
  Idle = 'IDLE',
  Fetching = 'FETCHING',
  Fetched = 'FETCHED',
  Failed = 'FAILED',
}
export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
  projectLink?: string
  logoURI?: string
}
export interface Address {
  1: string
  3?: string
  4?: string
  5?: string
  42?: string
  144545313136048?: string
  42161?: string
  42220?: string
  122?: string
}
export type AddressMap = { [chainId: number]: string }
interface PoolConfigBaseProps {
  sousId: number
  contractAddress: AddressMap
  poolCategory: PoolCategory
  tokenPerBlock: string
  sortOrder?: number
  harvest?: boolean
  isFinished?: boolean
  enableEmergencyWithdraw?: boolean
  version?: number
}
export interface SerializedPoolConfig extends PoolConfigBaseProps {
  earningToken: ChainTokenMap
  stakingToken: ChainTokenMap
}
export enum PoolCategory {
  'COMMUNITY' = 'Community',
  'CORE' = 'Core',
  'ETHEREUM' = 'Ethereum', // Pools using native ETH behave differently than pools using a token
  'AUTO' = 'Auto',
}
export interface DeserializedPoolConfig extends PoolConfigBaseProps {
  earningToken: Token
  stakingToken: Token
}
interface FarmConfigBaseProps {
  pid: number
  v1pid?: number
  lpSymbol: string
  lpAddresses: Address
  multiplier?: string
  isCommunity?: boolean
  auctionHostingStartSeconds?: number
  auctionHostingEndDate?: string
  dual?: {
    rewardPerBlock: number
    earnLabel: string
    endBlock: number
  }
}
export interface SerializedFarmConfig extends FarmConfigBaseProps {
  token: SerializedToken
  quoteToken: SerializedToken
}
export interface DeserializedFarmConfig extends FarmConfigBaseProps {
  token: Token
  quoteToken: Token
}
export type Images = {
  lg: string
  md: string
  sm: string
  ipfs?: string
}
export type TeamImages = {
  alt: string
} & Images

export type Team = {
  id: number
  name: string
  description: string
  isJoinable?: boolean
  users: number
  points: number
  images: TeamImages
  background: string
  textColor: string
}
export type CampaignType = 'ifo' | 'teambattle' | 'participation'
export type TranslatableText =
  | string
  | {
      key: string
      data?: {
        [key: string]: string | number
      }
    }
export type Campaign = {
  id: string
  type: CampaignType
  title?: TranslatableText
  description?: TranslatableText
  badge?: string
}

export enum LotteryStatus {
  PENDING = 'pending',
  OPEN = 'open',
  CLOSE = 'close',
  CLAIMABLE = 'claimable',
}

export interface LotteryTicket {
  id: string
  number: string
  status: boolean
  rewardBracket?: number
  roundId?: string
  cakeReward?: string
}

export interface LotteryTicketClaimData {
  ticketsWithUnclaimedRewards: LotteryTicket[]
  allWinningTickets: LotteryTicket[]
  cakeTotal: BigNumber
  roundId: string
}
