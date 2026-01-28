// Authentication Flow Test
// This script tests the complete JWT authentication system

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test configuration
const testCredentials = {
  username: 'admin-gis',
  password: 'gis2026'
};

let authToken = '';

// Test utility functions
const log = (message, type = 'INFO') => {
  console.log(`[${type}] ${message}`);
};

const logSuccess = (message) => log(message, 'SUCCESS');
const logError = (message) => log(message, 'ERROR');

// Test functions
async function testLogin() {
  log('Testing login endpoint...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      logSuccess('Login successful - Token received');
      log(`User data: ${JSON.stringify(response.data.user)}`);
      return true;
    } else {
      logError('Login failed - No token received');
      return false;
    }
  } catch (error) {
    logError(`Login error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testProtectedEndpoint() {
  log('Testing protected endpoint with token...');
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logSuccess('Protected endpoint accessible');
    return true;
  } catch (error) {
    logError(`Protected endpoint error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testInvalidToken() {
  log('Testing with invalid token...');
  try {
    await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    logError('Invalid token was accepted (this should not happen)');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Invalid token properly rejected');
      return true;
    } else {
      logError(`Unexpected error with invalid token: ${error.message}`);
      return false;
    }
  }
}

async function testNoToken() {
  log('Testing without token...');
  try {
    await axios.get(`${API_BASE_URL}/dashboard/stats`);
    
    logError('Request without token was accepted (this should not happen)');
    return false;
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      logSuccess('Request without token properly rejected');
      return true;
    } else {
      logError(`Unexpected error without token: ${error.message}`);
      return false;
    }
  }
}

async function testRateLimiting() {
  log('Testing rate limiting...');
  let rateLimitHit = false;
  
  // Make multiple rapid requests
  for (let i = 0; i < 6; i++) {
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimitHit = true;
        break;
      }
    }
  }
  
  if (rateLimitHit) {
    logSuccess('Rate limiting is working');
    return true;
  } else {
    logError('Rate limiting not triggered');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('Starting Authentication System Tests');
  log('=====================================');
  
  const tests = [
    { name: 'Login Test', fn: testLogin },
    { name: 'Protected Endpoint Test', fn: testProtectedEndpoint },
    { name: 'Invalid Token Test', fn: testInvalidToken },
    { name: 'No Token Test', fn: testNoToken },
    { name: 'Rate Limiting Test', fn: testRateLimiting }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) passedTests++;
  }
  
  log('\n=====================================');
  log(`Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    logSuccess('All authentication tests passed! 🎉');
  } else {
    logError('Some tests failed. Please check the authentication system.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testLogin,
  testProtectedEndpoint,
  testInvalidToken,
  testNoToken,
  testRateLimiting
};
