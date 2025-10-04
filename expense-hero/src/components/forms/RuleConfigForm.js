// RuleConfigForm component
'use client';

import { useState } from 'react';

export default function RuleConfigForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditions: {
      minAmount: '',
      maxAmount: '',
      categories: [],
      departments: []
    },
    approvers: [],
    autoApprove: false,
    ...initialData
  });

  const categories = [
    'travel',
    'meals',
    'supplies',
    'training',
    'entertainment',
    'other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCategoryChange = (category, checked) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        categories: checked 
          ? [...prev.conditions.categories, category]
          : prev.conditions.categories.filter(c => c !== category)
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="rule-config-form">
      <h2>Configure Approval Rule</h2>

      <div className="form-group">
        <label htmlFor="name">Rule Name</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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

      <div className="form-section">
        <h3>Conditions</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minAmount">Minimum Amount</label>
            <input
              type="number"
              id="minAmount"
              step="0.01"
              value={formData.conditions.minAmount}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                conditions: { ...prev.conditions, minAmount: e.target.value }
              }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxAmount">Maximum Amount</label>
            <input
              type="number"
              id="maxAmount"
              step="0.01"
              value={formData.conditions.maxAmount}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                conditions: { ...prev.conditions, maxAmount: e.target.value }
              }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Categories</label>
          <div className="checkbox-group">
            {categories.map(category => (
              <label key={category} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.conditions.categories.includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.autoApprove}
            onChange={(e) => setFormData(prev => ({ ...prev, autoApprove: e.target.checked }))}
          />
          Auto-approve expenses matching this rule
        </label>
      </div>

      <button type="submit">
        Save Rule
      </button>
    </form>
  );
}