import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  HeartHandshake,
  LifeBuoy,
  MapPin,
  Menu,
  Phone,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'missing', label: 'Missing & reunification' },
  { id: 'camps', label: 'Relief camps' },
  { id: 'volunteer', label: 'Donate & volunteer' },
];

function Dashboard({ onNavigate }) {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">RASUWA · NUWAKOT · DHADING</p>
        <h2>Relief information, all in one place.</h2>
        <p className="hero-copy">
          Use this coordination hub to find emergency contacts and navigate
          missing-person, shelter, and volunteer information.
        </p>
        <a className="button button-light" href="tel:100">
          <Phone size={18} aria-hidden="true" />
          Call Nepal Police: 100
        </a>
      </section>

      <section className="notice" aria-label="Important information">
        <AlertTriangle size={21} aria-hidden="true" />
        <p>
          <strong>In immediate danger?</strong> Call Nepal Police on 100 or the
          Armed Police Force on 1149. This demo does not dispatch responders or
          submit reports.
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">GET STARTED</p>
            <h2>How can we help?</h2>
          </div>
        </div>
        <div className="action-grid">
          <ActionCard
            icon={<Users size={22} aria-hidden="true" />}
            title="Find someone"
            description="View guidance for missing-person and reunification support."
            onClick={() => onNavigate('missing')}
          />
          <ActionCard
            icon={<MapPin size={22} aria-hidden="true" />}
            title="Find relief"
            description="Check shelter information and how to confirm availability."
            onClick={() => onNavigate('camps')}
          />
          <ActionCard
            icon={<HeartHandshake size={22} aria-hidden="true" />}
            title="Offer help"
            description="See how to connect with local volunteer coordination."
            onClick={() => onNavigate('volunteer')}
          />
        </div>
      </section>
    </>
  );
}

function ActionCard({ icon, title, description, onClick }) {
  return (
    <button className="action-card" onClick={onClick}>
      <span className="action-icon">{icon}</span>
      <span className="action-title">{title}</span>
      <span className="action-description">{description}</span>
      <span className="action-link">
        View information <ArrowRight size={16} aria-hidden="true" />
      </span>
    </button>
  );
}

function InformationView({ section }) {
  const content = {
    missing: {
      icon: <Users size={24} aria-hidden="true" />,
      eyebrow: 'MISSING & REUNIFICATION',
      title: 'Help find and reconnect with loved ones.',
      message:
        'This demo is not connected to an official missing-person registry and cannot accept or share reports.',
      action: 'If someone is missing or in immediate danger, contact Nepal Police on 100. Share identifying information directly with authorized responders.',
    },
    camps: {
      icon: <MapPin size={24} aria-hidden="true" />,
      eyebrow: 'RELIEF CAMPS',
      title: 'Confirm shelter information before travelling.',
      message:
        'There is no verified live shelter directory connected to this demo, so camp locations and capacity cannot be confirmed here.',
      action: 'For urgent assistance, call Nepal Police on 100 or the Armed Police Force on 1149 and ask for current local arrangements.',
    },
    volunteer: {
      icon: <HeartHandshake size={24} aria-hidden="true" />,
      eyebrow: 'DONATE & VOLUNTEER',
      title: 'Coordinate help through trusted local organizations.',
      message:
        'Volunteer offers and donations are not collected by this demo.',
      action: 'Contact established local authorities or recognized relief organizations directly to confirm current needs and safe ways to help.',
    },
  }[section];

  return (
    <section className="information-card">
      <span className="information-icon">{content.icon}</span>
      <p className="eyebrow">{content.eyebrow}</p>
      <h2>{content.title}</h2>
      <p className="information-message">{content.message}</p>
      <div className="information-guidance">
        <ShieldAlert size={20} aria-hidden="true" />
        <p>{content.action}</p>
      </div>
      <a className="button button-primary" href="tel:100">
        <Phone size={18} aria-hidden="true" />
        Call Nepal Police: 100
      </a>
    </section>
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
        <AlertTriangle size={18} aria-hidden="true" />
        <span>Flood response coordination · Bhote Koshi & Trishuli river basins</span>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigate('dashboard')}>
            <span className="brand-mark">
              <LifeBuoy size={25} aria-hidden="true" />
            </span>
            <span className="brand-copy">
              <strong>BhoteKoshi Relief Hub</strong>
              <small>Rasuwa · Nuwakot · Dhading coordination</small>
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

          <a className="hotline" href="tel:100">
            <Phone size={16} aria-hidden="true" />
            Emergency: 100
          </a>

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
        ) : (
          <InformationView section={activeTab} />
        )}
      </main>

      <footer className="site-footer">
        <ShieldAlert size={18} aria-hidden="true" />
        <p>
          This is a demonstration portal. Information is not live, and reports
          are not submitted or monitored.
        </p>
        <a href="tel:1149">Armed Police Force: 1149</a>
      </footer>
    </div>
  );
}
