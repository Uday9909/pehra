import React, { useState, useRef, useEffect } from 'react';
import {
  BatteryWarning,
  BatteryLow,
  BatteryCharging,
  Battery,
  Zap,
  ShieldAlert,
  Moon,
  Info,
  X,
  Sliders,
} from 'lucide-react';
import { BatteryStatus } from '../hooks/useBatteryStatus.ts';

interface BatteryAlertPillProps {
  battery: BatteryStatus;
  className?: string;
}

export const BatteryAlertPill: React.FC<BatteryAlertPillProps> = ({
  battery,
  className = '',
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    level,
    isCharging,
    isLowBattery,
    isCritical,
    isSimulated,
    cycleSimulatedLevel,
    setSimulatedLevel,
  } = battery;

  // Reset dismissal if battery drops further into critical range (< 10%)
  useEffect(() => {
    if (isCritical) {
      setIsDismissed(false);
    }
  }, [isCritical]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    };

    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverOpen]);

  // Always display the battery percentage shower so user can see device battery level at all times
  const isCriticalLevel = level < 10;
  const isLowLevel = level < 15;

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      {/* Battery Percentage Shower Pill */}
      <button
        onClick={() => setPopoverOpen(!popoverOpen)}
        id="topbar-battery-percentage-shower"
        type="button"
        aria-expanded={popoverOpen}
        aria-label={`Battery status: ${level}% ${isCharging ? 'charging' : 'remaining'}`}
        className={`group flex items-center gap-1.5 rounded-none px-2.5 py-1 text-xs font-semibold whitespace-nowrap border transition-all duration-200 cursor-pointer shadow-none select-none ${
          isCriticalLevel
            ? 'bg-pehra-panel border-pehra-border-subtle text-pehra-text hover:bg-pehra-panel ring-2 ring-pehra-focus'
            : isLowLevel
            ? 'bg-pehra-panel border-pehra-border-subtle text-pehra-text hover:bg-pehra-panel ring-1 ring-pehra-focus'
            : isCharging
            ? 'bg-pehra-panel border-pehra-border-subtle/60 text-pehra-text hover:bg-pehra-panel'
            : 'bg-pehra-panel border-pehra-border-subtle text-pehra-text hover:bg-pehra-panel hover:border-pehra-border-subtle'
        }`}
        title={`Device battery: ${level}% (${isCharging ? 'Charging' : isLowLevel ? 'Low' : 'Healthy'}). Click for power settings & testing.`}
      >
        {/* Pulsating or steady indicator dot */}
        <span
          className={`h-1.5 w-1.5 rounded-none shrink-0 ${
            isCriticalLevel
              ? 'bg-pehra-panel '
              : isLowLevel
              ? 'bg-pehra-panel '
              : isCharging
              ? 'bg-pehra-panel '
              : level >= 50
              ? 'bg-pehra-panel'
              : 'bg-pehra-panel'
          }`}
        />

        {/* Battery Icon */}
        {isCharging ? (
          <BatteryCharging
            className={`h-3.5 w-3.5 shrink-0 ${
              isCriticalLevel ? 'text-pehra-text' : isLowLevel ? 'text-pehra-text' : 'text-pehra-text'
            }`}
          />
        ) : isCriticalLevel ? (
          <BatteryWarning className="h-3.5 w-3.5 shrink-0 text-pehra-text " />
        ) : isLowLevel ? (
          <BatteryLow className="h-3.5 w-3.5 shrink-0 text-pehra-text" />
        ) : (
          <Battery className="h-3.5 w-3.5 shrink-0 text-pehra-text" />
        )}

        {/* Percentage Display - "Battery Percentage Shower" */}
        <span className="font-mono font-bold tracking-tight text-xs">
          {level}%
        </span>

        {/* Status label: responsive */}
        {isCharging ? (
          <span className="hidden sm:inline text-pehra-text font-semibold text-pehra-text">
            ⚡ Charge
          </span>
        ) : isCriticalLevel ? (
          <span className="hidden sm:inline text-pehra-text font-bold text-pehra-text">
            Critical
          </span>
        ) : isLowLevel ? (
          <span className="hidden sm:inline text-pehra-text font-medium text-pehra-text">
            Low
          </span>
        ) : (
          <span className="hidden lg:inline text-pehra-text font-normal text-pehra-text">
            Battery
          </span>
        )}

        {isSimulated && (
          <span className="text-pehra-text font-mono uppercase bg-pehra-panel/10 text-pehra-text px-1 rounded">
            SIM
          </span>
        )}
      </button>

      {/* Contextual Battery Popover */}
      {popoverOpen && (
        <div
          id="battery-alert-popover"
          className="absolute right-0 top-full mt-2 w-80 rounded-none border border-pehra-border-subtle bg-white p-4 shadow-none z-50 animate-in fade-in zoom-in-95 duration-150 text-pehra-text"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-pehra-border-subtle pb-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-none border ${
                  isCriticalLevel
                    ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                    : isLowLevel
                    ? 'bg-pehra-panel text-pehra-text border-pehra-border-subtle'
                    : 'bg-pehra-panel text-pehra-text border-pehra-border-subtle/30'
                }`}
              >
                {isCharging ? (
                  <BatteryCharging className="h-4 w-4 text-pehra-text" />
                ) : isCriticalLevel ? (
                  <BatteryWarning className="h-4 w-4 text-pehra-text" />
                ) : (
                  <Battery className="h-4 w-4 text-pehra-text" />
                )}
              </span>
              <div>
                <div className="text-xs font-bold text-pehra-text flex items-center gap-1.5">
                  <span>Device Battery Shower</span>
                  <span className="text-pehra-text font-mono px-1.5 py-0.5 rounded-none bg-pehra-panel text-pehra-text font-semibold">
                    {level}%
                  </span>
                </div>
                <p className="text-pehra-text text-pehra-text">
                  {isCharging
                    ? 'Connected to power source'
                    : isCriticalLevel
                    ? 'Critical: immediate recharge needed'
                    : isLowLevel
                    ? 'Power saving active (<15%)'
                    : 'Field battery endurance healthy'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setPopoverOpen(false)}
              className="text-pehra-text hover:text-pehra-text p-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Battery Level Visual Meter */}
          <div className="mt-3 p-3 rounded-none border border-pehra-border-subtle bg-pehra-panel space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-pehra-text font-medium">Current Charge</span>
              <span
                className={`font-mono font-bold text-sm ${
                  isCriticalLevel
                    ? 'text-pehra-text'
                    : isLowLevel
                    ? 'text-pehra-text'
                    : 'text-pehra-text'
                }`}
              >
                {level}% Remaining
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-full h-2.5 rounded-none bg-pehra-panel overflow-hidden">
              <div
                className={`h-full rounded-none transition-all duration-300 ${
                  isCriticalLevel
                    ? 'bg-pehra-panel'
                    : isLowLevel
                    ? 'bg-pehra-panel'
                    : 'bg-pehra-panel from-pehra-panel to-pehra-panel'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, level))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-pehra-text text-pehra-text pt-0.5">
              <span>Est. Runtime: ~{Math.round((level / 100) * 6.5 * 10) / 10} hrs</span>
              <span className="font-semibold text-pehra-text">
                {isCharging ? '⚡ AC Charging' : 'Discharging'}
              </span>
            </div>
          </div>

          {/* Low Battery Tactical Recommendations for Flood Emergency */}
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="text-pehra-text font-bold uppercase tracking-wider text-pehra-text">
              Emergency Field Advisory
            </div>
            <ul className="space-y-1 text-pehra-text text-pehra-text leading-snug">
              <li className="flex items-start gap-1.5">
                <span className="text-pehra-text font-bold">•</span>
                <span>Critical flood maps & safe shelters remain cached offline.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-pehra-text font-bold">•</span>
                <span>Dim screen brightness to preserve field operational life.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-pehra-text font-bold">•</span>
                <span>Keep voice lines free for urgent municipal SOS dispatches (1916).</span>
              </li>
            </ul>
          </div>

          {/* Quick Simulation Presets */}
          <div className="mt-3 pt-2.5 border-t border-pehra-border-subtle">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-pehra-text font-bold text-pehra-text uppercase tracking-wider">
                Test Battery States:
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setSimulatedLevel(8)}
                className="px-1.5 py-1 text-pehra-text font-mono font-bold rounded bg-pehra-panel text-pehra-text border border-pehra-border-subtle hover:bg-pehra-panel text-center"
                title="Simulate 8% critical battery"
              >
                8% Crit
              </button>
              <button
                onClick={() => setSimulatedLevel(14)}
                className="px-1.5 py-1 text-pehra-text font-mono font-bold rounded bg-pehra-panel text-pehra-text border border-pehra-border-subtle hover:bg-pehra-panel text-center"
                title="Simulate 14% low battery"
              >
                14% Low
              </button>
              <button
                onClick={() => setSimulatedLevel(82)}
                className="px-1.5 py-1 text-pehra-text font-mono font-bold rounded bg-pehra-panel text-pehra-text border border-pehra-border-subtle/30 hover:bg-pehra-panel text-center"
                title="Simulate 82% normal battery"
              >
                82% OK
              </button>
              <button
                onClick={() => setSimulatedLevel(null)}
                className="px-1.5 py-1 text-pehra-text font-mono font-bold rounded bg-pehra-panel text-pehra-text border border-pehra-border-subtle hover:bg-pehra-panel text-center"
                title="Reset to live device battery"
              >
                Live API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
