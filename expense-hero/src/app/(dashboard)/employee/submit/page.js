// src/app/(dashboard)/employee/submit/page.js
"use client";
import { useState } from 'react';
import { getCurrencyCodes } from '../../../../services/CurrencyService';

export default function ExpenseSubmissionPage() {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // MOCK TOKEN/CONTEXT
    const MOCK_TOKEN = "Bearer YOUR_EMPLOYEE_JWT_TOKEN_HERE"; 

    const handleOCR = async (e) => {
        if (!receiptFile) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('receiptImage', receiptFile);

            const response = await fetch('/api/expenses/ocr', {
                method: 'POST',
                headers: { 'Authorization': MOCK_TOKEN },
                body: formData,
            });

            if (!response.ok) throw new Error("OCR failed. Try manual entry.");
            
            const data = await response.json();
            setAmount(data.amount);
            setCurrency(data.currency);
            setDate(data.date);
            setDescription(data.description);
            setCategory(data.category);
            alert("OCR successful! Fields auto-filled.");

        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (action) => {
        if (!amount || !currency || !description || !category || !date) {
            return alert("Please fill all fields.");
        }
        setLoading(true);

        const payload = { amount, currency, description, category, date, action };

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': MOCK_TOKEN
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(action + " failed.");

            const statusMsg = action === 'Submit' ? 'Expense submitted for approval!' : 'Expense saved as draft.';
            alert(statusMsg);

            // Clear form
            setAmount(''); setCurrency('USD'); setDescription(''); setCategory(''); setReceiptFile(null);
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <h1 className="text-3xl font-bold mb-6">Submit New Expense</h1>
            
            <div className="mb-6 border-b pb-4">
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
                    {loading ? 'Processing...' : 'Scan Receipt (OCR)'}
                </button>
            </div>

            <h2 className="text-xl font-semibold mb-3">2. Expense Details (Manual/Review)</h2>
            <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required className="p-3 border rounded dark:bg-gray-700" />
                
                <select value={currency} onChange={e => setCurrency(e.target.value)} required className="p-3 border rounded dark:bg-gray-700">
                    <option value="">Select Currency</option>
                    {getCurrencyCodes().map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <input type="date" placeholder="Date" value={date} onChange={e => setDate(e.target.value)} required className="p-3 border rounded dark:bg-gray-700" />
                <input type="text" placeholder="Category (e.g., Food, Travel)" value={category} onChange={e => setCategory(e.target.value)} required className="p-3 border rounded dark:bg-gray-700" />
            </div>
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full mt-4 p-3 border rounded dark:bg-gray-700"></textarea>

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
        </div>
    );
}