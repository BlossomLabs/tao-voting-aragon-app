import { subscription } from "@1hive/connect-core";
import { BigNumber } from "ethers";
import {
  Address,
  SubscriptionCallback,
  SubscriptionResult,
} from "@1hive/connect-types";

import ERC20 from "./ERC20";
import Setting from "./Setting";
import CastVote from "./CastVote";
import { CastVoteData, DisputableVotingConnector, VoteData } from "../types";
import {
  bn,
  formatBn,
  PCT_BASE,
  PCT_DECIMALS,
  currentTimestampEvm,
} from "../helpers";

export default class Vote {
  #connector: DisputableVotingConnector;

  readonly id: string;
  readonly votingId: string;
  readonly votingToken: ERC20;
  readonly voteId: string;
  readonly creator: string;
  readonly originalCreator: string;
  readonly context: string;
  readonly voteStatus: string;
  readonly startDate: string;
  readonly totalPower: string;
  readonly snapshotBlock: string;
  readonly yeas: string;
  readonly nays: string;
  readonly quietEndingExtensionDuration: string;
  readonly quietEndingSnapshotSupport: string;
  readonly script: string;
  readonly executedAt: string;
  readonly isAccepted: boolean;
  readonly casts?: CastVoteData[];
  readonly setting: Setting;

  constructor(data: VoteData, connector: DisputableVotingConnector) {
    this.#connector = connector;

    this.setting = new Setting(data.setting);
    this.votingToken = new ERC20(data.votingToken, this.#connector.ethersProvider);
    this.id = data.id;
    this.votingId = data.votingId;
    this.voteId = data.voteId;
    this.creator = data.creator;
    this.originalCreator = data.originalCreator;
    this.context = data.context;
    this.voteStatus = data.status;
    this.startDate = data.startDate;
    this.totalPower = data.totalPower;
    this.snapshotBlock = data.snapshotBlock;
    this.yeas = data.yeas;
    this.nays = data.nays;
    this.quietEndingExtensionDuration = data.quietEndingExtensionDuration;
    this.quietEndingSnapshotSupport = data.quietEndingSnapshotSupport;
    this.script = data.script;
    this.executedAt = data.executedAt;
    this.isAccepted = data.isAccepted;
    this.casts = data.castVotes;
  }

  get hasEnded(): boolean {
    const currentTimestamp = currentTimestampEvm();
    return currentTimestamp.gte(this.endDate);
  }

  get endDate(): string {
    const baseVoteEndDate = bn(this.startDate).add(bn(this.setting.voteTime));
    const lastComputedEndDate = baseVoteEndDate.add(
      bn(this.quietEndingExtensionDuration)
    );

    // The last computed end date is correct if we have not passed it yet or if no flip was detected in the last extension
    const currentTimestamp = currentTimestampEvm();
    if (currentTimestamp.lt(lastComputedEndDate) || !this.wasFlipped) {
      return lastComputedEndDate.toString();
    }

    // Otherwise, since the last computed end date was reached and included a flip, we need to extend the end date by one more period
    return lastComputedEndDate
      .add(bn(this.setting.quietEndingExtension))
      .toString();
  }

  get currentQuietEndingExtensionDuration(): string {
    const actualEndDate = bn(this.endDate);
    const baseVoteEndDate = bn(this.startDate).add(bn(this.setting.voteTime));

    // To know exactly how many extensions due to quiet ending we had, we subtract
    // the base vote and pause durations to the actual vote end date
    return actualEndDate.sub(baseVoteEndDate).toString();
  }

  get yeasPct(): string {
    return this._votingPowerPct(this.yeas);
  }

  get naysPct(): string {
    return this._votingPowerPct(this.nays);
  }

  get formattedYeas(): string {
    return formatBn(this.yeas, this.votingToken.decimals);
  }

  get formattedYeasPct(): string {
    return formatBn(this.yeasPct, PCT_DECIMALS);
  }

  get formattedNays(): string {
    return formatBn(this.nays, this.votingToken.decimals);
  }

  get formattedNaysPct(): string {
    return formatBn(this.naysPct, PCT_DECIMALS);
  }

  get formattedTotalPower(): string {
    return formatBn(this.totalPower, this.votingToken.decimals);
  }

  get status(): string {
    if (this.hasEnded) {
      if (this.voteStatus === "Scheduled") {
        return this.isAccepted ? "Accepted" : "Rejected";
      }
    }
    return this.voteStatus;
  }

  get wasFlipped(): boolean {
    // If there was no snapshot taken, it means no one voted during the quiet ending period. Thus, it cannot have been flipped.
    if (this.quietEndingSnapshotSupport == "Absent") {
      return false;
    }

    // Otherwise, we calculate if the vote was flipped by comparing its current acceptance state to its last state at the start of the extension period
    const wasInitiallyAccepted = this.quietEndingSnapshotSupport == "Yea";
    const currentExtensions = bn(this.quietEndingExtensionDuration).div(
      bn(this.setting.quietEndingExtension)
    );
    const wasAcceptedBeforeLastFlip =
      wasInitiallyAccepted == currentExtensions.mod(bn("2")).eq(bn("0"));
    return wasAcceptedBeforeLastFlip != this.isAccepted;
  }

  async hasEndedExecutionDelay(): Promise<boolean> {
    const currentTimestamp = currentTimestampEvm();
    const executionDelayEndDate = bn(this.endDate).add(
      this.setting.executionDelay
    );
    return currentTimestamp.gte(executionDelayEndDate);
  }

  async canVote(voterAddress: Address): Promise<boolean> {
    return (
      !this.hasEnded &&
      this.voteStatus === "Scheduled" &&
      !(await this.hasVoted(voterAddress)) &&
      (await this.votingPower(voterAddress)).gt(bn(0))
    );
  }

  async canExecute(): Promise<boolean> {
    return (
      this.isAccepted &&
      this.voteStatus === "Scheduled" &&
      (await this.hasEndedExecutionDelay())
    );
  }

  async votingPower(voterAddress: Address): Promise<BigNumber> {
    return this.votingToken.balanceAt(voterAddress, this.snapshotBlock);
  }

  async formattedVotingPower(voterAddress: Address): Promise<string> {
    const balance = await this.votingToken.balanceAt(voterAddress, this.snapshotBlock);
    return formatBn(balance, this.votingToken.decimals);
  }

  async hasVoted(voterAddress: Address): Promise<boolean> {
    const castVote = await this.castVote(voterAddress);
    return castVote !== null;
  }

  onHasVoted(
    voterAddress: Address,
    callback?: SubscriptionCallback<any>
  ): SubscriptionResult<any> {
    return subscription<any>(
      (error: Error | null, castVote: any) => {
        callback?.(error, error ? undefined : ((castVote !== null) as boolean));
      },
      (callback) =>
        this.#connector.onCastVote(this.castVoteId(voterAddress), callback)
    );
  }

  castVoteId(voterAddress: Address): string {
    return `${this.id}-cast-${voterAddress.toLowerCase()}`;
  }

  async castVote(voterAddress: Address): Promise<CastVote | null> {
    return this.#connector.castVote(this.castVoteId(voterAddress));
  }

  onCastVote(
    voterAddress: Address,
    callback?: SubscriptionCallback<CastVote | null>
  ): SubscriptionResult<CastVote | null> {
    return subscription<CastVote | null>(callback, (callback) =>
      this.#connector.onCastVote(this.castVoteId(voterAddress), callback)
    );
  }

  async castVotes({ first = 1000, skip = 0 } = {}): Promise<CastVote[]> {
    return this.#connector.castVotes(this.id, first, skip);
  }

  onCastVotes(
    { first = 1000, skip = 0 } = {},
    callback?: SubscriptionCallback<CastVote[]>
  ): SubscriptionResult<CastVote[]> {
    return subscription<CastVote[]>(callback, (callback) =>
      this.#connector.onCastVotes(this.id, first, skip, callback)
    );
  }

  _votingPowerPct(num: string): string {
    const totalPower = bn(this.totalPower);
    return bn(num).mul(PCT_BASE).div(totalPower).toString();
  }
}
