import { QueryResult } from "@1hive/connect-thegraph";

import CastVote from "../../models/CastVote";
import { CastVoteData, DisputableVotingConnector } from "../../types";

function buildCastVote(castVote: any, connector: DisputableVotingConnector): CastVote {
  const { id, vote, voter, caster, supports, stake, createdAt } = castVote;

  const castVoteData: CastVoteData = {
    caster,
    createdAt,
    id,
    stake,
    supports,
    voteId: vote.id,
    voterId: voter.id,
    voterAddress: voter.address,
  };

  return new CastVote(castVoteData, connector);
}

export function parseCastVote(
  result: QueryResult,
  connector: DisputableVotingConnector
): CastVote | null {
  const castVote = result.data.castVote;
  return castVote ? buildCastVote(castVote, connector) : null;
}

export function parseCastVotes(
  result: QueryResult,
  connector: DisputableVotingConnector
): CastVote[] {
  const castVotes = result.data.castVotes;

  if (!castVotes) {
    throw new Error("Unable to parse cast votes.");
  }

  return castVotes.map((castVote: any) => buildCastVote(castVote, connector));
}
