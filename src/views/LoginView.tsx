import React, { useState } from 'react';
import { ArrowRight, Check, Flame, Landmark, Shield, Users } from 'lucide-react';
import { UserRole } from '../types/index.ts';
import { ROLES_CONFIG } from '../data/rolesData.ts';
import { PehraLogo } from '../components/PehraLogo.tsx';
import { Button, DataBadge, FormField, Panel, PanelHeader } from '../components/ui/index.tsx';

type Portal = 'CITIZEN' | 'RESPONDER' | 'AUTHORITY' | 'SUPER_ADMIN';

const portalMeta: Record<Portal, { label: string; description: string; icon: typeof Users }> = {
  CITIZEN: { label: 'Citizen Portal', description: 'Local flood alerts, safe shelters and preparedness guidance.', icon: Users },
  RESPONDER: { label: 'Rescuer Portal', description: 'Tactical dispatches, field reports and live response coordination.', icon: Flame },
  AUTHORITY: { label: 'Authority Portal', description: 'Official warnings, operations, intelligence and simulations.', icon: Landmark },
  SUPER_ADMIN: { label: 'Super Admin Portal', description: 'State crisis command, approvals and system oversight.', icon: Shield },
};

interface LoginViewProps {
  onLoginSuccess: (role: UserRole, userDetails: any) => void;
  onContinueAsGuest: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [activePortal, setActivePortal] = useState<Portal>('CITIZEN');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [citizenPhone, setCitizenPhone] = useState('+91 98920 44556');
  const [citizenOtp, setCitizenOtp] = useState('8492');
  const [citizenWard, setCitizenWard] = useState('Kurla West (L Ward)');
  const [authorityId, setAuthorityId] = useState('authority@mcgm.gov.in');
  const [authorityKey, setAuthorityKey] = useState('MCGM-CRISIS-01');
  const [authorityJurisdiction, setAuthorityJurisdiction] = useState('Mumbai Municipal Flood Control');
  const [adminEmail, setAdminEmail] = useState('sec.relief@maharashtra.gov.in');
  const [adminKey, setAdminKey] = useState('MAHA-CRISIS-SEC-01');
  const [adminJurisdiction, setAdminJurisdiction] = useState('Maharashtra State Crisis War Room (Mantralaya)');
  const [rescuerBadge, setRescuerBadge] = useState('NDRF-05-8842');
  const [rescuerPasscode, setRescuerPasscode] = useState('VHF-TAC-99');
  const currentRoleConfig = ROLES_CONFIG[activePortal];

  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsAuthenticating(true);
    window.setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess(activePortal as UserRole, currentRoleConfig.demoUser);
    }, 500);
  };

  const meta = portalMeta[activePortal];
  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-pehra-bg text-pehra-text">
      <header className="flex min-h-12 items-center justify-between border-b border-pehra-border-subtle bg-pehra-panel px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <PehraLogo size={30} showText />
          <span className="hidden text-xs text-pehra-text-muted sm:inline">Mumbai flood intelligence network</span>
        </div>
        <Button variant="secondary" onClick={onContinueAsGuest}>
          Public resident access <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-8">
        <div className="space-y-1">
          <p className="pehra-eyebrow">Multi-portal emergency access</p>
          <h1 className="text-2xl font-semibold text-pehra-text">Select your access portal</h1>
          <p className="max-w-2xl text-sm text-pehra-text-2">Choose the operational station that matches your role.</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(portalMeta) as Portal[]).map((portal) => {
            const option = portalMeta[portal];
            const OptionIcon = option.icon;
            const selected = activePortal === portal;
            return (
              <button
                key={portal}
                type="button"
                id={portal === 'RESPONDER' ? 'choose-rescuer-portal-btn' : portal === 'SUPER_ADMIN' ? 'choose-superadmin-portal-btn' : `choose-${portal.toLowerCase()}-portal-btn`}
                onClick={() => setActivePortal(portal)}
                className={`flex min-h-24 items-start gap-3 border p-4 text-left transition-colors ${selected ? 'border-pehra-focus bg-pehra-raised' : 'border-pehra-border-subtle bg-pehra-panel hover:bg-pehra-raised'}`}
                aria-pressed={selected}
              >
                <OptionIcon className="mt-0.5 h-5 w-5 shrink-0 text-pehra-text-2" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-pehra-text">{option.label}</span>
                  <span className="mt-1 block text-xs text-pehra-text-2">{option.description}</span>
                </span>
                {selected && <Check className="h-4 w-4 shrink-0 text-pehra-focus" aria-label="Selected" />}
              </button>
            );
          })}
        </div>

        <Panel>
          <PanelHeader title={meta.label} badge={<DataBadge source="seeded-store" asOf="demo credentials" />} />
          <form onSubmit={handleLoginSubmit} className="grid gap-4 p-4 sm:grid-cols-2">
            {activePortal === 'CITIZEN' && (
              <>
                <FormField label="Mobile / WhatsApp number"><input value={citizenPhone} onChange={(e) => setCitizenPhone(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm" /></FormField>
                <FormField label="4-digit verification OTP" hint="Demo OTP: 8492"><input value={citizenOtp} onChange={(e) => setCitizenOtp(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm" /></FormField>
                <FormField label="Residential locality / ward"><input value={citizenWard} onChange={(e) => setCitizenWard(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm sm:col-span-2" /></FormField>
              </>
            )}
            {activePortal === 'RESPONDER' && (
              <>
                <FormField label="Responder badge"><input value={rescuerBadge} onChange={(e) => setRescuerBadge(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm" /></FormField>
                <FormField label="Tactical passcode"><input value={rescuerPasscode} onChange={(e) => setRescuerPasscode(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm" /></FormField>
              </>
            )}
            {activePortal === 'AUTHORITY' && (
              <>
                <FormField label="Authority ID"><input value={authorityId} onChange={(e) => setAuthorityId(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm" /></FormField>
                <FormField label="Municipal crisis passcode"><input value={authorityKey} onChange={(e) => setAuthorityKey(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm" /></FormField>
                <FormField label="Command jurisdiction"><input value={authorityJurisdiction} onChange={(e) => setAuthorityJurisdiction(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm sm:col-span-2" /></FormField>
              </>
            )}
            {activePortal === 'SUPER_ADMIN' && (
              <>
                <FormField label="Executive email"><input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm" /></FormField>
                <FormField label="Crisis protocol key"><input value={adminKey} onChange={(e) => setAdminKey(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm" /></FormField>
                <FormField label="Command jurisdiction"><input value={adminJurisdiction} onChange={(e) => setAdminJurisdiction(e.target.value)} className="w-full border border-pehra-border-control bg-pehra-raised px-3 py-2 text-sm sm:col-span-2" /></FormField>
              </>
            )}
            <div className="flex items-center justify-between gap-3 sm:col-span-2">
              <span className="text-xs text-pehra-text-muted">Demo access uses the seeded store.</span>
              <Button type="submit" disabled={isAuthenticating}>{isAuthenticating ? 'Connecting…' : `Sign in to ${meta.label.replace(' Portal', '')}`}</Button>
            </div>
          </form>
        </Panel>
      </main>
    </div>
  );
};
