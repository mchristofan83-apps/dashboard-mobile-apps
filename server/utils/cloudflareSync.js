const axios = require('axios');
const { getDatabase, getAllRows } = require('../database/init');

/**
 * Cloudflare Integration for distributed sync
 * Handles synchronization with Cloudflare KV and Workers
 */

class CloudflareSync {
  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN;
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    this.namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}`;
    this.headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Store data in Cloudflare KV
   * @param {string} key - KV key
   * @param {object} value - Data to store
   * @param {number} expirationTtl - Optional TTL in seconds
   */
  async storeInKV(key, value, expirationTtl = 86400) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/values/${encodeURIComponent(key)}`,
        JSON.stringify(value),
        {
          headers: {
            ...this.headers,
            'Content-Type': 'application/octet-stream'
          },
          params: {
            expiration_ttl: expirationTtl
          }
        }
      );

      console.log(`Stored in Cloudflare KV: ${key}`);
      return response.data;
    } catch (error) {
      console.error(`Error storing in Cloudflare KV (${key}):`, error.message);
      throw error;
    }
  }

  /**
   * Retrieve data from Cloudflare KV
   * @param {string} key - KV key
   */
  async getFromKV(key) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/values/${encodeURIComponent(key)}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error retrieving from Cloudflare KV (${key}):`, error.message);
      throw error;
    }
  }

  /**
   * Delete data from Cloudflare KV
   * @param {string} key - KV key
   */
  async deleteFromKV(key) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/values/${encodeURIComponent(key)}`,
        { headers: this.headers }
      );

      console.log(`Deleted from Cloudflare KV: ${key}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting from Cloudflare KV (${key}):`, error.message);
      throw error;
    }
  }

  /**
   * Sync database records to Cloudflare KV
   * @param {string} tableName - Table to sync
   * @param {string} type - Type of data (users, outlets, visits, etc.)
   */
  async syncTableToCloudflare(tableName, type) {
    try {
      console.log(`Syncing ${tableName} to Cloudflare KV...`);

      const db = getDatabase(tableName);
      const records = await getAllRows(db, `SELECT * FROM ${tableName}`, []);

      // Store in batches to avoid rate limits
      const batchSize = 25;
      let synced = 0;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        const storePromises = batch.map(record =>
          this.storeInKV(
            `${type}:${record.id || record.user_id}`,
            record,
            86400 // 24 hours TTL
          )
        );

        await Promise.all(storePromises);
        synced += batch.length;
        console.log(`Synced ${synced}/${records.length} records to Cloudflare`);

        // Delay between batches to respect rate limits
        if (i + batchSize < records.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Store metadata
      await this.storeInKV(
        `sync:${type}:${new Date().toISOString()}`,
        {
          type,
          tableName,
          recordCount: records.length,
          syncedAt: new Date().toISOString()
        },
        604800 // 7 days TTL
      );

      return {
        success: true,
        type,
        recordsSynced: records.length
      };
    } catch (error) {
      console.error(`Error syncing ${tableName} to Cloudflare:`, error.message);
      return {
        success: false,
        type,
        error: error.message
      };
    }
  }

  /**
   * Sync all tables to Cloudflare
   */
  async syncAllToCloudflare() {
    const tables = [
      { name: 'datauser', type: 'users' },
      { name: 'dataoutlet', type: 'outlets' },
      { name: 'datavisitmd', type: 'visits_md' },
      { name: 'datavisitsales', type: 'visits_sales' },
      { name: 'visitaction', type: 'visit_actions' }
    ];

    const results = [];

    for (const table of tables) {
      const result = await this.syncTableToCloudflare(table.name, table.type);
      results.push(result);
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      results
    };
  }

  /**
   * Setup Cloudflare cache headers for response
   */
  setupCacheHeaders(res, ttl = 3600) {
    res.set('Cache-Control', `public, max-age=${ttl}`);
    res.set('CDN-Cache-Control', `max-age=${ttl}`);
    res.set('Cloudflare-Cache-Control', `max-age=${ttl}`);
  }

  /**
   * Verify Cloudflare configuration
   */
  async verifyConfiguration() {
    try {
      const response = await axios.get(
        'https://api.cloudflare.com/client/v4/user/tokens/verify',
        { headers: this.headers }
      );

      console.log('Cloudflare configuration verified:', response.data.result.status);
      return response.data.result.status === 'active';
    } catch (error) {
      console.error('Error verifying Cloudflare configuration:', error.message);
      return false;
    }
  }
}

module.exports = new CloudflareSync();
