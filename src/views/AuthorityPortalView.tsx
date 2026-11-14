import React, { useState } from 'react';
import {
  ShieldAlert,
  Radio,
  Sliders,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Waves,
  Users,
  Compass,
  ArrowRight,
  FileCheck,
  Zap,
} from 'lucide-react';
import { Alert, Village, DataSource } from '../types/index.ts';
import { DataBadge } from '../components/ui/index.tsx';

interface AuthorityPortalViewProps {
  alerts: Alert[];
  villages: Village[];
  sources: DataSource[];
  onApproveAlert: (alertId: string, reason: string) => Promise<void>;
  onCreateAlert: (alertData: any) => Promise<void>;
  onNavigate: (tab: string) => void;
}

export const AuthorityPortalView: React.FC<AuthorityPortalViewProps> = ({
  alerts,
  villages,
  sources,
  onApproveAlert,
  onCreateAlert,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'BROADCAST' | 'SLUICE_GATES' | 'WARD_ORDERS'>('BROADCAST');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Sluice Gate State
  const [gatesState, setGatesState] = useState([
    { id: 'gate-mahim', name: 'Mahim Causeway Mithi Outfall Gates (4x)', status: 'LOCKED_TIDE', flowM3s: 180, oceanLevelM: 4.45 },
    { id: 'gate-cleveland', name: 'Cleveland Bunder Worli Sluice', status: 'DISCHARGING', flowM3s: 290, oceanLevelM: 4.20 },
    { id: 'gate-lovegrove', name: 'Love Grove Pumping Station (Worli)', status: 'FULL_PUMPING', flowM3s: 410, oceanLevelM: 4.30 },
    { id: 'gate-hajiali', name: 'Haji Ali Bay Stormwater Outfall', status: 'LOCKED_TIDE', flowM3s: 110, oceanLevelM: 4.40 },
  ]);

  // Alert Creation Studio state
  const [newTitle, setNewTitle] = useState('CRITICAL EVACUATION ORDER: Mithi River Corridor & Kurla Kranti Nagar');
  const [newVillageId, setNewVillageId] = useState('mumbai-kurla-w');
  const [newStage, setNewStage] = useState<'WATCH' | 'WARNING' | 'CONFIRMED'>('CONFIRMED');
  const [newRisk, setNewRisk] = useState<'HIGH' | 'CRITICAL'>('CRITICAL');
  const [newReason, setNewReason] = useState('Water level exceeded 3.45m danger gauge. High tide at 16:30 prevents outflow. Move to relief camps immediately.');
  const [publishingAlert, setPublishingAlert] = useState(false);

  const handleToggleGate = (gateId: string) => {
    setGatesState((prev) =>
      prev.map((g) => {
        if (g.id === gateId) {
          const newStatus = g.status === 'LOCKED_TIDE' ? 'FORCE_OPEN_PUMPING' : 'LOCKED_TIDE';
          return { ...g, status: newStatus };
        }
        return g;
      })
    );
    setActionSuccessMsg(`Sluice actuator command transmitted to MCGM Stormwater Telemetry unit for ${gateId}.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handlePublishOfficialAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingAlert(true);
    try {
      const village = villages.find((v) => v.id === newVillageId) || villages[0];
      await onCreateAlert({
        title: newTitle,
        villageId: village.id,
        villageName: village.name,
        stage: newStage,
        riskLevel: newRisk,
        message: newReason,
        confidence: 0.96,
        etaHours: 1.0,
        approvedBy: 'usr-authority-01 (Officer Vikramaditya Kadam)',
        checklist: [
          'Immediate evacuation of ground floor residences in lane 2, 3, and 4',
          'Avoid power transformers and submerged open trenches',
          'Designated shelter: Kurla Municipal High School (Hot meals ready)',
        ],
      });
      setActionSuccessMsg(`Official Municipal ${newStage} Alert broadcasted across SMS, Push, and Ward PA Sirens.`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } finally {
      setPublishingAlert(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Authority Apex Header */}
      <div className="rounded-none border border-pehra-border-subtle bg-pehra-raised p-5 sm:p-6 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-none bg-pehra-panel text-pehra-text border border-pehra-border-subtle shrink-0">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-none bg-pehra-panel px-2.5 py-0.5 text-pehra-text font-mono font-semibold text-pehra-text border border-pehra-border-subtle">
                  MUNICIPAL EOC COMMAND CONSOLE (TIER 2)
                </span>
                <span className="text-xs text-pehra-text font-medium">Officer Vikramaditya Kadam • MCGM Disaster Cell HQ</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-pehra-text tracking-tight mt-1">
                Disaster Operations Command & Early Warning Broadcast
              </h1>
              <p className="text-xs sm:text-sm text-pehra-text mt-1 max-w-2xl">
                Authority to sanction emergency broadcast sirens, override coastal storm sluice gates, and declare formal evacuation zones under the Disaster Management Act.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('rbac-hub')}
              className="rounded-none border border-pehra-border-subtle bg-pehra-panel px-3 py-2 text-xs font-semibold text-pehra-text hover:bg-pehra-raised transition-colors"
            >
              Switch Role
            </button>
            <button
              onClick={() => onNavigate('alerts')}
              className="flex items-center gap-1.5 rounded-none bg-pehra-panel px-3 py-2 text-xs font-semibold text-pehra-text hover:bg-pehra-raised shadow-none transition-colors"
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>Public Alert Feed</span>
            </button>
          </div>
        </div>

        {/* Quick Sluice Status Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-pehra-border-subtle text-xs">
          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="text-pehra-text font-medium">Arabian Sea Tide</div>
            <div className="mt-1 text-xl font-bold font-mono text-pehra-text">4.45 m (Peak)</div>
            <div className="text-pehra-text-2">Tidal Backflow Locking Nullahs</div>
          </div>

          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="text-pehra-text font-medium">Active Warning Sirens</div>
            <div className="mt-1 text-xl font-bold font-mono text-pehra-text">
              {alerts.filter((a) => a.status === 'ACTIVE').length} Sounding
            </div>
            <div className="text-pehra-text-2">PA System & Cell Broadcast</div>
          </div>

          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="text-pehra-text font-medium">Sluice Discharge</div>
            <div className="mt-1 text-xl font-bold font-mono text-pehra-text">990 m³/sec</div>
            <div className="text-pehra-text-2">Love Grove & Worli Pumping</div>
          </div>

          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="text-pehra-text font-medium">EOC Shift Commander</div>
            <div className="mt-1 text-sm font-bold font-mono text-pehra-text">DESK-01 (ACTIVE)</div>
            <div className="text-pehra-text-2">Token: MCGM-DM-2026-X9</div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3.5 text-xs text-pehra-text flex items-center justify-between shadow-none animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-pehra-text shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <span className="text-pehra-text font-mono text-pehra-text">AUTHORIZED</span>
        </div>
      )}

      {/* Segmented Mode Tabs */}
      <div className="flex items-center gap-1.5 border-b border-pehra-border-subtle pb-2 text-xs">
        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all ${
            activeTab === 'BROADCAST'
              ? 'bg-pehra-panel text-pehra-text shadow-none'
              : 'text-pehra-text hover:text-pehra-text hover:bg-pehra-raised'
          }`}
        >
          <BellRing className="h-3.5 w-3.5" />
          <span>Broadcast Warning Siren Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('SLUICE_GATES')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all ${
            activeTab === 'SLUICE_GATES'
              ? 'bg-pehra-panel text-pehra-text shadow-none'
              : 'text-pehra-text hover:text-pehra-text hover:bg-pehra-raised'
          }`}
        >
          <Waves className="h-3.5 w-3.5" />
          <span>Sluice Gates & Actuators ({gatesState.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WARD_ORDERS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all ${
            activeTab === 'WARD_ORDERS'
              ? 'bg-pehra-panel text-pehra-text shadow-none'
              : 'text-pehra-text hover:text-pehra-text hover:bg-pehra-raised'
          }`}
        >
          <FileCheck className="h-3.5 w-3.5" />
          <span>Ward Evacuation Orders ({villages.length})</span>
        </button>
      </div>

      {/* TAB 1: BROADCAST WARNING STUDIO */}
      {activeTab === 'BROADCAST' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creator Form */}
          <div className="lg:col-span-2 rounded-none border border-pehra-border-subtle bg-pehra-raised p-5 space-y-4 shadow-none">
            <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
              <div>
                <h3 className="font-bold text-pehra-text text-sm flex items-center gap-2">
                  <Radio className="h-4 w-4 text-pehra-text" />
                  <span>Issue Official Hyperlocal Flood Siren & Advisory</span>
                </h3>
                <p className="text-xs text-pehra-text">
                  Dispatches emergency broadcast across mobile networks (CB-SMS), local PA sirens, and app notifications.
                </p>
              </div>
              <span className="rounded-none bg-pehra-panel border border-pehra-border-subtle text-pehra-text px-2 py-0.5 text-pehra-text font-mono font-bold">
                TIER 2 CLEARANCE
              </span>
            </div>

            <form onSubmit={handlePublishOfficialAlert} className="space-y-4 text-xs">
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-pehra-text font-medium mb-1">Target Ward / Municipal Locality</label>
                  <select
                    value={newVillageId}
                    onChange={(e) => setNewVillageId(e.target.value)}
                    className="box-border min-w-0 w-full max-w-full rounded-none border border-pehra-border-subtle bg-pehra-panel px-3 py-2 text-pehra-text focus:bg-pehra-raised focus:outline-none focus:border-pehra-focus"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.ward}) — Current Risk: {v.riskLevel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-pehra-text font-medium mb-1">Alert Stage Classification</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as any)}
                    className="box-border min-w-0 w-full max-w-full rounded-none border border-pehra-border-subtle bg-pehra-panel px-3 py-2 text-pehra-text focus:bg-pehra-raised focus:outline-none focus:border-pehra-focus"
                  >
                    <option value="WATCH">WATCH (T-3 hours to expected overflow)</option>
                    <option value="WARNING">WARNING (T-1 hour: High runoff approaching)</option>
                    <option value="CONFIRMED">CONFIRMED (Critical Deluge / Evacuate Now)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-pehra-text font-medium mb-1">Broadcast Alert Headline</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="box-border min-w-0 w-full max-w-full rounded-none border border-pehra-border-subtle bg-pehra-panel px-3 py-2 text-pehra-text font-semibold focus:bg-pehra-raised focus:outline-none focus:border-pehra-focus"
                  required
                />
              </div>

              <div>
                <label className="block text-pehra-text font-medium mb-1">Public Safety Directive & Evacuation Details</label>
                <textarea
                  rows={3}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="box-border w-full rounded-none border border-pehra-border-subtle bg-pehra-panel px-3 py-2 text-pehra-text focus:bg-pehra-raised focus:outline-none focus:border-pehra-focus"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-pehra-text-2">
                  Signed with digital token: <strong className="text-pehra-text font-mono">MCGM-DM-2026-X9</strong>
                </div>

                <button
                  type="submit"
                  disabled={publishingAlert}
                  className="py-2.5 px-6 rounded-none bg-pehra-panel hover:bg-pehra-raised text-pehra-text font-bold text-xs shadow-none transition-colors flex items-center gap-1.5"
                >
                  <Radio className="h-4 w-4" />
                  <span>{publishingAlert ? 'Broadcasting...' : 'Authenticate & Sound Siren'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="rounded-none border border-pehra-border-subtle bg-pehra-raised p-5 space-y-4 shadow-none">
            <h3 className="font-bold text-pehra-text text-sm">MCGM Standard Operating Protocol</h3>
            <div className="space-y-3 text-xs text-pehra-text leading-relaxed">
              <div className="p-3 rounded-none border border-pehra-border-subtle bg-pehra-panel space-y-1">
                <div className="font-semibold text-pehra-text">1. Tidal Lock Threshold</div>
                <p className="text-pehra-text">
                  When Arabian Sea tide exceeds 4.2m coincident with rainfall &gt;40mm/hr, Mithi gravity discharge drops to zero. Warning level mandatory.
                </p>
              </div>

              <div className="p-3 rounded-none border border-pehra-border-subtle bg-pehra-panel space-y-1">
                <div className="font-semibold text-pehra-text">2. Pre-Evacuation Buffer</div>
                <p className="text-pehra-text">
                  Order evacuation of ground floor shanties in Kranti Nagar at least 1.5 hours prior to high tide peak.
                </p>
              </div>

              <div className="p-3 rounded-none border border-pehra-border-subtle bg-pehra-panel space-y-1">
                <div className="font-semibold text-pehra-text">3. Transit Corridor Security</div>
                <p className="text-pehra-text">
                  Ensure police cordons isolate submerged pedestrian subways (Milan, Andheri, Khar).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SLUICE GATES & ACTUATORS */}
      {activeTab === 'SLUICE_GATES' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 border border-pehra-border-subtle bg-pehra-panel px-3 py-2 text-xs text-pehra-text">
            <DataBadge source="seeded-store" asOf="demo state" />
            <span>Demo control, no effect on real gates.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gatesState.map((g) => (
              <div
                key={g.id}
                className="rounded-none border border-pehra-border-subtle bg-pehra-raised p-5 space-y-4 shadow-none"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-pehra-text text-base">{g.name}</h3>
                    <span className="text-xs text-pehra-text font-mono">SCADA Actuator ID: {g.id}</span>
                  </div>

                  <span
                    className={`rounded-none px-2.5 py-0.5 text-pehra-text font-mono font-bold uppercase border ${
                      g.status.includes('LOCKED')
                        ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                        : 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel">
                    <span className="text-pehra-text-2 block">Current Discharge</span>
                    <span className="text-base font-bold font-mono text-pehra-text">{g.flowM3s} m³/s</span>
                  </div>

                  <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel">
                    <span className="text-pehra-text-2 block">Ocean Side Gauge</span>
                    <span className="text-base font-bold font-mono text-pehra-text">{g.oceanLevelM} m MSL</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-pehra-border-subtle flex items-center justify-between">
                  <span className="text-pehra-text-2">
                    {g.status.includes('LOCKED')
                      ? 'Closed to prevent sea backflow'
                      : 'Actively flushing inland stormwater'}
                  </span>

                  <button
                    onClick={() => handleToggleGate(g.id)}
                    className="py-1.5 px-3 rounded-none bg-pehra-panel hover:bg-pehra-raised text-pehra-text text-xs font-semibold transition-colors border border-pehra-border-subtle"
                  >
                    Toggle Actuator State
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WARD ORDERS */}
      {activeTab === 'WARD_ORDERS' && (
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-raised p-5 space-y-4 shadow-none">
          <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
            <h3 className="font-bold text-pehra-text text-base">Ward Emergency Directives Overview</h3>
            <span className="text-xs text-pehra-text">{villages.length} Municipal Surveillance Zones</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-pehra-border-subtle text-pehra-text font-medium text-pehra-text bg-pehra-panel">
                  <th className="py-2.5 px-3">Ward & Basin</th>
                  <th className="py-2.5 px-2">Risk Level</th>
                  <th className="py-2.5 px-2">Water Gauge</th>
                  <th className="py-2.5 px-2">Population Exposed</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {villages.map((v) => (
                  <tr key={v.id} className="hover:bg-pehra-raised transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-pehra-text">{v.name}</div>
                      <div className="text-pehra-text-2">{v.ward}</div>
                    </td>

                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-none text-pehra-text font-mono font-bold border ${
                          v.riskLevel === 'CRITICAL'
                            ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                            : v.riskLevel === 'HIGH'
                            ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                            : 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                        }`}
                      >
                        {v.riskLevel}
                      </span>
                    </td>

                    <td className="py-3 px-2 font-mono font-semibold text-pehra-text">{v.waterLevelM} m</td>
                    <td className="py-3 px-2 font-mono text-pehra-text font-semibold">{v.exposurePopulation.toLocaleString()}</td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setNewVillageId(v.id);
                          setActiveTab('BROADCAST');
                        }}
                        className="py-1 px-2.5 rounded-none bg-pehra-panel hover:bg-pehra-raised text-pehra-text text-pehra-text font-semibold transition-colors"
                      >
                        Issue Ward Siren
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
