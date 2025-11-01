// components/invoices/invoice-pdf.tsx
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register fonts (optional - using built-in Helvetica for now)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    width: '60%',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 15,
  },
  description: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCol1: {
    width: '70%',
  },
  tableCol2: {
    width: '30%',
    textAlign: 'right',
  },
  total: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reverseCharge: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  reverseChargeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#92400e',
  },
  reverseChargeText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#78350f',
    marginBottom: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
})

interface InvoicePDFProps {
  invoice: {
    invoice_number: string
    issue_date: string
    due_date: string
    description: string
    amount: number
    currency: string
    clients: {
      name: string
      org_number: string
      address: string
    } | null
  }
  user: {
    email: string
  }
}

export function InvoicePDF({ invoice, user }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FAKTURA / INVOICE</Text>
          <Text style={styles.invoiceNumber}>
            Nr / No: {invoice.invoice_number}
          </Text>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Data wystawienia / Issue Date:</Text>
            <Text style={styles.value}>
              {new Date(invoice.issue_date).toLocaleDateString('pl-PL')} /{' '}
              {new Date(invoice.issue_date).toLocaleDateString('en-GB')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Termin płatności / Due Date:</Text>
            <Text style={styles.value}>
              {new Date(invoice.due_date).toLocaleDateString('pl-PL')} /{' '}
              {new Date(invoice.due_date).toLocaleDateString('en-GB')}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nabywca / Buyer</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nazwa / Name:</Text>
            <Text style={styles.value}>{invoice.clients?.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Org. nr. / Org. no.:</Text>
            <Text style={styles.value}>{invoice.clients?.org_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Adres / Address:</Text>
            <Text style={styles.value}>{invoice.clients?.address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sprzedawca / Seller</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usługi / Services</Text>
          <View style={styles.description}>
            <Text>{invoice.description}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Opis / Description</Text>
            <Text style={styles.tableCol2}>Kwota / Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>{invoice.description}</Text>
            <Text style={styles.tableCol2}>
              {invoice.amount.toLocaleString('nb-NO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {invoice.currency}
            </Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.total}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Suma netto / Subtotal:</Text>
            <Text style={styles.totalLabel}>
              {invoice.amount.toLocaleString('nb-NO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {invoice.currency}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT / MVA:</Text>
            <Text style={styles.totalLabel}>0.00 {invoice.currency}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>Suma brutto / Total:</Text>
            <Text style={styles.totalAmount}>
              {invoice.amount.toLocaleString('nb-NO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {invoice.currency}
            </Text>
          </View>
        </View>

        {/* Reverse Charge Notice - THE MAGIC */}
        <View style={styles.reverseCharge}>
          <Text style={styles.reverseChargeTitle}>
            ⚠ ODWROTNE OBCIĄŻENIE MVA / REVERSE CHARGE VAT
          </Text>
          <Text style={styles.reverseChargeText}>
            🇵🇱 POLSKI: Zgodnie z art. 28b ustawy o VAT, obowiązek rozliczenia
            podatku VAT/MVA spoczywa na nabywcy usług (odwrotne obciążenie).
            Sprzedawca nie nalicza VAT.
          </Text>
          <Text style={styles.reverseChargeText}>
            🇳🇴 NORWEGIAN: I henhold til norsk merverdiavgiftslov §11-3 (snudd
            avregning / reverse charge), er kjøperen ansvarlig for å beregne og
            rapportere MVA. Selgeren beregner ikke MVA.
          </Text>
          <Text style={styles.reverseChargeText}>
            🇬🇧 ENGLISH: According to the reverse charge mechanism (Article 28b
            VAT Act / Norwegian VAT Act §11-3), the buyer is responsible for
            accounting for VAT/MVA. The seller does not charge VAT.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Invo • {new Date().toLocaleDateString('pl-PL')}
        </Text>
      </Page>
    </Document>
  )
}
