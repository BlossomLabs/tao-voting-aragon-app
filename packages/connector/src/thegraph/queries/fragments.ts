import gql from "graphql-tag";

export const SETTING_FRAGMENT = gql`
  fragment Setting_setting on Setting {
    id
    settingId
    voteTime
    supportRequiredPct
    minimumAcceptanceQuorumPct
    delegatedVotingPeriod
    quietEndingPeriod
    quietEndingExtension
    executionDelay
    createdAt
  }
`;

export const TOKEN_FRAGMENT = gql`
  fragment Token_token on ERC20 {
    id
    name
    symbol
    decimals
  }
`;

export const CAST_VOTES_FRAGMENT = gql`
  fragment CastVotes_castVotes on CastVote {
    id
    voter {
      id
      address
    }
    vote {
      id
    }
    caster
    supports
    stake
    createdAt
  }
`;

export const VOTER_FRAGMENT = gql`
  fragment Voter_voter on Voter {
    id
    address
    representative {
      address
    }
    representativeFor {
      address
    }
    voting {
      id
    }
  }
`;
