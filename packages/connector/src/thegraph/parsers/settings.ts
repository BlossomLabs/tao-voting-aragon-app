import { QueryResult } from '@1hive/connect-thegraph'

import Setting from '../../models/Setting'
import { SettingData } from '../../types'

function buildSetting(setting: any): Setting {
  const {
    id,
    settingId,
    voteTime,
    supportRequiredPct,
    minimumAcceptanceQuorumPct,
    delegatedVotingPeriod,
    quietEndingPeriod,
    quietEndingExtension,
    executionDelay,
    createdAt,
    voting,
  } = setting

  const settingData: SettingData = {
    id,
    settingId,
    voteTime,
    supportRequiredPct,
    minimumAcceptanceQuorumPct,
    delegatedVotingPeriod,
    quietEndingPeriod,
    quietEndingExtension,
    executionDelay,
    createdAt,
    votingId: voting.id,
  }

  return new Setting(settingData)
}

export function parseCurrentSetting(result: QueryResult): Setting {
  const taoVoting = result.data.taoVoting

  if (!taoVoting || !taoVoting.setting) {
    throw new Error('Unable to parse current setting.')
  }

  return buildSetting(taoVoting.setting)
}

export function parseSetting(result: QueryResult): Setting {
  const setting = result.data.setting

  if (!setting) {
    throw new Error('Unable to parse setting.')
  }

  return buildSetting(setting)
}

export function parseSettings(result: QueryResult): Setting[] {
  const settings = result.data.settings

  if (!settings) {
    throw new Error('Unable to parse settings.')
  }

  return settings.map((setting: any) => buildSetting(setting))
}
