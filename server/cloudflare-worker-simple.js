/**
 * Simple Cloudflare Worker - Test Version
 * Direct responses without origin server dependency
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health check endpoint
    if (path === '/health' || path === '/api/health') {
      return new Response(JSON.stringify({
        success: true,
        message: 'Cloudflare Worker is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        cache: 'enabled'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
          'X-Cloudflare-Status': 'active'
        }
      });
    }

    // API endpoints - mock responses for testing
    if (path.startsWith('/api/')) {
      return handleApiRequest(path);
    }

    // Default response
    return new Response(JSON.stringify({
      success: true,
      message: 'Cloudflare Worker API',
      endpoints: [
        '/health - Health check',
        '/api/users - User data',
        '/api/outlets - Outlet data',
        '/api/visits - Visit data'
      ]
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
};

function handleApiRequest(path) {
  const mockData = {
    '/api/users': [
      { id: 1, username: 'admin-gis', access_level: 'admin' },
      { id: 2, username: 'user1', access_level: 'user' }
    ],
    '/api/outlets': [
      { id: 1, name: 'Outlet A', location: 'Jakarta' },
      { id: 2, name: 'Outlet B', location: 'Surabaya' }
    ],
    '/api/visits': [
      { id: 1, outlet_id: 1, user_id: 1, date: '2026-01-26' },
      { id: 2, outlet_id: 2, user_id: 2, date: '2026-01-26' }
    ]
  };

  const data = mockData[path] || { error: 'Endpoint not found' };
  
  return new Response(JSON.stringify({
    success: true,
    data: data,
    cached: true,
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      'X-Data-Source': 'cloudflare-worker-mock'
    }
  });
}

export async function scheduled(event, env, ctx) {
  console.log('Scheduled sync triggered');
  // Mock sync operation
  return new Response('Sync completed');
}
