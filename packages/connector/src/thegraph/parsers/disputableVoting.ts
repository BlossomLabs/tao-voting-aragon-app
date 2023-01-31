import { QueryResult } from '@1hive/connect-thegraph'

import { TaoVotingData } from '../../types'

export function parseDisputableVoting(result: QueryResult): TaoVotingData {
  const disputableVoting = result.data.taoVoting

  if (!disputableVoting) {
    throw new Error('Unable to parse disputable voting.')
  }

  const { id, dao, token, setting, representativeManager } = disputableVoting

  return {
    id,
    dao,
    token: { ...token },
    setting: { ...setting },
    representativeManager,
  }
}
