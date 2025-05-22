import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Node } from '../../types';
import { mockNodeProfile } from '../../mocks/nodeProfileMock';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadAll } from "@tsparticles/all";
import type { Container } from "@tsparticles/engine";

interface NodeProfileLayoutProps {
  children: React.ReactNode;
}

const NodeProfileLayout: React.FC<NodeProfileLayoutProps> = ({ children }) => {
  const { address } = useParams<{ address: string }>();
  const [node, setNode] = React.useState<Node | null>(null);
  const [init, setInit] = useState(false);

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

  React.useEffect(() => {
    setNode(mockNodeProfile);
  }, [address]);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log("Partículas cargadas:", container);
  };

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
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        {init && (
          <Particles
            id="tsparticles"
            className="absolute inset-0"
            particlesLoaded={particlesLoaded}
            options={particlesOptions}
          />
        )}
      </div>
      <div className="relative" style={{ zIndex: 2 }}>
        {/* Header Personalizado */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <img
                  src={node.logo || '/default-node-logo.png'}
                  alt={node.name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{node.name}</h1>
                  <p className="text-sm text-gray-500">{node.address}</p>
                </div>
              </div>
              <nav className="flex space-x-8">
                <a href="#about" className="text-gray-500 hover:text-gray-900">Sobre el Nodo</a>
                <a href="#performance" className="text-gray-500 hover:text-gray-900">Rendimiento</a>
                <a href="#philosophy" className="text-gray-500 hover:text-gray-900">Filosofía</a>
                <a href="#contact" className="text-gray-500 hover:text-gray-900">Contacto</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-grow relative z-10">
          {children}
        </main>

        {/* Footer Personalizado */}
        <footer className="bg-gray-900/95 backdrop-blur-sm text-white relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Sobre {node.name}</h3>
                <p className="text-gray-400 text-sm">
                  {node.description?.substring(0, 150)}...
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Bond Total: {node.totalBond || '0'} RUNE</li>
                  <li>Uptime: {node.uptime || '0'}%</li>
                  <li>Edad: {node.age || '0'} días</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
                <div className="space-y-2">
                  {node.socialLinks?.twitter && (
                    <a
                      href={node.socialLinks.twitter}
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
                  {node.socialLinks?.telegram && (
                    <a
                      href={node.socialLinks.telegram}
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
                  {node.socialLinks?.discord && (
                    <a
                      href={node.socialLinks.discord}
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
        </footer>
      </div>
    </div>
  );
};

export default NodeProfileLayout; 