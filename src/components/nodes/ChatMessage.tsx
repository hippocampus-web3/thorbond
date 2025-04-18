import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Shield, Star, User, ExternalLink } from 'lucide-react';
import { getAddressExplorerUrl, shortenAddress } from '../../lib/utils';
import { Message } from '../../types';

interface ChatMessageProps {
  message: string;
  senderAddress: string;
  timestamp: Date;
  role: Message['role'];
  roleIcon: typeof Shield | typeof Star | typeof User;
}

const getRoleMessage = (role: Message['role']) => {
  switch (role) {
    case 'NO':
      return 'Node operator';
    case 'BP':
      return 'Bond provider';
    case 'USER':
      return 'User';
  }
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  senderAddress,
  timestamp,
  role,
  roleIcon: RoleIcon,
}) => {
  const isOperator = role === 'NO';
  const isBondProvider = role === 'BP';

  return (
    <div className={`flex ${isOperator ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isOperator
            ? 'bg-blue-50 text-blue-900'
            : isBondProvider
            ? 'bg-yellow-50 text-yellow-900'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-shrink-0">
            <RoleIcon
              className={`h-4 w-4 flex-shrink-0 ${
                isOperator
                  ? 'text-blue-600'
                  : isBondProvider
                  ? 'text-yellow-500'
                  : 'text-gray-400'
              }`}
            />
            <span className="text-sm font-medium">{getRoleMessage(role)}</span>
            <a
              href={getAddressExplorerUrl(senderAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              title={`View ${shortenAddress(senderAddress)} in explorer`}
            >
              <span>{shortenAddress(senderAddress)}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm break-words whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage; 