// Dashboard Monitoring Service
import config from '../config/production';

class MonitoringService {
  constructor() {
    this.metrics = {
      pageViews: 0,
      userActions: 0,
      errors: 0,
      performance: {
        loadTime: 0,
        renderTime: 0,
        apiResponseTime: 0
      },
      resources: {
        memoryUsage: 0,
        networkRequests: 0,
        cacheHits: 0,
        cacheMisses: 0
      }
    };
    this.startTime = Date.now();
    this.observers = [];
  }

  initialize() {
    this.setupPerformanceObserver();
    this.setupErrorTracking();
    this.setupUserActionTracking();
    this.startMetricsCollection();
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.handlePerformanceEntry(entry);
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'paint'] });
      this.observers.push(observer);
    }
  }

  handlePerformanceEntry(entry) {
    switch (entry.entryType) {
      case 'navigation':
        this.metrics.performance.loadTime = entry.loadEventEnd - entry.loadEventStart;
        break;
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.performance.renderTime = entry.startTime;
        }
        break;
      case 'resource':
        this.metrics.resources.networkRequests++;
        break;
    }
  }

  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack
      });
    });
  }

  setupUserActionTracking() {
    document.addEventListener('click', (event) => {
      this.trackUserAction({
        type: 'click',
        target: event.target.tagName,
        element: event.target.className || event.target.id,
        timestamp: Date.now()
      });
    });

    document.addEventListener('submit', (event) => {
      this.trackUserAction({
        type: 'submit',
        form: event.target.className || event.target.id,
        timestamp: Date.now()
      });
    });
  }

  trackPageView(path) {
    this.metrics.pageViews++;
    
    if (config.analytics.enabled) {
      this.sendAnalytics({
        type: 'pageview',
        path,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });
    }
  }

  trackUserAction(action) {
    this.metrics.userActions++;
    
    if (config.analytics.enabled) {
      this.sendAnalytics({
        type: 'useraction',
        action,
        timestamp: Date.now()
      });
    }
  }

  trackError(error) {
    this.metrics.errors++;
    
    if (config.monitoring.errorReporting) {
      this.sendErrorReport(error);
    }
  }

  trackApiResponse(url, duration, status) {
    this.metrics.performance.apiResponseTime = duration;
    
    if (config.monitoring.performanceTracking) {
      this.sendPerformanceMetrics({
        type: 'api',
        url,
        duration,
        status,
        timestamp: Date.now()
      });
    }
  }

  startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, config.monitoring.metricsInterval);
  }

  collectMetrics() {
    // Collect memory usage
    if ('memory' in performance) {
      this.metrics.resources.memoryUsage = performance.memory.usedJSHeapSize;
    }

    // Send metrics to monitoring service
    if (config.monitoring.enabled) {
      this.sendMetrics();
    }
  }

  sendMetrics() {
    const metrics = {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      timestamp: Date.now()
    };

    // Send to monitoring endpoint
    fetch(`${config.api.baseURL}/monitoring/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(metrics)
    }).catch(error => {
      console.error('❌ Failed to send metrics:', error);
    });
  }

  sendAnalytics(data) {
    // Send to analytics endpoint
    fetch(`${config.api.baseURL}/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).catch(error => {
      console.error('❌ Failed to send analytics:', error);
    });
  }

  sendErrorReport(error) {
    // Send to error reporting endpoint
    fetch(`${config.api.baseURL}/monitoring/errors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(error)
    }).catch(error => {
      console.error('❌ Failed to send error report:', error);
    });
  }

  sendPerformanceMetrics(metrics) {
    // Send to performance monitoring endpoint
    fetch(`${config.api.baseURL}/monitoring/performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(metrics)
    }).catch(error => {
      console.error('❌ Failed to send performance metrics:', error);
    });
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime
    };
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

export default monitoringService;
