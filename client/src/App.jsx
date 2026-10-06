import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tutorials from './pages/Tutorials';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Graduations from './pages/Graduations';
import PhysicalMetrics from './pages/PhysicalMetrics';
import Reports from './pages/Reports';
import RulesCBJJ from './pages/RulesCBJJ';
import Tournaments from './pages/Tournaments';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Carregando tatame...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'tutorials' && <Tutorials />}
          {activeTab === 'attendance' && <Attendance />}
          {activeTab === 'students' && <Students />}
          {activeTab === 'graduations' && <Graduations />}
          {activeTab === 'physical' && <PhysicalMetrics />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'tournaments' && <Tournaments />}
          {activeTab === 'rules' && <RulesCBJJ />}
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
