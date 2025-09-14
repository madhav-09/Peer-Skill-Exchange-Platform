import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const { isDark } = useTheme();

  useEffect(() => {
    // Listen for notification events
    const handleNotification = (event) => {
      const notification = {
        id: Date.now(),
        type: event.detail.type || 'info',
        title: event.detail.title,
        message: event.detail.message,
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, notification]);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 3000);
    };

    window.addEventListener('showNotification', handleNotification);
    return () => window.removeEventListener('showNotification', handleNotification);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'swap':
        return '🔄';
      case 'message':
        return '💬';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'from-green-400 to-emerald-500';
      case 'error':
        return 'from-red-400 to-rose-500';
      case 'warning':
        return 'from-amber-400 to-orange-500';
      case 'swap':
        return 'from-blue-400 to-indigo-500';
      case 'message':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-gray-400 to-slate-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`glass-card rounded-2xl p-4 max-w-sm transform transition-all duration-500 ease-out animate-slideInRight`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animation: 'slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards'
          }}
        >
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getNotificationColor(notification.type)} flex items-center justify-center text-white font-bold shadow-lg`}>
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-primary font-poppins truncate">
                  {notification.title}
                </h4>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-secondary hover:text-primary transition-colors duration-200 ml-2"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-xs text-secondary font-inter mt-1 line-clamp-2">
                {notification.message}
              </p>
              
              <div className="text-xs text-muted font-inter mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getNotificationColor(notification.type)} animate-shrink`}
              style={{
                animation: 'shrink 3s linear forwards'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Notification helper function
export const showNotification = (type, title, message) => {
  const event = new CustomEvent('showNotification', {
    detail: { type, title, message }
  });
  window.dispatchEvent(event);
};

export default NotificationSystem;