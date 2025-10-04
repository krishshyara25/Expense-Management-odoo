// Handles real-time conversion and country data
class CurrencyService {
  constructor() {
    this.exchangeRateAPI = process.env.EXCHANGE_RATE_API_KEY;
    this.baseURL = 'https://api.exchangerate-api.com/v4/latest/';
  }

  async getExchangeRate(fromCurrency, toCurrency) {
    try {
      const response = await fetch(`${this.baseURL}${fromCurrency}`);
      const data = await response.json();
      
      if (data.rates && data.rates[toCurrency]) {
        return data.rates[toCurrency];
      }
      
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Return 1 as fallback for same currency
      return fromCurrency === toCurrency ? 1 : null;
    }
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    if (rate) {
      return amount * rate;
    }
    
    throw new Error('Currency conversion failed');
  }

  getCountryData() {
    // Static country data with currency information
    return [
      { code: 'US', name: 'United States', currency: 'USD' },
      { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
      { code: 'EU', name: 'European Union', currency: 'EUR' },
      { code: 'CA', name: 'Canada', currency: 'CAD' },
      { code: 'AU', name: 'Australia', currency: 'AUD' },
      { code: 'JP', name: 'Japan', currency: 'JPY' },
      { code: 'IN', name: 'India', currency: 'INR' },
      // Add more countries as needed
    ];
  }

  getCurrencyByCountry(countryCode) {
    const country = this.getCountryData().find(c => c.code === countryCode);
    return country ? country.currency : 'USD';
  }

  formatCurrency(amount, currency) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }
}

export default new CurrencyService();