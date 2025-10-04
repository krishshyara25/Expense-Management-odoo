import mongoose from 'mongoose';

const exchangeRateSchema = new mongoose.Schema(
  {
    base: { type: String, required: true },
    date: { type: Date, required: true },
    ratesJson: { type: String, required: true },
  },
  { timestamps: true }
);

exchangeRateSchema.index({ base: 1, date: 1 }, { unique: true });

export const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);
