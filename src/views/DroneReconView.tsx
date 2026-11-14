import React, { useState, useEffect, useRef } from 'react';
import {
  DRONE_FLEET,
  INITIAL_SNAPSHOTS,
  DroneUnit,
  ReconSnapshot,
} from '../data/droneData.ts';
import {
  Radio,
  Camera,
  Layers,
  Compass,
  Battery,
  Wifi,
  Navigation,
  Crosshair,
  Maximize2,
  RefreshCw,
  Eye,
  AlertTriangle,
  LifeBuoy,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flame,
  CheckCircle2,
  Download,
  ShieldCheck,
  Plane,
  Sliders,
} from 'lucide-react';

interface DroneReconViewProps {
  onNavigate?: (tab: string) => void;
  onDispatchBoat?: (hazard: any) => void;
  initialDroneId?: string;
}

export const DroneReconView: React.FC<DroneReconViewProps> = ({
  onNavigate,
  onDispatchBoat,
  initialDroneId = 'drone-alpha-01',
}) => {
  const [drones, setDrones] = useState<DroneUnit[]>(DRONE_FLEET);
  const [selectedDroneId, setSelectedDroneId] = useState<string>(initialDroneId);
  const [snapshots, setSnapshots] = useState<ReconSnapshot[]>(INITIAL_SNAPSHOTS);
  const [activeMode, setActiveMode] = useState<'RGB_4K' | 'THERMAL_FLIR' | 'FLOOD_MASK' | 'NIGHT_VISION'>('FLOOD_MASK');
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(2.0);
  const [gimbalPitch, setGimbalPitch] = useState<number>(-60);
  const [cameraPanX, setCameraPanX] = useState<number>(0);
  const [cameraPanY, setCameraPanY] = useState<number>(0);
  const [selectedHazard, setSelectedHazard] = useState<any | null>(null);
  const [snapshotSuccessToast, setSnapshotSuccessToast] = useState<string | null>(null);
  const [inspectingSnapshot, setInspectingSnapshot] = useState<ReconSnapshot | null>(null);

  const activeDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  // Simulated live telemetry oscillations
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones((prev) =>
        prev.map((d) => {
          if (d.status === 'CONNECTED' || d.status === 'IN_FLIGHT') {
            return {
              ...d,
              altitudeM: Math.round((d.altitudeM + (Math.random() * 0.8 - 0.4)) * 10) / 10,
              speedKmh: Math.round((d.speedKmh + (Math.random() * 0.6 - 0.3)) * 10) / 10,
              headingDeg: (d.headingDeg + Math.round(Math.random() * 2 - 1) + 360) % 360,
              waterDepthMeasuredM: Math.round((d.waterDepthMeasuredM + (Math.random() * 0.02 - 0.01)) * 100) / 100,
            };
          }
          return d;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDroneConnection = (droneId: string) => {
    setDrones((prev) =>
      prev.map((d) => {
        if (d.id === droneId) {
          const nextStatus = d.status === 'CONNECTED' ? 'STANDBY' : 'CONNECTED';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  const handleSnapPhoto = () => {
    const newSnapshot: ReconSnapshot = {
      id: `snap-${Date.now()}`,
      droneId: activeDrone.id,
      callsign: activeDrone.callsign,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      locationName: activeDrone.locationName,
      lat: Math.round((activeDrone.lat + (cameraPanY * 0.0001)) * 10000) / 10000,
      lng: Math.round((activeDrone.lng + (cameraPanX * 0.0001)) * 10000) / 10000,
      mode: activeMode,
      waterDepthM: activeDrone.waterDepthMeasuredM,
      floodedAreaKm2: activeDrone.floodCoverageKm2,
      hazardsFound: activeDrone.detectedHazards.length,
      imageUrl: activeDrone.imageThumbnail,
      notes: `High-resolution aerial reconnaissance frame. Mode: ${activeMode}. Measured inundation depth: ${activeDrone.waterDepthMeasuredM}m.`,
    };

    setSnapshots([newSnapshot, ...snapshots]);
    setSnapshotSuccessToast(`Captured high-res aerial snapshot at ${newSnapshot.locationName}!`);
    setTimeout(() => setSnapshotSuccessToast(null), 3500);
  };

  const handlePan = (dx: number, dy: number) => {
    setCameraPanX((prev) => Math.max(-40, Math.min(40, prev + dx)));
    setCameraPanY((prev) => Math.max(-30, Math.min(30, prev + dy)));
  };

  const handleResetGimbal = () => {
    setCameraPanX(0);
    setCameraPanY(0);
    setZoomLevel(1.5);
    setGimbalPitch(-60);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Drone Fleet Selector */}
      <div className="rounded-none border border-pehra-border-subtle bg-white p-4 sm:p-5 shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-none bg-pehra-panel text-pehra-text border border-pehra-border-subtle shrink-0">
              <Plane className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-none bg-pehra-panel px-2.5 py-0.5 text-pehra-text font-mono font-semibold text-pehra-text border border-pehra-border-subtle">
                  UAV AERIAL RECONNAISSANCE GRID
                </span>
                <span className="text-xs text-pehra-text font-medium">MCGM & NDRF Tactical Fleet</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-pehra-text tracking-tight mt-0.5">
                Live Drone Flood Inundation & Reconnaissance Hub
              </h1>
            </div>
          </div>

          {/* Quick Drone Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {drones.map((drone) => {
              const isSelected = drone.id === selectedDroneId;
              const isOnline = drone.status === 'CONNECTED' || drone.status === 'IN_FLIGHT';

              return (
                <button
                  key={drone.id}
                  onClick={() => {
                    setSelectedDroneId(drone.id);
                    setSelectedHazard(null);
                  }}
                  id={`drone-tab-${drone.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-none text-xs font-medium transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle shadow-none'
                      : 'bg-pehra-panel text-pehra-text border-pehra-border-subtle hover:bg-pehra-panel'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-none ${
                      isOnline ? 'bg-pehra-panel ' : 'bg-pehra-panel'
                    }`}
                  />
                  <div className="text-left">
                    <div className="font-bold leading-none">{drone.callsign.split(' ')[0]}</div>
                    <div className="text-pehra-text text-pehra-text truncate max-w-[90px]">{drone.locationName.split('—')[0]}</div>
                  </div>
                  <span className="text-pehra-text font-mono text-pehra-text ml-1">{drone.batteryPercent}%</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Snapshot Alert Toast */}
      {snapshotSuccessToast && (
        <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-3 text-xs text-pehra-text flex items-center justify-between shadow-none animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-pehra-text" />
            <span className="font-semibold">{snapshotSuccessToast}</span>
          </div>
          <span className="text-pehra-text text-pehra-text">Saved to Mission Recon Gallery</span>
        </div>
      )}

      {/* Main Dual Stage: Video/Image Render Canvas & Telemetry/PTZ Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Aerial Place Rendering Canvas & HUD (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-2">
          {/* Visual Canvas Container */}
          <div className="relative w-full aspect-16/10 sm:aspect-16/9 rounded-none bg-pehra-panel overflow-hidden border border-pehra-border-subtle shadow-none select-none">
            {/* 1. Live Rendered Place / Flood Scene Simulation */}
            <div
              className="absolute inset-0 transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) translate(${cameraPanX}px, ${cameraPanY}px)`,
              }}
            >
              {/* Ground & Inundated Urban Scenery (SVG vector rendered) */}
              <svg
                className="w-full h-full object-cover"
                viewBox="0 0 1000 650"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Water Wave Pattern */}
                  <pattern id="floodWaterPattern" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M0 10 Q10 5, 20 10 T40 10"
                      fill="none"
                      stroke={
                        activeMode === 'THERMAL_FLIR'
                          ? 'currentColor'
                          : activeMode === 'FLOOD_MASK'
                          ? 'currentColor'
                          : activeMode === 'NIGHT_VISION'
                          ? 'currentColor'
                          : 'currentColor'
                      }
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  </pattern>

                  {/* Thermal Color Gradients */}
                  <linearGradient id="thermalRiverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="currentColor" />
                  </linearGradient>

                  <linearGradient id="floodMaskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="currentColor" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.85" />
                  </linearGradient>

                  <linearGradient id="rgbWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="40%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="currentColor" />
                  </linearGradient>
                </defs>

                {/* Base Landmass (Streets, Buildings, Greenery) */}
                <rect
                  width="1000"
                  height="650"
                  fill={
                    activeMode === 'THERMAL_FLIR'
                      ? 'currentColor'
                      : activeMode === 'NIGHT_VISION'
                      ? 'currentColor'
                      : 'currentColor'
                  }
                />

                {/* Urban Road Grid */}
                <path
                  d="M0 280 L1000 280 M0 360 L1000 360 M400 0 L400 650 M650 0 L650 650"
                  stroke={activeMode === 'THERMAL_FLIR' ? 'currentColor' : activeMode === 'NIGHT_VISION' ? 'currentColor' : 'currentColor'}
                  strokeWidth="45"
                  fill="none"
                />

                {/* Residential Blocks / Buildings */}
                <g fill={activeMode === 'THERMAL_FLIR' ? 'currentColor' : activeMode === 'NIGHT_VISION' ? 'currentColor' : 'currentColor'} opacity="0.9">
                  {/* Block A */}
                  <rect x="60" y="60" width="130" height="90" rx="4" />
                  <rect x="220" y="60" width="140" height="90" rx="4" />
                  <rect x="60" y="170" width="290" height="80" rx="4" />

                  {/* Block B */}
                  <rect x="440" y="50" width="170" height="100" rx="4" />
                  <rect x="440" y="170" width="170" height="80" rx="4" />

                  {/* Block C (Trapped Rooftop location) */}
                  <rect x="360" y="240" width="90" height="70" rx="4" fill={activeMode === 'THERMAL_FLIR' ? 'currentColor' : 'currentColor'} />

                  {/* Block D */}
                  <rect x="710" y="80" width="230" height="150" rx="4" />
                  <rect x="710" y="420" width="220" height="160" rx="4" />

                  {/* Block E */}
                  <rect x="80" y="420" width="260" height="170" rx="4" />
                  <rect x="440" y="420" width="170" height="160" rx="4" />
                </g>

                {/* Railway Tracks / Bridge S-Curve */}
                <path
                  d="M100 0 Q300 200, 500 320 T950 480"
                  stroke={activeMode === 'THERMAL_FLIR' ? 'currentColor' : 'currentColor'}
                  strokeWidth="12"
                  strokeDasharray="4 6"
                  fill="none"
                />

                {/* SUBMERGED FLOODED RIVER CORRIDOR & STREET INUNDATION */}
                <path
                  d="M-50 320 C180 290, 320 340, 480 320 C640 300, 780 350, 1050 310 L1050 650 L-50 650 Z"
                  fill={
                    activeMode === 'THERMAL_FLIR'
                      ? 'url(#thermalRiverGrad)'
                      : activeMode === 'FLOOD_MASK'
                      ? 'url(#floodMaskGrad)'
                      : activeMode === 'NIGHT_VISION'
                      ? 'currentColor'
                      : 'url(#rgbWaterGrad)'
                  }
                />

                {/* Flooded Street Ponding */}
                <ellipse
                  cx="400"
                  cy="320"
                  rx="160"
                  ry="90"
                  fill={
                    activeMode === 'FLOOD_MASK'
                      ? 'currentColor'
                      : activeMode === 'THERMAL_FLIR'
                      ? 'currentColor'
                      : activeMode === 'NIGHT_VISION'
                      ? 'currentColor'
                      : 'currentColor'
                  }
                  opacity="0.8"
                />

                {/* Water Surface Ripple Pattern */}
                <rect x="0" y="270" width="1000" height="380" fill="url(#floodWaterPattern)" opacity="0.65" />

                {/* Depth Measurement Contours (In Flood Mask Mode) */}
                {activeMode === 'FLOOD_MASK' && (
                  <g stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.7">
                    <ellipse cx="400" cy="320" rx="130" ry="70" fill="none" />
                    <text x="390" y="325" fill="currentColor" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      1.45m
                    </text>
                    <ellipse cx="400" cy="320" rx="70" ry="35" fill="none" strokeWidth="1.5" />
                    <text x="390" y="300" fill="currentColor" fontSize="10" fontFamily="monospace">
                      1.8m (DEEP)
                    </text>
                  </g>
                )}

                {/* Hotspot Markers for Human Body Heat (Thermal FLIR Mode) */}
                {activeMode === 'THERMAL_FLIR' && (
                  <g>
                    <circle cx="395" cy="270" r="8" fill="currentColor" filter="blur(1px)" />
                    <circle cx="410" cy="265" r="7" fill="currentColor" filter="blur(1px)" />
                    <circle cx="425" cy="272" r="7" fill="currentColor" filter="blur(1px)" />
                    <text x="380" y="250" fill="currentColor" fontSize="12" fontWeight="bold" fontFamily="monospace">
                      36.8°C [3 PERSONS]
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* 2. Detected Hazard Interactive Bounding Boxes Overlay */}
            <div className="absolute inset-0 pointer-events-auto">
              {activeDrone.detectedHazards.map((hz) => {
                const isSelected = selectedHazard?.id === hz.id;
                return (
                  <div
                    key={hz.id}
                    onClick={() => setSelectedHazard(hz)}
                    style={{
                      left: `${hz.coords.x}%`,
                      top: `${hz.coords.y}%`,
                      width: `${hz.coords.width}%`,
                      height: `${hz.coords.height}%`,
                    }}
                    className={`absolute rounded-none border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between p-1.5 ${
                      isSelected
                        ? 'border-pehra-border-subtle bg-pehra-panel ring-2 ring-pehra-focus'
                        : 'border-pehra-border-subtle bg-pehra-panel hover:border-pehra-border-subtle hover:bg-pehra-panel'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-pehra-text font-bold font-mono px-1.5 py-0.5 rounded bg-black/80 text-white flex items-center gap-1">
                        <AlertTriangle className="h-2.5 w-2.5 text-pehra-text" />
                        {hz.type} ({(hz.confidence * 100).toFixed(0)}%)
                      </span>
                      <span className="h-2 w-2 rounded-none bg-pehra-panel " />
                    </div>

                    <div className="text-pehra-text font-semibold text-white bg-black/75 px-1 py-0.5 rounded truncate">
                      {hz.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. Drone Flight HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 text-white font-mono">
              {/* Top HUD: Status Bar */}
              <div className="flex items-center justify-between text-xs bg-black/50 -xs p-2 rounded-none border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-none bg-pehra-panel " />
                  <span className="font-bold text-white tracking-wider">{activeDrone.callsign}</span>
                  <span className="hidden sm:inline text-white/60">• {activeDrone.model.split('(')[0]}</span>
                </div>

                <div className="flex items-center gap-3 text-pehra-text">
                  <span className="text-pehra-text font-bold flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    {activeDrone.signalStrengthDbm} dBm (5G Mesh)
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <Battery className="h-3.5 w-3.5 text-pehra-text" />
                    {activeDrone.batteryPercent}%
                  </span>
                  <span className="bg-pehra-panel text-white font-bold px-2 py-0.5 rounded text-pehra-text ">
                    LIVE
                  </span>
                </div>
              </div>

              {/* Center Crosshair & Flight Reticle */}
              <div className="relative flex-1 flex items-center justify-center">
                {/* Crosshair lines */}
                <div className="w-16 h-16 border border-white/40 rounded-none flex items-center justify-center">
                  <div className="w-2 h-2 rounded-none bg-pehra-panel" />
                </div>
                <div className="absolute w-28 h-px bg-white/30" />
                <div className="absolute h-28 w-px bg-white/30" />

                {/* Pitch Ladder Indicators */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1 text-pehra-text text-white/70">
                  <span>+20°</span>
                  <span>+10°</span>
                  <span className="text-pehra-text font-bold">-- 0° [HORIZON] --</span>
                  <span>-10°</span>
                  <span>-20°</span>
                  <span className="text-pehra-text font-bold">-60° [NADIR TILT]</span>
                </div>

                {/* Left: Altitude & Speed Ladder */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-2 text-pehra-text text-white/80">
                  <div className="bg-black/60 px-2 py-1 rounded border border-white/10">
                    <div className="text-pehra-text text-white/60">ALTITUDE</div>
                    <div className="text-sm font-bold text-pehra-text">{activeDrone.altitudeM} m AGL</div>
                  </div>
                  <div className="bg-black/60 px-2 py-1 rounded border border-white/10">
                    <div className="text-pehra-text text-white/60">GROUND SPEED</div>
                    <div className="text-sm font-bold text-pehra-text">{activeDrone.speedKmh} km/h</div>
                  </div>
                </div>
              </div>

              {/* Bottom HUD: Coordinates & Water Inundation Readout */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-black/60 -xs p-2 rounded-none border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-pehra-text">
                    GPS: {activeDrone.lat.toFixed(4)}°N, {activeDrone.lng.toFixed(4)}°E
                  </span>
                  <span className="hidden sm:inline text-white/50">|</span>
                  <span className="text-white/80 hidden sm:inline">
                    HEADING: {activeDrone.headingDeg}° WSW
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-pehra-text font-bold">
                    <span>WATER DEPTH:</span>
                    <span className="text-sm text-pehra-text">{activeDrone.waterDepthMeasuredM} m</span>
                  </div>
                  <div className="text-white/70 text-pehra-text">
                    FLOOD AREA: <strong className="text-white">{activeDrone.floodCoverageKm2} km²</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vision Modes & Quick Snapshot Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-none border border-pehra-border-subtle bg-white p-2.5 shadow-none">
            {/* Vision Mode Filters */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-pehra-text font-bold text-pehra-text mr-1 hidden sm:inline">Camera Mode:</span>
              <button
                onClick={() => setActiveMode('FLOOD_MASK')}
                className={`px-2.5 py-1.5 rounded-none font-medium transition-colors ${
                  activeMode === 'FLOOD_MASK'
                    ? 'bg-pehra-panel text-white font-bold shadow-none'
                    : 'bg-pehra-panel text-pehra-text hover:bg-pehra-panel'
                }`}
              >
                🌊 Flood Mask CV
              </button>

              <button
                onClick={() => setActiveMode('THERMAL_FLIR')}
                className={`px-2.5 py-1.5 rounded-none font-medium transition-colors ${
                  activeMode === 'THERMAL_FLIR'
                    ? 'bg-pehra-panel text-white font-bold shadow-none'
                    : 'bg-pehra-panel text-pehra-text hover:bg-pehra-panel'
                }`}
              >
                🔥 Thermal FLIR
              </button>

              <button
                onClick={() => setActiveMode('RGB_4K')}
                className={`px-2.5 py-1.5 rounded-none font-medium transition-colors ${
                  activeMode === 'RGB_4K'
                    ? 'bg-pehra-panel text-white font-bold shadow-none'
                    : 'bg-pehra-panel text-pehra-text hover:bg-pehra-panel'
                }`}
              >
                📷 Optical 4K
              </button>

              <button
                onClick={() => setActiveMode('NIGHT_VISION')}
                className={`px-2.5 py-1.5 rounded-none font-medium transition-colors ${
                  activeMode === 'NIGHT_VISION'
                    ? 'bg-pehra-panel text-white font-bold shadow-none'
                    : 'bg-pehra-panel text-pehra-text hover:bg-pehra-panel'
                }`}
              >
                🌙 Night NVG
              </button>
            </div>

            {/* Snapshot Trigger & PTZ reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetGimbal}
                className="px-2.5 py-1.5 rounded-none border border-pehra-border-subtle text-pehra-text hover:bg-pehra-panel text-xs font-medium"
                title="Reset camera pan & tilt"
              >
                Center Gimbal
              </button>

              <button
                onClick={handleSnapPhoto}
                id="snap-recon-photo-btn"
                className="flex items-center gap-1.5 rounded-none bg-pehra-panel px-3.5 py-1.5 text-xs font-bold text-white shadow-none hover:bg-pehra-panel active:scale-95 transition-all"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Snap Live Recon Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Gimbal / Flight PTZ Controls & Detected Hazard Inspector (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* A. Selected Hazard Inspector Drawer (if user clicked a bounding box) */}
          {selectedHazard ? (
            <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-4 shadow-none space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-none bg-pehra-panel text-white font-bold text-xs">
                    !
                  </span>
                  <div>
                    <span className="text-pehra-text font-mono font-bold uppercase text-pehra-text tracking-wider">
                      TARGET DETECTED ({selectedHazard.type})
                    </span>
                    <h3 className="text-sm font-bold text-pehra-text leading-snug">{selectedHazard.label}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHazard(null)}
                  className="text-pehra-text hover:text-pehra-text text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-none border border-pehra-border-subtle">
                  <span className="text-pehra-text text-pehra-text block font-medium">GPS PIN</span>
                  <strong className="text-pehra-text font-mono text-pehra-text">
                    {selectedHazard.lat.toFixed(4)}°N, {selectedHazard.lng.toFixed(4)}°E
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-none border border-pehra-border-subtle">
                  <span className="text-pehra-text text-pehra-text block font-medium">ESTIMATED DEPTH</span>
                  <strong className="text-pehra-text font-mono">{activeDrone.waterDepthMeasuredM} m</strong>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (onDispatchBoat) {
                    onDispatchBoat(selectedHazard);
                  } else if (onNavigate) {
                    onNavigate('responder-portal');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-none bg-pehra-panel hover:bg-pehra-panel text-white px-3 py-2 text-xs font-bold shadow-none transition-colors"
              >
                <LifeBuoy className="h-4 w-4" />
                <span>{selectedHazard.actionText}</span>
              </button>
            </div>
          ) : (
            /* Active Drone Telemetry Stats Card */
            <div className="rounded-none border border-pehra-border-subtle bg-white p-4 shadow-none space-y-3">
              <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-2.5">
                <div>
                  <span className="text-pehra-text font-mono uppercase text-pehra-text font-semibold">Active Unit Telemetry</span>
                  <h3 className="text-sm font-bold text-pehra-text">{activeDrone.locationName}</h3>
                </div>
                <span className="rounded-none bg-pehra-panel text-pehra-text border border-pehra-border-subtle px-2 py-0.5 text-pehra-text font-bold">
                  {activeDrone.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-pehra-panel p-2.5 rounded-none border border-pehra-border-subtle">
                  <span className="text-pehra-text text-pehra-text block">Flight Altitude</span>
                  <strong className="text-pehra-text font-mono text-sm">{activeDrone.altitudeM} m</strong>
                </div>
                <div className="bg-pehra-panel p-2.5 rounded-none border border-pehra-border-subtle">
                  <span className="text-pehra-text text-pehra-text block">Airspeed</span>
                  <strong className="text-pehra-text font-mono text-sm">{activeDrone.speedKmh} km/h</strong>
                </div>
                <div className="bg-pehra-panel p-2.5 rounded-none border border-pehra-border-subtle">
                  <span className="text-pehra-text text-pehra-text block">Flood Surface Area</span>
                  <strong className="text-pehra-text font-mono text-sm">{activeDrone.floodCoverageKm2} km²</strong>
                </div>
                <div className="bg-pehra-panel p-2.5 rounded-none border border-pehra-border-subtle">
                  <span className="text-pehra-text text-pehra-text block">Water Column Depth</span>
                  <strong className="text-pehra-text font-mono text-sm">{activeDrone.waterDepthMeasuredM} m</strong>
                </div>
              </div>

              <div className="text-pehra-text text-pehra-text pt-1">
                Pilot Station: <strong className="text-pehra-text">{activeDrone.pilotStation}</strong>
              </div>
            </div>
          )}

          {/* B. Camera PTZ Gimbal & Zoom Controls */}
          <div className="rounded-none border border-pehra-border-subtle bg-white p-4 shadow-none space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pehra-text flex items-center gap-1.5">
                <Crosshair className="h-4 w-4 text-pehra-text" />
                Gimbal Pan / Tilt / Zoom
              </span>
              <span className="text-pehra-text font-mono text-pehra-text">Zoom: {zoomLevel.toFixed(1)}x</span>
            </div>

            {/* Virtual Joystick / D-Pad */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-32 h-32 rounded-none border-2 border-pehra-border-subtle bg-pehra-panel flex items-center justify-center shadow-none">
                {/* Up */}
                <button
                  onClick={() => handlePan(0, 15)}
                  className="absolute top-1 left-1/2 -translate-x-1/2 p-2 rounded-none hover:bg-pehra-panel text-pehra-text active:scale-90 transition-all"
                  title="Tilt Up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                {/* Down */}
                <button
                  onClick={() => handlePan(0, -15)}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 p-2 rounded-none hover:bg-pehra-panel text-pehra-text active:scale-90 transition-all"
                  title="Tilt Down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                {/* Left */}
                <button
                  onClick={() => handlePan(15, 0)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 p-2 rounded-none hover:bg-pehra-panel text-pehra-text active:scale-90 transition-all rotate-[-90deg]"
                  title="Pan Left"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                {/* Right */}
                <button
                  onClick={() => handlePan(-15, 0)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-none hover:bg-pehra-panel text-pehra-text active:scale-90 transition-all rotate-[90deg]"
                  title="Pan Right"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                {/* Center Hub */}
                <button
                  onClick={handleResetGimbal}
                  className="w-8 h-8 rounded-none bg-pehra-panel text-white flex items-center justify-center text-pehra-text font-bold shadow-none hover:bg-pehra-panel"
                >
                  RST
                </button>
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2 text-xs">
              <ZoomOut className="h-3.5 w-3.5 text-pehra-text" />
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.2"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-pehra-panel rounded-none cursor-pointer"
              />
              <ZoomIn className="h-3.5 w-3.5 text-pehra-text" />
            </div>
          </div>

          {/* C. Quick Link to Full GIS Map */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('map')}
              className="w-full flex items-center justify-center gap-2 rounded-none border border-pehra-border-subtle bg-white hover:bg-pehra-panel text-pehra-text px-3 py-2.5 text-xs font-semibold shadow-none transition-colors"
            >
              <MapPin className="h-4 w-4 text-pehra-text" />
              <span>View Drone Patrol on GIS Map</span>
            </button>
          )}
        </div>
      </div>

      {/* Mission Aerial Recon Photo Gallery */}
      <div className="rounded-none border border-pehra-border-subtle bg-white p-5 shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Camera className="h-4.5 w-4.5 text-pehra-text" />
            <div>
              <h3 className="text-sm font-bold text-pehra-text">Mission Aerial Recon Photo Gallery</h3>
              <p className="text-pehra-text text-pehra-text">
                High-resolution orthomosaic frames captured during current flood monitoring sorties
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-pehra-text">
            {snapshots.length} Captured Frames
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {snapshots.map((snap) => (
            <div
              key={snap.id}
              onClick={() => setInspectingSnapshot(snap)}
              className="group rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 hover:bg-white hover:border-pehra-border-subtle hover:shadow-none transition-all cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between text-pehra-text">
                <span className="font-bold text-pehra-text">{snap.callsign}</span>
                <span className="text-pehra-text font-mono text-pehra-text">{snap.timestamp}</span>
              </div>

              {/* Thumbnail Representation */}
              <div className="relative aspect-16/9 rounded-none bg-pehra-panel overflow-hidden flex items-center justify-center text-white">
                <div className="absolute inset-0 bg-pehra-panel from-black/80 via-transparent to-transparent z-10" />
                <span className="text-xl">🌊</span>
                <span className="absolute bottom-2 left-2 z-20 text-pehra-text font-mono text-pehra-text font-bold">
                  {snap.mode} • Depth: {snap.waterDepthM}m
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-pehra-text truncate">{snap.locationName}</h4>
                <p className="text-pehra-text text-pehra-text line-clamp-2 mt-0.5 leading-snug">{snap.notes}</p>
              </div>

              <div className="flex items-center justify-between text-pehra-text text-pehra-text pt-1 border-t border-pehra-border-subtle font-mono">
                <span>{snap.lat}°N, {snap.lng}°E</span>
                <span className="text-pehra-text font-medium group-hover:underline">Inspect Details →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshot Detailed Modal Inspector */}
      {inspectingSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 -xs">
          <div className="relative w-full max-w-xl rounded-none bg-white p-5 sm:p-6 shadow-none border border-pehra-border-subtle space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-pehra-text font-mono font-bold text-pehra-text uppercase">
                  AERIAL RECON FRAME • {inspectingSnapshot.id}
                </span>
                <h3 className="text-base font-bold text-pehra-text mt-0.5">{inspectingSnapshot.locationName}</h3>
              </div>
              <button
                onClick={() => setInspectingSnapshot(null)}
                className="p-1 rounded-none text-pehra-text hover:text-pehra-text hover:bg-pehra-panel"
              >
                ✕
              </button>
            </div>

            <div className="aspect-16/9 rounded-none bg-pehra-panel flex items-center justify-center text-white relative overflow-hidden">
              <span className="text-3xl">🚁</span>
              <div className="absolute bottom-3 left-3 bg-black/75 px-2.5 py-1 rounded text-xs font-mono text-pehra-text">
                Mode: {inspectingSnapshot.mode} | Measured Water Depth: {inspectingSnapshot.waterDepthM} m
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-pehra-panel p-2.5 rounded-none">
                <span className="text-pehra-text text-pehra-text block">Coordinates</span>
                <strong className="text-pehra-text font-mono">
                  {inspectingSnapshot.lat}°N, {inspectingSnapshot.lng}°E
                </strong>
              </div>
              <div className="bg-pehra-panel p-2.5 rounded-none">
                <span className="text-pehra-text text-pehra-text block">Captured At</span>
                <strong className="text-pehra-text font-mono">{inspectingSnapshot.timestamp}</strong>
              </div>
            </div>

            <p className="text-xs text-pehra-text bg-pehra-panel p-3 rounded-none border border-pehra-border-subtle">
              {inspectingSnapshot.notes}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectingSnapshot(null)}
                className="px-4 py-2 rounded-none border border-pehra-border-subtle text-xs font-semibold text-pehra-text hover:bg-pehra-panel"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
