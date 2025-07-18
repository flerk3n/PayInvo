'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Invoice, Payment } from '@/types'
import { getInvoice, getPayment } from '@/lib/storage'

function SuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const invoiceId = searchParams.get('invoice')
    if (invoiceId) {
      loadPaymentData(invoiceId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const loadPaymentData = (invoiceId: string) => {
    const invoiceData = getInvoice(invoiceId)
    const paymentData = getPayment(invoiceId)
    
    setInvoice(invoiceData)
    setPayment(paymentData)
    setLoading(false)
  }

  const shareReceipt = () => {
    if (!invoice) return

    const receiptText = `🎉 Payment Complete!\n\nAmount: ${invoice.amount} ${invoice.targetToken}\nRecipient: ${invoice.recipient}\nNetwork: Mantle\nStatus: PAID\n\nPowered by PayInvo - payinvo.xyz`
    
    if (navigator.share) {
      navigator.share({
        title: 'PayInvo - Payment Receipt',
        text: receiptText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(receiptText)
      alert('Receipt copied to clipboard!')
    }
  }

  const copyTransactionHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    alert('Transaction hash copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn&apos;t find the payment details.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your cross-chain payment has been completed successfully
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              Payment Summary
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount Received</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {invoice.amount} {invoice.targetToken}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Recipient</label>
                  <p className="font-mono text-sm text-gray-900 break-all">
                    {invoice.recipient}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Target Network</label>
                  <p className="text-gray-900">Mantle Network</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Status</label>
                  <p className="text-green-600 font-semibold">COMPLETED</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Completed At</label>
                  <p className="text-gray-900">
                    {invoice.paidAt ? new Date(invoice.paidAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
                
                {invoice.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{invoice.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-2">🔗</span>
              Transaction Details
            </h2>
            
            <div className="space-y-4">
              {invoice.txHash && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Final Transaction Hash</label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mt-1">
                    <span className="font-mono text-sm text-gray-700 truncate mr-2">
                      {invoice.txHash}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyTransactionHash(invoice.txHash!)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Copy transaction hash"
                      >
                        📋
                      </button>
                      <a
                        href={`https://explorer.mantle.xyz/tx/${invoice.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="View on Mantle Explorer"
                      >
                        🔗
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {payment && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Source Transaction</label>
                  <div className="text-sm text-gray-900 mt-1">
                    <p>From: {payment.sourceChain === 1 ? 'Ethereum' : payment.sourceChain === 137 ? 'Polygon' : payment.sourceChain === 42161 ? 'Arbitrum' : `Chain ${payment.sourceChain}`}</p>
                    <p>Amount: {payment.sourceAmount} {payment.sourceToken.split('/').pop()}</p>
                    {payment.txHashes.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium">Source TX: </span>
                        <button
                          onClick={() => copyTransactionHash(payment.txHashes[0])}
                          className="font-mono text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                        >
                          {payment.txHashes[0].slice(0, 10)}...{payment.txHashes[0].slice(-10)}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What&apos;s Next?</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={shareReceipt}
                className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <span className="mr-2">📤</span>
                Share Receipt
              </button>
              
              <button
                onClick={() => router.push('/create')}
                className="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <span className="mr-2">➕</span>
                Create Another Invoice
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <span className="mr-2">🔒</span>
                This payment was processed securely via cross-chain bridges
              </div>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Why PayInvo?</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">🔗</div>
                <h3 className="font-semibold mb-1">Cross-Chain</h3>
                <p className="opacity-90">Pay from any chain, receive on Mantle</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold mb-1">Fast & Easy</h3>
                <p className="opacity-90">No manual bridging or swapping</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold mb-1">Exact Amounts</h3>
                <p className="opacity-90">Get exactly what you requested</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
} 