import BigNumber from 'bignumber.js'
import { ChainTokenMap, Token } from '@telefy/teleswap-core-sdk'
import { Dispatch, SetStateAction } from 'react'
import { DeserializedLockedVaultUser } from 'state/types'
import { VaultPosition, VaultPositionParams } from 'utils/telePool'

type VoidFn = () => void

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

export interface ModalValidator {
  isValidAmount: boolean
  isValidDuration: boolean
  isOverMax: boolean
}

export type PrepConfirmArg = (arg: ValidatorArg) => ValiratorReturn
export interface ValidatorArg {
  duration: number
}
export interface ValiratorReturn {
  finalLockedAmount?: number
  finalDuration?: number
}

export interface LockedModalBodyButtonPropsType {
  onDismiss?: VoidFn
  stakingToken: Token
  currentBalance?: BigNumber
  lockedAmount: BigNumber
  editAmountOnly?: React.ReactElement
  validator?: (arg: ValidatorArg) => ModalValidator
  duration: number
  pendingTx: boolean
  handleConfirmClick: () => Promise<void>
}

export interface LockedModalBodyPropsType {
  onDismiss?: VoidFn
  stakingToken: Token
  currentBalance?: BigNumber
  lockedAmount: BigNumber
  editAmountOnly?: React.ReactElement
  validator?: (arg: ValidatorArg) => ModalValidator
  customOverview?: ({ isValidDuration, duration }: { isValidDuration: boolean; duration: number }) => React.ReactElement
  duration: number
  setDuration: Dispatch<SetStateAction<number>>
  usdValueStaked?: number
}
export interface LockDurationFieldPropsType {
  duration: number
  setDuration: Dispatch<SetStateAction<number>>
  isOverMax: boolean
}
export interface OverviewPropsType {
  usdValueStaked: number
  lockedAmount: number
  openCalculator: () => void
  duration: number
  isValidDuration: boolean
  newDuration?: number
  newLockedAmount?: number
  lockStartTime?: string
  lockEndTime?: string
  showLockWarning?: boolean
}
export interface LockedStakingApyPropsType {
  stakingToken: Token
  stakingTokenBalance: BigNumber
  userData: DeserializedLockedVaultUser
}
export interface AddTeleToLockedModalComponentPropsType {
  isOpen: boolean
  onDismiss?: VoidFn
  stakingToken: Token
  currentBalance: BigNumber
  currentLockedAmount: BigNumber
  lockStartTime?: string
  lockEndTime?: string
  stakingTokenBalance: BigNumber
}
export interface AfterLockedActionsPropsType {
  lockEndTime: string
  lockStartTime: string
  currentLockedAmount: number
  stakingToken: Token
  position: VaultPosition
  isInline?: boolean
}
export interface LockedActionsPropsType extends VaultPositionParams {
  lockStartTime: string
  stakingToken: Token
  stakingTokenBalance: BigNumber
  lockedAmount: BigNumber
}
