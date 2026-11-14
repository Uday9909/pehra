import React, { useState, useEffect } from 'react';
import {
  Settings,
  Activity,
  Radio,
  Cpu,
  Sliders,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  DataSource,
  ModelVersion,
  AuditLog,
  SystemThresholds,
  User,
  UserRole,
} from '../types/index.ts';
import { api } from '../api/client.ts';

interface AdminViewProps {
  activeRole: UserRole;
}

export const AdminView: React.FC<AdminViewProps> = ({ activeRole }) => {
  const [activeTab, setActiveTab] = useState<
    'HEALTH' | 'SOURCES' | 'MODELS' | 'THRESHOLDS' | 'USERS' | 'AUDIT'
  >('SOURCES');

  const [health, setHealth] = useState<any>(null);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [thresholds, setThresholds] = useState<SystemThresholds | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null);
  const [savingThresholds, setSavingThresholds] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [hRes, sRes, mRes, tRes, uRes, aRes] = await Promise.all([
        api.getHealth(),
        api.getSources(),
        api.getModels(),
        api.getThresholds(),
        api.getUsers(),
        api.getAuditLogs(),
      ]);

      setHealth(hRes);
      setSources(sRes.sources || []);
      setModels(mRes.models || []);
      setThresholds(tRes.thresholds || null);
      setUsers(uRes.users || []);
      setAuditLogs(aRes.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestSource = async (sourceId: string) => {
    setTestingSourceId(sourceId);
    try {
      const res = await api.testSource(sourceId);
      alert(`Source Gateway Ping Result:\nStatus: ${res.status}\nLatency: ${res.latencyMs}ms\nQuality: ${res.dataQuality}`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Ping failed');
    } finally {
      setTestingSourceId(null);
    }
  };

  const handleToggleSource = async (sourceId: string, config: { enabled?: boolean; isSimulation?: boolean }) => {
    try {
      await api.toggleSource(sourceId, config);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Toggle failed');
    }
  };

  const handleActivateModel = async (modelId: string) => {
    try {
      await api.activateModel(modelId);
      alert('Model version activated into live inference pipeline.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Activation failed');
    }
  };

  const handleSaveThresholds = async () => {
    if (!thresholds) return;
    setSavingThresholds(true);
    try {
      await api.updateThresholds(thresholds);
      alert('System operational thresholds updated and recorded in audit log.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setSavingThresholds(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pehra-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-pehra-text tracking-tight">Admin & ML Operations Console</h1>
          <p className="text-xs text-pehra-text mt-1">
            Sensor telemetry gateways, model governance, early warning thresholds, and immutable audit logs
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 rounded-none border border-pehra-border-subtle bg-pehra-panel p-1 text-xs">
          {[
            { id: 'SOURCES', label: 'Data Feeds' },
            { id: 'MODELS', label: 'ML Models' },
            { id: 'THRESHOLDS', label: 'Thresholds' },
            { id: 'HEALTH', label: 'System Health' },
            { id: 'USERS', label: 'RBAC Users' },
            { id: 'AUDIT', label: 'Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded px-3 py-1.5 font-medium transition-all ${
                activeTab === tab.id ? 'bg-pehra-panel text-pehra-text font-bold' : 'text-pehra-text hover:text-pehra-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: DATA SOURCES */}
      {activeTab === 'SOURCES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pehra-text">
              Integrated Environmental Telemetry Feeds ({sources.length})
            </span>
            <button
              onClick={loadAdminData}
              className="flex items-center gap-1 text-xs text-pehra-text hover:text-pehra-text"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Sources</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => {
              const isHealthy = src.status === 'HEALTHY';
              const isDegraded = src.status === 'DEGRADED';

              return (
                <div key={src.id} className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold">
                        {src.type}
                      </span>
                      <h3 className="font-bold text-pehra-text text-base mt-0.5">{src.name}</h3>
                      <p className="text-xs text-pehra-text font-mono truncate max-w-xs">{src.endpointUrl}</p>
                    </div>

                    <span
                      className={`rounded px-2 py-0.5 text-pehra-text font-bold uppercase ${
                        isHealthy
                          ? 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle'
                          : isDegraded
                          ? 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle'
                          : 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle'
                      }`}
                    >
                      {src.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-pehra-border-subtle pt-3 text-xs">
                    <div>
                      <span className="text-pehra-text-2 block">Freshness</span>
                      <span className="font-mono font-bold text-pehra-text">
                        {Math.round((Date.now() - new Date(src.lastUpdate).getTime()) / 1000)}s ago
                      </span>
                    </div>
                    <div>
                      <span className="text-pehra-text-2 block">Polling Cadence</span>
                      <span className="font-mono font-bold text-pehra-text">{src.updateFrequencySec}s</span>
                    </div>
                    <div>
                      <span className="text-pehra-text-2 block">Quality Score</span>
                      <span className="font-mono font-bold text-pehra-text">
                        {(src.qualityScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-pehra-border-subtle pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSource(src.id, { enabled: !src.enabled })}
                        className={`rounded px-2.5 py-1 font-bold ${
                          src.enabled
                            ? 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle'
                            : 'bg-pehra-panel text-pehra-text'
                        }`}
                      >
                        {src.enabled ? 'Enabled' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => handleToggleSource(src.id, { isSimulation: !src.isSimulation })}
                        className="rounded bg-pehra-panel px-2 py-1 text-pehra-text hover:bg-pehra-raised"
                      >
                        {src.isSimulation ? 'Switch Live' : 'Simulate'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleTestSource(src.id)}
                      disabled={testingSourceId === src.id}
                      className="rounded bg-pehra-panel px-3 py-1 font-bold text-pehra-text hover:bg-pehra-raised shadow-none"
                    >
                      {testingSourceId === src.id ? 'Testing...' : 'Test Gateway'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: ML MODEL GOVERNANCE */}
      {activeTab === 'MODELS' && (
        <div className="space-y-4">
          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-4 text-xs text-pehra-text">
            <strong>Model Governance & Lineage (Section 17 SRS):</strong> Model A (Conditions) and Model B (DEM Downhill Spread) support active version switching, precision/recall verification, and zero-downtime rollbacks.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((mod) => (
              <div key={mod.id} className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold">
                        {mod.type}
                      </span>
                      {mod.status === 'ACTIVE' && (
                        <span className="rounded bg-pehra-panel border border-pehra-border-subtle px-2 py-0.5 text-pehra-text font-bold text-pehra-text">
                          CURRENTLY ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-pehra-text text-base mt-1">{mod.name} (v{mod.version})</h3>
                  </div>

                  <span className="rounded bg-pehra-panel px-2 py-0.5 text-pehra-text font-mono text-pehra-text">
                    {mod.algorithm}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 border-t border-pehra-border-subtle pt-3 text-xs text-center">
                  <div className="rounded bg-pehra-panel p-2 border border-pehra-border-subtle">
                    <span className="text-pehra-text-2 block">Precision</span>
                    <span className="font-mono font-bold text-pehra-text">{(mod.metrics.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div className="rounded bg-pehra-panel p-2 border border-pehra-border-subtle">
                    <span className="text-pehra-text-2 block">Recall</span>
                    <span className="font-mono font-bold text-pehra-text">{(mod.metrics.recall * 100).toFixed(1)}%</span>
                  </div>
                  <div className="rounded bg-pehra-panel p-2 border border-pehra-border-subtle">
                    <span className="text-pehra-text-2 block">F1 Score</span>
                    <span className="font-mono font-bold text-pehra-text">{(mod.metrics.f1Score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="rounded bg-pehra-panel p-2 border border-pehra-border-subtle">
                    <span className="text-pehra-text-2 block">Lead Time</span>
                    <span className="font-mono font-bold text-pehra-text">{mod.metrics.arrivalLeadTimeHours || 2}h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-pehra-border-subtle pt-3 text-xs">
                  <span className="text-pehra-text">Created: {new Date(mod.createdAt).toLocaleDateString()}</span>
                  {mod.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleActivateModel(mod.id)}
                      className="rounded bg-pehra-panel px-3.5 py-1.5 font-bold text-pehra-text hover:bg-pehra-raised shadow-none"
                    >
                      Activate Version
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: EARLY WARNING THRESHOLDS */}
      {activeTab === 'THRESHOLDS' && thresholds && (
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
            <div>
              <h2 className="text-lg font-bold text-pehra-text">Operational Early Warning Thresholds & Hysteresis</h2>
              <p className="text-xs text-pehra-text">
                Adjust model sensitivity margins, automated cooldown periods, and mandatory human sign-off triggers
              </p>
            </div>

            <button
              onClick={handleSaveThresholds}
              disabled={savingThresholds}
              className="flex items-center gap-1.5 rounded-none bg-pehra-panel px-4 py-2 font-bold text-pehra-text hover:bg-pehra-raised shadow-none"
            >
              <Save className="h-4 w-4" />
              <span>{savingThresholds ? 'Saving...' : 'Save & Record Audit Log'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-pehra-text font-semibold">STAGE 1: WATCH Risk Trigger:</span>
                  <span className="font-mono font-bold text-pehra-text">
                    {(thresholds.watchRiskThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.6"
                  step="0.05"
                  value={thresholds.watchRiskThreshold}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, watchRiskThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full accent-pehra-action"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-pehra-text font-semibold">STAGE 2: WARNING Risk Trigger:</span>
                  <span className="font-mono font-bold text-pehra-text">
                    {(thresholds.warningRiskThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.9"
                  step="0.05"
                  value={thresholds.warningRiskThreshold}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, warningRiskThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full accent-pehra-action"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-pehra-text font-semibold">Alert Cooldown Window (Minutes):</span>
                  <span className="font-mono font-bold text-pehra-text">{thresholds.alertCooldownMinutes} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={thresholds.alertCooldownMinutes}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, alertCooldownMinutes: parseInt(e.target.value) })
                  }
                  className="w-full accent-pehra-action"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-pehra-text font-semibold">Hysteresis Margin (Anti-Flapping):</span>
                  <span className="font-mono font-bold text-pehra-text">
                    {(thresholds.alertHysteresisPct * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.25"
                  step="0.01"
                  value={thresholds.alertHysteresisPct}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, alertHysteresisPct: parseFloat(e.target.value) })
                  }
                  className="w-full accent-pehra-action"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-pehra-text font-semibold">Alert Expiration Timeout (Hours):</span>
                  <span className="font-mono font-bold text-pehra-text">{thresholds.alertExpiryHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={thresholds.alertExpiryHours}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, alertExpiryHours: parseInt(e.target.value) })
                  }
                  className="w-full accent-pehra-action"
                />
              </div>

              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-pehra-text">
                  <input
                    type="checkbox"
                    checked={thresholds.confirmedApprovalRequired}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, confirmedApprovalRequired: e.target.checked })
                    }
                    className="rounded bg-pehra-panel text-pehra-text"
                  />
                  <span>Mandatory Human Officer Approval for Stage 3 CONFIRMED</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-pehra-text">
                  <input
                    type="checkbox"
                    checked={thresholds.smsFallbackEnabled}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, smsFallbackEnabled: e.target.checked })
                    }
                    className="rounded bg-pehra-panel text-pehra-text"
                  />
                  <span>Emergency SMS broadcast gateway fallback active</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SYSTEM HEALTH */}
      {activeTab === 'HEALTH' && health && (
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-6 space-y-4 text-xs">
          <h2 className="text-base font-bold text-pehra-text">Infrastructure Health Matrix</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(health.services || {}).map(([service, status]: any) => (
              <div key={service} className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
                <span className="text-pehra-text capitalize block text-pehra-text">{service.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-mono font-bold text-pehra-text text-sm mt-1 block">{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: RBAC USERS */}
      {activeTab === 'USERS' && (
        <div className="overflow-x-auto rounded-none border border-pehra-border-subtle bg-pehra-panel">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-pehra-border-subtle bg-pehra-panel text-pehra-text font-mono uppercase text-pehra-text">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Jurisdiction / Location</th>
                <th className="p-3">Phone</th>
                <th className="p-3">MFA & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pehra-border-subtle">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-pehra-raised">
                  <td className="p-3 font-medium text-pehra-text">
                    <div>{u.fullName}</div>
                    <div className="text-pehra-text-2 font-mono">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-pehra-panel px-2 py-0.5 font-mono font-bold text-pehra-text">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-pehra-text font-mono">{u.homeLocation?.address || 'MMR Metropolitan'}</td>
                  <td className="p-3 text-pehra-text font-mono">{u.phone || '+91 98200 00000'}</td>
                  <td className="p-3">
                    <span className="rounded bg-pehra-panel border border-pehra-border-subtle px-2 py-0.5 text-pehra-text-2 font-semibold mr-1">
                      {u.status}
                    </span>
                    <span className="text-pehra-text-2">
                      MFA: {u.mfaEnabled ? 'Enforced' : 'Optional'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="overflow-x-auto rounded-none border border-pehra-border-subtle bg-pehra-panel">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-pehra-border-subtle bg-pehra-panel text-pehra-text font-mono uppercase text-pehra-text">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">Reason / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pehra-border-subtle">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-pehra-raised">
                  <td className="p-3 font-mono text-pehra-text-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-semibold text-pehra-text">
                    {log.userName} ({log.userRole})
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-pehra-panel border border-pehra-border-subtle px-2 py-0.5 font-mono text-pehra-text-2">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-pehra-text font-mono">{log.resource}</td>
                  <td className="p-3 text-pehra-text">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
