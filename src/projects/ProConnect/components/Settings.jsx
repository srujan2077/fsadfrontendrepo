import { useState } from 'react';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';

const Settings = ({ currentUser, theme, setTheme }) => {
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [sysError, setSysError] = useState(null);

  const handleUpdate = (e) => {
    e.preventDefault();
    setStatus(null);
    setSysError(null);

    fetch('/api/v1/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser.username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setStatus('success');
        setPassword('');
      } else {
        setSysError('[!] ERR_SYNC_FAILURE: DATA_NODE_REJECTED_PAYLOAD');
      }
    })
    .catch(err => {
      console.error("Update failed:", err);
      setSysError('[!] ERR_UPLINK: CONNECTION_RESET_BY_PEER');
    });
  };

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="dashboard-title">ACCOUNT_SETTINGS</h1>
          <p style={{ color: 'var(--d-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            {/* ESCAPED CHARACTER BELOW */}
            {">"} MODIFY_ACCESS_CREDENTIALS
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <ShieldCheck color="var(--d-orange)" size={20} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--d-orange)' }}>ENCRYPTED_PORTAL_V4.2</span>
        </div>

        {sysError && (
          <div className="terminal-error-banner fade-in" style={{ marginBottom: '25px' }}>
            <p className="terminal-error-text">
              {sysError}
              <span className="terminal-cursor"></span>
            </p>
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Identifier</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
              <input 
                type="text" 
                value={username} 
                disabled 
                className="glass-input" 
                style={{ paddingLeft: '45px', opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>New Access Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-orange)' }} />
              <input 
                type="password" 
                placeholder="Enter new master password" 
                required 
                className="glass-input" 
                style={{ paddingLeft: '45px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="role-btn primary" style={{ width: '100%', padding: '15px' }}>
            <Save size={16} style={{ marginRight: '10px' }} /> UPDATE_CREDENTIALS
          </button>
        </form>

        {status === 'success' && (
          <div className="fade-in" style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 255, 0, 0.1)', border: '1px solid rgba(0, 255, 0, 0.2)', color: '#00ff00', fontSize: '0.8rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            ✓ CREDENTIALS_UPDATED_SUCCESSFULLY
          </div>
        )}
      </div>

      <div className="glass-panel">
        <div className="category-tag">SYSTEM_PREFERENCES</div>
        <div style={{ marginTop: '10px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
            {/* ESCAPED CHARACTER BELOW */}
            {">"} SELECT_AESTHETIC_PROTOCOL
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button 
              className={`role-btn ${theme === 'dark' ? 'primary' : ''}`} 
              style={{ padding: '12px' }}
              onClick={() => setTheme('dark')}
            >
              DARK
            </button>
            <button 
              className={`role-btn ${theme === 'light' ? 'primary' : ''}`} 
              style={{ padding: '12px' }}
              onClick={() => setTheme('light')}
            >
              LIGHT
            </button>
            <button 
              className={`role-btn ${theme === 'multiverse' ? 'primary' : ''}`} 
              style={{ padding: '12px' }}
              onClick={() => setTheme('multiverse')}
            >
              MULTIVERSE
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid var(--d-border)' }}>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem', textAlign: 'center', fontFamily: 'var(--font-mono)', lineHeight: '1.5' }}>
          SECURITY_NOTICE: Account deletion is handled via the Governance Board. Please initiate a revocation request if you wish to terminate your network presence.
        </p>
      </div>
    </div>
  );
};

export default Settings;