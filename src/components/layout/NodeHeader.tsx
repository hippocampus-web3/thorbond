import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Copy, Check } from 'lucide-react';
import { shortenAddress, formatRune } from '../../lib/utils';
import { BaseAmount } from '@xchainjs/xchain-util';
import { NodeListingDto } from '@hippocampus-web3/runebond-client';

interface NodeHeaderProps {
  node: NodeListingDto;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAuthenticated: boolean;
  walletAddress: string | null;
  balance: BaseAmount | null;
  isLoadingBalance: boolean;
  onConnectWallet: () => void;
  onDisconnect: () => Promise<void>;
}

const NodeHeader: React.FC<NodeHeaderProps> = ({
  node,
  isDarkMode,
  toggleDarkMode,
  isAuthenticated,
  walletAddress,
  balance,
  isLoadingBalance,
  onConnectWallet,
  onDisconnect
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm shadow-sm relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {(node as any).name ? (
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{(node as any).name}</h1>
            ) : (
              <img
                src="/runebond-isologo.svg"
                alt="Node"
                className="h-10 w-10 rounded-full"
              />
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {walletAddress && shortenAddress(walletAddress)}
                  </span>
                  <button
                    onClick={() => handleCopy(walletAddress!)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copiar dirección"
                  >
                    {copiedAddress === walletAddress ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="text-sm text-gray-500 border-l pl-4 border-gray-200">
                  {isLoadingBalance ? (
                    <span className="animate-pulse">Cargando balance...</span>
                  ) : (
                    <>Balance: {balance ? formatRune(balance) : '0'} RUNE</>
                  )}
                </div>
                <button
                  onClick={onDisconnect}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default NodeHeader; 