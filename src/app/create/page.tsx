'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Invoice } from '@/types'
import { TARGET_TOKENS } from '@/config/constants'
import { saveInvoice } from '@/lib/storage'
import { WalletConnector } from '@/components/WalletConnector'

export default function CreateInvoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    targetToken: 'USDC',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.recipient || !formData.amount) {
        alert('Please fill in all required fields')
        return
      }

      // Check if recipient is a valid Ethereum address
      if (!/^0x[a-fA-F0-9]{40}$/.test(formData.recipient)) {
        alert('Please enter a valid Ethereum address')
        return
      }

      // Create invoice
      const invoice: Invoice = {
        id: uuidv4(),
        recipient: formData.recipient,
        amount: formData.amount,
        targetToken: formData.targetToken,
        description: formData.description || undefined,
        status: 'pending',
        createdAt: new Date(),
      }

      // Save to localStorage
      saveInvoice(invoice)

      // Redirect to invoice page
      router.push(`/invoice/${invoice.id}`)
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PayInvo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Create a payment request for cross-chain crypto payments
          </p>
          <div className="flex justify-center">
            <WalletConnector />
          </div>
        </div>

        {/* Invoice Creation Form */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Create Invoice
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Address */}
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address *
              </label>
              <input
                type="text"
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                placeholder="0x..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                The wallet address that will receive the payment on Mantle
              </p>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="100.00"
                step="0.000001"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Target Token */}
            <div>
              <label htmlFor="targetToken" className="block text-sm font-medium text-gray-700 mb-1">
                Target Token *
              </label>
              <select
                id="targetToken"
                name="targetToken"
                value={formData.targetToken}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                {TARGET_TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                The token you want to receive on Mantle Network
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Payment for..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating Invoice...' : 'Generate Invoice'}
            </button>
          </form>
        </div>

        {/* How it works */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How it works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-semibold mb-2">1. Create Invoice</h4>
              <p className="text-sm text-gray-600">
                Specify the amount and token you want to receive
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl mb-2">🔗</div>
              <h4 className="font-semibold mb-2">2. Share Link</h4>
              <p className="text-sm text-gray-600">
                Send the payment link to anyone, anywhere
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold mb-2">3. Get Paid</h4>
              <p className="text-sm text-gray-600">
                Receive exact tokens on Mantle, no matter what they pay with
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 