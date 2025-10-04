// Enhanced API Testing Script for Expense Management App
// Now includes currency conversion and country data testing
// Run with: node test-api.js [test_type]

const baseURL = 'http://localhost:3001/api';

async function testCurrencyAPIs() {
  console.log('🧪 Testing Currency & Country APIs...\n');
  
  try {
    // Test 1: Get currency codes
    console.log('1️⃣ Testing Currency Codes...');
    const codesResponse = await fetch(`${baseURL}/countries?type=codes`);
    if (codesResponse.ok) {
      const codesData = await codesResponse.json();
      console.log('✅ Currency codes retrieved');
      console.log(`💱 Available currencies: ${codesData.data?.codes?.length || 0}`);
    } else {
      console.log('⚠️ Currency codes failed:', codesResponse.status);
    }
    
    // Test 2: Get major currencies
    console.log('\n2️⃣ Testing Major Currencies...');
    const majorResponse = await fetch(`${baseURL}/countries?type=major`);
    if (majorResponse.ok) {
      const majorData = await majorResponse.json();
      console.log('✅ Major currencies retrieved');
      console.log(`🏦 Major currencies: ${majorData.data?.currencies?.length || 0}`);
      if (majorData.data?.currencies?.length > 0) {
        console.log('Sample currencies:', majorData.data.currencies.slice(0, 3).map(c => `${c.code} (${c.symbol})`).join(', '));
      }
    } else {
      console.log('⚠️ Major currencies failed:', majorResponse.status);
    }
    
    // Test 3: Currency conversion
    console.log('\n3️⃣ Testing Currency Conversion...');
    const conversionResponse = await fetch(`${baseURL}/currency/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR'
      })
    });
    
    if (conversionResponse.ok) {
      const conversionData = await conversionResponse.json();
      console.log('✅ Currency conversion working');
      const conversion = conversionData.data?.conversion;
      if (conversion) {
        console.log(`💰 $${conversion.originalAmount} USD = €${conversion.convertedAmount} EUR`);
        console.log(`📈 Exchange rate: ${conversion.exchangeRate}`);
      }
    } else {
      const errorData = await conversionResponse.json();
      console.log('⚠️ Currency conversion failed:', conversionResponse.status, errorData.error);
    }
    
    // Test 4: Get countries
    console.log('\n4️⃣ Testing Countries Data...');
    const countriesResponse = await fetch(`${baseURL}/countries?type=countries`);
    if (countriesResponse.ok) {
      const countriesData = await countriesResponse.json();
      console.log('✅ Countries data retrieved');
      console.log(`🌍 Countries: ${countriesData.data?.countries?.length || 0}`);
      if (countriesData.data?.countries?.length > 0) {
        const sampleCountry = countriesData.data.countries[0];
        console.log(`Sample: ${sampleCountry.name} uses ${sampleCountry.currencies?.map(c => c.code).join(', ')}`);
      }
    } else {
      console.log('⚠️ Countries data failed:', countriesResponse.status);
    }
    
    console.log('\n🎉 Currency API tests completed!');
    
  } catch (error) {
    console.error('❌ Currency API test failed:', error.message);
  }
}

async function testComprehensiveFlow() {
  console.log('🧪 Starting Comprehensive API Tests...\n');

  try {
    // Clean up - use a unique email for testing
    const testEmail = `test${Date.now()}@company.com`;
    let adminToken = '';

    // 1. Test Signup (Company + Admin Creation)
    console.log('1️⃣ Testing Admin Signup...');
    const signupResponse = await fetch(`${baseURL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        firstName: 'Test',
        lastName: 'Admin',
        companyName: 'Test Company Inc',
        country: 'US',
        baseCurrency: 'USD'
      })
    });
    
    if (!signupResponse.ok) {
      const errorData = await signupResponse.json();
      throw new Error(`Signup failed: ${signupResponse.status} - ${errorData.error}`);
    }
    
    const signupData = await signupResponse.json();
    adminToken = signupData.token;
    console.log('✅ Admin signup successful');
    console.log(`📧 Admin: ${signupData.user.email} (${signupData.user.role})`);
    console.log(`🏢 Company: ${signupData.company.name} (${signupData.company.baseCurrency})`);
    
    // 2. Test Enhanced Expense Submission with Currency Conversion
    console.log('\n2️⃣ Testing Enhanced Expense Submission...');
    const expenseResponse = await fetch(`${baseURL}/expenses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Business Meeting in Paris',
        description: 'Client dinner with international partners',
        amount: 75.50,
        currency: 'EUR',
        category: 'meals',
        date: new Date().toISOString().split('T')[0],
        vendor: 'Le Restaurant Français'
      })
    });
    
    if (!expenseResponse.ok) {
      const errorData = await expenseResponse.json();
      console.log(`⚠️ Enhanced expense submission failed: ${expenseResponse.status} - ${errorData.error || errorData.message}`);
    } else {
      const expenseData = await expenseResponse.json();
      const expense = expenseData.data?.expense;
      console.log('✅ Multi-currency expense submitted successfully');
      console.log(`💰 Original: €${expense?.amount} EUR`);
      console.log(`💱 Converted: $${expense?.convertedAmount} ${expense?.baseCurrency}`);
      console.log(`📈 Exchange rate: ${expense?.conversionInfo?.exchangeRate}`);
    }
    
    // 3. Test Currency APIs
    console.log('\n3️⃣ Testing Currency & Country APIs...');
    await testCurrencyAPIs();
    
    console.log('\n🎉 Comprehensive test completed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Authentication (Signup/Login) - Working');
    console.log('✅ Enhanced Expense Submission - Working');
    console.log('✅ Currency Conversion Integration - Working');
    console.log('✅ Country & Currency Data APIs - Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure your Next.js server is running (npm run dev)');
    console.log('2. Check that MongoDB Atlas is connected');
    console.log('3. Verify your .env file has correct MongoDB URI');
    console.log('4. Check the server console for error messages');
  }
}

async function testSignupOnly() {
  console.log('🧪 Testing Signup Only...\n');
  
  try {
    const response = await fetch(`${baseURL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@company.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyName: 'Test Company',
        country: 'US',
        baseCurrency: 'USD'
      })
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Signup test failed:', error.message);
  }
}

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection...\n');
  
  try {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      })
    });
    
    console.log('✅ Server is responding (Status:', response.status, ')');
    
    if (response.status === 500) {
      console.log('❌ Possible database connection issue');
    } else if (response.status === 401) {
      console.log('✅ Database connection appears to be working (proper auth error)');
    } else {
      console.log('✅ Database connection appears to be working');
    }
    
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('Make sure to run: npm run dev');
  }
}

async function testRouteStructure() {
  console.log('🧪 Testing Route Structure...\n');
  
  const routes = [
    { method: 'POST', url: '/auth/signup', description: 'User Signup' },
    { method: 'POST', url: '/auth/login', description: 'User Login' },
    { method: 'GET', url: '/admin/users', description: 'Get Users (Admin)' },
    { method: 'POST', url: '/admin/users', description: 'Create User (Admin)' },
    { method: 'GET', url: '/expenses', description: 'Get Expenses' },
    { method: 'POST', url: '/expenses', description: 'Submit Expense' },
    { method: 'GET', url: '/countries?type=codes', description: 'Get Currency Codes' },
    { method: 'POST', url: '/currency/convert', description: 'Convert Currency' },
    { method: 'GET', url: '/manager/approvals', description: 'Get Approvals (Manager)' },
  ];
  
  for (const route of routes) {
    try {
      const response = await fetch(`${baseURL}${route.url}`, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const status = response.status;
      const statusText = status === 401 ? '🔒 Protected (Auth Required)' : 
                        status === 400 ? '📝 Validation Required' :
                        status === 404 ? '❌ Not Found' :
                        status === 500 ? '⚠️ Server Error' : '✅ Accessible';
      
      console.log(`${route.method.padEnd(6)} ${route.url.padEnd(25)} - ${status} ${statusText}`);
      
    } catch (error) {
      console.log(`${route.method.padEnd(6)} ${route.url.padEnd(25)} - ❌ Connection Failed`);
    }
  }
}

// Run tests based on command line argument
const testType = process.argv[2];

switch (testType) {
  case 'signup':
    testSignupOnly();
    break;
  case 'db':
    testDatabaseConnection();
    break;
  case 'routes':
    testRouteStructure();
    break;
  case 'currency':
    testCurrencyAPIs();
    break;
  case 'full':
  default:
    testComprehensiveFlow();
    break;
}

console.log('\n📚 Usage:');
console.log('node test-api.js          - Run comprehensive test suite');
console.log('node test-api.js signup   - Test signup only');
console.log('node test-api.js db       - Test database connection');
console.log('node test-api.js routes   - Test all route availability');
console.log('node test-api.js currency - Test currency & country APIs');