import React from 'react';
import { Alert } from '../types/index.ts';
import { DataBadge, SeverityBadge } from './ui/index.tsx';

interface EmergencyBannerProps {
  alerts: Alert[];
  onViewAlert: (alert: Alert) => void;
  onAcknowledge: (alertId: string) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ alerts, onViewAlert, onAcknowledge }) => {
  const activeAlerts = alerts.filter((alert) => alert.status === 'ACTIVE' && (alert.stage === 'CONFIRMED' || alert.stage === 'WARNING'));
  const alert = [...activeAlerts].sort((left, right) => {
    const severityRank = (riskLevel: Alert['riskLevel']) =>
      riskLevel === 'CRITICAL' ? 0 : riskLevel === 'HIGH' ? 1 : riskLevel === 'MODERATE' ? 2 : 3;
    return severityRank(left.riskLevel) - severityRank(right.riskLevel);
  })[0];
  if (!alert) return null;

  return (
    <div
      id="emergency-top-banner"
      className="flex min-h-9 items-center gap-2 border-b border-pehra-border-subtle bg-pehra-panel px-3"
      role="alert"
      aria-label="Emergency alert"
    >
      <span
        className={`h-5 w-0.5 shrink-0 ${
          alert.riskLevel === 'CRITICAL' ? 'bg-pehra-severity-critical' : 'bg-pehra-severity-warning'
        }`}
        aria-hidden="true"
      />
      <SeverityBadge severity={alert.riskLevel} />
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-pehra-text">{alert.title}</span>
      <span className="hidden shrink-0 text-[11px] text-pehra-text-muted sm:inline">{alert.villageName}</span>
      <DataBadge
        source={alert.stage === 'CONFIRMED' ? 'authority' : 'seeded-store'}
        asOf={alert.issuedAt}
        className="hidden lg:inline-flex"
      />
      <button
        type="button"
        onClick={() => onAcknowledge(alert.id)}
        className="shrink-0 border border-pehra-border-control px-2 py-0.5 text-[11px] font-medium text-pehra-text hover:bg-pehra-raised"
      >
        Acknowledge
      </button>
      <button
        type="button"
        onClick={() => onViewAlert(alert)}
        className="shrink-0 text-[11px] font-semibold text-pehra-data-predicted hover:underline"
      >
        View alert
      </button>
    </div>
  );
};
