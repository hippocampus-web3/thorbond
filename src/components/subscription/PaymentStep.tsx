import React, { useState } from 'react';
import { Wallet, Copy, Check, ChevronDown, ArrowLeft } from 'lucide-react';
import Alert from '../ui/Alert';
import Button from '../ui/Button';

interface PaymentStepProps {
  nodeAddress: string;
  email: string;
  months: number;
  memo: string;
  isLoading: boolean;
  isConnected: boolean;
  onBack: () => void;
  onWalletConnect: () => Promise<void>;
  isNewSubscription: boolean;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  nodeAddress,
  email,
  months,
  memo,
  isLoading,
  isConnected,
  onBack,
  onWalletConnect,
  isNewSubscription
}) => {
  const [isManualPaymentExpanded, setIsManualPaymentExpanded] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  const handleCopy = (text: string, type: 'address' | 'memo') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else if (type === 'memo') {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to subscription details
      </button>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Complete Payment</h2>
      <p className="text-gray-600 mb-6">
        Connect your wallet or make a manual payment to complete your subscription.
      </p>

      {!isNewSubscription && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                This subscription is already active. By proceeding with the payment, you will extend its expiration date.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Subscription Details</h3>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Node Address</p>
              <code className="text-sm text-gray-900 break-all font-mono mt-1 block">{nodeAddress}</code>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Subscription Email</p>
              <code className="text-sm text-gray-900 break-all font-mono mt-1 block">{email}</code>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Price</p>
              <code className="text-sm text-gray-900 break-all font-mono mt-1 block">{months} RUNE (1 RUNE/month × {months} {months === 1 ? 'month' : 'months'})</code>
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={onWalletConnect}
        disabled={isLoading}
        fullWidth
        className="flex items-center justify-center gap-2"
      >
        <Wallet className="h-5 w-5" />
        {isLoading ? 'Processing...' : isConnected ? 'Pay Now' : 'Connect Wallet & Pay'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <button
            onClick={() => setIsManualPaymentExpanded(!isManualPaymentExpanded)}
            className="bg-white px-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            or pay manually
            <ChevronDown className={`h-4 w-4 transition-transform ${isManualPaymentExpanded ? 'transform rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isManualPaymentExpanded && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Manual Payment Details</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Send Payment To</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-gray-900 break-all font-mono bg-white p-2 rounded">
                  {import.meta.env.VITE_RUNEBOND_ADDRESS || "thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9"}
                </code>
                <button
                  onClick={() => handleCopy(import.meta.env.VITE_RUNEBOND_ADDRESS || "thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9", 'address')}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {copiedAddress ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Memo</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-gray-900 break-all font-mono bg-white p-2 rounded">
                  {memo}
                </code>
                <button
                  onClick={() => handleCopy(memo, 'memo')}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {copiedMemo ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Alert variant="warning">
              <p className="text-sm">
                Make sure to include the exact memo when sending your payment. The memo is required to process your subscription.
              </p>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStep; 