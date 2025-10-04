import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const roles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    profile: {
      manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
