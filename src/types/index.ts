export interface Invoice {
  id: string
  recipient: string
  amount: string
  targetToken: string
  description?: string
  status: 'pending' | 'paid' | 'expired'
  createdAt: Date
  paidAt?: Date
  txHash?: string
}

export interface Payment {
  invoiceId: string
  payer: string
  sourceChain: number
  sourceToken: string
  sourceAmount: string
  targetChain: number
  targetToken: string
  targetAmount: string
  lifiRouteId: string
  steps: LifiStep[]
  status: 'processing' | 'completed' | 'failed'
  txHashes: string[]
}

export interface LifiStep {
  id: string
  type: 'swap' | 'bridge'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  txHash?: string
  tool: string
}

export interface SupportedToken {
  symbol: string
  address: string
  decimals: number
  chainId: number
  logoURI?: string
}

export interface SupportedChain {
  id: number
  name: string
  nativeCurrency: {
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

// Interface for properly typing route data
export interface RouteData {
  id: string
  fromChain: string
  toChain: string
  fromToken: { symbol: string; address: string }
  toToken: { symbol: string; address: string; decimals: number }
  fromAmount: string
  toAmount: string
  steps: Array<{
    id: string
    type: string
    tool: string
    estimate: { executionDuration: number }
  }>
}

// Interface for transaction data
export interface TransactionData {
  to: string
  value: string
  data: string
  gasLimit: string
} 