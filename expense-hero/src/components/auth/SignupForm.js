// SignupForm component
'use client';

import { useState, useEffect } from 'react';
import { getCurrencyCodes } from '../../services/CurrencyService'; 
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    baseCurrency: 'USD'
  });
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fetch currency codes for the dropdown
    getCurrencyCodes().then(codes => {
        setCurrencies(codes);
        if (codes.length > 0) {
            setFormData(prev => ({ ...prev, baseCurrency: codes[0] }));
        }
    });
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Error: Passwords do not match.');
      return;
    }

    setLoading(true);

    const payload = {
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`, // Send combined name
        companyName: formData.companyName,
        baseCurrency: formData.baseCurrency
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed.');
      }

      // Success: Save token and redirect
      localStorage.setItem('authToken', data.token);
      setMessage(`Success! Admin account created for ${data.company.name}. Redirecting...`);
      router.push('/admin/users');

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form p-6 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create Company & Admin Account</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full p-2 border rounded" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email (Admin)</label>
        <input type="email" id="email" value={formData.email} onChange={handleInputChange} required className="w-full p-2 border rounded" />
      </div>

      <div className="form-group">
        <label htmlFor="companyName">Company Name</label>
        <input type="text" id="companyName" value={formData.companyName} onChange={handleInputChange} required className="w-full p-2 border rounded" />
      </div>

      <div className="form-group">
        <label htmlFor="baseCurrency">Base Currency</label>
        <select id="baseCurrency" value={formData.baseCurrency} onChange={handleInputChange} required className="w-full p-2 border rounded">
          {currencies.map(currency => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" value={formData.password} onChange={handleInputChange} required className="w-full p-2 border rounded" />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required className="w-full p-2 border rounded" />
      </div>

      <button type="submit" disabled={loading} className="w-full mt-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">
        {loading ? 'Creating...' : 'Create Account'}
      </button>
      {message && <p className={`mt-4 text-center text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
    </form>
  );
}
