import { networkAPI } from '../../api';
import { useState, useEffect } from 'react';
import Login from '../ProConnect/components/Login';

interface ServiceNode {
  id: number;
  title: string;
  provider: string;
  rate: string;
  desc: string;
}

export default function ProConnect() {
  const [isBooting, setIsBooting] = useState(false);
  const [bootText, setBootText] = useState("INITIALIZING SECURE CONNECTION...");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); 
  const [view, setView] = useState('marketplace'); 
  const [adminSubView, setAdminSubView] = useState<'nodes' | 'logs' | 'users'>('nodes');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPro, setSelectedPro] = useState<ServiceNode | null>(null);
  const [editingNode, setEditingNode] = useState<ServiceNode | null>(null);

  const [content, setContent] = useState<ServiceNode[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [networkUsers, setNetworkUsers] = useState<any[]>([]);

  // CONNECTED TO YOUR API.TS
  useEffect(() => {
    networkAPI.fetchNodes().then(data => setContent(data));
  }, []);

  useEffect(() => {
    if (userRole === 'admin') {
      fetch('/api/v1/network/logs').then(res => res.json()).then(setSystemLogs);
      fetch('/api/v1/network/users').then(res => res.json()).then(setNetworkUsers);
    }
  }, [userRole, view]);

  useEffect(() => {
    if (isBooting) {
      const t1 = setTimeout(() => setBootText("BYPASSING PUBLIC NODES..."), 800);
      const t2 = setTimeout(() => setBootText("ESTABLISHING ENCRYPTED TUNNEL..."), 1600);
      const t3 = setTimeout(() => setIsBooting(false), 2400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isBooting]);

  useEffect(() => {
    localStorage.setItem('proconnect_data_v4', JSON.stringify(content));
  }, [content]);

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsBooting(true);
    setIsLoggedIn(true);
    if (role === 'admin') setView('admin');
    else if (role === 'pro') setView('dashboard');
    else setView('marketplace');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setSelectedPro(null);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;
  
  if (isBooting) {
    return (
      <div className="boot-screen">
        <div>&gt; {bootText} <span className="blink">_</span></div>
      </div>
    );
  }

  return (
    <>
      <div className="noise-overlay"></div>

      <div className="premium-container fade-in">
        <nav className="premium-nav">
          <div className="nav-brand" onClick={() => {setView('marketplace'); setSelectedPro(null);}}>
            PROCONNECT<span className="hero-dot">.</span>
          </div>
          <div className="nav-links-container">
            {userRole === 'user' && <button className="nav-link" onClick={() => {setView('marketplace'); setSelectedPro(null);}}>The Directory</button>}
            {userRole === 'pro' && <button className="nav-link" onClick={() => setView('dashboard')}>Console</button>}
            {userRole === 'admin' && <button className="nav-link" onClick={() => setView('admin')}>Governance</button>}
            <button className="nav-link">FAQ</button>
            <button className="premium-btn-logout" onClick={handleLogout} style={{marginLeft: '20px', color: 'var(--d-orange)'}}>Exit</button>
          </div>
        </nav>

        <main className="premium-main">
          
          {/* USER MARKETPLACE */}
          {view === 'marketplace' && !selectedPro && (
            <div className="fade-in">
              <div className="cinematic-hero">
                <div className="hero-split-title">
                  <span>CONNECT</span>
                  <span>WITH ONE CLICK<span className="hero-dot">.</span></span>
                </div>
                <p className="hero-subtext">ProConnect prevents project delays by instantly matching you with<br/>verified top-tier professionals.</p>
                <button className="role-btn primary">SEARCH NETWORK</button>
                <div className="learn-more-prompt">Learn More <span style={{ fontSize: '1.2rem' }}>⌄</span></div>
              </div>

              <div style={{marginTop: '60px', display: 'flex', justifyContent: 'center'}}>
                 <input type="text" placeholder="Query expertise..." className="role-btn" style={{ maxWidth: '600px', textAlign: 'center' }} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              <div className="premium-grid">
                {content.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item, index) => (
                  <div key={item.id} className="premium-item-card" onClick={() => setSelectedPro(item)}>
                    <div className="category-tag">Node 0{index + 1}</div>
                    <h3 className="item-title">{item.title}</h3>
                    <p style={{ color: 'var(--d-text-muted)', marginBottom: '30px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Operator: {item.provider}</p>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}>{item.rate}</div>
                      <span style={{ color: 'var(--d-orange)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>Deploy ↗</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFESSIONAL DASHBOARD */}
          {view === 'dashboard' && (
            <div className="fade-in cinematic-dashboard-wrapper">
              <div className="cinematic-hero" style={{ minHeight: '30vh', marginBottom: '0' }}>
                <div className="hero-split-title" style={{ fontSize: '3.5vw', gap: '8vw' }}>
                  <span>OPERATOR</span>
                  <span>CONSOLE<span className="hero-dot">.</span></span>
                </div>
                <p className="hero-subtext" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>Deploy and manage your active nodes</p>
              </div>
              
              <div className="glass-panel">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}><span className="category-tag" style={{ justifyContent: 'center', margin: '0' }}>Initialize New Service</span></div>
                <form onSubmit={async (e: any) => {
                  e.preventDefault();
                  const newEntry = { 
                    title: e.target.title.value, 
                    provider: e.target.providerName.value, 
                    rate: `$${e.target.rate.value}/hr`, 
                    desc: e.target.desc.value 
                  };
                  
                  // UPDATED TO USE API.TS
                  try {
                    const deployedNode = await networkAPI.deployNode(newEntry);
                    setContent([deployedNode, ...content]);
                    e.target.reset();
                  } catch (err) {
                    console.error("Deployment failed:", err);
                  }
                }}>
                  <input name="providerName" type="text" placeholder="Operator Name" required className="glass-input" style={{ marginBottom: '15px' }}/>
                  <input name="title" type="text" placeholder="Service Nomenclature" required className="glass-input" style={{ marginBottom: '15px' }}/>
                  <input name="rate" type="number" placeholder="Hourly Rate ($)" required className="glass-input" style={{ marginBottom: '15px' }}/>
                  <input name="desc" placeholder="Technical Specifications" className="glass-input" style={{ height: '120px', resize: 'none', marginBottom: '15px' }} />
                  <button type="submit" className="role-btn primary" style={{ width: '100%', padding: '20px' }}>DEPLOY TO NETWORK</button>
                </form>
              </div>

              <div className="dashboard-stats">
                <div className="stat-box"><div className="stat-number">{content.length}</div><div style={{ color: 'var(--d-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Active Nodes</div></div>
                <div className="stat-box"><div className="stat-number">Optimal</div><div style={{ color: 'var(--d-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>System Status</div></div>
              </div>
            </div>
          )}

          {/* ADMIN GOVERNANCE */}
          {view === 'admin' && (
            <div className="fade-in">
              <div className="cinematic-hero" style={{ minHeight: '25vh', marginBottom: '40px' }}>
                <div className="hero-split-title" style={{ fontSize: '3vw', gap: '5vw' }}>
                  <span>SYSTEM</span>
                  <span>GOVERNANCE<span className="hero-dot">.</span></span>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                  <button onClick={() => setAdminSubView('nodes')} className={`nav-link ${adminSubView === 'nodes' ? 'active' : ''}`} style={{ fontSize: '0.7rem' }}>NODE_REGISTRY</button>
                  <button onClick={() => setAdminSubView('logs')} className={`nav-link ${adminSubView === 'logs' ? 'active' : ''}`} style={{ fontSize: '0.7rem' }}>SYSTEM_LOGS</button>
                  <button onClick={() => setAdminSubView('users')} className={`nav-link ${adminSubView === 'users' ? 'active' : ''}`} style={{ fontSize: '0.7rem' }}>USER_DATABASE</button>
                </div>
              </div>

              {adminSubView === 'nodes' && (
                <div className="premium-grid">
                  {content.map((item, index) => (
                    <div key={item.id} className="premium-item-card" style={{ borderColor: 'rgba(255, 96, 0, 0.2)' }}>
                      <div className="category-tag">Node 0{index + 1}</div>
                      {editingNode?.id === item.id ? (
                        <div className="fade-in">
                          <input className="glass-input" style={{ marginBottom: '10px' }} value={editingNode.title} onChange={e => setEditingNode({...editingNode, title: e.target.value})} />
                          <input className="glass-input" style={{ marginBottom: '10px' }} value={editingNode.rate} onChange={e => setEditingNode({...editingNode, rate: e.target.value})} />
                          <textarea className="glass-input" style={{ marginBottom: '10px', height: '80px' }} value={editingNode.desc} onChange={e => setEditingNode({...editingNode, desc: e.target.value})} />
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="role-btn primary" style={{ flex: 1, padding: '10px' }} onClick={() => {
                              fetch(`/api/v1/network/update/${item.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(editingNode)
                              }).then(res => res.json()).then(updated => {
                                setContent(content.map(n => n.id === updated.id ? updated : n));
                                setEditingNode(null);
                              });
                            }}>SAVE</button>
                            <button className="role-btn" style={{ flex: 1, padding: '10px' }} onClick={() => setEditingNode(null)}>CANCEL</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="item-title">{item.title}</h3>
                          <p style={{ color: 'var(--d-text-muted)', marginBottom: '30px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Operator: {item.provider}</p>
                          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button className="role-btn" style={{ flex: 1, padding: '10px', fontSize: '0.7rem' }} onClick={() => setEditingNode(item)}>EDIT_DATA</button>
                            <button className="role-btn primary" style={{ flex: 1, padding: '10px', background: '#ff3333', boxShadow: 'none', fontSize: '0.7rem' }} onClick={async () => {
                              // UPDATED TO USE API.TS
                              try {
                                await networkAPI.revokeNode(item.id);
                                setContent(content.filter(i => i.id !== item.id));
                              } catch (err) {
                                console.error("Revocation failed:", err);
                              }
                            }}>REVOKE</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {adminSubView === 'logs' && (
                <div className="glass-panel fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                  <div className="category-tag">Live System Logs</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
                    {systemLogs.map(log => (
                      <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <span><span style={{ color: 'var(--d-orange)' }}>[{log.action}]</span> {log.user} initiated sequence</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminSubView === 'users' && (
                <div className="glass-panel fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                  <div className="category-tag">Network User Database</div>
                  <table style={{ width: '100%', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--d-orange)' }}>
                        <th style={{ padding: '15px' }}>USERNAME</th>
                        <th style={{ padding: '15px' }}>ROLE</th>
                        <th style={{ padding: '15px' }}>STATUS</th>
                        <th style={{ padding: '15px' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {networkUsers.map(user => (
                        <tr key={user.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '15px' }}>{user.username}</td>
                          <td style={{ padding: '15px' }}>{user.role.toUpperCase()}</td>
                          <td style={{ padding: '15px' }}><span style={{ color: '#00ff00' }}>●</span> {user.status}</td>
                          <td style={{ padding: '15px' }}><button className="nav-link" style={{ fontSize: '0.6rem' }}>RESTRICT_ACCESS</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PROFILE DETAIL VIEW */}
          {selectedPro && (
            <div className="detail-view fade-in">
              <button className="nav-link" style={{ marginBottom: '40px' }} onClick={() => setSelectedPro(null)}>← Terminate Connection</button>
              <div style={{ borderTop: '1px solid var(--d-border)', paddingTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '60px' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <div className="category-tag">Node Specifications</div>
                  <h1 className="item-title" style={{ fontSize: '3rem', letterSpacing: '-1px' }}>{selectedPro.title}</h1>
                  <p style={{ fontSize: '1.2rem', margin: '20px 0', fontFamily: 'var(--font-mono)' }}>ID: <span style={{ color: 'var(--d-orange)' }}>{selectedPro.provider}</span></p>
                  <h2 style={{ fontSize: '2.5rem', marginTop: '40px', fontFamily: 'var(--font-mono)' }}>{selectedPro.rate}</h2>
                  <button className="role-btn primary" style={{ marginTop: '30px', padding: '24px' }} onClick={() => alert("Contract sequence initiated.")}>INITIATE CONTRACT</button>
                </div>
                <div style={{ flex: '1', minWidth: '300px', padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--d-border)' }}>
                  <div className="category-tag">Documentation</div>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--d-white)' }}>{selectedPro.desc}</p>
                  <div style={{ marginTop: '60px' }}>
                    <div className="category-tag">Encrypted Feedback</div>
                    <textarea placeholder="> Input log data..." className="glass-input" style={{ width: '100%', height: '120px', resize: 'none', marginBottom: '15px' }}></textarea>
                    <button className="role-btn" style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px' }} onClick={() => alert("Log transmitted securely.")}>SUBMIT LOG</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}