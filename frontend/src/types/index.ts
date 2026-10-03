import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Tilt from 'react-parallax-tilt';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="landing-layout">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="landing-logo" style={{ color: '#818cf8', textShadow: 'none', gap: '0.2rem' }}>
          <span style={{ color: '#818cf8' }}>LastMile</span><span style={{ color: '#fff' }}>US</span>
        </div>
        <div className="landing-nav-links" style={{ gap: '2rem' }}>
          {user ? (
            <>
              <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Welcome, {user.name}</span>
              <Link to={getDashboardLink()} className="btn" style={{ background: '#818cf8', color: '#000', borderRadius: '4px', padding: '0.5rem 1.25rem', fontWeight: 700 }}>Go to Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '0.5rem 1.25rem' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn" style={{ background: '#818cf8', color: '#000', borderRadius: '4px', padding: '0.5rem 1.25rem', fontWeight: 700 }}>Sign In</Link>
              <Link to="/register" className="btn btn-outline" style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', padding: '0.5rem 1.25rem' }}>Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="landing-content">
        
        {/* Top Split Section */}
        <div className="landing-top-section">
          <div className="landing-text-col">
            <div className="badge-outline" style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)', marginBottom: '1.5rem', display: 'inline-block', padding: '0.35rem 1.25rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1.5px', background: 'rgba(192, 132, 252, 0.05)' }}>
              ✦ GLOBAL LOGISTICS HUB
            </div>
            <h1 className="landing-headline" style={{ 
              fontWeight: 900, 
              lineHeight: 1.1,
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 20px rgba(168, 85, 247, 0.3))'
            }}>
              Enterprise Transport<br />& Fleet Management
            </h1>
            <p className="landing-sub-headline" style={{ color: '#a1a1aa', lineHeight: 1.6, marginTop: '1.5rem' }}>
              Empower your supply chain with our state-of-the-art dispatch platform. Accelerate delivery speeds, optimize import/export routes, and gain real-time visibility across your entire global operations network.
            </p>
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
               <Link to={user ? getDashboardLink() : '/login'} className="btn" style={{ 
                 background: 'var(--accent-gradient)', 
                 color: '#fff', 
                 borderRadius: '8px', 
                 padding: '1rem 2.5rem', 
                 fontSize: '1.1rem', 
                 fontWeight: 800,
                 boxShadow: '0 10px 25px rgba(168, 85, 247, 0.4)',
                 border: 'none',
                 transition: 'all 0.3s ease',
                 width: '100%',
                 textAlign: 'center',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}>
                 {user ? 'Launch Hub →' : 'Start Managing Operations →'}
               </Link>
            </div>
          </div>

          <div className="landing-visual-col">
            <div className="visual-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px', border: 'none', background: 'transparent', boxShadow: 'none', width: '100%', height: '100%' }}>
               
               {/* Background Glow Only */}
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 60%)', animation: 'pulse-glow 6s infinite alternate', zIndex: 0 }}></div>
               
               {/* Beautiful Floating CSS Mockup with 3D Tilt Interactivity */}
               <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} perspective={1000} scale={1.05} transitionSpeed={1000} style={{ width: '100%', maxWidth: '400px', zIndex: 10, animation: 'float 6s ease-in-out infinite' }}>
                 <div style={{ position: 'relative', width: '100%' }}>
                   
                   {/* Main Mockup Card */}
                   <div style={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(168, 85, 247, 0.2)', cursor: 'pointer', transition: 'all 0.3s ease' }} className="interactive-card">
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                       <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>Tracking: <span style={{ color: '#818cf8' }}>LM-8923K</span></span>
                       <span className="pulse-badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>IN TRANSIT</span>
                     </div>

                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                       {/* Progress Line */}
                       <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                         <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '5px', width: '2px', background: 'linear-gradient(to bottom, #818cf8 50%, rgba(255,255,255,0.1) 50%)' }}></div>
                         
                         <div style={{ marginBottom: '1.5rem', position: 'relative' }} className="interactive-step">
                           <div style={{ position: 'absolute', left: '-2rem', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#818cf8', border: '3px solid #141419', boxShadow: '0 0 10px #818cf8' }}></div>
                           <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Package Picked Up</h4>
                           <p style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>10:42 AM • Distribution Center Alpha</p>
                         </div>

                         <div style={{ position: 'relative' }} className="interactive-step">
                           <div style={{ position: 'absolute', left: '-2rem', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#050505', border: '3px solid rgba(255,255,255,0.2)' }}></div>
                           <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Estimated Delivery</h4>
                           <p style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>2:30 PM • Destination Facility</p>
                         </div>
                       </div>
                     </div>

                   </div>

                   {/* Floating Metric Pill 1 */}
                   <div style={{ position: 'absolute', top: '-15px', right: '-10px', background: 'rgba(16, 185, 129, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.6rem 1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'float 5s ease-in-out infinite 1s' }} className="interactive-pill">
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                     <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>99.8% On-Time</span>
                   </div>

                   {/* Floating Metric Pill 2 */}
                   <div style={{ position: 'absolute', bottom: '-15px', left: '-10px', background: 'rgba(236, 72, 153, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.6rem 1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'float 7s ease-in-out infinite 0.5s' }} className="interactive-pill">
                     <span style={{ color: '#ec4899', fontSize: '1.1rem', fontWeight: 900 }}>42</span>
                     <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Active Agents</span>
                   </div>

                 </div>
               </Tilt>
               
            </div>
          </div>
        </div>

        {/* Bottom Features Section */}
        <div className="landing-features-section" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Colorful Background Orbs */}
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>

          <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1 }}>
            <h2 style={{ 
              fontSize: '3rem', 
              fontWeight: 900, 
              marginBottom: '1.5rem',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 15px rgba(168, 85, 247, 0.4))'
            }}>Engineered for Scale</h2>
            <p style={{ color: '#a1a1aa', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
              Designed to handle thousands of concurrent import, export, and transit workflows effortlessly with military-grade precision.
            </p>
          </div>
          
          <div className="feature-cards-grid" style={{ position: 'relative', zIndex: 1 }}>
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.15} glareColor="#38bdf8" perspective={1000} scale={1.02}>
              <div className="feature-card-solid" style={{ background: 'linear-gradient(145deg, rgba(20,20,25,0.8) 0%, rgba(56, 189, 248, 0.1) 100%)', border: '1px solid rgba(56, 189, 248, 0.2)', boxShadow: '0 15px 35px rgba(0,0,0,0.4), inset 0 0 20px rgba(56, 189, 248, 0.05)' }}>
                <div className="feature-icon-solid" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.05))', borderColor: 'rgba(56, 189, 248, 0.4)', boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)' }}>🗺️</div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem', fontWeight: 800 }}>Algorithmic Route Optimization</h3>
                <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6' }}>
                  Instantly computes the most efficient transit paths based on real-time traffic data, regional topology, and vehicle proximity to minimize overhead.
                </p>
              </div>
            </Tilt>

            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.15} glareColor="#a855f7" perspective={1000} scale={1.02}>
              <div className="feature-card-solid" style={{ background: 'linear-gradient(145deg, rgba(20,20,25,0.8) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 15px 35px rgba(0,0,0,0.4), inset 0 0 20px rgba(168, 85, 247, 0.05)' }}>
                <div className="feature-icon-solid" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.05))', borderColor: 'rgba(168, 85, 247, 0.4)', boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>🤖</div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem', fontWeight: 800 }}>Automated Fleet Dispatch</h3>
                <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6' }}>
                  Eliminate manual oversight. Our engine autonomously pairs high-priority consignments with the optimal agents for maximum fulfillment speed.
                </p>
              </div>
            </Tilt>

            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.15} glareColor="#ec4899" perspective={1000} scale={1.02}>
              <div className="feature-card-solid" style={{ background: 'linear-gradient(145deg, rgba(20,20,25,0.8) 0%, rgba(236, 72, 153, 0.1) 100%)', border: '1px solid rgba(236, 72, 153, 0.2)', boxShadow: '0 15px 35px rgba(0,0,0,0.4), inset 0 0 20px rgba(236, 72, 153, 0.05)' }}>
                <div className="feature-icon-solid" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.05))', borderColor: 'rgba(236, 72, 153, 0.4)', boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' }}>🛡️</div>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem', fontWeight: 800 }}>Cryptographic Audit Trails</h3>
                <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6' }}>
                  Every cargo scan, transit update, and proof-of-delivery is securely logged via an append-only architecture, ensuring absolute transparency.
                </p>
              </div>
            </Tilt>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#52525b', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          © 2026 LastMileUS Global Logistics. All rights reserved.
        </div>
      </div>
    </div>
  );
}