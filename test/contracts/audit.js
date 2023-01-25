const deployer = require('../helpers/deployer')(web3, artifacts)
const { pct16, bigExp } = require('@1hive/contract-helpers-test')
const { createVote, voteScript } = require('../helpers/voting')
const { time } = require("@nomicfoundation/hardhat-network-helpers")


contract('Voting', ([_, owner, user4, user3, user2, user1]) => {
  let voting, token

  const VOTE_DURATION = 432000 // 5days
  const REQUIRED_SUPPORT = pct16(50) // 50%
  const MINIMUM_ACCEPTANCE_QUORUM = pct16(20) // 20%
  const DELEGATED_VOTING_PERIOD = 86400 // 1day
  const QUIET_ENDING_PERIOD = 86400 // 1day
  const QUIET_ENDING_EXTENSION = 43200 // 12hours
  const EXECUTION_DELAY = 0

  async function printVote(voteId) {
    const vote = await voting.getVote(voteId)
    console.log(
      '> Check getVote() ->', 
      vote['0'].div(bigExp(1,18)).toString(),
      vote['1'].div(bigExp(1,18)).toString(),
      vote['2'].div(bigExp(1,18)).toString(),
      vote['3'].toString(),
      vote['4'].toString(),
      vote['5'].toString(),
      vote['6'].toString(),
      vote['7'].toString(),
      vote['8'].toString(),
      vote['9'].toString(),
    )
  }

  beforeEach('deploy voting', async () => {
    token = await deployer.deployToken({})
    await token.generateTokens(user1, bigExp(1000, 18))
    await token.generateTokens(user2, bigExp(2000, 18))
    await token.generateTokens(user3, 1)
    voting = await deployer.deployAndInitialize({
        token,
        owner,
        currentTimestamp: false,
        minimumAcceptanceQuorum: MINIMUM_ACCEPTANCE_QUORUM,
        requiredSupport: REQUIRED_SUPPORT,
        voteDuration: VOTE_DURATION,
        quietEndingPeriod: QUIET_ENDING_PERIOD,
        quietEndingExtension: QUIET_ENDING_EXTENSION,
        delegatedVotingPeriod: DELEGATED_VOTING_PERIOD,
        supportRequiredPct: pct16(50),
        executionDelay: EXECUTION_DELAY,
    })
  })

  describe.only('quiet ending [audit]', () => {
    let voteId, script

    beforeEach('create script', async () => {
      ({ executionTarget, script } = await voteScript())
    })

    beforeEach('create vote', async () => {
      ({ voteId } = await createVote({ voting, script, from: user1 }))
      console.log('> Calling voting.vote(0, true, {from: user1})')
      await voting.vote(voteId, true, { from: user1 })
    })

    it('proof of concept', async() => {

      console.log('> Sleep (5d - 20s)')
      await time.increase(432000-20)

      await printVote(voteId)

      console.log('> Calling voting.vote(0, false, {from: user2})')
      await voting.vote(voteId, false, { from: user2 })
      await printVote(voteId)

      console.log('> Sleep 20s')
      await time.increase(20)
      console.log('> Calling voting.vote(0, true, {from: user3})')
      await voting.vote(voteId, true, { from: user3 })
      await printVote(voteId)
    })
  })
})