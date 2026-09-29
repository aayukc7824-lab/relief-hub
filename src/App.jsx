import React, { useState } from 'react';
import { ArrowRight, HeartHandshake, LifeBuoy, MapPin, Menu, ShieldAlert, Users, X } from 'lucide-react';
import AdminView from './components/AdminView';
import MissingReports from './components/MissingReports';
import ReliefCampView from './components/ReliefCampView';
import VolunteerOffers from './components/VolunteerOffers';
import { backendReady } from './lib/supabase';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'missing', label: 'Missing & Reunification' },
  { id: 'camps', label: 'Relief Camps' },
  { id: 'volunteer', label: 'Donate & Volunteer' },
];

function Dashboard({ onNavigate }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">COMMUNITY INFORMATION · NEPAL</p>
          <h2>Bhote Koshi flood recovery information</h2>
          <p className="hero-copy">
            Practical contact details and guidance for people in Rasuwa,
            Nuwakot, and Dhading. This student project is not an emergency
            service and cannot dispatch responders.
          </p>
          <div className="hero-actions">
            <button
              className="button button-alert"
              onClick={() => onNavigate('missing')}
            >
              <Users size={18} aria-hidden="true" />
              Missing-person reports
            </button>
            <button
              className="button button-outline"
              onClick={() => onNavigate('camps')}
            >
              Relief camp information
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
        <aside className="hero-emergency" aria-labelledby="emergency-heading">
          <p className="hero-emergency-label">URGENT HELP</p>
          <h3 id="emergency-heading">Call emergency services</h3>
          <a className="emergency-contact" href="tel:100">
            <span>Nepal Police</span>
            <strong>100</strong>
          </a>
          <a className="emergency-contact" href="tel:1114">
            <span>Armed Police Force</span>
            <strong>1114</strong>
          </a>
          <p className="hero-emergency-note">
            Calls go directly to the listed service. This website does not
            dispatch responders.
          </p>
        </aside>
      </section>

      <section className="region-summary" aria-label="Information coverage">
        <div className="region-summary-place">
          <MapPin size={19} aria-hidden="true" />
          <div>
            <span>Information for</span>
            <strong>Rasuwa, Nuwakot &amp; Dhading</strong>
          </div>
        </div>
        <p>
          {backendReady
            ? 'Reports stay private during review; shelter details appear only after administrator verification.'
            : 'Online reports are disabled until setup. Shelter availability is not verified here.'}
          {' '}Confirm arrangements with local authorities.
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">HOW WE CAN HELP</p>
            <h2>Find the right next step</h2>
          </div>
        </div>
        <div className="field-grid">
          <article className="field-card">
            <div className="field-card-top">
              <span className="field-icon"><Users size={19} aria-hidden="true" /></span>
              <span className="field-tag">Missing persons</span>
            </div>
            <h3>Someone is missing?</h3>
            <p>
              Call Nepal Police on 100. Share their name, description, and last
              known location directly with responders.
            </p>
            <button className="text-link" onClick={() => onNavigate('missing')}>
              Reunification advice <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
          <article className="field-card">
            <div className="field-card-top">
              <span className="field-icon"><MapPin size={19} aria-hidden="true" /></span>
              <span className="field-tag">Shelter information</span>
            </div>
            <h3>Need a place to stay?</h3>
            <p>
              Shelter locations and spaces can change. Check with local
              authorities before travelling.
            </p>
            <button className="text-link" onClick={() => onNavigate('camps')}>
              Check shelter information <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
          <article className="field-card">
            <div className="field-card-top">
              <span className="field-icon"><HeartHandshake size={19} aria-hidden="true" /></span>
              <span className="field-tag">Volunteering</span>
            </div>
            <h3>Would you like to help?</h3>
            <p>
              Contact a trusted local organization to check what help is
              needed. {backendReady
                ? 'Offers are reviewed privately; this site does not process payments.'
                : 'Online offers are disabled until setup; this site does not process payments.'}
            </p>
            <button className="text-link" onClick={() => onNavigate('volunteer')}>
              Read before volunteering <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function navigate(tab) {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-shell">
      <div className="emergency-banner">
        <MapPin size={16} aria-hidden="true" />
        <span>Bhote Koshi &amp; Trishuli River Basin · Community information</span>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigate('dashboard')}>
            <span className="brand-mark">
              <LifeBuoy size={25} aria-hidden="true" />
            </span>
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
            className="menu-toggle"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
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
        )}
      </header>

      <main className="main-content">
        {activeTab === 'dashboard' ? (
          <Dashboard onNavigate={navigate} />
        ) : activeTab === 'camps' ? (
          <ReliefCampView />
        ) : activeTab === 'missing' ? (
          <MissingReports />
        ) : activeTab === 'volunteer' ? (
          <VolunteerOffers />
        ) : (
          <AdminView />
        )}
      </main>

      <footer className="site-footer">
        <ShieldAlert size={18} aria-hidden="true" />
        <p>
          {backendReady
            ? 'Student project—not an official emergency service. Reports and offers are reviewed privately.'
            : 'Student project—not an official emergency service. Online submissions are disabled until setup is complete.'}
        </p>
        <a href="tel:100">Nepal Police: 100</a>
        <a href="tel:1114">Armed Police Force: 1114</a>
        <button className="footer-admin-link" onClick={() => navigate('admin')}>
          Staff sign-in
        </button>
      </footer>
    </div>
  );
}
