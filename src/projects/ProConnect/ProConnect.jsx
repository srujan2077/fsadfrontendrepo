import { useState, useEffect, useRef } from 'react';
import { Star, Briefcase, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from '../ProConnect/components/Login';
import Chat from '../ProConnect/components/Chat';
import JobBoard from '../ProConnect/components/JobBoard';
import Settings from '../ProConnect/components/Settings';

// SPRING BOOT UPLINK CONFIGURATION
const API_BASE = "https://proconnect-backend-rejr.onrender.com/api/v1";
export default function ProConnect() {
  const [isBooting, setIsBooting] = useState(false);
  const [bootText, setBootText] = useState("INITIALIZING SECURE CONNECTION...");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 
  const [view, setView] = useState('marketplace'); 
  const [adminSubView, setAdminSubView] = useState('nodes');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPro, setSelectedPro] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [chatInitialContact, setChatInitialContact] = useState(null);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('proconnect_theme') || 'dark');
  const [isGlitching, setIsGlitching] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const listingsRef = useRef(null);
  const searchInputRef = useRef(null);

  const [content, setContent] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [networkUsers, setNetworkUsers] = useState([]);

  useEffect(() => {
    // Clean up existing theme classes
    document.body.classList.remove('light-theme', 'multiverse-theme');
    
    // Add current theme class if it's not dark
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else if (theme === 'multiverse') {
      document.body.classList.add('multiverse-theme');
      triggerGlitch();
    }
    
    localStorage.setItem('proconnect_theme', theme);
  }, [theme]);

  useEffect(() => {
    // SPRING BOOT: Fetching nodes from your local MySQL via Java
    fetch(`${API_BASE}/network/nodes`)
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error("Failed to fetch nodes:", err));
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      // SPRING BOOT: Admin Data Uplinks
      fetch(`${API_BASE}/network/logs`).then(res => res.json()).then(setSystemLogs);
      fetch(`${API_BASE}/network/users`).then(res => res.json()).then(setNetworkUsers);
    }
  }, [currentUser, view]);

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

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsBooting(true);
    setIsLoggedIn(true);
    if (userData.role === 'admin') setView('admin');
    else if (userData.role === 'pro') setView('dashboard');
    else setView('marketplace');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedPro(null);
  };

  const triggerGlitch = () => {
    if (theme === 'multiverse') {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
    }
  };

  const showSystemNotification = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  const changeView = (v) => {
    triggerGlitch();
    setView(v);
  };

  const TiltCard = ({ children, className, onClick }) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    
    if (theme !== 'multiverse') {
      return <div className={className} onClick={onClick}>{children}</div>;
    }

    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
      setTilt({ x, y });
    };

    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    return (
      <div 
        className={className} 
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) rotateZ(-1deg)`,
          transition: 'transform 0.1s steps(4)'
        }}
      >
        {children}
      </div>
    );
  };

  const ThemeToast = ({ type, theme }) => {
    if (!type) return null;

    let message = type;
    if (type === 'REQUEST_BROADCASTED') {
      if (theme === 'dark') message = '[!] BROADCAST_SUCCESS: NODE_ONLINE';
      else if (theme === 'light') message = 'Project broadcasted successfully';
      else if (theme === 'multiverse') message = 'REQUEST_LIVE!';
    } else {
      // Normalize other notifications
      message = type.replace(/_/g, ' ');
    }

    const variants = {
      initial: theme === 'multiverse' ? { scale: 0, opacity: 0 } : { x: 100, opacity: 0 },
      animate: theme === 'multiverse' ? { scale: 1, opacity: 1 } : { x: 0, opacity: 1 },
      exit: theme === 'multiverse' ? { scale: 0, opacity: 0, rotate: 10 } : { x: 100, opacity: 0 },
    };

    const getStyles = () => {
      if (theme === 'multiverse') {
        return {
          background: 'white',
          color: 'black',
          border: '4px solid black',
          padding: '15px 25px',
          fontWeight: '900',
          fontSize: '1.2rem',
          boxShadow: '10px 10px 0px #ff00ff, -5px -5px 0px #00ffff',
          borderRadius: '2px',
          textTransform: 'uppercase',
          fontStyle: 'italic'
        };
      }
      if (theme === 'light') {
        return {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.1)',
          color: '#333',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-sans)',
          fontWeight: '500'
        };
      }
      // Dark / NOC
      return {
        background: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        borderLeft: '4px solid var(--d-orange)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        color: 'var(--d-orange)',
        padding: '15px 20px',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '1px'
      };
    };

    return (
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          position: 'fixed',
          top: '30px',
          right: '30px',
          zIndex: 10000,
          ...getStyles()
        }}
      >
        {theme === 'multiverse' && (
          <div style={{ position: 'absolute', bottom: '-15px', left: '20px', width: 0, height: 0, borderTop: '15px solid black', borderRight: '15px solid transparent' }} />
        )}
        {message}
      </motion.div>
    );
  };

  const RatingStars = ({ rating, count, size = 14 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star} 
          size={size} 
          fill={star <= Math.round(rating) ? "var(--d-orange)" : "none"} 
          color={star <= Math.round(rating) ? "var(--d-orange)" : "rgba(255,255,255,0.2)"} 
        />
      ))}
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px', fontFamily: 'var(--font-mono)' }}>
        ({rating || 0.0}) {count !== undefined && <span style={{ opacity: 0.6 }}>• {count} REVIEWS</span>}
      </span>
    </div>
  );

  const pageTransition = {
    initial: { opacity: 0, scale: 0.98, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.02, y: -10 },
    transition: { type: 'spring', damping: 25, stiffness: 300 }
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
      <div className="app-bg-container">
        <div className="grid-background"></div>
      </div>

      <div className="premium-container">
        <AnimatePresence>
          {notification && <ThemeToast type={notification} theme={theme} />}
        </AnimatePresence>
        <nav className="premium-nav">
          <div className="nav-brand" onClick={() => {
            if (currentUser?.role === 'pro') changeView('dashboard');
            else changeView('marketplace');
            setSelectedPro(null);
          }}>
            PROCONNECT<span className="hero-dot">.</span>
          </div>
          <div className="nav-links-container">
            {currentUser?.role === 'pro' && <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => changeView('dashboard')}>Console</button>}
            {currentUser?.role === 'user' && <button className={`nav-link ${view === 'marketplace' ? 'active' : ''}`} onClick={() => {changeView('marketplace'); setSelectedPro(null);}}>Console</button>}
            <button className={`nav-link ${view === 'job-board' ? 'active' : ''}`} onClick={() => {changeView('job-board'); setSelectedPro(null);}}>Job Board</button>
            {currentUser?.role === 'admin' && <button className={`nav-link ${view === 'admin' ? 'active' : ''}`} onClick={() => changeView('admin')}>Governance</button>}
            <button className={`nav-link ${view === 'messaging' ? 'active' : ''}`} onClick={() => changeView('messaging')}>Messaging</button>
            <button className={`nav-link ${view === 'settings' ? 'active' : ''}`} onClick={() => changeView('settings')}>Settings</button>
            <button className="nav-link">FAQ</button>
            <button className="premium-btn-logout" onClick={handleLogout} style={{marginLeft: '20px', color: 'var(--d-orange)'}}>Exit</button>
          </div>
        </nav>

        <main className={`premium-main ${isGlitching ? 'glitch-active' : ''}`}>
          <AnimatePresence mode="wait">
            {/* USER MARKETPLACE */}
            {view === 'marketplace' && !selectedPro && (
              <motion.div key="marketplace" {...pageTransition}>
                <div className="cinematic-hero">
                  <div className="hero-split-title">
                    <span>CONNECT</span>
                    <span>WITH ONE CLICK<span className="hero-dot">.</span></span>
                  </div>
                  <p className="hero-subtext">ProConnect prevents project delays by instantly matching you with<br/>verified top-tier professionals.</p>
                  <button 
                    className="role-btn primary" 
                    onClick={() => {
                      listingsRef.current?.scrollIntoView({ behavior: 'smooth' });
                      setTimeout(() => searchInputRef.current?.focus(), 800);
                    }}
                  >
                    SEARCH NETWORK
                  </button>
                  <div className="learn-more-prompt">Learn More <span style={{ fontSize: '1.2rem' }}>⌄</span></div>
                </div>

                <div ref={listingsRef} style={{marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'}}>
                  <div className="filter-bar">
                    {['ALL', 'DEVELOPMENT', 'DESIGN', 'SECURITY', 'DATA'].map(cat => (
                      <button 
                         key={cat} 
                         className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                         onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Query expertise..." 
                    className="role-btn" 
                    style={{ maxWidth: '600px', textAlign: 'center' }} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>

                <div className="premium-grid">
                  {content.filter(item => {
                    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
                    return matchesSearch && matchesCategory;
                  }).map((item, index) => (
                    <motion.div 
                      layout
                      key={item.id} 
                      className="tilt-card-wrapper"
                      style={{ display: 'contents' }}
                    >
                      <TiltCard 
                        className="premium-item-card" 
                        onClick={() => setSelectedPro(item)}
                      >
                        <div className="category-tag">{item.category || `Node 0${index + 1}`}</div>
                        <h3 className="item-title">{item.title}</h3>
                        <RatingStars rating={item.rating} count={item.reviewCount} />
                        <div className="skill-pills-container">
                          {(item.tags || []).slice(0, 3).map((tag, i) => (
                            <span key={i} className="skill-pill">{tag}</span>
                          ))}
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.desc}</p>
                        <div style={{ marginTop: 'auto', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}>{item.rate}</div>
                          <span style={{ color: 'var(--d-orange)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>Deploy ↗</span>
                        </div>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'job-board' && (
              <motion.div key="job-board" {...pageTransition}>
                <JobBoard 
                  currentUser={currentUser} 
                  onNotify={showSystemNotification}
                  onClaimContract={(clientId) => {
                    showSystemNotification("CONTRACT_CLAIMED");
                    setChatInitialContact(clientId);
                    setView('messaging');
                  }}
                />
              </motion.div>
            )}

            {/* PROFESSIONAL DASHBOARD */}
            {view === 'dashboard' && (
              <motion.div key="dashboard" {...pageTransition} className="cinematic-dashboard-wrapper">
                <div className="cinematic-hero" style={{ minHeight: '20vh', marginBottom: '20px' }}>
                  <div className="hero-split-title" style={{ fontSize: '3.5vw', gap: '8vw' }}>
                    <span>OPERATOR</span>
                    <span>CONSOLE<span className="hero-dot">.</span></span>
                  </div>
                  <p className="hero-subtext" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>Network Operations Center</p>
                </div>

                {/* ACTION BAR */}
                <TiltCard className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>SERVICE_ORCHESTRATION</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Initialize new capability nodes on the public network.</p>
                  </div>
                  <button 
                    className="role-btn primary" 
                    style={{ width: 'auto', padding: '15px 40px', fontSize: '0.9rem', fontWeight: 'bold' }}
                    onClick={() => setShowDeployForm(!showDeployForm)}
                  >
                    {showDeployForm ? '🗙 CLOSE_WIZARD' : '⚡ OFFER EXPERTISE'}
                  </button>
                </TiltCard>
                
                {showDeployForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="glass-panel" style={{ marginBottom: '40px', overflow: 'hidden' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}><span className="category-tag" style={{ justifyContent: 'center', margin: '0' }}>Initialize New Service Node</span></div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const newEntry = { 
                        title: e.target.title.value, 
                        provider: e.target.providerDisplayName.value, 
                        ownerAccountId: currentUser.username,
                        rate: `$${e.target.rate.value}/hr`, 
                        desc: e.target.desc.value,
                        category: e.target.category.value,
                        tags: e.target.tags.value.split(',').map(t => t.trim()).filter(t => t)
                      };
                      
                      fetch(`${API_BASE}/network/deploy`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newEntry)
                      })
                      .then(res => res.json())
                      .then(deployedNode => {
                        setContent([deployedNode, ...content]);
                        e.target.reset();
                        setShowDeployForm(false);
                        showSystemNotification("SERVICE_DEPLOYED");
                      })
                      .catch(err => console.error("Deployment failed:", err));
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <input name="providerDisplayName" type="text" placeholder="Service Display Name" required className="glass-input" />
                        <select name="category" className="glass-input" required defaultValue="DEVELOPMENT">
                          <option value="DEVELOPMENT">DEVELOPMENT</option>
                          <option value="DESIGN">DESIGN</option>
                          <option value="SECURITY">SECURITY</option>
                          <option value="DATA">DATA</option>
                        </select>
                      </div>
                      <input name="title" type="text" placeholder="Service Nomenclature (e.g. Senior Logic Architect)" required className="glass-input" style={{ marginBottom: '15px' }}/>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <input name="rate" type="number" placeholder="Hourly Rate ($)" required className="glass-input" />
                        <input name="tags" type="text" placeholder="Skills (tag1, tag2...)" className="glass-input" />
                      </div>
                      <textarea name="desc" placeholder="Professional Bio & Technical Specifications" className="glass-input" style={{ height: '120px', resize: 'none', marginBottom: '15px' }} />
                      <button type="submit" className="role-btn primary" style={{ width: '100%', padding: '20px' }}>DEPLOY TO NETWORK</button>
                    </form>
                  </motion.div>
                )}

                {/* INTEGRATED JOB BOARD FOR PROS */}
                <div style={{ marginBottom: '60px', width: '100%' }}>
                  <JobBoard 
                    currentUser={currentUser} 
                    onClaimContract={(clientId) => {
                      setChatInitialContact(clientId);
                      setView('messaging');
                    }}
                  />
                </div>

                <div className="category-tag" style={{ marginBottom: '20px', width: '100%' }}>Operational Statistics</div>
                <div className="dashboard-stats" style={{ marginBottom: '60px' }}>
                  <div className="stat-box"><div className="stat-number">{content.filter(n => n.ownerAccountId === currentUser.username).length}</div><div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Your Active Nodes</div></div>
                  <div className="stat-box"><div className="stat-number">Optimal</div><div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Node Health</div></div>
                </div>

                <div className="category-tag" style={{ marginBottom: '20px', width: '100%' }}>Active Service Registry</div>
                <div className="premium-grid">
                  {content.filter(n => n.ownerAccountId === currentUser.username).map((item, index) => (
                    <motion.div key={item.id} layout style={{ display: 'contents' }}>
                      <TiltCard className="premium-item-card">
                        <div className="category-tag">{item.category || `Registry 0${index + 1}`}</div>
                        <h3 className="item-title">{item.title}</h3>
                        <RatingStars rating={item.rating} count={item.reviewCount} />
                        <div className="skill-pills-container">
                          {(item.tags || []).slice(0, 3).map((tag, i) => (
                            <span key={i} className="skill-pill">{tag}</span>
                          ))}
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{item.rate}</p>
                        <div style={{ marginTop: 'auto' }}>
                            <button className="role-btn" style={{ width: '100%', padding: '10px', background: 'rgba(255, 51, 51, 0.1)', color: '#ff3333', border: '1px solid rgba(255, 51, 51, 0.2)', fontSize: '0.7rem' }} onClick={() => {
                              if(confirm("Confirm security node deactivation?")) {
                                fetch(`${API_BASE}/network/nodes/${item.id}`, { method: 'DELETE' })
                                  .then(() => {
                                    setContent(content.filter(i => i.id !== item.id));
                                    showSystemNotification("NODE_REVOKED");
                                  })
                                  .catch(err => console.error("Deletion failed:", err));
                              }
                            }}>DEACTIVATE_NODE</button>
                        </div>
                      </TiltCard>
                    </motion.div>
                  ))}
                  {content.filter(n => n.ownerAccountId === currentUser.username).length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '15px' }}>
                      NO_ACTIVE_NODES_DETECTED
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* MESSAGING VIEW */}
            {view === 'messaging' && (
              <motion.div key="messaging" {...pageTransition}>
                <Chat currentUser={currentUser} initialContact={chatInitialContact} />
              </motion.div>
            )}

            {/* SETTINGS VIEW */}
            {view === 'settings' && (
              <motion.div key="settings" {...pageTransition}>
                <Settings currentUser={currentUser} theme={theme} setTheme={setTheme} />
              </motion.div>
            )}

            {/* ADMIN GOVERNANCE */}
            {view === 'admin' && (
              <motion.div key="admin" {...pageTransition}>
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

                <AnimatePresence mode="wait">
                  {adminSubView === 'nodes' && (
                    <motion.div key="admin-nodes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-grid">
                      {content.map((item, index) => (
                        <div key={item.id} className="premium-item-card" style={{ borderColor: 'rgba(255, 96, 0, 0.2)' }}>
                          <div className="category-tag">{item.category || `Node 0${index + 1}`}</div>
                          {editingNode?.id === item.id ? (
                            <div className="fade-in">
                              <input className="glass-input" style={{ marginBottom: '10px' }} value={editingNode.title} onChange={e => setEditingNode({...editingNode, title: e.target.value})} />
                              <input className="glass-input" style={{ marginBottom: '10px' }} value={editingNode.rate} onChange={e => setEditingNode({...editingNode, rate: e.target.value})} />
                              <textarea className="glass-input" style={{ marginBottom: '10px', height: '80px' }} value={editingNode.desc} onChange={e => setEditingNode({...editingNode, desc: e.target.value})} />
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="role-btn primary" style={{ flex: 1, padding: '10px' }} onClick={() => {
                                  fetch(`${API_BASE}/network/update/${item.id}`, {
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
                              <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Operator: {item.provider} ({item.ownerAccountId})</p>
                              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                                <button className="role-btn" style={{ flex: 1, padding: '10px', fontSize: '0.7rem' }} onClick={() => setEditingNode(item)}>EDIT_DATA</button>
                                <button className="role-btn primary" style={{ flex: 1, padding: '10px', background: '#ff3333', boxShadow: 'none', fontSize: '0.7rem' }} onClick={() => {
                                  fetch(`${API_BASE}/network/revoke/${item.id}`, { method: 'DELETE' })
                                    .then(() => setContent(content.filter(i => i.id !== item.id)))
                                    .catch(err => console.error("Revocation failed:", err));
                                }}>REVOKE</button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {adminSubView === 'logs' && (
                    <motion.div key="admin-logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                      <div className="category-tag">Live System Logs</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {systemLogs.map(log => (
                          <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                            <span><span style={{ color: 'var(--d-orange)' }}>[{log.action}]</span> {log.user} initiated sequence</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {adminSubView === 'users' && (
                    <motion.div key="admin-users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* PROFILE DETAIL VIEW */}
            {selectedPro && (
              <motion.div key="detail" {...pageTransition} className="detail-view">
                <button className="nav-link" style={{ marginBottom: '40px' }} onClick={() => setSelectedPro(null)}>← Terminate Connection</button>
                <div style={{ borderTop: '1px solid var(--d-border)', paddingTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '60px' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <div className="category-tag">Node Specifications</div>
                    <h1 className="item-title" style={{ fontSize: '3rem', letterSpacing: '-1px' }}>{selectedPro.title}</h1>
                    <RatingStars rating={selectedPro.rating} count={selectedPro.reviewCount} size={20} />
                    <p style={{ fontSize: '1.2rem', margin: '20px 0', fontFamily: 'var(--font-mono)' }}>ID: <span style={{ color: 'var(--d-orange)' }}>{selectedPro.provider}</span></p>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '40px', fontFamily: 'var(--font-mono)' }}>{selectedPro.rate}</h2>
                    <button className="role-btn primary" style={{ marginTop: '30px', padding: '24px' }} onClick={() => {
                      showSystemNotification("CONNECTION_ESTABLISHED");
                      setChatInitialContact(selectedPro.ownerAccountId);
                      setView('messaging');
                      setSelectedPro(null);
                    }}>INITIATE CONTRACT</button>
                  </div>
                  <div style={{ flex: '1', minWidth: '300px', padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--d-border)' }}>
                    <div className="category-tag">Documentation</div>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>{selectedPro.desc}</p>
                    <div style={{ marginTop: '60px' }}>
                      <div className="category-tag">Service Authentication (Rate)</div>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            className="role-btn" 
                            style={{ padding: '10px', minWidth: '45px' }}
                            onClick={() => {
                              fetch(`${API_BASE}/network/nodes/${selectedPro.id}/rate`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ score: star })
                              })
                              .then(res => res.json())
                              .then(updatedNode => {
                                setContent(content.map(n => n.id === updatedNode.id ? updatedNode : n));
                                setSelectedPro(updatedNode);
                                alert("Feedback packet transmitted successfully.");
                              })
                              .catch(err => console.error("Rating failed:", err));
                            }}
                          >
                            <Star size={18} fill={star <= Math.round(selectedPro.rating) ? "var(--d-orange)" : "none"} color="var(--d-orange)" />
                          </button>
                        ))}
                      </div>
                      <div className="category-tag">Encrypted Feedback</div>
                      <textarea placeholder="> Input log data..." className="glass-input" style={{ width: '100%', height: '120px', resize: 'none', marginBottom: '15px' }}></textarea>
                      <button className="role-btn" style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px' }} onClick={() => alert("Log transmitted securely.")}>SUBMIT LOG</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}