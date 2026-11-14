import React from 'react';
import {
  Activity,
  BellRing,
  Building2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Cpu,
  Flame,
  History,
  Landmark,
  LifeBuoy,
  LineChart,
  MapPin,
  Plane,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Alert, UserRole, Village } from '../types/index.ts';
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
  villages?: Village[];
  alerts?: Alert[];
}

const RISK_DOT: Record<string, string> = {
  CRITICAL: 'bg-pehra-severity-critical',
  HIGH: 'bg-pehra-severity-warning',
  MODERATE: 'bg-pehra-severity-watch',
  LOW: 'bg-pehra-severity-advisory',
  SAFE: 'bg-pehra-severity-normal',
};

const RISK_RANK: Record<string, number> = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3, SAFE: 4 };

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  activeAlertsCount,
  dangerWaterLevelsCount,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  villages = [],
  alerts = [],
}) => {
  const groups = (() => {
    switch (activeRole) {
      case 'CITIZEN':
        return [
          {
            label: 'Safety',
            items: [
              { id: 'citizen-portal', label: 'Safety overview', icon: ShieldCheck },
              { id: 'map', label: 'Live flood map', icon: MapPin },
              { id: 'alerts', label: 'Safety warnings', icon: BellRing, badge: activeAlertsCount },
            ],
          },
          {
            label: 'Act',
            items: [
              { id: 'reports', label: 'Report flooding', icon: ClipboardList },
              { id: 'evacuation', label: 'Safe shelters', icon: LifeBuoy },
              { id: 'survival-checklist', label: 'Survival checklist', icon: CheckSquare },
            ],
          },
        ];
      case 'RESPONDER':
        return [
          {
            label: 'Response',
            items: [
              { id: 'dashboard', label: 'Situation overview', icon: Activity },
              { id: 'responder-portal', label: 'Rescue command', icon: Flame },
              { id: 'map', label: 'Operations map', icon: MapPin },
              { id: 'incidents', label: 'Field incidents', icon: Activity },
            ],
          },
          {
            label: 'Field',
            items: [
              { id: 'drone-recon', label: 'Drone live recon', icon: Plane },
              { id: 'reports', label: 'Verify reports', icon: ClipboardList },
              { id: 'evacuation', label: 'Hospital beds', icon: Building2 },
            ],
          },
        ];
      case 'AUTHORITY':
        return [
          {
            label: 'Command',
            items: [
              { id: 'dashboard', label: 'Situation overview', icon: Activity },
              { id: 'authority-portal', label: 'Authority command', icon: ShieldCheck },
              { id: 'map', label: 'Operations map', icon: MapPin },
              { id: 'alerts', label: 'Early warnings', icon: BellRing, badge: activeAlertsCount },
              { id: 'water-levels', label: 'Hydrological telemetry', icon: LineChart, badge: dangerWaterLevelsCount },
            ],
          },
          {
            label: 'Intelligence',
            items: [
              { id: 'ai-intel', label: 'Grounded intelligence', icon: Sparkles },
              { id: 'simulation', label: 'Simulation lab', icon: Cpu },
              { id: 'replay', label: 'Incident replay', icon: History },
            ],
          },
          { label: 'Assets', items: [{ id: 'evacuation', label: 'Shelters & assets', icon: LifeBuoy }] },
        ];
      default:
        return [
          {
            label: 'Command',
            items: [
              { id: 'dashboard', label: 'Situation overview', icon: Activity },
              { id: 'super-admin-portal', label: 'Crisis war room', icon: Landmark },
              { id: 'map', label: 'GIS command map', icon: MapPin },
              { id: 'drone-recon', label: 'Drone fleet recon', icon: Plane },
              { id: 'alerts', label: 'Early warnings', icon: BellRing, badge: activeAlertsCount },
              { id: 'water-levels', label: 'Hydrological telemetry', icon: LineChart, badge: dangerWaterLevelsCount },
            ],
          },
          {
            label: 'Intelligence',
            items: [
              { id: 'evacuation', label: 'Shelters & assets', icon: LifeBuoy },
              { id: 'ai-intel', label: 'Grounded intelligence', icon: Sparkles },
              { id: 'simulation', label: 'Simulation lab', icon: Cpu },
              { id: 'replay', label: 'Incident replay', icon: History },
            ],
          },
          { label: 'System', items: [{ id: 'admin', label: 'System administration', icon: Settings }] },
        ];
    }
  })();

  const roleLabel =
    activeRole === 'CITIZEN' ? 'Citizen' : activeRole === 'RESPONDER' ? 'Responder' : activeRole === 'AUTHORITY' ? 'Authority' : 'Super-admin';

  const wardStack = [...villages]
    .sort((left, right) => (RISK_RANK[left.riskLevel] ?? 9) - (RISK_RANK[right.riskLevel] ?? 9))
    .slice(0, 5);

  const alarmStack = [...alerts]
    .filter((alert) => alert.status === 'ACTIVE')
    .sort((left, right) => (RISK_RANK[left.riskLevel] ?? 9) - (RISK_RANK[right.riskLevel] ?? 9))
    .slice(0, 3);

  const open = (id: string) => {
    setCurrentTab(id);
    setIsMobileOpen(false);
  };

  const content = (
    <nav
      aria-label={`${roleLabel} navigation`}
      className="flex min-h-0 flex-1 flex-col border-r border-pehra-border-subtle bg-pehra-panel"
      role="navigation"
    >
      <div className="flex h-9 items-center justify-between border-b border-pehra-border-subtle px-2">
        <span className={`text-xs font-semibold text-pehra-text-2 ${isCollapsed ? 'sr-only' : ''}`}>{roleLabel}</span>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shell-icon-button"
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {groups.map((group) => (
          <div key={group.label} className="mb-3">
            {!isCollapsed && <div className="px-3 pb-1 text-[10px] font-semibold text-pehra-text-muted">{group.label}</div>}
            <div className="space-y-0.5 px-1.5">
              {group.items.map(({ id, label, icon: Icon, badge }) => {
                const isActive = currentTab === id;
                const button = (
                  <button
                    type="button"
                    id={`nav-btn-${id}`}
                    onClick={() => open(id)}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`shell-nav-item ${isActive ? 'shell-nav-item-active' : ''} ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {!isCollapsed && <span className="min-w-0 flex-1 truncate text-left">{label}</span>}
                    {!isCollapsed && badge !== undefined && badge > 0 && (
                      <span className="min-w-4 bg-pehra-severity-critical px-1 text-center text-[10px] font-bold text-white">{badge}</span>
                    )}
                  </button>
                );
                return isCollapsed ? (
                  <Tooltip key={id} label={label}>{button}</Tooltip>
                ) : (
                  <React.Fragment key={id}>{button}</React.Fragment>
                );
              })}
            </div>
          </div>
        ))}

        {!isCollapsed && alarmStack.length > 0 && (
          <div className="mt-2 border-t border-pehra-border-subtle px-1.5 pt-2">
            <div className="px-1.5 pb-1 text-[10px] font-semibold text-pehra-text-muted">Alarm stack</div>
            <div className="space-y-0.5">
              {alarmStack.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => open('alerts')}
                  className="flex w-full items-start gap-2 px-1.5 py-1.5 text-left text-[11px] leading-4 text-pehra-text-2 hover:bg-pehra-raised"
                >
                  <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${RISK_DOT[alert.riskLevel] || RISK_DOT.SAFE}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{alert.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isCollapsed && activeRole !== 'CITIZEN' && wardStack.length > 0 && (
          <div className="mt-2 border-t border-pehra-border-subtle px-1.5 pt-2">
            <div className="flex items-center justify-between px-1.5 pb-1">
              <span className="text-[10px] font-semibold text-pehra-text-muted">Ward status</span>
              <button type="button" onClick={() => open('map')} className="text-[10px] text-pehra-data-predicted hover:underline">
                Map
              </button>
            </div>
            <div className="space-y-0.5">
              {wardStack.map((village) => (
                <button
                  key={village.id}
                  type="button"
                  onClick={() => open('map')}
                  className="flex w-full items-center gap-2 px-1.5 py-1 text-left hover:bg-pehra-raised"
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${RISK_DOT[village.riskLevel] || RISK_DOT.SAFE}`} aria-hidden="true" />
                  <span className="pehra-value w-9 shrink-0 text-[10px] text-pehra-text-muted">{village.ward}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-pehra-text-2">{village.name}</span>
                  <span className="pehra-value text-[10px] text-pehra-text-2">{village.waterLevelM}m</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <>
      <aside className={`hidden lg:flex ${isCollapsed ? 'w-14' : 'w-56'} shrink-0 transition-[width] duration-150`} aria-label={`${roleLabel} sidebar`}>
        {content}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-pehra-bg/80" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex w-60 max-w-[85%]">{content}</aside>
        </div>
      )}
    </>
  );
};
