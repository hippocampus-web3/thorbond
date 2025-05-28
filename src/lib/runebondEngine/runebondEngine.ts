import {
  ListingParams,
  WhitelistRequestParams,
  SendMessageParams,
} from "../../types";
import {
  assetToBase,
  assetAmount,
  BaseAmount,
} from "@xchainjs/xchain-util";
import { NodeListingDto, WhitelistService, NodesService, OpenAPI, WhitelistRequestDto, ChatService, ChatMessageDto, StatsService, StatsResponseDto, SubscriptionsService, SubscriptionResponseDto } from '@hippocampus-web3/runebond-client';
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
import { ThornodeClient } from '../thornode/client';
import { NodesResponse } from "@xchainjs/xchain-thornode";
import { MidgardClient } from '../midgard';

class RuneBondEngine {
  private static instance: RuneBondEngine;
  private readonly RUNEBOND_ADDRESS =
    import.meta.env.VITE_RUNEBOND_ADDRESS ||
    "thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9";
  private RUNE_DUST = 10000000;
  private thornodeClient: ThornodeClient;
  private midgardClient: MidgardClient;

  private constructor() {
    this.thornodeClient = ThornodeClient.getInstance();
    this.midgardClient = new MidgardClient();
    OpenAPI.BASE = import.meta.env.VITE_RUNEBOND_API_URL
  }

  public static getInstance(): RuneBondEngine {
    if (!RuneBondEngine.instance) {
      RuneBondEngine.instance = new RuneBondEngine();
    }
    return RuneBondEngine.instance;
  }

  public async getAllNodes(): Promise<NodesResponse> {
    try {
      return await this.thornodeClient.getAllNodes();
    } catch (error) {
      console.error("Failed to fetch nodes:", error);
      throw new Error("Failed to fetch nodes");
    }
  }

  public async getListedNodes(): Promise<NodeListingDto[]> {
    try {
      const nodes = await NodesService.getNodes()
      if (!nodes.data) {
        throw Error(nodes?.errors?.[0] || "Failed to fetch nodes")
      }
      return nodes.data
    } catch (error) {
      console.error("Failed to fetch listed nodes:", error);
      throw new Error("Failed to fetch listed nodes");
    }
  }

  public async getWhitelistRequests(
    connectedAddress: string,
    nodeAddress?: string
  ): Promise<{ operator: WhitelistRequestDto[]; user: WhitelistRequestDto[] }> {
    try {
      const responseWhitelists = await WhitelistService.getWhitelistRequests(1, 100, connectedAddress, nodeAddress)
      if (!responseWhitelists.data) {
        throw Error(responseWhitelists?.errors?.[0] || "Failed to fetch whitelists")
      }
      const requests = responseWhitelists.data

      const requestsUser: WhitelistRequestDto[] = [];
      const requestsOperator: WhitelistRequestDto[] = [];

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

  public async getChatMessages(nodeAddress: string): Promise<ChatMessageDto[]> {
    if (!nodeAddress.startsWith("thor1")) {
      throw new Error("Invalid node address format for fetching messages");
    }

    try {
      const responseChat = await ChatService.getNodeChatHistory(nodeAddress)
      if (!responseChat.data) {
        throw Error(responseChat?.errors?.[0] || "Failed to fetch messages")
      }
      return responseChat.data
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
    params: { 
      nodeAddress: string;
      userAddress: string;
      amount: number;
    }, 
    walletType?: WalletType, 
    walletProvider?: WalletProvider,
    emulate?: boolean
  ): Promise<string | ThorchainTransferParams> {
    const memo = createBondMemo(params.nodeAddress);
    const transaction: ThorchainTransferParams = {
      asset: {
        chain: "THOR",
        symbol: "RUNE",
        ticker: "RUNE",
      },
      from: params.userAddress,
      amount: {
        amount: params.amount,
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
    params: { 
      nodeAddress: string;
      userAddress: string;
      amount: number;
    }, 
    walletType?: WalletType, 
    walletProvider?: WalletProvider,
    emulate?: boolean
  ): Promise<string | ThorchainTransferParams> {
    const memo = createUnbondMemo(params.nodeAddress, params.amount.toString());
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
    params: WhitelistRequestDto,
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

  public async getStats(): Promise<StatsResponseDto> {
    try {
      const responseStats = await StatsService.getStats()
      if (!responseStats.data) {
        throw Error(responseStats?.errors?.[0] || "Failed to fetch stats")
      }
      return responseStats.data;
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      throw new Error("Failed to fetch stats");
    }
  }

  public async isTransactionConfirmed(txId: string): Promise<boolean> {
    return this.midgardClient.isTransactionConfirmed(txId);
  }

  public async getAddressBalance(address: string): Promise<BaseAmount> {
    return this.thornodeClient.getAddressBalance(address);
  }

  public async createSubscription(email: string, observableAddress: string): Promise<SubscriptionResponseDto> {
    try {
      const responseSubscriptions = await SubscriptionsService.createSubscription({ email,  observable_address: observableAddress })
      if (!responseSubscriptions.data) {
        throw Error(responseSubscriptions?.errors?.[0] || "Failed to fetch subscription")
      }
      return responseSubscriptions.data;
    } catch (error) {
      console.error("Failed to create subscription:", error);
      throw new Error("Failed to create subscription");
    }
  }

  public async sendSubscriptionPayment(
    params: {
      memo: string;
      userAddress: string;
      amount: number;
    },
    walletType?: WalletType,
    walletProvider?: WalletProvider,
    emulate?: boolean
  ): Promise<string | ThorchainTransferParams> {
    const transaction: ThorchainTransferParams = {
      asset: {
        chain: "THOR",
        symbol: "RUNE",
        ticker: "RUNE",
      },
      from: params.userAddress,
      recipient: this.RUNEBOND_ADDRESS,
      amount: {
        amount: params.amount,
        decimals: 8,
      },
      memo: params.memo,
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
}

export default RuneBondEngine;

