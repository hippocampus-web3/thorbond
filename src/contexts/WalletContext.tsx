import React, { createContext, useContext, useState, useCallback } from 'react';

interface WalletContextType {
  address: string | null;
  isConnected: null | 'xdefi' | 'vultisig';
  error: string | null;
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<null | 'xdefi' | 'vultisig'>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (walletType: string = 'vultisig') => {
    try {
      setError(null);
      
      switch (walletType) {
        case 'vultisig': 
          let accounts = [];
          const vultisigEthProvider = window.vultisig?.thorchain
          const requestedAccounts = await vultisigEthProvider.request({
            method: "get_accounts",
          });
          if (requestedAccounts && requestedAccounts.length > 0) {
            accounts = requestedAccounts.filter(
              (account: string | null) => account !== null,
            );
          }
          if (!accounts || accounts.length <= 0) {
            const connectedAcount = await vultisigEthProvider.request({
              method: "request_accounts",
            });
            accounts.push(connectedAcount[0]);
          }
          setAddress(accounts[0]);
          break;

        case 'xdefi':
          if (!window.xfi?.thorchain) {
            throw new Error('Please install XDEFI extension');
          }
          
          window.xfi.thorchain.request(
            { method: 'request_accounts', params: [] },
            (error, result) => {
              if (error) {
                throw error;
              }
              setAddress(result[0]);
            }
          );
          break;

        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }
      
      setIsConnected(walletType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setIsConnected(null);
      setAddress(null);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setAddress(null);
    setIsConnected(null);
    setError(null);
  }, []);

  return (
    <WalletContext.Provider value={{ address, isConnected, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 