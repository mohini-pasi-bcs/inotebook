import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Use at least 8 characters with mix of letters, numbers, and symbols.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        if (!response.data.token) {
          setError('Registration successful but no authentication token received');
          return;
        }
        
        onLogin(response.data.token, response.data.user);
        navigate('/');
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'User already exists with this email');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.message.includes('Network Error')) {
        setError('Cannot connect to server. Make sure backend is running.');
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength) => {
    if (strength <= 2) return '#ef4444'; // Red
    if (strength === 3) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const getStrengthText = (strength) => {
    if (strength <= 1) return 'Very Weak';
    if (strength === 2) return 'Weak';
    if (strength === 3) return 'Good';
    if (strength === 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div style={styles.container}>
      <div style={styles.registerBox}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join iNotebook to start organizing your notes</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Full Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Email Address <span style={styles.required}>*</span>
            </label>
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
              <label style={styles.label}>
                Password <span style={styles.required}>*</span>
              </label>
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
              onChange={handlePasswordChange}
              placeholder="Create a strong password"
              required
              disabled={loading}
              style={styles.input}
            />
            
            {/* Password Strength Indicator */}
            {password && (
              <div style={styles.strengthContainer}>
                <div style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      style={{
                        ...styles.strengthBar,
                        backgroundColor: level <= passwordStrength ? getStrengthColor(passwordStrength) : '#e5e7eb',
                      }}
                    />
                  ))}
                </div>
                <span style={{
                  ...styles.strengthText,
                  color: getStrengthColor(passwordStrength)
                }}>
                  {getStrengthText(passwordStrength)}
                </span>
              </div>
            )}

            <div style={styles.passwordRequirements}>
              <p style={styles.requirementsTitle}>Password must contain:</p>
              <ul style={styles.requirementsList}>
                <li style={{
                  ...styles.requirementItem,
                  color: password.length >= 8 ? '#10b981' : '#6b7280'
                }}>
                  {password.length >= 8 ? '✓' : '•'} At least 8 characters
                </li>
                <li style={{
                  ...styles.requirementItem,
                  color: /[A-Z]/.test(password) ? '#10b981' : '#6b7280'
                }}>
                  {/[A-Z]/.test(password) ? '✓' : '•'} One uppercase letter
                </li>
                <li style={{
                  ...styles.requirementItem,
                  color: /[0-9]/.test(password) ? '#10b981' : '#6b7280'
                }}>
                  {/[0-9]/.test(password) ? '✓' : '•'} One number
                </li>
                <li style={{
                  ...styles.requirementItem,
                  color: /[^A-Za-z0-9]/.test(password) ? '#10b981' : '#6b7280'
                }}>
                  {/[^A-Za-z0-9]/.test(password) ? '✓' : '•'} One special character
                </li>
              </ul>
            </div>
          </div>

          <div style={styles.formGroup}>
            <div style={styles.passwordHeader}>
              <label style={styles.label}>
                Confirm Password <span style={styles.required}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.showPasswordBtn}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={loading}
              style={{
                ...styles.input,
                borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' : '#d1d5db'
              }}
            />
            {confirmPassword && password !== confirmPassword && (
              <div style={styles.matchError}>Passwords do not match</div>
            )}
            {confirmPassword && password === confirmPassword && password && (
              <div style={styles.matchSuccess}>✓ Passwords match</div>
            )}
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
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <div style={styles.terms}>
            <p style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Link to="/terms" style={styles.termsLink}>Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" style={styles.termsLink}>Privacy Policy</Link>.
            </p>
          </div>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div style={styles.illustration}>
        <div style={styles.illustrationBox}>
          <h3 style={styles.illustrationTitle}>Why Join iNotebook?</h3>
          <div style={styles.benefitsList}>
            <div style={styles.benefit}>
              <div style={styles.benefitIcon}>🔒</div>
              <div>
                <h4 style={styles.benefitTitle}>Secure & Private</h4>
                <p style={styles.benefitText}>Your notes are encrypted and private</p>
              </div>
            </div>
            <div style={styles.benefit}>
              <div style={styles.benefitIcon}>📱</div>
              <div>
                <h4 style={styles.benefitTitle}>Access Anywhere</h4>
                <p style={styles.benefitText}>Use on any device, anytime</p>
              </div>
            </div>
            <div style={styles.benefit}>
              <div style={styles.benefitIcon}>🏷️</div>
              <div>
                <h4 style={styles.benefitTitle}>Organize with Tags</h4>
                <p style={styles.benefitText}>Categorize notes for easy finding</p>
              </div>
            </div>
            <div style={styles.benefit}>
              <div style={styles.benefitIcon}>⚡</div>
              <div>
                <h4 style={styles.benefitTitle}>Fast & Reliable</h4>
                <p style={styles.benefitText}>Quick access to all your notes</p>
              </div>
            </div>
          </div>
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
  registerBox: {
    flex: 1,
    maxWidth: '480px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white',
    overflowY: 'auto',
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
  required: {
    color: '#ef4444',
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
  strengthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  strengthBars: {
    display: 'flex',
    gap: '4px',
    flex: 1,
  },
  strengthBar: {
    height: '4px',
    flex: 1,
    borderRadius: '2px',
    transition: 'background-color 0.3s',
  },
  strengthText: {
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '70px',
  },
  passwordRequirements: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  requirementsTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 8px 0',
  },
  requirementsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  requirementItem: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  matchError: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px',
  },
  matchSuccess: {
    fontSize: '12px',
    color: '#10b981',
    marginTop: '4px',
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
  terms: {
    marginTop: '16px',
    textAlign: 'center',
  },
  termsText: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.5',
  },
  termsLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
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
    '@media (max-width: 1024px)': {
      display: 'none',
    },
  },
  illustrationBox: {
    maxWidth: '500px',
    color: 'white',
  },
  illustrationTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '30px',
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  benefit: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  benefitIcon: {
    fontSize: '24px',
    minWidth: '40px',
  },
  benefitTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  benefitText: {
    fontSize: '14px',
    opacity: '0.9',
    margin: 0,
    lineHeight: '1.5',
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

export default Register;