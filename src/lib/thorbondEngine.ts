import axios from 'axios';
import { NodeOperator } from '../types';

interface ThorBondAction {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

interface MidgardAction {
  type: string;
  date: string;
  height: string;
  in: unknown[];
  out: unknown[];
  pools: string[];
  status: string;
  metadata: {
    send?: {
      code: string;
      memo: string;
      networkFees: Array<{
        amount: string;
        asset: string;
      }>;
      reason: string;
    };
  };
}

interface ListingParams {
  nodeAddress: string;
  operatorAddress: string;
  minRune: number;
  maxRune: number;
  feePercentage: number;
}

interface ListingMemo {
  nodeAddress: string;
  operatorAddress: string;
  minRune: number;
  maxRune: number;
  feePercentage: number;
}

class ThorBondEngine {
  private static instance: ThorBondEngine;
  private readonly MIDGARD_API_URL = 'https://midgard.ninerealms.com/v2';
  private readonly THORBOND_ADDRESS = 'thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9';
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
    } catch (error) {
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

  public getNodes(): NodeOperator[] {
    if (!this.isInitialized) {
      throw new Error('ThorBondEngine not initialized');
    }

    const nodes: NodeOperator[] = [];
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
        id: action.data.height as string,
        address: listingMemo.nodeAddress,
        bondingCapacity: listingMemo.maxRune,
        minimumBond: listingMemo.minRune,
        feePercentage: listingMemo.feePercentage,
        description: '',
        contactInfo: '',
        createdAt: new Date(action.timestamp / 1000000)
      });
    });

    return nodes;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const response = await axios.get(`${this.MIDGARD_API_URL}/actions`, {
      params: {
        address: this.THORBOND_ADDRESS,
        limit: 50,
        offset: 0,
        type: 'send'
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

    if (!window.xfi?.thorchain) {
      throw new Error('XDEFI wallet not found. Please install XDEFI extension.');
    }

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
              amount: 10000000, // 0.1 RUNE (8 decimals)
              decimals: 8
            },
            memo,
            gasLimit: '10000000' // optional
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
}

export default ThorBondEngine; 