import React, { useEffect, useState } from 'react';
import { BellRing, Globe, LogOut, Menu, PhoneCall, Search } from 'lucide-react';
import { UserRole } from '../types/index.ts';
import { useBatteryStatus } from '../hooks/useBatteryStatus.ts';
import { BatteryAlertPill } from './BatteryAlertPill.tsx';
import { PehraLogo } from './PehraLogo.tsx';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';
import { ROLES_CONFIG } from '../data/rolesData.ts';
import { EMERGENCY_CONTACTS } from '../config/emergency.ts';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole?: (role: UserRole) => void;
  activeAlertsCount: number;
  dangerWaterLevelsCount?: number;
  language?: Language;
  onToggleLanguage?: () => void;
  onOpenLogin?: () => void;
  onOpenMobileSidebar?: () => void;
  onSearch?: (query: string) => void;
}

function InstrumentCell({ label, value, tone = 'text-pehra-text' }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="hidden h-full flex-col justify-center border-l border-pehra-border-subtle px-3 md:flex">
      <span className="text-[10px] leading-3 text-pehra-text-muted">{label}</span>
      <span className={`pehra-value text-xs font-semibold leading-4 ${tone}`}>{value}</span>
    </div>
  );
}

export const Header: React.FC<HeaderProps> = ({
  setCurrentTab,
  activeRole,
  activeAlertsCount,
  dangerWaterLevelsCount = 0,
  language = 'en',
  onToggleLanguage,
  onOpenLogin,
  onOpenMobileSidebar,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [istTime, setIstTime] = useState('');
  const batteryStatus = useBatteryStatus();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const role = ROLES_CONFIG[activeRole] || ROLES_CONFIG.CITIZEN;

  useEffect(() => {
    const update = () =>
      setIstTime(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()),
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const homeTab =
    activeRole === 'CITIZEN'
      ? 'citizen-portal'
      : activeRole === 'RESPONDER'
        ? 'responder-portal'
        : activeRole === 'AUTHORITY'
          ? 'authority-portal'
          : 'super-admin-portal';

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) onSearch?.(searchQuery.trim());
  };

  return (
    <header
      className="sticky top-0 z-40 flex h-11 items-center border-b border-pehra-border-control bg-pehra-panel px-2 text-pehra-text"
      role="banner"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onOpenMobileSidebar && (
          <button type="button" onClick={onOpenMobileSidebar} aria-label="Open navigation" className="shell-icon-button lg:hidden">
            <Menu className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setCurrentTab(homeTab)}
          aria-label={`${role.title} home`}
          className="flex shrink-0 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pehra-focus"
        >
          <PehraLogo size={24} showText={false} />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">PEHRA</span>
          <span className="hidden border-l border-pehra-border-subtle pl-2 text-xs text-pehra-text-2 xl:inline">
            {role.shortLabel}
          </span>
        </button>
        <form onSubmit={submitSearch} className="hidden min-w-0 max-w-xs flex-1 md:block">
          <label className="sr-only" htmlFor="header-search">{t.searchPlaceholder}</label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pehra-text-muted" />
            <input
              id="header-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search wards, alerts, stations"
              className="h-7 w-full border border-pehra-border-subtle bg-pehra-bg pl-8 pr-2 text-xs text-pehra-text placeholder:text-pehra-text-muted focus:border-pehra-focus focus-visible:outline-none"
            />
          </div>
        </form>
      </div>

      <div className="flex h-full shrink-0 items-center">
        <InstrumentCell label="IST" value={istTime} />
        <InstrumentCell
          label="Active alerts"
          value={activeAlertsCount}
          tone={activeAlertsCount > 0 ? 'text-pehra-severity-critical' : 'text-pehra-text-2'}
        />
        <InstrumentCell
          label="Stations in danger"
          value={dangerWaterLevelsCount}
          tone={dangerWaterLevelsCount > 0 ? 'text-pehra-severity-warning' : 'text-pehra-text-2'}
        />
        <div className="hidden h-full items-center gap-1.5 border-l border-pehra-border-subtle px-3 md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-pehra-data-live" aria-hidden="true" />
          <span className="text-[10px] text-pehra-text-2">Feed live</span>
        </div>
        <div className="ml-1 flex items-center gap-1">
          <BatteryAlertPill battery={batteryStatus} />
          {onToggleLanguage && (
            <button type="button" onClick={onToggleLanguage} className="shell-control-button" aria-label="Toggle English and Marathi">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
            </button>
          )}
          <details className="relative hidden md:block">
            <summary className="shell-control-button list-none cursor-pointer">
              <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Hotlines</span>
            </summary>
            <div className="absolute right-0 top-full z-50 mt-1 min-w-60 border border-pehra-border-control bg-pehra-panel p-2 shadow-lg">
              {EMERGENCY_CONTACTS.map((contact) => (
                <a
                  key={contact.number}
                  href={`tel:${contact.number}`}
                  className="flex items-center justify-between gap-3 px-2 py-1.5 text-xs text-pehra-text hover:bg-pehra-raised"
                  aria-label={`${contact.label} ${contact.number}`}
                >
                  <span>{contact.label}</span>
                  <strong className="pehra-value">{contact.number}</strong>
                </a>
              ))}
            </div>
          </details>
          <button
            type="button"
            onClick={() => setCurrentTab('alerts')}
            className="shell-icon-button relative"
            aria-label={`Active alerts: ${activeAlertsCount}`}
          >
            <BellRing className="h-4 w-4" aria-hidden="true" />
            {activeAlertsCount > 0 && (
              <span className="absolute -right-1 -top-1 h-4 min-w-4 bg-pehra-severity-critical px-0.5 text-center text-[10px] font-bold leading-4 text-white">
                {activeAlertsCount}
              </span>
            )}
          </button>
          {onOpenLogin && (
            <button type="button" onClick={onOpenLogin} className="shell-control-button" aria-label="Sign out">
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
