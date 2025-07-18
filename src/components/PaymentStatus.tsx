'use client'

import { useState, useEffect } from 'react'
import { Invoice } from '@/types'

interface PaymentStatusProps {
  invoice: Invoice
  txHash: string
  status: 'processing' | 'complete' | 'error'
}

export function PaymentStatus({ invoice, txHash, status }: PaymentStatusProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps] = useState([
    { label: 'Initiating', description: 'Starting the cross-chain transaction' },
    { label: 'Swapping', description: 'Converting tokens if needed' },
    { label: 'Bridging', description: 'Moving assets across chains' },
    { label: 'Confirming', description: 'Finalizing on Mantle Network' },
    { label: 'Complete', description: 'Payment successfully delivered' }
  ])

  useEffect(() => {
    if (status === 'processing') {
      // Simulate progress for demo purposes
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 2) {
            return prev + 1
          }
          clearInterval(interval)
          return prev
        })
      }, 3000) // Move to next step every 3 seconds

      return () => clearInterval(interval)
    } else if (status === 'complete') {
      setCurrentStep(steps.length - 1)
    }
  }, [status, steps.length])

  const getStepStatus = (index: number) => {
    if (status === 'error') return 'error'
    if (index < currentStep) return 'completed'
    if (index === currentStep) return 'active'
    return 'pending'
  }

  const getStepIcon = (index: number) => {
    const stepStatus = getStepStatus(index)
    
    switch (stepStatus) {
      case 'completed':
        return '✅'
      case 'active':
        return '🔄'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  const getStepColor = (index: number) => {
    const stepStatus = getStepStatus(index)
    
    switch (stepStatus) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'active':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {status === 'processing' ? 'Processing Payment' : 
           status === 'complete' ? 'Payment Complete' : 
           'Payment Failed'}
        </h3>
        
        {status === 'processing' && (
          <div className="animate-pulse">
            <div className="h-2 bg-blue-200 rounded-full mb-4">
              <div 
                className="h-2 bg-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-gray-600">
              Please wait while we process your cross-chain payment...
            </p>
          </div>
        )}

        {status === 'complete' && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-green-600 font-semibold">
              Payment successfully delivered to Mantle Network!
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-600 font-semibold">
              Payment encountered an error during processing.
            </p>
          </div>
        )}
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-3">Payment Details</h4>
                 <div className="space-y-2 text-sm">
           <div className="flex justify-between">
             <span className="text-gray-900">Amount:</span>
             <span className="font-semibold text-gray-900">{invoice.amount} {invoice.targetToken}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-900">Recipient:</span>
             <span className="font-mono text-xs text-gray-900">
               {invoice.recipient.slice(0, 10)}...{invoice.recipient.slice(-8)}
             </span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-900">Target Network:</span>
             <span className="text-gray-900">Mantle Network</span>
           </div>
           {txHash && (
             <div className="flex justify-between">
               <span className="text-gray-900">Transaction:</span>
               <a
                 href={`https://explorer.mantle.xyz/tx/${txHash}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="font-mono text-xs text-blue-600 hover:text-blue-800 underline"
               >
                 {txHash.slice(0, 10)}...{txHash.slice(-8)}
               </a>
             </div>
           )}
         </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        <h4 className="font-semibold">Progress</h4>
        {steps.map((step, index) => (
          <div key={index} className={`border rounded-lg p-3 ${getStepColor(index)}`}>
            <div className="flex items-center">
              <div className="text-lg mr-3">
                {getStepIcon(index)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{step.label}</div>
                <div className="text-sm opacity-75">{step.description}</div>
              </div>
              {getStepStatus(index) === 'active' && (
                <div className="ml-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"/>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        {txHash && (
          <a
            href={`https://explorer.mantle.xyz/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            View on Explorer
          </a>
        )}
        
        {status === 'complete' && (
          <button
            onClick={() => window.location.href = '/create'}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Create Another Invoice
          </button>
        )}
      </div>

      {/* Real-time Updates Notice */}
      {status === 'processing' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-blue-600 mr-2">ℹ️</div>
            <div className="text-sm text-blue-800">
              <strong>Stay on this page</strong> to see real-time updates. 
              The payment will be automatically confirmed once completed.
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            <strong>What happened?</strong><br/>
            The payment transaction may have failed or timed out. 
            Please check the transaction on the blockchain explorer or try again.
          </div>
        </div>
      )}
    </div>
  )
} 