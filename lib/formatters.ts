// lib/formatters.ts

/**
 * Format IBAN with spaces every 4 characters
 * Example: PL61109010140000071219812874 -> PL61 1090 1014 0000 0712 1981 2874
 */
export function formatIBAN(iban: string | null | undefined): string {
  if (!iban) return ''
  const cleaned = iban.replace(/\s/g, '')
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
}

/**
 * Format phone number
 * Example: +48123456789 -> +48 123 456 789
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\s/g, '')

  // If starts with +48 (Poland)
  if (cleaned.startsWith('+48')) {
    return cleaned.replace(/(\+48)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')
  }

  // If starts with +47 (Norway)
  if (cleaned.startsWith('+47')) {
    return cleaned.replace(
      /(\+47)(\d{2})(\d{2})(\d{2})(\d{2})/,
      '$1 $2 $3 $4 $5'
    )
  }

  // Generic: space every 3 digits after country code
  return cleaned.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d+)/, '$1 $2 $3 $4')
}

/**
 * Format multi-line address
 */
export function formatAddress(address: string | null | undefined): string {
  if (!address) return ''
  return address.trim()
}

/**
 * Validate IBAN format (basic)
 */
export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '')
  // Basic check: 2 letters followed by 2 digits, then alphanumeric
  return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)
}

/**
 * Validate phone number format (basic)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '')
  // Should start with + and have at least 10 digits
  return /^\+\d{10,15}$/.test(cleaned)
}
