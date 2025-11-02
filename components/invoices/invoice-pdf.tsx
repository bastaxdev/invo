import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'
import { formatIBAN, formatPhoneNumber } from '@/lib/formatters'

// Register font with proper UTF-8 support for Polish & Norwegian characters
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
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
  logo: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 80,
    height: 60,
    objectFit: 'contain',
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
  vatNotice: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#d1fae5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  vatNoticeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#065f46',
  },
  vatNoticeText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#047857',
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
    vat_rate?: number
    vat_amount?: number
    amount_with_vat?: number
    currency: string
    mva_registered_at_creation?: boolean
    clients: {
      name: string
      org_number: string
      address: string
      country?: string
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
    bank_name: string | null
    bank_address: string | null
    swift_bic: string | null
    company_registration: string | null
    logo_url: string | null
    show_logo_on_invoice: boolean
    pdf_language_polish: boolean
    pdf_language_norwegian: boolean
    pdf_language_english: boolean
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

  // Language helpers
  const pl = userProfile?.pdf_language_polish ?? true
  const no = userProfile?.pdf_language_norwegian ?? true
  const en = userProfile?.pdf_language_english ?? false

  // VAT info from invoice (stored at creation)
  const hasVAT = (invoice.vat_rate ?? 0) > 0
  const vatRate = invoice.vat_rate ?? 0
  const vatAmount = invoice.vat_amount ?? 0
  const subtotal = invoice.amount
  const total = invoice.amount_with_vat ?? invoice.amount
  const isNorwegianClient =
    invoice.clients?.country === 'NO' || !invoice.clients?.country
  const wasRegisteredAtCreation = invoice.mva_registered_at_creation === true

  // Text builder helper
  const buildText = (polish: string, norwegian: string, english: string) => {
    const parts = []
    if (pl) parts.push(polish)
    if (no) parts.push(norwegian)
    if (en) parts.push(english)
    return parts.join(' / ')
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo in top right */}
        {userProfile?.logo_url &&
          userProfile?.show_logo_on_invoice !== false && (
            <Image src={userProfile.logo_url} style={styles.logo} />
          )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {buildText('FAKTURA', 'FAKTURA', 'INVOICE')}
          </Text>
          <Text style={styles.invoiceNumber}>
            {buildText('Nr', 'No', 'No')}: {invoice.invoice_number}
          </Text>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>
              {buildText('Data wystawienia', 'Utstedelsesdato', 'Issue Date')}:
            </Text>
            <Text style={styles.value}>
              {new Date(invoice.issue_date).toLocaleDateString('pl-PL')}
              {(no || en) &&
                ' / ' +
                  new Date(invoice.issue_date).toLocaleDateString('en-GB')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              {buildText('Termin płatności', 'Forfallsdato', 'Due Date')}:
            </Text>
            <Text style={styles.value}>
              {new Date(invoice.due_date).toLocaleDateString('pl-PL')}
              {(no || en) &&
                ' / ' + new Date(invoice.due_date).toLocaleDateString('en-GB')}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {buildText('NABYWCA', 'KJØPER', 'BUYER')}
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>
              {buildText('Nazwa', 'Navn', 'Name')}:
            </Text>
            <Text style={styles.value}>{invoice.clients?.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              {buildText('Org. nr.', 'Org. nr.', 'Org. no.')}:
            </Text>
            <Text style={styles.value}>{invoice.clients?.org_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              {buildText('Adres', 'Adresse', 'Address')}:
            </Text>
            <Text style={styles.value}>{invoice.clients?.address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>
            {buildText('SPRZEDAWCA', 'SELGER', 'SELLER')}
          </Text>
          {userProfile?.business_name && (
            <View style={styles.row}>
              <Text style={styles.label}>
                {buildText('Firma', 'Firma', 'Business')}:
              </Text>
              <Text style={styles.value}>{userProfile.business_name}</Text>
            </View>
          )}
          {userProfile?.full_name && (
            <View style={styles.row}>
              <Text style={styles.label}>
                {buildText('Imię i nazwisko', 'Navn', 'Name')}:
              </Text>
              <Text style={styles.value}>{userProfile.full_name}</Text>
            </View>
          )}
          {userProfile?.tax_id && (
            <View style={styles.row}>
              <Text style={styles.label}>
                {buildText('NIP', 'NIP', 'Tax ID')}:
              </Text>
              <Text style={styles.value}>{userProfile.tax_id}</Text>
            </View>
          )}
          {userProfile?.address && (
            <View style={styles.row}>
              <Text style={styles.label}>
                {buildText('Adres', 'Adresse', 'Address')}:
              </Text>
              <Text style={styles.value}>{userProfile.address}</Text>
            </View>
          )}
          {userProfile?.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>
                {buildText('Telefon', 'Telefon', 'Phone')}:
              </Text>
              <Text style={styles.value}>
                {formatPhoneNumber(userProfile.phone)}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        </View>

        {(userProfile?.bank_account || userProfile?.bank_name) && (
          <View style={styles.bankInfo}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>
              {buildText(
                'Dane do przelewu',
                'Betalingsdetaljer',
                'Bank Details'
              )}
              :
            </Text>
            {userProfile?.bank_account && (
              <Text style={{ marginBottom: 2 }}>
                IBAN: {formatIBAN(userProfile.bank_account)}
              </Text>
            )}
            {userProfile?.bank_name && (
              <Text style={{ marginBottom: 2 }}>
                {buildText('Bank', 'Bank', 'Bank')}: {userProfile.bank_name}
              </Text>
            )}
            {userProfile?.swift_bic && (
              <Text style={{ marginBottom: 2 }}>
                SWIFT/BIC: {userProfile.swift_bic}
              </Text>
            )}
            {userProfile?.bank_address && (
              <Text style={{ fontSize: 8, color: '#666' }}>
                {userProfile.bank_address}
              </Text>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Services Section */}
        <Text style={styles.sectionTitle}>
          {buildText('USŁUGI', 'TJENESTER', 'SERVICES')}
        </Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCol1}>
            {buildText('Opis', 'Beskrivelse', 'Description')}
          </Text>
          <Text style={styles.tableCol2}>
            {buildText('Ilość', 'Antall', 'Qty')}
          </Text>
          <Text style={styles.tableCol3}>
            {buildText('Cena', 'Pris', 'Price')}
          </Text>
          <Text style={styles.tableCol4}>
            {buildText('Kwota', 'Beløp', 'Amount')}
          </Text>
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

        {/* Total */}
        <View style={styles.total}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {buildText('Suma netto', 'Subtotal', 'Subtotal')}:
            </Text>
            <Text style={styles.totalLabel}>
              {subtotal.toLocaleString('nb-NO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {invoice.currency}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              MVA / VAT {hasVAT && `(${vatRate}%)`}:
            </Text>
            <Text style={styles.totalLabel}>
              {vatAmount.toLocaleString('nb-NO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {invoice.currency}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>
              {buildText('Suma brutto', 'Total', 'Total')}:
            </Text>
            <Text style={styles.totalAmount}>
              {total.toLocaleString('nb-NO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {invoice.currency}
            </Text>
          </View>
        </View>

        {/* VAT NOTICE - SINGLE CONDITIONAL BLOCK */}
        {hasVAT && isNorwegianClient && (
          <View style={styles.vatNotice}>
            <Text style={styles.vatNoticeTitle}>
              {wasRegisteredAtCreation
                ? buildText(
                    'NORWESKA MVA ZASTOSOWANA',
                    'NORSK MVA PÅLAGT',
                    'NORWEGIAN VAT APPLIED'
                  )
                : buildText(
                    'MVA - W TRAKCIE REJESTRACJI',
                    'MVA - UNDER REGISTRERING',
                    'VAT - UNDER REGISTRATION'
                  )}
            </Text>

            {wasRegisteredAtCreation ? (
              <>
                {pl && (
                  <Text style={styles.vatNoticeText}>
                    [PL] Niniejsza faktura zawiera 25% norweskiej MVA
                    (merverdiavgift). Sprzedawca jest zarejestrowany w norweskim
                    rejestrze MVA.
                  </Text>
                )}
                {no && (
                  <Text style={styles.vatNoticeText}>
                    [NO] Denne fakturaen inkluderer 25% norsk MVA
                    (merverdiavgift). Selgeren er registrert i det norske
                    MVA-registeret.
                  </Text>
                )}
                {en && (
                  <Text style={styles.vatNoticeText}>
                    [EN] This invoice includes 25% Norwegian VAT. The seller is
                    registered in the Norwegian MVA Register.
                  </Text>
                )}
              </>
            ) : (
              <>
                {pl && (
                  <Text style={styles.vatNoticeText}>
                    [PL] Niniejsza faktura zawiera 25% norweskiej MVA. Selskapet
                    er under registrering i Merverdiavgiftsregisteret.
                  </Text>
                )}
                {no && (
                  <Text style={styles.vatNoticeText}>
                    [NO] Denne fakturaen inkluderer 25% norsk MVA. Selskapet er
                    under registrering i Merverdiavgiftsregisteret.
                  </Text>
                )}
                {en && (
                  <Text style={styles.vatNoticeText}>
                    [EN] This invoice includes 25% Norwegian VAT. Selskapet er
                    under registrering i Merverdiavgiftsregisteret.
                  </Text>
                )}
              </>
            )}
          </View>
        )}

        {/* Reverse Charge - NOT REGISTERED, UNDER THRESHOLD */}
        {!hasVAT && isNorwegianClient && (
          <View style={styles.reverseCharge}>
            <Text style={styles.reverseChargeTitle}>
              {buildText(
                'ODWROTNE OBCIĄŻENIE MVA',
                'SNUDD AVREGNING',
                'REVERSE CHARGE VAT'
              )}
            </Text>
            {pl && (
              <Text style={styles.reverseChargeText}>
                [PL] Zgodnie z art. 28b ustawy o VAT, obowiązek rozliczenia
                podatku VAT/MVA spoczywa na nabywcy usług (odwrotne obciążenie).
                Sprzedawca nie jest zarejestrowany do MVA.
              </Text>
            )}
            {no && (
              <Text style={styles.reverseChargeText}>
                [NO] I henhold til norsk merverdiavgiftslov §11-3 (snudd
                avregning / reverse charge), er kjøperen ansvarlig for å beregne
                og rapportere MVA. Selgeren er ikke registrert for MVA.
              </Text>
            )}
            {en && (
              <Text style={styles.reverseChargeText}>
                [EN] According to the reverse charge mechanism (Article 28b VAT
                Act / Norwegian VAT Act §11-3), the buyer is responsible for
                accounting for VAT/MVA. The seller is not registered for MVA.
              </Text>
            )}
          </View>
        )}

        {/* Export Notice */}
        {!isNorwegianClient && (
          <View style={styles.vatNotice}>
            <Text style={styles.vatNoticeTitle}>
              {buildText(
                'EKSPORT - 0% MVA',
                'EKSPORT - 0% MVA',
                'EXPORT - 0% VAT'
              )}
            </Text>
            {pl && (
              <Text style={styles.vatNoticeText}>
                [PL] Sprzedaż eksportowa - stawka 0% MVA zgodnie z norweskimi
                przepisami podatkowymi.
              </Text>
            )}
            {no && (
              <Text style={styles.vatNoticeText}>
                [NO] Eksport av tjenester/varer - 0% MVA i henhold til norske
                skatteregler.
              </Text>
            )}
            {en && (
              <Text style={styles.vatNoticeText}>
                [EN] Export of services/goods - 0% VAT in accordance with
                Norwegian tax regulations.
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          {pl && 'Wygenerowane przez Invo'}
          {pl && (no || en) && ' • '}
          {no && 'Generert av Invo'}
          {!pl && no && en && ' • '}
          {en && !pl && !no && 'Generated by Invo'}
          {' • '}
          {new Date().toLocaleDateString('pl-PL')}
        </Text>
      </Page>
    </Document>
  )
}
