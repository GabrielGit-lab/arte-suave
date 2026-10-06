import React, { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CyberOrientalBackground from './components/CyberOrientalBackground';

// Lazy-loaded pages to make initial app load instantaneous
const Tutorials = lazy(() => import('./pages/Tutorials'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Students = lazy(() => import('./pages/Students'));
const Graduations = lazy(() => import('./pages/Graduations'));
const PhysicalMetrics = lazy(() => import('./pages/PhysicalMetrics'));
const Reports = lazy(() => import('./pages/Reports'));
const Tournaments = lazy(() => import('./pages/Tournaments'));
const LineageBJJ = lazy(() => import('./pages/LineageBJJ'));
const RulesCBJJ = lazy(() => import('./pages/RulesCBJJ'));

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center relative overflow-hidden">
        <CyberOrientalBackground />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin shadow-[0_0_20px_#f59e0b]" />
          <span className="text-sm font-semibold text-amber-300 tracking-wider">🥋 柔術 • Inicializando Dojo Digital...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      <CyberOrientalBackground />
      <Navbar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin shadow-[0_0_10px_#f59e0b]" />
              <span className="text-xs text-zinc-500 font-mono">Carregando tatame...</span>
            </div>
          }>
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'tutorials' && <Tutorials />}
            {activeTab === 'attendance' && <Attendance />}
            {activeTab === 'students' && <Students />}
            {activeTab === 'graduations' && <Graduations />}
            {activeTab === 'physical' && <PhysicalMetrics />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'tournaments' && <Tournaments />}
            {activeTab === 'lineage' && <LineageBJJ />}
            {activeTab === 'rules' && <RulesCBJJ />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
