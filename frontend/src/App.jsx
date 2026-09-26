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
import Vpn from './pages/Vpn';
import Security from './pages/Security';
import Monitoring from './pages/Monitoring';
import Terraform from './pages/Terraform';
import Automation from './pages/Automation';
import AiAssistant from './pages/AiAssistant';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import { api } from './services/api';
import { usePolling } from './hooks/usePolling';

export default function App() {
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#', '');
    const validPages = [
      'overview',
      'cloud',
      'infrastructure',
      'network',
      'topology',
      'vpn',
      'security',
      'monitoring',
      'terraform',
      'automation',
      'ai_assistant',
      'audit_logs',
      'settings',
      'alerts',
      'logs',
      'troubleshooting'
    ];
    return validPages.includes(hash) ? hash : 'overview';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30000);
  const [mockMode, setMockMode] = useState(api.isMockMode());
  const [activeAlertCount, setActiveAlertCount] = useState(2);
  const [troubleshootDevice, setTroubleshootDevice] = useState('netfusion-router');

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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.getAlerts({ is_resolved: false });
      if (res && res.data) {
        setActiveAlertCount(res.data.length);
      }
    } catch (err) {
      console.error('Refresh error:', err);
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
      {/* 13 Dedicated Operational Views */}
      {activePage === 'overview' && <Overview onNavigate={navigateTo} />}
      {activePage === 'cloud' && <Cloud />}
      {activePage === 'infrastructure' && (
        <Infrastructure
          onNavigate={navigateTo}
          onSelectDeviceForTroubleshooting={(dev) => setTroubleshootDevice(dev)}
        />
      )}
      {activePage === 'network' && <Network onNavigate={navigateTo} />}
      {activePage === 'topology' && (
        <Topology onSelectNode={(nodeId) => setTroubleshootDevice(nodeId)} />
      )}
      {activePage === 'vpn' && <Vpn />}
      {activePage === 'security' && <Security />}
      {activePage === 'monitoring' && <Monitoring />}
      {activePage === 'terraform' && <Terraform />}
      {activePage === 'automation' && <Automation />}
      {activePage === 'ai_assistant' && <AiAssistant />}
      {activePage === 'audit_logs' && <AuditLogs />}
      {activePage === 'settings' && (
        <Settings mockMode={mockMode} onToggleMockMode={handleToggleMockMode} />
      )}

      {/* Auxiliary Views */}
      {activePage === 'alerts' && (
        <Alerts
          onNavigate={navigateTo}
          onSelectDeviceForTroubleshooting={(dev) => setTroubleshootDevice(dev)}
        />
      )}
      {activePage === 'logs' && <Logs />}
      {activePage === 'troubleshooting' && (
        <Troubleshooting
          initialDeviceId={troubleshootDevice}
          onNavigate={navigateTo}
        />
      )}
    </DashboardLayout>
  );
}
