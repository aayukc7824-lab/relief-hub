import React, { useState } from 'react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import TurnstileField from './TurnstileField';
import { backendReady, supabase } from '../lib/supabase';

const initialForm = {
  full_name: '',
  phone: '',
  email: '',
  offer_type: '',
  district: '',
  availability: '',
  details: '',
  consent_to_contact: false,
};

export default function VolunteerOffers() {
  const [form, setForm] = useState(initialForm);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [widgetVersion, setWidgetVersion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function submitOffer(event) {
    event.preventDefault();
    setMessage(null);
    if (!supabase || !backendReady || !turnstileToken) {
      setMessage({
        type: 'error',
        text: 'Secure offer registration is not ready. Nothing was sent.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'submit-volunteer-offer',
        { body: { ...form, turnstile_token: turnstileToken } },
      );

      if (error) {
        console.error('Volunteer offer submission failed', error);
        setMessage({
          type: 'error',
          text: error.message || 'Your offer could not be sent. Please try again.',
        });
      } else if (typeof data?.message === 'string') {
        setForm(initialForm);
        setMessage({ type: 'success', text: data.message });
        setTurnstileToken(null);
        setWidgetVersion((version) => version + 1);
      } else {
        console.error('Volunteer offer response did not include a confirmation message');
        setMessage({
          type: 'error',
          text: 'The server did not confirm the offer was saved.',
        });
      }
    } catch (error) {
      console.error('Volunteer offer submission failed unexpectedly', error);
      setMessage({
        type: 'error',
        text: 'Your offer could not be sent. Nothing was confirmed as saved.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="camp-page offer-page">
      <div className="camp-heading">
        <p className="eyebrow">DONATE &amp; VOLUNTEER</p>
        <h2>Offer help to local response efforts</h2>
        <p>
          Tell us what you can offer and where. An authorized administrator
          reviews offers before following up. This form does not accept money
          or arrange field deployments.
        </p>
      </div>

      <div className="report-safety-note">
        <ShieldCheck size={19} aria-hidden="true" />
        <p>
          <strong>Never send money or enter flood-affected areas through an unverified request.</strong>
          Confirm current needs with recognized local organizations.
        </p>
      </div>

      <div className="offer-guidance">
        <div>
          <HeartHandshake size={20} aria-hidden="true" />
          <p><strong>Material support</strong><span>List supplies you can provide; do not send cash through this site.</span></p>
        </div>
        <div>
          <ShieldCheck size={20} aria-hidden="true" />
          <p><strong>People and skills</strong><span>Share your availability and relevant experience. Wait for confirmation before travelling.</span></p>
        </div>
      </div>

      <form className="submission-form" onSubmit={submitOffer}>
        <div className="subsection-heading">
          <h3>Register an offer</h3>
          <p>Your contact details are private and used only to follow up on this offer.</p>
        </div>
        {!backendReady && (
          <div className="backend-notice" role="status">
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <strong>Secure registration is not set up yet.</strong>
              <p>Do not enter personal details until the service is configured.</p>
            </div>
          </div>
        )}
        <fieldset disabled={!backendReady || isSubmitting}>
          <legend className="form-legend">Your contact information and offer</legend>
          <div className="form-grid">
            <label>
              Full name <span>*</span>
              <input name="full_name" autoComplete="name" minLength="2" maxLength="100" value={form.full_name} onChange={updateField} required />
            </label>
            <label>
              Phone number <span>*</span>
              <input name="phone" type="tel" autoComplete="tel" minLength="7" maxLength="30" value={form.phone} onChange={updateField} required />
            </label>
            <label>
              Email address (optional)
              <input name="email" type="email" autoComplete="email" maxLength="254" value={form.email} onChange={updateField} />
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
              Type of offer <span>*</span>
              <select name="offer_type" value={form.offer_type} onChange={updateField} required>
                <option value="">Choose an offer type</option>
                <option value="volunteer">Volunteer time or skills</option>
                <option value="supplies">Relief supplies</option>
                <option value="medical">Medical support</option>
                <option value="transport">Transport or logistics</option>
                <option value="other">Other practical help</option>
              </select>
            </label>
            <label>
              Availability <span>*</span>
              <input name="availability" placeholder="For example, weekdays after 3 pm" maxLength="120" value={form.availability} onChange={updateField} required />
            </label>
            <label className="form-field-wide">
              What can you offer? <span>*</span>
              <textarea name="details" minLength="10" maxLength="1000" rows="4" value={form.details} onChange={updateField} required />
            </label>
          </div>
          <label className="checkbox-label">
            <input name="consent_to_contact" type="checkbox" checked={form.consent_to_contact} onChange={updateField} required />
            <span>I agree that an authorized administrator may store my contact details privately and contact me about this offer.</span>
          </label>
        </fieldset>
        <TurnstileField
          key={`volunteer-${widgetVersion}`}
          action="volunteer_offer"
          onToken={setTurnstileToken}
        />
        <fieldset disabled={!backendReady || isSubmitting}>
          <button className="button button-primary" type="submit" disabled={!turnstileToken || isSubmitting}>
            {isSubmitting ? 'Sending offer…' : 'Send offer for review'}
          </button>
        </fieldset>
        {message && (
          <p className={`form-message form-message-${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
            {message.text}
          </p>
        )}
      </form>
    </section>
  );
}
