// Mobile Deck Hook - React Hook for Real-time Dashboard Integration
import { useState, useEffect, useCallback, useRef } from 'react';
import mobileDeckService from '../services/mobileDeck';

export const useMobileDeck = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  const [data, setData] = useState({
    users: [],
    outlets: [],
    visits: [],
    syncStatus: {}
  });

  const listenersRef = useRef(new Set());

  // Initialize Mobile Deck
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await mobileDeckService.initialize();
      
      // Set initial data
      setData({
        users: mobileDeckService.getUsers(),
        outlets: mobileDeckService.getOutlets(),
        visits: mobileDeckService.getVisits(),
        syncStatus: mobileDeckService.getSyncStatus()
      });

      const connectionStatus = mobileDeckService.getConnectionStatus();
      setIsConnected(connectionStatus.isConnected);
      setLastSyncTime(connectionStatus.lastSyncTime);
      
      console.log('🚀 Mobile Deck Hook initialized');
    } catch (err) {
      console.error('❌ Mobile Deck Hook initialization failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    // Data updates
    const removeDataListener = mobileDeckService.addEventListener('data:update', (updateData) => {
      setData(prev => ({ ...prev, ...updateData }));
    });

    // Visit updates
    const removeVisitListener = mobileDeckService.addEventListener('visit:update', (visitData) => {
      setData(prev => ({
        ...prev,
        visits: prev.visits.map(visit => 
          visit.id === visitData.id ? { ...visit, ...visitData } : visit
        )
      }));
    });

    // User updates
    const removeUserListener = mobileDeckService.addEventListener('user:update', (userData) => {
      setData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userData.id ? { ...user, ...userData } : user
        )
      }));
    });

    // Outlet updates
    const removeOutletListener = mobileDeckService.addEventListener('outlet:update', (outletData) => {
      setData(prev => ({
        ...prev,
        outlets: prev.outlets.map(outlet => 
          outlet.id === outletData.id ? { ...outlet, ...outletData } : outlet
        )
      }));
    });

    // Sync status
    const removeSyncListener = mobileDeckService.addEventListener('sync:status', (syncStatus) => {
      setData(prev => ({ ...prev, syncStatus }));
    });

    // Sync complete
    const removeSyncCompleteListener = mobileDeckService.addEventListener('sync:complete', ({ timestamp }) => {
      setLastSyncTime(timestamp);
      // Refresh all data after sync
      setData({
        users: mobileDeckService.getUsers(),
        outlets: mobileDeckService.getOutlets(),
        visits: mobileDeckService.getVisits(),
        syncStatus: mobileDeckService.getSyncStatus()
      });
    });

    // Connection status
    const removeConnectionListener = mobileDeckService.addEventListener('connection:status', (status) => {
      setIsConnected(status.isConnected);
    });

    // Store listeners for cleanup
    listenersRef.current.add(removeDataListener);
    listenersRef.current.add(removeVisitListener);
    listenersRef.current.add(removeUserListener);
    listenersRef.current.add(removeOutletListener);
    listenersRef.current.add(removeSyncListener);
    listenersRef.current.add(removeSyncCompleteListener);
    listenersRef.current.add(removeConnectionListener);

  }, []);

  // Manual operations
  const forceSync = useCallback(async () => {
    try {
      await mobileDeckService.forceSync();
      setData({
        users: mobileDeckService.getUsers(),
        outlets: mobileDeckService.getOutlets(),
        visits: mobileDeckService.getVisits(),
        syncStatus: mobileDeckService.getSyncStatus()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const refreshData = useCallback(async (endpoint) => {
    try {
      const refreshedData = await mobileDeckService.refreshData(endpoint);
      setData(prev => ({ ...prev, [endpoint]: refreshedData }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getConnectionStatus = useCallback(() => {
    return mobileDeckService.getConnectionStatus();
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    listenersRef.current.forEach(removeListener => {
      removeListener();
    });
    listenersRef.current.clear();
    mobileDeckService.disconnect();
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
    setupEventListeners();

    return cleanup;
  }, [initialize, setupEventListeners, cleanup]);

  return {
    // State
    isConnected,
    isLoading,
    error,
    lastSyncTime,
    data,
    
    // Methods
    forceSync,
    refreshData,
    getConnectionStatus,
    
    // Computed values
    connectionStatus: getConnectionStatus(),
    hasData: data.users.length > 0 || data.outlets.length > 0 || data.visits.length > 0
  };
};

export default useMobileDeck;
