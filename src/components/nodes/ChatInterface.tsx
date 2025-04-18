import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Info, Shield, Star, User, Maximize2, MessageCircle, Copy, Check } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import Modal from '../ui/Modal';
import { Message } from '../../types';
import { createMessageMemo } from '../../lib/runebondEngine/memoBuilder';

const RUNEBOND_ADDRESS = import.meta.env.VITE_RUNEBOND_ADDRESS || "thor1xazgmh7sv0p393t9ntj6q9p52ahycc8jjlaap9";

interface ChatInterfaceProps {
  isDisabled?: boolean;
  messages?: Message[];
  onSendMessage: (message: string) => void;
  nodeAddress: string;
}

const getRoleIcon = (role: Message['role']) => {
  switch (role) {
    case 'NO':
      return Shield;
    case 'BP':
      return Star;
    case 'USER':
      return User;
  }
}

const EmptyChat = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
    <p className="text-lg font-medium mb-2">No messages yet</p>
    <p className="text-sm text-center">
      Be the first to start a conversation in this public, on-chain chat.
      <br />
      All messages will be permanently recorded on the THORChain blockchain.
    </p>
  </div>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isDisabled = false,
  messages = [],
  onSendMessage,
  nodeAddress
}) => {
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemoCopied, setIsMemoCopied] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const getCurrentMemo = () => {
    try {
      return createMessageMemo({
        nodeAddress,
        message: message.trim()
      });
    } catch (error) {
      return null;
    }
  };

  const getBase64Length = (text: string) => {
    const base64 = Buffer.from(text).toString('base64');
    return base64.length;
  };

  const handleCopy = async (text: string, setCopied: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderSendButton = () => {
    const memo = getCurrentMemo();
    const button = (
      <button
        type="submit"
        disabled={isDisabled || !message.trim()}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium whitespace-nowrap disabled:bg-gray-200 disabled:text-gray-500"
      >
        Send
      </button>
    );

    if (memo) {
      return (
        <Tooltip
          content={
            <div className="max-w-md p-2">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Message Memo</h3>
                  <div className="bg-gray-100 p-2 rounded flex items-center justify-between gap-2 group">
                    <code className="text-sm break-all text-gray-600">{memo}</code>
                    <button
                      onClick={() => handleCopy(memo, setIsMemoCopied)}
                      className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                      title="Copy memo"
                    >
                      {isMemoCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">Message Costs:</p>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>Node Operators: 0.1 RUNE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Bond Providers: 0.1 RUNE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>General Users: 1 RUNE</span>
                    </div>
                  </div>
                  {isDisabled && (
                    <>
                      <div className="mt-4">
                        <p className="font-medium text-gray-900 mb-2">Send to Address:</p>
                        <div className="bg-gray-100 p-2 rounded flex items-center justify-between gap-2">
                          <code className="text-sm break-all text-gray-600">{RUNEBOND_ADDRESS}</code>
                          <button
                            onClick={() => handleCopy(RUNEBOND_ADDRESS, setIsAddressCopied)}
                            className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                            title="Copy address"
                          >
                            {isAddressCopied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        You can send this message manually by using this memo and address in a transaction.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          }
          className="hover:cursor-help"
        >
          {button}
        </Tooltip>
      );
    }

    return button;
  };

  const renderMessageForm = () => (
    <form onSubmit={handleSendMessage} className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <textarea
            value={message}
            onChange={(e) => {
              const newMessage = e.target.value;
              const currentLength = getBase64Length(message);
              const newLength = getBase64Length(newMessage);
              
              if (newLength < currentLength || newLength <= 200) {
                setMessage(newMessage);
              }
            }}
            placeholder="Type your message (will be recorded on-chain)..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white min-h-[100px] max-h-[200px] resize-y"
          />
          <div className="flex justify-between items-center">
            {renderSendButton()}
            <span className={`text-sm ${getBase64Length(message) > 200 ? 'text-red-500' : 'text-gray-500'}`}>
              {getBase64Length(message)}/200 characters
            </span>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <div className="relative">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-gray-900">Public Node Chat</h2>
            <Tooltip
              content={
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">On-Chain Public Chat</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      This is a public communication channel where all messages are permanently recorded on the THORChain blockchain.
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>All messages are visible to everyone</li>
                      <li>Messages cannot be deleted or edited</li>
                    </ul>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Node Operators</p>
                          <p className="text-sm text-gray-600">Official node administrators with highest authority</p>
                          <p className="text-sm text-gray-500 mt-1">Message cost: 0.1 RUNE</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-gray-900">Bond Providers</p>
                          <p className="text-sm text-gray-600">Active bond holders with verified status</p>
                          <p className="text-sm text-gray-500 mt-1">Message cost: 0.1 RUNE</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">General Users</p>
                          <p className="text-sm text-gray-600">Anyone interested in the node</p>
                          <p className="text-sm text-gray-500 mt-1">Message cost: 1 RUNE</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            >
              <Info className="h-5 w-5 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Open chat in full screen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="h-[500px] bg-gray-50 rounded-lg p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4">
              {messages.length === 0 ? <EmptyChat /> : (
                <>
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      message={msg.message}
                      senderAddress={msg.userAddress}
                      timestamp={msg.timestamp}
                      role={msg.role}
                      roleIcon={getRoleIcon(msg.role)}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            {renderMessageForm()}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Public Node Chat"
            size="xl"
          >
            <div className="flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto space-y-4">
                {messages.length === 0 ? <EmptyChat /> : (
                  <>
                    {messages.map((msg, index) => (
                      <ChatMessage
                        key={index}
                        message={msg.message}
                        senderAddress={msg.userAddress}
                        timestamp={msg.timestamp}
                        role={msg.role}
                        roleIcon={getRoleIcon(msg.role)}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              {renderMessageForm()}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default ChatInterface; 