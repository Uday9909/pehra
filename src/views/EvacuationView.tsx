import React, { useState } from 'react';
import { EvacuationRoute, Shelter, Hospital } from '../types/index.ts';
import {
  LifeBuoy,
  Compass,
  Building2,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';

interface EvacuationViewProps {
  routes: EvacuationRoute[];
  shelters: Shelter[];
  hospitals: Hospital[];
  onNavigate: (tab: string) => void;
}

export const EvacuationView: React.FC<EvacuationViewProps> = ({
  routes,
  shelters,
  hospitals,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'ROUTES' | 'SHELTERS' | 'HOSPITALS'>('ROUTES');

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pehra-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-pehra-text tracking-tight">Evacuation Logistics & Safe Havens</h1>
          <p className="text-xs text-pehra-text mt-1">
            Real-time verified corridors, relief camp inventory stockpiles, and trauma hospital emergency capacities
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-none border border-pehra-border-subtle bg-pehra-panel p-1 text-xs">
          <button
            onClick={() => setActiveTab('ROUTES')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition-all ${
              activeTab === 'ROUTES' ? 'bg-pehra-panel text-pehra-text font-bold' : 'text-pehra-text hover:text-pehra-text'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Evacuation Routes ({routes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SHELTERS')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition-all ${
              activeTab === 'SHELTERS' ? 'bg-pehra-panel text-pehra-text font-bold' : 'text-pehra-text hover:text-pehra-text'
            }`}
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>Relief Shelters ({shelters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('HOSPITALS')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition-all ${
              activeTab === 'HOSPITALS' ? 'bg-pehra-panel text-pehra-text font-bold' : 'text-pehra-text hover:text-pehra-text'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Hospitals & Beds ({hospitals.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Evacuation Routes */}
      {activeTab === 'ROUTES' && (
        <div className="space-y-4">
          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-4 text-xs text-pehra-text">
            <strong>Dynamic Highway & Subway Safety Status:</strong> Evacuation paths are continuously validated against DEM flood contours and dewatering pump statuses. All subways with &gt;0.5m water are marked BLOCKED with automated elevated bypasses.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => {
              const isClear = route.status === 'CLEAR';
              const isCaution = route.status === 'CAUTION';

              return (
                <div key={route.id} className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold">
                        Route Corridor
                      </span>
                      <h3 className="font-bold text-pehra-text text-base mt-0.5">{route.name}</h3>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-pehra-text font-bold uppercase ${
                        isClear ? 'bg-pehra-panel text-pehra-text' : isCaution ? 'bg-pehra-panel text-pehra-text' : 'bg-pehra-panel text-pehra-text'
                      }`}
                    >
                      {route.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-pehra-border-subtle pt-3 text-xs">
                    <div>
                      <span className="text-pehra-text-2 block">Corridor Length</span>
                      <span className="font-mono font-bold text-pehra-text">{route.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-pehra-text-2 block">Travel Time</span>
                      <span className="font-mono font-bold text-pehra-text">{route.estimatedTravelMinutes} mins</span>
                    </div>
                    <div>
                      <span className="text-pehra-text-2 block">Hazard Risk</span>
                      <span className="font-mono font-bold text-pehra-text">{(route.riskScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="text-xs text-pehra-text">
                    <span className="font-semibold text-pehra-text">Corridor Safety Check: </span>
                    <span className={route.safetyCheckPassed ? 'text-pehra-text font-semibold' : 'text-pehra-text font-semibold'}>
                      {route.safetyCheckPassed ? 'Passed (Elevated corridor above flood contour)' : 'Caution (Active Monitoring)'}
                    </span>
                  </div>

                  {route.alternativeRouteWaypoints && (
                    <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-2.5 text-pehra-text-2">
                      <strong>Elevated Bypass Verified:</strong> Secondary high-ground route mapped in case of arterial congestion.
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onNavigate('map')}
                      className="flex items-center gap-1 text-xs font-semibold text-pehra-text hover:text-pehra-text"
                    >
                      <span>Show Route Geometry on Map</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Shelters */}
      {activeTab === 'SHELTERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shelters.map((shelter) => {
            const pct = Math.round((shelter.occupancy / shelter.capacity) * 100);

            return (
              <div key={shelter.id} className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold">
                      Designated Municipal Facility
                    </span>
                    <h3 className="font-bold text-pehra-text text-base mt-0.5">{shelter.name}</h3>
                    <p className="text-xs text-pehra-text">{shelter.location.address}</p>
                  </div>
                  <span className="rounded bg-pehra-panel border border-pehra-border-subtle px-2 py-0.5 text-pehra-text font-bold text-pehra-text uppercase">
                    {shelter.status}
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3 text-xs space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-pehra-text">Current Occupancy:</span>
                    <span className="text-pehra-text">
                      {shelter.occupancy} / {shelter.capacity} people ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-none bg-pehra-panel overflow-hidden">
                    <div
                      className={`h-full rounded-none transition-all ${pct > 80 ? 'bg-pehra-panel' : 'bg-pehra-panel'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Emergency Supplies Inventory */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-pehra-text block">Stockpile Inventory:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-pehra-text">
                    <div className="rounded bg-pehra-panel p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">Food Packs</span>
                      <span className="font-mono font-bold text-pehra-text">{shelter.emergencySupplies.foodPacks}</span>
                    </div>
                    <div className="rounded bg-pehra-panel p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">Water (L)</span>
                      <span className="font-mono font-bold text-pehra-text">{shelter.emergencySupplies.waterLiters}</span>
                    </div>
                    <div className="rounded bg-pehra-panel p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">First Aid</span>
                      <span className="font-mono font-bold text-pehra-text">{shelter.emergencySupplies.firstAidKits}</span>
                    </div>
                    <div className="rounded bg-pehra-panel p-2 border border-pehra-border-subtle">
                      <span className="text-pehra-text block text-pehra-text">Blankets</span>
                      <span className="font-mono font-bold text-pehra-text">{shelter.emergencySupplies.blankets}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-pehra-border-subtle pt-3 text-xs">
                  <span className="text-pehra-text">Coordinator: <strong className="text-pehra-text">{shelter.contactPerson}</strong></span>
                  <a href={`tel:${shelter.contactPhone}`} className="text-pehra-text font-bold hover:underline">
                    📞 {shelter.contactPhone}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Hospitals */}
      {activeTab === 'HOSPITALS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-pehra-text font-mono text-pehra-text uppercase tracking-wider font-semibold">
                    Emergency Medical Center
                  </span>
                  <h3 className="font-bold text-pehra-text text-base mt-0.5">{hospital.name}</h3>
                  <p className="text-xs text-pehra-text">{hospital.location.address}</p>
                </div>
                <span className="rounded bg-pehra-panel border border-pehra-border-subtle px-2 py-0.5 text-pehra-text font-bold text-pehra-text">
                  TRAUMA READY
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-pehra-border-subtle pt-3 text-xs">
                <div className="rounded bg-pehra-panel p-2.5 border border-pehra-border-subtle text-center">
                  <span className="text-pehra-text-2 block">Available Beds</span>
                  <span className="font-mono text-lg font-bold text-pehra-text">{hospital.availableBeds}</span>
                  <span className="text-pehra-text-2 block">of {hospital.emergencyCapacity}</span>
                </div>

                <div className="rounded bg-pehra-panel p-2.5 border border-pehra-border-subtle text-center">
                  <span className="text-pehra-text-2 block">Ambulances Ready</span>
                  <span className="font-mono text-lg font-bold text-pehra-text">{hospital.ambulanceAvailable}</span>
                  <span className="text-pehra-text-2 block">High-Axle</span>
                </div>

                <div className="rounded bg-pehra-panel p-2.5 border border-pehra-border-subtle text-center">
                  <span className="text-pehra-text-2 block">Blood Bank</span>
                  <span className="font-mono text-lg font-bold text-pehra-text">{hospital.bloodBank ? 'YES' : 'NO'}</span>
                  <span className="text-pehra-text-2 block">O-Neg Avail</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-pehra-border-subtle pt-3 text-xs">
                <span className="text-pehra-text">Helpline: <strong className="text-pehra-text font-mono">{hospital.contactPhone}</strong></span>
                <a
                  href={`tel:${hospital.contactPhone}`}
                  className="rounded bg-pehra-panel px-3 py-1 text-pehra-text font-bold hover:bg-pehra-raised"
                >
                  Call Casualty
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
