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

interface NodeProfileLayoutProps {
  nodes: NodeListingDto[];
  onRequestWhitelist: (node: NodeListingDto) => void;
  selectedNode: NodeListingDto | null;
  onSubmitRequest: (formData: WhitelistRequestFormData) => Promise<void>;
  onCancelRequest: () => void;
  messages: ChatMessageDto[];
  onSendMessage: (nodeAddress: string, message: string) => Promise<void>;
  isLoadingMessages?: boolean;
  balance: BaseAmount | null;
  isLoadingBalance: boolean;
  onBondRequest: (nodeAddress: string, userAddress: string, amount: number) => Promise<void>;
  onUnbondRequest: (nodeAddress: string, userAddress: string, amount: number) => Promise<void>;
  refreshWhitelistFlag: number;
  oficialNodes: NodesResponse;
  onPaymentExecute: (memo: string, amount: number) => Promise<void>;
  onConnectWallet: () => void;
  txSubscriptionHash: string | null;
  onClearTx: () => void;
}

const SlotMachine: React.FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState<string[]>([]);

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  useEffect(() => {
    const finalText = text.split('');
    const slots = finalText.map(() => '');
    setDisplayText(slots);

    const intervals = finalText.map((_, index) => {
      let iterations = 0;
      const maxIterations = 3 + index; // Solo 3 iteraciones base + 1 por posición

      return setInterval(() => {
        setDisplayText(prev => {
          const newText = [...prev];
          if (iterations < maxIterations) {
            newText[index] = characters[Math.floor(Math.random() * characters.length)];
            iterations++;
          } else {
            newText[index] = finalText[index];
            clearInterval(intervals[index]);
          }
          return newText;
        });
      }, 10 + index * 2); // 10ms base + 2ms por posición
    });

    // Limpiar todos los intervalos cuando el componente se desmonte
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [text]);

  return (
    <div className="relative">
      <div className="text-lg md:text-xl mt-2 opacity-90 font-mono bg-black/20 px-4 py-2 rounded-lg inline-block">
        <span className="text-white tracking-wider">{displayText.join('')}</span>
      </div>
    </div>
  );
};

const NodeProfileLayout: React.FC<NodeProfileLayoutProps> = (props) => {
  const { nodeAddress } = useParams<{ nodeAddress: string }>();
  const [init, setInit] = useState(false);
  const node = props.nodes.find(n => n.nodeAddress === nodeAddress);

  useEffect(() => {
    console.log("Iniciando el motor de partículas...");
    initParticlesEngine(async (engine) => {
      console.log("Cargando motor slim...");
      await loadAll(engine);
      console.log("Motor slim cargado");
    }).then(() => {
      console.log("Motor inicializado correctamente");
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
            className="absolute inset-0"
            options={particlesOptions}
          />
        )}
      </div>
      <div className="relative" style={{ zIndex: 2 }}>
        {/* Custom Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm shadow-sm relative z-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <img
                  src={(node as any).logo || '/runebond-isologo.svg'}
                  alt={(node as any).name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{(node as any).name}</h1>
                  <p className="text-sm text-gray-500">{node.nodeAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-grow relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative h-64 md:h-96 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl mt-4"
            >
              <img
                src={(node as any).bannerImage || 'https://picsum.photos/200/300'}
                alt="Node Banner"
                className="w-full h-full object-cover opacity-50 rounded-xl"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-end space-x-6">
                  <div className="relative">
                    <img
                      src={(node as any).logo || 'https://picsum.photos/100/300'}
                      alt={(node as any).name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
                    />
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl md:text-4xl font-bold">{(node as any).name || 'Node Name'}</h1>
                    <SlotMachine text={node.nodeAddress} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About Section */}
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
                  {(node as any).description || 'This node does not have a detailed description yet.'}
                </p>
              </div>
            </motion.div>

            {/* Philosophy Section */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              id="philosophy" 
              className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Philosophy</h2>
              <div className="prose max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Vision</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {(node as any).vision || 'Our vision for the future of THORChain and the DeFi ecosystem.'}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Values</h3>
                    <ul className="space-y-3 text-gray-600">
                      <motion.li 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 1 }}
                        className="flex items-start"
                      >
                        <span className="text-indigo-600 mr-2">•</span>
                        {(node as any).values?.transparency || 'Transparency in all our operations'}
                      </motion.li>
                      <motion.li 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 1.2 }}
                        className="flex items-start"
                      >
                        <span className="text-indigo-600 mr-2">•</span>
                        {(node as any).values?.security || 'Security as our absolute priority'}
                      </motion.li>
                      <motion.li 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 1.4 }}
                        className="flex items-start"
                      >
                        <span className="text-indigo-600 mr-2">•</span>
                        {(node as any).values?.community || 'Commitment to the community'}
                      </motion.li>
                    </ul>
                  </motion.div>
                </div>
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.6 }}
                  className="mt-8 bg-white rounded-lg p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Operation Strategy</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {(node as any).operationStrategy || 'Our strategy for maintaining an efficient and reliable node.'}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
          <NodeDetailsPage {...props} />
        </main>

        {/* Footer Personalizado */}
        <motion.footer 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
          className="bg-gray-900/95 backdrop-blur-sm text-white relative z-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Sobre {(node as any).name}</h3>
                <p className="text-gray-400 text-sm">
                  {(node as any).description?.substring(0, 150)}...
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Bond Total: {node.maxRune || '0'} RUNE</li>
                  <li>Fee: {node.feePercentage / 100}%</li>
                  <li>Bond Providers: {node.bondProvidersCount}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
                <div className="space-y-2">
                  {(node as any).socialLinks?.twitter && (
                    <a
                      href={(node as any).socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      <span>Twitter</span>
                    </a>
                  )}
                  {(node as any).socialLinks?.telegram && (
                    <a
                      href={(node as any).socialLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                      <span>Telegram</span>
                    </a>
                  )}
                  {(node as any).socialLinks?.discord && (
                    <a
                      href={(node as any).socialLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      <span>Discord</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default NodeProfileLayout; 