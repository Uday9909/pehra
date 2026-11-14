import React, { useState } from 'react';
import { AlertTriangle, Bell, Search } from 'lucide-react';
import {
  AlertBanner,
  AlertRow,
  Button,
  DataBadge,
  DataTable,
  Dialog,
  EmptyState,
  ErrorState,
  FormField,
  IconButton,
  ListRow,
  LoadingState,
  Panel,
  PanelHeader,
  SegmentedControl,
  SeverityBadge,
  StatValue,
  Tabs,
  Tooltip,
} from '../components/ui/index.tsx';
import { Alert } from '../types/index.ts';

const sampleAlert = {
  id: 'preview-alert',
  stage: 'WARNING',
  status: 'ACTIVE',
  title: 'Water level rising at Mithi River Bridge',
  message: 'Move away from low-lying roads and follow official evacuation instructions.',
  riskLevel: 'HIGH',
  confidence: 0.84,
  villageId: 'mumbai-kurla-w',
  villageName: 'Kurla West',
  deliveryStats: { acknowledgedCount: 0 },
} as Alert;

export function UiPreviewView() {
  const [theme, setTheme] = useState<'operator' | 'citizen'>('operator');
  const [segment, setSegment] = useState('Now');
  const [tab, setTab] = useState('Overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const tableRows = [
    { area: 'कुर्ला पश्चिम', level: '1.85 m', status: 'Watch' },
    { area: 'मिठी नदी', level: '2.10 m', status: 'Warning' },
  ];

  return (
    <div data-theme={theme} className="min-h-screen bg-pehra-bg p-4 text-pehra-text sm:p-8">
      <a className="pehra-skip-link" href="#preview-main">Skip to preview</a>
      <main id="preview-main" className="mx-auto max-w-5xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="pehra-eyebrow">PEHRA design system preview</p>
            <h1 className="mt-1 text-2xl font-semibold">Shared components</h1>
          </div>
          <SegmentedControl options={['operator', 'citizen']} value={theme} onChange={(value) => setTheme(value as typeof theme)} />
        </header>

        <Panel>
          <PanelHeader title={theme === 'citizen' ? 'डेटा स्रोत' : 'Data provenance'} badge={<DataBadge source="seeded-store" asOf="14 Nov 2026, 16:00 IST" />} actions={<Tooltip label={theme === 'citizen' ? 'खोजें' : 'Search'}><IconButton label={theme === 'citizen' ? 'खोजें' : 'Search'}><Search className="h-4 w-4" /></IconButton></Tooltip>} />
          <div className="grid gap-3 p-3 sm:grid-cols-3">
            <DataBadge source="open-meteo" asOf="16:00 IST" />
            <DataBadge source="mumbai-flood-adapter" asOf="15:58 IST" />
            <DataBadge source="mumbai-flood-adapter" freshnessSeconds={901} staleAfterSeconds={900} asOf="15:40 IST" />
            <DataBadge source="gemini-fallback" asOf="15:55 IST" />
            <DataBadge source="gemini" asOf="15:55 IST" />
            <DataBadge source="authority" authorityConfirmed asOf="15:50 IST" />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Severity and telemetry" badge={<DataBadge source="open-meteo" asOf="16:00 IST" />} />
          <div className="grid gap-4 p-3 sm:grid-cols-2 lg:grid-cols-4">
            <SeverityBadge severity="NORMAL" />
            <SeverityBadge severity="ADVISORY" />
            <SeverityBadge severity="WATCH" />
            <SeverityBadge severity="WARNING" />
            <SeverityBadge severity="CRITICAL" />
            <StatValue label="Water level" value="1.85" unit="m" asOf="15:58 IST" badge={<DataBadge source="mumbai-flood-adapter" />} />
          </div>
        </Panel>

        <AlertBanner alert={sampleAlert} />

        <Panel>
          <PanelHeader title="Alerts" badge={<DataBadge source="seeded-store" asOf="16:00 IST" />} actions={<Button variant="secondary">Acknowledge</Button>} />
          <AlertRow title="Rapid water rise" area="Kurla West" severity="WARNING" issuedAt="15:58 IST" action="Move to higher ground" badge={<DataBadge source="mumbai-flood-adapter" />} />
          <AlertRow title="Shelter capacity update" area="Kurla Municipal School" severity="ADVISORY" issuedAt="15:52 IST" action="Check safe route" badge={<DataBadge source="seeded-store" />} />
        </Panel>

        <Panel>
          <PanelHeader title={theme === 'citizen' ? 'नियंत्रण और स्थिति' : 'Controls and states'} />
          <div className="grid gap-4 p-3 lg:grid-cols-2">
            <div className="space-y-2">
              <Tabs labels={['Overview', 'Sources', 'Audit']} active={tab} onChange={setTab} />
              <SegmentedControl options={['Now', 'Next 6h', 'Next 24h']} value={segment} onChange={setSegment} />
              <div className="flex flex-wrap gap-2">
                <Button>Primary action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger"><AlertTriangle className="mr-1 inline h-4 w-4" />Dispatch</Button>
                <Button variant="ghost">Cancel</Button>
                <IconButton label={theme === 'citizen' ? 'सूचनाएं' : 'Notifications'}><Bell className="h-4 w-4" /></IconButton>
                <Button variant="secondary" onClick={() => setDialogOpen(true)}>{theme === 'citizen' ? 'संवाद खोलें' : 'Open dialog'}</Button>
              </div>
              <FormField label="Area" hint="Use a clear locality name.">
                <input className="min-h-8 w-full border border-pehra-border-control bg-pehra-raised px-2 text-sm text-pehra-text" placeholder="Kurla West" />
              </FormField>
            </div>
            <div className="space-y-2">
              <ListRow title="Nearest shelter" description="Kurla Municipal School · 420 beds available" />
              <EmptyState title="No new incidents" description="There are no unassigned incidents in this view." />
              <LoadingState label="Refreshing telemetry" />
              <ErrorState message="The source could not be reached. Showing the last known reading." />
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title={theme === 'citizen' ? 'पानी का स्तर' : 'Water levels'} />
          <DataTable
            caption={theme === 'citizen' ? 'क्षेत्र के पानी के स्तर' : 'Water levels by area'}
            columns={[
              { key: 'area', header: theme === 'citizen' ? 'क्षेत्र' : 'Area', render: (row) => row.area, sortValue: (row) => row.area },
              { key: 'level', header: theme === 'citizen' ? 'स्तर' : 'Level', render: (row) => row.level, sortValue: (row) => row.level },
              { key: 'status', header: theme === 'citizen' ? 'स्थिति' : 'Status', render: (row) => row.status, sortValue: (row) => row.status },
            ]}
            rows={tableRows}
          />
        </Panel>
      </main>
      <Dialog open={dialogOpen} title={theme === 'citizen' ? 'क्षेत्र चुनें' : 'Select area'} onClose={() => setDialogOpen(false)}>
        <p className="text-sm text-pehra-text-2">{theme === 'citizen' ? 'अपने क्षेत्र का नाम चुनें।' : 'Choose the locality to review.'}</p>
        <div className="mt-3 flex justify-end">
          <Button onClick={() => setDialogOpen(false)}>{theme === 'citizen' ? 'बंद करें' : 'Close'}</Button>
        </div>
      </Dialog>
    </div>
  );
}
