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
            A regional information hub for emergency contacts and guidance on
            missing-person support, relief shelters, and volunteering. Live
            incident, shelter, and registry data are not connected.
          </p>
          <div className="hero-actions">
            <button
              className="button button-alert"
              onClick={() => onNavigate('missing')}
            >
              <Users size={18} aria-hidden="true" />
              Missing-person guidance
            </button>
            <button
              className="button button-outline"
              onClick={() => onNavigate('camps')}
            >
              View relief camp information
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Portal information">
        <article className="stat-card">
          <span className="stat-label">COORDINATION AREA</span>
          <strong>3 districts</strong>
          <span>Rasuwa · Nuwakot · Dhading</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">RELIEF SHELTERS</span>
          <strong>Confirm locally</strong>
          <span>No live shelter directory connected</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">REPORTS &amp; UPDATES</span>
          <strong>Not connected</strong>
          <span>This demo does not collect reports</span>
        </article>
        <a className="stat-card stat-card-hotline" href="tel:100">
          <span className="stat-label">EMERGENCY HELPLINES</span>
          <strong>100 <span>/</span> 1114</strong>
          <span>Nepal Police / Armed Police Force</span>
        </a>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COORDINATION DESK</p>
            <h2>Response &amp; safety guidance</h2>
          </div>
          <span className="section-note">No live field reports are available</span>
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
        <h2>Relief Camp Status &amp; Occupancy Tracker</h2>
        <p>
          Live capacity metrics and supply levels are not connected to this
          demo. Confirm current shelter arrangements with local authorities
          before travelling.
        </p>
      </div>

      <div className="camp-grid">
        {districts.map((district) => (
          <article className="camp-card" key={district}>
            <h3>{district} shelter information</h3>
            <span className="district-badge">{district}</span>
            <div className="camp-detail">
              <span>
                <Users size={16} aria-hidden="true" />
                Shelter capacity
              </span>
              <strong>Not available</strong>
            </div>
            <div className="camp-detail">
              <span>
                <Building2 size={16} aria-hidden="true" />
                Locations &amp; supplies
              </span>
              <strong>Confirm locally</strong>
            </div>
            <p className="camp-status">
              <AlertTriangle size={16} aria-hidden="true" />
              Status not verified
            </p>
            <div className="camp-coordinator">
              <strong>Before travelling:</strong>
              <span>Check current arrangements with local authorities.</span>
            </div>
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
      title: 'Family Reunification & Missing Persons Registry',
      intro:
        'This demonstration does not store or search missing-person reports. Contact authorized responders directly to share information.',
    },
    volunteer: {
      eyebrow: 'DONATE & VOLUNTEER',
      title: 'Volunteer & Relief Contribution Portal',
      intro:
        'This demo does not accept volunteer registrations or donations. Coordinate offers through local authorities or recognized relief organizations.',
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

  if (section === 'missing') {
    return (
      <section className="camp-page registry-page">
        <div className="registry-heading">
          <div className="camp-heading">
            <p className="eyebrow">{content.eyebrow}</p>
            <h2>{content.title}</h2>
            <p>{content.intro}</p>
          </div>
          <a className="button button-primary" href="tel:100">
            <Phone size={17} aria-hidden="true" />
            Contact Nepal Police: 100
          </a>
        </div>
        <div className="registry-search" aria-label="Registry unavailable">
          <FileWarning size={19} aria-hidden="true" />
          <span>No searchable registry is connected to this demonstration.</span>
        </div>
        <div className="registry-table-wrap">
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">FULL NAME</th>
                <th scope="col">AGE</th>
                <th scope="col">LAST KNOWN LOCATION</th>
                <th scope="col">STATUS</th>
                <th scope="col">CONTACT PERSON</th>
                <th scope="col">REPORTED</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="6">
                  <div className="registry-empty">
                    <Users size={24} aria-hidden="true" />
                    <strong>No reports are stored here</strong>
                    <span>
                      For help, share details directly with authorized
                      responders. Avoid posting private information publicly.
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  }

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
          CRISIS RESPONSE INFORMATION PORTAL · BHOTE KOSHI &amp; TRISHULI RIVER BASINS
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
