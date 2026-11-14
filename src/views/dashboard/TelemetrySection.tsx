import React from 'react';
import { Observation } from '../../types/index.ts';
import { DataBadge, EmptyState, Panel, PanelHeader, StatValue } from '../../components/ui/index.tsx';

export function TelemetrySection({
  observations,
  openMeteo,
}: {
  observations: Observation[];
  openMeteo?: {
    lastSuccessAt: string | null;
    lastErrorAt: string | null;
    lastError: string | null;
    precipitationMm?: number | null;
    observedAt?: string | null;
  };
}) {
  const rainfallAvailable = openMeteo?.precipitationMm !== null && openMeteo?.precipitationMm !== undefined;
  return (
    <Panel>
      <PanelHeader title="Telemetry" badge={<DataBadge source="mumbai-flood-adapter" />} />
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        {observations.length > 0 ? observations.slice(0, 4).map((observation) => (
          <StatValue
            key={observation.id}
            label={observation.location.name || observation.sourceType}
            value={observation.value}
            unit={observation.unit}
            asOf={observation.observedAt}
            badge={<DataBadge source="mumbai-flood-adapter" />}
          />
        )) : <EmptyState title="No telemetry returned" description="No seeded water-level observations are available." />}
        <StatValue
          label="Current rainfall, Kurla area"
          value={rainfallAvailable ? (openMeteo?.precipitationMm ?? 'Not provided') : 'Not provided'}
          unit={rainfallAvailable ? 'mm' : ''}
          asOf={openMeteo?.observedAt || 'Not provided'}
          badge={rainfallAvailable
            ? <DataBadge source="open-meteo" freshnessSeconds={openMeteo?.lastSuccessAt ? (Date.now() - Date.parse(openMeteo.lastSuccessAt)) / 1000 : undefined} staleAfterSeconds={900} />
            : <DataBadge source="open-meteo" />}
        />
      </div>
    </Panel>
  );
}
