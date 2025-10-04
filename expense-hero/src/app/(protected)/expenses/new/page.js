// src/app/(protected)/expenses/new/page.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { redirect, useRouter } from 'next/navigation';

const initialForm = {
  description: '',
  category: '',
  amount: '',
  currency: 'USD',
  date: new Date().toISOString().split('T')[0],
  receipt: null,
};

export default function NewExpensePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isLoading && !user) {
    redirect('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({ ...prev, receipt: file }));
    setOcrLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      // 1. OCR Scan - POST /ocr/scan (assumed route from backend file structure)
      const ocrResult = await apiFetch('ocr/scan', {
        method: 'POST',
        headers: { 'Content-Type': undefined }, // Let browser set Content-Type for FormData
        body: formData,
      });

      // 2. Pre-fill form with OCR data
      setForm((prev) => ({
        ...prev,
        description: ocrResult.vendor || prev.description,
        amount: ocrResult.amount || prev.amount,
        currency: ocrResult.currency || prev.currency,
        date: ocrResult.date || prev.date,
      }));
      setMessage({ type: 'success', text: 'Receipt scanned successfully! Please review and submit.' });
    } catch (error) {
      setMessage({ type: 'error', text: `OCR failed: ${error.message}. Please fill manually.` });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const expenseFormData = new FormData();
    expenseFormData.append('description', form.description);
    expenseFormData.append('category', form.category);
    expenseFormData.append('amount', form.amount);
    expenseFormData.append('currency', form.currency);
    expenseFormData.append('date', form.date);
    if (form.receipt) {
      expenseFormData.append('receipt', form.receipt);
    }

    try {
      // 3. Final Expense Submission - POST /expenses
      await apiFetch('expenses', {
        method: 'POST',
        headers: { 'Content-Type': undefined },
        body: expenseFormData,
      });
      setMessage({ type: 'success', text: 'Expense submitted successfully!' });
      setForm(initialForm);
      router.push('/dashboard');
    } catch (error) {
      setMessage({ type: 'error', text: `Submission failed: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-600">Submit New Expense 🧾</h2>

      {/* Message Area */}
      {message && (
        <div className={`p-3 mb-4 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Receipt Upload/OCR */}
        <div>
          <label htmlFor="receipt" className="block text-sm font-medium text-gray-700">
            Receipt Image/PDF
          </label>
          <input
            id="receipt"
            type="file"
            name="receipt"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
          />
          {ocrLoading && <p className="mt-2 text-sm text-indigo-600">Scanning receipt for data... Please wait.</p>}
        </div>

        {/* Expense Details */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description / Vendor
            </label>
            <input
              id="description"
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="e.g., Dinner with Client"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Category</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food & Beverage</option>
              <option value="Supplies">Office Supplies</option>
              <option value="Software">Software</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              step="0.01"
              placeholder="123.45"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date of Expense
            </label>
            <input
              id="date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || ocrLoading || !form.receipt}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Expense for Approval'}
        </button>
      </form>
    </div>
  );
}