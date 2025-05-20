import axios from 'axios';
import { Configuration, NodesApi, BankApi } from '@xchainjs/xchain-thornode';
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util';
import { NodesResponse } from '@xchainjs/xchain-thornode';

const THORNODE_API_URL = 'https://thornode.ninerealms.com/';
const apiconfig = new Configuration({ basePath: THORNODE_API_URL });

export class ThornodeClient {
  private static instance: ThornodeClient;
  private readonly nodesApi: NodesApi;
  private readonly bankApi: BankApi;

  private constructor() {
    this.nodesApi = new NodesApi(apiconfig, undefined, axios);
    this.bankApi = new BankApi(apiconfig, undefined, axios);
  }

  public static getInstance(): ThornodeClient {
    if (!ThornodeClient.instance) {
      ThornodeClient.instance = new ThornodeClient();
    }
    return ThornodeClient.instance;
  }

  public async getAllNodes(): Promise<NodesResponse> {
    try {
      const response = await this.nodesApi.nodes();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
      throw new Error('Failed to fetch nodes');
    }
  }

  public async getAddressBalance(address: string): Promise<BaseAmount> {
    try {
      const response = await this.bankApi.balances(address);
      const balanceData = response.data;

      if (!balanceData?.result) {
        throw new Error('Failed to fetch address balance');
      }
      
      const runeAmount = balanceData.result.find(b => b.denom === 'rune')?.amount || 0;

      return baseAmount(runeAmount);
    } catch (error) {
      console.error('Failed to fetch address balance:', error);
      throw new Error('Failed to fetch address balance');
    }
  }
} 