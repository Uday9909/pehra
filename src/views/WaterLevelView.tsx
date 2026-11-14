import React, { useState, useEffect, useRef } from 'react';
import {
  Droplets,
  Waves,
  Radio,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Mountain,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Search,
  Filter,
  Activity,
  Sliders,
  ShieldAlert,
  Clock,
  Send,
  Info,
} from 'lucide-react';
import { WaterLevelStation, WaterLevelSystemResponse } from '../types/index.ts';
import { api } from '../api/client.ts';

interface WaterLevelViewProps {
  onNavigateToMapWithStation?: (lat: number, lng: number, name: string) => void;
  onNavigate: (tab: string) => void;
}

export const WaterLevelView: React.FC<WaterLevelViewProps> = ({
  onNavigateToMapWithStation,
  onNavigate,
}) => {
  // System Telemetry State
  const [systemState, setSystemState] = useState<WaterLevelSystemResponse | null>(null);
  const [stations, setStations] = useState<WaterLevelStation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [ingesting, setIngesting] = useState<boolean>(false);

  // URL Ingestion Input State
  const [inputUrl, setInputUrl] = useState<string>('https://mumbaiflood.in/api/v1/sensors/live');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('mumbai-flood-live');
  const [presets, setPresets] = useState<any[]>([]);

  // Polling Cadence & Preferences
  const [cadenceSec, setCadenceSec] = useState<number>(10);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [alarmSoundEnabled, setAlarmSoundEnabled] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DANGER' | 'WARNING' | 'NORMAL'>('ALL');
  const [selectedStation, setSelectedStation] = useState<WaterLevelStation | null>(null);
  const [surgeStationId, setSurgeStationId] = useState<string | null>(null);

  // Audio synthesizer ref for web-audio alarm
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load Presets and Initial Stations
  useEffect(() => {
    loadPresets();
    fetchStations();
  }, []);

  const loadPresets = async () => {
    try {
      const res = await api.getWaterLevelPresets();
      if (res?.presets) {
        setPresets(res.presets);
        if (res.activeUrl) {
          setInputUrl(res.activeUrl);
        }
      }
    } catch (err) {
      console.warn('Presets failed to load:', err);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await api.getWaterLevelStations();
      if (res && res.stations) {
        setSystemState(res);
        setStations(res.stations);
        if (!inputUrl) setInputUrl(res.activeUrl);
      }
    } catch (err) {
      console.error('Error loading stations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Periodic polling interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchStations();
    }, cadenceSec * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, cadenceSec]);

  // Audio chime when danger is detected
  const playDangerAlertChime = () => {
    if (!alarmSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  // Trigger chime if any station enters DANGER
  useEffect(() => {
    const hasDanger = stations.some((s) => s.status === 'DANGER' || s.status === 'CRITICAL');
    if (hasDanger && alarmSoundEnabled) {
      playDangerAlertChime();
    }
  }, [stations, alarmSoundEnabled]);

  // Handle URL Ingestion
  const handleIngestUrl = async (urlToIngest: string, presetName?: string) => {
    if (!urlToIngest || !urlToIngest.trim()) return;
    setIngesting(true);
    try {
      const res = await api.ingestWaterLevelUrl(urlToIngest, presetName, cadenceSec);
      if (res && res.stations) {
        setSystemState(res);
        setStations(res.stations);
        setInputUrl(res.activeUrl);
      }
    } catch (err: any) {
      alert(`Ingestion error: ${err.message || 'Failed to ingest URL'}`);
    } finally {
      setIngesting(false);
    }
  };

  // Handle Preset Select
  const handleSelectPreset = (preset: any) => {
    setSelectedPresetId(preset.id);
    setInputUrl(preset.url);
    handleIngestUrl(preset.url, preset.name);
  };

  // Handle Surge Simulation Drill
  const handleSimulateSurge = async (stationId: string) => {
    setSurgeStationId(stationId);
    try {
      const res = await api.simulateWaterSurge(stationId, 0.85);
      if (res && res.system) {
        setSystemState(res.system);
        setStations(res.system.stations);
        if (alarmSoundEnabled) playDangerAlertChime();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setTimeout(() => setSurgeStationId(null), 800);
    }
  };

  // Handle Reset to Safe Baseline
  const handleResetBaseline = async () => {
    setRefreshing(true);
    try {
      const res = await api.resetWaterLevels();
      if (res && res.system) {
        setSystemState(res.system);
        setStations(res.system.stations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtered stations
  const filteredStations = stations.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.waterway.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ward.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'DANGER' && (s.status === 'DANGER' || s.status === 'CRITICAL')) ||
      (statusFilter === 'WARNING' && s.status === 'WARNING') ||
      (statusFilter === 'NORMAL' && s.status === 'NORMAL');
    return matchesSearch && matchesStatus;
  });

  const dangerCount = stations.filter((s) => s.status === 'DANGER' || s.status === 'CRITICAL').length;
  const warningCount = stations.filter((s) => s.status === 'WARNING').length;
  const maxLevelStation = stations.reduce((prev, curr) => (curr.currentLevelM > prev.currentLevelM ? curr : prev), stations[0] || null);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Title & Alarm Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-pehra-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-none bg-pehra-panel text-pehra-text border border-pehra-border-subtle">
              <Droplets className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Real-Time Water Level System</h1>
            <span className="rounded-none bg-pehra-panel border border-pehra-border-subtle px-2.5 py-0.5 text-xs font-mono font-semibold text-pehra-text">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-pehra-text mt-1">
            Dynamic ingestion of ultrasonic, radar, and bubbler streamflow gauges across Mumbai's river basins, nullahs, and subway sumps.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Alarm Toggle */}
          <button
            onClick={() => {
              setAlarmSoundEnabled(!alarmSoundEnabled);
              if (!alarmSoundEnabled) playDangerAlertChime();
            }}
            className={`flex items-center gap-1.5 rounded-none border px-3 py-1.5 text-xs font-semibold transition-all ${
              alarmSoundEnabled
                ? 'border-pehra-border-subtle bg-pehra-panel text-pehra-text shadow-none'
                : 'border-pehra-border-subtle bg-pehra-panel text-pehra-text hover:text-white'
            }`}
            title="Audio alert chime when any station crosses Danger Mark"
          >
            {alarmSoundEnabled ? <Volume2 className="h-3.5 w-3.5 text-pehra-text " /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Danger Audio Alarm {alarmSoundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Reset Baseline */}
          <button
            onClick={handleResetBaseline}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-none border border-pehra-border-subtle bg-pehra-panel px-3 py-1.5 text-xs font-semibold text-pehra-text hover:bg-pehra-panel hover:text-white transition-all"
            title="Reset telemetry to calibrated baseline"
          >
            <RotateCcw className="h-3.5 w-3.5 text-pehra-text" />
            <span>Reset Baseline</span>
          </button>

          {/* Refresh Trigger */}
          <button
            onClick={() => {
              setRefreshing(true);
              fetchStations();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-none bg-pehra-panel px-3.5 py-1.5 text-xs font-bold text-pehra-text hover:bg-pehra-panel shadow-none transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? '' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Poll Now'}</span>
          </button>
        </div>
      </div>

      {/* STREAM INGESTION DECK (The Provided URL Controller) */}
      <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel from-pehra-panel to-pehra-panel p-4 sm:p-5 shadow-none  space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-pehra-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-pehra-text " />
            <span className="font-bold text-sm text-white">Stream Ingestion Controller</span>
            <span className="text-xs text-pehra-text hidden sm:inline">• Ingest live telemetry from any custom or official endpoint</span>
          </div>

          {/* Diagnostics pill */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="rounded bg-pehra-panel border border-pehra-border-subtle px-2.5 py-1 text-pehra-text">
              Protocol: <strong className="text-pehra-text">{systemState?.diagnostics.protocol || 'HTTPS'}</strong>
            </span>
            <span className="rounded bg-pehra-panel border border-pehra-border-subtle px-2.5 py-1 text-pehra-text">
              Latency: <strong className="text-pehra-text">{systemState?.latencyMs || 65}ms</strong>
            </span>
            <span
              className={`rounded px-2.5 py-1 font-bold ${
                systemState?.status === 'CONNECTED'
                  ? 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle'
                  : 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle'
              }`}
            >
              {systemState?.status || 'CONNECTED'}
            </span>
          </div>
        </div>

        {/* URL Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleIngestUrl(inputUrl);
          }}
          className="flex flex-col sm:flex-row items-stretch gap-2"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <ExternalLink className="h-4 w-4 text-pehra-text" />
            </div>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter water level API endpoint / stream URL (e.g., https://mumbaiflood.in/api/v1/sensors/live)..."
              required
              className="w-full rounded-none border border-pehra-border-subtle bg-pehra-panel pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-pehra-text-muted focus:border-pehra-border-subtle focus:outline-none focus:ring-1 focus:ring-pehra-focus font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={ingesting}
            className="flex items-center justify-center gap-2 rounded-none bg-pehra-panel from-pehra-panel to-pehra-panel px-5 py-2.5 text-xs font-bold text-pehra-text hover:from-pehra-panel hover:to-pehra-panel shadow-none transition-all shrink-0"
          >
            {ingesting ? <RefreshCw className="h-3.5 w-3.5 " /> : <Send className="h-3.5 w-3.5" />}
            <span>{ingesting ? 'Ingesting...' : 'Ingest URL Stream'}</span>
          </button>
        </form>

        {/* Quick Presets & Polling Cadence Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs pt-1">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-pehra-text font-semibold text-pehra-text mr-1">One-Click Feeds:</span>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`rounded-none px-2.5 py-1 text-pehra-text font-medium transition-all ${
                  inputUrl === preset.url
                    ? 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle font-bold'
                    : 'bg-pehra-panel border border-pehra-border-subtle text-pehra-text hover:bg-pehra-panel hover:text-white'
                }`}
              >
                {preset.name.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {/* Polling Interval Controls */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            <label className="flex items-center gap-1.5 cursor-pointer text-pehra-text select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded bg-pehra-panel border-pehra-border-subtle text-pehra-text focus:ring-0"
              />
              <span>Live Auto-Poll</span>
            </label>

            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-pehra-text" />
              <select
                value={cadenceSec}
                onChange={(e) => setCadenceSec(Number(e.target.value))}
                className="rounded-none border border-pehra-border-subtle bg-pehra-panel px-2 py-1 text-pehra-text font-mono text-pehra-text focus:border-pehra-border-subtle focus:outline-none"
              >
                <option value={5}>Every 5s</option>
                <option value={10}>Every 10s</option>
                <option value={30}>Every 30s</option>
                <option value={60}>Every 60s</option>
              </select>
            </div>
          </div>
        </div>

        {/* Diagnostics message */}
        {systemState?.diagnostics?.message && (
          <div className="flex items-start gap-2 rounded-none bg-pehra-panel border border-pehra-border-subtle p-2.5 text-pehra-text text-pehra-text">
            <Info className="h-3.5 w-3.5 text-pehra-text shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-mono text-pehra-text font-semibold">Active Feed Status: </span>
              <span>{systemState.diagnostics.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* METRIC OVERVIEW BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-4">
          <span className="text-pehra-text text-pehra-text block font-medium">Monitored Stations</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stations.length}</div>
          <span className="text-pehra-text text-pehra-text">Basin telemetry points</span>
        </div>

        <div className={`rounded-none border p-4 ${dangerCount > 0 ? 'border-pehra-border-subtle bg-pehra-panel' : 'border-pehra-border-subtle bg-pehra-panel'}`}>
          <span className="text-pehra-text text-pehra-text block font-medium">Danger Mark Breached</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${dangerCount > 0 ? 'text-pehra-text ' : 'text-pehra-text'}`}>
            {dangerCount}
          </div>
          <span className="text-pehra-text text-pehra-text">{dangerCount > 0 ? 'Urgent dispatch required' : 'All below high flood mark'}</span>
        </div>

        <div className={`rounded-none border p-4 ${warningCount > 0 ? 'border-pehra-border-subtle bg-pehra-panel' : 'border-pehra-border-subtle bg-pehra-panel'}`}>
          <span className="text-pehra-text text-pehra-text block font-medium">Warning Threshold</span>
          <div className="text-2xl font-bold font-mono text-pehra-text mt-1">{warningCount}</div>
          <span className="text-pehra-text text-pehra-text">Incipient ponding</span>
        </div>

        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-4">
          <span className="text-pehra-text text-pehra-text block font-medium">Peak Measured Water</span>
          <div className="text-2xl font-bold font-mono text-pehra-text mt-1">
            {maxLevelStation ? `${maxLevelStation.currentLevelM}m` : '--'}
          </div>
          <span className="text-pehra-text text-pehra-text truncate block">
            {maxLevelStation ? maxLevelStation.name.split('Gauge')[0] : 'Normal'}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-none border border-pehra-border-subtle bg-pehra-panel p-4">
          <span className="text-pehra-text text-pehra-text block font-medium">Arabian Sea Tidal Lock</span>
          <div className="text-2xl font-bold font-mono text-pehra-text mt-1">4.45m</div>
          <span className="text-pehra-text text-pehra-text font-semibold">Tidal Backflow Active</span>
        </div>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-pehra-text" />
          <input
            type="text"
            placeholder="Search stations by name, waterway, or municipal ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-none border border-pehra-border-subtle bg-pehra-panel pl-9 pr-4 py-2 text-xs text-white placeholder:text-pehra-text-muted focus:border-pehra-border-subtle focus:outline-none"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1 rounded-none border border-pehra-border-subtle bg-pehra-panel p-1 text-xs">
          {(['ALL', 'DANGER', 'WARNING', 'NORMAL'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded px-3 py-1 font-semibold transition-all ${
                statusFilter === filter
                  ? filter === 'DANGER'
                    ? 'bg-pehra-panel text-white font-bold'
                    : filter === 'WARNING'
                    ? 'bg-pehra-panel text-white font-bold'
                    : 'bg-pehra-panel text-pehra-text font-bold'
                  : 'text-pehra-text hover:text-white'
              }`}
            >
              {filter === 'ALL' ? 'All Stations' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* REAL-TIME STATION GAUGES GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <div className="h-8 w-8  rounded-none border-4 border-pehra-border-subtle border-t-transparent" />
          <p className="text-xs font-mono text-pehra-text">Loading Real-Time Hydro-Telemetry...</p>
        </div>
      ) : filteredStations.length === 0 ? (
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-12 text-center text-pehra-text">
          No stations match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((station) => {
            const isDanger = station.status === 'DANGER' || station.status === 'CRITICAL';
            const isWarning = station.status === 'WARNING';
            const isSurging = surgeStationId === station.id;

            // Calculate percentage of danger level for animated cross-section
            const fillPct = Math.min(100, Math.max(8, Math.round((station.currentLevelM / station.highestFloodLevelM) * 100)));
            const warningPct = Math.min(100, Math.round((station.warningLevelM / station.highestFloodLevelM) * 100));
            const dangerPct = Math.min(100, Math.round((station.dangerLevelM / station.highestFloodLevelM) * 100));

            return (
              <div
                key={station.id}
                className={`rounded-none border transition-all duration-300 p-5 flex flex-col justify-between ${
                  isDanger
                    ? 'border-pehra-border-subtle bg-pehra-panel shadow-none shadow-none'
                    : isWarning
                    ? 'border-pehra-border-subtle bg-pehra-panel shadow-none shadow-none'
                    : 'border-pehra-border-subtle bg-pehra-panel hover:border-pehra-border-subtle'
                } ${isSurging ? 'ring-2 ring-pehra-focus scale-[1.01]' : ''}`}
              >
                <div>
                  {/* Card Header: Name, Waterway, and Status badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Waves className={`h-3.5 w-3.5 ${isDanger ? 'text-pehra-text' : isWarning ? 'text-pehra-text' : 'text-pehra-text'}`} />
                        <span className="text-pehra-text font-mono uppercase tracking-wider font-semibold text-pehra-text">
                          {station.waterway}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base leading-tight mt-0.5">{station.name}</h3>
                      <span className="text-pehra-text text-pehra-text">{station.ward}</span>
                    </div>

                    <span
                      className={`rounded-none px-2.5 py-0.5 text-pehra-text font-mono font-bold uppercase tracking-wider border shrink-0 ${
                        isDanger
                          ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle '
                          : isWarning
                          ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                          : 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                      }`}
                    >
                      {station.status}
                    </span>
                  </div>

                  {/* RIVERBED CROSS-SECTION DEPTH GAUGE (Physical graphic) */}
                  <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 mb-3 relative overflow-hidden">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-pehra-text text-pehra-text font-mono">Current Water Level</span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-2xl font-mono font-bold ${
                            isDanger ? 'text-pehra-text' : isWarning ? 'text-pehra-text' : 'text-pehra-text'
                          }`}
                        >
                          {station.currentLevelM.toFixed(2)} m
                        </span>
                        <span className="text-pehra-text text-pehra-text">MSL</span>
                      </div>
                    </div>

                    {/* Embankment Graphic Container */}
                    <div className="relative h-16 w-full rounded-none bg-pehra-panel border border-pehra-border-subtle overflow-hidden flex flex-col justify-end">
                      {/* Water Fill Layer */}
                      <div
                        className={`w-full transition-all duration-700 relative ${
                          isDanger
                            ? 'bg-pehra-panel from-pehra-panel to-pehra-panel'
                            : isWarning
                            ? 'bg-pehra-panel from-pehra-panel to-pehra-panel'
                            : 'bg-pehra-panel from-pehra-panel to-pehra-panel'
                        }`}
                        style={{ height: `${fillPct}%` }}
                      >
                        {/* Animated wave crest */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 " />
                      </div>

                      {/* Warning mark line */}
                      <div
                        className="absolute w-full border-t border-dashed border-pehra-border-subtle pointer-events-none flex items-center justify-between px-2 text-pehra-text font-mono text-pehra-text"
                        style={{ bottom: `${warningPct}%` }}
                      >
                        <span>Warning Line</span>
                        <span>{station.warningLevelM}m</span>
                      </div>

                      {/* Danger mark line */}
                      <div
                        className="absolute w-full border-t border-dashed border-pehra-border-subtle pointer-events-none flex items-center justify-between px-2 text-pehra-text font-mono text-pehra-text font-bold"
                        style={{ bottom: `${dangerPct}%` }}
                      >
                        <span>Danger Mark</span>
                        <span>{station.dangerLevelM}m</span>
                      </div>
                    </div>

                    {/* Proximity / Danger Clearance Tag */}
                    <div className="flex items-center justify-between mt-2 text-pehra-text font-mono">
                      <span className="text-pehra-text">Ground Elevation: {station.elevationM}m MSL</span>
                      <span
                        className={
                          station.currentLevelM >= station.dangerLevelM
                            ? 'text-pehra-text font-bold'
                            : station.currentLevelM >= station.warningLevelM
                            ? 'text-pehra-text font-semibold'
                            : 'text-pehra-text'
                        }
                      >
                        {station.currentLevelM >= station.dangerLevelM
                          ? `⚠️ +${(station.currentLevelM - station.dangerLevelM).toFixed(2)}m OVER DANGER!`
                          : `Safe Margin: ${(station.dangerLevelM - station.currentLevelM).toFixed(2)}m`}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Rates & Discharge Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-2">
                      <span className="text-pehra-text text-pehra-text block">Rate of Rise</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-pehra-text mt-0.5">
                        {station.rateOfRiseMPerHr > 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-pehra-text" />
                        ) : station.rateOfRiseMPerHr < 0 ? (
                          <ArrowDownRight className="h-3 w-3 text-pehra-text" />
                        ) : (
                          <Minus className="h-3 w-3 text-pehra-text" />
                        )}
                        <span className={station.rateOfRiseMPerHr > 0.3 ? 'text-pehra-text' : 'text-pehra-text'}>
                          {station.rateOfRiseMPerHr > 0 ? `+${station.rateOfRiseMPerHr}` : station.rateOfRiseMPerHr}m/h
                        </span>
                      </div>
                    </div>

                    <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-2">
                      <span className="text-pehra-text text-pehra-text block">Discharge</span>
                      <span className="font-mono font-bold text-pehra-text mt-0.5 block">
                        {station.dischargeM3s ? `${station.dischargeM3s} m³/s` : '--'}
                      </span>
                    </div>

                    <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-2">
                      <span className="text-pehra-text text-pehra-text block">Flow Speed</span>
                      <span className="font-mono font-bold text-pehra-text mt-0.5 block">
                        {station.flowVelocityMs ? `${station.flowVelocityMs} m/s` : '--'}
                      </span>
                    </div>
                  </div>

                  {/* Mini-Hydrograph Sparkline */}
                  <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-2.5 mb-3">
                    <div className="flex items-center justify-between text-pehra-text text-pehra-text mb-1">
                      <span className="font-mono">Hydrograph (Past 2 Hours)</span>
                      <span className="font-mono text-pehra-text font-semibold">{station.trend}</span>
                    </div>

                    {/* SVG Sparkline */}
                    <div className="h-10 w-full flex items-end gap-1.5 pt-1">
                      {station.history.map((pt, idx) => {
                        const barHeight = Math.min(100, Math.max(15, Math.round((pt.level / station.highestFloodLevelM) * 100)));
                        const isLast = idx === station.history.length - 1;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                            <div
                              className={`w-full rounded-t transition-all ${
                                isLast
                                  ? isDanger
                                    ? 'bg-pehra-panel'
                                    : isWarning
                                    ? 'bg-pehra-panel'
                                    : 'bg-pehra-panel'
                                  : 'bg-pehra-panel'
                              }`}
                              style={{ height: `${barHeight}%` }}
                              title={`${pt.time}: ${pt.level}m`}
                            />
                            <span className="text-pehra-text text-pehra-text font-mono hidden sm:inline">{pt.time.slice(3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between gap-2 border-t border-pehra-border-subtle pt-3">
                  {/* Locate on Map */}
                  <button
                    onClick={() => {
                      if (onNavigateToMapWithStation) {
                        onNavigateToMapWithStation(station.lat, station.lng, station.name);
                      } else {
                        onNavigate('map');
                      }
                    }}
                    className="flex items-center gap-1 text-pehra-text font-semibold text-pehra-text hover:text-pehra-text transition-colors"
                  >
                    <MapPin className="h-3 w-3" />
                    <span>View on Map</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Simulate Surge Test */}
                    <button
                      onClick={() => handleSimulateSurge(station.id)}
                      disabled={isSurging}
                      className="rounded bg-pehra-panel hover:bg-pehra-panel px-2 py-1 text-pehra-text font-mono text-pehra-text hover:text-white transition-colors"
                      title="Simulate cloudburst water surge at this station"
                    >
                      <Zap className="h-3 w-3 inline mr-0.5 text-pehra-text" />
                      <span>Surge Drill</span>
                    </button>

                    {/* Detailed Analysis Modal Trigger */}
                    <button
                      onClick={() => setSelectedStation(station)}
                      className="rounded bg-pehra-panel hover:bg-pehra-panel text-pehra-text border border-pehra-border-subtle px-2.5 py-1 text-pehra-text font-bold transition-all"
                    >
                      Deep Analysis
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STATION DEEP ANALYSIS MODAL */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pehra-panel -sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-none border border-pehra-border-subtle bg-pehra-panel p-6 shadow-none space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold">
                  {selectedStation.waterway} • Comprehensive Telemetry
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedStation.name}</h2>
                <span className="text-xs text-pehra-text">{selectedStation.ward} • Coords: {selectedStation.lat.toFixed(4)}°N, {selectedStation.lng.toFixed(4)}°E</span>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="rounded-none p-1 text-pehra-text hover:bg-pehra-panel hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Level Comparison Meter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-3">
                <span className="text-pehra-text text-pehra-text block">Current Level</span>
                <span className="text-xl font-mono font-bold text-pehra-text">{selectedStation.currentLevelM}m</span>
                <span className="text-pehra-text text-pehra-text block">MSL Datum</span>
              </div>

              <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-3">
                <span className="text-pehra-text text-pehra-text block">Warning Level</span>
                <span className="text-xl font-mono font-bold text-pehra-text">{selectedStation.warningLevelM}m</span>
                <span className="text-pehra-text text-pehra-text block">Stage 1 Threshold</span>
              </div>

              <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-3">
                <span className="text-pehra-text text-pehra-text block">Danger Mark</span>
                <span className="text-xl font-mono font-bold text-pehra-text">{selectedStation.dangerLevelM}m</span>
                <span className="text-pehra-text text-pehra-text block">High Flood Mark</span>
              </div>

              <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-3">
                <span className="text-pehra-text text-pehra-text block">Highest Recorded</span>
                <span className="text-xl font-mono font-bold text-white">{selectedStation.highestFloodLevelM}m</span>
                <span className="text-pehra-text text-pehra-text block">July 2005 Deluge</span>
              </div>
            </div>

            {/* Expanded Time-Series Hydrograph */}
            <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Full Historical Streamflow Hydrograph</span>
                <span className="font-mono text-pehra-text text-pehra-text">Updated {selectedStation.freshnessSeconds}s ago</span>
              </div>

              <div className="h-32 w-full pt-4 flex items-end gap-2 border-b border-pehra-border-subtle">
                {selectedStation.history.map((pt, i) => {
                  const barH = Math.min(100, Math.max(10, Math.round((pt.level / selectedStation.highestFloodLevelM) * 100)));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-pehra-text font-mono text-pehra-text">{pt.level}m</span>
                      <div
                        className="w-full rounded-t bg-pehra-panel from-pehra-panel to-pehra-panel"
                        style={{ height: `${barH}%` }}
                      />
                      <span className="text-pehra-text font-mono text-pehra-text">{pt.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hardware & Transmission Telemetry */}
            <div className="rounded-none bg-pehra-panel border border-pehra-border-subtle p-4 text-xs space-y-2">
              <span className="font-bold text-white block">Physical Sensor & Pipeline Metadata</span>
              <div className="grid grid-cols-2 gap-2 text-pehra-text text-pehra-text">
                <div>
                  <span className="text-pehra-text block">Sensor Model:</span>
                  <span className="font-mono">{selectedStation.sensorModel}</span>
                </div>
                <div>
                  <span className="text-pehra-text block">Ingestion Source URL:</span>
                  <span className="font-mono truncate block text-pehra-text">{selectedStation.sourceUrl}</span>
                </div>
                <div>
                  <span className="text-pehra-text block">Quality State:</span>
                  <span className="font-mono text-pehra-text">{selectedStation.quality} (Zero Packet Drop)</span>
                </div>
                <div>
                  <span className="text-pehra-text block">Estimated Basin Discharge:</span>
                  <span className="font-mono">{selectedStation.dischargeM3s} m³/s</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-pehra-border-subtle">
              <button
                onClick={() => setSelectedStation(null)}
                className="rounded-none bg-pehra-panel px-4 py-2 text-xs font-semibold text-pehra-text hover:bg-pehra-panel"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedStation;
                  setSelectedStation(null);
                  if (onNavigateToMapWithStation) {
                    onNavigateToMapWithStation(s.lat, s.lng, s.name);
                  } else {
                    onNavigate('map');
                  }
                }}
                className="rounded-none bg-pehra-panel px-4 py-2 text-xs font-bold text-pehra-text hover:bg-pehra-panel"
              >
                Inspect on Topographic Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
