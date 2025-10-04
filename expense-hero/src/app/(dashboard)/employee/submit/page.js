// src/app/(dashboard)/employee/submit/page.js
"use client";
import { useState, useEffect } from 'react';
import { getCurrencyCodes } from '../../../../services/CurrencyService';

export default function ExpenseSubmissionPage() {
    const [formData, setFormData] = useState({
        amount: '', currency: 'USD', date: new Date().toISOString().split('T')[0], 
        description: '', category: '', vendor: ''
    });
    const [currencies, setCurrencies] = useState([]);
    const [receiptFile, setReceiptFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const categories = ['meals', 'travel', 'supplies', 'training', 'entertainment', 'other'];

    useEffect(() => {
        getCurrencyCodes().then(setCurrencies);
    }, []);

    const handleOCR = async (e) => {
        if (!receiptFile) return;
        setLoading(true);
        setMessage('Processing receipt via OCR...');

        try {
            const formData = new FormData();
            formData.append('receiptImage', receiptFile);

            const response = await fetch('/api/expenses/ocr', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                body: formData,
            });

            if (!response.ok) throw new Error((await response.json()).message || "OCR failed. Try manual entry.");
            
            const data = await response.json();
            setFormData(prev => ({ 
                ...prev, 
                amount: data.amount.toString(), 
                currency: data.currency, 
                date: data.date, 
                description: data.description, 
                category: data.category || prev.category,
                vendor: data.vendor
            }));
            setMessage("OCR successful! Fields auto-filled.");

        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (action) => {
        if (!formData.amount || !formData.currency || !formData.description || !formData.category || !formData.date) {
            setMessage("Please fill all required fields before submitting.");
            return;
        }
        setLoading(true);
        setMessage(action === 'Submit' ? 'Submitting expense...' : 'Saving draft...');

        const payload = { ...formData, amount: parseFloat(formData.amount), action };

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error((await response.json()).message || action + " failed.");

            const statusMsg = action === 'Submit' ? 'Expense submitted for approval!' : 'Expense saved as draft.';
            setMessage(`Success! ${statusMsg}`);

            // Clear form
            setFormData({ amount: '', currency: 'USD', date: new Date().toISOString().split('T')[0], description: '', category: '', vendor: '' });
            setReceiptFile(null);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <h1 className="text-3xl font-bold mb-6">Submit New Expense</h1>
            
            <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <h2 className="text-xl font-semibold mb-3">1. Receipt Processing (OCR)</h2>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setReceiptFile(e.target.files[0])} 
                    className="mb-3 block w-full text-sm"
                />
                <button 
                    onClick={handleOCR} 
                    disabled={loading || !receiptFile}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-500"
                >
                    {loading && message.includes('OCR') ? 'Processing...' : 'Scan Receipt (OCR)'}
                </button>
            </div>

            <h2 className="text-xl font-semibold mb-3">2. Expense Details (Manual/Review)</h2>
            <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Amount" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required className="p-3 border rounded dark:bg-gray-700" />
                
                <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} required className="p-3 border rounded dark:bg-gray-700">
                    <option value="">Select Currency</option>
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <input type="date" placeholder="Date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="p-3 border rounded dark:bg-gray-700" />
                
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required className="p-3 border rounded dark:bg-gray-700">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                
                <input type="text" placeholder="Vendor/Restaurant" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} required className="p-3 border rounded dark:bg-gray-700" />
            </div>
            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full mt-4 p-3 border rounded dark:bg-gray-700"></textarea>

            <div className="mt-6 space-x-4">
                <button 
                    onClick={() => handleSubmit('Draft')} 
                    disabled={loading}
                    className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
                >
                    Save as Draft
                </button>
                <button 
                    onClick={() => handleSubmit('Submit')} 
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-500"
                >
                    Submit Expense
                </button>
            </div>
            {message && <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
        </div>
    );
}
