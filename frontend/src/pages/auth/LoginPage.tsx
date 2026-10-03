import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Tilt from 'react-parallax-tilt';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Navigation is now handled by the useEffect watching the 'user' state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Side: Hero Section */}
      <div className="auth-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <div className="auth-hero-content animate-slide-in">
          <h1 className="auth-hero-title"><span>🚀</span> LastMileUS</h1>
          <p className="auth-hero-subtitle">
            The next-generation logistics engine. Deliver faster, track smarter, and scale your delivery operations with precision.
          </p>
          <div className="auth-features">
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.1}>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">⚡</div>
                <div className="auth-feature-text">
                  <h4>Ultra-Fast Assignments</h4>
                  <p>Concurrency-safe agent matching system.</p>
                </div>
              </div>
            </Tilt>
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.1}>
              <div className="auth-feature-item" style={{ animationDelay: '0.1s' }}>
                <div className="auth-feature-icon">📍</div>
                <div className="auth-feature-text">
                  <h4>Dynamic Zone Routing</h4>
                  <p>Automated INTRA and INTER zone routing tariffs.</p>
                </div>
              </div>
            </Tilt>
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.1}>
              <div className="auth-feature-item" style={{ animationDelay: '0.2s' }}>
                <div className="auth-feature-icon">🔒</div>
                <div className="auth-feature-text">
                  <h4>Immutable Auditing</h4>
                  <p>Secure, append-only tracking histories.</p>
                </div>
              </div>
            </Tilt>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="auth-form-container">
        <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} glareEnable glareMaxOpacity={0.05}>
          <div className="auth-card">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your dashboard</p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
              </div>
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="auth-footer">Don't have an account? <Link to="/register">Register</Link></p>
            <div className="demo-creds">
              <p style={{ color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}><strong>🚀 Demo Credentials:</strong></p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Admin */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>Admin:</span>
                    <span style={{ color: '#fff' }}>admin@delivery.com</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ color: '#a1a1aa' }}>Password:</span>
                    <span style={{ color: '#fff' }}><strong>admin123</strong></span>
                  </div>
                </div>

                {/* Customer */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>Customer:</span>
                    <span style={{ color: '#fff' }}>customer@delivery.com</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ color: '#a1a1aa' }}>Password:</span>
                    <span style={{ color: '#fff' }}><strong>customer123</strong></span>
                  </div>
                </div>

                {/* Agent */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>Agent:</span>
                    <span style={{ color: '#fff' }}>agent1@delivery.com</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ color: '#a1a1aa' }}>Password:</span>
                    <span style={{ color: '#fff' }}><strong>agent123</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tilt>
      </div>
    </div>
  );
}