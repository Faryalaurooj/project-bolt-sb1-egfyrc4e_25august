// Fire-and-forget auto-auth attempt on app load
// Tries to obtain a token silently via refresh or client credentials
(async () => {
  try {
    const resp = await fetch('http://localhost:5000/api/goto-connect/auto-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok && data.success) {
      console.log(`GoTo auto-auth successful (${data.mode})`);
    } else {
      // Do not interrupt UX; interactive auth may be needed later
      console.log('GoTo auto-auth not available (will authorize on demand).');
    }
  } catch (e) {
    console.log('GoTo auto-auth skipped:', e.message);
  }
})();
