import React from 'react';
import { Wallet } from 'lucide-react';
import CtrlSVG from './Ctrl';
import Vultisig from './Vultisig';
import KeplrSVG from './Keplr';
import { WalletType } from '../../contexts/WalletContext';
import Modal from '../ui/Modal';

interface WalletConnectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: WalletType) => void;
}

const WalletConnectPopup: React.FC<WalletConnectPopupProps> = ({
  isOpen,
  onClose,
  onSelectWallet,
}) => {
  const wallets = [
    {
      id: 'vultisig',
      name: 'Vultisig',
      description: 'Connect with Vulticonnect Extension',
      icon: <Vultisig className="h-6 w-6" />,
      disabled: false,
      tooltip: null
    },
    {
      id: 'xdefi',
      name: 'Ctrl',
      description: 'Connect with Ctrl Wallet',
      icon: <CtrlSVG className="h-6 w-6" />,
      disabled: false,
      tooltip: null
    },
    {
      id: 'keplr',
      name: 'Keplr',
      description: 'Connect with Keplr Wallet',
      icon: <KeplrSVG className="h-6 w-6" />,
      disabled: false,
      tooltip: null
    },
    {
      id: 'keystore',
      name: 'Keystore',
      description: 'Connect with Keystore file',
      icon: <Wallet className="h-6 w-6 text-blue-600" />,
      tooltip: null
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Wallet"
    >
      <div className="space-y-3">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="relative group">
            <button
              onClick={() => !wallet.disabled && onSelectWallet(wallet.id as WalletType)}
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
    </Modal>
  );
};

export default WalletConnectPopup; 