// src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // Hide password by default
    name: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Admin', 'Manager', 'Employee'], 
        default: 'Employee' 
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);