// lib/vat-helper.ts

export interface VATCalculation {
  shouldApplyVAT: boolean
  vatRate: number
  subtotal: number
  vatAmount: number
  total: number
  notice: string
  alertUser: boolean
}

/**
 * Calculate VAT for an invoice according to Norwegian MVA law
 *
 * CRITICAL RULES:
 * 1. If registered for MVA → ALWAYS charge 25% VAT to Norwegian clients
 * 2. If NOT registered → NO VAT until 50k threshold is crossed
 * 3. When crossing 50k threshold → charge VAT and alert user to register
 */
export function calculateVAT(
  subtotal: number,
  clientCountry: string,
  mvaRegistered: boolean,
  currentRevenueNOK: number,
  newInvoiceAmountNOK: number
): VATCalculation {
  const NORWEGIAN_VAT_RATE = 25 // 25% for Norway
  const MVA_THRESHOLD = 50000 // NOK

  // **STEP 1: Check if user is registered for MVA**
  if (mvaRegistered) {
    // USER IS REGISTERED - Registration status determines VAT charging

    if (clientCountry === 'NO') {
      // Norwegian client - ALWAYS apply 25% VAT
      const vatAmount = (subtotal * NORWEGIAN_VAT_RATE) / 100
      return {
        shouldApplyVAT: true,
        vatRate: NORWEGIAN_VAT_RATE,
        subtotal,
        vatAmount,
        total: subtotal + vatAmount,
        notice: 'registered_norwegian_client',
        alertUser: false,
      }
    } else {
      // Export (non-Norwegian client) - 0% VAT (zero-rating)
      return {
        shouldApplyVAT: false,
        vatRate: 0,
        subtotal,
        vatAmount: 0,
        total: subtotal,
        notice: 'export_zero_rated',
        alertUser: false,
      }
    }
  } else {
    // USER IS NOT REGISTERED

    // Calculate total revenue after this invoice
    const totalRevenueAfterInvoice = currentRevenueNOK + newInvoiceAmountNOK

    if (totalRevenueAfterInvoice <= MVA_THRESHOLD) {
      // Staying under 50k threshold - NO VAT, no special notice
      return {
        shouldApplyVAT: false,
        vatRate: 0,
        subtotal,
        vatAmount: 0,
        total: subtotal,
        notice: 'under_threshold',
        alertUser: false,
      }
    } else {
      // THIS INVOICE CROSSES THE 50K THRESHOLD
      // MUST charge VAT and alert user to register immediately
      const vatAmount = (subtotal * NORWEGIAN_VAT_RATE) / 100
      return {
        shouldApplyVAT: true,
        vatRate: NORWEGIAN_VAT_RATE,
        subtotal,
        vatAmount,
        total: subtotal + vatAmount,
        notice: 'threshold_crossed',
        alertUser: true,
      }
    }
  }
}

/**
 * Format VAT rate for display
 */
export function formatVATRate(rate: number): string {
  return `${rate}%`
}

/**
 * Get VAT notice text for invoice
 */
export function getVATNotice(noticeType: string): {
  title: { pl: string; no: string; en: string }
  text: { pl: string; no: string; en: string }
} {
  switch (noticeType) {
    case 'registered_norwegian_client':
      return {
        title: {
          pl: 'NORWESKA MVA ZASTOSOWANA',
          no: 'NORSK MVA PÅLAGT',
          en: 'NORWEGIAN VAT APPLIED',
        },
        text: {
          pl: 'Niniejsza faktura zawiera 25% norweskiej MVA (merverdiavgift). Sprzedawca jest zarejestrowany w norweskim rejestrze MVA.',
          no: 'Denne fakturaen inkluderer 25% norsk MVA (merverdiavgift). Selgeren er registrert i det norske MVA-registeret.',
          en: 'This invoice includes 25% Norwegian VAT. The seller is registered in the Norwegian MVA Register.',
        },
      }

    case 'threshold_crossed':
      return {
        title: {
          pl: 'MVA - W TRAKCIE REJESTRACJI',
          no: 'MVA - UNDER REGISTRERING',
          en: 'VAT - UNDER REGISTRATION',
        },
        text: {
          pl: 'Niniejsza faktura zawiera 25% norweskiej MVA. Selskapet er under registrering i Merverdiavgiftsregisteret.',
          no: 'Denne fakturaen inkluderer 25% norsk MVA. Selskapet er under registrering i Merverdiavgiftsregisteret.',
          en: 'This invoice includes 25% Norwegian VAT. Selskapet er under registrering i Merverdiavgiftsregisteret.',
        },
      }

    case 'export_zero_rated':
      return {
        title: {
          pl: 'EKSPORT - 0% MVA',
          no: 'EKSPORT - 0% MVA',
          en: 'EXPORT - 0% VAT',
        },
        text: {
          pl: 'Sprzedaż eksportowa - stawka 0% MVA zgodnie z norweskimi przepisami podatkowymi.',
          no: 'Eksport av tjenester/varer - 0% MVA i henhold til norske skatteregler.',
          en: 'Export of services/goods - 0% VAT in accordance with Norwegian tax regulations.',
        },
      }

    case 'under_threshold':
    default:
      return {
        title: {
          pl: '',
          no: '',
          en: '',
        },
        text: {
          pl: '',
          no: '',
          en: '',
        },
      }
  }
}
