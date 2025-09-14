import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [reports, setReports] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, swapsRes, reportsRes] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllSwaps(),
        adminAPI.getReports()
      ]);
      
      setUsers(usersRes.data);
      setSwaps(swapsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
    setLoading(false);
  };

  const banUser = async (userId, isBanned) => {
    try {
      await adminAPI.banUser(userId, { is_banned: isBanned });
      fetchAdminData();
      alert(`User ${isBanned ? 'banned' : 'unbanned'} successfully`);
    } catch (error) {
      alert('Error updating user status');
    }
  };

  const sendPlatformMessage = async () => {
    const title = prompt('Message Title:');
    const message = prompt('Message Content:');
    const type = prompt('Message Type (info/warning/update/maintenance):', 'info');
    
    if (title && message) {
      try {
        await adminAPI.sendPlatformMessage({ title, message, type });
        alert('Platform message sent successfully');
      } catch (error) {
        alert('Error sending message');
      }
    }
  };

  const downloadReport = async (reportType, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reports/${reportType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error downloading report');
      }
    } catch (error) {
      alert('Error downloading report');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-secondary">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-4xl font-bold font-poppins bg-gradient-to-r from-red-400 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-muted text-lg font-inter">Platform Management & Analytics</p>
        </div>

        {/* Stats Cards */}
        {reports && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 font-poppins">{reports.users.total_users}</div>
              <div className="text-secondary text-sm font-inter">Total Users</div>
            </div>
            <div className="glass-card rounded-3xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 font-poppins">{swaps.length}</div>
              <div className="text-secondary text-sm font-inter">Total Swaps</div>
            </div>
            <div className="glass-card rounded-3xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 font-poppins">{reports.ratings.total_ratings}</div>
              <div className="text-secondary text-sm font-inter">Total Ratings</div>
            </div>
            <div className="glass-card rounded-3xl p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 font-poppins">
                {reports.ratings.avg_rating ? parseFloat(reports.ratings.avg_rating).toFixed(1) : '0'}
              </div>
              <div className="text-secondary text-sm font-inter">Avg Rating</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="glass-card rounded-3xl p-2 mb-8">
          <div className="flex space-x-2">
            {['users', 'swaps', 'messages', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-6 rounded-2xl font-medium font-inter transition-all duration-300 ${
                  activeTab === tab
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary font-poppins">User Management</h2>
              <div className="text-secondary text-sm font-inter">{users.length} total users</div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold text-secondary">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5">
                      <td className="py-3 px-4 text-primary font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-secondary">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_banned ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {user.is_banned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => banUser(user.id, !user.is_banned)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                              user.is_banned
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {user.is_banned ? 'Unban' : 'Ban'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'swaps' && (
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary font-poppins">Swap Monitoring</h2>
              <div className="text-secondary text-sm font-inter">{swaps.length} total swaps</div>
            </div>
            
            <div className="space-y-4">
              {swaps.slice(0, 10).map((swap) => (
                <div key={swap.id} className="glass border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-primary font-medium">{swap.sender_name}</div>
                      <div className="text-secondary">→</div>
                      <div className="text-primary font-medium">{swap.receiver_name}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      swap.status === 'pending' ? 'status-pending' :
                      swap.status === 'accepted' ? 'status-accepted' : 'status-rejected'
                    }`}>
                      {swap.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-secondary">
                    <span className="text-green-400">Offered:</span> {swap.skill_offered} | 
                    <span className="text-blue-400 ml-2">Requested:</span> {swap.skill_requested}
                  </div>
                  <div className="text-xs text-muted mt-2">
                    {new Date(swap.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary font-poppins">Platform Messages</h2>
              <button
                onClick={sendPlatformMessage}
                className="btn-primary px-6 py-3 rounded-2xl font-medium font-inter"
              >
                Send Message
              </button>
            </div>
            
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📢</div>
              <p className="text-secondary font-inter">Platform messaging system ready</p>
              <p className="text-muted text-sm font-inter mt-2">Click "Send Message" to broadcast to all users</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary font-poppins">Download Reports</h2>
                <p className="text-secondary text-sm font-inter">Export platform data for analysis</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-primary mb-2 font-poppins">User Activity</h3>
                <p className="text-secondary text-sm mb-4 font-inter">Complete user engagement data</p>
                <button
                  onClick={() => downloadReport('user-activity', 'user-activity-report.csv')}
                  className="btn-primary w-full py-3 px-4 rounded-2xl font-medium font-inter"
                >
                  📥 Download CSV
                </button>
              </div>
              
              <div className="glass border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-primary mb-2 font-poppins">Feedback Logs</h3>
                <p className="text-secondary text-sm mb-4 font-inter">All ratings and reviews data</p>
                <button
                  onClick={() => downloadReport('feedback-logs', 'feedback-logs-report.csv')}
                  className="btn-primary w-full py-3 px-4 rounded-2xl font-medium font-inter"
                >
                  📥 Download CSV
                </button>
              </div>
              
              <div className="glass border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-lg font-semibold text-primary mb-2 font-poppins">Swap Stats</h3>
                <p className="text-secondary text-sm mb-4 font-inter">Complete swap request analytics</p>
                <button
                  onClick={() => downloadReport('swap-stats', 'swap-stats-report.csv')}
                  className="btn-primary w-full py-3 px-4 rounded-2xl font-medium font-inter"
                >
                  📥 Download CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;