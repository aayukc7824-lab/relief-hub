import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, Clock3, MapPin, ShieldCheck, Users } from 'lucide-react';
import { backendReady, supabase } from '../lib/supabase';

function formatVerifiedAt(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function Dashboard({ onNavigate }) {
  const [missingNotices, setMissingNotices] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    async function loadFieldUpdates() {
      setLoading(true);
      setError('');
      const [missingResult, campResult] = await Promise.all([
        supabase
          .from('missing_persons')
          .select('id, public_name, district, approximate_area, last_seen_on, last_verified_at')
          .order('last_verified_at', { ascending: false }),
        supabase
          .from('active_relief_camps')
          .select('id, name, district, locality, status, last_verified_at')
          .order('last_verified_at', { ascending: false }),
      ]);

      if (!active) return;
      if (missingResult.error || campResult.error) {
        console.error('Unable to load public dashboard field updates', {
          missingError: missingResult.error,
          campError: campResult.error,
        });
        setError('Verified field updates could not be loaded. Please try again later.');
      } else {
        setMissingNotices(missingResult.data ?? []);
        setCamps(campResult.data ?? []);
      }
      setLoading(false);
    }

    loadFieldUpdates();
    return () => {
      active = false;
    };
  }, []);

  const fieldUpdates = useMemo(() => [
    ...missingNotices.map((notice) => ({
      id: `missing-${notice.id}`,
      type: 'Missing-person notice',
      title: notice.public_name,
      area: `${notice.approximate_area}, ${notice.district}`,
      verifiedAt: notice.last_verified_at,
      icon: Users,
    })),
    ...camps.map((camp) => ({
      id: `camp-${camp.id}`,
      type: 'Relief camp update',
      title: camp.name,
      area: `${camp.locality}, ${camp.district}`,
      verifiedAt: camp.last_verified_at,
      status: camp.status,
      icon: Building2,
    })),
  ].sort((a, b) => Date.parse(b.verifiedAt) - Date.parse(a.verifiedAt)).slice(0, 5), [missingNotices, camps]);

  return (
    <>
      <section className="hero operations-hero">
        <div className="hero-copy-block">
          <div className="hero-kicker-row">
            <p className="eyebrow">COMMUNITY OPERATIONS · NEPAL</p>
            <span className="independent-label">
              <ShieldCheck size={14} aria-hidden="true" />
              Independent portal
            </span>
          </div>
          <h2>Coordination information for the Bhote Koshi region</h2>
          <p className="hero-copy">
            A single point to review public guidance, administrator-verified
            shelter updates when available, and community support pathways
            across Rasuwa, Nuwakot, and Dhading.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => onNavigate('missing')}>
              <Users size={18} aria-hidden="true" />
              Case reporting &amp; guidance
            </button>
            <button className="button button-outline" onClick={() => onNavigate('camps')}>
              Shelter information
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
        <aside className="hero-emergency" aria-labelledby="emergency-heading">
          <p className="hero-emergency-label">EMERGENCY CONTACTS</p>
          <h3 id="emergency-heading">Call emergency services</h3>
          <a className="emergency-contact" href="tel:100">
            <span>Nepal Police</span><strong>100</strong>
          </a>
          <a className="emergency-contact" href="tel:1114">
            <span>Armed Police Force</span><strong>1114</strong>
          </a>
          <p className="hero-emergency-note">
            Calls go directly to the listed service. This independent portal is
            not an emergency dispatch service.
          </p>
        </aside>
      </section>

      <section className="operations-status" aria-labelledby="operations-status-title">
        <div className="operations-status-heading">
          <div>
            <p className="eyebrow">SERVICE READINESS</p>
            <h2 id="operations-status-title">Portal status</h2>
            <p>Configuration status does not confirm live field operations.</p>
          </div>
          <span className={`status-pill ${backendReady ? 'status-pill-configured' : 'status-pill-pending'}`}>
            <span aria-hidden="true"></span>
            {backendReady ? 'Backend configured' : 'Setup required'}
          </span>
        </div>
        <div className="operations-status-grid">
          <article className="status-detail">
            <span className="status-detail-label">SECURE SUBMISSIONS</span>
            <strong>{backendReady ? 'Configuration detected' : 'Not configured'}</strong>
            <p>{backendReady ? 'End-to-end workflow testing is required before operational use.' : 'Online reports and volunteer offers are disabled.'}</p>
          </article>
          <article className="status-detail">
            <span className="status-detail-label">VERIFIED FIELD UPDATES</span>
            <strong>{loading ? 'Loading…' : error ? 'Unavailable' : supabase ? fieldUpdates.length : 'Not connected'}</strong>
            <p>Recently verified public notices and shelter updates.</p>
          </article>
          <article className="status-detail">
            <span className="status-detail-label">COVERAGE</span>
            <strong>3 districts</strong>
            <p>Rasuwa · Nuwakot · Dhading</p>
          </article>
        </div>
      </section>

      <section className="section operations-services">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PUBLIC SERVICE AREAS</p>
            <h2>Information &amp; coordination</h2>
          </div>
          <span className="section-caption">Guidance and verified updates</span>
        </div>
        <div className="field-grid">
          <article className="field-card">
            <div className="field-card-top">
              <span className="field-icon"><Users size={19} aria-hidden="true" /></span>
              <span className="field-tag">01 · CASE GUIDANCE</span>
            </div>
            <h3>Missing-person support</h3>
            <p>Review immediate steps and verified notices. Private reports are routed only through secure intake when enabled.</p>
            <button className="text-link" onClick={() => onNavigate('missing')}>
              Open registry <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
          <article className="field-card">
            <div className="field-card-top">
              <span className="field-icon"><MapPin size={19} aria-hidden="true" /></span>
              <span className="field-tag">02 · VERIFIED LOCATIONS</span>
            </div>
            <h3>Relief camp information</h3>
            <p>Review published shelter details and verification times. Confirm availability with local authorities before travelling.</p>
            <button className="text-link" onClick={() => onNavigate('camps')}>
              View shelter records <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
          <article className="field-card">
            <div className="field-card-top">
              <span className="field-icon"><Building2 size={19} aria-hidden="true" /></span>
              <span className="field-tag">03 · COMMUNITY SUPPORT</span>
            </div>
            <h3>Offers &amp; volunteer support</h3>
            <p>Register practical skills or supplies for administrator review. This portal does not process payments or arrange deployments.</p>
            <button className="text-link" onClick={() => onNavigate('volunteer')}>
              Open support portal <ArrowRight size={15} aria-hidden="true" />
            </button>
          </article>
        </div>
      </section>

      <section className="field-updates-section" aria-labelledby="field-updates-title">
        <div className="field-updates-heading">
          <div>
            <p className="eyebrow">PUBLIC INFORMATION</p>
            <h2 id="field-updates-title">Recent verified field updates</h2>
            <p>Only public records verified through the registry are shown here. Private submissions are never included.</p>
          </div>
          <span className="field-updates-count">{loading ? 'Loading' : `${fieldUpdates.length} updates`}</span>
        </div>
        {error && <p className="form-message form-message-error" role="alert">{error}</p>}
        {loading && <p className="inline-status">Loading verified updates…</p>}
        {!loading && !error && fieldUpdates.length > 0 && (
          <div className="field-updates-list">
            {fieldUpdates.map((update) => {
              const Icon = update.icon;
              return (
                <article className="field-update" key={update.id}>
                  <span className="field-update-icon"><Icon size={18} aria-hidden="true" /></span>
                  <div className="field-update-copy">
                    <span>{update.type}</span>
                    <strong>{update.title}</strong>
                    <p>{update.area}</p>
                  </div>
                  <div className="field-update-meta">
                    {update.status && <span className={`camp-state camp-state-${update.status}`}>{update.status}</span>}
                    <span><Clock3 size={14} aria-hidden="true" />Verified {formatVerifiedAt(update.verifiedAt)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {!loading && !error && fieldUpdates.length === 0 && (
          <div className="empty-state field-updates-empty">
            <Clock3 size={22} aria-hidden="true" />
            <strong>{supabase ? 'No current verified public updates' : 'Live updates are not connected'}</strong>
            <span>{supabase
              ? 'No recent notices or shelter updates have been verified for public display.'
              : 'This section will show only recently verified notices and shelter records after the database is configured.'}</span>
          </div>
        )}
      </section>

      <section className="workflow-section" aria-labelledby="workflow-title">
        <div className="workflow-intro">
          <span className="workflow-icon"><ShieldCheck size={19} aria-hidden="true" /></span>
          <div>
            <p className="eyebrow">INFORMATION HANDLING</p>
            <h2 id="workflow-title">A clear review workflow</h2>
          </div>
        </div>
        <div className="workflow-steps">
          <article className="workflow-step"><span>01</span><div><strong>Receive</strong><p>Submissions enter private intake only when secure submission is activated.</p></div></article>
          <article className="workflow-step"><span>02</span><div><strong>Review</strong><p>Authorized staff check details and consent before taking action.</p></div></article>
          <article className="workflow-step"><span>03</span><div><strong>Verify &amp; publish</strong><p>Only approved, time-limited public information is displayed.</p></div></article>
        </div>
      </section>

      <div className="independent-disclaimer" role="note">
        <ShieldCheck size={19} aria-hidden="true" />
        <p><strong>Independent community information portal.</strong> Not affiliated with government agencies and not a replacement for emergency services. For immediate danger, call Nepal Police on 100.</p>
      </div>
    </>
  );
}
