import React, { useState } from 'react';
import { FloodReport, UserRole } from '../types/index.ts';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Clock,
  MapPin,
  Send,
  XCircle,
  ThumbsUp,
  Image,
} from 'lucide-react';

interface ReportsViewProps {
  reports: FloodReport[];
  activeRole: UserRole;
  onSubmitReport: (data: any) => Promise<void>;
  onVerifyReport: (reportId: string, verificationData: any) => Promise<void>;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  activeRole,
  onSubmitReport,
  onVerifyReport,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(19.0688);
  const [lng, setLng] = useState(72.8705);
  const [depthCategory, setDepthCategory] = useState<'ANKLE' | 'KNEE' | 'WAIST' | 'OVERHEAD'>('KNEE');
  const [waterDepthM, setWaterDepthM] = useState(0.45);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isVerifier = ['RESPONDER', 'AUTHORITY', 'ADMIN', 'SUPER_ADMIN'].includes(activeRole);

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const handleDepthSelect = (cat: 'ANKLE' | 'KNEE' | 'WAIST' | 'OVERHEAD') => {
    setDepthCategory(cat);
    if (cat === 'ANKLE') setWaterDepthM(0.15);
    else if (cat === 'KNEE') setWaterDepthM(0.45);
    else if (cat === 'WAIST') setWaterDepthM(0.85);
    else if (cat === 'OVERHEAD') setWaterDepthM(1.4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitReport({
        location: {
          lat,
          lng,
          address: address || 'Kurla West, Bail Bazar Road',
        },
        waterDepthM,
        depthCategory,
        description: description || 'Water entering shops along the main junction.',
        reporterName: reporterName || 'Local Citizen',
        reporterPhone: reporterPhone || '+91 98200 11223',
        photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      });
      setDescription('');
      setAddress('');
      alert('Report submitted successfully! Thank you for aiding flood telemetry.');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pehra-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Citizen Waterlogging Reports & Verification</h1>
          <p className="text-xs text-pehra-text mt-1">
            Crowdsourced on-ground field observations weighted and triangulated into Model A/B early warning engines
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-none border border-pehra-border-subtle bg-pehra-panel p-1 text-xs">
          {['ALL', 'VERIFIED', 'UNDER_REVIEW', 'SUBMITTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded px-3 py-1 font-medium transition-all ${
                filterStatus === status ? 'bg-pehra-panel text-pehra-text font-bold' : 'text-pehra-text hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Report Form */}
        <div className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-pehra-border-subtle pb-3">
            <ClipboardList className="h-5 w-5 text-pehra-text" />
            <h2 className="text-base font-bold text-white">Report Local Flooding</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-pehra-text font-semibold mb-1">Select Water Depth:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ANKLE', label: 'Ankle (<0.2m)', icon: '🌊' },
                  { id: 'KNEE', label: 'Knee (0.2–0.5m)', icon: '⚠️' },
                  { id: 'WAIST', label: 'Waist (0.5–1.0m)', icon: '🚨' },
                  { id: 'OVERHEAD', label: 'Overhead (>1.0m)', icon: '🛑' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleDepthSelect(item.id as any)}
                    className={`rounded-none p-2 text-left border transition-all ${
                      depthCategory === item.id
                        ? 'bg-pehra-panel border-pehra-border-subtle text-pehra-text font-bold'
                        : 'bg-pehra-panel border-pehra-border-subtle text-pehra-text hover:text-white'
                    }`}
                  >
                    <div className="text-base mb-0.5">{item.icon}</div>
                    <div>{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-pehra-text font-semibold mb-1">Street Location / Landmark:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Gandhi Market, Kings Circle, Sion"
                className="w-full rounded-none border border-pehra-border-subtle bg-pehra-panel p-2 text-white focus:outline-none focus:border-pehra-border-subtle"
                required
              />
            </div>

            <div>
              <label className="block text-pehra-text font-semibold mb-1">Observation Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current road conditions, stranded vehicles, manhole overflows, or rising water rate..."
                rows={3}
                className="w-full rounded-none border border-pehra-border-subtle bg-pehra-panel p-2 text-white focus:outline-none focus:border-pehra-border-subtle"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-pehra-text font-semibold mb-1">Your Name:</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Citizen / Volunteer"
                  className="w-full rounded-none border border-pehra-border-subtle bg-pehra-panel p-2 text-white focus:outline-none focus:border-pehra-border-subtle"
                />
              </div>

              <div>
                <label className="block text-pehra-text font-semibold mb-1">Contact Phone:</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full rounded-none border border-pehra-border-subtle bg-pehra-panel p-2 text-white focus:outline-none focus:border-pehra-border-subtle"
                />
              </div>
            </div>

            {/* Photo upload attachment mockup */}
            <div className="rounded-none border border-dashed border-pehra-border-subtle bg-pehra-panel p-3 text-center cursor-pointer hover:border-pehra-border-subtle">
              <Upload className="mx-auto h-5 w-5 text-pehra-text mb-1" />
              <span className="text-pehra-text text-pehra-text block">Tap or drop photo of flood depth</span>
              <span className="text-pehra-text text-pehra-text">(Geo-tagged EXIF will auto-validate location)</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-none bg-pehra-panel py-2.5 font-bold text-pehra-text hover:bg-pehra-panel shadow-none transition-all"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Transmitting...' : 'Submit Field Report'}</span>
            </button>
          </form>
        </div>

        {/* Live Verified Field Reports Feed */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pehra-text">
              Live Field Reports Stream ({filteredReports.length})
            </span>
            <span className="text-pehra-text text-pehra-text">
              Role Mode: <strong className="text-pehra-text">{activeRole}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {filteredReports.map((report) => {
              const isVerified = report.status === 'VERIFIED';
              const isRejected = report.status === 'REJECTED';

              return (
                <div key={report.id} className="rounded-none border border-pehra-border-subtle bg-pehra-panel p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-pehra-text font-bold ${
                            isVerified
                              ? 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle'
                              : isRejected
                              ? 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle'
                              : 'bg-pehra-panel text-pehra-text border border-pehra-border-subtle'
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="font-bold text-white text-sm">{report.location.address}</span>
                      </div>
                      <div className="text-pehra-text text-pehra-text mt-0.5 flex items-center gap-2">
                        <span>Reported by {report.reporterName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(report.timestamp).toLocaleTimeString()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-pehra-text text-pehra-text block">Water Depth</span>
                      <span className="text-base font-bold font-mono text-pehra-text">
                        {report.waterDepthM} m ({report.depthCategory})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-pehra-text leading-relaxed bg-pehra-panel p-2.5 rounded-none border border-pehra-border-subtle">
                    "{report.description}"
                  </p>

                  {/* Verification Actions for Responders / Authority */}
                  {isVerifier && report.status !== 'VERIFIED' && (
                    <div className="flex items-center justify-between border-t border-pehra-border-subtle pt-2.5 text-xs">
                      <span className="text-pehra-text text-pehra-text">Officer Verification Protocol:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onVerifyReport(report.id, {
                              status: 'REJECTED',
                              notes: 'Discarded as duplicate / false alarm.',
                            })
                          }
                          className="flex items-center gap-1 rounded bg-pehra-panel px-2.5 py-1 text-pehra-text hover:bg-pehra-panel"
                        >
                          <XCircle className="h-3.5 w-3.5 text-pehra-text" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() =>
                            onVerifyReport(report.id, {
                              status: 'VERIFIED',
                              verifiedBy: 'Officer In-charge',
                              notes: 'Verified via CCTV stream and patrolling vehicle.',
                              triangulatedDepthM: report.waterDepthM,
                            })
                          }
                          className="flex items-center gap-1 rounded bg-pehra-panel px-3 py-1 font-bold text-white hover:bg-pehra-panel shadow-none"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Verify & Inject into Model</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
