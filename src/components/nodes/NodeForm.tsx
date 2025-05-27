import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Dropdown from '../ui/Dropdown';
import { NodesResponse } from '@xchainjs/xchain-thornode';
import { NodeListingDto } from '@hippocampus-web3/runebond-client';

interface FormData {
  address: string;
  totalBondTarget: string;
  minimumBond: string;
  feePercentage: string;
}

const validationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  totalBondTarget: z.string().min(1, 'Bonding capacity is required'),
  minimumBond: z.string().min(1, 'Minimum bond is required'),
  feePercentage: z.string().min(1, 'Fee percentage is required')
});

interface NodeFormProps {
  availableNodes: NodesResponse; 
  alreadyListed: NodeListingDto[];
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  initialData?: FormData;
}

const NodeForm: React.FC<NodeFormProps> = ({
  availableNodes,
  alreadyListed,
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<FormData>({
    address: initialData?.address || '',
    totalBondTarget: initialData?.totalBondTarget || '',
    minimumBond: initialData?.minimumBond || '',
    feePercentage: initialData?.feePercentage || '16',
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

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValue(name as keyof FormData, value);
  };

  const handleSubmitForm = async (data: FormData) => {
    onSubmit(data);
  };

  const options = [
    ...new Set([
      ...availableNodes.map(node => node.node_address),
      ...alreadyListed.map(node => node.nodeAddress)
    ])
  ].map(address => ({ value: address, label: address }));

  const isValid = formData.address && 
                 formData.totalBondTarget && 
                 formData.minimumBond && 
                 formData.feePercentage

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Node Listing' : 'Create New Node Listing'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {initialData 
            ? 'Update your node listing details below.'
            : 'Fill in the details below to create a new node listing.'}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">

            <Dropdown
              options={options}
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
              placeholder="Choose your node"
            />
            
            <Input
              label="Total bond target (RUNE)"
              type="number"
              min="0"
              step="1"
              name="totalBondTarget"
              value={formData.totalBondTarget}
              onChange={({target}: React.ChangeEvent<HTMLInputElement>)  => handleInputChange(target.name, target.value)}
              error={errors.totalBondTarget?.message}
              fullWidth
            />
            
            <Input
              label="Minimum Bond Requirement (RUNE)"
              type="number"
              min="0"
              step="1"
              name="minimumBond"
              value={formData.minimumBond}
              onChange={({target}: React.ChangeEvent<HTMLInputElement>)  => handleInputChange(target.name, target.value)}
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
              onChange={({target}: React.ChangeEvent<HTMLInputElement>)  => handleInputChange(target.name, target.value)}
              error={errors.feePercentage?.message}
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

export default NodeForm;
