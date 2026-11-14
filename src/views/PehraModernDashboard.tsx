import React from 'react';
import { AlertTriangle, ArrowRight, MapPin, Plus } from 'lucide-react';
import { Village, Incident, Alert, Shelter, Hospital, DataSource, FloodReport, Observation } from '../types/index.ts';
import { Language } from '../utils/i18n.ts';
import { DataBadge, Panel, PanelHeader, SeverityBadge } from '../components/ui/index.tsx';

interface PehraModernDashboardProps {
  villages: Village[];
  incidents: Incident[];
  alerts: Alert[];
  shelters: Shelter[];
  hospitals: Hospital[];
  sources: DataSource[];
  reports: FloodReport[];
  observations: Observation[];
  openMeteo?: {
    lastSuccessAt: string | null;
    lastErrorAt: string | null;
    lastError: string | null;
    precipitationMm?: number | null;
    observedAt?: string | null;
  };
  language?: Language;
  onNavigate: (tab: string) => void;
  onSelectIncident?: (incident: Incident) => void;
  onSelectAlert?: (alert: Alert) => void;
  onOpenReportModal?: () => void;
}

const RISK_RANK: Record<string, number> = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3, SAFE: 4 };
const RISK_BAR: Record<string, string> = {
  CRITICAL: 'bg-pehra-severity-critical',
  HIGH: 'bg-pehra-severity-warning',
  MODERATE: 'bg-pehra-severity-watch',
  LOW: 'bg-pehra-severity-advisory',
  SAFE: 'bg-pehra-severity-normal',
};

function Metric({ label, value, unit, tone }: { label: string; value: React.ReactNode; unit?: string; tone?: string }) {
  return (
    <div className="min-w-[7.5rem] border-l border-pehra-border-subtle px-3 py-1.5 first:border-l-0">
      <div className="text-[10px] text-pehra-text-muted">{label}</div>
      <div className={`pehra-value text-lg font-semibold leading-6 ${tone || 'text-pehra-text'}`}>
        {value}
        {unit && <span className="ml-1 text-[11px] font-normal text-pehra-text-2">{unit}</span>}
      </div>
    </div>
  );
}

export const PehraModernDashboard: React.FC<PehraModernDashboardProps> = ({
  villages,
  incidents,
  alerts,
  shelters,
  hospitals,
  sources,
  reports,
  observations,
  openMeteo,
  onNavigate,
  onOpenReportModal,
}) => {
  const activeAlerts = alerts.filter((alert) => alert.status === 'ACTIVE');
  const activeIncidents = incidents.filter((incident) => incident.status === 'ACTIVE');
  const currentSource = sources[0]?.lastSuccessfulFetch || 'last seeded update';
  const worst = [...villages].sort((left, right) => (RISK_RANK[left.riskLevel] ?? 9) - (RISK_RANK[right.riskLevel] ?? 9))[0];
  const exposed = villages.reduce((total, village) => total + village.exposurePopulation, 0);
  const wardRanked = [...villages].sort((left, right) => (RISK_RANK[left.riskLevel] ?? 9) - (RISK_RANK[right.riskLevel] ?? 9));

  return (
    <div className="space-y-3 text-pehra-text">
      {/* Situation band */}
      <section className="flex flex-col justify-between gap-3 border border-pehra-border-subtle bg-pehra-panel p-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-1 h-11 w-1 shrink-0 ${worst ? RISK_BAR[worst.riskLevel] || RISK_BAR.SAFE : RISK_BAR.SAFE}`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={worst?.riskLevel || 'SAFE'} />
              <span className="pehra-code text-pehra-text-muted">Mumbai operations</span>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">Monsoon situation overview</h1>
            <p className="mt-0.5 text-xs text-pehra-text-2">
              {worst
                ? `Highest basin risk: ${worst.name} (${worst.ward}), ${worst.waterLevelM} m observed.`
                : 'No ward data returned from the seeded store.'}{' '}
              {activeAlerts.length} active warnings · {activeIncidents.length} open incidents.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-stretch border border-pehra-border-subtle bg-pehra-bg">
          <Metric label="Active warnings" value={activeAlerts.length} tone={activeAlerts.length ? 'text-pehra-severity-critical' : undefined} />
          <Metric label="Open incidents" value={activeIncidents.length} tone={activeIncidents.length ? 'text-pehra-severity-warning' : undefined} />
          <Metric label="Population exposed" value={exposed.toLocaleString('en-IN')} />
          <Metric label="Shelters open" value={shelters.filter((shelter) => shelter.status === 'OPEN').length} unit={`/ ${shelters.length}`} />
          <Metric label="Rainfall" value={openMeteo?.precipitationMm ?? '—'} unit="mm" />
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="inline-flex min-h-8 items-center gap-1 border border-pehra-border-control bg-pehra-raised px-3 text-xs font-medium text-pehra-text hover:bg-pehra-panel"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Open map
          </button>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="inline-flex min-h-8 items-center gap-1 bg-pehra-action px-3 text-xs font-semibold text-pehra-action-text hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Report flood
          </button>
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-3">
        {/* Alarm stack */}
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Active alarms"
            badge={<DataBadge source="seeded-store" asOf={currentSource} />}
            actions={
              <button type="button" onClick={() => onNavigate('alerts')} className="flex items-center gap-1 text-xs text-pehra-data-predicted hover:underline">
                All warnings <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            }
          />
          {activeAlerts.length === 0 ? (
            <div className="px-4 py-6 text-sm text-pehra-text-2">No active warnings in this shift.</div>
          ) : (
            <div className="divide-y divide-pehra-border-subtle">
              {activeAlerts
                .slice()
                .sort((left, right) => (RISK_RANK[left.riskLevel] ?? 9) - (RISK_RANK[right.riskLevel] ?? 9))
                .slice(0, 6)
                .map((alert) => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => onNavigate('alerts')}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-pehra-raised"
                  >
                    <SeverityBadge severity={alert.riskLevel} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-pehra-text">{alert.title}</span>
                      <span className="block text-[11px] text-pehra-text-muted">
                        {alert.villageName} · {alert.stage} · issued{' '}
                        {new Date(alert.issuedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-pehra-text-muted" aria-hidden="true" />
                  </button>
                ))}
            </div>
          )}
        </Panel>

        {/* Telemetry */}
        <Panel>
          <PanelHeader title="Water & rainfall" badge={<DataBadge source="open-meteo" freshnessSeconds={openMeteo?.lastSuccessAt ? (Date.now() - Date.parse(openMeteo.lastSuccessAt)) / 1000 : undefined} staleAfterSeconds={900} />} />
          <div className="divide-y divide-pehra-border-subtle">
            <div className="flex items-baseline justify-between px-4 py-2.5">
              <span className="text-xs text-pehra-text-2">Kurla rainfall now</span>
              <span className="pehra-value text-base font-semibold">
                {openMeteo?.precipitationMm ?? '—'} <span className="text-xs font-normal text-pehra-text-muted">mm</span>
              </span>
            </div>
            {observations.slice(0, 4).map((observation) => (
              <div key={observation.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <span className="min-w-0 truncate text-xs text-pehra-text-2">{observation.location.name || observation.sourceType}</span>
                <span className="pehra-value shrink-0 text-base font-semibold">
                  {observation.value} <span className="text-xs font-normal text-pehra-text-muted">{observation.unit}</span>
                </span>
              </div>
            ))}
            {observations.length === 0 && <div className="px-4 py-4 text-xs text-pehra-text-muted">No water-level observations returned.</div>}
            <div className="px-4 py-2 text-[11px] text-pehra-text-muted">
              Observed {openMeteo?.observedAt ? new Date(openMeteo.observedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'last seeded update'}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        {/* Ward risk board */}
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Ward risk board"
            badge={<DataBadge source="seeded-store" asOf={currentSource} />}
            actions={
              <button type="button" onClick={() => onNavigate('map')} className="flex items-center gap-1 text-xs text-pehra-data-predicted hover:underline">
                GIS view <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            }
          />
          <div className="grid gap-px bg-pehra-border-subtle sm:grid-cols-2">
            {wardRanked.slice(0, 8).map((village) => (
              <button
                key={village.id}
                type="button"
                onClick={() => onNavigate('map')}
                className="flex flex-col gap-1.5 bg-pehra-panel px-3 py-2.5 text-left hover:bg-pehra-raised"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-medium">{village.name}</span>
                  <span className="pehra-value shrink-0 text-xs text-pehra-text-2">{village.waterLevelM} m</span>
                </span>
                <span className="h-1 w-full bg-pehra-bg">
                  <span
                    className={`block h-full ${RISK_BAR[village.riskLevel] || RISK_BAR.SAFE}`}
                    style={{ width: `${Math.min(100, Math.max(8, (village.waterLevelM / 3) * 100))}%` }}
                  />
                </span>
                <span className="flex justify-between text-[10px] text-pehra-text-muted">
                  <span>{village.ward}</span>
                  <span className="pehra-value">{village.riskLevel}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>

        {/* Incidents + readiness */}
        <div className="space-y-3">
          <Panel>
            <PanelHeader
              title="Open incidents"
              badge={<DataBadge source="seeded-store" />}
              actions={
                <button type="button" onClick={() => onNavigate('incidents')} className="text-xs text-pehra-data-predicted hover:underline">
                  Review
                </button>
              }
            />
            <div className="divide-y divide-pehra-border-subtle">
              {activeIncidents.slice(0, 4).map((incident) => (
                <button
                  key={incident.id}
                  type="button"
                  onClick={() => onNavigate('incidents')}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-pehra-raised"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pehra-severity-warning" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium">{incident.title}</span>
                    <span className="block text-[10px] text-pehra-text-muted">
                      {incident.originLocation.name} · {incident.estimatedAffectedPeople.toLocaleString()} affected
                    </span>
                  </span>
                </button>
              ))}
              {activeIncidents.length === 0 && <div className="px-3 py-4 text-xs text-pehra-text-muted">No open incidents.</div>}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Response readiness" badge={<DataBadge source="seeded-store" />} />
            <div className="grid grid-cols-3 divide-x divide-pehra-border-subtle">
              <Metric label="Shelters" value={shelters.length} />
              <Metric label="Hospitals" value={hospitals.length} />
              <Metric label="Reports" value={reports.length} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
