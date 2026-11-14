import React from 'react';
import { AlertTriangle, ArrowRight, MapPin, Plus, Radio } from 'lucide-react';
import { Village, Incident, Alert, Shelter, Hospital, DataSource, FloodReport, Observation } from '../types/index.ts';
import { Language } from '../utils/i18n.ts';
import { DataBadge, DataTable, Panel, PanelHeader, SeverityBadge, StatValue } from '../components/ui/index.tsx';
import { RiskSummarySection } from './dashboard/RiskSummarySection.tsx';
import { TelemetrySection } from './dashboard/TelemetrySection.tsx';

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
  language = 'en',
  onNavigate,
  onSelectIncident,
  onSelectAlert,
  onOpenReportModal,
}) => {
  const activeAlerts = alerts.filter((alert) => alert.status === 'ACTIVE');
  const activeIncidents = incidents.filter((incident) => incident.status === 'ACTIVE');
  const currentSource = sources[0]?.lastSuccessfulFetch || 'last seeded update';

  return (
    <div className="space-y-4 text-pehra-text">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="pehra-eyebrow">Operations overview</p>
          <h1 className="text-xl font-semibold">Mumbai flood risk console</h1>
          <p className="mt-1 text-sm text-pehra-text-2">A compact view of current risk, warnings, telemetry and response activity.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onNavigate('map')} className="inline-flex min-h-8 items-center gap-1 border border-pehra-border-control bg-pehra-raised px-3 py-1.5 text-sm text-pehra-text hover:bg-pehra-panel"><MapPin className="h-3.5 w-3.5" /> Open map</button>
          <button type="button" onClick={onOpenReportModal} className="inline-flex min-h-8 items-center gap-1 border border-pehra-border-control bg-pehra-action px-3 py-1.5 text-sm text-pehra-action-text hover:bg-pehra-raised"><Plus className="h-3.5 w-3.5" /> Report flood</button>
        </div>
      </div>

      <RiskSummarySection villages={villages} incidents={incidents} language={language} />

      <Panel>
        <PanelHeader title="Active alerts" badge={<DataBadge source="seeded-store" asOf={currentSource} />} actions={<button type="button" onClick={() => onNavigate('alerts')} className="text-xs text-pehra-focus">View all <ArrowRight className="inline h-3 w-3" /></button>} />
        <DataTable
          caption="Current active flood alerts"
          rows={activeAlerts}
          emptyTitle="No active alerts"
          columns={[
            { key: 'level', header: 'Level', render: (alert) => <SeverityBadge severity={alert.riskLevel} />, sortValue: (alert) => alert.riskLevel },
            { key: 'area', header: 'Area', render: (alert) => alert.villageName || 'Not provided', sortValue: (alert) => alert.villageName || '' },
            { key: 'issued', header: 'Issued', render: (alert) => alert.issuedAt, sortValue: (alert) => alert.issuedAt },
            { key: 'valid', header: 'Valid until', render: (alert) => alert.expiresAt || 'Not provided' },
            { key: 'source', header: 'Data type', render: (alert) => <DataBadge source={alert.stage === 'CONFIRMED' ? 'authority' : 'seeded-store'} authorityConfirmed={alert.stage === 'CONFIRMED'} /> },
            { key: 'action', header: 'Action', render: () => 'Follow the official advisory' },
          ]}
        />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Map preview" badge={<DataBadge source="seeded-store" asOf={currentSource} />} actions={<button type="button" onClick={() => onNavigate('map')} className="text-xs text-pehra-focus">Open GIS <ArrowRight className="inline h-3 w-3" /></button>} />
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            {villages.slice(0, 6).map((village) => (
              <button key={village.id} type="button" onClick={() => onNavigate('map')} className="flex items-start gap-2 border border-pehra-border-subtle bg-pehra-raised p-3 text-left hover:bg-pehra-panel">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pehra-text-2" />
                <span className="min-w-0"><span className="block truncate text-sm font-medium">{village.name}</span><span className="block text-xs text-pehra-text-2">{village.ward} · {village.riskLevel}</span></span>
              </button>
            ))}
          </div>
        </Panel>
        <TelemetrySection observations={observations} openMeteo={openMeteo} />
      </div>

      <Panel>
        <PanelHeader title="Incidents" badge={<DataBadge source="seeded-store" asOf={currentSource} />} actions={<button type="button" onClick={() => onNavigate('incidents')} className="text-xs text-pehra-focus">Open incidents <ArrowRight className="inline h-3 w-3" /></button>} />
        <DataTable
          caption="Active response incidents"
          rows={activeIncidents}
          emptyTitle="No active incidents"
          columns={[
            { key: 'title', header: 'Incident', render: (incident) => incident.title, sortValue: (incident) => incident.title },
            { key: 'status', header: 'Status', render: (incident) => incident.status },
            { key: 'location', header: 'Location', render: (incident) => incident.originLocation.name || 'Not provided' },
            { key: 'reported', header: 'Reported', render: (incident) => incident.originTimestamp || 'Not provided', sortValue: (incident) => incident.originTimestamp },
            { key: 'open', header: 'Open', render: (incident) => <button type="button" onClick={() => onSelectIncident?.(incident)} className="text-pehra-focus">Review</button> },
          ]}
        />
      </Panel>

      <Panel>
        <PanelHeader title="Response readiness" badge={<DataBadge source="seeded-store" />} />
        <div className="grid gap-3 p-3 sm:grid-cols-3">
          <StatValue label="Shelters" value={shelters.length} unit="locations" asOf={currentSource} badge={<DataBadge source="seeded-store" />} />
          <StatValue label="Hospitals" value={hospitals.length} unit="locations" asOf={currentSource} badge={<DataBadge source="seeded-store" />} />
          <StatValue label="Reports received" value={reports.length} unit="reports" asOf={currentSource} badge={<DataBadge source="seeded-store" />} />
        </div>
      </Panel>

      {activeAlerts.some((alert) => alert.riskLevel === 'CRITICAL') && (
        <div className="flex items-center gap-2 border-l-2 border-pehra-severity-critical bg-pehra-panel px-3 py-2 text-sm" role="status">
          <AlertTriangle className="h-4 w-4 text-pehra-severity-critical" />
          <span>Critical alerts require acknowledgement in Early warnings.</span>
          <Radio className="ml-auto h-4 w-4 text-pehra-text-muted" />
        </div>
      )}
    </div>
  );
};
