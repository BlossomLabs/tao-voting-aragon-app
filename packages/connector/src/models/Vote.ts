import { subscription } from "@1hive/connect-core"
import { BigNumber } from "ethers"
import {
  Address,
  SubscriptionCallback,
  SubscriptionResult,
} from "@1hive/connect-types"

import ERC20 from "./ERC20"
import Setting from "./Setting"
import CastVote from "./CastVote"
import { CastVoteData, IDisputableVotingConnector, VoteData } from "../types"
import {
  bn,
  formatBn,
  PCT_BASE,
  PCT_DECIMALS,
  currentTimestampEvm,
} from "../helpers"

export default class Vote {
  #connector: IDisputableVotingConnector

  readonly id: string
  readonly votingId: string
  readonly voteId: string
  readonly creator: string
  readonly originalCreator: string
  readonly duration: string
  readonly context: string
  readonly voteStatus: string
  readonly settingId: string
  readonly startDate: string
  readonly totalPower: string
  readonly snapshotBlock: string
  readonly yeas: string
  readonly nays: string
  readonly quietEndingExtension: string
  readonly quietEndingExtensionDuration: string
  readonly quietEndingSnapshotSupport: string
  readonly script: string
  readonly executedAt: string
  readonly isAccepted: boolean
  readonly tokenId: string
  readonly tokenSymbol: string
  readonly tokenDecimals: string
  readonly minimumAcceptanceQuorumPct: string
  readonly delegatedVotingPeriod: string
  readonly supportRequiredPct: string
  readonly quietEndingPeriod: string
  readonly executionDelay: string
  readonly casts?: CastVoteData[]

  constructor(data: VoteData, connector: IDisputableVotingConnector) {
    this.#connector = connector

    this.id = data.id
    this.votingId = data.votingId
    this.voteId = data.voteId
    this.duration = data.duration
    this.quietEndingExtension = data.quietEndingExtension
    this.creator = data.creator
    this.originalCreator = data.originalCreator
    this.context = data.context
    this.voteStatus = data.status
    this.settingId = data.settingId
    this.startDate = data.startDate
    this.totalPower = data.totalPower
    this.snapshotBlock = data.snapshotBlock
    this.yeas = data.yeas
    this.nays = data.nays
    this.quietEndingExtensionDuration = data.quietEndingExtensionDuration
    this.quietEndingSnapshotSupport = data.quietEndingSnapshotSupport
    this.script = data.script
    this.executedAt = data.executedAt
    this.isAccepted = data.isAccepted
    this.tokenId = data.tokenId
    this.tokenSymbol = data.tokenSymbol
    this.tokenDecimals = data.tokenDecimals
    this.minimumAcceptanceQuorumPct = data.minimumAcceptanceQuorumPct
    this.delegatedVotingPeriod = data.delegatedVotingPeriod
    this.supportRequiredPct = data.supportRequiredPct
    this.quietEndingPeriod = data.quietEndingPeriod
    this.executionDelay = data.executionDelay
    this.casts = data.castVotes
  }

  get hasEnded(): boolean {
    const currentTimestamp = currentTimestampEvm()
    return currentTimestamp.gte(this.endDate)
  }

  get endDate(): string {
    const baseVoteEndDate = bn(this.startDate).add(bn(this.duration))
    const lastComputedEndDate = baseVoteEndDate.add(
      bn(this.quietEndingExtensionDuration)
    )

    // The last computed end date is correct if we have not passed it yet or if no flip was detected in the last extension
    const currentTimestamp = currentTimestampEvm()
    if (currentTimestamp.lt(lastComputedEndDate) || !this.wasFlipped) {
      return lastComputedEndDate.toString()
    }

    // Otherwise, since the last computed end date was reached and included a flip, we need to extend the end date by one more period
    return lastComputedEndDate.add(bn(this.quietEndingExtension)).toString()
  }

  get currentQuietEndingExtensionDuration(): string {
    const actualEndDate = bn(this.endDate)
    const baseVoteEndDate = bn(this.startDate).add(bn(this.duration))

    // To know exactly how many extensions due to quiet ending we had, we subtract
    // the base vote and pause durations to the actual vote end date
    return actualEndDate.sub(baseVoteEndDate).toString()
  }

  get yeasPct(): string {
    return this._votingPowerPct(this.yeas)
  }

  get naysPct(): string {
    return this._votingPowerPct(this.nays)
  }

  get formattedYeas(): string {
    return formatBn(this.yeas, this.tokenDecimals)
  }

  get formattedYeasPct(): string {
    return formatBn(this.yeasPct, PCT_DECIMALS)
  }

  get formattedNays(): string {
    return formatBn(this.nays, this.tokenDecimals)
  }

  get formattedNaysPct(): string {
    return formatBn(this.naysPct, PCT_DECIMALS)
  }

  get formattedTotalPower(): string {
    return formatBn(this.totalPower, this.tokenDecimals)
  }

  get status(): string {
    if (this.hasEnded) {
      if (this.voteStatus === "Scheduled") {
        return this.isAccepted ? "Accepted" : "Rejected"
      }
    }
    return this.voteStatus
  }

  get wasFlipped(): boolean {
    // If there was no snapshot taken, it means no one voted during the quiet ending period. Thus, it cannot have been flipped.
    if (this.quietEndingSnapshotSupport == "Absent") {
      return false
    }

    // Otherwise, we calculate if the vote was flipped by comparing its current acceptance state to its last state at the start of the extension period
    const wasInitiallyAccepted = this.quietEndingSnapshotSupport == "Yea"
    const currentExtensions = bn(this.quietEndingExtensionDuration).div(
      bn(this.quietEndingExtension)
    )
    const wasAcceptedBeforeLastFlip =
      wasInitiallyAccepted == currentExtensions.mod(bn("2")).eq(bn("0"))
    return wasAcceptedBeforeLastFlip != this.isAccepted
  }

  async hasEndedExecutionDelay(): Promise<boolean> {
    const setting = await this.setting()
    const currentTimestamp = currentTimestampEvm()
    const executionDelayEndDate = bn(this.endDate).add(setting.executionDelay)
    return currentTimestamp.gte(executionDelayEndDate)
  }

  async canVote(voterAddress: Address): Promise<boolean> {
    return (
      !this.hasEnded &&
      this.voteStatus === "Scheduled" &&
      !(await this.hasVoted(voterAddress)) &&
      (await this.votingPower(voterAddress)).gt(bn(0))
    )
  }

  async canExecute(): Promise<boolean> {
    return (
      this.isAccepted &&
      this.voteStatus === "Scheduled" &&
      (await this.hasEndedExecutionDelay())
    )
  }

  async votingPower(voterAddress: Address): Promise<BigNumber> {
    const token = await this.token()
    return token.balanceAt(voterAddress, this.snapshotBlock)
  }

  async formattedVotingPower(voterAddress: Address): Promise<string> {
    const token = await this.token()
    const balance = await token.balanceAt(voterAddress, this.snapshotBlock)
    return formatBn(balance, token.decimals)
  }

  async token(): Promise<ERC20> {
    return this.#connector.ERC20(this.tokenId)
  }

  async hasVoted(voterAddress: Address): Promise<boolean> {
    const castVote = await this.castVote(voterAddress)
    return castVote !== null
  }

  onHasVoted(
    voterAddress: Address,
    callback?: SubscriptionCallback<any>
  ): SubscriptionResult<any> {
    return subscription<any>(
      (error: Error | null, castVote: any) => {
        callback?.(error, error ? undefined : ((castVote !== null) as boolean))
      },
      (callback) =>
        this.#connector.onCastVote(this.castVoteId(voterAddress), callback)
    )
  }

  castVoteId(voterAddress: Address): string {
    return `${this.id}-cast-${voterAddress.toLowerCase()}`
  }

  async castVote(voterAddress: Address): Promise<CastVote | null> {
    return this.#connector.castVote(this.castVoteId(voterAddress))
  }

  onCastVote(
    voterAddress: Address,
    callback?: SubscriptionCallback<CastVote | null>
  ): SubscriptionResult<CastVote | null> {
    return subscription<CastVote | null>(callback, (callback) =>
      this.#connector.onCastVote(this.castVoteId(voterAddress), callback)
    )
  }

  async castVotes({ first = 1000, skip = 0 } = {}): Promise<CastVote[]> {
    return this.#connector.castVotes(this.id, first, skip)
  }

  onCastVotes(
    { first = 1000, skip = 0 } = {},
    callback?: SubscriptionCallback<CastVote[]>
  ): SubscriptionResult<CastVote[]> {
    return subscription<CastVote[]>(callback, (callback) =>
      this.#connector.onCastVotes(this.id, first, skip, callback)
    )
  }

  async setting(): Promise<Setting> {
    return this.#connector.setting(this.settingId)
  }

  onSetting(
    callback?: SubscriptionCallback<Setting>
  ): SubscriptionResult<Setting> {
    return subscription<Setting>(callback, (callback) =>
      this.#connector.onSetting(this.settingId, callback)
    )
  }

  _votingPowerPct(num: string): string {
    const totalPower = bn(this.totalPower)
    return bn(num).mul(PCT_BASE).div(totalPower).toString()
  }
}
