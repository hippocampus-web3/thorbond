import React, { useState } from 'react';
import { z } from 'zod';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validateThorAddress } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface FormData {
  address: string;
  bondingCapacity: string;
  minimumBond: string;
  feePercentage: string;
  description?: string;
  contactInfo?: string;
}

const validationSchema = z.object({
  address: z.string().min(1, 'Node Address is required'),
  bondingCapacity: z.string().refine(val => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, 'Bonding Capacity must be greater than 0'),
  minimumBond: z.string().refine(val => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, 'Minimum Bond must be greater than 0'),
  feePercentage: z.string().refine(val => {
    const num = Number(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, 'Fee Percentage must be between 0 and 100'),
  description: z.string().optional(),
  contactInfo: z.string().optional(),
});

interface NodeOperatorFormProps {
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const NodeOperatorForm: React.FC<NodeOperatorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>(initialData || {
    address: '',
    bondingCapacity: '',
    minimumBond: '',
    feePercentage: '16',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const validationResult = validationSchema.safeParse(formData);

      if (!validationResult.success) {
        throw validationResult.error;
      }

      await onSubmit(formData);
      onCancel();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
        toast.error(errorMessages);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const isValid = 
    formData.address && 
    Number(formData.bondingCapacity) > 0 &&
    Number(formData.minimumBond) > 0 &&
    Number(formData.bondingCapacity) >= Number(formData.minimumBond) &&
    Number(formData.feePercentage) >= 0 &&
    Number(formData.feePercentage) <= 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">
          Publish Node Operator Listing
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Provide your node details to publish a bonding opportunity for users.
        </p>
      </CardHeader>
      
      <CardContent>
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Node Address"
              placeholder="thor..."
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              error={errors.address}
              fullWidth
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Available Bonding Capacity (RUNE)"
                type="number"
                min="0"
                step="1"
                name="bondingCapacity"
                value={formData.bondingCapacity}
                onChange={handleInputChange}
                error={errors.bondingCapacity}
                fullWidth
              />
              
              <Input
                label="Minimum Bond Requirement (RUNE)"
                type="number"
                min="0"
                step="1"
                name="minimumBond"
                value={formData.minimumBond}
                onChange={handleInputChange}
                error={errors.minimumBond}
                fullWidth
              />
            </div>
            
            <Input
              label="Node Operator Fee (%)"
              type="number"
              min="0"
              max="100"
              step="0.1"
              name="feePercentage"
              value={formData.feePercentage}
              onChange={handleInputChange}
              error={errors.feePercentage}
              fullWidth
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!isValid}
              onClick={handleSubmit}
            >
              Publish Listing
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NodeOperatorForm;
