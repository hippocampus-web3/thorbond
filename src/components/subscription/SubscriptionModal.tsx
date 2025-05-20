import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import EmailStep from './EmailStep';
import PaymentStep from './PaymentStep';
import ConfirmationStep from './ConfirmationStep';
import RuneBondEngine from '../../lib/runebondEngine/runebondEngine';
import { useWallet } from '../../contexts/WalletContext';
import { assetAmount, assetToBase } from '@xchainjs/xchain-util';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeAddress: string;
  onPaymentExecute: (memo: string, amount: number) => Promise<{ txId: string }>;
  onConnectWallet: () => void;
  txSubscriptionHash: string | null;
  onClearTx: () => void;
}

const PRICE_PER_MONTH = 1;

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  nodeAddress,
  onPaymentExecute,
  onConnectWallet,
  txSubscriptionHash,
  onClearTx
}) => {
  const [step, setStep] = useState<'email' | 'payment' | 'confirmation'>('email');
  const [email, setEmail] = useState('');
  const [months, setMonths] = useState(1);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memo, setMemo] = useState('');
  const [isNewSubscription, setIsNewSubscription] = useState(true);
  const { isConnected } = useWallet();

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setMonths(1);
      setEmailError('');
      setIsLoading(false);
      setMemo('');
      setIsNewSubscription(true);
    }
    if (txSubscriptionHash) {
      setStep('confirmation');
    }
  }, [isOpen, txSubscriptionHash]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
  };

  const handleMonthsChange = (months: number) => {
    setMonths(months);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const engine = RuneBondEngine.getInstance();
      const response = await engine.createSubscription(email, nodeAddress);
      setMemo(response.data.memo);
      setIsNewSubscription(response.is_new_subscription);
      setStep('payment');
    } catch (error) {
      console.error('Error creating subscription:', error);
      setEmailError('Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    if (!isConnected) {
      onConnectWallet();
      return;
    }
    
    try {
      setIsLoading(true);
      await onPaymentExecute(memo, assetToBase(assetAmount(PRICE_PER_MONTH * months)).amount().toNumber());
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error processing payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              {step === 'email' && (
                <EmailStep
                  email={email}
                  months={months}
                  emailError={emailError}
                  isLoading={isLoading}
                  onEmailChange={handleEmailChange}
                  onMonthsChange={handleMonthsChange}
                  onSubmit={handleEmailSubmit}
                />
              )}

              {step === 'payment' && (
                <PaymentStep
                  nodeAddress={nodeAddress}
                  email={email}
                  months={months}
                  memo={memo}
                  isLoading={isLoading}
                  isConnected={!!isConnected}
                  onBack={() => setStep('email')}
                  onWalletConnect={handleWalletConnect}
                  isNewSubscription={isNewSubscription}
                />
              )}

              {step === 'confirmation' && (
                <ConfirmationStep
                  onClose={() => {
                    onClearTx();
                    onClose();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal; 