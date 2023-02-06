import { subscription } from "@1hive/connect-core";
import { SubscriptionCallback, SubscriptionResult } from "@1hive/connect-types";

import Voter from "./Voter";
import { CastVoteData, DisputableVotingConnector } from "../types";

function parseVoterId(voterId: string): {
  votingAddress: string
  voterAddress: string
} {
  const [votingAddress, , voterAddress] = voterId.split("-");

  return {
    votingAddress,
    voterAddress,
  };
}
export default class CastVote {
  #connector: DisputableVotingConnector;

  readonly id: string;
  readonly voteId: string;
  readonly voterId: string;
  readonly voterAddress: string
  readonly caster: string;
  readonly supports: boolean;
  readonly stake: string;
  readonly createdAt: string;

  constructor(data: CastVoteData, connector: DisputableVotingConnector) {
    this.#connector = connector;

    this.id = data.id;
    this.voteId = data.voteId;
    this.voterId = data.voterId;
    this.voterAddress = data.voterAddress
    this.caster = data.caster;
    this.supports = data.supports;
    this.stake = data.stake;
    this.createdAt = data.createdAt;
  }

  async voter(): Promise<Voter> {
    const { votingAddress, voterAddress } = parseVoterId(this.voterId);
    return this.#connector.voter(votingAddress, voterAddress);
  }

  onVoter(callback?: SubscriptionCallback<Voter>): SubscriptionResult<Voter> {
    const { votingAddress, voterAddress } = parseVoterId(this.voterId)

    return subscription<Voter>(callback, (callback) =>
      this.#connector.onVoter(votingAddress, voterAddress, callback)
    );
  }
}
