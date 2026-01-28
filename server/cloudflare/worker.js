
// Cloudflare Worker for Dashboard API
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // API routes
  if (url.pathname.startsWith('/api/')) {
    // Forward to backend server
    const backendUrl = 'https://server.gisconnect.online' + url.pathname + url.search
    
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
    
    // Add CORS headers
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Access-Control-Allow-Origin', 'https://dashboard.gisconnect.online')
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    newResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    
    return newResponse
  }
  
  // Static assets and dashboard
  return fetch('https://dashboard.gisconnect.online' + url.pathname + url.search)
}
