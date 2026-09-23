import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import Infrastructure from './pages/Infrastructure';
import Network from './pages/Network';
import Cloud from './pages/Cloud';
import Alerts from './pages/Alerts';
import Logs from './pages/Logs';
import Troubleshooting from './pages/Troubleshooting';
import Topology from './pages/Topology';
import { api } from './services/api';
import { usePolling } from './hooks/usePolling';

export default function App() {
  // Read initial page from URL hash (e.g. #infrastructure) or default to 'overview'
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#', '');
    const validPages = [
      'overview',
      'infrastructure',
      'network',
      'cloud',
      'alerts',
      'logs',
      'troubleshooting',
      'topology'
    ];
    return validPages.includes(hash) ? hash : 'overview';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30000);
  const [mockMode, setMockMode] = useState(true);
  const [activeAlertCount, setActiveAlertCount] = useState(2);
  const [troubleshootDevice, setTroubleshootDevice] = useState('br-remote-rtr01');

  // Sync activePage to URL hash for shareable links
  const navigateTo = (page, optionalDevice) => {
    setActivePage(page);
    window.location.hash = page;
    if (optionalDevice) {
      setTroubleshootDevice(optionalDevice);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(getInitialPage());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Polling / Manual Refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Re-fetch overview summary to update badge counts
      const res = await api.getAlerts({ status: 'active' });
      const criticalOrWarning = res.data.filter(
        (a) => a.severity === 'critical' || a.severity === 'warning'
      ).length;
      setActiveAlertCount(criticalOrWarning);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  usePolling(handleRefresh, autoRefreshInterval, autoRefreshInterval > 0);

  const handleToggleMockMode = (enabled) => {
    api.setMockMode(enabled);
    setMockMode(enabled);
    handleRefresh();
  };

  return (
    <DashboardLayout
      activePage={activePage}
      onSelectPage={navigateTo}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      autoRefreshInterval={autoRefreshInterval}
      onChangeInterval={setAutoRefreshInterval}
      activeAlertCount={activeAlertCount}
      mockMode={mockMode}
      onToggleMockMode={handleToggleMockMode}
    >
      {activePage === 'overview' && (
        <Overview onNavigate={navigateTo} />
      )}
      {activePage === 'infrastructure' && (
        <Infrastructure
          onNavigate={navigateTo}
          onSelectDeviceForTroubleshooting={(dev) => setTroubleshootDevice(dev)}
        />
      )}
      {activePage === 'network' && (
        <Network onNavigate={navigateTo} />
      )}
      {activePage === 'cloud' && (
        <Cloud />
      )}
      {activePage === 'alerts' && (
        <Alerts
          onNavigate={navigateTo}
          onSelectDeviceForTroubleshooting={(dev) => setTroubleshootDevice(dev)}
        />
      )}
      {activePage === 'logs' && (
        <Logs />
      )}
      {activePage === 'troubleshooting' && (
        <Troubleshooting
          initialDeviceId={troubleshootDevice}
          onNavigate={navigateTo}
        />
      )}
      {activePage === 'topology' && (
        <Topology
          onSelectNode={(nodeId) => setTroubleshootDevice(nodeId)}
        />
      )}
    </DashboardLayout>
  );
}
