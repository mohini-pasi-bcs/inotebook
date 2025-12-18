import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
      navigate('/login');
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>📒</div>
            <span style={styles.logoText}>iNotebook</span>
          </div>
        </Link>

        {/* Navigation Items */}
        <div style={styles.navItems}>
          {user ? (
            <>
              {/* User Profile Dropdown */}
              <div style={styles.userSection}>
                <div style={styles.userInfo}>
                  <div style={styles.userAvatar}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={styles.userDetails}>
                    <span style={styles.userName}>{user.name || 'User'}</span>
                    <span style={styles.userEmail}>{user.email}</span>
                  </div>
                </div>
                
                {/* Dropdown Menu */}
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownUser}>
                      <div style={styles.dropdownAvatar}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={styles.dropdownName}>{user.name || 'User'}</div>
                        <div style={styles.dropdownEmail}>{user.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.dropdownDivider}></div>
                  
                  <Link to="/profile" style={styles.dropdownItem}>
                    <span style={styles.dropdownIcon}>👤</span>
                    <span>My Profile</span>
                  </Link>
                  
                  <Link to="/settings" style={styles.dropdownItem}>
                    <span style={styles.dropdownIcon}>⚙️</span>
                    <span>Settings</span>
                  </Link>
                  
                  <div style={styles.dropdownDivider}></div>
                  
                  <button 
                    onClick={handleLogout} 
                    style={styles.dropdownItem}
                  >
                    <span style={styles.dropdownIcon}>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Quick Logout Button (for mobile/tablet) */}
              <button 
                onClick={handleLogout}
                style={styles.logoutButton}
                title="Logout"
              >
                <span style={styles.logoutIcon}>↪️</span>
                <span style={styles.logoutText}>Logout</span>
              </button>
            </>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.loginButton}>
                Sign In
              </Link>
              <Link to="/register" style={styles.registerButton}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid #e5e7eb',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
  },
  logo: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'scale(1.02)',
    },
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
  navItems: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userSection: {
    position: 'relative',
    cursor: 'pointer',
    ':hover > div:nth-child(2)': {
      display: 'block',
    },
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f9fafb',
    },
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: '12px',
    color: '#6b7280',
  },
  dropdown: {
    display: 'none',
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '280px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    marginTop: '8px',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownHeader: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  dropdownUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dropdownAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '16px',
  },
  dropdownName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  dropdownEmail: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '8px 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    textDecoration: 'none',
    color: '#374151',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
    ':hover': {
      backgroundColor: '#f9fafb',
    },
  },
  dropdownIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f3f4f6',
      borderColor: '#9ca3af',
    },
  },
  logoutIcon: {
    fontSize: '16px',
  },
  logoutText: {
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  authButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  loginButton: {
    padding: '8px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f9fafb',
      borderColor: '#9ca3af',
    },
  },
  registerButton: {
    padding: '8px 20px',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#4338ca',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
    },
  },
};

// Add media queries for responsive design
const mediaStyles = `
  @media (max-width: 768px) {
    .logo-text {
      font-size: 20px;
    }
    .user-name {
      display: none;
    }
    .user-email {
      display: none;
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 0 16px;
    }
    .auth-buttons {
      gap: 8px;
    }
    .login-button, .register-button {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = mediaStyles;
document.head.appendChild(styleSheet);

export default Navbar;