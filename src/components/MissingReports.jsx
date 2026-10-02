import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, FileWarning, Plus, Phone, Search, Users, X } from 'lucide-react';
import TurnstileField from './TurnstileField';
import { backendReady, supabase } from '../lib/supabase';

const initialForm = {
  person_name: '',
  approximate_age: '',
  district: '',
  last_seen_location: '',
  last_seen_at: '',
  description: '',
  reporter_name: '',
  reporter_phone: '',
  reporter_email: '',
  consent_to_store: false,
  publication_consent: false,
};

function SetupNotice() {
  return (
    <div className="backend-notice" role="status">
      <FileWarning size={20} aria-hidden="true" />
      <div>
        <strong>Report submission is not set up yet.</strong>
        <p>
          Do not enter personal details until the secure service is configured.
          For urgent help, call Nepal Police on 100.
        </p>
      </div>
    </div>
  );
}

export default function MissingReports() {
  const [form, setForm] = useState(initialForm);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [widgetVersion, setWidgetVersion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(Boolean(supabase));
  const [noticesError, setNoticesError] = useState('');
  const [search, setSearch] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const openModalButton = useRef(null);
  const closeModalButton = useRef(null);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    async function loadNotices() {
      setNoticesLoading(true);
      setNoticesError('');
      const { data, error } = await supabase
        .from('missing_persons')
        .select('id, public_name, district, approximate_area, last_seen_on, last_verified_at')
        .order('last_verified_at', { ascending: false });

      if (!active) return;
      if (error) {
        console.error('Unable to load public missing-person notices', error);
        setNoticesError('Public notices could not be loaded right now.');
      } else {
        setNotices(data ?? []);
      }
      setNoticesLoading(false);
    }

    loadNotices();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!reportModalOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeModalButton.current?.focus();
    function closeOnEscape(event) {
      if (event.key === 'Escape') setReportModalOpen(false);
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
      openModalButton.current?.focus();
    };
  }, [reportModalOpen]);

  const handleToken = useCallback((token) => {
    setTurnstileToken(token);
  }, []);

  const visibleNotices = notices.filter((notice) => {
    const query = search.trim().toLocaleLowerCase();
    return !query || [
      notice.public_name,
      notice.district,
      notice.approximate_area,
    ].some((value) => value.toLocaleLowerCase().includes(query));
  });

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function submitReport(event) {
    event.preventDefault();
    setMessage(null);
    if (!supabase || !backendReady || !turnstileToken) {
      setMessage({
        type: 'error',
        text: 'Secure report submission is not ready. Nothing was sent.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        approximate_age: form.approximate_age ? Number(form.approximate_age) : null,
        last_seen_at: new Date(form.last_seen_at).toISOString(),
        turnstile_token: turnstileToken,
      };
      const { data, error } = await supabase.functions.invoke(
        'submit-missing-report',
        { body: payload },
      );

      if (error) {
        console.error('Missing-person report submission failed', error);
        setMessage({
          type: 'error',
          text: error.message || 'The report could not be sent. Please try again.',
        });
      } else if (typeof data?.message === 'string') {
        setForm(initialForm);
        setMessage({ type: 'success', text: data.message });
        setTurnstileToken(null);
        setWidgetVersion((version) => version + 1);
      } else {
        console.error('Missing-person report response did not include a confirmation message');
        setMessage({
          type: 'error',
          text: 'The server did not confirm the report was saved.',
        });
      }
    } catch (error) {
      console.error('Missing-person report submission failed unexpectedly', error);
      setMessage({
        type: 'error',
        text: 'The report could not be sent. Nothing was confirmed as saved.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="camp-page report-page">
      <div className="camp-heading">
        <p className="eyebrow">MISSING &amp; REUNIFICATION</p>
        <h2>Missing person reports</h2>
        <p>
          The reporting workflow is designed for private staff review. A public
          notice is never automatic and requires separate permission and
          verification.
        </p>
      </div>

      <div className="report-safety-note">
        <Phone size={19} aria-hidden="true" />
        <p>
          <strong>For immediate danger, call Nepal Police on 100.</strong>
          This website does not dispatch responders.
        </p>
      </div>

      <div className="notice-list">
        <div className="registry-heading">
          <div className="subsection-heading">
            <h3>Missing persons registry</h3>
            <p>Only recent, administrator-verified public notices appear here. Contact police directly with information.</p>
          </div>
          <button
            ref={openModalButton}
            className="button button-primary"
            type="button"
            onClick={() => {
              setMessage(null);
              setReportModalOpen(true);
            }}
          >
            <Plus size={17} aria-hidden="true" />
            Submit a report
          </button>
        </div>
        <label className="registry-search-input">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search public notices by name, district, or area</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, district, or area"
            aria-label="Search public notices by name, district, or area"
          />
        </label>
        {!supabase && (
          <div className="empty-state">
            <Users size={22} aria-hidden="true" />
            <strong>No public notices are available.</strong>
            <span>The secure registry has not been connected.</span>
          </div>
        )}
        {noticesLoading && <p className="inline-status">Loading public notices…</p>}
        {noticesError && (
          <p className="form-message form-message-error" role="alert">{noticesError}</p>
        )}
        {supabase && !noticesLoading && !noticesError && notices.length === 0 && (
          <div className="empty-state">
            <Users size={22} aria-hidden="true" />
            <strong>No recently verified notices.</strong>
            <span>Only notices checked by an administrator within the last 72 hours appear here.</span>
          </div>
        )}
        {notices.length > 0 && visibleNotices.length === 0 && (
          <p className="inline-status">No notices match that search.</p>
        )}
        {visibleNotices.length > 0 && (
          <div className="notice-grid">
            {visibleNotices.map((notice) => (
              <article className="notice-card" key={notice.id}>
                <span className="notice-card-district">{notice.district}</span>
                <h4>{notice.public_name}</h4>
                <p>{notice.approximate_area}</p>
                <dl>
                  <div><dt>Last seen</dt><dd>{new Date(`${notice.last_seen_on}T00:00:00`).toLocaleDateString()}</dd></div>
                  <div><dt>Last checked</dt><dd>{new Date(notice.last_verified_at).toLocaleString()}</dd></div>
                </dl>
                <a href="tel:100" className="text-link">
                  Share information with police <ArrowRight size={15} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        )}
      </div>

      {reportModalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReportModalOpen(false);
          }}
        >
          <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
            <div className="report-modal-heading">
              <div className="subsection-heading">
                <h3 id="report-modal-title">Submit a missing-person report</h3>
                <p>Information is private and routed for staff review when secure intake is active.</p>
              </div>
              <button
                ref={closeModalButton}
                className="modal-close-button"
                type="button"
                aria-label="Close report form"
                onClick={() => setReportModalOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <form className="submission-form report-modal-form" onSubmit={submitReport}>
              <div className="subsection-heading">
                <h4>Report details and your contact information</h4>
                <p>Enter only information needed to identify the person and contact you.</p>
              </div>
        {!backendReady && <SetupNotice />}
        <fieldset disabled={!backendReady || isSubmitting}>
          <legend className="form-legend">Report information and your contact details</legend>
          <h4 className="form-subheading">Person and last known information</h4>
          <div className="form-grid">
            <label>
              Person’s name <span>*</span>
              <input name="person_name" autoComplete="off" minLength="2" maxLength="100" value={form.person_name} onChange={updateField} required />
            </label>
            <label>
              Approximate age
              <input name="approximate_age" type="number" min="0" max="120" value={form.approximate_age} onChange={updateField} />
            </label>
            <label>
              District <span>*</span>
              <select name="district" value={form.district} onChange={updateField} required>
                <option value="">Choose a district</option>
                <option>Rasuwa</option>
                <option>Nuwakot</option>
                <option>Dhading</option>
              </select>
            </label>
            <label>
              Last known location <span>*</span>
              <input name="last_seen_location" minLength="2" maxLength="160" value={form.last_seen_location} onChange={updateField} required />
            </label>
            <label>
              When were they last seen? <span>*</span>
              <input name="last_seen_at" type="datetime-local" value={form.last_seen_at} onChange={updateField} required />
            </label>
            <label className="form-field-wide">
              Description or other useful information <span>*</span>
              <textarea name="description" minLength="10" maxLength="1200" rows="4" value={form.description} onChange={updateField} required />
            </label>
          </div>

          <h4 className="form-subheading">Your contact information</h4>
          <div className="form-grid">
            <label>
              Your name <span>*</span>
              <input name="reporter_name" autoComplete="name" minLength="2" maxLength="100" value={form.reporter_name} onChange={updateField} required />
            </label>
            <label>
              Phone number <span>*</span>
              <input name="reporter_phone" type="tel" autoComplete="tel" minLength="7" maxLength="30" value={form.reporter_phone} onChange={updateField} required />
            </label>
            <label className="form-field-wide">
              Email address (optional)
              <input name="reporter_email" type="email" autoComplete="email" maxLength="254" value={form.reporter_email} onChange={updateField} />
            </label>
          </div>

          <div className="consent-list">
            <label className="checkbox-label">
              <input name="consent_to_store" type="checkbox" checked={form.consent_to_store} onChange={updateField} required />
              <span>I agree to have this report and my contact details stored privately for follow-up by an authorized administrator.</span>
            </label>
            <label className="checkbox-label">
              <input name="publication_consent" type="checkbox" checked={form.publication_consent} onChange={updateField} />
              <span>
                The person or their legal guardian has agreed to a limited public notice if an administrator verifies the details. Contact information and the full description will never be published. Minors are not listed publicly.
              </span>
            </label>
          </div>
        </fieldset>
        <TurnstileField
          key={`missing-${widgetVersion}`}
          action="missing_report"
          onToken={handleToken}
        />
        <fieldset disabled={!backendReady || isSubmitting}>
          <button className="button button-primary" type="submit" disabled={!turnstileToken || isSubmitting}>
            {isSubmitting ? 'Sending report…' : 'Send report for review'}
          </button>
        </fieldset>
        {message && (
          <p className={`form-message form-message-${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
            {message.text}
          </p>
        )}
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
