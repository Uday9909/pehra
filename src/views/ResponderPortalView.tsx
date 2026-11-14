import React, { useState } from 'react';
import {
  Flame,
  LifeBuoy,
  Radio,
  Truck,
  Anchor,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Shield,
  Activity,
  Droplets,
  Hospital as HospitalIcon,
  Users,
  Plane,
} from 'lucide-react';
import { Incident, Hospital, EvacuationRoute } from '../types/index.ts';

interface ResponderPortalViewProps {
  incidents: Incident[];
  hospitals: Hospital[];
  routes: EvacuationRoute[];
  onNavigate: (tab: string) => void;
}

export const ResponderPortalView: React.FC<ResponderPortalViewProps> = ({
  incidents,
  hospitals,
  routes,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'DISPATCH' | 'EQUIPMENT' | 'HOSPITALS'>('DISPATCH');
  const [acknowledgedIncidents, setAcknowledgedIncidents] = useState<string[]>([]);
  const [deployedBoatsCount, setDeployedBoatsCount] = useState<number>(4);
  const [activePumpsCount, setActivePumpsCount] = useState<number>(18);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleAcknowledge = (id: string, title: string) => {
    if (!acknowledgedIncidents.includes(id)) {
      setAcknowledgedIncidents((prev) => [...prev, id]);
      setActionSuccessMsg(`Assigned to NDRF Team Bravo & acknowledged: "${title}"`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleDeployBoat = () => {
    setDeployedBoatsCount((prev) => prev + 1);
    setActionSuccessMsg('Inflatable rescue boat unit #05 deployed to Mithi River Kranti Nagar sector.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleDeployPump = () => {
    setActivePumpsCount((prev) => prev + 1);
    setActionSuccessMsg('Auxiliary 12,000 LPM dewatering pump dispatched to Gandhi Market Subway.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Responder Tactical Banner */}
      <div className="rounded-none border border-pehra-border-subtle bg-pehra-raised p-5 sm:p-6 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-none bg-pehra-panel text-pehra-text border border-pehra-border-subtle shrink-0">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-none bg-pehra-panel px-2.5 py-0.5 text-pehra-text font-mono font-semibold text-pehra-text border border-pehra-border-subtle">
                  TACTICAL FIRST RESPONDER CONSOLE
                </span>
                <span className="text-xs text-pehra-text font-medium">Commander Amit Shinde (NDRF 5th Bn)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-pehra-text tracking-tight mt-1">
                NDRF & Mumbai Fire Brigade Tactical Operations
              </h1>
              <p className="text-xs sm:text-sm text-pehra-text mt-1 max-w-2xl">
                Field dispatch triage, inflatable rescue craft deployment, subway dewatering pump allocation, and hospital trauma emergency intake coordination.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('drone-recon')}
              className="flex items-center gap-1.5 rounded-none border border-pehra-border-subtle bg-pehra-panel px-3.5 py-2 text-xs font-bold text-pehra-text hover:bg-pehra-raised transition-colors shadow-none"
            >
              <Plane className="h-3.5 w-3.5" />
              <span>Live Drone Recon</span>
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="flex items-center gap-1.5 rounded-none bg-pehra-panel px-3.5 py-2 text-xs font-semibold text-pehra-text hover:bg-pehra-raised shadow-none transition-all"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Tactical Map</span>
            </button>
          </div>
        </div>

        {/* Live Tactical Equipment Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-pehra-border-subtle text-xs">
          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="flex items-center justify-between text-pehra-text">
              <span className="font-medium">Rescue Boats Active</span>
              <Anchor className="h-3.5 w-3.5 text-pehra-text" />
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-pehra-text">{deployedBoatsCount} Units</div>
            <div className="text-pehra-text-2 mt-0.5">2 Mithi, 1 Sion, 1 Poisar</div>
          </div>

          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="flex items-center justify-between text-pehra-text">
              <span className="font-medium">High-Capacity Pumps</span>
              <Droplets className="h-3.5 w-3.5 text-pehra-text" />
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-pehra-text">{activePumpsCount} Deployed</div>
            <div className="text-pehra-text-2 mt-0.5">Discharging @ 18,400 L/min</div>
          </div>

          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="flex items-center justify-between text-pehra-text">
              <span className="font-medium">Trauma Beds Ready</span>
              <HospitalIcon className="h-3.5 w-3.5 text-pehra-text" />
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-pehra-text">42 Beds</div>
            <div className="text-pehra-text-2 mt-0.5">Across KEM, Sion, Bhabha</div>
          </div>

          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="flex items-center justify-between text-pehra-text">
              <span className="font-medium">Tactical VHF Channel</span>
              <Radio className="h-3.5 w-3.5 text-pehra-text" />
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-pehra-text">TAC-CH-04</div>
            <div className="text-pehra-text-2 mt-0.5">Repeater: Sion Fort Tower</div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3.5 text-xs text-pehra-text flex items-center justify-between shadow-none animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-pehra-text shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <span className="text-pehra-text font-mono text-pehra-text">ACKNOWLEDGED</span>
        </div>
      )}

      {/* Segmented Tactical Mode Tabs */}
      <div className="flex items-center gap-1.5 border-b border-pehra-border-subtle pb-2 text-xs">
        <button
          onClick={() => setActiveTab('DISPATCH')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all ${
            activeTab === 'DISPATCH'
              ? 'bg-pehra-panel text-pehra-text shadow-none'
              : 'text-pehra-text hover:text-pehra-text hover:bg-pehra-raised'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Incident Dispatch Queue ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EQUIPMENT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all ${
            activeTab === 'EQUIPMENT'
              ? 'bg-pehra-panel text-pehra-text shadow-none'
              : 'text-pehra-text hover:text-pehra-text hover:bg-pehra-raised'
          }`}
        >
          <Truck className="h-3.5 w-3.5" />
          <span>Field Apparatus & Pumps</span>
        </button>

        <button
          onClick={() => setActiveTab('HOSPITALS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none font-semibold transition-all ${
            activeTab === 'HOSPITALS'
              ? 'bg-pehra-panel text-pehra-text shadow-none'
              : 'text-pehra-text hover:text-pehra-text hover:bg-pehra-raised'
          }`}
        >
          <HospitalIcon className="h-3.5 w-3.5" />
          <span>Trauma Center Intake ({hospitals.length})</span>
        </button>
      </div>

      {/* TAB 1: INCIDENT DISPATCH QUEUE */}
      {activeTab === 'DISPATCH' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((inc) => {
              const isAck = acknowledgedIncidents.includes(inc.id);
              return (
                <div
                  key={inc.id}
                  className={`rounded-none border p-5 flex flex-col justify-between transition-all bg-pehra-raised shadow-none ${
                    inc.severity === 'CRITICAL'
                      ? 'border-pehra-border-subtle'
                      : inc.severity === 'HIGH'
                      ? 'border-pehra-border-subtle'
                      : 'border-pehra-border-subtle'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`rounded-none px-2.5 py-0.5 text-pehra-text font-mono font-bold uppercase border ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-pehra-panel border-pehra-border-subtle text-pehra-text'
                            : inc.severity === 'HIGH'
                            ? 'bg-pehra-panel border-pehra-border-subtle text-pehra-text'
                            : 'bg-pehra-panel border-pehra-border-subtle text-pehra-text'
                        }`}
                      >
                        {inc.severity} PRIORITY
                      </span>

                      <span className="text-pehra-text font-mono text-pehra-text">
                        {new Date(inc.startedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-pehra-text">{inc.title}</h3>
                      <p className="text-xs text-pehra-text mt-1">
                        {inc.timeline[0]?.description || 'Urban waterlogging and inundation reported in active sector.'}
                      </p>
                    </div>

                    <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-2.5 text-pehra-text space-y-1">
                      <div className="text-pehra-text">
                        Location: <strong className="text-pehra-text">{inc.originLocation?.name || 'Mumbai Sector'}</strong>
                      </div>
                      <div className="text-pehra-text">
                        Casualties / Persons Stranded: <strong className="text-pehra-text">{inc.estimatedAffectedPeople}</strong>
                      </div>
                      <div className="text-pehra-text font-mono">
                        Incident ID: <span className="text-pehra-text">{inc.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-pehra-border-subtle flex items-center justify-between gap-2">
                    {isAck ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-pehra-text bg-pehra-panel border border-pehra-border-subtle px-3 py-1.5 rounded-none">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Team Dispatched</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(inc.id, inc.title)}
                        className="py-1.5 px-3 rounded-none bg-pehra-panel hover:bg-pehra-raised text-pehra-text text-xs font-semibold transition-colors shadow-none"
                      >
                        Acknowledge & Deploy
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('map')}
                        className="p-1.5 rounded-none border border-pehra-border-subtle bg-pehra-panel text-pehra-text hover:bg-pehra-raised text-xs"
                        title="View on Map"
                      >
                        <Compass className="h-4 w-4" />
                      </button>
                      <a
                        href="tel:101"
                        className="flex items-center gap-1 rounded-none border border-pehra-border-subtle bg-pehra-panel px-2.5 py-1.5 text-xs font-semibold text-pehra-text hover:bg-pehra-raised"
                        title="Emergency Dispatch Link"
                      >
                        <PhoneCall className="h-3 w-3" />
                        <span>Fire: 101</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FIELD APPARATUS & EQUIPMENT */}
      {activeTab === 'EQUIPMENT' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rescue Boats Card */}
            <div className="rounded-none border border-pehra-border-subtle bg-pehra-raised p-5 space-y-4 shadow-none">
              <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-pehra-text" />
                  <h3 className="font-bold text-pehra-text text-sm">Inflatable Rescue Boats (Gemini Craft)</h3>
                </div>
                <span className="font-mono text-xs font-bold text-pehra-text bg-pehra-panel border border-pehra-border-subtle px-2.5 py-0.5 rounded-none">
                  {deployedBoatsCount} In Field
                </span>
              </div>

              <p className="text-xs text-pehra-text">
                Outboard motor boats allocated for swift-water rescue in Mithi estuary, Kranti Nagar, and Milan Subway.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel flex justify-between">
                  <span className="text-pehra-text">Craft #01 (Mithi Kranti Nagar)</span>
                  <span className="font-semibold text-pehra-text font-mono">ACTIVE (6 Rescued)</span>
                </div>
                <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel flex justify-between">
                  <span className="text-pehra-text">Craft #02 (Sion Gandhi Market)</span>
                  <span className="font-semibold text-pehra-text font-mono">STANDBY ON TENDER</span>
                </div>
                <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel flex justify-between">
                  <span className="text-pehra-text">Craft #03 (Kandivali Poisar)</span>
                  <span className="font-semibold text-pehra-text font-mono">EN ROUTE</span>
                </div>
              </div>

              <button
                onClick={handleDeployBoat}
                className="w-full py-2.5 rounded-none bg-pehra-panel text-pehra-text font-semibold text-xs hover:bg-pehra-raised shadow-none transition-colors"
              >
                + Deploy Reserve Boat Unit #0{deployedBoatsCount + 1}
              </button>
            </div>

            {/* Dewatering Pumps Card */}
            <div className="rounded-none border border-pehra-border-subtle bg-pehra-raised p-5 space-y-4 shadow-none">
              <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-pehra-text" />
                  <h3 className="font-bold text-pehra-text text-sm">Submersible Dewatering Pumps</h3>
                </div>
                <span className="font-mono text-xs font-bold text-pehra-text bg-pehra-panel border border-pehra-border-subtle px-2.5 py-0.5 rounded-none">
                  {activePumpsCount} Active
                </span>
              </div>

              <p className="text-xs text-pehra-text">
                Diesel-driven 6,000 to 12,000 LPM submersible units installed at critical railway dips and pedestrian subways.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel flex justify-between">
                  <span className="text-pehra-text">Dadar TT Circle Pump #1</span>
                  <span className="font-mono font-semibold text-pehra-text">8,200 LPM • Diesel 84%</span>
                </div>
                <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel flex justify-between">
                  <span className="text-pehra-text">Milan Subway Pump Station</span>
                  <span className="font-mono font-semibold text-pehra-text">12,000 LPM • Diesel 92%</span>
                </div>
                <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel flex justify-between">
                  <span className="text-pehra-text">Hindmata Cinema Basins</span>
                  <span className="font-mono font-semibold text-pehra-text">10,500 LPM • Diesel 78%</span>
                </div>
              </div>

              <button
                onClick={handleDeployPump}
                className="w-full py-2.5 rounded-none bg-pehra-panel text-pehra-text font-semibold text-xs hover:bg-pehra-raised shadow-none transition-colors"
              >
                + Dispatch Mobile Pump Tender to Next Bottleneck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRAUMA CENTER & HOSPITAL INTAKE */}
      {activeTab === 'HOSPITALS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((hsp) => (
            <div
              key={hsp.id}
              className="rounded-none border border-pehra-border-subtle bg-pehra-raised p-5 space-y-4 shadow-none"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-pehra-text text-base">{hsp.name}</h3>
                  <p className="text-xs text-pehra-text mt-0.5">{hsp.location.address}</p>
                </div>
                <span className="rounded-none bg-pehra-panel border border-pehra-border-subtle text-pehra-text px-2 py-0.5 text-pehra-text font-mono font-semibold uppercase">
                  TRAUMA READY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel">
                  <span className="text-pehra-text-2 block">Emergency Intake</span>
                  <span className="text-sm font-bold font-mono text-pehra-text">
                    {hsp.availableBeds} Beds Free
                  </span>
                </div>

                <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel">
                  <span className="text-pehra-text-2 block">Power & Generator</span>
                  <span className="text-sm font-bold text-pehra-text font-mono">100% SECURE</span>
                </div>
              </div>

              <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel text-xs">
                <span className="text-pehra-text-2 block">Hospital Helpline:</span>
                <a href={`tel:${hsp.contactPhone}`} className="font-mono text-pehra-text font-semibold block mt-0.5">
                  📞 {hsp.contactPhone}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
