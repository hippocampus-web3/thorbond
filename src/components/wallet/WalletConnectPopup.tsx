import React from 'react';
import { X, Wallet } from 'lucide-react';
import CtrlSVG from './Ctrl';
import Vultisig from './Vultisig';

interface WalletConnectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: string) => void;
}

const WalletConnectPopup: React.FC<WalletConnectPopupProps> = ({
  isOpen,
  onClose,
  onSelectWallet,
}) => {
  if (!isOpen) return null;

  const wallets = [
    {
      id: 'vultisig',
      name: 'Vultisig',
      description: 'Connect with Vulticonnect Extension',
      icon: <Vultisig className="h-6 w-6" />,
      disabled: false,
    },
    {
      id: 'xdefi',
      name: 'XDEFI',
      description: 'Connect with XDEFI Wallet',
      icon: <CtrlSVG className="h-6 w-6" />,
      disabled: false,
    },
    {
      id: 'keystore',
      name: 'Keystore',
      description: 'Connect with Keystore file',
      icon: <Wallet className="h-6 w-6 text-blue-600" />,
      disabled: true,
      tooltip: 'Coming soon',
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="relative group">
              <button
                onClick={() => !wallet.disabled && onSelectWallet(wallet.id)}
                disabled={wallet.disabled}
                className={`w-full flex items-center p-4 border border-gray-200 rounded-lg transition-colors ${
                  wallet.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {wallet.icon}
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-sm font-medium text-gray-900">{wallet.name}</h3>
                  <p className="text-sm text-gray-500">{wallet.description}</p>
                </div>
              </button>
              {wallet.disabled && wallet.tooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {wallet.tooltip}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-800 transform rotate-45"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletConnectPopup; 