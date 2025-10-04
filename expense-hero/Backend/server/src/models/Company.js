import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    countryCode: { type: String, required: true },
    currencyCode: { type: String, required: true },
    activeFlow: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalFlow', default: null },
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', companySchema);
