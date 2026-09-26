import devicesData from '../data/devices.json';
import cloudData from '../data/cloud.json';
import networkData from '../data/network.json';
import alertsData from '../data/alerts.json';
import logsData from '../data/logs.json';
import metricsData from '../data/metrics.json';
import diagnosticsData from '../data/diagnostics.json';

// In-memory state clone so mutations (acknowledge/resolve alerts, add logs) persist in session
let alertsState = [...alertsData];
let logsState = [...logsData];
let devicesState = [...devicesData];

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockService = {
  // 1. Overview summary data
  async getOverview() {
    await delay(150);
    const totalDevices = devicesState.length;
    const online = devicesState.filter((d) => d.status === 'online').length;
    const warning = devicesState.filter((d) => d.status === 'warning').length;
    const critical = devicesState.filter((d) => d.status === 'critical').length;
    const activeAlerts = alertsState.filter((a) => a.status === 'active').length;
    const criticalAlerts = alertsState.filter((a) => a.severity === 'critical' && a.status === 'active').length;

    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        totalDevices,
        online,
        warning,
        critical,
        activeAlerts,
        criticalAlerts,
        networkHealthScore: 98.2,
        globalLatency: networkData.summary.globalAvgLatency,
        packetLoss: networkData.summary.globalPacketLoss,
        bandwidthTotal: `${networkData.summary.aggregateBandwidthIn} In / ${networkData.summary.aggregateBandwidthOut} Out`,
        cloudInstancesRunning: cloudData.summary.runningInstances,
        cloudInstancesTotal: cloudData.summary.totalInstances,
        recentEvents: alertsState.slice(0, 5),
        metrics: metricsData
      }
    };
  },

  // 2. Hybrid Devices
  async getDevices(params = {}) {
    await delay(160);
    let results = [...devicesState];

    if (params.query) {
      const q = params.query.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.ip.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          d.environment.toLowerCase().includes(q)
      );
    }

    if (params.environment && params.environment !== 'all') {
      results = results.filter((d) =>
        params.environment === 'cloud'
          ? d.environment.includes('AWS')
          : !d.environment.includes('AWS')
      );
    }

    if (params.status && params.status !== 'all') {
      results = results.filter((d) => d.status === params.status);
    }

    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: results,
      total: results.length
    };
  },

  async getDeviceById(id) {
    await delay(120);
    const device = devicesState.find((d) => d.id === id || d.name === id);
    if (!device) throw new Error(`Device ${id} not found`);
    return {
      status: 'success',
      data: device
    };
  },

  // 3. Network Telemetry
  async getNetwork() {
    await delay(150);
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: networkData
    };
  },

  // 4. Cloud Infrastructure (Teammate's domain)
  async getCloud() {
    await delay(180);
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: cloudData
    };
  },

  // 5. Alerts
  async getAlerts(params = {}) {
    await delay(140);
    let results = [...alertsState];

    if (params.severity && params.severity !== 'all') {
      results = results.filter((a) => a.severity === params.severity);
    }

    if (params.status && params.status !== 'all') {
      results = results.filter((a) => a.status === params.status);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.resourceName.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: results,
      total: results.length,
      counts: {
        critical: alertsState.filter((a) => a.severity === 'critical' && a.status === 'active').length,
        warning: alertsState.filter((a) => a.severity === 'warning' && a.status === 'active').length,
        info: alertsState.filter((a) => a.severity === 'info' && a.status === 'active').length,
        resolved: alertsState.filter((a) => a.status === 'resolved').length
      }
    };
  },

  async acknowledgeAlert(alertId, acknowledgedBy = 'NOC_Operator') {
    await delay(100);
    alertsState = alertsState.map((a) => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'acknowledged',
          acknowledgedBy,
          acknowledgedAt: new Date().toISOString()
        };
      }
      return a;
    });

    // Add corresponding audit log
    logsState.unshift({
      id: `log-ack-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'NOC-CONSOLE',
      service: 'AlertManager',
      facility: 'user',
      message: `Alert ${alertId} acknowledged by ${acknowledgedBy}.`,
      raw: `[NOC-AUDIT] Alert ${alertId} acknowledged by ${acknowledgedBy}.`
    });

    return { status: 'success', message: `Alert ${alertId} acknowledged` };
  },

  async resolveAlert(alertId) {
    await delay(100);
    alertsState = alertsState.map((a) => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'resolved'
        };
      }
      return a;
    });

    logsState.unshift({
      id: `log-res-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'NOC-CONSOLE',
      service: 'AlertManager',
      facility: 'user',
      message: `Alert ${alertId} marked as RESOLVED.`,
      raw: `[NOC-AUDIT] Alert ${alertId} marked as RESOLVED.`
    });

    return { status: 'success', message: `Alert ${alertId} resolved` };
  },

  // 6. Centralized Logs
  async getLogs(params = {}) {
    await delay(140);
    let results = [...logsState];

    if (params.level && params.level !== 'ALL') {
      results = results.filter((l) => l.level === params.level);
    }

    if (params.source && params.source !== 'all') {
      results = results.filter((l) => l.source === params.source);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (l) =>
          l.message.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q) ||
          l.service.toLowerCase().includes(q)
      );
    }

    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: results,
      total: results.length
    };
  },

  // 7. Metrics for charts
  async getMetrics() {
    await delay(150);
    return {
      status: 'success',
      data: metricsData
    };
  },

  // 8. Diagnostics / Troubleshooting
  async getDiagnostics(deviceKey) {
    await delay(180);
    const rule = diagnosticsData.rules[deviceKey];
    if (!rule) {
      // Fallback generic diagnostic profile
      const foundDevice = devicesState.find((d) => d.name === deviceKey || d.id === deviceKey);
      return {
        status: 'success',
        notice: diagnosticsData.notice,
        data: {
          deviceId: foundDevice?.id || 'dev-unknown',
          name: foundDevice?.name || deviceKey,
          detectedSeverity: foundDevice?.status || 'normal',
          issueTitle: `${foundDevice?.name || deviceKey} Baseline Telemetry Analysis`,
          probableRootCause: 'Nominal operational status. All interface metrics and compute loads are within expected tolerances.',
          anomalies: ['No active threshold breaches detected on this node.'],
          diagnosticSteps: [
            {
              step: 1,
              title: 'ICMP Echo Health Probe',
              action: 'Verify reachability and latency baseline from NOC core.',
              sampleCommand: `ping -c 5 ${foundDevice?.ip || '127.0.0.1'}`,
              expectedResult: '0% packet loss, RTT < 20ms'
            },
            {
              step: 2,
              title: 'SNMP MIB-II Interface Query',
              action: 'Poll interface operational states and input/output octets.',
              sampleCommand: `snmpwalk -v2c -c public ${foundDevice?.ip || '127.0.0.1'} ifOperStatus`,
              expectedResult: 'All provisioned interfaces return status 1 (up)'
            }
          ]
        }
      };
    }

    return {
      status: 'success',
      notice: diagnosticsData.notice,
      data: rule
    };
  }
};
