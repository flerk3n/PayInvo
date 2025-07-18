'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { SUPPORTED_CHAINS } from '@/config/constants'

export function WalletConnector() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)

  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton />
      
      {isConnected && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Connected to {chain?.name || 'Unknown Network'}
          </p>
          <p className="text-xs text-gray-500 font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      )}
    </div>
  )
} 