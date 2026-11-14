import React, { useMemo, useState } from 'react';
import { Alert, AlertStage, EvacuationRoute, Shelter, UserRole, Village } from '../types/index.ts';
import {
  AlertRow,
  Button,
  DataBadge,
  EmptyState,
  Panel,
  PanelHeader,
  SeverityBadge,
} from '../components/ui/index.tsx';

interface AlertsViewProps {
  alerts: Alert[];
  villages: Village[];
  shelters: Shelter[];
  routes: EvacuationRoute[];
  activeRole: UserRole;
  onCreateAlert: (alertData: any) => Promise<void>;
  onApproveAlert: (alertId: string, reason: string) => Promise<void>;
  onAcknowledgeAlert: (alertId: string) => Promise<void>;
  onNavigate: (tab: string) => void;
}

const severityOrder = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3, SAFE: 4 } as const;

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, activeRole, onAcknowledgeAlert }) => {
  const [stage, setStage] = useState<'ALL' | AlertStage>('ALL');
  const isAuthority = ['AUTHORITY', 'ADMIN', 'SUPER_ADMIN'].includes(activeRole);
  const filteredAlerts = useMemo(
    () =>
      alerts
        .filter((alert) => stage === 'ALL' || alert.stage === stage)
        .sort(
          (left, right) =>
            severityOrder[left.riskLevel] - severityOrder[right.riskLevel] ||
            Date.parse(right.issuedAt) - Date.parse(left.issuedAt)
        ),
    [alerts, stage]
  );

  return (
    <div className="space-y-4 pb-12">
      <Panel>
        <PanelHeader
          title="Early warnings"
          badge={<DataBadge source="seeded-store" />}
          actions={isAuthority ? <Button variant="secondary">Issue alert</Button> : undefined}
        />
        <div className="flex flex-wrap gap-1 border-b border-pehra-border-subtle p-2" role="tablist" aria-label="Alert stage filter">
          {(['ALL', 'CONFIRMED', 'WARNING', 'WATCH'] as const).map((value) => (
            <Button
              key={value}
              variant={stage === value ? 'primary' : 'ghost'}
              onClick={() => setStage(value)}
              aria-pressed={stage === value}
            >
              {value}
            </Button>
          ))}
        </div>
        {filteredAlerts.length === 0 ? (
          <EmptyState title="No alerts" description="No alerts match the selected stage." />
        ) : (
          <div role="list" aria-label="Flood alerts">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} role="listitem" className="border-b border-pehra-border-subtle last:border-b-0">
                <AlertRow
                  title={alert.title}
                  area={alert.villageName}
                  severity={alert.riskLevel}
                  issuedAt={new Date(alert.issuedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  validUntil={new Date(alert.expiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  source={alert.stage === 'CONFIRMED' ? 'Authority-confirmed alert' : 'Not provided'}
                  recommendedAction="Not provided"
                  action="Not provided"
                  badge={
                    <DataBadge
                      source={alert.stage === 'CONFIRMED' ? 'authority' : 'seeded-store'}
                      authorityConfirmed={alert.stage === 'CONFIRMED'}
                      asOf={alert.issuedAt}
                    />
                  }
                />
                <div className="flex flex-wrap items-center gap-3 px-3 pb-2 text-xs text-pehra-text-2">
                  <SeverityBadge severity={alert.riskLevel} />
                  <span>Status: {alert.status}</span>
                  <span>Confidence: {alert.confidence}</span>
                  <Button variant="ghost" onClick={() => onAcknowledgeAlert(alert.id)}>
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};
