import React, { createContext, useContext, useState } from 'react';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      if (!window.xfi?.thorchain) {
        throw new Error('XDEFI wallet not found');
      }

      const thorchain = window.xfi.thorchain;
      return new Promise<void>((resolve, reject) => {
        thorchain.request(
          { method: 'request_accounts', params: [] },
          (error, accounts) => {
            if (error) {
              setError(error.message);
              reject(error);
              return;
            }

            if (accounts && Array.isArray(accounts) && accounts.length > 0) {
              setAddress(accounts[0] as string);
              setIsConnected(true);
              setError(null);
              resolve();
            } else {
              const error = new Error('No accounts found');
              setError(error.message);
              reject(error);
            }
          }
        );
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error connecting wallet';
      setError(errorMessage);
      setAddress(null);
      setIsConnected(false);
      throw err;
    }
  };

  const disconnect = async () => {
    try {
      setAddress(null);
      setIsConnected(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error disconnecting wallet';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        error,
        connect,
        disconnect
      }}
    >
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