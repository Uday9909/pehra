import React from 'react';
import { Alert } from '../types/index.ts';
import { AlertBanner, Button, DataBadge } from './ui/index.tsx';

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
    <div id="emergency-top-banner" className="w-full px-3 py-2" aria-label="Emergency alert">
      <AlertBanner alert={alert}>
        <DataBadge source={alert.stage === 'CONFIRMED' ? 'authority' : 'seeded-store'} asOf={alert.issuedAt} />
        <Button variant="secondary" onClick={() => onAcknowledge(alert.id)}>Acknowledge</Button>
        <Button variant="ghost" onClick={() => onViewAlert(alert)}>View alert</Button>
      </AlertBanner>
    </div>
  );
};
