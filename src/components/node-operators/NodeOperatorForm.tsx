import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validateThorAddress } from '../../lib/utils';

// Form validation schema
const nodeOperatorSchema = z.object({
  address: z.string().min(1, 'Node address is required')
    .refine(validateThorAddress, {
      message: 'Invalid THORChain node address',
    }),
  bondingCapacity: z.string()
    .min(1, 'Bonding capacity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Bonding capacity must be a positive number',
    }),
  minimumBond: z.string()
    .min(1, 'Minimum bond is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Minimum bond must be a positive number',
    }),
  feePercentage: z.string()
    .min(1, 'Fee percentage is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
      message: 'Fee percentage must be between 0 and 100',
    }),
  instantChurnAmount: z.string()
    .min(1, 'Instant churn amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Instant churn amount must be a non-negative number',
    }),
  description: z.string().optional(),
  contactInfo: z.string().optional(),
});

type NodeOperatorFormData = z.infer<typeof nodeOperatorSchema>;

interface NodeOperatorFormProps {
  initialData?: Partial<NodeOperatorFormData>;
  onSubmit: (data: NodeOperatorFormData) => void;
  onCancel: () => void;
}

const NodeOperatorForm: React.FC<NodeOperatorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<NodeOperatorFormData>({
    resolver: zodResolver(nodeOperatorSchema),
    defaultValues: initialData || {
      feePercentage: '16',
    },
  });

  const bondingCapacity = Number(watch('bondingCapacity') || 0);
  const minimumBond = Number(watch('minimumBond') || 0);
  const instantChurnAmount = Number(watch('instantChurnAmount') || 0);

  const isFormValid = bondingCapacity >= minimumBond && instantChurnAmount <= bondingCapacity;

  const onFormSubmit = (data: NodeOperatorFormData) => {
    onSubmit({
      ...data,
      bondingCapacity: data.bondingCapacity,
      minimumBond: data.minimumBond,
      feePercentage: data.feePercentage,
      instantChurnAmount: data.instantChurnAmount,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Node Operator Details' : 'Publish Node Operator Listing'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Provide your node details to publish a bonding opportunity for users.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Node Operator Address"
              placeholder="thor..."
              {...register('address')}
              error={errors.address?.message}
              fullWidth
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Available Bonding Capacity (RUNE)"
                type="number"
                min="0"
                {...register('bondingCapacity')}
                error={errors.bondingCapacity?.message}
                fullWidth
              />
              
              <Input
                label="Minimum Bond Requirement (RUNE)"
                type="number"
                min="0"
                {...register('minimumBond')}
                error={errors.minimumBond?.message}
                fullWidth
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Node Operator Fee (%)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...register('feePercentage')}
                error={errors.feePercentage?.message}
                fullWidth
              />
              
              <Input
                label="Instant Churn Amount (RUNE)"
                type="number"
                min="0"
                {...register('instantChurnAmount')}
                error={errors.instantChurnAmount?.message}
                fullWidth
              />
            </div>
            
            <Input
              label="Description (Optional)"
              placeholder="Describe your node operation, experience, etc."
              {...register('description')}
              error={errors.description?.message}
              fullWidth
              as="textarea"
              rows={3}
            />
            
            <Input
              label="Contact Information (Optional)"
              placeholder="Discord, Telegram, X, etc."
              {...register('contactInfo')}
              error={errors.contactInfo?.message}
              fullWidth
            />
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
          disabled={isSubmitting || !isFormValid}
        >
          {initialData ? 'Update Listing' : 'Publish Listing'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NodeOperatorForm;
