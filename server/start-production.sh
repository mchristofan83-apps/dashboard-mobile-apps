#!/bin/bash

# Production Server Startup Script

echo "🚀 Starting Production Server..."
echo "================================"

# Create necessary directories
mkdir -p logs
mkdir -p backups
mkdir -p uploads

# Set environment
export NODE_ENV=production

# Start server with PM2
pm2 start ecosystem.config.js --env production

# Setup log rotation
pm2 install pm2-logrotate

# Enable monitoring
pm2 monit

echo "✅ Production server started!"
echo "📊 Dashboard: https://dashboard.gisconnect.online"
echo "🔗 API: https://api.gisconnect.online"
echo "🖥️  Server: https://server.gisconnect.online"
