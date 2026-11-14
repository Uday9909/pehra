import React, { useState } from 'react';
import {
  ShieldAlert,
  Building,
  Plane,
  AlertOctagon,
  FileCheck2,
  DollarSign,
  Lock,
  Unlock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Landmark,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { AuditLog } from '../types/index.ts';

interface SuperAdminPortalViewProps {
  onNavigate: (tab: string) => void;
}

export const SuperAdminPortalView: React.FC<SuperAdminPortalViewProps> = ({ onNavigate }) => {
  const [sdrfAllocatedCr, setSdrfAllocatedCr] = useState<number>(150);
  const [armedForcesStatus, setArmedForcesStatus] = useState({
    navySorties: 'STANDBY (INS Shikra)',
    coastGuardHovercraft: 'PATROLLING MAHIM ESTUARY',
    armyEngineeringGroup: 'MOBILIZED KALYAN DEPOT',
  });
  const [proclamations, setProclamations] = useState([
    {
      id: 'proc-01',
      title: 'Disaster Management Act 2005: Section 144 Inundation Restrictions',
      status: 'ACTIVE',
      sectors: 'Kurla West, Sion Gandhi Market, Milan Subway dip',
      issuedAt: 'Today, 14:15 IST',
    },
    {
      id: 'proc-02',
      title: 'Suburban Railway Harbour Line Precautionary Power Isolation',
      status: 'UNDER_EVALUATION',
      sectors: 'Chunabhatti to Vadala Road waterlogged section',
      issuedAt: 'Pending 16:30 high tide peak',
    },
  ]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [masterOverrideActive, setMasterOverrideActive] = useState<boolean>(false);

  const handleAllocateSdrf = () => {
    setSdrfAllocatedCr((prev) => prev + 50);
    setActionSuccessMsg('Authorized ₹50 Crores supplementary SDRF tranche to Municipal Emergency Relief Account.');
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleToggleNavySortie = () => {
    setArmedForcesStatus((prev) => ({
      ...prev,
      navySorties: prev.navySorties.includes('ACTIVE') ? 'STANDBY (INS Shikra)' : 'ACTIVE AIRLIFT RECONNAISSANCE',
    }));
    setActionSuccessMsg('Airspace and helipad authorization dispatched to Western Naval Command HQ.');
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleToggleOverride = () => {
    setMasterOverrideActive(!masterOverrideActive);
    setActionSuccessMsg(
      !masterOverrideActive
        ? 'Executive State Master Override ENGAGED: State DM Cell has direct telemetry control.'
        : 'Executive State Master Override DISENGAGED: Decentralized ward authority restored.'
    );
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Apex Banner */}
      <div className="rounded-none border border-pehra-border-subtle bg-white p-5 sm:p-6 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-none bg-pehra-panel text-pehra-text border border-pehra-border-subtle shrink-0">
              <Landmark className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-none bg-pehra-panel px-2.5 py-0.5 text-pehra-text font-mono font-semibold text-pehra-text border border-pehra-border-subtle">
                  APEX STATE CRISIS EXECUTIVE (TIER 4)
                </span>
                <span className="text-xs text-pehra-text font-medium">Chief Sec. Sunita Rao (IAS) • Mantralaya War Room</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-pehra-text tracking-tight mt-1">
                State Emergency Cabinet & Armed Forces Requisition
              </h1>
              <p className="text-xs sm:text-sm text-pehra-text mt-1 max-w-2xl">
                Supreme executive jurisdiction: Statutory disaster declarations under DMA 2005, immediate State Disaster Response Fund (SDRF) disbursements, and Military/Navy joint mobilization.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('drone-recon')}
              className="flex items-center gap-1.5 rounded-none border border-pehra-border-subtle bg-pehra-panel px-3.5 py-2 text-xs font-bold text-pehra-text hover:bg-pehra-panel transition-colors shadow-none"
            >
              <Plane className="h-3.5 w-3.5" />
              <span>Drone Fleet Recon</span>
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="flex items-center gap-1.5 rounded-none bg-pehra-panel px-3.5 py-2 text-xs font-semibold text-white hover:bg-pehra-panel shadow-none transition-colors"
            >
              <span>Command GIS Map</span>
            </button>
          </div>
        </div>

        {/* Apex Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-pehra-border-subtle text-xs">
          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="text-pehra-text font-medium">Disaster Response Fund</div>
            <div className="mt-1 text-xl font-bold font-mono text-pehra-text">₹{sdrfAllocatedCr} Cr</div>
            <div className="text-pehra-text text-pehra-text">Authorized Liquidity</div>
          </div>

          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="text-pehra-text font-medium">Tri-Services Liaison</div>
            <div className="mt-1 text-sm font-bold font-mono text-pehra-text">ARMED FORCES READY</div>
            <div className="text-pehra-text text-pehra-text">Navy, Army, Coast Guard</div>
          </div>

          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="text-pehra-text font-medium">Statutory Proclamations</div>
            <div className="mt-1 text-xl font-bold font-mono text-pehra-text">2 In Effect</div>
            <div className="text-pehra-text text-pehra-text">Sec 144 & Rail Power Isolation</div>
          </div>

          <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-3">
            <div className="text-pehra-text font-medium">Executive Override</div>
            <div className="mt-1 text-sm font-bold font-mono text-pehra-text">
              {masterOverrideActive ? 'ENGAGED' : 'STANDBY (NORMAL)'}
            </div>
            <div className="text-pehra-text text-pehra-text">Direct Municipal Control</div>
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
          <span className="text-pehra-text font-mono text-pehra-text">GAZETTED</span>
        </div>
      )}

      {/* Grid of Apex Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SDRF Fund Disbursement */}
        <div className="rounded-none border border-pehra-border-subtle bg-white p-5 space-y-4 shadow-none">
          <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-pehra-text" />
              <h3 className="font-bold text-pehra-text text-sm">Disaster Relief Allocations (SDRF)</h3>
            </div>
            <span className="font-mono text-xs font-bold text-pehra-text bg-pehra-panel border border-pehra-border-subtle px-2.5 py-0.5 rounded-none">
              ₹{sdrfAllocatedCr} Cr Live
            </span>
          </div>

          <p className="text-xs text-pehra-text leading-relaxed">
            Emergency cash disbursements directly to MCGM Ward officers for relief camp rations, medical supplies, and temporary shelter rehabilitation.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel flex justify-between">
              <span className="text-pehra-text">Tranche 1: Community Kitchens</span>
              <span className="font-mono font-semibold text-pehra-text">₹45 Crores Disbursed</span>
            </div>
            <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel flex justify-between">
              <span className="text-pehra-text">Tranche 2: Dewatering Fuel & Fleet</span>
              <span className="font-mono font-semibold text-pehra-text">₹35 Crores Disbursed</span>
            </div>
            <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel flex justify-between">
              <span className="text-pehra-text">Tranche 3: Ex-Gratia Contingency</span>
              <span className="font-mono font-semibold text-pehra-text">₹70 Crores Committed</span>
            </div>
          </div>

          <button
            onClick={handleAllocateSdrf}
            className="w-full py-2.5 rounded-none bg-pehra-panel hover:bg-pehra-panel text-white font-semibold text-xs shadow-none transition-colors flex items-center justify-center gap-1.5"
          >
            <DollarSign className="h-4 w-4" />
            <span>Authorize +₹50 Cr Supplementary Relief Tranche</span>
          </button>
        </div>

        {/* Armed Forces & Naval Airlift Sorties */}
        <div className="rounded-none border border-pehra-border-subtle bg-white p-5 space-y-4 shadow-none">
          <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-pehra-text" />
              <h3 className="font-bold text-pehra-text text-sm">Tri-Services Joint Mobilization</h3>
            </div>
            <span className="font-mono text-xs font-bold text-pehra-text bg-pehra-panel border border-pehra-border-subtle px-2.5 py-0.5 rounded-none">
              DEFENCE REQ
            </span>
          </div>

          <p className="text-xs text-pehra-text leading-relaxed">
            Direct statutory requisitioning of Western Naval Command (Chetak / Seaking helicopter airlifts) and Army Engineering Task Force for rapid pontoon bridges.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-pehra-text">Indian Navy Helo Sorties</span>
                <span className="font-mono text-pehra-text">{armedForcesStatus.navySorties}</span>
              </div>
              <p className="text-pehra-text text-pehra-text">Air-dropping food packets and infant milk to isolated terrace clusters.</p>
            </div>

            <div className="p-2.5 rounded-none border border-pehra-border-subtle bg-pehra-panel space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-pehra-text">Coast Guard Hovercraft</span>
                <span className="font-mono text-pehra-text">{armedForcesStatus.coastGuardHovercraft}</span>
              </div>
              <p className="text-pehra-text text-pehra-text">Shallow draft patrols navigating tidal mangroves along Mahim bay.</p>
            </div>
          </div>

          <button
            onClick={handleToggleNavySortie}
            className="w-full py-2.5 rounded-none bg-pehra-panel hover:bg-pehra-panel text-white font-semibold text-xs shadow-none transition-colors flex items-center justify-center gap-1.5"
          >
            <Plane className="h-4 w-4" />
            <span>Toggle Naval Reconnaissance & Airlift</span>
          </button>
        </div>

        {/* Master State Executive Override */}
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-4 flex flex-col justify-between shadow-none">
          <div>
            <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-pehra-text" />
                <h3 className="font-bold text-pehra-text text-sm">State Cabinet Master Override</h3>
              </div>
              <span className="font-mono text-pehra-text font-bold text-pehra-text bg-pehra-panel px-2 py-0.5 rounded-none border border-pehra-border-subtle">
                CHIEF SECRETARY ONLY
              </span>
            </div>

            <p className="text-xs text-pehra-text mt-3 leading-relaxed">
              Enables centralized State Command Center to directly bypass local ward clearances and command municipal water pumps, electricity grids, and traffic signal shutdowns.
            </p>

            <div className="mt-4 p-3 rounded-none border border-pehra-border-subtle bg-white text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-pehra-text font-medium">State Direct Control:</span>
                <span className={`font-mono font-bold ${masterOverrideActive ? 'text-pehra-text' : 'text-pehra-text'}`}>
                  {masterOverrideActive ? 'OVERRIDE ENGAGED' : 'NORMAL DISPERSED'}
                </span>
              </div>
              <div className="text-pehra-text text-pehra-text">
                Security token: <strong className="text-pehra-text font-mono">MAHA-DM-CHIEFSEC-001</strong>
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleOverride}
            className={`w-full py-3 rounded-none font-bold text-xs shadow-none transition-all flex items-center justify-center gap-2 ${
              masterOverrideActive
                ? 'bg-pehra-panel hover:bg-pehra-panel text-white'
                : 'bg-pehra-panel hover:bg-pehra-panel text-white'
            }`}
          >
            {masterOverrideActive ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            <span>
              {masterOverrideActive ? 'DISENGAGE MASTER OVERRIDE' : 'ENGAGE STATUTORY MASTER OVERRIDE'}
            </span>
          </button>
        </div>
      </div>

      {/* Statutory Proclamations List */}
      <div className="rounded-none border border-pehra-border-subtle bg-white p-5 space-y-4 shadow-none">
        <div className="flex items-center justify-between border-b border-pehra-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-pehra-text" />
            <h3 className="font-bold text-pehra-text text-sm">Official State Disaster Proclamations in Effect</h3>
          </div>
          <span className="text-xs text-pehra-text font-mono">DMA 2005 / GoM Gazette</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proclamations.map((proc) => (
            <div
              key={proc.id}
              className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-4 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-pehra-text">{proc.title}</h4>
                <span
                  className={`px-2 py-0.5 rounded-none text-pehra-text font-mono font-bold border ${
                    proc.status === 'ACTIVE'
                      ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                      : 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                  }`}
                >
                  {proc.status}
                </span>
              </div>

              <p className="text-pehra-text text-pehra-text">Jurisdiction / Affected Sectors: {proc.sectors}</p>
              <div className="text-pehra-text font-mono text-pehra-text">Issued: {proc.issuedAt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
