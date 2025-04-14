import axios from "axios";
import {
  ListingParams,
  Node,
  WhitelistRequest,
  WhitelistRequestParams,
} from "../../types";
import {
  assetToBase,
  assetAmount,
} from "@xchainjs/xchain-util";
import {
  createBondMemo,
  createEnableBondMemo,
  createListing,
  createUnbondMemo,
  createWhitelistRequestMemo,
} from "./memoBuilder";
import { sendTransaction } from "./transactionSender";

class RuneBondEngine {
  private static instance: RuneBondEngine;
  private readonly RUNEBOND_API_URL = import.meta.env.VITE_RUNEBOND_API_URL;
  private readonly RUNEBOND_ADDRESS =
    import.meta.env.VITE_RUNEBOND_ADDRESS ||
    "thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9";
  private listedNodes: Node[] = [];
  private isInitialized: boolean = false;
  private RUNE_DUST = 10000000;

  private constructor() {}

  public static getInstance(): RuneBondEngine {
    if (!RuneBondEngine.instance) {
      RuneBondEngine.instance = new RuneBondEngine();
    }
    return RuneBondEngine.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getAllNodes(): Promise<any[]> {
    const THORNODE_API_URL = "https://thornode.ninerealms.com/thorchain/nodes";

    try {
      const response = await axios.get(THORNODE_API_URL);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch all nodes:", error);
      throw new Error("Failed to retrieve all nodes");
    }
  }

  public getListedNodes(): Node[] {
    if (!this.isInitialized) {
      throw new Error("RuneBondEngine not initialized");
    }
    return this.listedNodes;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // TODO: Implement support for pagination
    const responseNodes = await axios.get(`${this.RUNEBOND_API_URL}/nodes`, {
      params: {},
    });
    this.listedNodes = responseNodes.data.data || [];
    this.isInitialized = true;
  }

  public async refreshActions(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
  }

  public async sendListingTransaction(params: ListingParams, walletType: 'xdefi' | 'vultisig'): Promise<string> {
    const memo = createListing(params);

    return sendTransaction(
      {
        asset: {
          chain: "THOR",
          symbol: "RUNE",
          ticker: "RUNE",
        },
        from: params.operatorAddress,
        recipient: this.RUNEBOND_ADDRESS,
        amount: {
          amount: this.RUNE_DUST,
          decimals: 8,
        },
        memo,
      },
      'transfer',
      walletType
    );
  }

  public async sendWhitelistRequest(
    params: WhitelistRequestParams,
    walletType: 'xdefi' | 'vultisig'
  ): Promise<string> {
    const memo = createWhitelistRequestMemo(params);

    return sendTransaction(
      {
        asset: {
          chain: "THOR",
          symbol: "RUNE",
          ticker: "RUNE",
        },
        from: params.userAddress,
        recipient: this.RUNEBOND_ADDRESS,
        amount: {
          amount: this.RUNE_DUST,
          decimals: 8,
        },
        memo,
      },
      'transfer',
      walletType
    );
  }

  public async sendBondRequest(params: WhitelistRequest, walletType: 'xdefi' | 'vultisig'): Promise<string> {
    const memo = createBondMemo(params);

    return sendTransaction(
      {
        asset: {
          chain: "THOR",
          symbol: "RUNE",
          ticker: "RUNE",
        },
        from: params.userAddress,
        amount: {
          amount: params.intendedBondAmount,
          decimals: 8,
        },
        memo,
      },
      'deposit',
      walletType
    );
  }

  public async sendUnbondRequest(params: WhitelistRequest, walletType: 'xdefi' | 'vultisig'): Promise<string> {
    const memo = createUnbondMemo(params);

    return sendTransaction(
      {
        asset: {
          chain: "THOR",
          symbol: "RUNE",
          ticker: "RUNE",
        },
        from: params.userAddress,
        amount: {
          amount: 0,
          decimals: 8,
        },
        memo,
      },
      'deposit',
      walletType
    );
  }

  public async sendEnableBondRequest(
    params: WhitelistRequest,
    walletType: 'xdefi' | 'vultisig'
  ): Promise<string> {
    const memo = createEnableBondMemo(params);

    return sendTransaction(
      {
        asset: {
          chain: "THOR",
          symbol: "RUNE",
          ticker: "RUNE",
        },
        from: params.node.nodeAddress,
        amount: {
          amount: assetToBase(assetAmount(1, 8)).amount().toNumber(),
          decimals: 8,
        },
        memo,
      },
      'deposit',
      walletType
    );
  }

  public async getWhitelistRequests(
    connectedAddress: string
  ): Promise<{ operator: WhitelistRequest[]; user: WhitelistRequest[] }> {
    if (!this.isInitialized) {
      throw new Error("RuneBondEngine not initialized");
    }

    // TODO: Implement support for pagination
    const responseNodes = await axios.get(
      `${this.RUNEBOND_API_URL}/whitelist`,
      {
        params: {
          address: connectedAddress,
        },
      }
    );
    const requests: WhitelistRequest[] = responseNodes.data.data || [];

    const requestsUser: WhitelistRequest[] = [];
    const requestsOperator: WhitelistRequest[] = [];

    for (const request of requests) {
      // TODO: Optimize taking into account rate limits
      if (request.userAddress === connectedAddress) {
        requestsUser.push(request);
      }

      if (request.node.operatorAddress === connectedAddress) {
        requestsOperator.push(request);
      }
    }

    return {
      operator: requestsOperator,
      user: requestsUser,
    };
  }
}

export default RuneBondEngine;
