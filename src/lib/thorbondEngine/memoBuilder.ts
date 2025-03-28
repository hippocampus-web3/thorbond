import { assetToBase, assetAmount } from "@xchainjs/xchain-util";
import { WhitelistRequest, WhitelistRequestParams } from "../../types";

export function createWhitelistRequestMemo(params: WhitelistRequestParams): string {
    if (!params.nodeAddress.startsWith('thor1')) {
      throw new Error('Invalid node address format');
    }
    if (!params.userAddress.startsWith('thor1')) {
      throw new Error('Invalid user address format');
    }
    if (params.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    return `TB:${params.nodeAddress}:${params.userAddress}:${params.amount}`;
  }

export function createBondMemo(params: WhitelistRequest): string {
    if (!params.node.address.startsWith('thor1')) {
      throw new Error('Invalid node address format');
    }
    return `BOND:${params.node.address}`;
  }

export function createEnableBondMemo(params: WhitelistRequest): string {
    if (!params.node.address.startsWith('thor1')) {
      throw new Error('Invalid node address format');
    }
    if (!params.walletAddress.startsWith('thor1')) {
      throw new Error('Invalid wallet address format');
    }
    return `BOND:${params.node.address}:${params.walletAddress}:${params.node.feePercentage*100}`;
  }

export function createUnbondMemo(params: WhitelistRequest): string {
    if (!params.node.address.startsWith('thor1')) {
      throw new Error('Invalid node address format');
    }
    const amount = assetToBase(assetAmount(params.realBond, 8)).amount().toString();
    return `UNBOND:${params.node.address}:${amount}`;
  }
