import React from 'react';
import { Activity, BellRing, Building2, CheckSquare, ChevronLeft, ChevronRight, ClipboardList, Cpu, Flame, History, Landmark, LifeBuoy, LineChart, MapPin, Plane, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import { UserRole } from '../types/index.ts';
import { Tooltip } from './ui/index.tsx';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  activeAlertsCount: number;
  dangerWaterLevelsCount?: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, activeRole, activeAlertsCount, dangerWaterLevelsCount, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const navItems = (() => {
    switch (activeRole) {
      case 'CITIZEN':
        return [
          { id: 'citizen-portal', label: 'Safety Overview', icon: ShieldCheck },
          { id: 'map', label: 'Live Flood Map', icon: MapPin },
          { id: 'survival-checklist', label: 'Survival Checklist', icon: CheckSquare },
          { id: 'reports', label: 'Report Flooding', icon: ClipboardList },
          { id: 'evacuation', label: 'Safe Shelters', icon: LifeBuoy },
          { id: 'alerts', label: 'Safety Warnings', icon: BellRing, badge: activeAlertsCount },
        ];
      case 'RESPONDER':
        return [
          { id: 'responder-portal', label: 'Rescue Command', icon: Flame },
          { id: 'map', label: 'Operations Map', icon: MapPin },
          { id: 'drone-recon', label: 'Drone Live Recon', icon: Plane },
          { id: 'incidents', label: 'Field Incidents', icon: Activity },
          { id: 'reports', label: 'Verify Reports', icon: ClipboardList },
          { id: 'evacuation', label: 'Hospital Beds', icon: Building2 },
        ];
      case 'AUTHORITY':
        return [
          { id: 'authority-portal', label: 'Authority Command', icon: ShieldCheck },
          { id: 'map', label: 'Operations Map', icon: MapPin },
          { id: 'alerts', label: 'Early Warnings', icon: BellRing, badge: activeAlertsCount },
          { id: 'water-levels', label: 'Hydrological Telemetry', icon: LineChart, badge: dangerWaterLevelsCount },
          { id: 'ai-intel', label: 'Grounded Intelligence', icon: Sparkles },
          { id: 'simulation', label: 'Simulation Lab', icon: Cpu },
          { id: 'replay', label: 'Incident Replay', icon: History },
          { id: 'evacuation', label: 'Shelters & Assets', icon: LifeBuoy },
        ];
      default:
        return [
          { id: 'super-admin-portal', label: 'Crisis War Room', icon: Landmark },
          { id: 'map', label: 'GIS Command Map', icon: MapPin },
          { id: 'drone-recon', label: 'Drone Fleet Recon', icon: Plane },
          { id: 'alerts', label: 'Early Warnings', icon: BellRing, badge: activeAlertsCount },
          { id: 'water-levels', label: 'Hydrological Telemetry', icon: LineChart, badge: dangerWaterLevelsCount },
          { id: 'evacuation', label: 'Shelters & Assets', icon: LifeBuoy },
          { id: 'ai-intel', label: 'Grounded Intelligence', icon: Sparkles },
          { id: 'simulation', label: 'Simulation Lab', icon: Cpu },
          { id: 'replay', label: 'Incident Replay', icon: History },
          { id: 'admin', label: 'System Administration', icon: Settings },
        ];
    }
  })();

  const roleLabel = activeRole === 'CITIZEN' ? 'Citizen' : activeRole === 'RESPONDER' ? 'Responder' : activeRole === 'AUTHORITY' ? 'Authority' : 'Super-admin';
  const content = (
    <nav aria-label={`${roleLabel} navigation`} className="flex min-h-0 flex-1 flex-col border-r border-pehra-border-subtle bg-pehra-panel" role="navigation">
      <div className="flex h-10 items-center justify-between border-b border-pehra-border-subtle px-2">
        <span className={`pehra-eyebrow ${isCollapsed ? 'sr-only' : ''}`}>{roleLabel}</span>
        <button type="button" onClick={() => setIsCollapsed(!isCollapsed)} className="shell-icon-button" aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const button = (
            <button type="button" id={`nav-btn-${id}`} onClick={() => { setCurrentTab(id); setIsMobileOpen(false); }} aria-label={label} aria-current={currentTab === id ? 'page' : undefined} className={`shell-nav-item ${currentTab === id ? 'shell-nav-item-active' : ''} ${isCollapsed ? 'justify-center px-2' : ''}`}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!isCollapsed && <span className="min-w-0 flex-1 truncate text-left">{label}</span>}
              {!isCollapsed && badge !== undefined && badge > 0 && <span className="min-w-4 bg-pehra-severity-critical px-1 text-center text-[10px] text-pehra-action-text">{badge}</span>}
            </button>
          );
          return isCollapsed ? <Tooltip key={id} label={label}>{button}</Tooltip> : <React.Fragment key={id}>{button}</React.Fragment>;
        })}
      </div>
    </nav>
  );

  return (
    <>
      <aside className={`hidden lg:flex ${isCollapsed ? 'w-14' : 'w-60'} shrink-0 transition-[width] duration-150`} aria-label={`${roleLabel} sidebar`}>{content}</aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-pehra-bg/80" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex w-60 max-w-[85%]">{content}</aside>
        </div>
      )}
    </>
  );
};
