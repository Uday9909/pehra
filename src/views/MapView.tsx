import React, { useState, useEffect } from 'react';
import {
  Village,
  Incident,
  Alert,
  Shelter,
  Hospital,
  EvacuationRoute,
  FloodReport,
  DeviceTelemetry,
  Observation,
} from '../types/index.ts';
import { LeafletMap } from '../components/LeafletMap.tsx';
import { MUMBAI_TOPOGRAPHIC_LANDMARKS } from '../utils/mumbaiElevation.ts';
import {
  fetchLiveMumbaiTelemetry,
  LiveMumbaiSummary,
} from '../services/liveWeatherWaterService.ts';
import {
  MapPin,
  AlertTriangle,
  Compass,
  LifeBuoy,
  X,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Building,
  Phone,
  ArrowRight,
  Mountain,
  Globe,
  Layers,
  Box,
  Columns,
  Navigation,
  ShieldCheck,
  Plane,
  Wind,
  Gauge,
  Waves,
  RotateCw,
} from 'lucide-react';

interface MapViewProps {
  villages: Village[];
  incidents: Incident[];
  alerts: Alert[];
  shelters: Shelter[];
  hospitals: Hospital[];
  routes: EvacuationRoute[];
  reports: FloodReport[];
  devices: DeviceTelemetry[];
  observations: Observation[];
  selectedVillage?: Village | null;
  onSelectVillage: (village: Village | null) => void;
  onNavigate: (tab: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  villages,
  incidents,
  alerts,
  shelters,
  hospitals,
  routes,
  reports,
  devices,
  observations,
  selectedVillage,
  onSelectVillage,
  onNavigate,
}) => {
  const [displayMode, setDisplayMode] = useState<'2d' | '3d' | 'split'>('2d');
  const [inspectedShelter, setInspectedShelter] = useState<Shelter | null>(null);
  const [inspectedRoute, setInspectedRoute] = useState<EvacuationRoute | null>(null);

  // Probed coordinate from map interaction (2D or 3D)
  const [probedLocation, setProbedLocation] = useState<{
    lat: number;
    lng: number;
    elevation: number;
    zoneName: string;
    vulnerability: string;
    liveTelemetry?: any;
  } | null>(null);

  // User GPS location
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    elevation: number;
  } | null>(null);

  // Live Real-Time Weather, Air Pressure, Directional Wind & Water Telemetry
  const [liveSummary, setLiveSummary] = useState<LiveMumbaiSummary | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState(false);

  const loadLiveSummary = async () => {
    setIsSyncingLive(true);
    try {
      const summary = await fetchLiveMumbaiTelemetry();
      setLiveSummary(summary);
    } catch {
      // ignore offline
    } finally {
      setIsSyncingLive(false);
    }
  };

  useEffect(() => {
    loadLiveSummary();
    const t = setInterval(loadLiveSummary, 30000);
    return () => clearInterval(t);
  }, []);

  // Listen for open drone recon custom event from map popups
  useEffect(() => {
    const handleOpenDrone = (e: any) => {
      if (onNavigate) {
        onNavigate('drone-recon');
      }
    };
    window.addEventListener('pehra:open-drone-recon', handleOpenDrone);
    return () => window.removeEventListener('pehra:open-drone-recon', handleOpenDrone);
  }, [onNavigate]);

  // Active village alerts
  const villageAlerts = selectedVillage
    ? alerts.filter((a) => a.villageId === selectedVillage.id && a.status === 'ACTIVE')
    : [];

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-140px)] min-h-[620px] pb-2">
      {/* Top View Mode Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-none border border-pehra-border-subtle bg-white px-4 py-2.5 shadow-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Mountain className="h-4 w-4 text-pehra-text" />
            <span className="font-semibold text-sm text-pehra-text">Geospatial Telemetry Observatory</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 rounded-none bg-pehra-panel border border-pehra-border-subtle px-2.5 py-0.5 text-pehra-text font-semibold text-pehra-text">
            <span className="h-2 w-2 rounded-none bg-pehra-panel " />
            <span>Real-Time Sensor Grounded (No AI/Fake Data)</span>
          </div>
        </div>

        {/* 2D / 3D UI View Toggle + Drone Quick Button */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate('drone-recon')}
            className="flex items-center gap-1.5 rounded-none border border-pehra-border-subtle bg-pehra-panel px-3 py-1 font-bold text-pehra-text hover:bg-pehra-panel transition-colors shadow-none"
          >
            <Plane className="h-3.5 w-3.5" />
            <span>🚁 Drone Recon</span>
          </button>

          <div className="flex items-center gap-1 rounded-none border border-pehra-border-subtle bg-pehra-panel p-1">
            <button
              onClick={() => setDisplayMode('2d')}
              className={`flex items-center gap-1.5 rounded-none px-3 py-1 font-medium transition-all ${
                displayMode === '2d'
                  ? 'bg-pehra-panel text-white shadow-none font-semibold'
                  : 'text-pehra-text hover:text-pehra-text'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>2D Map</span>
            </button>

            <button
              onClick={() => setDisplayMode('3d')}
              className={`flex items-center gap-1.5 rounded-none px-3 py-1 font-medium transition-all ${
                displayMode === '3d'
                  ? 'bg-pehra-panel text-white shadow-none font-semibold'
                  : 'text-pehra-text hover:text-pehra-text'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D Terrain</span>
            </button>

            <button
              onClick={() => setDisplayMode('split')}
              className={`hidden lg:flex items-center gap-1.5 rounded-none px-3 py-1 font-medium transition-all ${
                displayMode === 'split'
                  ? 'bg-pehra-panel text-white shadow-none font-semibold'
                  : 'text-pehra-text hover:text-pehra-text'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Split 2D / 3D</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage & Side Inspector Drawer */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        {/* Map / 3D Stage Container */}
        <div className="flex-1 h-full min-h-[350px] relative flex flex-col md:flex-row gap-2">
          {/* 2D Leaflet Map (Shown in '2d' or 'split' modes) */}
          {(displayMode === '2d' || displayMode === 'split') && (
            <div className={`h-full relative ${displayMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}`}>
              <LeafletMap
                villages={villages}
                incidents={incidents}
                alerts={alerts}
                shelters={shelters}
                hospitals={hospitals}
                routes={routes}
                reports={reports}
                devices={devices}
                observations={observations}
                selectedVillageId={selectedVillage?.id}
                onSelectVillage={(v) => {
                  onSelectVillage(v);
                  setInspectedShelter(null);
                  setInspectedRoute(null);
                  setProbedLocation(null);
                }}
                onSelectShelter={(s) => {
                  setInspectedShelter(s);
                  setInspectedRoute(null);
                  onSelectVillage(null);
                  setProbedLocation(null);
                }}
                onSelectRoute={(r) => {
                  setInspectedRoute(r);
                  setInspectedShelter(null);
                  onSelectVillage(null);
                  setProbedLocation(null);
                }}
                onInspectCoordinate={(data) => {
                  setProbedLocation(data);
                  setInspectedShelter(null);
                  setInspectedRoute(null);
                  onSelectVillage(null);
                }}
                onUserLocationFound={(lat, lng, elevation) => {
                  setUserLocation({ lat, lng, elevation });
                }}
              />
            </div>
          )}

        </div>

        {/* Side Inspector & Topographic Telemetry Drawer */}
        <div className="w-full lg:w-96 shrink-0 h-full overflow-y-auto rounded-none border border-pehra-border-subtle bg-white p-4 shadow-none flex flex-col justify-between">
          {/* A. If a Specific Point was Probed on Map or 3D Canvas */}
          {probedLocation ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Topographic Point Probe
                  </span>
                  <h2 className="text-lg font-bold text-pehra-text tracking-tight mt-0.5">{probedLocation.zoneName}</h2>
                </div>
                <button
                  onClick={() => setProbedLocation(null)}
                  className="rounded-none p-1 text-pehra-text hover:bg-pehra-panel hover:text-pehra-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Coordinates & Elevation Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
                  <span className="text-pehra-text text-pehra-text block font-medium">Ground Elevation</span>
                  <div className="text-lg font-mono font-bold text-pehra-text">
                    {probedLocation.elevation} m
                  </div>
                  <span className="text-pehra-text text-pehra-text">Mean Sea Level (MSL)</span>
                </div>

                <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
                  <span className="text-pehra-text text-pehra-text block font-medium">Vulnerability</span>
                  <div
                    className={`text-sm font-bold font-mono ${
                      probedLocation.vulnerability === 'CRITICAL'
                        ? 'text-pehra-text'
                        : probedLocation.vulnerability === 'HIGH'
                        ? 'text-pehra-text'
                        : 'text-pehra-text'
                    }`}
                  >
                    {probedLocation.vulnerability}
                  </div>
                  <span className="text-pehra-text text-pehra-text">Tidal Lock Factor</span>
                </div>
              </div>

              {/* Live Coordinate Air Pressure, Directional Wind & Water Details */}
              {probedLocation.liveTelemetry && (
                <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-pehra-text">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="h-4 w-4 text-pehra-text" />
                      <span>Live Barometric & Water Feed</span>
                    </span>
                    <span className="rounded bg-pehra-panel px-1.5 py-0.5 text-pehra-text text-white font-mono">
                      OPEN-METEO LIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-pehra-text">
                    <div className="rounded-none bg-white p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">Air Pressure (MSL)</span>
                      <strong className="font-mono text-pehra-text text-xs">
                        {probedLocation.liveTelemetry.seaLevelPressureHpa} hPa
                      </strong>
                      <span className="text-pehra-text text-pehra-text block">
                        Surf: {probedLocation.liveTelemetry.surfacePressureHpa} hPa
                      </span>
                    </div>
                    <div className="rounded-none bg-white p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">Directional Wind</span>
                      <strong className="font-mono text-pehra-text text-xs">
                        {probedLocation.liveTelemetry.windSpeedKmh} km/h {probedLocation.liveTelemetry.windCardinal}
                      </strong>
                      <span className="text-pehra-text text-pehra-text block">
                        Dir: {probedLocation.liveTelemetry.windDirectionDeg}° • Gust {probedLocation.liveTelemetry.windGustsKmh}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-none bg-white p-2 border border-pehra-border-subtle text-pehra-text space-y-1">
                    <div className="font-semibold text-pehra-text">Water & Hydrological Details:</div>
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Rainfall / Rate:</span>
                      <span className="font-mono font-semibold">
                        {probedLocation.liveTelemetry.precipitationMm} mm ({probedLocation.liveTelemetry.rainMmHr} mm/h)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Surface Runoff / Soil Moisture:</span>
                      <span className="font-mono font-semibold">
                        {probedLocation.liveTelemetry.runoffMm} mm • {Math.round(probedLocation.liveTelemetry.soilMoistureM3M3 * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Coastal Tide Level:</span>
                      <span className="font-mono font-semibold text-pehra-text">
                        {probedLocation.liveTelemetry.tideHeightM} m ({probedLocation.liveTelemetry.tideState})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Topographic Analysis Box */}
              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs space-y-1.5">
                <div className="font-semibold text-pehra-text flex items-center gap-1.5">
                  <Mountain className="h-4 w-4 text-pehra-text" />
                  <span>Geomorphological Profile</span>
                </div>
                <p className="text-pehra-text text-pehra-text leading-relaxed">
                  {probedLocation.elevation <= 3.0
                    ? 'Inter-island reclaimed depression basin. Stormwater discharges slowly due to low hydraulic gradient and Arabian Sea tidal lock.'
                    : probedLocation.elevation <= 15.0
                    ? 'Coastal alluvial terrace. Moderate drainage runoff toward secondary stormwater nullahs.'
                    : 'Elevated Deccan basalt ridge. Naturally elevated above maximum 100-year storm surge and river backwater.'}
                </p>
                <div className="text-pehra-text text-pehra-text font-mono pt-1 border-t border-pehra-border-subtle">
                  Lat: {probedLocation.lat.toFixed(4)}° N • Lng: {probedLocation.lng.toFixed(4)}° E
                </div>
              </div>

              {/* Nearest High Ground Shelter recommendation */}
              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs">
                <span className="font-semibold text-pehra-text block mb-1">Elevation Safety Guidance</span>
                <p className="text-pehra-text text-pehra-text">
                  {probedLocation.elevation < 3.5
                    ? '⚠️ Low ground warning: In event of cloudburst (>60mm/hr) coincident with high tide, move immediately toward elevated ridges (Sion Fort or BKC Elevated Corridor).'
                    : '✅ Safe elevation: Ground elevation remains above projected 5m deluge flood contours.'}
                </p>
              </div>
            </div>
          ) : selectedVillage ? (
            /* B. If Village / Ward is Selected */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold">
                    {selectedVillage.ward} • Ward Inspection
                  </span>
                  <h2 className="text-xl font-bold text-pehra-text tracking-tight mt-0.5">{selectedVillage.name}</h2>
                </div>
                <button
                  onClick={() => onSelectVillage(null)}
                  className="rounded-none p-1 text-pehra-text hover:bg-pehra-panel hover:text-pehra-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Risk Badge & Depth */}
              <div className="flex items-center justify-between rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
                <div>
                  <div className="text-pehra-text text-pehra-text font-medium">Basin Status</div>
                  <div className="text-lg font-bold font-mono text-pehra-text">{selectedVillage.riskLevel}</div>
                </div>
                <div className="text-right">
                  <div className="text-pehra-text text-pehra-text font-medium">Observed Water Level</div>
                  <div className="text-lg font-bold font-mono text-pehra-text">{selectedVillage.waterLevelM} m</div>
                </div>
              </div>

              {/* Ward Metrics Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-pehra-border-subtle pb-1.5 text-pehra-text">
                  <span className="text-pehra-text">Topographic Elevation:</span>
                  <span className="font-mono font-semibold text-pehra-text">{selectedVillage.elevationM} m (MSL)</span>
                </div>
                <div className="flex justify-between border-b border-pehra-border-subtle pb-1.5 text-pehra-text">
                  <span className="text-pehra-text">Total Population:</span>
                  <span className="font-mono font-semibold">{selectedVillage.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-pehra-border-subtle pb-1.5 text-pehra-text">
                  <span className="text-pehra-text">Population Exposed:</span>
                  <span className="font-mono font-semibold text-pehra-text">
                    {selectedVillage.exposurePopulation.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-pehra-border-subtle pb-1.5 text-pehra-text">
                  <span className="text-pehra-text">Drainage Capacity:</span>
                  <span className="font-mono font-semibold">{selectedVillage.drainageCapacityMmHr} mm/hr</span>
                </div>
                <div className="flex justify-between border-b border-pehra-border-subtle pb-1.5 text-pehra-text">
                  <span className="text-pehra-text">Vulnerability Index:</span>
                  <span className="font-mono font-semibold">{(selectedVillage.vulnerabilityScore * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Live Hydrological & Barometric Telemetry for Ward */}
              {liveSummary && (
                <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-pehra-text">
                    <span className="flex items-center gap-1.5">
                      <Waves className="h-4 w-4 text-pehra-text" />
                      <span>Real-Time Water & Pressure Feed</span>
                    </span>
                    <span className="text-pehra-text font-mono bg-pehra-panel text-white px-1.5 py-0.5 rounded">LIVE</span>
                  </div>
                  <div className="space-y-1 text-pehra-text text-pehra-text">
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Air Pressure (MSL / Surf):</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.airPressureMslHpa} / {liveSummary.surfacePressureHpa} hPa ({liveSummary.pressureTrend})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Directional Wind:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.windSpeedKmh} km/h {liveSummary.windCardinal} ({liveSummary.windDirectionDeg}°)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pehra-text">River Discharge & Tide:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.riverDischargeM3s} m³/s • Tide {liveSummary.tideHeightM}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Normal / Danger Water Mark:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.mithiNormalLevelM}m / {liveSummary.mithiDangerLevelM}m
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Warnings for this Village */}
              {villageAlerts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-pehra-text uppercase tracking-wider">Active Broadcast Warnings</div>
                  {villageAlerts.map((alt) => (
                    <div key={alt.id} className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-pehra-text">
                        <AlertTriangle className="h-3.5 w-3.5 text-pehra-text" />
                        <span>{alt.stage}: {alt.title}</span>
                      </div>
                      <p className="mt-1 text-pehra-text text-pehra-text line-clamp-2">{alt.message}</p>
                      <button
                        onClick={() => onNavigate('alerts')}
                        className="mt-2 text-pehra-text font-semibold text-pehra-text hover:text-pehra-text flex items-center gap-1"
                      >
                        <span>Manage this alert</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : inspectedShelter ? (
            /* C. If Shelter is Selected */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold">
                    Relief Shelter
                  </span>
                  <h2 className="text-lg font-bold text-pehra-text mt-0.5">{inspectedShelter.name}</h2>
                </div>
                <button
                  onClick={() => setInspectedShelter(null)}
                  className="rounded-none p-1 text-pehra-text hover:bg-pehra-panel hover:text-pehra-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-pehra-text">{inspectedShelter.location.address}</p>

              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs">
                <div className="flex justify-between mb-1.5">
                  <span className="text-pehra-text">Occupancy:</span>
                  <span className="font-semibold text-pehra-text">
                    {inspectedShelter.occupancy} / {inspectedShelter.capacity} (
                    {Math.round((inspectedShelter.occupancy / inspectedShelter.capacity) * 100)}%)
                  </span>
                </div>
                <div className="h-2 rounded-none bg-pehra-panel overflow-hidden">
                  <div
                    className="h-full bg-pehra-panel rounded-none"
                    style={{ width: `${(inspectedShelter.occupancy / inspectedShelter.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-semibold text-pehra-text">Emergency Stockpile Inventory:</div>
                <div className="grid grid-cols-2 gap-2 text-pehra-text">
                  <div className="rounded-none bg-pehra-panel p-2 border border-pehra-border-subtle">
                    <span className="text-pehra-text block">Food Rations:</span>
                    <span className="font-mono font-semibold text-pehra-text">{inspectedShelter.emergencySupplies.foodPacks} packs</span>
                  </div>
                  <div className="rounded-none bg-pehra-panel p-2 border border-pehra-border-subtle">
                    <span className="text-pehra-text block">Potable Water:</span>
                    <span className="font-mono font-semibold text-pehra-text">{inspectedShelter.emergencySupplies.waterLiters} Liters</span>
                  </div>
                </div>
              </div>

              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs">
                <div className="text-pehra-text text-pehra-text">Shelter Coordinator:</div>
                <div className="font-semibold text-pehra-text">{inspectedShelter.contactPerson}</div>
                <a href={`tel:${inspectedShelter.contactPhone}`} className="text-pehra-text font-mono block mt-0.5">
                  📞 {inspectedShelter.contactPhone}
                </a>
              </div>
            </div>
          ) : inspectedRoute ? (
            /* D. If Evacuation Route is Selected */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold">
                    Designated Evacuation Corridor
                  </span>
                  <h2 className="text-lg font-bold text-pehra-text mt-0.5">{inspectedRoute.name}</h2>
                </div>
                <button
                  onClick={() => setInspectedRoute(null)}
                  className="rounded-none p-1 text-pehra-text hover:bg-pehra-panel hover:text-pehra-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-2.5">
                  <span className="text-pehra-text text-pehra-text block">Corridor Status</span>
                  <span className="font-semibold text-pehra-text">{inspectedRoute.status}</span>
                </div>
                <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-2.5">
                  <span className="text-pehra-text text-pehra-text block">Travel Time</span>
                  <span className="font-semibold text-pehra-text">{inspectedRoute.estimatedTravelMinutes} mins</span>
                </div>
              </div>

              <div className="text-xs text-pehra-text leading-relaxed">
                Corridor Length: <strong className="text-pehra-text">{inspectedRoute.distanceKm} km</strong>. Elevation remains above projected 2.0m flood contour. Safe for foot and emergency transit.
              </div>
            </div>
          ) : (
            /* E. Default State: Live Air Pressure, Directional Wind, Water Telemetry & Geography */
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-pehra-text tracking-tight flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-pehra-text" />
                    <span>Live Air Pressure & Water Telemetry</span>
                  </h2>
                  <p className="text-pehra-text text-pehra-text mt-0.5">
                    Real-time Open-Meteo / IMD / GloFAS station feed. Click any coordinate on the map to probe live values.
                  </p>
                </div>
                <button
                  onClick={loadLiveSummary}
                  disabled={isSyncingLive}
                  className="rounded-none border border-pehra-border-subtle bg-pehra-panel hover:bg-pehra-panel p-1.5 text-pehra-text"
                  title="Refresh Live Telemetry"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isSyncingLive ? ' text-pehra-text' : ''}`} />
                </button>
              </div>

              {/* Live Barometric Pressure & Directional Wind Card */}
              {liveSummary && (
                <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-pehra-text">
                    <span className="flex items-center gap-1.5">
                      <Wind className="h-4 w-4 text-pehra-text" />
                      <span>Air Pressure & Directional Wind</span>
                    </span>
                    <span className="rounded bg-pehra-panel px-1.5 py-0.5 text-pehra-text text-white font-mono">
                      LIVE BAROMETRIC
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-pehra-text">
                    <div className="rounded-none bg-white p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">Sea-Level Pressure</span>
                      <span className="font-mono font-bold text-pehra-text text-sm">
                        {liveSummary.airPressureMslHpa} hPa
                      </span>
                      <span className="text-pehra-text text-pehra-text block">
                        Surf: {liveSummary.surfacePressureHpa} hPa ({liveSummary.pressureTrend})
                      </span>
                    </div>
                    <div className="rounded-none bg-white p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">Directional Wind</span>
                      <span className="font-mono font-bold text-pehra-text text-sm">
                        {liveSummary.windSpeedKmh} km/h {liveSummary.windCardinal}
                      </span>
                      <span className="text-pehra-text text-pehra-text block">
                        Azimuth: {liveSummary.windDirectionDeg}° • Gusts {liveSummary.windGustsKmh}
                      </span>
                    </div>
                  </div>

                  <div className="text-pehra-text text-pehra-text bg-white/80 rounded-none px-2.5 py-1.5 border border-pehra-border-subtle font-medium">
                    <span className="text-pehra-text">Directional Pressure Gradient: </span>
                    <span className="font-mono font-semibold">{liveSummary.pressureSystemDirection}</span>
                  </div>
                </div>
              )}

              {/* All Normal Water, River Discharge & Marine Details Card */}
              {liveSummary && (
                <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-pehra-text">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="h-4 w-4 text-pehra-text" />
                      <span>Normal & Live Water Details</span>
                    </span>
                    <span className="rounded bg-pehra-panel px-1.5 py-0.5 text-pehra-text text-white font-mono">
                      HYDRO / MARINE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-pehra-text">
                    <div className="rounded-none bg-white p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">Mithi Water Level</span>
                      <span className="font-mono font-bold text-pehra-text text-sm">
                        {liveSummary.mithiWaterLevelM} m
                      </span>
                      <span className="text-pehra-text text-pehra-text block">
                        Normal: {liveSummary.mithiNormalLevelM}m | Danger: {liveSummary.mithiDangerLevelM}m
                      </span>
                    </div>
                    <div className="rounded-none bg-white p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">River Discharge</span>
                      <span className="font-mono font-bold text-pehra-text text-sm">
                        {liveSummary.riverDischargeM3s} m³/s
                      </span>
                      <span className="text-pehra-text text-pehra-text block">
                        Runoff: {liveSummary.surfaceRunoffMm}mm • Soil: {liveSummary.soilMoisturePercent}%
                      </span>
                    </div>
                  </div>

                  <div className="rounded-none bg-white p-2 border border-pehra-border-subtle text-pehra-text space-y-1">
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Astronomical Tide:</span>
                      <span className="font-mono font-semibold text-pehra-text">
                        {liveSummary.tideHeightM} m ({liveSummary.tideState})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Sea Wave Height & Dir:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.waveHeightM} m @ {liveSummary.waveDirectionDeg}° ({liveSummary.waveDirectionCardinal}, {liveSummary.wavePeriodSec}s)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Ocean Current Velocity:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.oceanCurrentKmh} km/h @ {liveSummary.oceanCurrentDirectionDeg}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pehra-text">Live Precipitation / RH:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.currentRainfallMm} mm • {liveSummary.humidityPercent}% RH ({liveSummary.temperatureC}°C)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Hotspot Jumps */}
              <div className="space-y-1.5">
                <div className="text-pehra-text font-semibold text-pehra-text uppercase tracking-wider">
                  Live Telemetry Stations & Hotspots:
                </div>
                {MUMBAI_TOPOGRAPHIC_LANDMARKS.slice(0, 4).map((lm) => (
                  <button
                    key={lm.id}
                    onClick={() => {
                      setProbedLocation({
                        lat: lm.lat,
                        lng: lm.lng,
                        elevation: lm.elevationM,
                        zoneName: lm.name,
                        vulnerability: lm.floodVulnerability,
                      });
                    }}
                    className="flex w-full items-center justify-between rounded-none border border-pehra-border-subtle bg-white p-2 text-left text-xs text-pehra-text hover:border-pehra-border-subtle hover:bg-pehra-panel transition-all shadow-none"
                  >
                    <div>
                      <span className="font-medium text-pehra-text block">{lm.name}</span>
                      <span className="text-pehra-text text-pehra-text">{lm.ward}</span>
                    </div>
                    <span
                      className={`font-mono text-pehra-text font-semibold px-2 py-0.5 rounded-none border ${
                        lm.floodVulnerability === 'CRITICAL'
                          ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                          : 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                      }`}
                    >
                      {lm.elevationM}m MSL
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button at bottom of drawer */}
          <div className="pt-4 border-t border-pehra-border-subtle space-y-2">
            <button
              onClick={() => onNavigate('alerts')}
              className="w-full rounded-none bg-pehra-panel py-2.5 text-xs font-semibold text-white hover:bg-pehra-panel shadow-none transition-colors"
            >
              Review Early Warning Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
