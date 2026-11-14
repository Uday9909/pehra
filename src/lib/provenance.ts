export type DataType =
  | 'live'
  | 'simulated'
  | 'predicted'
  | 'cached'
  | 'stale'
  | 'unavailable'
  | 'confirmed'
  | 'ai-generated';

export type ProvenanceSource =
  | 'seeded-store'
  | 'mumbai-flood-adapter'
  | 'open-meteo'
  | 'gemini-fallback'
  | 'gemini'
  | 'authority';

const SOURCE_TYPES: Record<ProvenanceSource, DataType> = {
  'seeded-store': 'simulated',
  'mumbai-flood-adapter': 'simulated',
  'open-meteo': 'live',
  'gemini-fallback': 'cached',
  gemini: 'ai-generated',
  authority: 'confirmed',
};

export interface ProvenanceOptions {
  source: ProvenanceSource;
  freshnessSeconds?: number;
  staleAfterSeconds?: number;
  authorityConfirmed?: boolean;
}

export function getDataType({
  source,
  freshnessSeconds,
  staleAfterSeconds,
  authorityConfirmed = false,
}: ProvenanceOptions): DataType {
  if (authorityConfirmed || source === 'authority') return 'confirmed';
  if (
    freshnessSeconds !== undefined &&
    staleAfterSeconds !== undefined &&
    freshnessSeconds > staleAfterSeconds
  ) {
    return 'stale';
  }
  if (source === 'open-meteo' && freshnessSeconds === undefined) return 'unavailable';
  return SOURCE_TYPES[source];
}

export interface DataTypeMeta {
  label: string;
  icon: 'radio' | 'triangle' | 'dashed' | 'clock' | 'shield' | 'sparkles' | 'alert';
}

export const DATA_TYPE_META: Record<DataType, DataTypeMeta> = {
  live: { label: 'Live', icon: 'radio' },
  simulated: { label: 'Simulated', icon: 'triangle' },
  predicted: { label: 'Predicted', icon: 'dashed' },
  cached: { label: 'Cached', icon: 'clock' },
  stale: { label: 'Stale', icon: 'alert' },
  unavailable: { label: 'Unavailable', icon: 'alert' },
  confirmed: { label: 'Authority confirmed', icon: 'shield' },
  'ai-generated': { label: 'AI-generated', icon: 'sparkles' },
};
