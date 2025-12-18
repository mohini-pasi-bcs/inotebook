import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email.trim(),
        password: password.trim()
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        if (!response.data.token) {
          setError('No authentication token received from server');
          return;
        }
        
        onLogin(response.data.token, response.data.user);
        navigate('/');
      } else {
        setError(response.data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 400) {
        setError('Invalid email or password');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.message.includes('Network Error')) {
        setError('Cannot connect to server. Make sure backend is running.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <div style={styles.passwordHeader}>
              <label style={styles.label}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPasswordBtn}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.submitBtn,
              backgroundColor: loading ? '#ccc' : '#4f46e5',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <div style={styles.demoSection}>
            <p style={styles.demoText}>Want to test the app?</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              style={styles.demoBtn}
            >
              Use Demo Credentials
            </button>
          </div>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Create an account
            </Link>
          </p>
          <p style={styles.footerText}>
            <Link to="/forgot-password" style={styles.link}>
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>

      <div style={styles.illustration}>
        <div style={styles.illustrationBox}>
          <h3 style={styles.illustrationTitle}>iNotebook</h3>
          <p style={styles.illustrationText}>
            Your personal note-taking application. 
            Organize your thoughts, ideas, and important information in one place.
          </p>
          <ul style={styles.featuresList}>
            <li style={styles.featureItem}>📝 Create and manage notes</li>
            <li style={styles.featureItem}>🏷️ Organize with tags</li>
            <li style={styles.featureItem}>🔒 Secure and private</li>
            <li style={styles.featureItem}>📱 Access anywhere</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loginBox: {
    flex: 1,
    maxWidth: '480px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  errorIcon: {
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showPasswordBtn: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    ':hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
    ':disabled': {
      backgroundColor: '#f3f4f6',
      cursor: 'not-allowed',
    },
  },
  submitBtn: {
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    marginTop: '8px',
    transition: 'all 0.2s',
    ':hover:not(:disabled)': {
      backgroundColor: '#4338ca',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
    },
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  demoSection: {
    textAlign: 'center',
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    marginTop: '16px',
  },
  demoText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  demoBtn: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #4f46e5',
    color: '#4f46e5',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '8px 0',
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  illustration: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  },
  illustrationBox: {
    maxWidth: '500px',
    color: 'white',
  },
  illustrationTitle: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '20px',
  },
  illustrationText: {
    fontSize: '18px',
    lineHeight: '1.6',
    marginBottom: '30px',
    opacity: '0.9',
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  featureItem: {
    fontSize: '16px',
    padding: '8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    opacity: '0.9',
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Login;