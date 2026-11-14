import React, { useState } from 'react';
import { Incident } from '../types/index.ts';
import {
  Flame,
  Clock,
  Layers,
  MapPin,
  TrendingUp,
  Shield,
  Activity,
  ChevronRight,
  ArrowRight,
  Droplets,
} from 'lucide-react';

interface IncidentsViewProps {
  incidents: Incident[];
  onNavigate: (tab: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ incidents, onNavigate }) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');

  const currentIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pehra-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-pehra-text tracking-tight">Active Flood Incidents & DEM Spread Engine</h1>
          <p className="text-xs text-pehra-text mt-1">
            Tracking multi-stage flood progression, cellular downhill propagation, and inter-agency dispatch timelines
          </p>
        </div>

        <button
          onClick={() => onNavigate('map')}
          className="flex items-center gap-1.5 bg-pehra-action px-3.5 py-1.5 text-xs font-bold text-pehra-action-text hover:opacity-90"
        >
          <span>View on Map</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents List Column */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-pehra-text">Recorded Flood Incidents</div>

          {incidents.map((inc) => {
            const isSelected = inc.id === currentIncident?.id;
            const isCritical = inc.severity === 'CRITICAL';

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                className={`cursor-pointer rounded-none border p-4 transition-all ${
                  isSelected
                    ? 'border-pehra-border-control bg-pehra-raised'
                    : 'border-pehra-border-subtle bg-pehra-panel hover:border-pehra-border-control'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-pehra-text font-mono font-semibold text-pehra-text uppercase">
                      {inc.incidentType}
                    </span>
                    <h3 className="font-bold text-pehra-text text-sm mt-0.5">{inc.title}</h3>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5  font-bold ${
                      isCritical ? 'bg-pehra-severity-critical text-pehra-bg' : inc.severity === 'HIGH' ? 'bg-pehra-severity-warning text-pehra-bg' : 'bg-pehra-severity-watch text-pehra-bg'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-pehra-text border-t border-pehra-border-subtle pt-2.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(inc.startedAt).toLocaleTimeString()}</span>
                  </span>
                  <span>Affected: <strong className="text-pehra-text">{inc.estimatedAffectedPeople.toLocaleString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Incident Detail & DEM Spread Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {currentIncident && (
            <>
              {/* Incident Summary Card */}
              <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="border border-pehra-border-subtle bg-pehra-raised px-2 py-0.5 font-bold uppercase text-pehra-text-2">
                        {currentIncident.status}
                      </span>
                      <span className="text-xs text-pehra-text font-mono">ID: {currentIncident.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-pehra-text mt-1">{currentIncident.title}</h2>
                  </div>

                  <div className="text-right">
                    <span className="text-pehra-text text-xs block">Origin Epicenter</span>
                    <span className="font-semibold text-pehra-text text-sm">{currentIncident.originLocation.name}</span>
                  </div>
                </div>

                {/* Assigned Responder Teams */}
                <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs">
                  <span className="text-pehra-text font-semibold block mb-1">Assigned Operational Teams:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentIncident.assignedTeams.map((team, i) => (
                      <span key={i} className="border border-pehra-border-subtle bg-pehra-raised px-2 py-0.5 text-pehra-text-2">
                        🛡️ {team}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Model B: Flood Spread Propagation Cells */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-pehra-text" />
                      <h3 className="font-bold text-pehra-text text-sm">Model B: Hydrodynamic DEM Flood Spread Propagation</h3>
                    </div>
                    <span className="text-pehra-text font-mono text-pehra-text">Downhill Cell Expansion Matrix</span>
                  </div>

                  <div className="overflow-x-auto rounded-none border border-pehra-border-subtle bg-pehra-panel">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-pehra-border-subtle bg-pehra-panel text-pehra-text uppercase tracking-wider text-pehra-text font-mono">
                        <tr>
                          <th className="p-2.5">Spread Cell</th>
                          <th className="p-2.5">Arrival ETA</th>
                          <th className="p-2.5">Water Depth</th>
                          <th className="p-2.5">Confidence</th>
                          <th className="p-2.5">Verification Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pehra-border-subtle">
                        {currentIncident.spreadEvents.map((evt) => (
                          <tr key={evt.id} className="hover:bg-pehra-panel">
                            <td className="p-2.5 font-medium text-pehra-text">
                              <div>{evt.cellName}</div>
                              <span className="text-pehra-text font-mono text-pehra-text">{evt.cellId}</span>
                            </td>
                            <td className="p-2.5 font-mono">
                              {evt.etaHours === 0 ? (
                                <span className="text-pehra-text font-bold">Submerged (Current)</span>
                              ) : (
                                <span className="text-pehra-text font-semibold">+{evt.etaHours} hrs</span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono font-bold text-pehra-text">{evt.depthM} m</td>
                            <td className="p-2.5 font-mono text-pehra-text">{(evt.confidence * 100).toFixed(0)}%</td>
                            <td className="p-2.5">
                              <span
                                className={`rounded px-1.5 py-0.5  font-mono font-bold ${
                                  evt.source === 'SENSOR'
                                    ? 'border border-pehra-data-live text-pehra-data-live'
                                    : 'border border-pehra-data-predicted text-pehra-data-predicted'
                                }`}
                              >
                                {evt.source}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Multi-Stage Incident Timeline */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-pehra-text" />
                    <h3 className="font-bold text-pehra-text text-sm">Chronological Event Timeline</h3>
                  </div>

                  <div className="relative border-l border-pehra-border-subtle pl-4 ml-2 space-y-4 text-xs">
                    {currentIncident.timeline.map((item) => (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-none bg-pehra-panel border-2 border-pehra-border-subtle" />
                        <div className="text-pehra-text font-mono text-pehra-text">
                          {new Date(item.timestamp).toLocaleTimeString()} • {item.source}
                        </div>
                        <h4 className="font-bold text-pehra-text mt-0.5">{item.title}</h4>
                        <p className="text-pehra-text mt-0.5">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
