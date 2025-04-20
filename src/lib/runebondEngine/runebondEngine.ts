import axios from "axios";
import {
  ListingParams,
  Node,
  WhitelistRequest,
  WhitelistRequestParams,
  SendMessageParams,
  Message,
} from "../../types";
import {
  assetToBase,
  assetAmount,
} from "@xchainjs/xchain-util";
import {
  createBondMemo,
  createEnableBondMemo,
  createListing,
  createMessageMemo,
  createUnbondMemo,
  createWhitelistRequestMemo,
} from "./memoBuilder";
import { sendTransaction } from "./transactionSender";
import { WalletProvider, WalletType } from "../../contexts/WalletContext";
import { ThorchainTransferParams } from "../../types/wallets";
import { Configuration, NodesApi, TransactionsApi } from "@xchainjs/xchain-thornode";

const THORNODE_API_URL = "https://thornode.ninerealms.com/";
const apiconfig = new Configuration({ basePath: THORNODE_API_URL })
const nodesApi = new NodesApi(apiconfig, undefined, axios)
const txApi = new TransactionsApi(apiconfig, undefined, axios)

class RuneBondEngine {
  private static instance: RuneBondEngine;
  private readonly RUNEBOND_API_URL = import.meta.env.VITE_RUNEBOND_API_URL;
  private readonly RUNEBOND_ADDRESS =
    import.meta.env.VITE_RUNEBOND_ADDRESS ||
    "thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9";
  private RUNE_DUST = 10000000;

  public static getInstance(): RuneBondEngine {
    if (!RuneBondEngine.instance) {
      RuneBondEngine.instance = new RuneBondEngine();
    }
    return RuneBondEngine.instance;
  }

  public async getAllNodes(): Promise<any[]> {
    try {
      const thornodeResponse = await nodesApi.nodes();
      return thornodeResponse.data;
    } catch (error) {
      console.error("Failed to fetch nodes:", error);
      throw new Error("Failed to fetch nodes");
    }
  }

  public async getListedNodes(): Promise<Node[]> {
    try {
      const responseNodes = await axios.get(`${this.RUNEBOND_API_URL}/nodes`, {
        params: {},
      });
      return responseNodes.data.data || [];
    } catch (error) {
      console.error("Failed to fetch listed nodes:", error);
      throw new Error("Failed to fetch listed nodes");
    }
  }

  public async getWhitelistRequests(
    connectedAddress: string
  ): Promise<{ operator: WhitelistRequest[]; user: WhitelistRequest[] }> {
    try {
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
    } catch (error) {
      console.error("Failed to fetch whitelist requests:", error);
      throw new Error("Failed to fetch whitelist requests");
    }
  }

  public async getChatMessages(nodeAddress: string): Promise<Message[]> {
    if (!nodeAddress.startsWith("thor1")) {
      throw new Error("Invalid node address format for fetching messages");
    }

    try {
      const response = await axios.get(`${this.RUNEBOND_API_URL}/chat/${nodeAddress}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Failed to fetch chat messages for ${nodeAddress}:`, error);
      return [];
    }
  }

  public async sendListingTransaction(
    params: ListingParams, 
    walletType?: WalletType, 
    walletProvider?: WalletProvider,
    emulate?: boolean
  ): Promise<string | ThorchainTransferParams> {
    const memo = createListing(params);
    const transaction: ThorchainTransferParams = {
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
    };

    if (emulate) {
      return transaction;
    }

    if (!walletType || !walletProvider) {
      throw new Error('Wallet type and provider are required when not emulating');
    }

    return sendTransaction(
      transaction,
      'transfer',
      walletType,
      walletProvider
    );
  }

  public async sendWhitelistRequest(
    params: WhitelistRequestParams,
    walletType?: WalletType,
    walletProvider?: WalletProvider,
    emulate?: boolean
  ): Promise<string | ThorchainTransferParams> {
    const memo = createWhitelistRequestMemo(params);
    const transaction: ThorchainTransferParams = {
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
    };

    if (emulate) {
      return transaction;
    }

    if (!walletType || !walletProvider) {
      throw new Error('Wallet type and provider are required when not emulating');
    }

    return sendTransaction(
      transaction,
      'transfer',
      walletType,
      walletProvider
    );
  }

  public async sendBondRequest(
    params: WhitelistRequest, 
    walletType?: WalletType, 
    walletProvider?: WalletProvider,
    emulate?: boolean
  ): Promise<string | ThorchainTransferParams> {
    const memo = createBondMemo(params);
    const transaction: ThorchainTransferParams = {
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
    };

    if (emulate) {
      return transaction;
    }

    if (!walletType || !walletProvider) {
      throw new Error('Wallet type and provider are required when not emulating');
    }

    return sendTransaction(
      transaction,
      'deposit',
      walletType,
      walletProvider
    );
  }

  public async sendUnbondRequest(
    params: WhitelistRequest, 
    walletType?: WalletType, 
    walletProvider?: WalletProvider,
    emulate?: boolean
  ): Promise<string | ThorchainTransferParams> {
    const memo = createUnbondMemo(params);
    const transaction: ThorchainTransferParams = {
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
    };

    if (emulate) {
      return transaction;
    }

    if (!walletType || !walletProvider) {
      throw new Error('Wallet type and provider are required when not emulating');
    }

    return sendTransaction(
      transaction,
      'deposit',
      walletType,
      walletProvider
    );
  }

  public async sendEnableBondRequest(
    params: WhitelistRequest,
    walletType?: WalletType,
    walletProvider?: WalletProvider,
    emulate?: boolean
  ): Promise<string | ThorchainTransferParams> {
    const memo = createEnableBondMemo(params);
    const transaction: ThorchainTransferParams = {
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
    };

    if (emulate) {
      return transaction;
    }

    if (!walletType || !walletProvider) {
      throw new Error('Wallet type and provider are required when not emulating');
    }

    return sendTransaction(
      transaction,
      'deposit',
      walletType,
      walletProvider
    );
  }

  public async sendMessageTransaction(
    params: SendMessageParams,
    walletType?: WalletType,
    walletProvider?: WalletProvider,
    emulate?: boolean
  ): Promise<string | ThorchainTransferParams> {
    const memo = createMessageMemo(params);
    
    // Determinar el monto basado en el rol del usuario
    const amount = params.role === 'USER' 
      ? 100000000 // 3 RUNE para usuarios normales
      : 10000000; // 0.1 RUNE para BP y NO

    const transaction: ThorchainTransferParams = {
      asset: {
        chain: "THOR",
        symbol: "RUNE",
        ticker: "RUNE",
      },
      from: params.senderAddress,
      recipient: this.RUNEBOND_ADDRESS,
      amount: {
        amount,
        decimals: 8,
      },
      memo,
    };

    if (emulate) {
      return transaction;
    }

    if (!walletType || !walletProvider) {
      throw new Error('Wallet type and provider are required when not emulating');
    }

    return sendTransaction(
      transaction,
      'transfer',
      walletType,
      walletProvider
    );
  }

  public async getStats(): Promise<{
    totalNodes: number;
    completedWhitelists: number;
    totalBondRune: string;
    networkStats: {
      bondingAPY: string;
    };
  }> {
    try {
      const response = await axios.get(`${this.RUNEBOND_API_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      throw new Error("Failed to fetch stats");
    }
  }

  public async isTransactionConfirmed(txId: string): Promise<boolean> {
    try {
      const response = await txApi.txStatus(txId);
      const tx = response.data;
      
      if (tx?.stages?.inbound_finalised?.completed) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to check transaction status for ${txId}:`, error);
      return false;
    }
  }
}

export default RuneBondEngine;

