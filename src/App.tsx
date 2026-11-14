/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Village,
  Incident,
  Alert,
  Shelter,
  Hospital,
  EvacuationRoute,
  FloodReport,
  DeviceTelemetry,
  DataSource,
  Observation,
  UserRole,
} from './types/index.ts';
import { api } from './api/client.ts';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { EmergencyBanner } from './components/EmergencyBanner.tsx';
import { PehraModernDashboard } from './views/PehraModernDashboard.tsx';
import { CitizenReportModal } from './components/CitizenReportModal.tsx';
import { MapView } from './views/MapView.tsx';
import { AlertsView } from './views/AlertsView.tsx';
import { IncidentsView } from './views/IncidentsView.tsx';
import { EvacuationView } from './views/EvacuationView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { SimulationView } from './views/SimulationView.tsx';
import { ReplayView } from './views/ReplayView.tsx';
import { AiIntelView } from './views/AiIntelView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { WaterLevelView } from './views/WaterLevelView.tsx';
import { CitizenPortalView } from './views/CitizenPortalView.tsx';
import { ResponderPortalView } from './views/ResponderPortalView.tsx';
import { AuthorityPortalView } from './views/AuthorityPortalView.tsx';
import { SuperAdminPortalView } from './views/SuperAdminPortalView.tsx';
import { RbacHubView } from './views/RbacHubView.tsx';
import { LoginView } from './views/LoginView.tsx';
import { SurvivalChecklist } from './components/SurvivalChecklist.tsx';
import { DroneReconView } from './views/DroneReconView.tsx';
import { ROLES_CONFIG } from './data/rolesData.ts';
import { Language } from './utils/i18n.ts';
import { UiPreviewView } from './views/UiPreviewView.tsx';
import { DataModeStrip } from './components/ui/index.tsx';

export default function App() {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('ui-preview')) {
    return <UiPreviewView />;
  }
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem('pehra_session_auth') === 'true'
  );
  const [activeRole, setActiveRole] = useState<UserRole>(
    () => (sessionStorage.getItem('pehra_session_role') as UserRole) || 'CITIZEN'
  );
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const savedRole = sessionStorage.getItem('pehra_session_role');
    if (savedRole === 'CITIZEN') return 'citizen-portal';
    if (savedRole === 'RESPONDER') return 'responder-portal';
    if (savedRole === 'AUTHORITY') return 'authority-portal';
    if (savedRole === 'SUPER_ADMIN') return 'super-admin-portal';
    return 'citizen-portal';
  });
  const [dangerWaterLevelsCount, setDangerWaterLevelsCount] = useState<number>(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Core domain state
  const [villages, setVillages] = useState<Village[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [routes, setRoutes] = useState<EvacuationRoute[]>([]);
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [devices, setDevices] = useState<DeviceTelemetry[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [health, setHealth] = useState<{
    openMeteo?: { lastSuccessAt: string | null; lastErrorAt: string | null; lastError: string | null };
    gemini?: { configured: boolean; lastSuccessAt: string | null; lastErrorAt: string | null };
  }>({});

  // Fetch initial domain telemetry from API
  const fetchData = useCallback(async () => {
    try {
      const [
        riskRes,
        incRes,
        altRes,
        shlRes,
        hspRes,
        rtRes,
        repRes,
        devRes,
        srcRes,
        rainRes,
        waterRes,
        healthRes,
      ] = await Promise.all([
        api.getRiskMapData(),
        api.getIncidents(),
        api.getAlerts(),
        api.getShelters(),
        api.getHospitals(),
        api.getRoutes(),
        api.getReports(),
        api.getDevices(),
        api.getSources(),
        api.getRainfall(),
        api.getWaterLevels(),
        api.getDetailedHealth(),
      ]);
      setHealth(healthRes?.components || {});

      if (riskRes?.villages) setVillages(riskRes.villages);
      if (incRes?.incidents) setIncidents(incRes.incidents);
      if (altRes?.alerts) setAlerts(altRes.alerts);
      if (shlRes?.shelters) setShelters(shlRes.shelters);
      if (hspRes?.hospitals) setHospitals(hspRes.hospitals);
      if (rtRes?.routes) setRoutes(rtRes.routes);
      if (repRes?.reports) setReports(repRes.reports);
      if (devRes?.devices) setDevices(devRes.devices);
      if (srcRes?.sources) setSources(srcRes.sources);

      const allObs: Observation[] = [
        ...(rainRes?.observations || []),
        ...(waterRes?.observations || []),
      ];
      setObservations(allObs);
      if (waterRes?.system?.stationsInDanger !== undefined) {
        setDangerWaterLevelsCount(waterRes.system.stationsInDanger);
      }
    } catch (err) {
      console.warn('Data sync offline or partial fallback active:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and periodic polling every 8s
  useEffect(() => {
    fetchData();
    const pollInterval = setInterval(fetchData, 8000);
    return () => clearInterval(pollInterval);
  }, [fetchData]);

  // Alert Actions
  const handleCreateAlert = async (alertData: any) => {
    await api.createAlert(alertData);
    await fetchData();
  };

  const handleApproveAlert = async (alertId: string, reason: string) => {
    await api.approveAlert(alertId, {
      authorUserId: 'usr-authority-01',
      authorRole: activeRole,
      reason,
    });
    await fetchData();
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await api.acknowledgeAlert(alertId, 'dev-local-user');
    await fetchData();
  };

  // Citizen Report Actions
  const handleSubmitReport = async (reportData: any) => {
    await api.submitReport(reportData);
    await fetchData();
  };

  const handleVerifyReport = async (reportId: string, verificationData: any) => {
    await api.verifyReport(reportId, verificationData);
    await fetchData();
  };

  const handleLoginSuccess = (role: UserRole, _userDetails: any) => {
    setActiveRole(role);
    setIsAuthenticated(true);
    sessionStorage.setItem('pehra_session_auth', 'true');
    sessionStorage.setItem('pehra_session_role', role);
    if (role === 'CITIZEN') {
      setCurrentTab('citizen-portal');
    } else if (role === 'RESPONDER') {
      setCurrentTab('responder-portal');
    } else if (role === 'AUTHORITY') {
      setCurrentTab('authority-portal');
    } else {
      setCurrentTab('super-admin-portal');
    }
  };

  const handleContinueAsGuest = () => {
    setActiveRole('CITIZEN');
    setIsAuthenticated(true);
    sessionStorage.setItem('pehra_session_auth', 'true');
    sessionStorage.setItem('pehra_session_role', 'CITIZEN');
    setCurrentTab('citizen-portal');
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('pehra_session_auth');
    sessionStorage.removeItem('pehra_session_role');
    setIsAuthenticated(false);
  };

  // Render Login Page if logged out
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-pehra-bg text-pehra-text flex flex-col font-sans">
      <a className="pehra-skip-link" href="#main-content">Skip to main content</a>
      {/* 1. TOP BAR (Section 7) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeAlertsCount={alerts.filter((a) => a.status === 'ACTIVE').length}
        dangerWaterLevelsCount={dangerWaterLevelsCount}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'mr' : 'en'))}
        onOpenLogin={handleSignOut}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />
      <DataModeStrip
        mumbaiAdapterAsOf={sources[0]?.lastSuccessfulFetch || 'as of last seeded update'}
        openMeteo={health.openMeteo}
        gemini={health.gemini}
      />
      <div className="sticky top-0 z-30 w-full border-b border-pehra-border-subtle bg-pehra-bg">
        <EmergencyBanner
          alerts={alerts}
          onViewAlert={(alt) => {
            const v = villages.find((item) => item.id === alt.villageId);
            if (v) setSelectedVillage(v);
            setCurrentTab('alerts');
          }}
          onAcknowledge={handleAcknowledgeAlert}
        />
      </div>

      {/* Application workspace */}
      <div className="flex-1 flex min-h-0 w-full gap-0 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activeRole={activeRole}
          activeAlertsCount={alerts.filter((a) => a.status === 'ACTIVE').length}
          dangerWaterLevelsCount={dangerWaterLevelsCount}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        <main id="main-content" className="pehra-workspace flex-1 min-w-0 overflow-y-auto bg-pehra-bg px-4 py-5 sm:px-6 lg:px-8 custom-scrollbar" tabIndex={-1}>
          <div className="max-w-[1480px] mx-auto w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#18B7A0] border-t-transparent" />
                <div className="text-sm text-[#6B7C83] font-medium">
                  Connecting to PEHRA Real-time Flood Telemetry...
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {/* MASTER MODERN DASHBOARD (Sections 8 to 30) */}
                  {(currentTab === 'dashboard' || currentTab === 'landing') && (
                    <PehraModernDashboard
                      villages={villages}
                      incidents={incidents}
                      alerts={alerts}
                      shelters={shelters}
                      hospitals={hospitals}
                      sources={sources}
                      reports={reports}
                      language={language}
                      onNavigate={setCurrentTab}
                      onOpenReportModal={() => setIsReportModalOpen(true)}
                      onSelectIncident={(_inc) => setCurrentTab('incidents')}
                      onSelectAlert={(_alt) => setCurrentTab('alerts')}
                    />
                  )}

                  {/* INTERACTIVE GIS MAP VIEW */}
                  {currentTab === 'map' && (
                    <MapView
                      villages={villages}
                      incidents={incidents}
                      alerts={alerts}
                      shelters={shelters}
                      hospitals={hospitals}
                      routes={routes}
                      reports={reports}
                      devices={devices}
                      observations={observations}
                      selectedVillage={selectedVillage}
                      onSelectVillage={setSelectedVillage}
                      onNavigate={setCurrentTab}
                    />
                  )}

                  {/* ALERTS & EARLY WARNINGS */}
                  {currentTab === 'alerts' && (
                    <AlertsView
                      alerts={alerts}
                      villages={villages}
                      shelters={shelters}
                      routes={routes}
                      activeRole={activeRole}
                      onCreateAlert={handleCreateAlert}
                      onApproveAlert={handleApproveAlert}
                      onAcknowledgeAlert={handleAcknowledgeAlert}
                      onNavigate={setCurrentTab}
                    />
                  )}

                  {currentTab === 'authority-portal' && (
                    <AuthorityPortalView
                      alerts={alerts}
                      villages={villages}
                      sources={sources}
                      onApproveAlert={handleApproveAlert}
                      onCreateAlert={handleCreateAlert}
                      onNavigate={setCurrentTab}
                    />
                  )}

                  {currentTab === 'ai-intel' && <AiIntelView />}

                  {currentTab === 'simulation' && <SimulationView />}

                  {currentTab === 'replay' && <ReplayView />}

                  {currentTab === 'admin' && <AdminView activeRole={activeRole} />}

                  {/* ACTIVE INCIDENTS */}
                  {currentTab === 'incidents' && (
                    <IncidentsView
                      incidents={incidents}
                      onNavigate={setCurrentTab}
                    />
                  )}

                  {/* SHELTERS & EVACUATION */}
                  {currentTab === 'evacuation' && (
                    <EvacuationView
                      routes={routes}
                      shelters={shelters}
                      hospitals={hospitals}
                      onNavigate={setCurrentTab}
                    />
                  )}

                  {/* REPORTS */}
                  {currentTab === 'reports' && (
                    <ReportsView
                      reports={reports}
                      activeRole={activeRole}
                      onSubmitReport={handleSubmitReport}
                      onVerifyReport={handleVerifyReport}
                    />
                  )}

                  {/* WATER LEVEL & RAINFALL ANALYTICS */}
                  {currentTab === 'water-levels' && (
                    <WaterLevelView
                      onNavigate={setCurrentTab}
                      onNavigateToMapWithStation={(lat, lng, _name) => {
                        const matchingVillage = villages.find(
                          (v) =>
                            Math.abs(v.center.lat - lat) < 0.03 &&
                            Math.abs(v.center.lng - lng) < 0.03
                        );
                        if (matchingVillage) {
                          setSelectedVillage(matchingVillage);
                        }
                        setCurrentTab('map');
                      }}
                    />
                  )}

                  {/* CITIZEN SURVIVAL PREPAREDNESS CHECKLIST */}
                  {currentTab === 'survival-checklist' && (
                    <SurvivalChecklist />
                  )}

                  {/* LIVE DRONE RECONNAISSANCE & FLOOD IMAGE RENDERING */}
                  {currentTab === 'drone-recon' && (
                    <DroneReconView onNavigate={setCurrentTab} />
                  )}

                  {/* CITIZEN PORTAL */}
                  {currentTab === 'citizen-portal' && (
                    <CitizenPortalView
                      villages={villages}
                      shelters={shelters}
                      alerts={alerts}
                      reports={reports}
                      onNavigate={setCurrentTab}
                      onSubmitReport={handleSubmitReport}
                    />
                  )}

                  {/* RESPONDER PORTAL */}
                  {currentTab === 'responder-portal' && (
                    <ResponderPortalView
                      incidents={incidents}
                      hospitals={hospitals}
                      routes={routes}
                      onNavigate={setCurrentTab}
                    />
                  )}

                  {/* SUPER ADMIN PORTAL */}
                  {currentTab === 'super-admin-portal' && (
                    <SuperAdminPortalView onNavigate={setCurrentTab} />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* 3. FLOATING ACTION BUTTON: ＋ Report Flooding (Section 31) */}
      <button
        onClick={() => setIsReportModalOpen(true)}
        id="fab-report-flood-btn"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#18B7A0] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#15a28e] hover:shadow-xl transition-all duration-200 active:scale-95"
        title="Crowdsourced Flood Reporting"
      >
        <Plus className="h-4 w-4 stroke-[3]" />
        <span>Report Flooding</span>
      </button>

      {/* 4. CROWDSOURCED CITIZEN REPORT MODAL (Section 32) */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleSubmitReport}
      />

      {/* 5. OPERATIONAL PERSISTENT FOOTER */}
      <footer className="border-t border-[#E2EAED] bg-white px-4 sm:px-6 py-3 text-xs text-[#6B7C83]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#17242A]">PEHRA</span>
            <span>•</span>
            <span className="text-[11px]">
              Predictive Early-warning for Hyperlocal Risk Assessment
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>
              MCGM Disaster Cell: <strong className="text-rose-600 font-semibold">1916</strong>
            </span>
            <span>
              Police: <strong className="text-[#17242A] font-semibold">112</strong>
            </span>
            <span>
              Ambulance: <strong className="text-[#17242A] font-semibold">108</strong>
            </span>
            <span>
              State Emergency Ops: <strong className="text-[#18B7A0] font-semibold">1070</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
