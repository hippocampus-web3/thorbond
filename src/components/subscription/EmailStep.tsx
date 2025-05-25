import React from 'react';
import { Mail } from 'lucide-react';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Tooltip from '../ui/Tooltip';
import Select from '../ui/Select';

interface EmailStepProps {
  email: string;
  months: number;
  emailError: string;
  isLoading: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMonthsChange: (months: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const monthOptions = [1, 3, 6, 12];

const EmailStep: React.FC<EmailStepProps> = ({
  email,
  months,
  emailError,
  isLoading,
  onEmailChange,
  onMonthsChange,
  onSubmit,
}) => {
  const selectOptions = monthOptions.map(months => ({
    value: months.toString(),
    label: `${months} ${months === 1 ? 'month' : 'months'}`
  }));

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Subscribe to notifications</h2>
      <p className="text-gray-600 mb-6">
        Enter your email address to receive notifications about this node.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="text"
          value={email}
          onChange={onEmailChange}
          placeholder="your@email.com"
          error={emailError}
          fullWidth
          icon={<Mail className="h-5 w-5 text-gray-400" />}
        />

        <Select
          label="Subscription Duration"
          options={selectOptions}
          value={months.toString()}
          onChange={(value) => onMonthsChange(parseInt(value))}
          fullWidth
        />

        <Alert variant="info">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Subscription Price:</span>
                <span>{months} RUNE</span>
                <Tooltip content={
                  <div className="space-y-2">
                    <p className="font-medium">Notifications:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Node status update</li>
                      <li>Bond provider balance updated</li>
                      <li>Node chat Message</li>
                      <li>Whitelist request</li>
                      <li>Whitelist accepted</li>
                      <li>Whitelist rejected</li>
                    </ul>
                  </div>
                }>
                  <span className="text-blue-500 cursor-help">(?)</span>
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                1 RUNE/month × {months} {months === 1 ? 'month' : 'months'}
              </p>
            </div>
          </div>
        </Alert>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
};

export default EmailStep; 