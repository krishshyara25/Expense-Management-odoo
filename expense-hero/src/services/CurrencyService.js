// src/services/CurrencyService.js
const COUNTRIES_API = 'https://restcountries.com/v3.1/all?fields=name,currencies';
const CURRENCY_CONVERSION_API = 'https://api.exchangerate-api.com/v4/latest/';

/**
 * Fetches unique currency codes for dropdowns.
 */
export async function getCurrencyCodes() {
    try {
        const response = await fetch(COUNTRIES_API);
        if (!response.ok) return ['USD', 'EUR', 'INR']; // Fallback
        
        const data = await response.json();
        const currencies = new Set();
        
        data.forEach(country => {
            if (country.currencies) {
                Object.keys(country.currencies).forEach(code => currencies.add(code));
            }
        });
        return Array.from(currencies).sort();
    } catch (error) {
        return ['USD', 'EUR', 'INR']; // Fallback
    }
}

/**
 * Gets the conversion rate from BASE_CURRENCY to TARGET_CURRENCY.
 */
export async function getConversionRate(baseCurrency, targetCurrency) {
    if (baseCurrency === targetCurrency) return 1;
    
    try {
        const response = await fetch(`${CURRENCY_CONVERSION_API}${baseCurrency}`);
        const data = await response.json();
        
        if (data.rates && data.rates[targetCurrency]) {
            return data.rates[targetCurrency]; 
        }
        return 0; // Conversion failed
    } catch (error) {
        console.error("Conversion API error:", error);
        return 0;
    }
}

/**
 * Converts a submitted expense amount to the company's base currency.
 */
export async function convertToCompanyBase(amount, submittedCurrency, baseCurrency) {
    if (submittedCurrency === baseCurrency) {
        return amount;
    }
    
    // Get rate from submittedCurrency to baseCurrency
    const submittedToBaseRate = await getConversionRate(submittedCurrency, baseCurrency);
    
    // We get a rate for 1 unit of submittedCurrency in baseCurrency terms
    return Math.round(amount * submittedToBaseRate * 100) / 100; // Round to 2 decimals
}