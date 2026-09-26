import { useState } from 'react';
import {
  AlertTriangle,
  LifeBuoy,
  PhoneCall,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';
import DashboardView from '@/components/DashboardView';
import MissingPersonsView from '@/components/MissingPersonsView';
import ReliefCampsView from '@/components/ReliefCampsView';
import VolunteerPortalView from '@/components/VolunteerPortalView';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'missing', label: 'Missing & Reunification' },
  { id: 'camps', label: 'Relief Camps' },
  { id: 'volunteer', label: 'Donate & Volunteer' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-500 selection:text-white">
      {/* Emergency Notice Banner */}
      <div className="bg-red-600 text-white px-4 py-3 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md">
        <AlertTriangle className="w-5 h-5 animate-pulse shrink-0" />
        <span>
          CRISIS ALERT: August 2026 Bhote Koshi & Trishuli River Basin Flash Flood Emergency
          Response Portal
        </span>
      </div>

      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigate('dashboard')}
          >
            <div className="bg-red-100 p-2 rounded-xl text-red-600 font-bold shadow-inner">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-slate-900">
                BhoteKoshi Relief Hub
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">
                Rasuwa · Nuwakot · Dhading Coordination
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md: flex items-centre gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === item.id
                    ? 'bg-red-50 text-red-600 border border-red-200/50'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Hotline Quick Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full text-red-700 text-xs font-bold shadow-sm">
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            <span>Hotlines: 100 / 1149</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            {setMobileMenuOpen? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="block w-full text-left px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
        {activeTab === 'missing' && <MissingPersonsView />}
        {activeTab === 'camps' && <ReliefCampsView />}
        {activeTab === 'volunteer' && <VolunteerPortalView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-20 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <p className="text-sm font-semibold">
              Bhote Koshi Flood Crisis Response Portal · Designed & Developed by Aayusha Khatiwada
              (B.Sc. CSIT Student)
            </p>
          </div>
          <p className="text-xs text-slate-400">
            For immediate rescue emergencies, please call Nepal Police at 100 or the Armed Police Force
            at 1149.
          </p>
        </div>
      </footer>
    </div>
  );
}
