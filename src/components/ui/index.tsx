import React, { useEffect, useId, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  Radio,
  ShieldCheck,
  Sparkles,
  Triangle,
  X,
} from 'lucide-react';
import {
  DATA_TYPE_META,
  DataType,
  ProvenanceOptions,
  getDataType,
} from '../../lib/provenance.ts';
import { Alert as AlertModel, RiskLevel } from '../../types/index.ts';

const iconMap = {
  radio: Radio,
  triangle: Triangle,
  dashed: Info,
  clock: Clock3,
  shield: ShieldCheck,
  sparkles: Sparkles,
  alert: AlertCircle,
};

const severityMap: Record<RiskLevel | 'ADVISORY' | 'WATCH' | 'NORMAL' | 'WARNING', string> = {
  SAFE: 'normal',
  LOW: 'advisory',
  MODERATE: 'watch',
  HIGH: 'warning',
  CRITICAL: 'critical',
  NORMAL: 'normal',
  ADVISORY: 'advisory',
  WATCH: 'watch',
  WARNING: 'warning',
};

export type Severity = keyof typeof severityMap;

export function Panel({
  children,
  className = '',
  as: Component = 'section',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article';
}) {
  return <Component className={`pehra-panel ${className}`}>{children}</Component>;
}

export function PanelHeader({
  title,
  badge,
  actions,
}: {
  title: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex min-h-8 items-center justify-between gap-2 border-b border-pehra-border-subtle px-3 py-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="pehra-eyebrow truncate">{title}</h2>
        {badge}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  );
}

export function DataBadge({
  source,
  asOf,
  freshnessSeconds,
  staleAfterSeconds,
  authorityConfirmed,
  className = '',
}: ProvenanceOptions & { asOf?: string; className?: string }) {
  const type = getDataType({
    source,
    freshnessSeconds,
    staleAfterSeconds,
    authorityConfirmed,
  });
  const meta = DATA_TYPE_META[type];
  const Icon = iconMap[meta.icon];
  const tone =
    type === 'live'
      ? 'text-pehra-data-live'
      : type === 'simulated'
        ? 'text-pehra-data-simulated'
        : type === 'predicted'
          ? 'text-pehra-data-predicted'
          : type === 'cached'
            ? 'text-pehra-data-cached'
            : type === 'stale'
              ? 'text-pehra-data-stale'
              : type === 'confirmed'
                ? 'bg-pehra-data-confirmed text-pehra-data-confirmed-text'
                : 'text-pehra-data-ai';
  const pattern =
    type === 'simulated'
      ? 'border-dashed'
      : type === 'predicted'
        ? 'border-dashed'
        : type === 'stale' || type === 'unavailable'
          ? 'border-pehra-data-stale'
          : 'border-transparent';

  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[11px] leading-4 ${tone} ${pattern} ${className}`}
      title={asOf ? `${meta.label}; as of ${asOf}` : meta.label}
    >
      <Icon aria-hidden="true" className="h-3 w-3 shrink-0" strokeWidth={1.5} />
      <span>{meta.label}</span>
      {asOf && <span className="font-mono opacity-80">· {asOf}</span>}
    </span>
  );
}

export function DataModeStrip({
  mumbaiAdapterAsOf,
  openMeteo,
  gemini,
}: {
  mumbaiAdapterAsOf: string;
  openMeteo?: { lastSuccessAt: string | null; lastErrorAt: string | null; lastError: string | null; precipitationMm?: number | null; observedAt?: string | null };
  gemini?: { configured: boolean; lastSuccessAt: string | null; lastErrorAt: string | null };
}) {
  const ageSeconds = openMeteo?.lastSuccessAt
    ? Math.max(0, (Date.now() - Date.parse(openMeteo.lastSuccessAt)) / 1000)
    : undefined;
  const geminiLive = Boolean(
    gemini?.configured &&
      gemini.lastSuccessAt &&
      Date.now() - Date.parse(gemini.lastSuccessAt) <= 15 * 60 * 1000
  );
  return (
    <div className="flex min-h-7 flex-wrap items-center gap-2 border-b border-pehra-border-subtle bg-pehra-panel px-3 py-1 text-[11px] text-pehra-text-2" role="status" aria-label="Data mode">
      <span className="pehra-eyebrow">Data mode</span>
      <DataBadge source="open-meteo" freshnessSeconds={ageSeconds} staleAfterSeconds={15 * 60} />
      <DataBadge source="mumbai-flood-adapter" asOf={mumbaiAdapterAsOf} />
      <DataBadge source={geminiLive ? 'gemini' : 'gemini-fallback'} />
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const tone = severityMap[severity];
  return (
    <span className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[11px] font-medium text-pehra-severity-${tone} border-pehra-severity-${tone}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-current" />
      {severity}
    </span>
  );
}

export function AlertBanner({
  alert,
  children,
}: {
  alert: AlertModel;
  children?: React.ReactNode;
}) {
  const critical = alert.riskLevel === 'CRITICAL';
  return (
    <div
      role={critical ? 'alert' : 'status'}
      aria-live={critical ? 'assertive' : 'polite'}
      className={`border-l-4 border-pehra-severity-${severityMap[alert.riskLevel]} bg-pehra-panel px-3 py-2`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={alert.riskLevel} />
        <strong className="text-sm text-pehra-text">{alert.title}</strong>
        {children}
      </div>
      <p className="mt-1 text-sm text-pehra-text-2">{alert.message}</p>
    </div>
  );
}

export function AlertRow({
  title,
  area,
  severity,
  issuedAt,
  action,
  badge,
  validUntil = 'Not provided',
  source = 'Not provided',
  recommendedAction = 'Not provided',
}: {
  title: string;
  area: string;
  severity: Severity;
  issuedAt: string;
  action: string;
  badge?: React.ReactNode;
  validUntil?: string;
  source?: string;
  recommendedAction?: string;
}) {
  return (
    <article className="grid gap-2 border-b border-pehra-border-subtle px-3 py-2 md:grid-cols-[auto_1fr_auto] md:items-center">
      <SeverityBadge severity={severity} />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-pehra-text">{title}</div>
        <div className="text-xs text-pehra-text-2">{area} · Issued {issuedAt} · Valid until {validUntil}</div>
      </div>
      <div className="flex items-center gap-2 text-xs text-pehra-text-2">
        {badge}
        <span>Source: {source} · Action: {recommendedAction || action}</span>
      </div>
    </article>
  );
}

export function StatValue({
  label,
  value,
  unit,
  asOf,
  badge,
}: {
  label: string;
  value: string | number;
  unit: string;
  asOf: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="pehra-eyebrow">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="pehra-value text-xl text-pehra-text">{value}</span>
        <span className="text-xs text-pehra-text-2">{unit}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-pehra-text-muted">
        {badge}
        <span>As of {asOf}</span>
      </div>
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  id,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  id?: string;
}) {
  const styles = {
    primary: 'bg-pehra-action text-pehra-action-text border-pehra-border-control',
    secondary: 'bg-pehra-raised text-pehra-text border-pehra-border-control',
    danger: 'bg-pehra-severity-critical text-pehra-action-text border-pehra-severity-critical',
    ghost: 'bg-transparent text-pehra-text-2 border-transparent',
  };
  return (
    <button
      type={type}
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-8 border px-3 py-1.5 text-sm transition-colors duration-150 hover:bg-pehra-raised ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center border border-pehra-border-control bg-pehra-raised text-pehra-text hover:bg-pehra-panel"
    >
      {children}
    </button>
  );
}

export function ListRow({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center justify-between gap-3 border-b border-pehra-border-subtle px-3 py-2 text-left hover:bg-pehra-raised"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-pehra-text">{title}</span>
        <span className="block text-xs text-pehra-text-2">{description}</span>
      </span>
      <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-pehra-text-muted" />
    </button>
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex border border-pehra-border-control" role="group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
          className={`min-h-8 px-3 text-xs ${option === value ? 'bg-pehra-raised text-pehra-text' : 'text-pehra-text-2 hover:bg-pehra-panel'}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-dashed border-pehra-border-control px-4 py-6 text-center">
      <Info className="mx-auto h-5 w-5 text-pehra-text-muted" />
      <h3 className="mt-2 text-sm font-medium text-pehra-text">{title}</h3>
      <p className="mt-1 text-xs text-pehra-text-2">{description}</p>
    </div>
  );
}

export function LoadingState({ label = 'Loading data' }: { label?: string }) {
  return <div role="status" className="px-4 py-6 text-sm text-pehra-text-2">{label}…</div>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="border border-pehra-severity-critical px-4 py-3 text-sm text-pehra-severity-critical">
      <AlertTriangle className="mr-2 inline h-4 w-4" aria-hidden="true" />
      {message}
    </div>
  );
}

export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1 text-sm text-pehra-text">
      <span>{label}</span>
      {children}
      {hint && <span className="block text-xs text-pehra-text-2">{hint}</span>}
    </label>
  );
}

export function Tabs({ labels, active, onChange }: { labels: string[]; active: string; onChange: (label: string) => void }) {
  return (
    <div className="flex border-b border-pehra-border-subtle" role="tablist">
      {labels.map((label) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={label === active}
          onClick={() => onChange(label)}
          className={`border-b-2 px-3 py-2 text-sm ${label === active ? 'border-pehra-text text-pehra-text' : 'border-transparent text-pehra-text-2'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
};

export function DataTable<T>({
  caption,
  columns,
  rows,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to show in this view.',
}: {
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const sortedRows = [...rows].sort((a, b) => {
    if (!sort) return 0;
    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) return 0;
    const left = column.sortValue(a);
    const right = column.sortValue(b);
    const result = left < right ? -1 : left > right ? 1 : 0;
    return sort.direction === 'asc' ? result : -result;
  });

  const toggleSort = (key: string) => {
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  return (
    <div className="overflow-x-auto border border-pehra-border-subtle">
      <table
        tabIndex={0}
        className="min-w-full border-collapse text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pehra-focus"
      >
        <caption className="px-3 py-2 text-left text-xs text-pehra-text-2">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-pehra-panel text-xs text-pehra-text-2">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="border-b border-pehra-border-subtle px-3 py-2 font-medium">
                {column.sortValue ? (
                  <button
                    type="button"
                    className="min-h-8 text-left underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-pehra-focus"
                    onClick={() => toggleSort(column.key)}
                    aria-label={`Sort by ${column.header}`}
                  >
                    {column.header}
                    {sort?.key === column.key && (sort.direction === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => (
            <tr key={index} className="focus-within:bg-pehra-raised hover:bg-pehra-raised">
              {columns.map((column) => (
                <td key={column.key} className="border-b border-pehra-border-subtle px-3 py-2 text-pehra-text">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <EmptyState title={emptyTitle} description={emptyDescription} />}
    </div>
  );
}

export function Dialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ));
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pehra-bg/80 p-4" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg border border-pehra-border-control bg-pehra-panel p-4"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-base font-semibold text-pehra-text">{title}</h2>
          <IconButton label="Close" onClick={onClose}><X className="h-4 w-4" /></IconButton>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {React.cloneElement(children, {
        'aria-describedby': id,
        onFocus: (event: React.FocusEvent<HTMLElement>) => {
          setVisible(true);
          children.props.onFocus?.(event);
        },
        onBlur: (event: React.FocusEvent<HTMLElement>) => {
          setVisible(false);
          children.props.onBlur?.(event);
        },
      })}
      {visible && (
        <span id={id} role="tooltip" className="absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap border border-pehra-border-control bg-pehra-raised px-2 py-1 text-xs text-pehra-text">
          {label}
        </span>
      )}
    </span>
  );
}
