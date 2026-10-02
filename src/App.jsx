import React, { useState } from 'react';
import { LifeBuoy, MapPin, Menu, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import AdminView from './components/AdminView';
import Dashboard from './components/Dashboard';
import MissingReports from './components/MissingReports';
import ReliefCampView from './components/ReliefCampView';
import VolunteerOffers from './components/VolunteerOffers';
import { backendReady } from './lib/supabase';

const navItems = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'missing', label: 'Missing persons' },
  { id: 'camps', label: 'Relief camps' },
  { id: 'volunteer', label: 'Volunteer & support' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function navigate(tab) {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderActivePage() {
    if (activeTab === 'dashboard') return <Dashboard onNavigate={navigate} />;
    if (activeTab === 'missing') return <MissingReports />;
    if (activeTab === 'camps') return <ReliefCampView />;
    if (activeTab === 'volunteer') return <VolunteerOffers />;
    return <AdminView onReturnToOverview={() => navigate('dashboard')} />;
  }

  return (
    <div className="app-shell">
      <div className="emergency-banner">
        <MapPin size={16} aria-hidden="true" />
        <span>Independent community coordination · Bhote Koshi &amp; Trishuli river basin</span>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <button className="brand" type="button" onClick={() => navigate('dashboard')}>
            <span className="brand-mark"><LifeBuoy size={25} aria-hidden="true" /></span>
            <span className="brand-copy">
              <strong>BhoteKoshi Relief Hub</strong>
              <small>Rasuwa · Nuwakot · Dhading</small>
            </span>
          </button>

          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={activeTab === item.id ? 'nav-link active' : 'nav-link'}
                aria-current={activeTab === item.id ? 'page' : undefined}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            className="staff-nav-button"
            type="button"
            aria-current={activeTab === 'admin' ? 'page' : undefined}
            onClick={() => navigate('admin')}
          >
            <ShieldCheck size={16} aria-hidden="true" />
            Staff console
          </button>

          <button
            className="menu-toggle"
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={activeTab === item.id ? 'nav-link active' : 'nav-link'}
                aria-current={activeTab === item.id ? 'page' : undefined}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button className="nav-link mobile-staff-link" onClick={() => navigate('admin')}>
              Staff console
            </button>
          </nav>
        )}
      </header>

      <main className="main-content">{renderActivePage()}</main>

      <footer className="site-footer">
        <ShieldAlert size={18} aria-hidden="true" />
        <p>
          {backendReady
            ? 'Independent project · Not an official emergency service. Verify urgent information with local authorities.'
            : 'Independent project · Online submissions are disabled until secure setup and testing are complete.'}
        </p>
        <a href="tel:100">Nepal Police: 100</a>
        <a href="tel:1114">Armed Police Force: 1114</a>
        <button className="footer-admin-link" onClick={() => navigate('admin')}>
          Staff console
        </button>
      </footer>
    </div>
  );
}
