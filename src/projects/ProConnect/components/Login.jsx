import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [view, setView] = useState('login');
  const [intendedRole, setIntendedRole] = useState('user');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sysError, setSysError] = useState(null);

  const getThematicError = (error) => {
    if (error.includes('INVALID_CREDENTIALS') || error.includes('password') || error.toLowerCase().includes('failed')) {
      return '[!] ERR_AUTH_FAILURE: INVALID_CREDENTIALS';
    }
    if (error.includes('not found') || error.includes('TARGET_NODE')) {
      return '[!] ERR_404: TARGET_NODE_NOT_FOUND';
    }
    return `[!] ERR_SYSTEM: ${error.toUpperCase().replace(/\s+/g, '_')}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSysError(null);
    
    try {
      const res = await fetch('/api/v1/network/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        // If in admin mode, ensure the role is actually admin
        if (isAdminMode && data.role !== 'admin') {
          setSysError('[!] ERR_PERMISSION: INSUFFICIENT_CLEARANCE_LEVEL');
          return;
        }
        onLogin({ role: data.role, username: data.username });
      } else {
        const data = await res.json();
        setSysError(getThematicError(data.error || 'Authentication failure'));
      }
    } catch (err) {
      setSysError('[!] ERR_NETWORK: UPLINK_INTERRUPTED_BY_GHOST_SIGNAL');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSysError(null);

    try {
      const res = await fetch('/api/v1/network/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: intendedRole })
      });

      if (res.ok) {
        setSysError(null);
        alert('Registration successful. Please login.');
        setView('login');
        setUsername('');
        setPassword('');
      } else {
        const data = await res.json();
        setSysError(getThematicError(data.error || 'Registration failed'));
      }
    } catch (err) {
      setSysError('[!] ERR_NETWORK: REGISTRATION_PACKET_LOSS');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="app-bg-container">
        <div className="grid-background"></div>
      </div>
      <div className="noise-overlay"></div>
      <div className="login-glass-card fade-in">
        
        <div style={{ marginBottom: '30px' }}>
          <span className="hero-dot" style={{ fontSize: '2rem', lineHeight: '1' }}>⠿</span>
          <h1 style={{ fontSize: '2rem', margin: '10px 0', fontWeight: '800', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>
            PROCONNECT<span className="hero-dot">.</span>
          </h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>
            {view === 'login' ? 'Encrypted Handshake' : view === 'selection' ? 'Select Access Protocol' : 'Node Registration'}
          </p>
        </div>

        {sysError && (
          <div className="terminal-error-banner fade-in">
            <p className="terminal-error-text">
              {sysError}
              <span className="terminal-cursor"></span>
            </p>
          </div>
        )}

        {view === 'login' && (
          <form onSubmit={handleLogin} className="fade-in" style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button 
                type="button"
                onClick={() => setIsAdminMode(false)}
                className={`role-btn ${!isAdminMode ? 'primary' : ''}`}
                style={{ flex: 1, fontSize: '0.7rem', padding: '10px' }}
              >
                STANDARD
              </button>
              <button 
                type="button"
                onClick={() => setIsAdminMode(true)}
                className={`role-btn ${isAdminMode ? 'primary' : ''}`}
                style={{ flex: 1, fontSize: '0.7rem', padding: '10px', borderColor: isAdminMode ? 'var(--d-orange)' : 'rgba(255,255,255,0.1)' }}
              >
                ADMIN
              </button>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '15px', color: 'var(--d-orange)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
              PROTOCOL: {isAdminMode ? 'ADMIN_OVERRIDE' : 'STANDARD_AUTH'}
            </div>

            <input type="text" placeholder="Username" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            
            <button type="submit" className="role-btn primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
              {isSubmitting ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>

            <button type="button" onClick={() => setView('selection')} style={{ background: 'none', border: 'none', color: 'var(--d-text-muted)', marginTop: '20px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', width: '100%' }}>
              New Node? Register Here
            </button>
          </form>
        )}

        {view === 'selection' && (
          <div className="intent-selection fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button className="intent-card" onClick={() => { setIntendedRole('user'); setView('register'); }}>
              <span className="intent-title">HIRE TALENT</span>
              <span className="intent-desc">Join as a Client to deploy professionals</span>
            </button>
            <button className="intent-card" onClick={() => { setIntendedRole('pro'); setView('register'); }}>
              <span className="intent-title">OFFER EXPERTISE</span>
              <span className="intent-desc">Join as a Professional Operator</span>
            </button>
            <button type="button" onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: 'var(--d-text-muted)', marginTop: '10px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ← Back to Login
            </button>
          </div>
        )}

        {view === 'register' && (
          <form onSubmit={handleRegister} className="fade-in" style={{ width: '100%' }}>
            <div style={{ textAlign: 'left', marginBottom: '15px', color: 'var(--d-orange)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
              ROLE: {intendedRole === 'user' ? 'CLIENT' : 'PROFESSIONAL'}
            </div>
            
            <input type="text" placeholder="Choose Username" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Choose Password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            
            <button type="submit" className="role-btn primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
              {isSubmitting ? 'REGISTERING...' : 'COMPLETE REGISTRATION'}
            </button>

            <button type="button" onClick={() => setView('selection')} style={{ background: 'none', border: 'none', color: 'var(--d-text-muted)', marginTop: '20px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', width: '100%' }}>
              ← Change Role
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
