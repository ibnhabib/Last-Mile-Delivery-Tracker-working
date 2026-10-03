import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Hero3D from '../../components/common/Her3';
import Tilt from 'react-parallax-tilt';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CUSTOMER' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'REGISTER' | 'VERIFY'>('REGISTER');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, verifyOtp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    }
  }, [user, navigate]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone || undefined, form.role);
      // Bypass OTP for demo purposes, redirect straight to login
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      // Navigation is handled by useEffect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="auth-split-layout">
      {/* Left Side: Hero Section */}
      <div className="auth-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <div className="auth-hero-content animate-slide-in">
          <h1 className="auth-hero-title"><span>🚀</span> LastMileUS</h1>
          <p className="auth-hero-subtitle">
            The next-generation logistics engine. Join us to deliver faster, track smarter, and scale your delivery operations with precision.
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
              <h2>{step === 'REGISTER' ? 'Create Account' : 'Verify Email'}</h2>
              <p>{step === 'REGISTER' ? 'Sign up for a new account' : 'Enter the 6-digit code sent to your email'}</p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            
            {step === 'REGISTER' ? (
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter your full name" required />
                </div>
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Enter your email" required />
                </div>
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label>Password</label>
                  <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Create a password" required />
                </div>
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label>Role</label>
                  <select value={form.role} onChange={e => update('role', e.target.value)}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="AGENT">Delivery Agent</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '1.25rem' }}>
                  {loading ? 'Creating Account...' : 'Continue to Verification'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifySubmit}>
                <div className="form-group">
                  <label>Verification Code</label>
                  <input 
                    type="text" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    placeholder="6-digit code" 
                    maxLength={6}
                    style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center', padding: '1rem' }}
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '1.25rem' }}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>
            )}
            
            {step === 'REGISTER' && (
               <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
            )}
          </div>
        </Tilt>
      </div>
    </div>
  );
}