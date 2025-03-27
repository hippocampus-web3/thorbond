import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface FormData {
  address: string;
  bondingCapacity: string;
  minimumBond: string;
  feePercentage: string;
  description: string;
  contactInfo: string;
}

const validationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  bondingCapacity: z.string().min(1, 'Bonding capacity is required'),
  minimumBond: z.string().min(1, 'Minimum bond is required'),
  feePercentage: z.string().min(1, 'Fee percentage is required'),
  description: z.string().min(1, 'Description is required'),
  contactInfo: z.string().min(1, 'Contact info is required'),
});

interface NodeOperatorFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  initialData?: FormData;
}

const NodeOperatorForm: React.FC<NodeOperatorFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<FormData>({
    address: initialData?.address || '',
    bondingCapacity: initialData?.bondingCapacity || '',
    minimumBond: initialData?.minimumBond || '',
    feePercentage: initialData?.feePercentage || '16',
    description: initialData?.description || '',
    contactInfo: initialData?.contactInfo || ''
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    mode: 'onChange',
    defaultValues: formData,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValue(name as keyof FormData, value);
  };

  const handleSubmitForm = async (data: FormData) => {
    onSubmit(data);
  };

  const isValid = formData.address && 
                 formData.bondingCapacity && 
                 formData.minimumBond && 
                 formData.feePercentage && 
                 formData.description && 
                 formData.contactInfo;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Node Operator Listing' : 'Create New Node Operator Listing'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {initialData 
            ? 'Update your node operator listing details below.'
            : 'Fill in the details below to create a new node operator listing.'}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="THORChain Address"
              placeholder="thor..."
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              error={errors.address?.message}
              fullWidth
            />
            
            <Input
              label="Available Bonding Capacity (RUNE)"
              type="number"
              min="0"
              step="1"
              name="bondingCapacity"
              value={formData.bondingCapacity}
              onChange={handleInputChange}
              error={errors.bondingCapacity?.message}
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
              error={errors.minimumBond?.message}
              fullWidth
            />
            
            <Input
              label="Fee Percentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              name="feePercentage"
              value={formData.feePercentage}
              onChange={handleInputChange}
              error={errors.feePercentage?.message}
              fullWidth
            />
            
            <Input
              label="Description"
              placeholder="Describe your node operator service..."
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={errors.description?.message}
              fullWidth
            />
            
            <Input
              label="Contact Information"
              placeholder="How can users contact you?"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              error={errors.contactInfo?.message}
              fullWidth
            />
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit(handleSubmitForm)}
          disabled={!isValid}
        >
          {initialData ? 'Update Listing' : 'Publish Listing'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NodeOperatorForm;
