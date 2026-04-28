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
    document.body.classList.remove('light-theme', 'multiverse-theme');
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else if (theme === 'multiverse') {
      document.body.classList.add('multiverse-theme');
      triggerGlitch();
    }
    localStorage.setItem('proconnect_theme', theme);
  }, [theme]);

  // FETCH NODES FROM RENDER CLOUD
  useEffect(() => {
    fetch(`${API_BASE}/network/nodes`)
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error("Cloud Node Fetch Failed:", err));
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetch(`${API_BASE}/network/logs`).then(res => res.json()).then(setSystemLogs);
      fetch(`${API_BASE}/network/users`).then(res => res.json()).then(setNetworkUsers);
    }
  }, [currentUser, view]);

  useEffect(() => {
    if (isBooting) {
      const t1 = setTimeout(() => setBootText("BYPASSING PUBLIC NODES..."), 800);
      const t2 = setTimeout(() => setBootText("ESTABLISHING ENCRYPTED TUNNEL..."), 1600);
      const t3 = setTimeout(() => setIsBooting(false), 2400);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [isBooting]);

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
    if (theme !== 'multiverse') return <div className={className} onClick={onClick}>{children}</div>;
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
      setTilt({ x, y });
    };
    return (
      <div 
        className={className} 
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) rotateZ(-1deg)`, transition: 'transform 0.1s steps(4)' }}
      >
        {children}
      </div>
    );
  };

  const RatingStars = ({ rating, count, size = 14 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} size={size} fill={star <= Math.round(rating) ? "var(--d-orange)" : "none"} color={star <= Math.round(rating) ? "var(--d-orange)" : "rgba(255,255,255,0.2)"} />
      ))}
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px', fontFamily: 'var(--font-mono)' }}>
        ({rating || 0.0}) {count !== undefined && <span style={{ opacity: 0.6 }}>• {count} REVIEWS</span>}
      </span>
    </div>
  );

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;
  if (isBooting) return <div className="boot-screen"><div>&gt; {bootText} <span className="blink">_</span></div></div>;

  return (
    <>
      <div className="noise-overlay"></div>
      <div className="app-bg-container"><div className="grid-background"></div></div>
      <div className="premium-container">
        <AnimatePresence>{notification && <div className="system-toast">{notification}</div>}</AnimatePresence>
        <nav className="premium-nav">
          <div className="nav-brand" onClick={() => setView(currentUser?.role === 'pro' ? 'dashboard' : 'marketplace')}>PROCONNECT<span className="hero-dot">.</span></div>
          <div className="nav-links-container">
            <button className={`nav-link ${view === 'marketplace' || view === 'dashboard' ? 'active' : ''}`} onClick={() => setView(currentUser?.role === 'pro' ? 'dashboard' : 'marketplace')}>Console</button>
            <button className={`nav-link ${view === 'job-board' ? 'active' : ''}`} onClick={() => setView('job-board')}>Job Board</button>
            {currentUser?.role === 'admin' && <button className={`nav-link ${view === 'admin' ? 'active' : ''}`} onClick={() => setView('admin')}>Governance</button>}
            <button className={`nav-link ${view === 'messaging' ? 'active' : ''}`} onClick={() => setView('messaging')}>Messaging</button>
            <button className={`nav-link ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}>Settings</button>
            <button className="premium-btn-logout" onClick={handleLogout}>Exit</button>
          </div>
        </nav>

        <main className={`premium-main ${isGlitching ? 'glitch-active' : ''}`}>
          <AnimatePresence mode="wait">
            {view === 'marketplace' && !selectedPro && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <div className="cinematic-hero">
                  <div className="hero-split-title"><span>CONNECT</span><span>WITH ONE CLICK<span className="hero-dot">.</span></span></div>
                  <p className="hero-subtext">Verified node infrastructure matching you with top-tier talent.</p>
                </div>
                <div className="premium-grid">
                  {content.map((item) => (
                    <TiltCard key={item.id} className="premium-item-card" onClick={() => setSelectedPro(item)}>
                      <div className="category-tag">{item.category}</div>
                      <h3 className="item-title">{item.title}</h3>
                      <RatingStars rating={item.rating} count={item.reviewCount} />
                      <p className="item-desc">{item.desc}</p>
                      <div className="item-footer"><span>{item.rate}</span><span className="deploy-link">Deploy ↗</span></div>
                    </TiltCard>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* ... rest of the sub-views follow the same API_BASE logic ... */}
            {view === 'job-board' && <JobBoard currentUser={currentUser} API_BASE={API_BASE} />}
            {view === 'messaging' && <Chat currentUser={currentUser} initialContact={chatInitialContact} API_BASE={API_BASE} />}
            {view === 'settings' && <Settings currentUser={currentUser} theme={theme} setTheme={setTheme} />}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
