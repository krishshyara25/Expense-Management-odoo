// SignupForm component
'use client';

import { useState } from 'react';
import CurrencyService from '../../services/CurrencyService';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    country: '',
    currency: 'USD'
  });

  const countries = CurrencyService.getCountryData();

  const handleCountryChange = (countryCode) => {
    const currency = CurrencyService.getCurrencyByCountry(countryCode);
    setFormData(prev => ({
      ...prev,
      country: countryCode,
      currency
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Signup logic will be implemented here
    console.log('Signup form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>Create Account</h2>
      
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          value={formData.firstName}
          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          value={formData.lastName}
          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="companyName">Company Name</label>
        <input
          type="text"
          id="companyName"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="country">Country</label>
        <select
          id="country"
          value={formData.country}
          onChange={(e) => handleCountryChange(e.target.value)}
          required
        >
          <option value="">Select Country</option>
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="currency">Currency</label>
        <input
          type="text"
          id="currency"
          value={formData.currency}
          readOnly
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
        />
      </div>

      <button type="submit">Create Account</button>
    </form>
  );
}