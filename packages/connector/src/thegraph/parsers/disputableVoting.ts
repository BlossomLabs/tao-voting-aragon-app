import { QueryResult } from "@1hive/connect-thegraph";

import { TaoVotingData } from "../../types";

export function parseDisputableVoting(result: QueryResult): TaoVotingData {
  const disputableVoting = result.data.taoVoting;

  if (!disputableVoting) {
    throw new Error("Unable to parse disputable voting.");
  }

  const { id, dao, token, setting, representativeManager } = disputableVoting;

  const { decimals, name, symbol } = token;
  const {
    createdAt,
    delegatedVotingPeriod,
    executionDelay,
    minimumAcceptanceQuorumPct,
    quietEndingExtension,
    quietEndingPeriod,
    settingId,
    supportRequiredPct,
    voteTime,
  } = setting;

  return {
    dao,
    id,
    representativeManager: {
      address: representativeManager?.id,
    },
    token: {
      decimals,
      id: token.id,
      name,
      symbol,
    },
    setting: {
      createdAt,
      delegatedVotingPeriod,
      executionDelay,
      id: setting.id,
      minimumAcceptanceQuorumPct,
      quietEndingExtension,
      quietEndingPeriod,
      settingId,
      supportRequiredPct,
      voteTime,
    },
  };
}
