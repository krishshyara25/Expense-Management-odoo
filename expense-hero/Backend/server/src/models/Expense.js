import mongoose from 'mongoose';

const expenseLineSchema = new mongoose.Schema({
  description: String,
  amount: { type: Number, required: true },
});

const receiptSchema = new mongoose.Schema({
  url: String,
  ocrText: String,
});

const expenseSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    amountOriginal: { type: Number, required: true },
    currencyOriginal: { type: String, required: true },
    amountCompany: { type: Number, required: true },
    currencyCompany: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    lines: [expenseLineSchema],
    receipts: [receiptSchema],
    flow: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalFlow', default: null },
    stepOrder: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);
