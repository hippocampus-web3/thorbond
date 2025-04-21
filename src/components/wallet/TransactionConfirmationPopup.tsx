import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { ThorchainTransferParams } from '../../types/wallets';
import { formatRune } from '../../lib/utils';
import { baseAmount } from '@xchainjs/xchain-util';
import Tooltip from '../ui/Tooltip';
import Modal from '../ui/Modal';

interface TransactionConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  transaction: ThorchainTransferParams;
  transactionType: 'listing' | 'whitelist' | 'enableBond' | 'bond' | 'unbond' | 'message';
  isLoading?: boolean;
  additionalInfo?: {
    intendedBondAmount?: string;
  };
}

const TransactionConfirmationPopup: React.FC<TransactionConfirmationPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  transactionType,
  isLoading = false,
  additionalInfo
}) => {
  const isMessageType = transactionType === 'message';
  const initialCheckboxes = isMessageType 
    ? { messagePermanent: false } 
    : { trust: false, locked: false, responsibility: false };

  const [checkboxes, setCheckboxes] = useState(initialCheckboxes);

  useEffect(() => {
    setCheckboxes(isMessageType 
      ? { messagePermanent: false } 
      : { trust: false, locked: false, responsibility: false });
  }, [isOpen, transactionType, isMessageType]);

  const handleCheckboxChange = (key: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allChecked = Object.values(checkboxes).every(Boolean);

  if (!isOpen) return null;

  const truncateText = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  const handleOpenInExplorer = (address: string) => {
    window.open(`https://thorchain.net/address/${address}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Transaction"
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Transaction Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">{formatRune(baseAmount(transaction.amount.amount, transaction.amount.decimals))} RUNE</span>
            </div>
            {transactionType === 'whitelist' && additionalInfo?.intendedBondAmount && (
              <div className="flex justify-between">
                <span className="text-gray-500">Intended Bond Amount:</span>
                <span className="font-medium">{formatRune(baseAmount(additionalInfo.intendedBondAmount, 8), true)} RUNE</span>
              </div>
            )}
            {transaction.recipient && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Recipient:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenInExplorer(transaction.recipient!)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                    title="View in explorer"
                  >
                    runebond
                  </button>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}
            {transaction.memo && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <span className="text-gray-500">Memo:</span>
                <Tooltip 
                  content={
                    <div className="max-w-[400px] break-words whitespace-pre-wrap">
                      {transaction.memo}
                    </div>
                  }
                >
                  <span className="font-medium break-all">
                    {truncateText(transaction.memo)}
                  </span>
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Important Disclaimers</h3>
          <div className="space-y-4">
            {isMessageType ? (
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="messagePermanent"
                  checked={checkboxes.messagePermanent}
                  onChange={() => handleCheckboxChange('messagePermanent')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="messagePermanent" className="text-sm text-gray-700">
                  I understand that this message will be permanently recorded on the THORChain blockchain and cannot be deleted or edited.
                </label>
              </div>
            ) : (
              <>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="trust"
                    checked={checkboxes.trust}
                    onChange={() => handleCheckboxChange('trust')}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trust" className="text-sm text-gray-700">
                    By delegating, I am trusting a third party to act responsibly. If the operator misbehaves, I could lose part or all of my bonded RUNE.
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="locked"
                    checked={checkboxes.locked}
                    onChange={() => handleCheckboxChange('locked')}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="locked" className="text-sm text-gray-700">
                    My RUNE may remain locked until the node exits the network or is forcefully.
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="responsibility"
                    checked={checkboxes.responsibility}
                    onChange={() => handleCheckboxChange('responsibility')}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="responsibility" className="text-sm text-gray-700">
                    RUNEBond provides tools to help, but I take full responsibility for my choice of node.
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed relative"
            disabled={isLoading || !allChecked}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Confirm</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionConfirmationPopup; 