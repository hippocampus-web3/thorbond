import axios from 'axios';

interface MidgardAction {
  status: string;
  type: string;
  date: string;
  height: string;
  in: Array<{
    address: string;
    coins: Array<{
      amount: string;
      asset: string;
    }>;
    txID: string;
  }>;
  out: Array<{
    address: string;
    coins: Array<{
      amount: string;
      asset: string;
    }>;
    txID: string;
  }>;
}

interface MidgardResponse {
  actions: MidgardAction[];
  count: string;
  meta: {
    nextPageToken: string;
    prevPageToken: string;
  };
}

export class MidgardClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://midgard.ninerealms.com/v2') {
    this.baseUrl = baseUrl;
  }

  async isTransactionConfirmed(txId: string): Promise<boolean> {
    try {
      const response = await axios.get<MidgardResponse>(`${this.baseUrl}/actions`, {
        params: { txid: txId }
      });

      if (!response.data.actions || response.data.actions.length === 0) {
        return false;
      }

      const action = response.data.actions[0];
      return action.status === 'success';
    } catch (error) {
      console.error('Error checking transaction confirmation:', error);
      return false;
    }
  }
} 