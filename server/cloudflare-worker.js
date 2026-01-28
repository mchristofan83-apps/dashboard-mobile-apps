/**
 * Cloudflare Worker - API Proxy and Caching Layer
 * Deploy to Cloudflare Workers for global edge distribution
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route health checks through KV cache
    if (path === '/api/health') {
      return await handleHealthCheck(request, env);
    }

    // Route API requests to origin server with caching
    if (path.startsWith('/api/')) {
      return await handleApiRequest(request, env, ctx);
    }

    // Serve static assets with aggressive caching
    if (path.startsWith('/uploads/')) {
      return await handleStaticAssets(request, env, ctx);
    }

    // Default: proxy to origin
    return await proxyToOrigin(request, env);
  }
};

/**
 * Handle health checks with caching
 */
async function handleHealthCheck(request, env, ctx) {
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cache = caches.default;

  // Check cache first
  let response = await cache.match(cacheKey);
  if (response) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        'X-Cache-Status': 'HIT'
      }
    });
  }

  // Fetch from origin
  response = await proxyToOrigin(request, env);

  // Cache successful responses for 5 minutes
  if (response.status === 200) {
    const cacheHeaders = {
      ...Object.fromEntries(response.headers),
      'Cache-Control': 'public, max-age=300',
      'X-Cache-Status': 'MISS'
    };

    const cachedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: cacheHeaders
    });

    ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
  }

  return response;
}

/**
 * Handle API requests with intelligent caching
 */
async function handleApiRequest(request, env, ctx) {
  // Don't cache POST, PUT, DELETE requests
  if (request.method !== 'GET') {
    return await proxyToOrigin(request, env);
  }

  const cacheKey = new Request(request.url, { method: 'GET' });
  const cache = caches.default;

  // Check cache
  let response = await cache.match(cacheKey);
  if (response) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        'X-Cache-Status': 'HIT'
      }
    });
  }

  // Fetch from origin
  response = await proxyToOrigin(request, env);

  // Cache GET responses with 5 minute TTL
  if (response.status === 200) {
    const cacheHeaders = {
      ...Object.fromEntries(response.headers),
      'Cache-Control': 'public, max-age=300',
      'X-Cache-Status': 'MISS'
    };

    const cachedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: cacheHeaders
    });

    ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
  }

  return response;
}

/**
 * Handle static assets with long cache TTL
 */
async function handleStaticAssets(request, env, ctx) {
  const cacheKey = new Request(request.url, { method: 'GET' });
  const cache = caches.default;

  // Check cache
  let response = await cache.match(cacheKey);
  if (response) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        'X-Cache-Status': 'HIT'
      }
    });
  }

  // Fetch from origin
  response = await proxyToOrigin(request, env);

  // Cache assets for 30 days
  if (response.status === 200) {
    const cacheHeaders = {
      ...Object.fromEntries(response.headers),
      'Cache-Control': 'public, max-age=2592000',
      'X-Cache-Status': 'MISS'
    };

    const cachedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: cacheHeaders
    });

    ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
  }

  return response;
}

/**
 * Proxy request to origin server
 */
async function proxyToOrigin(request, env) {
  const originUrl = env.ORIGIN_SERVER || 'http://localhost:8000';
  const url = new URL(request.url);
  const targetUrl = new URL(url.pathname + url.search, originUrl);

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: new Headers(request.headers),
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
  });

  // Add custom headers for edge identification
  modifiedRequest.headers.set('X-Forwarded-By', 'Cloudflare-Worker');
  modifiedRequest.headers.set('X-Request-ID', crypto.randomUUID());

  try {
    const response = await fetch(modifiedRequest, {
      cf: {
        cacheEverything: true,
        cacheTtl: 300
      }
    });

    return response;
  } catch (error) {
    return new Response('Service Unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Handle scheduled events for sync
 */
export async function scheduled(event, env, ctx) {
  ctx.waitUntil(syncWithOrigin(env));
}

/**
 * Trigger sync with origin server
 */
async function syncWithOrigin(env) {
  const originUrl = env.ORIGIN_SERVER || 'http://localhost:8000';

  try {
    const response = await fetch(`${originUrl}/api/sync/trigger`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SYNC_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Sync triggered:', data);
  } catch (error) {
    console.error('Error triggering sync:', error);
  }
}
