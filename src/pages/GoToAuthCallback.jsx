import React, { useEffect, useState } from 'react';

function GoToAuthCallback() {
  const [status, setStatus] = useState('Processing authorization...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const err = params.get('error');
    const errDesc = params.get('error_description');

    if (err) {
      setError(errDesc || err);
      setStatus('Authorization failed');
      // Notify opener if this is a popup
      if (window.opener) {
        window.opener.postMessage({ type: 'goto_auth_error', error: errDesc || err }, '*');
        window.close();
      }
      return;
    }

    if (!code) {
      setError('Missing authorization code');
      setStatus('Authorization failed');
      return;
    }

    async function exchangeCode() {
      try {
        setStatus('Exchanging authorization code...');
        const redirectUri = window.location.origin; // Must match the value used to start auth
        const resp = await fetch('http://localhost:5000/api/goto-connect/exchange-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirect_uri: redirectUri })
        });
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data.error || 'Exchange failed');
        }
        setStatus('Authorization successful! You can close this window.');
        // Notify opener if popup
        if (window.opener) {
          window.opener.postMessage({ type: 'goto_auth_success', data: data.data }, '*');
          setTimeout(() => window.close(), 300);
        } else {
          // Navigate back to app root after short delay
          setTimeout(() => {
            window.location.replace('/');
          }, 1000);
        }
      } catch (e) {
        setError(e.message);
        setStatus('Authorization failed');
        if (window.opener) {
          window.opener.postMessage({ type: 'goto_auth_error', error: e.message }, '*');
          setTimeout(() => window.close(), 500);
        }
      }
    }

    exchangeCode();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-2">GoTo Connect Authorization</h2>
        <p className={`mb-4 ${error ? 'text-red-600' : 'text-gray-700'}`}>{status}</p>
        {error && (
          <div className="text-sm text-red-500 break-words">{error}</div>
        )}
      </div>
    </div>
  );
}

export default GoToAuthCallback;
