import { SubscriptionCallback, SubscriptionHandler } from '@1hive/connect-types'

import ERC20 from './models/ERC20'
import Vote from './models/Vote'
import Voter from './models/Voter'
import Setting from './models/Setting'
import CastVote from './models/CastVote'

export interface TaoVotingData {
  id: string
  dao: string
  token: ERC20Data
  setting: SettingData
  representativeManager: string
}

export interface VoteData {
  id: string
  votingId: string
  voteId: string
  creator: string
  originalCreator: string
  duration: string
  quietEndingExtension: string
  context: string
  status: string
  settingId: string
  startDate: string
  totalPower: string
  snapshotBlock: string
  yeas: string
  nays: string
  quietEndingExtensionDuration: string
  quietEndingSnapshotSupport: string
  script: string
  executedAt: string
  tokenId: string
  tokenSymbol: string
  tokenDecimals: string
  isAccepted: boolean
  minimumAcceptanceQuorumPct: string
  delegatedVotingPeriod: string
  supportRequiredPct: string
  quietEndingPeriod: string
  executionDelay: string
  castVotes?: CastVoteData[]
}

export interface CastVoteData {
  id: string
  voteId: string
  voterId: string
  caster: string
  supports: boolean
  stake: string
  createdAt: string
}

export interface VoterData {
  id: string
  votingId: string
  address: string
  representative: string
  representativeFor: string
}

export interface SettingData {
  id: string
  votingId: string
  settingId: string
  voteTime: string
  supportRequiredPct: string
  minimumAcceptanceQuorumPct: string
  delegatedVotingPeriod: string
  quietEndingPeriod: string
  quietEndingExtension: string
  executionDelay: string
  createdAt: string
}

export interface ERC20Data {
  id: string
  name: string
  symbol: string
  decimals: string
}

export interface DisputableVotingConnector {
  disconnect(): Promise<void>
  disputableVoting(disputableVoting: string): Promise<TaoVotingData>
  onDisputableVoting(
    disputableVoting: string,
    callback: SubscriptionCallback<TaoVotingData>
  ): SubscriptionHandler
  currentSetting(disputableVoting: string): Promise<Setting>
  onCurrentSetting(
    disputableVoting: string,
    callback: SubscriptionCallback<Setting>
  ): SubscriptionHandler
  setting(settingId: string): Promise<Setting>
  onSetting(
    settingId: string,
    callback: SubscriptionCallback<Setting>
  ): SubscriptionHandler
  settings(
    disputableVoting: string,
    first: number,
    skip: number
  ): Promise<Setting[]>
  onSettings(
    disputableVoting: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<Setting[]>
  ): SubscriptionHandler
  vote(voteId: string): Promise<Vote>
  onVote(
    voteId: string,
    callback: SubscriptionCallback<Vote>
  ): SubscriptionHandler
  votes(disputableVoting: string, first: number, skip: number): Promise<Vote[]>
  onVotes(
    disputableVoting: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<Vote[]>
  ): SubscriptionHandler
  castVote(castVoteId: string): Promise<CastVote | null>
  onCastVote(
    castVoteId: string,
    callback: SubscriptionCallback<CastVote | null>
  ): SubscriptionHandler
  castVotes(voteId: string, first: number, skip: number): Promise<CastVote[]>
  onCastVotes(
    voteId: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<CastVote[]>
  ): SubscriptionHandler
  voter(votingId: string, voterAddress: string): Promise<Voter>
  onVoter(
    votingId: string,
    voterAddress: string,
    callback: SubscriptionCallback<Voter>
  ): SubscriptionHandler
  ERC20(tokenAddress: string): Promise<ERC20>
  onERC20(
    tokenAddress: string,
    callback: SubscriptionCallback<ERC20>
  ): SubscriptionHandler
}
