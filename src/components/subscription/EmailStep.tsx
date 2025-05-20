import React from 'react';
import { Mail, ChevronDown } from 'lucide-react';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Tooltip from '../ui/Tooltip';

interface EmailStepProps {
  email: string;
  months: number;
  emailError: string;
  isLoading: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMonthsChange: (months: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EmailStep: React.FC<EmailStepProps> = ({
  email,
  months,
  emailError,
  isLoading,
  onEmailChange,
  onMonthsChange,
  onSubmit,
}) => {
  const [isMonthsOpen, setIsMonthsOpen] = React.useState(false);
  const monthOptions = [1, 3, 6, 12];

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subscription Duration
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMonthsOpen(!isMonthsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <span>{months} {months === 1 ? 'month' : 'months'}</span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transform transition-transform ${isMonthsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMonthsOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {monthOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onMonthsChange(option);
                      setIsMonthsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      months === option ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    {option} {option === 1 ? 'month' : 'months'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

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
                      <li>Node chat messages</li>
                      <li>Whitelist accepted</li>
                      <li>Node status</li>
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