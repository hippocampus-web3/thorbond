import React, { createContext, useContext, useState, useCallback } from 'react';
import { decryptFromKeystore, Keystore } from '@xchainjs/xchain-crypto';

import {
  Client as ThorChainClient,
  defaultClientConfig as defaultThorchainClientConfig,
} from "@xchainjs/xchain-thorchain";
import { KeplrProvider, ThorchainProvider, VultisigThorchainProvider } from '../types/wallets';
import { KeplrThorchainConfig } from '../lib/wallet/keplr';

export type WalletType = 'xdefi' | 'vultisig' | 'keystore' | 'keplr' | 'leap';
export type WalletProvider = ThorChainClient | VultisigThorchainProvider | ThorchainProvider | KeplrProvider;

interface WalletContextType {
  address: string | null;
  isConnected: null | WalletType
  walletProvider: WalletProvider | null;
  connect: (walletType?: WalletType, data?: { keystoreData: Keystore, password: string }) => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<null | WalletType>(null);
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(null);

  const connect = useCallback(async (walletType: string = 'vultisig', data?: { keystoreData: Keystore, password: string }) => {
    try {
      switch (walletType) {
        case 'vultisig': {
          let accounts = [];
          const vultisigEthProvider = window.vultisig?.thorchain;
          if (!vultisigEthProvider) {
            throw new Error('Vultisig provider not found');
          }
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
            if (Array.isArray(connectedAcount)) {
              accounts.push(connectedAcount[0]);
            }
          }

          if (!accounts[0]) {
            throw new Error('No account connected');
          }

          setWalletProvider(window.vultisig?.thorchain || null)
          setAddress(accounts[0]);
          break;
        }

        case 'xdefi': {
          if (!window.xfi?.thorchain) {
            throw new Error('Ctrl provider not found');
          }

          const requestAccounts = () =>
            new Promise<string[]>((resolve, reject) => {
              window.xfi?.thorchain.request(
                { method: 'request_accounts', params: [] },
                (error, result) => {
                  if (error) {
                    reject(error);
                  }
                  resolve(result);
                }
              );
            });

          const accounts = await requestAccounts();

          if (!accounts[0]) {
            throw new Error('No account connected');
          }

          setWalletProvider(window.xfi.thorchain);
          setAddress(accounts[0]);
          break;
        }

        case 'keystore': {
          if (!data?.keystoreData || !data?.password) {
            throw new Error('Keystore data and password are required');
          }

          const phrase = await decryptFromKeystore(data?.keystoreData, data?.password);

          if (phrase) {
            const thorchainClient = new ThorChainClient({
              ...defaultThorchainClientConfig,
              phrase
            });

            const address = await thorchainClient.getAddressAsync();

            setWalletProvider(thorchainClient)
            setAddress(address)
          }
          break;
        }

        case 'keplr': {
          if (!window.keplr) {
            throw new Error('Keplr extension not found');
          }

          let offlineSigner = null;

          try {
            await window.keplr.enable('thorchain-1');
            offlineSigner = window.keplr.getOfflineSignerOnlyAmino('thorchain-1');
          } catch {
            await window.keplr.experimentalSuggestChain(KeplrThorchainConfig);
          }

          if (!offlineSigner) {
            throw new Error('Chain is not enabled');
          }

          const accounts = await offlineSigner.getAccounts();
          if (!accounts[0]) {
            throw new Error('No account connected');
          }

          setWalletProvider(window.keplr);
          setAddress(accounts[0].address);
          break;
        }

        case 'leap': {
          if (!window.leap) {
            throw new Error('Leap extension not found');
          }

          let offlineSigner = null;

          try {
            await window.leap.enable('thorchain-1');
            offlineSigner = window.leap.getOfflineSignerOnlyAmino('thorchain-1');
          } catch {
            await window.leap.experimentalSuggestChain(KeplrThorchainConfig);
          }

          if (!offlineSigner) {
            throw new Error('Chain is not enabled');
          }

          const accounts = await offlineSigner.getAccounts();
          if (!accounts[0]) {
            throw new Error('No account connected');
          }

          setWalletProvider(window.leap);
          setAddress(accounts[0].address);
          break;
        }

        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      setIsConnected(walletType);
    } catch (err) {
      setIsConnected(null);
      setAddress(null);
      setWalletProvider(null);
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    setAddress(null);
    setIsConnected(null);
  }, []);

  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect, walletProvider }}>
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