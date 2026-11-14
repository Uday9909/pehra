import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  AlertTriangle,
  Flame,
  Users,
  Building2,
  Clock,
  Droplets,
  Wind,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/client.ts';

export const SimulationView: React.FC = () => {
  const [scenario, setScenario] = useState('Compound Flood (Cloudburst + High Tide)');
  const [rainfallMmHr, setRainfallMmHr] = useState(95);
  const [durationHours, setDurationHours] = useState(4);
  const [tideLevelM, setTideLevelM] = useState(4.8);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const presets = [
    { name: 'Normal Monsoon', rain: 25, duration: 2, tide: 2.2 },
    { name: 'Heavy Rain (65mm/hr)', rain: 65, duration: 3, tide: 3.5 },
    { name: 'Cloudburst Warning (100mm/hr)', rain: 100, duration: 2, tide: 3.8 },
    { name: 'High Tide Lockout', rain: 45, duration: 4, tide: 4.9 },
    { name: 'Compound Flood (Cloudburst + High Tide)', rain: 100, duration: 4, tide: 4.8 },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setScenario(p.name);
    setRainfallMmHr(p.rain);
    setDurationHours(p.duration);
    setTideLevelM(p.tide);
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.runSimulation({
        scenarioName: scenario,
        parameters: {
          rainfallMmHr,
          durationHours,
          tideLevelM,
          riverDischargeM3s: 950,
        },
      });
      setResults(res.simulation);
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Simulation Banner - Mandatory "SIMULATION - NOT LIVE" */}
      <div className="flex items-center justify-between rounded-none border border-pehra-border-subtle bg-pehra-panel p-4 text-pehra-text shadow-none">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-5 w-5 text-pehra-text shrink-0" />
          <div>
            <div className="font-bold text-sm uppercase tracking-wider text-pehra-text">
              SIMULATION LAB — EXPERIMENTAL ENVIRONMENT (NOT LIVE DATA)
            </div>
            <div className="text-xs text-pehra-text">
              Disaster scenario sandboxing for municipal preparedness, subway flood mitigation, and shelter capacity forecasting.
            </div>
          </div>
        </div>
        <span className="rounded bg-pehra-panel px-2.5 py-1 text-xs font-black text-pehra-text uppercase font-mono">
          TESTBED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-pehra-text" />
              <h2 className="text-base font-bold text-pehra-text">Scenario Parameters</h2>
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-pehra-text text-xs font-semibold mb-2">Preset Scenarios:</label>
            <div className="space-y-1.5">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className={`w-full text-left rounded-none p-2 text-xs font-medium border transition-all ${
                    scenario === p.name
                      ? 'border-pehra-border-control bg-pehra-raised font-semibold text-pehra-text'
                      : 'border-pehra-border-subtle bg-pehra-panel text-pehra-text-2 hover:border-pehra-border-control hover:text-pehra-text'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-pehra-text">Rainfall Intensity:</span>
                <span className="font-mono font-bold text-pehra-text">{rainfallMmHr} mm/hr</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={rainfallMmHr}
                onChange={(e) => setRainfallMmHr(parseInt(e.target.value))}
                className="w-full accent-pehra-action"
              />
              <div className="flex justify-between text-pehra-text-2">
                <span>10 mm/hr (Light)</span>
                <span>65 (Heavy)</span>
                <span>150 (Extreme Cloudburst)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-pehra-text">Storm Duration:</span>
                <span className="font-mono font-bold text-pehra-text">{durationHours} Hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value))}
                className="w-full accent-pehra-action"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-pehra-text">Arabian Sea Tide Height:</span>
                <span className="font-mono font-bold text-pehra-text">{tideLevelM} meters</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.5"
                step="0.1"
                value={tideLevelM}
                onChange={(e) => setTideLevelM(parseFloat(e.target.value))}
                className="w-full accent-pehra-action"
              />
              <div className="flex justify-between text-pehra-text-2">
                <span>1.5m (Low Tide)</span>
                <span>4.0m (High Tide)</span>
                <span>5.0m+ (Surge Lockout)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="flex w-full items-center justify-center gap-2 bg-pehra-action py-2.5 font-bold text-pehra-action-text transition-opacity hover:opacity-90"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{simulating ? 'Executing Hydrodynamic Model...' : 'Execute Simulation Run'}</span>
          </button>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
              <div>
                <h3 className="text-base font-bold text-pehra-text">Projected Impact Analysis</h3>
                <span className="text-xs text-pehra-text">Scenario: {scenario}</span>
              </div>
              <span className="border border-pehra-severity-warning px-2 py-0.5 font-mono text-xs font-bold text-pehra-severity-warning">
                HIGH SEVERITY
              </span>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
                <span className="text-pehra-text-2 block">Estimated Inundation</span>
                <span className="text-xl font-bold font-mono text-pehra-text">
                  {results ? `${results.summary.maxPredictedDepthM} m` : '2.35 m'}
                </span>
                <span className="text-pehra-text-2 block mt-0.5">Low-lying depressions</span>
              </div>

              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
                <span className="text-pehra-text-2 block">Exposed Population</span>
                <span className="text-xl font-bold font-mono text-pehra-text">
                  {results ? results.summary.affectedPopulation.toLocaleString() : '84,000'}
                </span>
                <span className="text-pehra-text-2 block mt-0.5">Wards L, F/N, H/E</span>
              </div>

              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
                <span className="text-pehra-text-2 block">Submerged Subways</span>
                <span className="text-xl font-bold font-mono text-pehra-text">
                  {results ? results.summary.subwaysFlooded.length : 3}
                </span>
                <span className="text-pehra-text-2 block mt-0.5">Milan, Andheri, Sion</span>
              </div>

              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
                <span className="text-pehra-text-2 block">Required Shelter Beds</span>
                <span className="text-xl font-bold font-mono text-pehra-text">
                  {results ? results.summary.sheltersRequired : 6} Facilities
                </span>
                <span className="text-pehra-text-2 block mt-0.5">~3,200 emergency beds</span>
              </div>
            </div>

            {/* Submerged Subways List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-pehra-text block">Critical Road Infrastructure Submersion Risk:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {['Milan Subway (Vile Parle)', 'Andheri Subway', 'Gandhi Market Highway Dip'].map((subway, i) => (
                  <div key={i} className="rounded border border-pehra-border-subtle bg-pehra-panel p-2 text-pehra-text">
                    <span className="font-bold block">⚠️ {subway}</span>
                    <span className="text-pehra-text-2">Predicted Depth: &gt;1.8m (Impassable)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projected Hourly Progression Timeline */}
            <div className="space-y-2 pt-2 border-t border-pehra-border-subtle">
              <span className="text-xs font-bold text-pehra-text block">Projected Hourly Flood Progression:</span>
              <div className="space-y-2 text-xs">
                {(results?.timeline || [
                  { hour: 1, text: 'Stormwater drains at 100% capacity; gutters begin spilling at Kurla station.' },
                  { hour: 2, text: 'Mithi River spillage breaches Bail Bazar; Gandhi market submerged to 1.2m.' },
                  { hour: 3, text: 'High tide peak locks Arabian Sea outflow; water backflows through storm gates.' },
                  { hour: 4, text: 'Peak inundation reached; Milan subway completely impassable; evacuation mandatory.' },
                ]).map((t: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 rounded bg-pehra-panel p-2.5 border border-pehra-border-subtle">
                    <span className="rounded bg-pehra-panel border border-pehra-border-subtle px-2 py-0.5 font-mono font-bold text-pehra-text-2">
                      T+{t.hour}h
                    </span>
                    <span className="text-pehra-text">{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
