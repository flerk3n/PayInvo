'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useChainId, useSwitchChain, useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { Invoice, Payment, RouteData } from '@/types'
import { getInvoice, updateInvoiceStatus, savePayment } from '@/lib/storage'
import { getRoutes, getStepTransaction, getTransactionStatus, RouteRequest } from '@/lib/lifi'
import { WalletConnector } from '@/components/WalletConnector'
import { PaymentStatus } from '@/components/PaymentStatus'
import { SUPPORTED_CHAINS, SOURCE_TOKENS, TARGET_TOKENS } from '@/config/constants'

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: (hash) => {
        setTxHash(hash)
        
        // Create payment record
        const payment: Payment = {
          invoiceId: invoice!.id,
          payer: address!,
          sourceChain: selectedChain,
          sourceToken: selectedToken,
          sourceAmount: getEstimatedAmount(),
          targetChain: 5000,
          targetToken: TARGET_TOKENS.find(t => t.symbol === invoice!.targetToken)?.address || '',
          targetAmount: invoice!.amount,
          lifiRouteId: selectedRoute!.id,
          steps: selectedRoute!.steps.map((step) => ({
            id: step.id,
            type: step.type as 'swap' | 'bridge',
            status: 'pending' as const,
            tool: step.tool,
          })),
          status: 'processing',
          txHashes: [hash],
        }

        savePayment(payment)

        // Update invoice status
        updateInvoiceStatus(invoice!.id, 'paid', hash)
        
        // Poll for transaction status
        pollTransactionStatus(selectedRoute!, hash)
      },
      onError: (err) => {
        console.error('Error executing payment:', err)
        setError('Payment failed. Please try again.')
        setPaymentStep('confirm')
      }
    }
  })
  
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'setup' | 'routing' | 'confirm' | 'processing' | 'complete' | 'error'>('setup')
  const [selectedChain, setSelectedChain] = useState<number>(1) // Default to Ethereum
  const [selectedToken, setSelectedToken] = useState<string>('')
  const [, setRoutes] = useState<RouteData[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null)
  const [error, setError] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')

  useEffect(() => {
    if (params.id) {
      loadInvoice(params.id as string)
    }
  }, [params.id])

  // Auto-select first token when component loads
  useEffect(() => {
    if (!selectedToken) {
      const chainTokens = SOURCE_TOKENS[selectedChain]
      if (chainTokens && chainTokens.length > 0) {
        setSelectedToken(chainTokens[0].address)
      }
    }
  }, [selectedChain, selectedToken])

  const loadInvoice = (id: string) => {
    setLoading(true)
    const invoiceData = getInvoice(id)
    
    if (invoiceData) {
      setInvoice(invoiceData)
      if (invoiceData.status !== 'pending') {
        setPaymentStep('complete')
      }
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }

  const handleChainChange = (chainId: number) => {
    setSelectedChain(chainId)
    setRoutes([]) // Clear routes
    setSelectedRoute(null)
    setPaymentStep('setup') // Reset to setup step
    
    // Auto-select first token for the chain
    const chainTokens = SOURCE_TOKENS[chainId]
    if (chainTokens && chainTokens.length > 0) {
      setSelectedToken(chainTokens[0].address)
    } else {
      setSelectedToken('')
    }
  }

  const handleTokenChange = (tokenAddress: string) => {
    setSelectedToken(tokenAddress)
    setRoutes([]) // Clear routes
    setSelectedRoute(null)
    setPaymentStep('setup') // Reset to setup step
  }

  const findRoutes = async () => {
    if (!invoice || !address || !selectedToken) return

    setPaymentStep('routing')
    setError('')

    try {
      const targetToken = TARGET_TOKENS.find(t => t.symbol === invoice.targetToken)
      if (!targetToken) {
        throw new Error('Target token not found')
      }

      const estimatedAmount = getEstimatedAmount()
      
      const routeRequest: RouteRequest = {
        fromChain: selectedChain,
        toChain: 5000, // Mantle
        fromToken: selectedToken,
        toToken: targetToken.address,
        fromAmount: parseEther(estimatedAmount).toString(),
        fromAddress: address,
        toAddress: invoice.recipient,
      }

      const result = await getRoutes(routeRequest)
      setRoutes(result.routes)
      
      if (result.bestRoute) {
        setSelectedRoute(result.bestRoute)
        setPaymentStep('confirm')
      } else {
        setError('No routes found for this payment')
        setPaymentStep('setup')
      }
    } catch (err) {
      console.error('Error finding routes:', err)
      setError('Failed to find payment routes. Please try again.')
      setPaymentStep('setup')
    }
  }

  const executePayment = async () => {
    if (!selectedRoute || !address) return

    setPaymentStep('processing')
    setError('')

    try {
      // Switch to the correct chain if needed
      if (chain?.id !== selectedChain && switchChain) {
        await switchChain({ chainId: selectedChain })
      }

      // Get transaction data for the first step
      const transaction = await getStepTransaction(selectedRoute, 0)
      
      // Send transaction
      sendTransaction({
        to: transaction.to as `0x${string}`,
        value: BigInt(transaction.value),
        data: transaction.data as `0x${string}`,
        gas: BigInt(transaction.gasLimit),
      })

    } catch (err) {
      console.error('Error executing payment:', err)
      setError('Payment failed. Please try again.')
      setPaymentStep('confirm')
    }
  }

  const pollTransactionStatus = async (route: RouteData, hash: string) => {
    let attempts = 0
    const maxAttempts = 60 // 5 minutes with 5-second intervals

    const poll = async () => {
      try {
        const status = await getTransactionStatus(route, hash)
        
        if (status.status === 'DONE') {
          setPaymentStep('complete')
          router.push(`/success?invoice=${invoice!.id}`)
        } else if (status.status === 'FAILED') {
          setError('Payment failed during processing')
          setPaymentStep('error')
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          setError('Payment status unknown. Please check transaction manually.')
          setPaymentStep('error')
        }
              } catch {
          if (attempts < maxAttempts) {
            attempts++
            setTimeout(poll, 5000)
          } else {
            setError('Unable to verify payment status')
            setPaymentStep('error')
          }
        }
    }

    poll()
  }

  const getAvailableTokens = () => {
    return SOURCE_TOKENS[selectedChain] || []
  }

  const getSelectedTokenSymbol = () => {
    if (!selectedToken) return ''
    const token = getAvailableTokens().find(t => t.address === selectedToken)
    return token?.symbol || ''
  }

  const getChainName = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)
    return chain?.name || 'Unknown'
  }

  const getEstimatedAmount = () => {
    if (!selectedToken || !invoice) return '0'
    
    // Simple estimation logic for MVP - in production, this would use real exchange rates
    const invoiceAmount = parseFloat(invoice.amount)
    const selectedTokenSymbol = getSelectedTokenSymbol()
    
    // Mock exchange rates for demonstration
    const exchangeRates: { [key: string]: { [key: string]: number } } = {
      'ETH': { 'USDC': 2800, 'MNT': 1400 },  // 1 ETH = 2800 USDC or 1400 MNT
      'USDC': { 'MNT': 0.5, 'ETH': 1/2800 }, // 1 USDC = 0.5 MNT
      'MATIC': { 'USDC': 0.8, 'MNT': 0.4 }   // 1 MATIC = 0.8 USDC or 0.4 MNT
    }
    
    const rate = exchangeRates[selectedTokenSymbol]?.[invoice.targetToken] || 1
    const estimatedAmount = invoiceAmount / rate
    
    return estimatedAmount.toFixed(6)
  }

  const formatTokenAmount = (amount: string, decimals: number) => {
    const value = parseFloat(amount)
    return (value / Math.pow(10, decimals)).toFixed(6)
  }

  const copyInvoiceLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Invoice link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">The invoice you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Invoice
          </button>
        </div>
      </div>
    )
  }

  if (!invoice) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Request
          </h1>
          <button
            onClick={copyInvoiceLink}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            📋 Copy invoice link
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Invoice Details
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-900">Amount:</span>
                <span className="font-semibold text-gray-900">{invoice.amount} {invoice.targetToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900">Recipient:</span>
                <span className="font-mono text-sm text-gray-900">{invoice.recipient.slice(0, 10)}...{invoice.recipient.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900">Target Network:</span>
                <span className="text-gray-900">Mantle Network</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900">Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
              {invoice.description && (
                <div className="flex justify-between">
                  <span className="text-gray-900">Description:</span>
                  <span className="text-gray-900">{invoice.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Interface */}
          {invoice.status === 'pending' && (
            <>
              {!isConnected ? (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Connect Your Wallet to Pay
                  </h3>
                  <WalletConnector />
                </div>
              ) : paymentStep === 'setup' && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Choose Payment Method
                  </h3>
                  
                  {/* Chain Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Chain
                    </label>
                    <select
                      value={selectedChain}
                      onChange={(e) => handleChainChange(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {SUPPORTED_CHAINS.filter(chain => chain.id !== 5000).map((chain) => (
                        <option key={chain.id} value={chain.id}>
                          {chain.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Token Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token
                    </label>
                    <select
                      value={selectedToken}
                      onChange={(e) => handleTokenChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select a token</option>
                      {getAvailableTokens().map((token) => (
                        <option key={token.address} value={token.address}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-calculated Amount Display */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">Payment Summary</h4>
                          <p className="text-sm text-gray-600">Cross-chain conversion</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">You will send</p>
                          <p className="text-lg font-semibold text-blue-600">
                            ≈ {selectedToken ? getEstimatedAmount() : '---'} {getSelectedTokenSymbol()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">From {getChainName(selectedChain)}</div>
                          <div className="font-semibold">{selectedToken ? getEstimatedAmount() : '---'} {getSelectedTokenSymbol()}</div>
                        </div>
                        <div className="mx-4 text-gray-400">→</div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">To Mantle Network</div>
                          <div className="font-semibold text-green-600">{invoice.amount} {invoice.targetToken}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-center text-gray-500">
                        Estimated amount • Actual amount calculated by cross-chain routing
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={findRoutes}
                    disabled={!selectedToken}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Calculate Exact Cross-Chain Route
                  </button>
                </div>
              )}

              {paymentStep === 'routing' && (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Finding Optimal Route
                  </h3>
                  <p className="text-gray-600">
                    Calculating the best cross-chain path for your payment...
                  </p>
                </div>
              )}

              {paymentStep === 'confirm' && selectedRoute && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Confirm Payment
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-2">Route Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>From:</span>
                                               <span>{formatTokenAmount(selectedRoute.fromAmount, 18)} {selectedRoute.fromToken.symbol}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>To:</span>
                       <span>{formatTokenAmount(selectedRoute.toAmount, selectedRoute.toToken.decimals)} {selectedRoute.toToken.symbol}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>Steps:</span>
                       <span>{selectedRoute.steps.length}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>Estimated Time:</span>
                       <span>{Math.ceil(selectedRoute.steps.reduce((acc: number, step) => acc + (step.estimate.executionDuration || 0), 0) / 60)} min</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={executePayment}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold"
                  >
                    Execute Payment
                  </button>
                </div>
              )}

              {(paymentStep === 'processing' || paymentStep === 'complete') && (
                <PaymentStatus 
                  invoice={invoice}
                  txHash={txHash}
                  status={paymentStep}
                />
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="text-red-400">
                      ⚠️
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {invoice.status === 'paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Payment Completed
              </h3>
              <p className="text-green-700">
                This invoice has been paid successfully.
              </p>
              {invoice.txHash && (
                <a
                  href={`https://explorer.mantle.xyz/tx/${invoice.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                  View on Mantle Explorer
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 