import gql from "graphql-tag";
import * as fragments from "./fragments";

export const GET_DISPUTABLE_VOTING = (type: string) => gql`
  ${fragments.TOKEN_FRAGMENT}
  ${fragments.SETTING_FRAGMENT}
  ${type} DisputableVoting($disputableVoting: String!) {
    taoVoting(id: $disputableVoting) {
      id
      dao
      representativeManager {
        id
      }
      token {
        ...Token_token
      }
      setting {
        ...Setting_setting
      }
    }
  }
`;

export const GET_CURRENT_SETTING = (type: string) => gql`
  ${fragments.SETTING_FRAGMENT}
  ${type} DisputableVoting($disputableVoting: String!) {
    taoVoting(id: $disputableVoting) {
      id
      setting {
        ...Setting_setting
      }
    }
  }
`;

export const GET_SETTING = (type: string) => gql`
  ${fragments.SETTING_FRAGMENT}
  ${type} Setting($settingId: String!) {
    setting(id: $settingId) {
      ...Setting_setting
    }
  }
`;

export const ALL_SETTINGS = (type: string) => gql`
  ${fragments.SETTING_FRAGMENT}
  ${type} Settings($disputableVoting: String!, $first: Int!, $skip: Int!) {
    settings(where: {
      voting: $disputableVoting
    }, first: $first, skip: $skip) {
      ...Setting_setting
      voting {
        id
      }
    }
  }
`;

export const GET_VOTE = (type: string) => gql`
  ${fragments.TOKEN_FRAGMENT}
  ${fragments.SETTING_FRAGMENT}
  ${fragments.CAST_VOTES_FRAGMENT}
  ${type} Vote($voteId: String!) {
    vote(id: $voteId) {
      id
      voting { 
        id 
        token {
          ...Token_token
        }
      }
      voteId
      creator
      originalCreator
      context
      status
      setting { 
        ...Setting_setting
      }
      startDate
      totalPower
      snapshotBlock
      yeas
      nays
      quietEndingExtensionDuration
      quietEndingSnapshotSupport
      script
      executedAt
      isAccepted
      castVotes {
        ...CastVotes_castVotes
      }
    }
  }
`;

export const ALL_VOTES = (type: string) => gql`
  ${fragments.TOKEN_FRAGMENT}
  ${fragments.SETTING_FRAGMENT}
  ${fragments.CAST_VOTES_FRAGMENT}
  ${type} Votes($disputableVoting: String!, $first: Int!, $skip: Int!) {
    votes(where: {
      voting: $disputableVoting
    }, orderBy: voteId, orderDirection: desc, first: $first, skip: $skip) {
      id
      voting { 
        id 
        token {
          ...Token_token
        }
      }
      voteId
      creator
      originalCreator
      context
      status
      setting { 
        ...Setting_setting
      }
      startDate
      totalPower
      snapshotBlock
      yeas
      nays
      quietEndingExtensionDuration
      quietEndingSnapshotSupport
      script
      isAccepted
      castVotes {
        ...CastVotes_castVotes
      }
    }
  }
`;

export const GET_CAST_VOTE = (type: string) => gql`
  ${fragments.CAST_VOTES_FRAGMENT}
  ${type} CastVote($castVoteId: String!) {
    castVote(id: $castVoteId) {
      ...CastVotes_castVotes
    }
  }
`;

export const ALL_CAST_VOTES = (type: string) => gql`
  ${fragments.CAST_VOTES_FRAGMENT}
  ${type} CastVotes($voteId: ID!, $first: Int!, $skip: Int!) {
    castVotes(where: {
      vote: $voteId
    }, first: $first, skip: $skip) {
      ...CastVotes_castVotes
    }
  }
`;

export const GET_VOTER = (type: string) => gql`
  ${fragments.VOTER_FRAGMENT}
  ${type} Voter($votingId: String!, $voterAddress: String!) {
    taoVoting(id: $votingId) {
      id
      voters(where: { address: $voterAddress }) {
        ...Voter_voter
      }
      
      representativeManager {
        voters(where:{ address: $voterAddress}) {
          ...Voter_voter
        }
      }
    }
  }
`;

export const GET_ERC20 = (type: string) => gql`
  ${type} ERC20($tokenAddress: String!) {
    erc20(id: $tokenAddress) {
      ...Token_token
    }
  }
  ${fragments.TOKEN_FRAGMENT}
`;
