import { assetAmount, assetToBase } from "@xchainjs/xchain-util";
import {
  ListingParams,
  WhitelistRequest,
  WhitelistRequestParams,
} from "../../types";

export function createWhitelistRequestMemo(
  params: WhitelistRequestParams
): string {
  if (!params.nodeAddress.startsWith("thor1")) {
    throw new Error("Invalid node address format");
  }
  if (!params.userAddress.startsWith("thor1")) {
    throw new Error("Invalid user address format");
  }
  if (params.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return `TB:WHT:${params.nodeAddress}:${params.userAddress}:${assetToBase(
    assetAmount(params.amount)
  )
    .amount()
    .toString()}`;
}

export function createBondMemo(params: WhitelistRequest): string {
  if (!params.node.nodeAddress.startsWith("thor1")) {
    throw new Error("Invalid node address format");
  }
  return `BOND:${params.node.nodeAddress}`;
}

export function createEnableBondMemo(params: WhitelistRequest): string {
  if (!params.node.nodeAddress.startsWith("thor1")) {
    throw new Error("Invalid node address format");
  }
  if (!params.userAddress.startsWith("thor1")) {
    throw new Error("Invalid wallet address format");
  }
  return `BOND:${params.node.nodeAddress}:${params.userAddress}:${
    params.node.feePercentage
  }`;
}

export function createUnbondMemo(params: WhitelistRequest): string {
  if (!params.node.nodeAddress.startsWith("thor1")) {
    throw new Error("Invalid node address format");
  }
  return `UNBOND:${params.node.nodeAddress}:${params.realBond}`;
}

export function createListing(params: ListingParams): string {
  if (!params.nodeAddress.startsWith("thor1")) {
    throw new Error("Invalid node address format");
  }
  if (!params.operatorAddress.startsWith("thor1")) {
    throw new Error("Invalid operator address format");
  }
  if (params.minRune <= 0) {
    throw new Error("Minimum RUNE amount must be greater than 0");
  }
  if (params.maxRune <= params.minRune) {
    throw new Error("Maximum RUNE amount must be greater than minimum amount");
  }
  if (params.feePercentage < 0 || params.feePercentage > 100) {
    throw new Error("Fee percentage must be between 0 and 100");
  }

  return `TB:LIST:${params.nodeAddress}:${params.operatorAddress}:${assetToBase(assetAmount(params.minRune)).amount().toString()}:${assetToBase(assetAmount(params.maxRune)).amount().toString()}:${params.feePercentage * 100}`;
}
