import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, Send, Zap } from 'lucide-react';

// SPRING BOOT UPLINK CONFIGURATION
const API_BASE = "const API_BASE = "https://proconnect-backend-rejr.onrender.com";

const JobBoard = ({ currentUser, onClaimContract, onNotify }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const theme = localStorage.getItem('proconnect_theme');

  const TiltCard = ({ children, className, onClick, style }) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    
    if (theme !== 'multiverse') {
      return <div className={className} onClick={onClick} style={style}>{children}</div>;
    }

    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
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
          ...style,
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) rotateZ(-1deg)`,
          transition: 'transform 0.1s steps(4)'
        }}
      >
        {children}
      </div>
    );
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    setLoading(true);
    // SPRING BOOT: Fetching open jobs from Java API
    fetch(`${API_BASE}/jobs/open`)
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  };

  const handlePostJob = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const jobData = {
      clientId: currentUser.username,
      title: formData.get('title'),
      description: formData.get('description'),
      budget: parseInt(formData.get('budget')),
      category: formData.get('category')
    };

    // SPRING BOOT: Posting new job request to Java API
    fetch(`${API_BASE}/jobs/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    })
    .then(res => res.json())
    .then(() => {
      fetchJobs();
      e.target.reset();
      if (onNotify) onNotify("REQUEST_BROADCASTED");
      else alert("Job Request Transmitted to Network.");
    })
    .catch(err => console.error("Job posting failed:", err));
  };

  return (
    <div className="fade-in">
      <div className="dashboard-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="dashboard-title">OPERATIONAL_REQUESTS</h1>
          <p style={{ color: 'var(--d-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            {currentUser.role === 'pro' ? '> SCANNING_NETWORK_FOR_CONTRACTS' : '> BROADCAST_PROJECT_SPECIFICATIONS'}
          </p>
        </div>
      </div>

      {currentUser.role === 'user' && (
        <TiltCard className="glass-panel" style={{ marginBottom: '50px' }}>
          <div className="category-tag">Broadcast New Request</div>
          <form onSubmit={handlePostJob} style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <input name="title" type="text" placeholder="Project Title" required className="glass-input" style={{ marginBottom: 0 }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-orange)' }} />
                  <input name="budget" type="number" placeholder="Budget ($)" required className="glass-input" style={{ paddingLeft: '40px', marginBottom: 0 }} />
                </div>
                <select name="category" className="glass-input" style={{ flex: 1, marginBottom: 0 }} required defaultValue="DEVELOPMENT">
                  <option value="DEVELOPMENT">DEVELOPMENT</option>
                  <option value="DESIGN">DESIGN</option>
                  <option value="SECURITY">SECURITY</option>
                  <option value="DATA">DATA</option>
                </select>
              </div>
            </div>
            <textarea name="description" placeholder="Technical Requirements & Deliverables..." required className="glass-input" style={{ height: '100px', resize: 'none', marginBottom: '20px' }} />
            <button type="submit" className="role-btn primary" style={{ width: 'auto', padding: '12px 30px' }}>
              <Send size={16} style={{ marginRight: '10px' }} /> BROADCAST_REQUEST
            </button>
          </form>
        </TiltCard>
      )}

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

      <div className="premium-grid">
        {loading ? (
          <div className="empty-state">SYNCING_DATA...</div>
        ) : jobs.filter(j => selectedCategory === 'ALL' || j.category === selectedCategory).length === 0 ? (
          <div className="empty-state">NO_ACTIVE_REQUESTS_FOUND</div>
        ) : (
          jobs.filter(j => selectedCategory === 'ALL' || j.category === selectedCategory).map((job) => (
            <TiltCard key={job.id} className="premium-item-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="category-tag"><Zap size={10} style={{ marginRight: '4px' }} /> {job.category || 'Priority Request'}</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--d-orange)', fontSize: '1.1rem' }}>${job.budget}</div>
              </div>
              
              <h3 className="item-title" style={{ marginTop: '10px' }}>{job.title}</h3>
              <p style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>{job.description}</p>
              
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div className="user-avatar" style={{ width: '24px', height: '24px', fontSize: '0.6rem' }}>{job.clientId[0].toUpperCase()}</div>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--d-text-muted)' }}>Client: {job.clientId}</span>
                </div>
                
                {currentUser.role === 'pro' && (
                  <button 
                    className="role-btn primary" 
                    style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}
                    onClick={() => onClaimContract(job.clientId)}
                  >
                    CLAIM_CONTRACT
                  </button>
                )}
              </div>
            </TiltCard>
          ))
        )}
      </div>
    </div>
  );
};

export default JobBoard;