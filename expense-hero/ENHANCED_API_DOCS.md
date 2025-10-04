# Enhanced Expense Management API Documentation

## Overview
Complete API structure for expense management system with integrated currency conversion and country data.

## Base URL
```
http://localhost:3000/api
```

## External APIs Integrated
- **Countries & Currencies**: `https://restcountries.com/v3.1/all?fields=name,currencies`
- **Currency Conversion**: `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`

## New Currency & Country Endpoints

### 🌍 Country & Currency APIs

#### GET /api/countries
Get countries and their currencies data
```bash
# Get all countries with their currencies
GET /api/countries?type=countries

# Get detailed currency information with symbols
GET /api/countries?type=currencies  

# Get currency codes only (for dropdowns)
GET /api/countries?type=codes

# Get major currencies with current rates
GET /api/countries?type=major
```

**Response Example:**
```json
{
  "success": true,
  "message": "Countries with currencies retrieved successfully",
  "data": {
    "countries": [
      {
        "name": "United States",
        "officialName": "United States of America",
        "currencies": [
          {
            "code": "USD",
            "name": "United States Dollar",
            "symbol": "$"
          }
        ]
      }
    ]
  }
}
```

#### GET /api/currency/convert
Real-time currency conversion
```bash
# Get all exchange rates for USD
GET /api/currency/convert?base=USD

# Get specific exchange rate
GET /api/currency/convert?base=USD&target=EUR

# Convert specific amount
GET /api/currency/convert?base=USD&target=EUR&amount=100
```

#### POST /api/currency/convert
Convert currency with detailed response
```json
{
  "amount": 100.00,
  "fromCurrency": "USD",
  "toCurrency": "EUR"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Currency conversion completed",
  "data": {
    "conversion": {
      "originalAmount": 100.00,
      "convertedAmount": 85.23,
      "fromCurrency": "USD",
      "toCurrency": "EUR",
      "exchangeRate": 0.8523,
      "convertedAt": "2025-10-04T10:30:00.000Z"
    }
  }
}
```

## Enhanced Expense Management

### 💰 Enhanced Expense Submission
The expense submission now includes automatic currency conversion:

#### POST /api/expenses
```json
{
  "title": "Business Lunch",
  "description": "Client meeting",
  "amount": 45.99,
  "currency": "EUR",
  "category": "meals",
  "date": "2025-10-04",
  "vendor": "Restaurant Paris"
}
```

**Enhanced Response:**
```json
{
  "success": true,
  "message": "Expense submitted successfully",
  "data": {
    "expense": {
      "id": "expense_id",
      "title": "Business Lunch",
      "amount": 45.99,
      "currency": "EUR",
      "convertedAmount": 52.31,
      "baseCurrency": "USD",
      "status": "pending",
      "conversionInfo": {
        "originalAmount": 45.99,
        "exchangeRate": 1.137,
        "convertedAt": "2025-10-04T10:30:00.000Z"
      }
    }
  }
}
```

## Complete API Endpoints List

### 🔐 Authentication
- `POST /api/auth/signup` - Company & admin creation
- `POST /api/auth/login` - User authentication

### 👥 User Management (Admin)
- `GET /api/admin/users` - List company users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/rules` - Get approval rules
- `POST /api/admin/rules` - Create approval rules

### 👤 Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/change-password` - Change password

### 💸 Expense Management
- `GET /api/expenses` - Get expenses (filtered by role)
- `POST /api/expenses` - Submit expense (with auto-conversion)
- `GET /api/expenses/categories` - Get expense categories
- `GET /api/expenses/[expenseId]` - Get specific expense
- `PUT /api/expenses/[expenseId]` - Update expense
- `DELETE /api/expenses/[expenseId]` - Delete expense

### ✅ Manager Approvals
- `GET /api/manager/approvals` - Get pending approvals
- `POST /api/manager/approvals/[expenseId]/approve` - Approve expense
- `POST /api/manager/approvals/[expenseId]/reject` - Reject expense

### 📊 Reporting
- `GET /api/reports/expenses` - Generate reports with analytics

### 🌍 **NEW** Countries & Currencies
- `GET /api/countries` - Countries and currency data
- `GET /api/currency/convert` - Currency conversion
- `POST /api/currency/convert` - Convert with detailed response

## Currency Features

### 🔄 Automatic Conversion
- All expenses automatically converted to company base currency
- Real-time exchange rates from exchangerate-api.com
- Conversion history preserved for audit trail

### 🏦 Multi-Currency Support
- 170+ currencies supported
- Country-to-currency mapping
- Currency symbols and names included

### ⚡ Performance Optimized
- 1-hour caching for exchange rates
- Fallback data when APIs unavailable
- Efficient currency code lookups

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error information"
}
```

## Testing

### Test All APIs
```bash
node test-api.js          # Full test suite
node test-api.js signup   # Test registration
node test-api.js db       # Test database
node test-api.js routes   # Test all endpoints
```

### Test Currency APIs
```bash
# Test countries endpoint
curl "http://localhost:3000/api/countries?type=major"

# Test currency conversion
curl -X POST "http://localhost:3000/api/currency/convert" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "fromCurrency": "USD", "toCurrency": "EUR"}'
```

## Implementation Features

### ✅ Completed
- Real-time currency conversion integration
- Country and currency data APIs
- Enhanced expense submission with auto-conversion
- Comprehensive caching system
- Fallback data for offline scenarios
- Role-based expense filtering
- Manager approval workflow
- Detailed conversion audit trail

### 🔄 Next Steps
- Receipt OCR processing
- Email notifications
- Advanced reporting features
- Mobile app API optimizations

## Security Features
- JWT authentication on all protected routes
- Role-based access control
- Request validation and sanitization
- Audit trails for all financial operations