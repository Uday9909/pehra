const DEFAULT_MUMBAI_RAINFALL_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=19.0688&longitude=72.8795&current=precipitation&timezone=Asia%2FKolkata';
const CACHE_MS = 10 * 60 * 1000;

export interface OpenMeteoStatus {
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  precipitationMm: number | null;
  observedAt: string | null;
}

const status: OpenMeteoStatus = {
  lastSuccessAt: null,
  lastErrorAt: null,
  lastError: null,
  precipitationMm: null,
  observedAt: null,
};

let lastFetchAt = 0;

export async function refreshOpenMeteoRainfall(): Promise<OpenMeteoStatus> {
  if (Date.now() - lastFetchAt < CACHE_MS) return { ...status };
  lastFetchAt = Date.now();

  try {
    const url = process.env.OPEN_METEO_URL || DEFAULT_MUMBAI_RAINFALL_URL;
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error(`Open-Meteo returned HTTP ${response.status}`);
    const payload = (await response.json()) as { current?: { precipitation?: number; time?: string } };
    if (typeof payload.current?.precipitation !== 'number') {
      throw new Error('Open-Meteo response did not include current precipitation');
    }
    status.lastSuccessAt = new Date().toISOString();
    status.lastError = null;
    status.precipitationMm = payload.current.precipitation;
    status.observedAt = payload.current.time || status.lastSuccessAt;
  } catch (error) {
    status.lastErrorAt = new Date().toISOString();
    status.lastError = error instanceof Error ? error.message : 'Open-Meteo request failed';
  }

  return { ...status };
}
