import axios from 'axios';
import nodeSchedule from 'node-schedule';
import { ExchangeRate } from '../models/ExchangeRate.js';

const COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,currencies';
const RATES_URL = (base) => `https://api.exchangerate-api.com/v4/latest/${base}`;

export async function fetchCountriesCurrencies() {
  const { data } = await axios.get(COUNTRIES_URL);
  return data;
}

export async function fetchRates(base) {
  const { data } = await axios.get(RATES_URL(base));
  return data;
}

function extractRateMap(data) {
  // Support both { rates: {...} } and { conversion_rates: {...} }
  return data?.rates || data?.conversion_rates || null;
}

async function getCachedRatesDoc(base) {
  return ExchangeRate.findOne({ base }).sort({ date: -1 }).lean();
}

async function getRate(base, to) {
  const BASE = base.toUpperCase();
  const TO = to.toUpperCase();

  // Try cache first
  const cached = await getCachedRatesDoc(BASE);
  if (cached) {
    try {
      const parsed = JSON.parse(cached.ratesJson);
      const map = extractRateMap(parsed);
      const rate = map?.[TO];
      if (rate) return rate;
    } catch (_) { /* ignore parse errors and fall through */ }
  }

  // Fallback to live fetch and cache it
  const live = await fetchRates(BASE);
  const date = new Date(live.time_last_update_utc || Date.now());
  try {
    await ExchangeRate.findOneAndUpdate(
      { base: BASE, date },
      { base: BASE, date, ratesJson: JSON.stringify(live) },
      { upsert: true }
    );
  } catch (_) { /* ignore cache write errors */ }
  const liveMap = extractRateMap(live);
  const liveRate = liveMap?.[TO];
  if (!liveRate) throw new Error(`Missing rate ${BASE}->${TO}`);
  return liveRate;
}

export async function getCompanyCurrencyByCountry(input) {
  // Try to map from country name or code to currency using REST Countries API
  try {
    const { data } = await axios.get(COUNTRIES_URL);
    const norm = (s) => (s || '').toString().trim().toUpperCase();
    const val = norm(input);

    // If it's a 3-letter value and matches any currency code, accept it
    const allCurrencies = new Set();
    data.forEach(c => {
      const codes = Object.keys(c.currencies || {});
      codes.forEach(code => allCurrencies.add(code.toUpperCase()));
    });
    if (val.length === 3 && allCurrencies.has(val)) return val;

    // Match by common country name
    const byName = data.find(c => norm(c.name?.common) === val);
    if (byName) {
      const codes = Object.keys(byName.currencies || {});
      if (codes.length > 0) return codes[0].toUpperCase();
    }
  } catch (e) {
    // ignore and fall through
  }
  return 'USD';
}

export async function convertToCompanyCurrency(from, to, amount) {
  const FROM = from.toUpperCase();
  const TO = to.toUpperCase();
  if (FROM === TO) return amount;
  const rate = await getRate(FROM, TO);
  return Number((amount * rate).toFixed(2));
}

export function scheduleRateRefresh() {
  nodeSchedule.scheduleJob('0 3 * * *', async () => {
    for (const base of ['USD', 'EUR', 'INR']) {
      try {
        const data = await fetchRates(base);
        const date = new Date(data.time_last_update_utc || Date.now());
        await ExchangeRate.findOneAndUpdate(
          { base, date },
          { base, date, ratesJson: JSON.stringify(data) },
          { upsert: true }
        );
        console.log(`Cached rates for ${base}`);
      } catch (e) {
        console.error('Rate refresh failed for', base, e.message);
      }
    }
  });
}
