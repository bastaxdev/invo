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

// Register fonts that support Polish characters from CDN
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Roboto',
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
    width: '50%',
  },
  tableCol2: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol3: {
    width: '17.5%',
    textAlign: 'right',
  },
  tableCol4: {
    width: '17.5%',
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
  sellerSection: {
    marginBottom: 20,
  },
  bankInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
})

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

interface InvoicePDFProps {
  invoice: {
    invoice_number: string
    issue_date: string
    due_date: string
    description: string
    amount: number
    currency: string
    mode?: string
    clients: {
      name: string
      org_number: string
      address: string
    } | null
  }
  invoiceItems?: InvoiceItem[]
  user: {
    email: string
  }
  userProfile?: {
    full_name: string | null
    business_name: string | null
    tax_id: string | null
    address: string | null
    phone: string | null
    bank_account: string | null
  } | null
}

export function InvoicePDF({
  invoice,
  invoiceItems,
  user,
  userProfile,
}: InvoicePDFProps) {
  const items =
    invoiceItems && invoiceItems.length > 0
      ? invoiceItems
      : [
          {
            description: invoice.description,
            quantity: 1,
            unit_price: invoice.amount,
            amount: invoice.amount,
          },
        ]

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
            <Text style={styles.label}>Termin platnosci / Due Date:</Text>
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
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Sprzedawca / Seller</Text>
          {userProfile?.business_name && (
            <View style={styles.row}>
              <Text style={styles.label}>Firma / Business:</Text>
              <Text style={styles.value}>{userProfile.business_name}</Text>
            </View>
          )}
          {userProfile?.full_name && (
            <View style={styles.row}>
              <Text style={styles.label}>Imie i nazwisko / Name:</Text>
              <Text style={styles.value}>{userProfile.full_name}</Text>
            </View>
          )}
          {userProfile?.tax_id && (
            <View style={styles.row}>
              <Text style={styles.label}>NIP / Tax ID:</Text>
              <Text style={styles.value}>{userProfile.tax_id}</Text>
            </View>
          )}
          {userProfile?.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Adres / Address:</Text>
              <Text style={styles.value}>{userProfile.address}</Text>
            </View>
          )}
          {userProfile?.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Telefon / Phone:</Text>
              <Text style={styles.value}>{userProfile.phone}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        </View>

        {userProfile?.bank_account && (
          <View style={styles.bankInfo}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
              Dane do przelewu / Bank Details:
            </Text>
            <Text>{userProfile.bank_account}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Line Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Uslugi / Services</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Opis / Description</Text>
            <Text style={styles.tableCol2}>Ilosc / Qty</Text>
            <Text style={styles.tableCol3}>Cena / Price</Text>
            <Text style={styles.tableCol4}>Kwota / Amount</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCol1}>{item.description}</Text>
              <Text style={styles.tableCol2}>{item.quantity}</Text>
              <Text style={styles.tableCol3}>
                {item.unit_price.toLocaleString('nb-NO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.tableCol4}>
                {item.amount.toLocaleString('nb-NO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          ))}
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
            ODWROTNE OBCIAZENIE MVA / REVERSE CHARGE VAT
          </Text>
          <Text style={styles.reverseChargeText}>
            POLSKI: Zgodnie z art. 28b ustawy o VAT, obowiazek rozliczenia
            podatku VAT/MVA spoczywa na nabywcy uslug (odwrotne obciazenie).
            Sprzedawca nie nalicza VAT.
          </Text>
          <Text style={styles.reverseChargeText}>
            NORWEGIAN: I henhold til norsk merverdiavgiftslov par.11-3 (snudd
            avregning / reverse charge), er kjoperen ansvarlig for a beregne og
            rapportere MVA. Selgeren beregner ikke MVA.
          </Text>
          <Text style={styles.reverseChargeText}>
            ENGLISH: According to the reverse charge mechanism (Article 28b VAT
            Act / Norwegian VAT Act par.11-3), the buyer is responsible for
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
