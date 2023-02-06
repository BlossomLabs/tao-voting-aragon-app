import { QueryResult } from "@1hive/connect-thegraph";
import { providers as ethersProviders } from "ethers";
import { ERC20Data } from "src/types";

import ERC20 from "../../models/ERC20";

export function parseERC20(
  result: QueryResult,
  provider: ethersProviders.Provider
): ERC20 {
  const erc20 = result.data.erc20;

  if (!erc20) {
    throw new Error("Unable to parse ERC20.");
  }

  const { decimals, id, name, symbol} = erc20

  const data: ERC20Data = {
    decimals,
    id,
    name,
    symbol,
  };

  return new ERC20(data, provider);
}
