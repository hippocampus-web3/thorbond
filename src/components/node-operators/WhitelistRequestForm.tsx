import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { validateThorAddress } from '../../lib/utils';
import { NodeOperator } from '../../types';

// Form validation schema
const requestSchema = z.object({
  discordUsername: z.string().min(1, 'Discord username is required'),
  xUsername: z.string().min(1, 'X username is required'),
  telegramUsername: z.string().min(1, 'Telegram username is required'),
  walletAddress: z.string().min(1, 'Wallet address is required')
    .refine(validateThorAddress, {
      message: 'Invalid THORChain wallet address',
    }),
  intendedBondAmount: z.string()
    .min(1, 'Bond amount is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Bond amount must be a number',
    }),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface WhitelistRequestFormProps {
  nodeOperator: NodeOperator;
  onSubmit: (data: RequestFormData) => void;
  onCancel: () => void;
}

const WhitelistRequestForm: React.FC<WhitelistRequestFormProps> = ({
  nodeOperator,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      intendedBondAmount: nodeOperator.minimumBond.toString(),
    },
  });

  const intendedBondAmount = Number(watch('intendedBondAmount') || 0);
  const isBondAmountValid = intendedBondAmount >= nodeOperator.minimumBond;

  const onFormSubmit = (data: RequestFormData) => {
    onSubmit({
      ...data,
      intendedBondAmount: data.intendedBondAmount,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">Request Whitelist for Bonding</h2>
        <p className="mt-1 text-sm text-gray-600">
          Submit your information to request whitelisting with this node operator.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Node Operator Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Address:</span>
                <p className="font-medium">{nodeOperator.address.slice(0, 10)}...{nodeOperator.address.slice(-6)}</p>
              </div>
              <div>
                <span className="text-gray-500">Minimum Bond:</span>
                <p className="font-medium">{nodeOperator.minimumBond.toLocaleString()} RUNE</p>
              </div>
              <div>
                <span className="text-gray-500">Fee Percentage:</span>
                <p className="font-medium">{nodeOperator.feePercentage}%</p>
              </div>
              <div>
                <span className="text-gray-500">Available Capacity:</span>
                <p className="font-medium">{nodeOperator.bondingCapacity.toLocaleString()} RUNE</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Discord Username"
              placeholder="e.g., username#1234"
              {...register('discordUsername')}
              error={errors.discordUsername?.message}
              fullWidth
            />
            
            <Input
              label="X Username"
              placeholder="e.g., @username"
              {...register('xUsername')}
              error={errors.xUsername?.message}
              fullWidth
            />
            
            <Input
              label="Telegram Username"
              placeholder="e.g., @username"
              {...register('telegramUsername')}
              error={errors.telegramUsername?.message}
              fullWidth
            />
            
            <Input
              label="THORChain Wallet Address"
              placeholder="thor..."
              {...register('walletAddress')}
              error={errors.walletAddress?.message}
              fullWidth
            />
            
            <Input
              label="Intended Bond Amount (RUNE)"
              type="number"
              min={nodeOperator.minimumBond}
              {...register('intendedBondAmount')}
              error={errors.intendedBondAmount?.message}
              fullWidth
            />
            
            {!isBondAmountValid && intendedBondAmount > 0 && (
              <Alert variant="warning">
                The bond amount must be at least {nodeOperator.minimumBond.toLocaleString()} RUNE.
              </Alert>
            )}
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit(onFormSubmit)}
          disabled={isSubmitting || !isBondAmountValid}
        >
          Submit Request
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WhitelistRequestForm;
