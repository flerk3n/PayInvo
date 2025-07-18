import { Invoice, Payment } from '@/types'

const STORAGE_KEYS = {
  INVOICES: 'payinvo_invoices',
  PAYMENTS: 'payinvo_payments',
}

// Invoice storage functions
export function saveInvoice(invoice: Invoice): void {
  if (typeof window === 'undefined') return
  
  const invoices = getInvoices()
  const updatedInvoices = { ...invoices, [invoice.id]: invoice }
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updatedInvoices))
}

export function getInvoice(id: string): Invoice | null {
  if (typeof window === 'undefined') return null
  
  const invoices = getInvoices()
  const invoice = invoices[id]
  
  if (!invoice) return null
  
  // Convert date strings back to Date objects
  return {
    ...invoice,
    createdAt: new Date(invoice.createdAt),
    paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
  }
}

export function getInvoices(): { [id: string]: Invoice } {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INVOICES)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error parsing invoices from localStorage:', error)
    return {}
  }
}

export function updateInvoiceStatus(id: string, status: Invoice['status'], txHash?: string): void {
  const invoice = getInvoice(id)
  if (!invoice) return
  
  const updatedInvoice: Invoice = {
    ...invoice,
    status,
    txHash,
    paidAt: status === 'paid' ? new Date() : invoice.paidAt,
  }
  
  saveInvoice(updatedInvoice)
}

// Payment storage functions
export function savePayment(payment: Payment): void {
  if (typeof window === 'undefined') return
  
  const payments = getPayments()
  const updatedPayments = { ...payments, [payment.invoiceId]: payment }
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedPayments))
}

export function getPayment(invoiceId: string): Payment | null {
  if (typeof window === 'undefined') return null
  
  const payments = getPayments()
  return payments[invoiceId] || null
}

export function getPayments(): { [invoiceId: string]: Payment } {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENTS)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error parsing payments from localStorage:', error)
    return {}
  }
}

export function updatePaymentStatus(
  invoiceId: string, 
  status: Payment['status'], 
  txHashes?: string[]
): void {
  const payment = getPayment(invoiceId)
  if (!payment) return
  
  const updatedPayment: Payment = {
    ...payment,
    status,
    txHashes: txHashes || payment.txHashes,
  }
  
  savePayment(updatedPayment)
}

// Utility functions
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(STORAGE_KEYS.INVOICES)
  localStorage.removeItem(STORAGE_KEYS.PAYMENTS)
}

export function exportData(): { invoices: Invoice[], payments: Payment[] } {
  const invoicesObj = getInvoices()
  const paymentsObj = getPayments()
  
  return {
    invoices: Object.values(invoicesObj),
    payments: Object.values(paymentsObj),
  }
}

// Check if invoice is expired
export function isInvoiceExpired(invoice: Invoice): boolean {
  const now = new Date()
  const expiryTime = new Date(invoice.createdAt.getTime() + (24 * 60 * 60 * 1000)) // 24 hours
  return now > expiryTime && invoice.status === 'pending'
} 