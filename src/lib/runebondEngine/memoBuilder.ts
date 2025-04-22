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

export function createBondMemo(nodeAddress: string): string {
  if (!nodeAddress.startsWith("thor1")) {
    throw new Error("Invalid node address format");
  }
  return `BOND:${nodeAddress}`;
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

export function createUnbondMemo(nodeAddress: string, amount: string): string {
  if (!nodeAddress.startsWith("thor1")) {
    throw new Error("Invalid node address format");
  }
  return `UNBOND:${nodeAddress}:${amount}`;
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
  if (params.totalBondTarget <= params.minRune) {
    throw new Error("Total bond target RUNE amount must be greater than minimum amount");
  }
  if (params.feePercentage < 0 || params.feePercentage > 100) {
    throw new Error("Fee percentage must be between 0 and 100");
  }

  return `TB:V2:LIST:${params.nodeAddress}:${assetToBase(assetAmount(params.minRune)).amount().toString()}:${assetToBase(assetAmount(params.totalBondTarget)).amount().toString()}:${params.feePercentage * 100}`;
}

export function createMessageMemo(params: {
  nodeAddress: string;
  message: string;
}): string {
  if (!params.nodeAddress.startsWith("thor1")) {
    throw new Error("Invalid node address format");
  }
  if (params.message.length === 0) {
    throw new Error("Message cannot be empty");
  }

  const base64Message = Buffer.from(params.message).toString('base64');

  if (base64Message.length > 200) {
    throw new Error("Message cannot exceed 200 characters");
  }


  return `TB:MSG:${params.nodeAddress}:${base64Message}`;
}