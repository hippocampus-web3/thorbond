import { Node } from '../types';

export const mockNodeProfile: Node = {
  operatorAddress: 'thor1g98cy3n9mmjrpn0sxmn63ylztwlvt9lr7m3n2s',
  nodeAddress: 'thor1g98cy3n9mmjrpn0sxmn63ylztwlvt9lr7m3n2s',
  address: 'thor1g98cy3n9mmjrpn0sxmn63ylztwlvt9lr7m3n2s',
  status: 'active',
  maxRune: 1000000000000,
  minRune: 1000000000,
  feePercentage: 0.1,
  txId: 'mock-tx-id-123',
  height: 1234567,
  timestamp: '2024-03-20T12:00:00Z',
  slashPoints: 0,
  activeTime: 86400,
  bondProvidersCount: 5,
  description: 'Somos un validador comprometido con la seguridad y el crecimiento de la red THORChain. Nuestro equipo tiene años de experiencia en operación de nodos y seguridad blockchain.',
  contactInfo: 'contact@thornode.example.com',
  maxTimeToLeave: 86400,
  isDelisted: false,
  officialInfo: {
    currentFee: 0.1,
    totalBond: 500000000000
  },
  isHidden: {
    hide: false,
    reasons: null
  },
  isYieldGuarded: {
    hide: false,
    reasons: null
  },
  name: 'ThorNode Validator',
  logo: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
  bannerImage: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2232&q=80',
  philosophy: 'Creemos en la descentralización y la transparencia. Nuestro objetivo es contribuir al crecimiento y la seguridad de la red THORChain mientras proporcionamos un servicio confiable y profesional a nuestros delegadores.',
  socialLinks: {
    twitter: 'https://twitter.com/thornode',
    telegram: 'https://t.me/thornode',
    discord: 'https://discord.gg/thornode'
  },
  totalBond: 1000000,
  uptime: 99.9,
  slashingEvents: 0,
  age: 365,
  minimumBond: 100000,
  totalBondTarget: 1000000
}; 