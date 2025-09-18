import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OAuthCallback() {
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          setError(`OAuth Error: ${error} - ${errorDescription}`);
          setStatus('OAuth failed');
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setStatus('OAuth failed');
          return;
        }

        setStatus('Exchanging authorization code for access token...');

        // Exchange code for access token
        const response = await fetch('http://localhost:3001/api/goto-connect/exchange-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: 'http://localhost:5173'
          })
        });

        const data = await response.json();

        if (data.success) {
          setStatus('✅ OAuth completed successfully!');
          setError(null);
          
          // Store token info in localStorage for demo purposes
          localStorage.setItem('gotoConnectToken', JSON.stringify({
            access_token: data.data.access_token,
            token_type: data.data.token_type,
            expires_in: data.data.expires_in,
            scope: data.data.scope,
            principal: data.data.principal,
            timestamp: new Date().toISOString()
          }));

          // Redirect to contacts page after 2 seconds
          setTimeout(() => {
            navigate('/contacts');
          }, 2000);
        } else {
          setError(`Token exchange failed: ${data.error}`);
          setStatus('OAuth failed');
        }
      } catch (err) {
        setError(`Network error: ${err.message}`);
        setStatus('OAuth failed');
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            GoTo Connect OAuth
          </h1>
          
          <p className="text-gray-600 mb-4">
            {status}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {status.includes('successfully') && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <p className="text-green-800 text-sm">
                Access token stored successfully. Redirecting to contacts page...
              </p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => navigate('/contacts')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OAuthCallback;
