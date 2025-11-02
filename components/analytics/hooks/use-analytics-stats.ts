// components/analytics/hooks/use-analytics-stats.ts
'use client'

import { useState, useEffect } from 'react'
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

interface AnalyticsStats {
  paidNetSales: number
  paidVatCollected: number
  paidGrossSales: number
  paidCount: number
  outstandingNetSales: number
  outstandingVat: number
  outstandingGrossSales: number
  outstandingCount: number
  totalNetSales: number
  totalVat: number
  totalGrossSales: number
  averageInvoiceNet: number
  averageInvoiceGross: number
  monthlyData: Record<
    string,
    {
      count: number
      netAmount: number
      vatAmount: number
      grossAmount: number
    }
  >
  topClients: Array<
    [
      string,
      {
        count: number
        netAmount: number
        vatAmount: number
        grossAmount: number
      }
    ]
  >
}

export function useAnalyticsStats(
  invoices: Invoice[],
  displayCurrency: string
): { stats: AnalyticsStats; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<AnalyticsStats>({
    paidNetSales: 0,
    paidVatCollected: 0,
    paidGrossSales: 0,
    paidCount: 0,
    outstandingNetSales: 0,
    outstandingVat: 0,
    outstandingGrossSales: 0,
    outstandingCount: 0,
    totalNetSales: 0,
    totalVat: 0,
    totalGrossSales: 0,
    averageInvoiceNet: 0,
    averageInvoiceGross: 0,
    monthlyData: {},
    topClients: [],
  })

  useEffect(() => {
    async function calculateStats() {
      setIsLoading(true)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Separate invoices by status
      const paidInvoices = invoices.filter((inv) => inv.status === 'paid')
      const sentInvoices = invoices.filter((inv) => {
        const dueDate = new Date(inv.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return inv.status === 'sent' && dueDate >= today
      })
      const overdueInvoices = invoices.filter((inv) => {
        const dueDate = new Date(inv.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today && inv.status !== 'paid'
      })

      // Calculate PAID metrics
      const paidNetSales = await convertAndSum(
        paidInvoices.map((inv) => ({
          amount: inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const paidVatCollected = await convertAndSum(
        paidInvoices.map((inv) => ({
          amount: inv.vat_amount || 0,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const paidGrossSales = await convertAndSum(
        paidInvoices.map((inv) => ({
          amount: inv.amount_with_vat || inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      // Calculate OUTSTANDING metrics
      const outstandingInvoices = [...sentInvoices, ...overdueInvoices]
      const outstandingNetSales = await convertAndSum(
        outstandingInvoices.map((inv) => ({
          amount: inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const outstandingVat = await convertAndSum(
        outstandingInvoices.map((inv) => ({
          amount: inv.vat_amount || 0,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const outstandingGrossSales = await convertAndSum(
        outstandingInvoices.map((inv) => ({
          amount: inv.amount_with_vat || inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      // Calculate TOTAL metrics
      const nonDraftInvoices = invoices.filter((inv) => inv.status !== 'draft')
      const totalNetSales = await convertAndSum(
        nonDraftInvoices.map((inv) => ({
          amount: inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const totalVat = await convertAndSum(
        nonDraftInvoices.map((inv) => ({
          amount: inv.vat_amount || 0,
          currency: inv.currency,
        })),
        displayCurrency
      )

      const totalGrossSales = await convertAndSum(
        nonDraftInvoices.map((inv) => ({
          amount: inv.amount_with_vat || inv.amount,
          currency: inv.currency,
        })),
        displayCurrency
      )

      // Calculate averages
      const averageInvoiceNet =
        paidInvoices.length > 0 ? paidNetSales / paidInvoices.length : 0
      const averageInvoiceGross =
        paidInvoices.length > 0 ? paidGrossSales / paidInvoices.length : 0

      // Monthly breakdown
      const monthlyData: Record<
        string,
        {
          count: number
          netAmount: number
          vatAmount: number
          grossAmount: number
        }
      > = {}

      for (const inv of paidInvoices) {
        const month = new Date(inv.issue_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        })

        const convertedNet = await convertCurrency(
          inv.amount,
          inv.currency,
          displayCurrency
        )
        const convertedVat = await convertCurrency(
          inv.vat_amount || 0,
          inv.currency,
          displayCurrency
        )
        const convertedGross = await convertCurrency(
          inv.amount_with_vat || inv.amount,
          inv.currency,
          displayCurrency
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

      // Top clients
      const clientData: Record<
        string,
        {
          count: number
          netAmount: number
          vatAmount: number
          grossAmount: number
        }
      > = {}

      for (const inv of paidInvoices) {
        const clientName = inv.clients?.name || 'Unknown'
        const convertedNet = await convertCurrency(
          inv.amount,
          inv.currency,
          displayCurrency
        )
        const convertedVat = await convertCurrency(
          inv.vat_amount || 0,
          inv.currency,
          displayCurrency
        )
        const convertedGross = await convertCurrency(
          inv.amount_with_vat || inv.amount,
          inv.currency,
          displayCurrency
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

      setStats({
        paidNetSales,
        paidVatCollected,
        paidGrossSales,
        paidCount: paidInvoices.length,
        outstandingNetSales,
        outstandingVat,
        outstandingGrossSales,
        outstandingCount: outstandingInvoices.length,
        totalNetSales,
        totalVat,
        totalGrossSales,
        averageInvoiceNet,
        averageInvoiceGross,
        monthlyData,
        topClients,
      })

      setIsLoading(false)
    }

    calculateStats()
  }, [invoices, displayCurrency])

  return { stats, isLoading }
}
