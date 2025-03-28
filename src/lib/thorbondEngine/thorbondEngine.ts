import axios from 'axios';
import { ListingMemo, ListingParams, MidgardAction, Node, ThorBondAction, WhitelistRequest, WhitelistRequestParams } from '../../types';
import { assetToBase, assetAmount, baseAmount, baseToAsset } from '@xchainjs/xchain-util';
import { createBondMemo, createEnableBondMemo, createUnbondMemo, createWhitelistRequestMemo } from './memoBuilder';

class ThorBondEngine {
  private static instance: ThorBondEngine;
  private readonly MIDGARD_API_URL = 'https://midgard.ninerealms.com/v2';
  private readonly THORBOND_ADDRESS = import.meta.env.VITE_THORBOND_ADDRESS || 'thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9';
  private actions: ThorBondAction[] = [];
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): ThorBondEngine {
    if (!ThorBondEngine.instance) {
      ThorBondEngine.instance = new ThorBondEngine();
    }
    return ThorBondEngine.instance;
  }

  private parseListingMemo(memo: string): ListingMemo | null {
    try {
      const parts = memo.split(':');
      if (parts.length !== 6 || parts[0] !== 'TB') return null;

      return {
        nodeAddress: parts[1],
        operatorAddress: parts[2],
        minRune: Number(parts[3]),
        maxRune: Number(parts[4]),
        feePercentage: Number(parts[5])
      };
    } catch {
      return null;
    }
  }

  private transformMidgardAction(action: MidgardAction): ThorBondAction {
    return {
      type: action.type,
      data: {
        height: action.height,
        in: action.in,
        out: action.out,
        pools: action.pools,
        status: action.status,
        metadata: action.metadata,
        memo: action.metadata?.send?.memo
      },
      timestamp: parseInt(action.date),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getAllNodes(): Promise<any[]> {
    const THORNODE_API_URL = 'https://thornode.ninerealms.com/thorchain/nodes';
  
    try {
      const response = await axios.get(THORNODE_API_URL);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all nodes:', error);
      throw new Error('Failed to retrieve all nodes');
    }
  }
  

  public getListedNodes(): Node[] {
    if (!this.isInitialized) {
      throw new Error('ThorBondEngine not initialized');
    }

    const nodes: Node[] = [];
    const processedAddresses = new Set<string>();

    this.actions.forEach(action => {
      const memo = action.data.memo as string;
      if (!memo) return;

      const listingMemo = this.parseListingMemo(memo);
      if (!listingMemo) return;

      // Process only the first occurrence of each node address
      if (processedAddresses.has(listingMemo.nodeAddress)) return;
      processedAddresses.add(listingMemo.nodeAddress);

      nodes.push({
        operator: listingMemo.operatorAddress,
        address: listingMemo.nodeAddress,
        bondingCapacity: listingMemo.maxRune,
        minimumBond: listingMemo.minRune,
        feePercentage: listingMemo.feePercentage,
        createdAt: new Date(action.timestamp / 1000000)
      });
    });

    return nodes;
  }

  public async getBondInfoForUser(
    nodeAddress: string,
    userAddress: string
  ): Promise<{ isBondProvider: boolean; status: string; bond: number }> {
    if (!nodeAddress.startsWith('thor1') || !userAddress.startsWith('thor1')) {
      throw new Error('Invalid THORChain address');
    }
  
    const THORNODE_API_URL = 'https://thornode.ninerealms.com/thorchain/node';
  
    try {
      const response = await axios.get(`${THORNODE_API_URL}/${nodeAddress}`);
      const bondProviders = response.data?.bond_providers?.providers ?? [];
  
      const provider = bondProviders.find(
        (bp: { bond_address: string; bond: string }) => bp.bond_address === userAddress
      );
  
      if (provider) {
        return {
          isBondProvider: true,
          status: response.data?.status,
          bond: Number(provider.bond)
        };
      }
  
      return {
        isBondProvider: false,
        status: response.data?.status,
        bond: 0
      };
    } catch (error) {
      console.error('Failed to fetch node data:', error);
      throw new Error('Failed to retrieve bond info');
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const response = await axios.get(`${this.MIDGARD_API_URL}/actions`, {
      params: {
        address: this.THORBOND_ADDRESS,
        limit: 600,
        offset: 0,
        type: 'send',
        fromHeight: import.meta.env.VITE_INITIAL_HEIGHT
      }
    });
    const actions = response.data.actions || [];

    this.actions = actions.map((action: MidgardAction) => this.transformMidgardAction(action));
    this.isInitialized = true;
  }

  public getActions(): ThorBondAction[] {
    if (!this.isInitialized) {
      throw new Error('ThorBondEngine not initialized');
    }
    return this.actions;
  }

  public async refreshActions(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
  }

  public createListing(params: ListingParams): string {
    if (!params.nodeAddress.startsWith('thor1')) {
      throw new Error('Invalid node address format');
    }
    if (!params.operatorAddress.startsWith('thor1')) {
      throw new Error('Invalid operator address format');
    }
    if (params.minRune <= 0) {
      throw new Error('Minimum RUNE amount must be greater than 0');
    }
    if (params.maxRune <= params.minRune) {
      throw new Error('Maximum RUNE amount must be greater than minimum amount');
    }
    if (params.feePercentage < 0 || params.feePercentage > 100) {
      throw new Error('Fee percentage must be between 0 and 100');
    }

    return `TB:${params.nodeAddress}:${params.operatorAddress}:${params.minRune}:${params.maxRune}:${params.feePercentage}`;
  }

  public async sendListingTransaction(params: ListingParams): Promise<string> {
    const memo = this.createListing(params);

    return new Promise((resolve, reject) => {
      if (!window.xfi?.thorchain) {
        reject(new Error('XDEFI wallet not found. Please install XDEFI extension.'));
        return;
      }

      window.xfi.thorchain.request(
        {
          method: 'transfer',
          params: [{
            asset: {
              chain: 'THOR',
              symbol: 'RUNE',
              ticker: 'RUNE'
            },
            from: params.operatorAddress,
            recipient: this.THORBOND_ADDRESS,
            amount: {
              amount: 1000000, // 0.01 RUNE (8 decimals)
              decimals: 8
            },
            memo,
          }]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  public async sendWhitelistRequest(params: WhitelistRequestParams): Promise<string> {
    const memo = createWhitelistRequestMemo(params);

    return new Promise((resolve, reject) => {
      if (!window.xfi?.thorchain) {
        reject(new Error('XDEFI wallet not found. Please install XDEFI extension.'));
        return;
      }

      window.xfi.thorchain.request(
        {
          method: 'transfer',
          params: [{
            asset: {
              chain: 'THOR',
              symbol: 'RUNE',
              ticker: 'RUNE'
            },
            from: params.userAddress,
            recipient: this.THORBOND_ADDRESS,
            amount: {
              amount: 1000000, // 0.01 RUNE (8 decimals)
              decimals: 8
            },
            memo,
          }]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  public async sendBondRequest(params: WhitelistRequest): Promise<string> {
    const memo = createBondMemo(params);

    return new Promise((resolve, reject) => {
      if (!window.xfi?.thorchain) {
        reject(new Error('XDEFI wallet not found. Please install XDEFI extension.'));
        return;
      }

      window.xfi.thorchain.request(
        {
          method: 'deposit',
          params: [{
            asset: {
              chain: 'THOR',
              symbol: 'RUNE',
              ticker: 'RUNE'
            },
            from: params.walletAddress,
            amount: {
              amount: assetToBase(assetAmount(params.intendedBondAmount, 8)).amount().toNumber(),
              decimals: 8
            },
            memo,
          }]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  public async sendUnbondRequest(params: WhitelistRequest): Promise<string> {
    const memo = createUnbondMemo(params);

    return new Promise((resolve, reject) => {
      if (!window.xfi?.thorchain) {
        reject(new Error('XDEFI wallet not found. Please install XDEFI extension.'));
        return;
      }

      window.xfi.thorchain.request(
        {
          method: 'deposit',
          params: [{
            asset: {
              chain: 'THOR',
              symbol: 'RUNE',
              ticker: 'RUNE'
            },
            from: params.walletAddress,
            amount: {
              amount: 0,
              decimals: 8
            },
            memo,
          }]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  public async sendEnableBondRequest(params: WhitelistRequest): Promise<string> {
    const memo = createEnableBondMemo(params);

    return new Promise((resolve, reject) => {
      if (!window.xfi?.thorchain) {
        reject(new Error('XDEFI wallet not found. Please install XDEFI extension.'));
        return;
      }
      
      window.xfi.thorchain.request(
        {
          method: 'deposit',
          params: [{
            asset: {
              chain: 'THOR',
              symbol: 'RUNE',
              ticker: 'RUNE'
            },
            from: params.node.operator,
            amount: {
              amount: assetToBase(assetAmount(1, 8)).amount().toNumber(),
              decimals: 8
            },
            memo,
          }]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  public async getWhitelistRequests(connectedAddress?: string): Promise<{ operator: WhitelistRequest[], user: WhitelistRequest[] }> {
    if (!this.isInitialized) {
      throw new Error('ThorBondEngine not initialized');
    }
  
    const requestsUser: WhitelistRequest[] = [];
    const requestsOperator: WhitelistRequest[] = [];
  
    for (const action of this.actions) { // TODO: Optimize taking into account rate limits

      const memo = action.data.memo as string;
      if (!memo) continue;
  
      const parts = memo.split(':');
      if (parts.length !== 4 || parts[0] !== 'TB') continue;
  
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, nodeAddress, userAddress, amountStr] = parts;
  
      if (!nodeAddress.startsWith('thor1') || !userAddress.startsWith('thor1')) continue;
  
      const amount = Number(amountStr);
      if (isNaN(amount) || amount <= 0) continue;

      const node = this.getListedNodes().find(node => node.address === nodeAddress);
  
      if (!node) {
        throw new Error('Node not found');
      }

      if (userAddress === connectedAddress || node.operator === connectedAddress) {

        const bondInfo = await this.getBondInfoForUser(node.address, userAddress)

        let status: "pending" | "approved" | "rejected" | "bonded" = 'pending'

        if (bondInfo.isBondProvider) {
          status = 'approved';
        }
        if (bondInfo.isBondProvider && bondInfo.bond > 0) {
          status = 'bonded';
        }

        if (userAddress === connectedAddress) {  
          requestsUser.push({
            node: {
              ...node,
              status: bondInfo.status
            },
            walletAddress: userAddress,
            intendedBondAmount: amount,
            realBond: baseToAsset(baseAmount(bondInfo.bond, 8)).amount().toNumber(),
            status,
            createdAt: new Date(action.timestamp / 1000000)
          });
        }
  
        if (node.operator === connectedAddress) {
          requestsOperator.push({
            node: {
              ...node,
              status: bondInfo.status
            },
            walletAddress: userAddress,
            intendedBondAmount: amount,
            realBond: baseToAsset(baseAmount(bondInfo.bond, 8)).amount().toNumber(),
            status,
            createdAt: new Date(action.timestamp / 1000000)
          });
        }
      }
    };

    // Remove duplicates
    const dedupedOperatorRequestsByNode = Array.from(
      new Map(requestsOperator.map(ro => [ro.node.address, ro])).values()
    );

    const dedupedUserRequestsByNode = Array.from(
      new Map(requestsUser.map(ru => [ru.node.address, ru])).values()
    );
  
    return {
      operator: dedupedOperatorRequestsByNode,
      user: dedupedUserRequestsByNode
    };
  }
}

export default ThorBondEngine; 