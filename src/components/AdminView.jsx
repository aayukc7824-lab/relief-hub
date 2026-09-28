import React, { useCallback, useEffect, useState } from 'react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

const districts = ['Rasuwa', 'Nuwakot', 'Dhading'];

const emptyCamp = {
  id: '',
  name: '',
  district: '',
  locality: '',
  capacity: '',
  current_occupancy: '',
  supplies_summary: '',
  status: 'open',
  public_notes: '',
  confirm_verified: false,
};

function AdminLogin({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      console.error('Admin sign-in failed', signInError);
      setError('Sign-in failed. Check your credentials and try again.');
    } else {
      onSignedIn(data.user);
    }
    setBusy(false);
  }

  return (
    <form className="submission-form admin-login" onSubmit={signIn}>
      <div className="subsection-heading">
        <h3>Staff sign-in</h3>
        <p>Only accounts added as administrators can access private reports.</p>
      </div>
      <div className="form-grid">
        <label>
          Email address
          <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
      </div>
      {error && <p className="form-message form-message-error" role="alert">{error}</p>}
      <button className="button button-primary" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

function PublishNoticeForm({ report, onPublish }) {
  const [publicName, setPublicName] = useState(report.person_name);
  const [district, setDistrict] = useState(report.district);
  const [area, setArea] = useState(report.last_seen_location);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const eligible = report.publication_consent
    && report.approximate_age !== null
    && report.approximate_age >= 18;

  async function submit(event) {
    event.preventDefault();
    setError('');
    const { error: publishError } = await onPublish({
      reportId: report.id,
      publicName,
      district,
      area,
      lastSeenOn: report.last_seen_at.slice(0, 10),
    });
    if (publishError) setError(publishError);
  }

  if (!eligible || report.status === 'resolved' || report.status === 'rejected') {
    return (
      <p className="admin-private-note">
        Not eligible for a public notice: separate consent, an age of 18 or older, and an active report are required.
      </p>
    );
  }

  return (
    <form className="admin-publish-form" onSubmit={submit}>
      <strong>Public notice preview</strong>
      <label>
        Display name
        <input value={publicName} onChange={(event) => setPublicName(event.target.value)} maxLength="80" required />
      </label>
      <label>
        District
        <select value={district} onChange={(event) => setDistrict(event.target.value)} required>
          {districts.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Approximate area (remove exact addresses)
        <input value={area} onChange={(event) => setArea(event.target.value)} maxLength="100" required />
      </label>
      <label className="checkbox-label">
        <input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} required />
        <span>I verified this information with an authorized responder and reviewed the public wording.</span>
      </label>
      {error && <p className="form-message form-message-error" role="alert">{error}</p>}
      <button className="button button-primary" type="submit">Verify and publish notice</button>
    </form>
  );
}

export default function AdminView() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [adminState, setAdminState] = useState('checking');
  const [reports, setReports] = useState([]);
  const [offers, setOffers] = useState([]);
  const [camps, setCamps] = useState([]);
  const [campForm, setCampForm] = useState(emptyCamp);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        console.error('Unable to restore admin session', sessionError);
        setError('Your sign-in session could not be restored. Please sign in again.');
      }
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !user) {
      setAdminState('checking');
      return undefined;
    }
    let active = true;
    async function checkAdmin() {
      setAdminState('checking');
      const { data, error: roleError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      if (roleError) {
        console.error('Unable to verify administrator role', roleError);
        setError('Administrator access could not be verified. Please try again later.');
        setAdminState('denied');
      } else {
        setAdminState(data ? 'authorized' : 'denied');
      }
    }
    checkAdmin();
    return () => {
      active = false;
    };
  }, [user]);

  const loadAdminData = useCallback(async () => {
    if (!supabase) return;
    setLoadingData(true);
    setError('');
    const [reportResult, offerResult, campResult] = await Promise.all([
      supabase.from('missing_reports')
        .select('id, person_name, approximate_age, district, last_seen_location, last_seen_at, description, reporter_name, reporter_phone, reporter_email, publication_consent, status, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('volunteer_offers')
        .select('id, full_name, phone, email, offer_type, district, availability, details, status, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('relief_camps')
        .select('id, name, district, locality, capacity, current_occupancy, supplies_summary, status, public_notes, last_verified_at, published')
        .order('updated_at', { ascending: false }),
    ]);

    const firstError = reportResult.error ?? offerResult.error ?? campResult.error;
    if (firstError) {
      console.error('Unable to load admin records', firstError);
      setError('Some administration records could not be loaded. Refresh and try again.');
    } else {
      setReports(reportResult.data ?? []);
      setOffers(offerResult.data ?? []);
      setCamps(campResult.data ?? []);
    }
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (adminState === 'authorized') loadAdminData();
  }, [adminState, loadAdminData]);

  async function signOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('Admin sign-out failed', signOutError);
      setError('Sign-out failed. Close this browser after clearing your session.');
    }
  }

  async function publishNotice(fields) {
    const { error: publishError } = await supabase.rpc('publish_missing_report', {
      p_report_id: fields.reportId,
      p_public_name: fields.publicName,
      p_district: fields.district,
      p_approximate_area: fields.area,
      p_last_seen_on: fields.lastSeenOn,
    });
    if (publishError) {
      console.error('Unable to publish missing-person notice', publishError);
      return { error: 'The notice could not be published. Check consent and details, then try again.' };
    }
    setNotice('The verified public notice is live for up to 72 hours.');
    await loadAdminData();
    return { error: null };
  }

  async function resolveReport(reportId) {
    const { error: resolveError } = await supabase.rpc('resolve_missing_report', {
      p_report_id: reportId,
    });
    if (resolveError) {
      console.error('Unable to resolve missing-person report', resolveError);
      setError('The report could not be marked resolved.');
      return;
    }
    setNotice('The report was marked resolved and removed from public notices.');
    await loadAdminData();
  }

  async function updateReportStatus(reportId, status) {
    const { error: updateError } = await supabase
      .from('missing_reports')
      .update({ status })
      .eq('id', reportId);
    if (updateError) {
      console.error('Unable to update missing-person report', updateError);
      setError('The report status could not be updated.');
      return;
    }
    await loadAdminData();
  }

  async function updateOfferStatus(offerId, status) {
    const { error: updateError } = await supabase
      .from('volunteer_offers')
      .update({ status })
      .eq('id', offerId);
    if (updateError) {
      console.error('Unable to update volunteer offer', updateError);
      setError('The offer status could not be updated.');
      return;
    }
    await loadAdminData();
  }

  async function deletePrivateRecord(table, id, label) {
    if (!window.confirm(`Permanently delete this ${label}? This cannot be undone.`)) return;
    const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
    if (deleteError) {
      console.error(`Unable to delete ${label}`, deleteError);
      setError(`The ${label} could not be deleted.`);
      return;
    }
    setNotice(`The ${label} was permanently deleted.`);
    await loadAdminData();
  }

  function selectCamp(camp) {
    setCampForm({
      ...camp,
      capacity: camp.capacity ?? '',
      current_occupancy: camp.current_occupancy ?? '',
      public_notes: camp.public_notes ?? '',
      confirm_verified: false,
    });
  }

  async function saveCamp(event) {
    event.preventDefault();
    if (!campForm.confirm_verified || !supabase || !user) return;
    const { error: saveError } = await supabase.rpc('save_relief_camp', {
      p_id: campForm.id || null,
      p_name: campForm.name.trim(),
      p_district: campForm.district,
      p_locality: campForm.locality.trim(),
      p_capacity: campForm.capacity === '' ? null : Number(campForm.capacity),
      p_current_occupancy: campForm.current_occupancy === '' ? null : Number(campForm.current_occupancy),
      p_supplies_summary: campForm.supplies_summary.trim(),
      p_status: campForm.status,
      p_public_notes: campForm.public_notes.trim() || null,
      p_confirmed_verified: campForm.confirm_verified,
    });
    if (saveError) {
      console.error('Unable to save relief camp', saveError);
      setError('The shelter record was not saved. Verify the capacity and required fields.');
      return;
    }
    setCampForm(emptyCamp);
    setNotice('Shelter details were saved and marked verified now.');
    await loadAdminData();
  }

  async function unpublishCamp(campId) {
    const { error: updateError } = await supabase.rpc('unpublish_relief_camp', {
      p_id: campId,
    });
    if (updateError) {
      console.error('Unable to unpublish relief camp', updateError);
      setError('The shelter record could not be unpublished.');
      return;
    }
    await loadAdminData();
  }

  if (!supabase) {
    return (
      <section className="camp-page admin-page">
        <div className="camp-heading">
          <p className="eyebrow">STAFF AREA</p>
          <h2>Administration</h2>
          <p>Connect the Supabase project before staff can sign in.</p>
        </div>
        <p className="backend-notice">
          Administrator access is unavailable until backend configuration is complete.
        </p>
      </section>
    );
  }

  if (authLoading || (user && adminState === 'checking')) {
    return <section className="camp-page"><p className="inline-status">Checking staff access…</p></section>;
  }

  if (!user) {
    return (
      <section className="camp-page admin-page">
        <div className="camp-heading">
          <p className="eyebrow">STAFF AREA</p>
          <h2>Administration</h2>
          <p>Sign in with an account that has been explicitly granted administrator access.</p>
        </div>
        <AdminLogin onSignedIn={setUser} />
      </section>
    );
  }

  if (adminState !== 'authorized') {
    return (
      <section className="camp-page admin-page">
        <div className="camp-heading">
          <p className="eyebrow">STAFF AREA</p>
          <h2>Access not approved</h2>
          <p>This account does not have relief administrator access.</p>
        </div>
        {error && <p className="form-message form-message-error" role="alert">{error}</p>}
        <button className="button button-outline" onClick={signOut}><LogOut size={16} />Sign out</button>
      </section>
    );
  }

  return (
    <section className="camp-page admin-page">
      <div className="admin-heading">
        <div className="camp-heading">
          <p className="eyebrow">PRIVATE STAFF AREA</p>
          <h2>Relief administration</h2>
          <p>Handle personal information carefully. Publish only details needed for a public notice.</p>
        </div>
        <button className="button button-outline" onClick={signOut}><LogOut size={16} />Sign out</button>
      </div>

      {error && <p className="form-message form-message-error" role="alert">{error}</p>}
      {notice && <p className="form-message form-message-success" role="status">{notice}</p>}
      {loadingData && <p className="inline-status">Loading private records…</p>}

      <section className="admin-section">
        <div className="subsection-heading">
          <h3>Missing-person reports ({reports.length})</h3>
          <p>Private reporter details are only visible here to approved administrators.</p>
        </div>
        {reports.length === 0 && !loadingData && <p className="inline-status">No reports are waiting for review.</p>}
        <div className="admin-record-list">
          {reports.map((report) => (
            <article className="admin-record" key={report.id}>
              <div className="admin-record-heading">
                <div>
                  <h4>{report.person_name}</h4>
                  <p>{report.district} · {report.last_seen_location} · {new Date(report.last_seen_at).toLocaleString()}</p>
                </div>
                <span className="district-badge">{report.status.replaceAll('_', ' ')}</span>
              </div>
              <p><strong>Approx. age:</strong> {report.approximate_age ?? 'Not provided'}</p>
              <p>{report.description}</p>
              <div className="private-contact">
                <strong>Reporter: {report.reporter_name}</strong>
                <a href={`tel:${report.reporter_phone}`}>{report.reporter_phone}</a>
                {report.reporter_email && <a href={`mailto:${report.reporter_email}`}>{report.reporter_email}</a>}
              </div>
              <p className="admin-private-note">
                Public listing consent: {report.publication_consent ? 'Yes' : 'No'}
              </p>
              <PublishNoticeForm report={report} onPublish={publishNotice} />
              <div className="admin-record-actions">
                {report.status === 'pending_review' && (
                  <button className="button button-outline" onClick={() => updateReportStatus(report.id, 'reviewed')}>Mark reviewed</button>
                )}
                {report.status !== 'resolved' && report.status !== 'rejected' && (
                  <button className="button button-outline" onClick={() => resolveReport(report.id)}>Mark resolved</button>
                )}
                {report.status === 'pending_review' && (
                  <button className="text-link" onClick={() => updateReportStatus(report.id, 'rejected')}>Reject report</button>
                )}
                <button className="text-link text-link-danger" onClick={() => deletePrivateRecord('missing_reports', report.id, 'report')}>Delete report</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="subsection-heading">
          <h3>Volunteer and supply offers ({offers.length})</h3>
          <p>Contact contributors directly; do not publish their phone numbers or email addresses.</p>
        </div>
        {offers.length === 0 && !loadingData && <p className="inline-status">No offers are waiting for review.</p>}
        <div className="admin-record-list">
          {offers.map((offer) => (
            <article className="admin-record" key={offer.id}>
              <div className="admin-record-heading">
                <div>
                  <h4>{offer.full_name} · {offer.offer_type}</h4>
                  <p>{offer.district} · {offer.availability}</p>
                </div>
                <span className="district-badge">{offer.status.replaceAll('_', ' ')}</span>
              </div>
              <p>{offer.details}</p>
              <div className="private-contact">
                <a href={`tel:${offer.phone}`}>{offer.phone}</a>
                {offer.email && <a href={`mailto:${offer.email}`}>{offer.email}</a>}
              </div>
              <div className="admin-record-actions">
                {offer.status === 'pending_review' && (
                  <button className="button button-outline" onClick={() => updateOfferStatus(offer.id, 'contacted')}>Mark contacted</button>
                )}
                {offer.status !== 'closed' && (
                  <button className="text-link" onClick={() => updateOfferStatus(offer.id, 'closed')}>Close offer</button>
                )}
                <button className="text-link text-link-danger" onClick={() => deletePrivateRecord('volunteer_offers', offer.id, 'offer')}>Delete offer</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="subsection-heading">
          <h3>Relief camp information ({camps.length})</h3>
          <p>Saving shelter information marks it verified for the next 24 hours.</p>
        </div>
        <form className="submission-form" onSubmit={saveCamp}>
          <div className="form-grid">
            <label>
              Shelter name <span>*</span>
              <input value={campForm.name} onChange={(event) => setCampForm({ ...campForm, name: event.target.value })} minLength="2" maxLength="120" required />
            </label>
            <label>
              District <span>*</span>
              <select value={campForm.district} onChange={(event) => setCampForm({ ...campForm, district: event.target.value })} required>
                <option value="">Choose a district</option>
                {districts.map((district) => <option key={district}>{district}</option>)}
              </select>
            </label>
            <label>
              Locality (avoid exact household addresses) <span>*</span>
              <input value={campForm.locality} onChange={(event) => setCampForm({ ...campForm, locality: event.target.value })} minLength="2" maxLength="160" required />
            </label>
            <label>
              Status <span>*</span>
              <select value={campForm.status} onChange={(event) => setCampForm({ ...campForm, status: event.target.value })}>
                <option value="open">Open</option>
                <option value="limited">Limited availability</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label>
              Capacity (optional)
              <input type="number" min="0" value={campForm.capacity} onChange={(event) => setCampForm({ ...campForm, capacity: event.target.value })} />
            </label>
            <label>
              Current occupancy (optional)
              <input type="number" min="0" value={campForm.current_occupancy} onChange={(event) => setCampForm({ ...campForm, current_occupancy: event.target.value })} />
            </label>
            <label className="form-field-wide">
              Supply information <span>*</span>
              <textarea value={campForm.supplies_summary} onChange={(event) => setCampForm({ ...campForm, supplies_summary: event.target.value })} minLength="2" maxLength="500" rows="3" required />
            </label>
            <label className="form-field-wide">
              Public travel or access notes (optional)
              <textarea value={campForm.public_notes} onChange={(event) => setCampForm({ ...campForm, public_notes: event.target.value })} maxLength="500" rows="3" />
            </label>
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={campForm.confirm_verified} onChange={(event) => setCampForm({ ...campForm, confirm_verified: event.target.checked })} required />
            <span>I have checked these details with an authorized local source and they are accurate now.</span>
          </label>
          <div className="admin-record-actions">
            <button className="button button-primary" type="submit">
              {campForm.id ? 'Update verified shelter' : 'Publish verified shelter'}
            </button>
            {campForm.id && <button className="button button-outline" type="button" onClick={() => setCampForm(emptyCamp)}>Cancel edit</button>}
          </div>
        </form>
        <div className="admin-record-list">
          {camps.map((camp) => (
            <article className="admin-record compact-record" key={camp.id}>
              <div className="admin-record-heading">
                <div>
                  <h4>{camp.name} · {camp.district}</h4>
                  <p>{camp.locality} · Last verified {new Date(camp.last_verified_at).toLocaleString()}</p>
                </div>
                <span className="district-badge">{camp.published ? 'Published' : 'Hidden'}</span>
              </div>
              <div className="admin-record-actions">
                <button className="button button-outline" onClick={() => selectCamp(camp)}>Edit and reverify</button>
                {camp.published && <button className="text-link" onClick={() => unpublishCamp(camp.id)}>Unpublish</button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="admin-caution">
        <ShieldAlert size={16} aria-hidden="true" />
        Share private records only with authorized responders and remove data that is no longer needed.
      </p>
    </section>
  );
}
