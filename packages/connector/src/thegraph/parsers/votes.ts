import { QueryResult } from "@1hive/connect-thegraph";

import Vote from "../../models/Vote";
import { CastVoteData, DisputableVotingConnector, VoteData } from "../../types";

function buildVote(vote: any, connector: DisputableVotingConnector): Vote {
  const {
    id,
    voting,
    voteId,
    creator,
    originalCreator,
    context,
    status,
    setting,
    startDate,
    totalPower,
    snapshotBlock,
    yeas,
    nays,
    quietEndingExtensionDuration,
    quietEndingSnapshotSupport,
    script,
    executedAt,
    isAccepted,
    castVotes,
  } = vote;
  const { decimals, name, symbol } = vote.voting.token;
  const {
    voteTime,
    minimumAcceptanceQuorumPct,
    supportRequiredPct,
    delegatedVotingPeriod,
    quietEndingExtension,
    quietEndingPeriod,
    executionDelay,
    createdAt,
    settingId,
  } = setting;

  const voteData: VoteData = {
    id,
    votingId: voting.id,
    voteId,
    creator,
    originalCreator,
    context,
    status,
    startDate,
    totalPower,
    snapshotBlock,
    yeas,
    nays,
    quietEndingExtensionDuration,
    quietEndingSnapshotSupport,
    script,
    executedAt,
    isAccepted,
    setting: {
      id: setting.id,
      voteTime,
      minimumAcceptanceQuorumPct,
      supportRequiredPct,
      delegatedVotingPeriod,
      quietEndingExtension,
      quietEndingPeriod,
      executionDelay,
      createdAt,
      settingId,
    },
    votingToken: {
      decimals,
      id: vote.voting.token.id,
      name,
      symbol,
    },
    castVotes: Array.isArray(castVotes)
      ? castVotes.map<CastVoteData>(
          ({
            id,
            voter,
            vote,
            caster,
            supports,
            stake,
            createdAt,
          }) => ({
            id,
            voteId: vote.id,
            voterId: voter.id,
            voterAddress: voter.address,
            caster,
            supports,
            stake,
            createdAt,
          })
        )
      : undefined,
  };

  return new Vote(voteData, connector);
}

export function parseVote(result: QueryResult, connector: DisputableVotingConnector): Vote {
  const vote = result.data.vote;

  if (!vote) {
    throw new Error("Unable to parse vote.");
  }

  return buildVote(vote, connector);
}

export function parseVotes(result: QueryResult, connector: DisputableVotingConnector): Vote[] {
  const votes = result.data.votes;

  if (!votes) {
    throw new Error("Unable to parse votes.");
  }

  return votes.map((vote: any) => buildVote(vote, connector));
}
