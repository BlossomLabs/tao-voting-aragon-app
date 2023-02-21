import { QueryResult } from "@1hive/connect-thegraph";

import Voter from "../../models/Voter";

export function parseVoter(result: QueryResult): Voter {
  const taoVoting = result.data.taoVoting;

  if (!taoVoting) {
    throw new Error("Unable to parse voter.");
  }

  const taoVotingVoter = taoVoting.voters[0];
  const representativeManagerVoter = taoVoting.representativeManager?.voters[0];

  const votingId = taoVoting.id;
  const id = taoVotingVoter?.id ?? representativeManagerVoter?.id;
  const address = taoVotingVoter?.address ?? representativeManagerVoter?.address;
  const representative =
    taoVotingVoter?.representative ?? representativeManagerVoter?.representative;

  const representativeFor = representativeManagerVoter?.representativeFor
    ?.length
    ? representativeManagerVoter.representativeFor
    : taoVotingVoter?.representativeFor;

  return new Voter({
    id,
    address,
    representative,
    votingId,
    representativeFor: representativeFor.map((representative: any) => ({
      address: representative.address,
    })),
  });
}
