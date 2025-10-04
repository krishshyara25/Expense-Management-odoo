import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  country: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  settings: {
    expensePolicy: String,
    approvalWorkflow: {
      type: String,
      enum: ['single', 'multi-level'],
      default: 'single'
    },
    maxExpenseAmount: {
      type: Number,
      default: 10000
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

CompanySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);