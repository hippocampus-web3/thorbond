import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';
import { formatRune, validateThorAddress } from '../../lib/utils';
import { useWallet } from '../../contexts/WalletContext';
import { baseAmount, baseToAsset } from '@xchainjs/xchain-util';
import { NodeListingDto } from '@hippocampus-web3/runebond-client';

// Form validation schema
const requestSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required')
    .refine(validateThorAddress, {
      message: 'Invalid THORChain wallet address',
    }),
  intendedBondAmount: z.string()
    .min(1, 'Bond amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Bond amount must be a positive number',
    }),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface WhitelistRequestFormProps {
  node: NodeListingDto;
  onSubmit: (data: RequestFormData) => void;
  onCancel: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const WhitelistRequestForm: React.FC<WhitelistRequestFormProps> = ({
  node,
  onSubmit,
  onCancel,
  isOpen,
  onClose,
}) => {
  const { address } = useWallet();
  const [formData, setFormData] = useState<RequestFormData>({
    walletAddress: address || '',
    intendedBondAmount: baseToAsset(baseAmount(node.minRune)).amount().toString(),
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    mode: 'onChange',
    defaultValues: formData,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValue(name as keyof RequestFormData, value);
  };

  const isBondAmountValid = Number(formData.intendedBondAmount) >= baseToAsset(baseAmount(node.minRune)).amount().toNumber();
  const isFormValid = validateThorAddress(formData.walletAddress) && 
                     Number(formData.intendedBondAmount) > 0 && 
                     isBondAmountValid;

  const handleFormSubmit = (data: RequestFormData) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Whitelist for Bonding"
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Node Operator Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Address:</span>
              <p className="font-medium text-gray-900">{node.nodeAddress.slice(0, 10)}...{node.nodeAddress.slice(-6)}</p>
            </div>
            <div>
              <span className="text-gray-500">Minimum Bond:</span>
              <p className="font-medium text-gray-900">{formatRune(baseAmount(node.minRune))} RUNE</p>
            </div>
            <div>
              <span className="text-gray-500">Fee Percentage:</span>
              <p className="font-medium text-gray-900">{node.feePercentage / 100}%</p>
            </div>
            <div>
              <span className="text-gray-500">Available Capacity:</span>
              <p className="font-medium text-gray-900">{formatRune(baseAmount(node.maxRune))} RUNE</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="THORChain Wallet Address"
              placeholder="thor..."
              name="walletAddress"
              value={formData.walletAddress}
              disabled={import.meta.env.VITE_FEATURE_FLAG_ENFORCE_ADDRESS === 'true'}
              onChange={import.meta.env.VITE_FEATURE_FLAG_ENFORCE_ADDRESS !== 'true' ?  handleInputChange : () => {}}
              error={errors.walletAddress?.message}
              fullWidth
            />
            
            <Input
              label="Intended Bond Amount (RUNE)"
              type="number"
              min={node.minRune}
              name="intendedBondAmount"
              value={formData.intendedBondAmount}
              onChange={handleInputChange}
              error={errors.intendedBondAmount?.message}
              fullWidth
            />
            
            {!isBondAmountValid && Number(formData.intendedBondAmount) > 0 && (
              <Alert variant="warning">
                The bond amount must be at least {formatRune(baseAmount(node.minRune))} RUNE.
              </Alert>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={!isFormValid}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default WhitelistRequestForm;
