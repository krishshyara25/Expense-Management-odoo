// ExpenseForm component
'use client';

import { useState } from 'react';
import OCRService from '../../services/OCRService';

export default function ExpenseForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    category: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    ...initialData
  });

  const [receipt, setReceipt] = useState(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  const categories = [
    'travel',
    'meals',
    'supplies',
    'training',
    'entertainment',
    'other'
  ];

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReceipt(file);
    setIsProcessingOCR(true);

    try {
      const extractedData = await OCRService.extractReceiptData(file);
      setFormData(prev => ({
        ...prev,
        amount: extractedData.amount || prev.amount,
        date: extractedData.date || prev.date,
        vendor: extractedData.vendor || prev.vendor,
        description: extractedData.description || prev.description
      }));
    } catch (error) {
      console.error('OCR processing failed:', error);
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    if (receipt) {
      expenseData.receipt = receipt;
    }

    onSubmit(expenseData);
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>Submit Expense</h2>

      <div className="form-group">
        <label htmlFor="receipt">Receipt (Optional)</label>
        <input
          type="file"
          id="receipt"
          accept="image/*"
          onChange={handleReceiptUpload}
        />
        {isProcessingOCR && <p>Processing receipt...</p>}
      </div>

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <input
            type="text"
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          required
        >
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="vendor">Vendor</label>
          <input
            type="text"
            id="vendor"
            value={formData.vendor}
            onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
          />
        </div>
      </div>

      <button type="submit" disabled={isProcessingOCR}>
        Submit Expense
      </button>
    </form>
  );
}