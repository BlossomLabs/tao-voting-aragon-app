# @blossom-labs/connect-bl-tao-voting

## 0.3.0

### Minor Changes

- Restructure model classes:

  - `Vote`: include settings and voting token relative data in `setting` and `votingToken`
  - `DisputableVoting`: return current settings along with voting token

  Refactor graphql queries

## 0.2.1

### Patch Changes

- c27c56b: Order votes by voteId and desc ordering

## 0.2.0

### Minor Changes

- Get delegators and delegate either from current connected tao voting or representative manager tao voting

## 0.1.0

### Minor Changes

- Connector initial publish
