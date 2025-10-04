// Simple API Testing Script
// Run this with: node test-api.js (make sure your server is running first)

const baseURL = 'http://localhost:3000/api';

async function testBasicFlow() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // 1. Test signup
    console.log('1️⃣ Testing Signup...');
    const signupResponse = await fetch(`${baseURL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@company.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyName: 'Test Company',
        country: 'US'
      })
    });
    
    if (!signupResponse.ok) {
      throw new Error(`Signup failed: ${signupResponse.status}`);
    }
    
    const signupData = await signupResponse.json();
    console.log('✅ Signup successful:', signupData.message);
    console.log('📧 User:', signupData.user?.email, '- Role:', signupData.user?.role);
    
    // 2. Test login
    console.log('\n2️⃣ Testing Login...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@company.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.message);
    console.log('🔑 Token received:', loginData.token ? 'Yes' : 'No');
    
    // 3. Test protected route (admin users endpoint)
    console.log('\n3️⃣ Testing Protected Route (Admin Users)...');
    const usersResponse = await fetch(`${baseURL}/admin/users`, {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!usersResponse.ok) {
      throw new Error(`Users endpoint failed: ${usersResponse.status}`);
    }
    
    const usersData = await usersResponse.json();
    console.log('✅ Protected route accessible');
    console.log('👥 Users count:', usersData.users?.length || 0);
    
    // 4. Test expense submission
    console.log('\n4️⃣ Testing Expense Submission...');
    const expenseResponse = await fetch(`${baseURL}/expenses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        title: 'Test Business Lunch',
        description: 'Client meeting lunch',
        amount: 45.99,
        currency: 'USD',
        category: 'meals',
        date: new Date().toISOString().split('T')[0],
        vendor: 'Test Restaurant'
      })
    });
    
    if (!expenseResponse.ok) {
      console.log('⚠️ Expense submission failed:', expenseResponse.status);
      const errorData = await expenseResponse.json();
      console.log('Error:', errorData.error);
    } else {
      const expenseData = await expenseResponse.json();
      console.log('✅ Expense submitted:', expenseData.message);
    }
    
    // 5. Test expense history
    console.log('\n5️⃣ Testing Expense History...');
    const historyResponse = await fetch(`${baseURL}/expenses`, {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!historyResponse.ok) {
      console.log('⚠️ Expense history failed:', historyResponse.status);
    } else {
      const historyData = await historyResponse.json();
      console.log('✅ Expense history retrieved');
      console.log('📊 Expenses count:', historyData.expenses?.length || 0);
    }
    
    console.log('\n🎉 All basic tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure your Next.js server is running (npm run dev)');
    console.log('2. Check that MongoDB is connected');
    console.log('3. Verify your .env file has correct values');
    console.log('4. Check the server console for error messages');
  }
}

// Test individual endpoints
async function testSignupOnly() {
  console.log('🧪 Testing Signup Only...\n');
  
  try {
    const response = await fetch(`${baseURL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@company.com`, // Unique email
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyName: 'Test Company',
        country: 'US'
      })
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', data);
    
  } catch (error) {
    console.error('❌ Signup test failed:', error.message);
  }
}

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection...\n');
  
  try {
    // This will test if the server can handle requests
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      })
    });
    
    // Even if login fails, a proper response means the server and DB are working
    console.log('✅ Server is responding (Status:', response.status, ')');
    
    if (response.status === 500) {
      console.log('❌ Possible database connection issue');
    } else {
      console.log('✅ Database connection appears to be working');
    }
    
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('Make sure to run: npm run dev');
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
  case 'full':
  default:
    testBasicFlow();
    break;
}

console.log('\n📚 Usage:');
console.log('node test-api.js       - Run full test suite');
console.log('node test-api.js signup - Test signup only');
console.log('node test-api.js db     - Test database connection');