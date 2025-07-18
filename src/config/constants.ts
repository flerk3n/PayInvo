import { SupportedChain, SupportedToken } from '@/types'

// Mantle Network configuration
export const MANTLE_NETWORK: SupportedChain = {
  id: 5000,
  name: 'Mantle',
  nativeCurrency: {
    symbol: 'MNT',
    decimals: 18
  },
  rpcUrls: ['https://rpc.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.mantle.xyz']
}

// Supported source chains
export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://ethereum.blockpi.network/v1/rpc/public'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  {
    id: 137,
    name: 'Polygon',
    nativeCurrency: {
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  {
    id: 42161,
    name: 'Arbitrum',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io']
  },
  MANTLE_NETWORK
]

// Target tokens on Mantle
export const TARGET_TOKENS: SupportedToken[] = [
  {
    symbol: 'USDC',
    address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
    decimals: 6,
    chainId: 5000
  },
  {
    symbol: 'MNT',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    chainId: 5000
  },
  {
    symbol: 'WETH',
    address: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
    decimals: 18,
    chainId: 5000
  }
]

// Common source tokens (simplified for MVP)
export const SOURCE_TOKENS: { [chainId: number]: SupportedToken[] } = {
  1: [ // Ethereum
    {
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      chainId: 1
    },
    {
      symbol: 'USDC',
      address: '0xA0b86a33E6441D02214cb63EedAdCf3Ae3e5e24e',
      decimals: 6,
      chainId: 1
    }
  ],
  137: [ // Polygon
    {
      symbol: 'MATIC',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      chainId: 137
    },
    {
      symbol: 'USDC',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      chainId: 137
    }
  ],
  42161: [ // Arbitrum
    {
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      chainId: 42161
    },
    {
      symbol: 'USDC',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      decimals: 6,
      chainId: 42161
    }
  ]
}

export const INVOICE_EXPIRY_HOURS = 24 