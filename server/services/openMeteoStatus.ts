const MUMBAI_RAINFALL_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=19.0688&longitude=72.8795&current=precipitation&timezone=Asia%2FKolkata';
const CACHE_MS = 10 * 60 * 1000;

export interface OpenMeteoStatus {
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
}

const status: OpenMeteoStatus = {
  lastSuccessAt: null,
  lastErrorAt: null,
  lastError: null,
};

let lastFetchAt = 0;

export async function refreshOpenMeteoRainfall(): Promise<OpenMeteoStatus> {
  if (Date.now() - lastFetchAt < CACHE_MS) return { ...status };
  lastFetchAt = Date.now();

  try {
    const response = await fetch(MUMBAI_RAINFALL_URL);
    if (!response.ok) throw new Error(`Open-Meteo returned HTTP ${response.status}`);
    const payload = (await response.json()) as { current?: { precipitation?: number } };
    if (typeof payload.current?.precipitation !== 'number') {
      throw new Error('Open-Meteo response did not include current precipitation');
    }
    status.lastSuccessAt = new Date().toISOString();
    status.lastError = null;
  } catch (error) {
    status.lastErrorAt = new Date().toISOString();
    status.lastError = error instanceof Error ? error.message : 'Open-Meteo request failed';
  }

  return { ...status };
}
