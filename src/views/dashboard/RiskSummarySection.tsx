import React from 'react';
import { Incident, Village } from '../../types/index.ts';
import { Language, TRANSLATIONS } from '../../utils/i18n.ts';
import { DataBadge, Panel, PanelHeader, StatValue } from '../../components/ui/index.tsx';

export function RiskSummarySection({
  villages,
  incidents,
  language,
}: {
  villages: Village[];
  incidents: Incident[];
  language: Language;
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  return (
    <Panel>
      <PanelHeader title={t.situationTitle} badge={<DataBadge source="seeded-store" />} />
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatValue label={t.currentRisk} value={villages[0]?.riskLevel || 'Not provided'} unit="risk level" asOf="seeded store" badge={<DataBadge source="seeded-store" />} />
        <StatValue label={t.areasMonitored} value={villages.length} unit="villages" asOf="seeded store" badge={<DataBadge source="seeded-store" />} />
        <StatValue label={t.activeIncidents} value={incidents.filter((incident) => incident.status === 'ACTIVE').length} unit="incidents" asOf="seeded store" badge={<DataBadge source="seeded-store" />} />
        <StatValue label={t.populationAffected} value={villages.reduce((total, village) => total + village.exposurePopulation, 0).toLocaleString('en-IN')} unit="people exposed" asOf="seeded store" badge={<DataBadge source="seeded-store" />} />
      </div>
    </Panel>
  );
}
