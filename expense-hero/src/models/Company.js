// src/models/Company.js
import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true },
    baseCurrency: { type: String, required: true }, // e.g., 'INR', 'USD'
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
