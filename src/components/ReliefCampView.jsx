import React, { useEffect, useState } from 'react';
import { AlertTriangle, Building2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

function EmptyCamps({ message }) {
  return (
    <div className="empty-state">
      <Building2 size={22} aria-hidden="true" />
      <strong>{message}</strong>
      <span>
        Do not travel based on old or unverified information. Contact local authorities for current arrangements.
      </span>
    </div>
  );
}

export default function ReliefCampView() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    async function loadCamps() {
      setLoading(true);
      setError('');
      const { data, error: queryError } = await supabase
        .from('active_relief_camps')
        .select('id, name, district, locality, capacity, current_occupancy, supplies_summary, status, public_notes, last_verified_at')
        .order('last_verified_at', { ascending: false });

      if (!active) return;
      if (queryError) {
        console.error('Unable to load verified relief camps', queryError);
        setError('Shelter information could not be loaded right now.');
      } else {
        setCamps(data ?? []);
      }
      setLoading(false);
    }

    loadCamps();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="camp-page">
      <div className="camp-heading">
        <p className="eyebrow">SHELTER INFORMATION</p>
        <h2>Relief camps</h2>
        <p>
          Only shelters verified by an administrator in the past 24 hours are
          shown. Call ahead and confirm local conditions before travelling.
        </p>
      </div>

      {!supabase && (
        <EmptyCamps message="Live shelter information is not connected yet." />
      )}
      {loading && <p className="inline-status">Loading verified shelter information…</p>}
      {error && <p className="form-message form-message-error" role="alert">{error}</p>}
      {supabase && !loading && !error && camps.length === 0 && (
        <EmptyCamps message="No recently verified shelters are published." />
      )}
      {camps.length > 0 && (
        <div className="camp-grid">
          {camps.map((camp) => (
            <article className="camp-card live-camp-card" key={camp.id}>
              <div className="live-camp-heading">
                <div>
                  <h3>{camp.name}</h3>
                  <p>{camp.locality}, {camp.district}</p>
                </div>
                <span className={`camp-state camp-state-${camp.status}`}>
                  {camp.status === 'open' ? 'Open' : 'Limited'}
                </span>
              </div>
              <div className="camp-detail">
                <span><Users size={16} aria-hidden="true" />Occupancy</span>
                <strong>
                  {camp.current_occupancy == null || camp.capacity == null
                    ? 'Not reported'
                    : `${camp.current_occupancy} / ${camp.capacity}`}
                </strong>
              </div>
              <div className="camp-detail">
                <span><Building2 size={16} aria-hidden="true" />Supplies</span>
                <strong>{camp.supplies_summary}</strong>
              </div>
              {camp.public_notes && <p className="camp-public-notes">{camp.public_notes}</p>}
              <p className="camp-verified">
                <AlertTriangle size={15} aria-hidden="true" />
                Last checked {new Date(camp.last_verified_at).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
