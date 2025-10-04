import { Router } from 'express';
import { fetchCountriesCurrencies, fetchRates } from '../services/currency.js';

const router = Router();

router.get('/countries', async (req, res) => {
  const data = await fetchCountriesCurrencies();
  res.json(data);
});

router.get('/exchange-rates/:base', async (req, res) => {
  const base = req.params.base.toUpperCase();
  const data = await fetchRates(base);
  res.json(data);
});

export default router;
