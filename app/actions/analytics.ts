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

  // Calculate total revenue (PAID invoices only)
  const paidInvoices = typedInvoices.filter((inv) => inv.status === 'paid')
  const totalRevenue = await convertAndSum(
    paidInvoices.map((inv) => ({ amount: inv.amount, currency: inv.currency })),
    targetCurrency
  )

  // Calculate expected total revenue (ALL invoices)
  const expectedRevenue = await convertAndSum(
    typedInvoices.map((inv) => ({
      amount: inv.amount,
      currency: inv.currency,
    })),
    targetCurrency
  )

  // Calculate average invoice (paid only)
  const averageInvoice =
    paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0

  // Count by status
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const statusCounts = {
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
  }

  typedInvoices.forEach((inv) => {
    const dueDate = new Date(inv.due_date)
    dueDate.setHours(0, 0, 0, 0)

    if (dueDate < today && inv.status !== 'paid') {
      statusCounts.overdue++
    } else {
      statusCounts[inv.status as keyof typeof statusCounts]++
    }
  })

  // Monthly breakdown (paid invoices)
  const monthlyData: Record<string, { count: number; amount: number }> = {}

  for (const inv of paidInvoices) {
    const month = new Date(inv.issue_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })

    const convertedAmount = await convertCurrency(
      inv.amount,
      inv.currency,
      targetCurrency
    )

    if (!monthlyData[month]) {
      monthlyData[month] = { count: 0, amount: 0 }
    }
    monthlyData[month].count++
    monthlyData[month].amount += convertedAmount
  }

  // Top clients (paid invoices)
  const clientData: Record<string, { count: number; amount: number }> = {}

  for (const inv of paidInvoices) {
    const clientName = inv.clients?.name || 'Unknown'
    const convertedAmount = await convertCurrency(
      inv.amount,
      inv.currency,
      targetCurrency
    )

    if (!clientData[clientName]) {
      clientData[clientName] = { count: 0, amount: 0 }
    }
    clientData[clientName].count++
    clientData[clientName].amount += convertedAmount
  }

  const topClients = Object.entries(clientData)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5)

  return {
    totalInvoices: typedInvoices.length,
    paidInvoicesCount: paidInvoices.length,
    totalRevenue,
    expectedRevenue,
    averageInvoice,
    statusCounts,
    monthlyData,
    topClients,
    targetCurrency,
    defaultCurrency: profile?.default_currency || 'PLN',
  }
}
