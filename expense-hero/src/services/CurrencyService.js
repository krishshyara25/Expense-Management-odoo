// src/services/CurrencyService.js
// Enhanced Currency Service with caching and comprehensive country data

const COUNTRIES_API = process.env.COUNTRIES_API_URL || 'https://restcountries.com/v3.1/all?fields=name,currencies';
const CURRENCY_CONVERSION_API = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest';

// Cache to store API responses
const cache = new Map();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Get cached data or fetch new data if cache is expired
 */
function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

/**
 * Cache data with timestamp
 */
function setCachedData(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

/**
 * Fetches all countries with their currencies for comprehensive data
 */
export async function getCountriesWithCurrencies() {
    const cacheKey = 'countries_currencies';
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;

    try {
        const response = await fetch(COUNTRIES_API);
        if (!response.ok) return getFallbackCountriesData();
        
        const countries = await response.json();
        
        // Transform data into a more usable format
        const countriesWithCurrencies = countries.map(country => {
            const currencies = country.currencies ? 
                Object.entries(country.currencies).map(([code, details]) => ({
                    code,
                    name: details.name,
                    symbol: details.symbol || code
                })) : [];

            return {
                name: country.name.common,
                officialName: country.name.official,
                currencies
            };
        }).filter(country => country.currencies.length > 0);

        setCachedData(cacheKey, countriesWithCurrencies);
        return countriesWithCurrencies;
    } catch (error) {
        console.error('Error fetching countries and currencies:', error);
        return getFallbackCountriesData();
    }
}

/**
 * Fetches unique currency codes for dropdowns
 */
export async function getCurrencyCodes() {
    const cacheKey = 'currency_codes';
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;

    try {
        const countries = await getCountriesWithCurrencies();
        const currencies = new Set();
        
        countries.forEach(country => {
            country.currencies.forEach(currency => {
                currencies.add(currency.code);
            });
        });

        const currencyCodes = Array.from(currencies).sort();
        setCachedData(cacheKey, currencyCodes);
        return currencyCodes;
    } catch (error) {
        console.error('Error getting currency codes:', error);
        return ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR']; // Fallback
    }
}

/**
 * Get detailed currency information including symbols and names
 */
export async function getCurrencyDetails() {
    const cacheKey = 'currency_details';
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;

    try {
        const countries = await getCountriesWithCurrencies();
        const currencyMap = new Map();

        countries.forEach(country => {
            country.currencies.forEach(currency => {
                if (!currencyMap.has(currency.code)) {
                    currencyMap.set(currency.code, {
                        code: currency.code,
                        name: currency.name,
                        symbol: currency.symbol,
                        countries: [country.name]
                    });
                } else {
                    const existing = currencyMap.get(currency.code);
                    existing.countries.push(country.name);
                }
            });
        });

        const currencyDetails = Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code));
        setCachedData(cacheKey, currencyDetails);
        return currencyDetails;
    } catch (error) {
        console.error('Error getting currency details:', error);
        return getFallbackCurrencyDetails();
    }
}

/**
 * Gets the conversion rate from BASE_CURRENCY to TARGET_CURRENCY
 */
export async function getConversionRate(baseCurrency, targetCurrency) {
    if (baseCurrency === targetCurrency) return 1;
    
    const cacheKey = `rate_${baseCurrency}_${targetCurrency}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
        const response = await fetch(`${CURRENCY_CONVERSION_API}/${baseCurrency}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        
        if (data.rates && data.rates[targetCurrency]) {
            const rate = data.rates[targetCurrency];
            setCachedData(cacheKey, rate);
            return rate;
        }
        
        throw new Error(`Rate not found for ${baseCurrency} to ${targetCurrency}`);
    } catch (error) {
        console.error("Conversion API error:", error);
        return 0; // Conversion failed
    }
}

/**
 * Get all exchange rates for a base currency
 */
export async function getExchangeRates(baseCurrency = 'USD') {
    const cacheKey = `exchange_rates_${baseCurrency}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) return cached;

    try {
        const response = await fetch(`${CURRENCY_CONVERSION_API}/${baseCurrency}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        
        const exchangeData = {
            base: baseCurrency,
            date: data.date,
            rates: data.rates,
            lastUpdated: new Date().toISOString()
        };

        setCachedData(cacheKey, exchangeData);
        return exchangeData;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw new Error(`Failed to get exchange rates for ${baseCurrency}`);
    }
}

/**
 * Converts a submitted expense amount to the company's base currency
 */
export async function convertToCompanyBase(amount, submittedCurrency, baseCurrency) {
    if (submittedCurrency === baseCurrency) {
        return {
            originalAmount: amount,
            convertedAmount: amount,
            fromCurrency: submittedCurrency,
            toCurrency: baseCurrency,
            exchangeRate: 1,
            convertedAt: new Date().toISOString()
        };
    }
    
    try {
        const rate = await getConversionRate(submittedCurrency, baseCurrency);
        if (rate === 0) {
            throw new Error(`Cannot convert from ${submittedCurrency} to ${baseCurrency}`);
        }

        const convertedAmount = Math.round(amount * rate * 100) / 100; // Round to 2 decimals
        
        return {
            originalAmount: amount,
            convertedAmount,
            fromCurrency: submittedCurrency,
            toCurrency: baseCurrency,
            exchangeRate: rate,
            convertedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Currency conversion error:', error);
        // Return original amount if conversion fails
        return {
            originalAmount: amount,
            convertedAmount: amount,
            fromCurrency: submittedCurrency,
            toCurrency: baseCurrency,
            exchangeRate: 1,
            error: error.message,
            convertedAt: new Date().toISOString()
        };
    }
}

/**
 * Convert any amount between two currencies
 */
export async function convertCurrency(amount, fromCurrency, toCurrency) {
    return await convertToCompanyBase(amount, fromCurrency, toCurrency);
}

/**
 * Get popular/major currencies with their current rates against USD
 */
export async function getMajorCurrencies() {
    const majorCurrencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
    
    try {
        const rates = await getExchangeRates('USD');
        const currencyDetails = await getCurrencyDetails();
        
        return majorCurrencyCodes.map(code => {
            const details = currencyDetails.find(c => c.code === code);
            return {
                code,
                name: details?.name || code,
                symbol: details?.symbol || code,
                rate: code === 'USD' ? 1 : (rates.rates[code] || null),
                countries: details?.countries || []
            };
        }).filter(currency => currency.rate !== null);
    } catch (error) {
        console.error('Error getting major currencies:', error);
        return getFallbackMajorCurrencies();
    }
}

/**
 * Fallback data when APIs are unavailable
 */
function getFallbackCountriesData() {
    return [
        { 
            name: 'United States', 
            officialName: 'United States of America', 
            currencies: [{ code: 'USD', name: 'United States Dollar', symbol: '$' }] 
        },
        { 
            name: 'United Kingdom', 
            officialName: 'United Kingdom of Great Britain and Northern Ireland', 
            currencies: [{ code: 'GBP', name: 'British Pound Sterling', symbol: '£' }] 
        },
        { 
            name: 'Germany', 
            officialName: 'Federal Republic of Germany', 
            currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }] 
        },
        { 
            name: 'Japan', 
            officialName: 'Japan', 
            currencies: [{ code: 'JPY', name: 'Japanese Yen', symbol: '¥' }] 
        },
        { 
            name: 'India', 
            officialName: 'Republic of India', 
            currencies: [{ code: 'INR', name: 'Indian Rupee', symbol: '₹' }] 
        }
    ];
}

function getFallbackCurrencyDetails() {
    return [
        { code: 'USD', name: 'United States Dollar', symbol: '$', countries: ['United States'] },
        { code: 'EUR', name: 'Euro', symbol: '€', countries: ['Germany', 'France', 'Italy'] },
        { code: 'GBP', name: 'British Pound Sterling', symbol: '£', countries: ['United Kingdom'] },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', countries: ['Japan'] },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', countries: ['India'] }
    ];
}

function getFallbackMajorCurrencies() {
    return [
        { code: 'USD', name: 'United States Dollar', symbol: '$', rate: 1, countries: ['United States'] },
        { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85, countries: ['Germany', 'France'] },
        { code: 'GBP', name: 'British Pound Sterling', symbol: '£', rate: 0.73, countries: ['United Kingdom'] },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110, countries: ['Japan'] },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74, countries: ['India'] }
    ];
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCache() {
    cache.clear();
}