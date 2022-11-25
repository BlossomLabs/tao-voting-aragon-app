# Tao Voting

Tao Voting is an Aragon app cappable of executing arbitrary evmscripts sent for
consideration of the DAO token holders. 

This app is based on Aragon Voting, and the key difference is that token holders
can delegate their vote on others.

## :rotating_light: Security review status: pre-audit

Both Voting and DisputableVoting has been previously audited, but not this specific
version of the contract.

## Installation tutorial

You can use the following script in a [EVMcrispr terminal](https://evmcrispr.blossom.software).

```
connect <dao> (
  install blossom-tao-voting.open:new <token> <voteTime> <supportRequiredPct> <minAcceptQuorumPct> <delegatedVotingPeriod> <quietEndingPeriod> <quietEndingExtension> <executionDelay> <representativeManager>
  grant ANY_ENTITY blossom-tao-voting.open:new CREATE_VOTES_ROLE blossom-tao-voting.open:new
)
```

This will install the Tao Voting app and grant permissions to any entity to create
votes.

The initialization parameters are as following:

* **token**: MiniMeToken Address that will be used as governance token. If your
token is not compliant with the ERC20Snapshot, we recommend using a
[TokenWrapper](https://github.com/BlossomLabs/token-wrapper-aragon-app>).
* **voteTime**: Base duration a vote will be open for voting. Example: `3d` would
indicate 3 days (259200 seconds).
* **supportRequiredPct**: Required support % (yes power / voted power) for a vote
to pass; expressed as a percentage of 10^18. Example: `50e16` would indicate 50%
(50000000000000000000).
* **minAcceptQuorumPct**: Required quorum % (yes power / total power) for a vote to pass;
expressed as a percentage of 10^18. Example: `15e16` would indicate 15% (15000000000000000000).
* **delegatedVotingPeriod**: Duration from the start of a vote that representatives are
allowed to vote on behalf of principals. Example: `2d`.
* **quietEndingPeriod**: Duration to detect non-quiet endings. Example: `1d`.
* **quietEndingExtension**: Duration to extend a vote in case of non-quiet ending. Example:
`12h`.
* **executionDelay**: Duration to wait before a passed vote can be executed: Example: `12h`.
* **representativeManager**: Address of the Tao Voting who is going to keep track of representatives. Example: `ZERO_ADDRESS` if you want this instance to keep track of its own representatives.