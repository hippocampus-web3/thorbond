import React, { useEffect, useState } from 'react';
import { WhitelistRequestFormData } from '../../types';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadAll } from "@tsparticles/all";
import NodeDetailsPage from '../../pages/NodeDetailsPage';
import { BaseAmount } from '@xchainjs/xchain-util';
import { NodesResponse } from '@xchainjs/xchain-thornode';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChatMessageDto, NodeListingDto } from '@hippocampus-web3/runebond-client';
import NodeHeader from './NodeHeader';
import NodeFooter from './NodeFooter';
import SlotMachine from '../effects/SlotMachine';

interface NodeProfileLayoutProps {
  nodes: NodeListingDto[];
  onRequestWhitelist: (node: NodeListingDto) => void;
  selectedNode: NodeListingDto | null;
  onSubmitRequest: (formData: WhitelistRequestFormData) => Promise<void>;
  onCancelRequest: () => void;
  messages: ChatMessageDto[];
  onSendMessage: (nodeAddress: string, message: string) => Promise<void>;
  isLoadingMessages?: boolean;
  loadChatMessages: (nodeAddr: string) => Promise<void>;
  balance: BaseAmount | null;
  isLoadingBalance: boolean;
  onBondRequest: (nodeAddress: string, userAddress: string, amount: number) => Promise<void>;
  onUnbondRequest: (nodeAddress: string, userAddress: string, amount: number) => Promise<void>;
  refreshWhitelistFlag: number;
  oficialNodes: NodesResponse;
  onPaymentExecute: (memo: string, amount: number) => Promise<void>;
  onConnectWallet: () => void;
  onDisconnect: () => Promise<void>;
  txSubscriptionHash: string | null;
  onClearTx: () => void;
  isAuthenticated: boolean;
  walletAddress: string | null;
}

const NodeProfileLayout: React.FC<NodeProfileLayoutProps> = (props) => {
  const { nodeAddress: urlNodeAddress } = useParams<{ nodeAddress: string }>();
  const [init, setInit] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const getSubdomainNodeAddress = () => {
    const host = window.location.host;
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && !subdomain.includes('deploy-') && subdomain !== 'runebond') {
      return subdomain;
    }
    return null;
  };

  const nodeAddress = getSubdomainNodeAddress() || urlNodeAddress;

  const node = props.nodes.find(n => n.nodeAddress === nodeAddress);

  if (!node) {
    window.location.href = import.meta.env.VITE_RUNEBOND_URL || 'https://runebond.com';
  }

  useEffect(() => {
    if (node?.nodeAddress) {
      props.loadChatMessages(node.nodeAddress);
    }
  }, [node, props.loadChatMessages]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadAll(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = {
    particles: {
      number: { value: 15 },
      shape: {
        type: "image",
        options: {
          image: {
            src: "/runebond-isologo.svg"
          }
        }
      },
      size: { value: 40 },
      move: {
        enable: true,
        speed: 2
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse"
        }
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4
        }
      }
    }
  }

  if (!node) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        {init && (
          <Particles
            id="tsparticles"
            className="absolute inset-0 bg-gray-50"
            options={particlesOptions}
          />
        )}
      </div>
      <div className="relative" style={{ zIndex: 2 }}>
        <NodeHeader
          node={node}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isAuthenticated={props.isAuthenticated}
          walletAddress={props.walletAddress}
          balance={props.balance}
          isLoadingBalance={props.isLoadingBalance}
          onConnectWallet={props.onConnectWallet}
          onDisconnect={props.onDisconnect}
        />

        {/* Main Content */}
        <main className="flex-grow relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {((node as any).logo || (node as any).name) && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative h-64 md:h-96 rounded-xl mt-4"
              >
                <img
                  src={'/banner.png'}
                  alt="Node Banner"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-opacity-30 rounded-xl" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-end space-x-6">
                    {(node as any).logo && (
                      <div className="relative">
                        <img
                          src={(node as any).logo}
                          alt={(node as any).name}
                          className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
                        />
                      </div>
                    )}
                    <div className="text-white">
                      <h1 className="text-3xl md:text-4xl font-bold">{(node as any).name || 'Node'}</h1>
                      <SlotMachine text={node.nodeAddress} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* About Section */}
            {(node as any).description && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                id="about" 
                className="mt-12 bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Node</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {(node as any).description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Unbound Policy Section */}
            {(node as any).unboundPolicy && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                id="unbound-policy" 
                className="mt-12 bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Unbound Policy</h2>
                {(node as any).unboundPolicy && (
                  <p className="text-gray-600 leading-relaxed text-lg mb-6">
                    {(node as any).unboundPolicy}
                  </p>
                )}
                <ul className="space-y-4 text-gray-600">
                  {(node.minRune && node.minRune > 0) && (
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      Minimum bond requirement: {node.minRune} RUNE
                    </li>
                  )}
                  {(node.feePercentage && node.feePercentage > 0) && (
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      Fee percentage: {node.feePercentage / 100}%
                    </li>
                  )}
                  {(node.bondProvidersCount && node.bondProvidersCount > 0) && (
                    <li className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      Bond providers: {node.bondProvidersCount}
                    </li>
                  )}
                </ul>
              </motion.div>
            )}
          </div>
          <NodeDetailsPage {...props} hideHeaderButtons={true} />
        </main>

        <NodeFooter node={node} />
      </div>
    </div>
  );
};

export default NodeProfileLayout; 