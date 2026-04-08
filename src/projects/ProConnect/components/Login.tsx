import React, { useState } from 'react';

interface LoginProps {
  onLogin: (role: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [step, setStep] = useState(1); 
  const [intendedRole, setIntendedRole] = useState('user'); // Default to user for standard
  const [accessType, setAccessType] = useState<'standard' | 'admin'>('standard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAccessSelection = (type: 'standard' | 'admin') => {
    setAccessType(type);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin specific credentials
    if (accessType === 'admin') {
      if (username === 'admin' && password === 'password123') {
        onLogin('admin');
      } else {
        alert('Invalid Administrative Credentials');
      }
      return;
    }

    // Standard user/pro login
    onLogin(intendedRole);
  };

  return (
    <div className="login-container">
      <div className="noise-overlay"></div>
      <div className="login-glass-card fade-in">
        
        <div style={{ marginBottom: '30px' }}>
          <span className="hero-dot" style={{ fontSize: '2rem', lineHeight: '1' }}>⠿</span>
          <h1 style={{ fontSize: '2rem', margin: '10px 0', fontWeight: '800', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>
            PROCONNECT<span className="hero-dot">.</span>
          </h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>
            {step === 1 ? 'Select Access Protocol' : 'Encrypted Handshake'}
          </p>
        </div>

        {step === 1 && (
          <div className="intent-selection fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button className="intent-card" onClick={() => handleAccessSelection('standard')}>
              <span className="intent-title">STANDARD ACCESS</span>
              <span className="intent-desc">Join as a Client or Professional Operator</span>
            </button>
            <button className="intent-card" onClick={() => handleAccessSelection('admin')} style={{ borderColor: 'rgba(255, 96, 0, 0.3)' }}>
              <span className="intent-title" style={{ color: 'var(--d-orange)' }}>SYSTEM GOVERNANCE</span>
              <span className="intent-desc">Administrative control & network oversight</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="fade-in" style={{ width: '100%' }}>
            <div style={{ textAlign: 'left', marginBottom: '15px', color: 'var(--d-orange)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
              PROTOCOL: {accessType === 'admin' ? 'ADMIN_OVERRIDE' : 'STANDARD_AUTH'}
            </div>

            {accessType === 'standard' && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                  type="button"
                  onClick={() => setIntendedRole('user')}
                  className={`role-btn ${intendedRole === 'user' ? 'primary' : ''}`}
                  style={{ flex: 1, fontSize: '0.7rem', padding: '10px' }}
                >
                  CLIENT
                </button>
                <button 
                  type="button"
                  onClick={() => setIntendedRole('pro')}
                  className={`role-btn ${intendedRole === 'pro' ? 'primary' : ''}`}
                  style={{ flex: 1, fontSize: '0.7rem', padding: '10px' }}
                >
                  PROFESSIONAL
                </button>
              </div>
            )}

            <input type="text" placeholder="Username" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="role-btn primary" style={{ width: '100%', marginTop: '10px' }}>AUTHENTICATE</button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--d-text-muted)', marginTop: '20px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ← Back to Selection
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
