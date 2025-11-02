// app/actions/analytics.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { convertCurrency, convertAndSum } from '@/lib/currency'

interface Invoice {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  amount: number
  vat_rate: number
  vat_amount: number
  amount_with_vat: number
  currency: string
  status: string
  clients: {
    name: string
  } | null
}

export async function getAnalyticsData(displayCurrency?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for default currency
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('default_currency')
    .eq('user_id', user.id)
    .single()

  const targetCurrency = displayCurrency || profile?.default_currency || 'PLN'

  // Fetch all invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select(
      `
      *,
      clients (
        name
      )
    `
    )
    .order('created_at', { ascending: false })

  const typedInvoices = (invoices as Invoice[]) || []

  // Separate invoices by status
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const paidInvoices = typedInvoices.filter((inv) => inv.status === 'paid')
  const sentInvoices = typedInvoices.filter((inv) => {
    const dueDate = new Date(inv.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return inv.status === 'sent' && dueDate >= today
  })
  const overdueInvoices = typedInvoices.filter((inv) => {
    const dueDate = new Date(inv.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today && inv.status !== 'paid'
  })

  // Calculate PAID revenue metrics
  const paidNetSales = await convertAndSum(
    paidInvoices.map((inv) => ({ amount: inv.amount, currency: inv.currency })),
    targetCurrency
  )

  const paidVatCollected = await convertAndSum(
    paidInvoices.map((inv) => ({
      amount: inv.vat_amount || 0,
      currency: inv.currency,
    })),
    targetCurrency
  )

  const paidGrossSales = await convertAndSum(
    paidInvoices.map((inv) => ({
      amount: inv.amount_with_vat || inv.amount,
      currency: inv.currency,
    })),
    targetCurrency
  )

  // Calculate OUTSTANDING revenue (sent + overdue)
  const outstandingInvoices = [...sentInvoices, ...overdueInvoices]
  const outstandingNetSales = await convertAndSum(
    outstandingInvoices.map((inv) => ({
      amount: inv.amount,
      currency: inv.currency,
    })),
    targetCurrency
  )

  const outstandingVat = await convertAndSum(
    outstandingInvoices.map((inv) => ({
      amount: inv.vat_amount || 0,
      currency: inv.currency,
    })),
    targetCurrency
  )

  const outstandingGrossSales = await convertAndSum(
    outstandingInvoices.map((inv) => ({
      amount: inv.amount_with_vat || inv.amount,
      currency: inv.currency,
    })),
    targetCurrency
  )

  // Calculate TOTAL revenue (all invoices except draft)
  const nonDraftInvoices = typedInvoices.filter((inv) => inv.status !== 'draft')
  const totalNetSales = await convertAndSum(
    nonDraftInvoices.map((inv) => ({
      amount: inv.amount,
      currency: inv.currency,
    })),
    targetCurrency
  )

  const totalVat = await convertAndSum(
    nonDraftInvoices.map((inv) => ({
      amount: inv.vat_amount || 0,
      currency: inv.currency,
    })),
    targetCurrency
  )

  const totalGrossSales = await convertAndSum(
    nonDraftInvoices.map((inv) => ({
      amount: inv.amount_with_vat || inv.amount,
      currency: inv.currency,
    })),
    targetCurrency
  )

  // Calculate average invoice (paid only)
  const averageInvoiceNet =
    paidInvoices.length > 0 ? paidNetSales / paidInvoices.length : 0
  const averageInvoiceGross =
    paidInvoices.length > 0 ? paidGrossSales / paidInvoices.length : 0

  // Count by status
  const statusCounts = {
    draft: typedInvoices.filter((inv) => inv.status === 'draft').length,
    sent: sentInvoices.length,
    paid: paidInvoices.length,
    overdue: overdueInvoices.length,
  }

  // Monthly breakdown (paid invoices)
  const monthlyData: Record<
    string,
    { count: number; netAmount: number; vatAmount: number; grossAmount: number }
  > = {}

  for (const inv of paidInvoices) {
    const month = new Date(inv.issue_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })

    const convertedNet = await convertCurrency(
      inv.amount,
      inv.currency,
      targetCurrency
    )
    const convertedVat = await convertCurrency(
      inv.vat_amount || 0,
      inv.currency,
      targetCurrency
    )
    const convertedGross = await convertCurrency(
      inv.amount_with_vat || inv.amount,
      inv.currency,
      targetCurrency
    )

    if (!monthlyData[month]) {
      monthlyData[month] = {
        count: 0,
        netAmount: 0,
        vatAmount: 0,
        grossAmount: 0,
      }
    }
    monthlyData[month].count++
    monthlyData[month].netAmount += convertedNet
    monthlyData[month].vatAmount += convertedVat
    monthlyData[month].grossAmount += convertedGross
  }

  // Top clients (paid invoices)
  const clientData: Record<
    string,
    { count: number; netAmount: number; vatAmount: number; grossAmount: number }
  > = {}

  for (const inv of paidInvoices) {
    const clientName = inv.clients?.name || 'Unknown'
    const convertedNet = await convertCurrency(
      inv.amount,
      inv.currency,
      targetCurrency
    )
    const convertedVat = await convertCurrency(
      inv.vat_amount || 0,
      inv.currency,
      targetCurrency
    )
    const convertedGross = await convertCurrency(
      inv.amount_with_vat || inv.amount,
      inv.currency,
      targetCurrency
    )

    if (!clientData[clientName]) {
      clientData[clientName] = {
        count: 0,
        netAmount: 0,
        vatAmount: 0,
        grossAmount: 0,
      }
    }
    clientData[clientName].count++
    clientData[clientName].netAmount += convertedNet
    clientData[clientName].vatAmount += convertedVat
    clientData[clientName].grossAmount += convertedGross
  }

  const topClients = Object.entries(clientData)
    .sort((a, b) => b[1].grossAmount - a[1].grossAmount)
    .slice(0, 5)

  return {
    totalInvoices: typedInvoices.length,
    paidInvoicesCount: paidInvoices.length,
    outstandingInvoicesCount: outstandingInvoices.length,

    // Paid metrics
    paidNetSales,
    paidVatCollected,
    paidGrossSales,

    // Outstanding metrics
    outstandingNetSales,
    outstandingVat,
    outstandingGrossSales,

    // Total metrics (all non-draft)
    totalNetSales,
    totalVat,
    totalGrossSales,

    // Averages
    averageInvoiceNet,
    averageInvoiceGross,

    statusCounts,
    monthlyData,
    topClients,
    targetCurrency,
    defaultCurrency: profile?.default_currency || 'PLN',
  }
}
