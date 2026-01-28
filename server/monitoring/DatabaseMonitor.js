
// Database Monitoring and Analytics
const EventEmitter = require('events');
const database = require('../config/database-enhanced');

class DatabaseMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      connections: 0,
      queries: 0,
      errors: 0,
      slowQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.queryTimes = [];
    this.slowQueryThreshold = 1000; // 1 second
  }

  start() {
    this.setupQueryMonitoring();
    this.setupPerformanceMonitoring();
    this.startMetricsCollection();
  }

  setupQueryMonitoring() {
    const originalRun = database.run.bind(database);
    const originalGet = database.get.bind(database);
    const originalAll = database.all.bind(database);

    const monitorQuery = (queryFn, queryType) => {
      return async (sql, params = []) => {
        const startTime = Date.now();
        
        try {
          this.metrics.queries++;
          const result = await queryFn(sql, params);
          
          const queryTime = Date.now() - startTime;
          this.queryTimes.push(queryTime);
          
          if (queryTime > this.slowQueryThreshold) {
            this.metrics.slowQueries++;
            this.emit('slow-query', {
              sql,
              params,
              queryTime,
              type: queryType
            });
          }
          
          return result;
        } catch (error) {
          this.metrics.errors++;
          this.emit('query-error', {
            sql,
            params,
            error,
            type: queryType
          });
          throw error;
        }
      };
    };

    database.run = monitorQuery(originalRun, 'run');
    database.get = monitorQuery(originalGet, 'get');
    database.all = monitorQuery(originalAll, 'all');
  }

  setupPerformanceMonitoring() {
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000); // Every 30 seconds
  }

  async collectPerformanceMetrics() {
    try {
      // Get database size
      const dbSize = await this.getDatabaseSize();
      
      // Get table statistics
      const tableStats = await this.getTableStatistics();
      
      // Get connection pool status
      const connectionStatus = this.getConnectionStatus();
      
      const metrics = {
        timestamp: new Date().toISOString(),
        dbSize,
        tableStats,
        connectionStatus,
        queryMetrics: {
          totalQueries: this.metrics.queries,
          errors: this.metrics.errors,
          slowQueries: this.metrics.slowQueries,
          avgQueryTime: this.getAverageQueryTime()
        }
      };

      this.emit('metrics', metrics);
    } catch (error) {
      console.error('❌ Error collecting metrics:', error.message);
    }
  }

  async getDatabaseSize() {
    // Implementation to get database file size
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.resolve(database.config.filename);
    
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      return stats.size;
    }
    return 0;
  }

  async getTableStatistics() {
    const tables = ['menulogin', 'datauser', 'dataoutlet', 'datavisitmd', 'datavisitsales', 'visitaction'];
    const stats = {};

    for (const table of tables) {
      try {
        const result = await database.get(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result.count;
      } catch (error) {
        stats[table] = 0;
      }
    }

    return stats;
  }

  getConnectionStatus() {
    return {
      connected: !!database.db,
      environment: database.environment,
      config: database.config
    };
  }

  getAverageQueryTime() {
    if (this.queryTimes.length === 0) return 0;
    
    const sum = this.queryTimes.reduce((a, b) => a + b, 0);
    return sum / this.queryTimes.length;
  }

  startMetricsCollection() {
    setInterval(() => {
      this.emit('periodic-metrics', this.metrics);
    }, 60000); // Every minute
  }

  getMetrics() {
    return {
      ...this.metrics,
      avgQueryTime: this.getAverageQueryTime(),
      totalQueryTime: this.queryTimes.reduce((a, b) => a + b, 0)
    };
  }
}

module.exports = DatabaseMonitor;
