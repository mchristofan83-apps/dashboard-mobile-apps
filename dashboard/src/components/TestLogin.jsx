
import React, { useState } from 'react';
import axios from 'axios';

const TestLogin = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🔍 Testing login API call...');
      console.log('🔗 URL: http://localhost:8000/api/auth/login');
      console.log('📝 Data: { username: "admin-gis", password: "gis2026" }');
      
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        username: 'admin-gis',
        password: 'gis2026'
      });
      
      console.log('✅ Response:', response.data);
      setResult(`✅ Success: ${response.data.message}`);
      
    } catch (error) {
      console.error('❌ Error:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🧪 Login API Test</h2>
      <p>Click the button below to test the login API directly:</p>
      
      <button 
        onClick={testLogin}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Login API'}
      </button>
      
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          {result}
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Open browser developer tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click the "Test Login API" button</li>
          <li>Check the console logs for detailed information</li>
        </ol>
      </div>
    </div>
  );
};

export default TestLogin;
