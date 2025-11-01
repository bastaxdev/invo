// lib/currency.ts

interface ExchangeRates {
  [key: string]: number
}

let cachedRates: { rates: ExchangeRates; timestamp: number } | null = null
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

/**
 * Fetch live exchange rates from ExchangeRate-API
 * Free tier: 1,500 requests/month
 */
async function fetchExchangeRates(): Promise<ExchangeRates> {
  // Check cache first
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
    return cachedRates.rates
  }

  try {
    // Using EUR as base currency (free tier)
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/EUR'
    )
    const data = await response.json()

    const rates = {
      EUR: 1,
      PLN: data.rates.PLN,
      NOK: data.rates.NOK,
    }

    // Cache the rates
    cachedRates = {
      rates,
      timestamp: Date.now(),
    }

    return rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    // Fallback to approximate rates if API fails
    return {
      EUR: 1,
      PLN: 4.3,
      NOK: 11.5,
    }
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rates = await fetchExchangeRates()

  // Convert from -> EUR -> to
  const amountInEUR = amount / rates[fromCurrency]
  const convertedAmount = amountInEUR * rates[toCurrency]

  return convertedAmount
}

/**
 * Format currency amount with symbol
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    PLN: 'zł',
    NOK: 'kr',
    EUR: '€',
  }

  return `${amount.toLocaleString('nb-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbols[currency] || currency}`
}

/**
 * Convert multiple amounts to target currency and sum them
 */
export async function convertAndSum(
  amounts: Array<{ amount: number; currency: string }>,
  targetCurrency: string
): Promise<number> {
  const conversions = await Promise.all(
    amounts.map(({ amount, currency }) =>
      convertCurrency(amount, currency, targetCurrency)
    )
  )

  return conversions.reduce((sum, amount) => sum + amount, 0)
}
