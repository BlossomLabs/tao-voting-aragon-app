const { getArtifacts, getWeb3 } = require('@1hive/contract-helpers-test/src/config')
const { bn, decodeEvents } = require('@1hive/contract-helpers-test')
const { EMPTY_CALLS_SCRIPT, encodeCallScript } = require('@1hive/contract-helpers-test/src/aragon-os')

const VOTER_STATE = {
  ABSENT: 0,
  YEA: 1,
  NAY: 2,
}

const VOTE_STATUS = {
  NORMAL: 0,
  EXECUTED: 1,
}

const getVoteState = async (voting, id) => {
  const { yea, nay, totalPower, settingId, actionId, status, startDate, snapshotBlock, quietEndingExtensionDuration, quietEndingSnapshotSupport, executionScriptHash } = await voting.getVote(id)
  const isOpen = await voting.isVoteOpenForVoting(id)
  const isExecuted = status.eq(bn(VOTE_STATUS.EXECUTED))
  return { isOpen, isExecuted, startDate, snapshotBlock, settingId, status, actionId, yeas: yea, nays: nay, totalPower, quietEndingExtensionDuration, quietEndingSnapshotSupport, executionScriptHash }
}

const getVoteSetting = async (voting, id) => {
  const { settingId } = await voting.getVote(id)
  const { voteTime, supportRequiredPct, minAcceptQuorumPct, executionDelay, delegatedVotingPeriod, quietEndingPeriod, quietEndingExtension } = await voting.getSetting(settingId)
  return { voteTime, supportRequiredPct, minAcceptQuorumPct, executionDelay, delegatedVotingPeriod, quietEndingPeriod, quietEndingExtension }
}

const voteScript = async (actions = 1) => {
  const artifacts = getArtifacts()
  const ExecutionTarget = artifacts.require('ExecutionTarget')
  const executionTarget = await ExecutionTarget.new()
  const action = { to: executionTarget.address, calldata: executionTarget.contract.methods.execute().encodeABI() }
  const script = encodeCallScript(Array.from(new Array(actions)).map(() => action))
  return { executionTarget, script }
}

const createVote = async ({ voting, script = undefined, voteContext = '0xabcdef', from = undefined }) => {
  if (!from) {
    const web3 = getWeb3()
    from = (await web3.eth.getAccounts())[0]
  }

  if (script === undefined) script = (await voteScript(1)).script
  if (!script) script = EMPTY_CALLS_SCRIPT

  const artifacts = getArtifacts()

  const receipt = await voting.newVote(script, voteContext, { from })
  const events = decodeEvents(receipt, artifacts.require('TaoVoting').abi, 'StartVote')
  assert.equal(events.length, 1, 'number of StartVote emitted events does not match')
  const { voteId } = events[0].args
  return { voteId, script, receipt }
}

module.exports = {
  VOTER_STATE,
  VOTE_STATUS,
  voteScript,
  createVote,
  getVoteState,
  getVoteSetting
}
