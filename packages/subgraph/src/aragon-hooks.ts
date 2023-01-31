import { Address } from '@graphprotocol/graph-ts'

/*
 * Called when an app proxy is detected.
 *
 * Return the name of a data source template if you would like to create it for a given appId.
 * Return null otherwise.
 *
 * The returned name is used to instantiate a template declared in the subgraph manifest file,
 * which must have the same name.
 */
export function getTemplateForApp(appId: string): string | null {
  const VOTING_OPEN =
    '0xc6dfcc2c82dbdca0a7412eb8bb8ad0cdc22f7ed94d5eb03e0809488674d5970d'

  if (appId == VOTING_OPEN) {
    return 'TaoVoting'
  } else {
    return null
  }
}

export function onOrgTemplateCreated(orgAddress: Address): void {}
export function onAppTemplateCreated(
  appAddress: Address,
  appId: string
): void {}
export function onTokenTemplateCreated(tokenAddress: Address): void {}
