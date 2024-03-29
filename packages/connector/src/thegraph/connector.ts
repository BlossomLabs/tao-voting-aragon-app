import { providers as ethersProviders } from "ethers"
import { GraphQLWrapper, QueryResult } from "@1hive/connect-thegraph"
import { SubscriptionCallback, SubscriptionHandler } from "@1hive/connect-types"

import { TaoVotingData, DisputableVotingConnector } from "../types"
import Vote from "../models/Vote"
import Voter from "../models/Voter"
import ERC20 from "../models/ERC20"
import Setting from "../models/Setting"
import CastVote from "../models/CastVote"
import * as queries from "./queries"
import {
  parseSetting,
  parseSettings,
  parseCurrentSetting,
  parseDisputableVoting,
  parseERC20,
  parseVoter,
  parseVote,
  parseVotes,
  parseCastVote,
  parseCastVotes,
} from "./parsers"

export function subgraphUrlFromChainId(chainId: number): string | null {
  if (chainId === 1) {
    return "https://api.thegraph.com/subgraphs/name/blossomlabs/aragon-bl-tao-voting-mainnet"
  }
  if (chainId === 10) {
    return "https://api.thegraph.com/subgraphs/name/blossomlabs/aragon-bl-tao-voting-optimism"
  }
  if (chainId === 100) {
    return "https://api.thegraph.com/subgraphs/name/blossomlabs/aragon-bl-tao-voting-gnosis"
  }

  return null
}

type DisputableVotingConnectorTheGraphConfig = {
  pollInterval?: number
  subgraphUrl?: string
  verbose?: boolean
}

export default class DisputableVotingConnectorTheGraph
  implements DisputableVotingConnector
{
  #gql: GraphQLWrapper
  ethersProvider: ethersProviders.Provider

  constructor(
    config: DisputableVotingConnectorTheGraphConfig,
    provider: ethersProviders.Provider
  ) {
    if (!config.subgraphUrl) {
      throw new Error(
        "DisputableVotingConnectorTheGraph requires subgraphUrl to be passed."
      )
    }

    this.#gql = new GraphQLWrapper(config.subgraphUrl, {
      pollInterval: config.pollInterval,
      verbose: config.verbose,
    })

    this.ethersProvider = provider
  }

  async disconnect(): Promise<void> {
    this.#gql.close()
  }

  async disputableVoting(disputableVoting: string): Promise<TaoVotingData> {
    return this.#gql.performQueryWithParser<TaoVotingData>(
      queries.GET_DISPUTABLE_VOTING("query"),
      { disputableVoting },
      (result: QueryResult) => parseDisputableVoting(result)
    )
  }

  onDisputableVoting(
    disputableVoting: string,
    callback: SubscriptionCallback<TaoVotingData>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<TaoVotingData>(
      queries.GET_DISPUTABLE_VOTING("subscription"),
      { disputableVoting },
      callback,
      (result: QueryResult) => parseDisputableVoting(result)
    )
  }

  async currentSetting(disputableVoting: string): Promise<Setting> {
    return this.#gql.performQueryWithParser<Setting>(
      queries.GET_CURRENT_SETTING("query"),
      { disputableVoting },
      (result: QueryResult) => parseCurrentSetting(result)
    )
  }

  onCurrentSetting(
    disputableVoting: string,
    callback: SubscriptionCallback<Setting>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<Setting>(
      queries.GET_CURRENT_SETTING("subscription"),
      { disputableVoting },
      callback,
      (result: QueryResult) => parseCurrentSetting(result)
    )
  }

  async setting(settingId: string): Promise<Setting> {
    return this.#gql.performQueryWithParser<Setting>(
      queries.GET_SETTING("query"),
      { settingId },
      (result: QueryResult) => parseSetting(result)
    )
  }

  onSetting(
    settingId: string,
    callback: SubscriptionCallback<Setting>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<Setting>(
      queries.GET_SETTING("subscription"),
      { settingId },
      callback,
      (result: QueryResult) => parseSetting(result)
    )
  }

  async settings(
    disputableVoting: string,
    first: number,
    skip: number
  ): Promise<Setting[]> {
    return this.#gql.performQueryWithParser<Setting[]>(
      queries.ALL_SETTINGS("query"),
      { disputableVoting, first, skip },
      (result: QueryResult) => parseSettings(result)
    )
  }

  onSettings(
    disputableVoting: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<Setting[]>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<Setting[]>(
      queries.ALL_SETTINGS("subscription"),
      { disputableVoting, first, skip },
      callback,
      (result: QueryResult) => parseSettings(result)
    )
  }

  async vote(voteId: string): Promise<Vote> {
    return this.#gql.performQueryWithParser<Vote>(
      queries.GET_VOTE("query"),
      { voteId },
      (result: QueryResult) => parseVote(result, this)
    )
  }

  onVote(
    voteId: string,
    callback: SubscriptionCallback<Vote>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<Vote>(
      queries.GET_VOTE("subscription"),
      { voteId },
      callback,
      (result: QueryResult) => parseVote(result, this)
    )
  }

  async votes(
    disputableVoting: string,
    first: number,
    skip: number
  ): Promise<Vote[]> {
    return this.#gql.performQueryWithParser<Vote[]>(
      queries.ALL_VOTES("query"),
      { disputableVoting, first, skip },
      (result: QueryResult) => parseVotes(result, this)
    )
  }

  onVotes(
    disputableVoting: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<Vote[]>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<Vote[]>(
      queries.ALL_VOTES("subscription"),
      { disputableVoting, first, skip },
      callback,
      (result: QueryResult) => parseVotes(result, this)
    )
  }

  async castVote(castVoteId: string): Promise<CastVote | null> {
    return this.#gql.performQueryWithParser<CastVote | null>(
      queries.GET_CAST_VOTE("query"),
      { castVoteId },
      (result: QueryResult) => parseCastVote(result, this)
    )
  }

  onCastVote(
    castVoteId: string,
    callback: SubscriptionCallback<CastVote | null>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<CastVote | null>(
      queries.GET_CAST_VOTE("subscription"),
      { castVoteId },
      callback,
      (result: QueryResult) => parseCastVote(result, this)
    )
  }

  async castVotes(
    voteId: string,
    first: number,
    skip: number
  ): Promise<CastVote[]> {
    return this.#gql.performQueryWithParser<CastVote[]>(
      queries.ALL_CAST_VOTES("query"),
      { voteId, first, skip },
      (result: QueryResult) => parseCastVotes(result, this)
    )
  }

  onCastVotes(
    voteId: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<CastVote[]>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<CastVote[]>(
      queries.ALL_CAST_VOTES("subscription"),
      { voteId, first, skip },
      callback,
      (result: QueryResult) => parseCastVotes(result, this)
    )
  }

  async voter(votingId: string, voterAddress: string): Promise<Voter> {
    return this.#gql.performQueryWithParser<Voter>(
      queries.GET_VOTER("query"),
      { votingId, voterAddress },
      (result: QueryResult) => parseVoter(result)
    )
  }

  onVoter(
    votingId: string,
    voterAddress: string,
    callback: SubscriptionCallback<Voter>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<Voter>(
      queries.GET_VOTER("subscription"),
      { votingId, voterAddress },
      callback,
      (result: QueryResult) => parseVoter(result)
    )
  }

  async ERC20(tokenAddress: string): Promise<ERC20> {
    return this.#gql.performQueryWithParser(
      queries.GET_ERC20("query"),
      { tokenAddress },
      (result: QueryResult) => parseERC20(result, this.ethersProvider)
    )
  }

  onERC20(
    tokenAddress: string,
    callback: SubscriptionCallback<ERC20>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<ERC20>(
      queries.GET_ERC20("subscription"),
      { tokenAddress },
      callback,
      (result: QueryResult) => parseERC20(result, this.ethersProvider)
    )
  }
}
