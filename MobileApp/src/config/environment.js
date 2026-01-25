import Constants from 'expo-constants';

// Get the device's local IP address for development
// You can find your computer's IP address by running:
// Windows: ipconfig
// Mac/Linux: ifconfig or ip addr

// IMPORTANT: Update this IP address to match your computer's local network IP
const DEV_API_URL = 'http://192.168.0.43:8000/api';

// For production, use your actual server URL
const PROD_API_URL = 'https://your-production-server.com/api';

// Automatically detect environment
const ENV = {
  dev: {
    apiUrl: DEV_API_URL,
  },
  prod: {
    apiUrl: PROD_API_URL,
  },
};

// Function to get current environment config
const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars;

// Helper function to get API URL
export const getApiUrl = () => {
  return getEnvVars().apiUrl;
};

// Instructions for updating the API URL:
// 1. Find your computer's IP address:
//    - Windows: Open Command Prompt and run 'ipconfig'
//    - Mac: Open Terminal and run 'ifconfig' or 'ipconfig getifaddr en0'
//    - Linux: Open Terminal and run 'ip addr' or 'hostname -I'
// 
// 2. Look for your local network IP (usually starts with 192.168.x.x or 10.0.x.x)
// 
// 3. Update the DEV_API_URL above with your IP address
//    Example: const DEV_API_URL = 'http://192.168.1.100:3001/api';
// 
// 4. Make sure your computer and mobile device are on the same WiFi network
// 
// 5. Ensure your firewall allows connections on port 3001
