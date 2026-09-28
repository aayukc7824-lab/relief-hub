import React, { useEffect, useRef, useState } from 'react';
import { backendReady, turnstileSiteKey } from '../lib/supabase';

const SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export default function TurnstileField({ action, onToken }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!backendReady || !turnstileSiteKey || !containerRef.current) return undefined;

    let isMounted = true;
    const handleScriptError = () => setScriptError(true);
    const renderWidget = () => {
      if (!isMounted || !window.turnstile || !containerRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        action,
        callback: onToken,
        'expired-callback': () => onToken(null),
        'error-callback': () => {
          onToken(null);
          setScriptError(true);
        },
      });
    };

    let script = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (window.turnstile) {
      renderWidget();
    } else {
      if (!script) {
        script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = 'true';
        document.head.append(script);
      }
      script.addEventListener('load', renderWidget);
      script.addEventListener('error', handleScriptError, { once: true });
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      script?.removeEventListener('load', renderWidget);
      script?.removeEventListener('error', handleScriptError);
    };
  }, [action, onToken]);

  if (!backendReady || !turnstileSiteKey) {
    return (
      <p className="turnstile-message">
        The secure verification service has not been configured yet.
      </p>
    );
  }

  return (
    <div className="turnstile-field">
      <div ref={containerRef} />
      <p className="turnstile-message">Security verification is provided by Cloudflare.</p>
      {scriptError && (
        <p className="form-message form-message-error" role="alert">
          Security verification could not load. Check your connection and try again.
        </p>
      )}
    </div>
  );
}
