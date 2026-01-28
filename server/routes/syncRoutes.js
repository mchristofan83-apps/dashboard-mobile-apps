const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { triggerManualSync, getSyncLogs } = require('../utils/syncScheduler');
const cloudflareSync = require('../utils/cloudflareSync');

// All routes require authentication
router.use(verifyToken);

// Trigger manual sync (admin only)
router.post('/trigger', verifyAdmin, async (req, res) => {
  try {
    const result = await triggerManualSync();
    
    // Also sync to Cloudflare if enabled
    if (process.env.CLOUDFLARE_ENABLED === 'true') {
      cloudflareSync.syncAllToCloudflare().catch(err => 
        console.error('Cloudflare sync error:', err)
      );
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to trigger sync',
      error: error.message
    });
  }
});

// Get sync logs (admin only)
router.get('/logs', verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await getSyncLogs(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get sync logs',
      error: error.message
    });
  }
});

// Cloudflare sync endpoint (admin only)
router.post('/cloudflare', verifyAdmin, async (req, res) => {
  try {
    // Verify Cloudflare is configured
    const isConfigured = await cloudflareSync.verifyConfiguration();
    
    if (!isConfigured) {
      return res.status(400).json({
        success: false,
        message: 'Cloudflare is not properly configured'
      });
    }

    // Sync all tables to Cloudflare
    const result = await cloudflareSync.syncAllToCloudflare();
    
    res.json({
      success: true,
      message: 'Cloudflare sync completed',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to sync with Cloudflare',
      error: error.message
    });
  }
});

// Sync specific table to Cloudflare (admin only)
router.post('/cloudflare/:tableName', verifyAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    const typeMap = {
      'datauser': 'users',
      'dataoutlet': 'outlets',
      'datavisitmd': 'visits_md',
      'datavisitsales': 'visits_sales',
      'visitaction': 'visit_actions'
    };

    const type = typeMap[tableName];
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Invalid table name'
      });
    }

    const result = await cloudflareSync.syncTableToCloudflare(tableName, type);
    
    res.json({
      success: result.success,
      message: `Table ${tableName} sync ${result.success ? 'completed' : 'failed'}`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to sync table with Cloudflare',
      error: error.message
    });
  }
});

// Get Cloudflare status (admin only)
router.get('/cloudflare/status', verifyAdmin, async (req, res) => {
  try {
    const isConfigured = await cloudflareSync.verifyConfiguration();
    
    res.json({
      success: true,
      cloudflareEnabled: process.env.CLOUDFLARE_ENABLED === 'true',
      cloudflareConfigured: isConfigured,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID ? '***' : 'Not set',
      namespaceId: process.env.CLOUDFLARE_KV_NAMESPACE_ID ? '***' : 'Not set'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check Cloudflare status',
      error: error.message
    });
  }
});

module.exports = router;
