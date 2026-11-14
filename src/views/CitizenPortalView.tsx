import React, { useState } from 'react';
import { AlertTriangle, LifeBuoy, MapPin, PhoneCall, Send, ShieldCheck } from 'lucide-react';
import { Village, Shelter, Alert, FloodReport } from '../types/index.ts';
import { SurvivalChecklist } from '../components/SurvivalChecklist.tsx';
import {
  Button,
  DataBadge,
  FormField,
  ListRow,
  Panel,
  PanelHeader,
  SeverityBadge,
  StatValue,
} from '../components/ui/index.tsx';

interface CitizenPortalViewProps {
  villages: Village[];
  shelters: Shelter[];
  alerts: Alert[];
  reports: FloodReport[];
  onNavigate: (tab: string) => void;
  onSubmitReport: (reportData: any) => Promise<void>;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  villages,
  shelters,
  alerts,
  onNavigate,
  onSubmitReport,
}) => {
  const [selectedWardId, setSelectedWardId] = useState('mumbai-kurla-w');
  const [reportDepth, setReportDepth] = useState('KNEE');
  const [reportDescription, setReportDescription] = useState('');
  const [reportAddress, setReportAddress] = useState('Near Bhabha Hospital, Kurla West');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const selectedVillage = villages.find((village) => village.id === selectedWardId) || villages[0];
  const wardAlerts = alerts.filter((alert) => alert.villageId === selectedWardId && alert.status === 'ACTIVE');
  const nearestShelter = shelters.find((shelter) => shelter.status === 'OPEN') || shelters[0];

  const handleQuickReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedVillage) return;
    setSubmittingReport(true);
    try {
      await onSubmitReport({
        reporterName: 'Aarav Sharma (Resident)',
        reporterPhone: '+91 98920 44556',
        location: { lat: selectedVillage.center.lat, lng: selectedVillage.center.lng, address: reportAddress, villageId: selectedVillage.id },
        waterDepthM: reportDepth === 'ANKLE' ? 0.3 : reportDepth === 'KNEE' ? 0.6 : reportDepth === 'WAIST' ? 1.2 : 2,
        depthCategory: reportDepth,
        description: reportDescription || 'Water accumulating rapidly across roadway.',
      });
      setReportSuccess(true);
      setReportDescription('');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-4 text-pehra-text">
      <Panel>
        <PanelHeader
          title="Citizen safety portal"
          badge={<DataBadge source="seeded-store" asOf="last seeded update" />}
          actions={<span className="inline-flex items-center gap-1 text-xs text-pehra-text-2"><ShieldCheck className="h-3.5 w-3.5" /> Verified resident access</span>}
        />
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Flood safety for Mumbai residents</h1>
            <p className="mt-1 max-w-2xl text-sm text-pehra-text-2">Plain-language alerts, safe routes and local reporting for your ward.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={() => onNavigate('map')}><MapPin className="h-3.5 w-3.5" /> Live map</Button>
            <Button variant="secondary" onClick={() => onNavigate('evacuation')}><LifeBuoy className="h-3.5 w-3.5" /> Safe shelters</Button>
            <Button variant="danger" onClick={() => setSosTriggered(true)}><PhoneCall className="h-3.5 w-3.5" /> SOS</Button>
          </div>
        </div>
      </Panel>

      <SurvivalChecklist />

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader title="Your ward" badge={<DataBadge source="seeded-store" />} />
          <div className="space-y-4 p-4">
            <FormField label="Select your locality">
              <select value={selectedWardId} onChange={(event) => setSelectedWardId(event.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm">
                {villages.map((village) => <option key={village.id} value={village.id}>{village.name} ({village.ward})</option>)}
              </select>
            </FormField>
            {selectedVillage && (
              <div className="grid gap-3 sm:grid-cols-3">
                <StatValue label="Current risk" value={selectedVillage.riskLevel} unit="level" asOf="seeded store" badge={<DataBadge source="seeded-store" />} />
                <StatValue label="Water level" value={selectedVillage.waterLevelM} unit="m" asOf="seeded store" badge={<DataBadge source="seeded-store" />} />
                <StatValue label="Active ward alerts" value={wardAlerts.length} unit="alerts" asOf="seeded store" badge={<DataBadge source="seeded-store" />} />
              </div>
            )}
            {wardAlerts.length > 0 && (
              <div className="space-y-2 border-t border-pehra-border-subtle pt-3">
                {wardAlerts.slice(0, 3).map((alert) => (
                      <ListRow key={alert.id} title={alert.title} description={`${alert.riskLevel} · ${alert.message}`} />
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Nearby shelter" badge={<DataBadge source="seeded-store" />} />
          <div className="space-y-3 p-4">
            {nearestShelter ? (
              <>
                  <ListRow title={nearestShelter.name} description={`${nearestShelter.status} · ${nearestShelter.location.address}`} />
                  <p className="text-xs text-pehra-text-2">{nearestShelter.capacity} capacity · {nearestShelter.occupancy} currently registered</p>
                <a className="inline-flex items-center gap-1 text-sm text-pehra-focus" href={`tel:${nearestShelter.contactPhone}`}><PhoneCall className="h-3.5 w-3.5" /> {nearestShelter.contactPerson}</a>
              </>
            ) : <p className="text-sm text-pehra-text-2">No shelter data provided.</p>}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Report local flooding" badge={<DataBadge source="seeded-store" />} />
        <form onSubmit={handleQuickReport} className="grid gap-3 p-4 sm:grid-cols-2">
          <FormField label="Location"><input value={reportAddress} onChange={(event) => setReportAddress(event.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm" /></FormField>
          <FormField label="Water depth"><select value={reportDepth} onChange={(event) => setReportDepth(event.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm"><option value="ANKLE">Ankle</option><option value="KNEE">Knee</option><option value="WAIST">Waist</option><option value="CHEST">Chest</option></select></FormField>
          <FormField label="Description"><textarea value={reportDescription} onChange={(event) => setReportDescription(event.target.value)} rows={2} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm sm:col-span-2" /></FormField>
          <div className="flex items-center justify-between sm:col-span-2">
            <span className="text-xs text-pehra-text-2">{reportSuccess ? 'Report submitted.' : 'Share only what you can safely observe.'}</span>
            <Button type="submit" disabled={submittingReport}><Send className="h-3.5 w-3.5" /> {submittingReport ? 'Submitting…' : 'Submit report'}</Button>
          </div>
        </form>
      </Panel>

      {sosTriggered && (
        <Panel className="border-pehra-severity-critical">
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-pehra-severity-critical" /><span className="text-sm font-semibold">Call emergency services now: 112 or MCGM 1916.</span></div>
            <Button variant="secondary" onClick={() => setSosTriggered(false)}>Close</Button>
          </div>
        </Panel>
      )}
    </div>
  );
};
