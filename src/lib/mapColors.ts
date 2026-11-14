export type MapColorKey =
  | 'normal'
  | 'advisory'
  | 'watch'
  | 'warning'
  | 'critical'
  | 'live'
  | 'simulated'
  | 'predicted'
  | 'water'
  | 'route'
  | 'shelter'
  | 'hospital';

const variableNames: Record<MapColorKey, string> = {
  normal: '--pehra-severity-normal',
  advisory: '--pehra-severity-advisory',
  watch: '--pehra-severity-watch',
  warning: '--pehra-severity-warning',
  critical: '--pehra-severity-critical',
  live: '--pehra-data-live',
  simulated: '--pehra-data-simulated',
  predicted: '--pehra-data-predicted',
  water: '--pehra-data-live',
  route: '--pehra-data-predicted',
  shelter: '--pehra-severity-advisory',
  hospital: '--pehra-severity-critical',
};

export function getMapColors(): Record<MapColorKey, string> {
  const styles = typeof window === 'undefined' ? null : getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.entries(variableNames).map(([key, variable]) => [
      key,
      styles?.getPropertyValue(variable).trim() || 'transparent',
    ]),
  ) as Record<MapColorKey, string>;
}

export function riskToMapColor(risk: string, colors: Record<MapColorKey, string>): string {
  switch (risk) {
    case 'CRITICAL': return colors.critical;
    case 'HIGH': return colors.warning;
    case 'MODERATE': return colors.watch;
    case 'LOW': return colors.advisory;
    default: return colors.normal;
  }
}
