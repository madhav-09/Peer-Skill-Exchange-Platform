import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Session management constants
  const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

  useEffect(() => {
    initializeAuth();
    setupSessionMonitoring();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const loginTime = localStorage.getItem('loginTime');
    
    if (token && userData && loginTime) {
      const timeElapsed = Date.now() - parseInt(loginTime);
      
      if (timeElapsed < SESSION_DURATION) {
        try {
          setUser(JSON.parse(userData));
          setupSessionTimeout(parseInt(loginTime));
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      } else {
        // Session expired
        logout();
      }
    }
    setLoading(false);
  };

  const setupSessionTimeout = (loginTime) => {
    const timeRemaining = SESSION_DURATION - (Date.now() - loginTime);
    
    if (timeRemaining > 0) {
      // Set timeout for session expiry
      const timeout = setTimeout(() => {
        handleSessionExpiry();
      }, timeRemaining);
      
      setSessionTimeout(timeout);
      
      // Set warning timeout
      if (timeRemaining > WARNING_TIME) {
        setTimeout(() => {
          showSessionWarning();
        }, timeRemaining - WARNING_TIME);
      }
    }
  };

  const setupSessionMonitoring = () => {
    // Monitor user activity
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateLastActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    activities.forEach(activity => {
      document.addEventListener(activity, updateLastActivity, true);
    });

    // Check for inactivity every minute
    const inactivityCheck = setInterval(() => {
      const lastActivity = localStorage.getItem('lastActivity');
      const inactiveTime = Date.now() - parseInt(lastActivity || Date.now());
      
      // Auto-logout after 30 minutes of inactivity
      if (inactiveTime > 30 * 60 * 1000 && user) {
        logout();
        alert('You have been logged out due to inactivity.');
      }
    }, 60000);

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, updateLastActivity, true);
      });
      clearInterval(inactivityCheck);
    };
  };

  const showSessionWarning = () => {
    if (user) {
      const extend = window.confirm(
        'Your session will expire in 5 minutes. Would you like to extend it?'
      );
      
      if (extend) {
        extendSession();
      }
    }
  };

  const extendSession = () => {
    const newLoginTime = Date.now();
    localStorage.setItem('loginTime', newLoginTime.toString());
    
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    setupSessionTimeout(newLoginTime);
  };

  const handleSessionExpiry = () => {
    logout();
    alert('Your session has expired. Please log in again.');
  };

  const login = async (credentials, rememberMe = false) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      const loginTime = Date.now();
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginTime', loginTime.toString());
      localStorage.setItem('lastActivity', loginTime.toString());
      localStorage.setItem('rememberMe', rememberMe.toString());
      
      setUser(user);
      setupSessionTimeout(loginTime);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      const loginTime = Date.now();
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginTime', loginTime.toString());
      localStorage.setItem('lastActivity', loginTime.toString());
      
      setUser(user);
      setupSessionTimeout(loginTime);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('rememberMe');
    
    // Clear session timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    
    setUser(null);
  };

  const isSessionValid = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return false;
    
    const timeElapsed = Date.now() - parseInt(loginTime);
    return timeElapsed < SESSION_DURATION;
  };

  const getSessionTimeRemaining = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return 0;
    
    const timeElapsed = Date.now() - parseInt(loginTime);
    return Math.max(0, SESSION_DURATION - timeElapsed);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    extendSession,
    isSessionValid,
    getSessionTimeRemaining,
    sessionTimeRemaining: getSessionTimeRemaining()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};