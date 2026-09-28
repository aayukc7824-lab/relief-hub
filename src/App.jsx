import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  FileWarning,
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
  { id: 'missing', label: 'Missing & Reunification' },
  { id: 'camps', label: 'Relief Camps' },
  { id: 'volunteer', label: 'Donate & Volunteer' },
];

function Dashboard({ onNavigate }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">RASUWA · NUWAKOT · DHADING</p>
          <h2>Bhote Koshi River Basin Flood Recovery</h2>
          <p className="hero-copy">
            A community coordination hub with emergency contacts and guidance
            for missing-person support, relief shelters, and volunteering.
          </p>
          <div className="hero-actions">
            <button
              className="button button-alert"
              onClick={() => onNavigate('missing')}
            >
              <Users size={18} aria-hidden="true" />
              Missing & reunification
            </button>
            <button
              className="button button-outline"
              onClick={() => onNavigate('camps')}
            >
              View relief camp guidance
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="hero-facts" aria-label="Portal information">
          <div className="fact-card">
            <span className="fact-icon"><MapPin size={18} aria-hidden="true" /></span>
            <span className="fact-label">Coordination area</span>
            <strong>Rasuwa, Nuwakot & Dhading</strong>
            <span className="fact-note">Regional information hub</span>
          </div>
          <div className="fact-card">
            <span className="fact-icon"><Building2 size={18} aria-hidden="true" /></span>
            <span className="fact-label">Relief shelters</span>
            <strong>Confirm locally</strong>
            <span className="fact-note">No live camp directory connected</span>
          </div>
          <div className="fact-card">
            <span className="fact-icon"><FileWarning size={18} aria-hidden="true" /></span>
            <span className="fact-label">Reports & updates</span>
            <strong>Not live</strong>
            <span className="fact-note">This demo does not collect reports</span>
          </div>
          <a className="fact-card fact-card-hotline" href="tel:100">
            <span className="fact-icon"><Phone size={18} aria-hidden="true" /></span>
            <span className="fact-label">Emergency helplines</span>
            <strong>100 <span className="fact-divider">/</span> 1114</strong>
            <span className="fact-note">Nepal Police / Armed Police Force</span>
          </a>
        </div>
      </section>

      <section className="notice" aria-label="Important information">
        <AlertTriangle size={21} aria-hidden="true" />
        <p>
          <strong>In immediate danger?</strong> Call Nepal Police on 100 or the
          Armed Police Force on 1114. This demo does not dispatch responders or
          submit reports.
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COORDINATION DESK</p>
            <h2>Community support information</h2>
          </div>
        </div>
        <div className="field-grid">
          <article className="field-card">
            <div className="field-card-top">
              <span className="field-icon"><Users size={19} aria-hidden="true" /></span>
              <span className="field-tag">MISSING PERSONS</span>
            </div>
            <h3>Looking for someone?</h3>
            <p>
              This portal has no live registry. Contact police directly and
              share identifying details with authorized responders.
            </p>
            <button className="text-link" onClick={() => onNavigate('missing')}>
              Reunification guidance <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
          <article className="field-card">
            <div className="field-card-top">
              <span className="field-icon"><MapPin size={19} aria-hidden="true" /></span>
              <span className="field-tag">SHELTER INFORMATION</span>
            </div>
            <h3>Confirm before travelling</h3>
            <p>
              Shelter locations and availability are not verified here. Check
              with local authorities for current arrangements.
            </p>
            <button className="text-link" onClick={() => onNavigate('camps')}>
              Relief camp guidance <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
          <article className="field-card">
            <div className="field-card-top">
              <span className="field-icon"><HeartHandshake size={19} aria-hidden="true" /></span>
              <span className="field-tag">VOLUNTEERING</span>
            </div>
            <h3>Offer help safely</h3>
            <p>
              Volunteer offers are not collected here. Coordinate with
              recognized local organizations and confirm needs first.
            </p>
            <button className="text-link" onClick={() => onNavigate('volunteer')}>
              Ways to offer help <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
        </div>
      </section>
    </>
  );
}

function ReliefCampView() {
  const districts = ['Rasuwa', 'Nuwakot', 'Dhading'];

  return (
    <section className="camp-page">
      <div className="camp-heading">
        <p className="eyebrow">SHELTER INFORMATION</p>
        <h2>Relief Camp Status &amp; Occupancy</h2>
        <p>
          Live camp locations, capacity, and supply levels are not connected to
          this demo. Confirm current arrangements with local authorities before
          travelling.
        </p>
      </div>

      <div className="camp-grid">
        {districts.map((district) => (
          <article className="camp-card" key={district}>
            <div className="camp-card-heading">
              <span className="camp-icon">
                <Building2 size={21} aria-hidden="true" />
              </span>
              <span className="district-badge">{district}</span>
            </div>
            <h3>{district} shelter information</h3>
            <div className="camp-detail">
              <span>
                <Users size={16} aria-hidden="true" />
                Occupancy &amp; capacity
              </span>
              <strong>Not available</strong>
            </div>
            <div className="camp-detail">
              <span>
                <MapPin size={16} aria-hidden="true" />
                Locations &amp; supplies
              </span>
              <strong>Confirm locally</strong>
            </div>
            <p className="camp-status">
              <AlertTriangle size={16} aria-hidden="true" />
              No verified live shelter data
            </p>
            <a className="camp-contact" href="tel:100">
              <Phone size={15} aria-hidden="true" />
              Call Nepal Police: 100
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function InformationView({ section }) {
  const content = {
    missing: {
      eyebrow: 'MISSING & REUNIFICATION',
      title: 'Missing person support',
      intro:
        'This demo has no official missing-person registry and cannot receive or distribute reports. Contact authorized responders directly.',
      cards: [
        {
          icon: <Phone size={21} aria-hidden="true" />,
          label: 'EMERGENCY CONTACT',
          title: 'Contact Nepal Police',
          description:
            'If someone is in immediate danger or missing, contact Nepal Police directly at 100.',
          action: 'Call Nepal Police: 100',
          href: 'tel:100',
        },
        {
          icon: <Users size={21} aria-hidden="true" />,
          label: 'DETAILS TO PREPARE',
          title: 'Share clear information',
          description:
            'Be ready to provide the person’s name and description, last known location and time, and a safe way for responders to reach you.',
        },
        {
          icon: <ShieldAlert size={21} aria-hidden="true" />,
          label: 'PRIVACY & SAFETY',
          title: 'Protect personal details',
          description:
            'Share identifying information directly with authorized responders. Avoid posting private details publicly.',
        },
      ],
    },
    volunteer: {
      eyebrow: 'DONATE & VOLUNTEER',
      title: 'Offer help safely',
      intro:
        'This demo does not collect donations or volunteer registrations. Confirm needs and safe arrangements with local authorities or recognized relief organizations.',
      cards: [
        {
          icon: <ShieldAlert size={21} aria-hidden="true" />,
          label: 'CONFIRM NEEDS',
          title: 'Check before donating',
          description:
            'Ask an established local authority or recognized relief organization what supplies are currently needed and where to deliver them.',
        },
        {
          icon: <HeartHandshake size={21} aria-hidden="true" />,
          label: 'TRUSTED ORGANIZATIONS',
          title: 'Use verified channels',
          description:
            'Donate through organizations whose identity and relief work you can verify. Be cautious with unsolicited payment requests.',
        },
        {
          icon: <AlertTriangle size={21} aria-hidden="true" />,
          label: 'VOLUNTEER SAFELY',
          title: 'Follow local guidance',
          description:
            'Do not enter flood-affected areas without authorization, training, and current safety guidance from local responders.',
          action: 'Emergency: Nepal Police 100',
          href: 'tel:100',
        },
      ],
    },
  }[section];

  return (
    <section className="camp-page resource-page">
      <div className="camp-heading">
        <p className="eyebrow">{content.eyebrow}</p>
        <h2>{content.title}</h2>
        <p>{content.intro}</p>
      </div>
      <div className="camp-grid resource-grid">
        {content.cards.map((card) => (
          <article className="camp-card resource-card" key={card.label}>
            <div className="camp-card-heading">
              <span className="camp-icon">{card.icon}</span>
              <span className="district-badge">{card.label}</span>
            </div>
            <h3>{card.title}</h3>
            <p className="resource-description">{card.description}</p>
            {card.href && (
              <a className="camp-contact" href={card.href}>
                <Phone size={15} aria-hidden="true" />
                {card.action}
              </a>
            )}
          </article>
        ))}
      </div>
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
        <span>
          CRISIS RESPONSE COORDINATION · BHOTE KOSHI & TRISHULI RIVER BASINS
        </span>
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
        ) : activeTab === 'camps' ? (
          <ReliefCampView />
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
        <a href="tel:1114">Armed Police Force: 1114</a>
        <p className="developer-credit">
          Developed by Aayusha Khatiwada (B.Sc. CSIT Student)
        </p>
      </footer>
    </div>
  );
}
