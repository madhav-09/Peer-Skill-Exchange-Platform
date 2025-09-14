import React, { useState, useEffect } from 'react';
import { swapsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Messages from '../components/Messages';
import { useTheme } from '../hooks/useTheme';

const Swaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const response = await swapsAPI.getSwaps();
      setSwaps(response.data);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    }
    setLoading(false);
  };

  const updateSwapStatus = async (swapId, status) => {
    try {
      await swapsAPI.updateSwapStatus(swapId, status);
      fetchSwaps();
      
      // Show notification
      const event = new CustomEvent('showNotification', {
        detail: { 
          type: status === 'accepted' ? 'success' : 'warning', 
          title: `Swap Request ${status.charAt(0).toUpperCase() + status.slice(1)}`, 
          message: `You have ${status} the swap request` 
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      const event = new CustomEvent('showNotification', {
        detail: { type: 'error', title: 'Update Failed', message: 'Error updating swap status' }
      });
      window.dispatchEvent(event);
    }
  };

  const deleteSwapRequest = async (swapId) => {
    if (window.confirm('Are you sure you want to delete this swap request?')) {
      try {
        await swapsAPI.deleteSwapRequest(swapId);
        fetchSwaps();
        
        // Show success notification
        const event = new CustomEvent('showNotification', {
          detail: { 
            type: 'success', 
            title: 'Request Deleted', 
            message: 'Swap request deleted successfully' 
          }
        });
        window.dispatchEvent(event);
      } catch (error) {
        // Show error notification
        const event = new CustomEvent('showNotification', {
          detail: { type: 'error', title: 'Delete Failed', message: 'Error deleting swap request' }
        });
        window.dispatchEvent(event);
      }
    }
  };

  const sentRequests = swaps.filter(swap => swap.sender_id === user.id);
  const receivedRequests = swaps.filter(swap => swap.receiver_id === user.id);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      default: return '⏳';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-secondary font-inter">Loading your swaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-4xl font-bold font-poppins bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
            Skill Swap Requests
          </h1>
          <p className="text-muted text-lg font-inter">Manage your incoming and outgoing swap requests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Received Requests */}
          <div className="glass-card rounded-3xl p-8 animate-fadeInUp">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">📥</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary font-poppins">Received Requests</h2>
                <p className="text-secondary text-sm font-inter">{receivedRequests.length} requests</p>
              </div>
            </div>
            
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📬</div>
                <p className="text-secondary font-inter">No requests received yet</p>
                <p className="text-muted text-sm font-inter mt-2">Share your skills to get swap requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedRequests.map((swap, index) => (
                  <div 
                    key={swap.id} 
                    className="glass border border-white/10 rounded-2xl p-6 animate-fadeInUp"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="avatar w-12 h-12 rounded-full text-sm font-bold">
                          {swap.sender_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold text-primary font-poppins">{swap.sender_name}</h3>
                          <span className={`${getStatusColor(swap.status)} px-3 py-1 rounded-full text-xs font-medium inline-flex items-center`}>
                            {getStatusIcon(swap.status)} {swap.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSwapRequest(swap.id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-300 p-2 hover:bg-red-500/10 rounded-xl"
                        title="Delete request"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-secondary font-inter">
                        <span className="text-green-400 font-medium">🎓 Offering:</span> {swap.skill_offered}
                      </p>
                      <p className="text-sm text-secondary font-inter">
                        <span className="text-blue-400 font-medium">📚 Wants:</span> {swap.skill_requested}
                      </p>
                      {swap.message && (
                        <p className="text-sm text-muted font-inter bg-white/5 p-3 rounded-xl mt-3">
                          <span className="font-medium">💬 Message:</span> {swap.message}
                        </p>
                      )}
                    </div>

                    {swap.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateSwapStatus(swap.id, 'accepted')}
                          className="btn-primary flex-1 py-2 px-4 rounded-xl text-sm font-medium font-inter"
                        >
                          ✅ Accept
                        </button>
                        <button
                          onClick={() => updateSwapStatus(swap.id, 'rejected')}
                          className="btn-secondary flex-1 py-2 px-4 rounded-xl text-sm font-medium font-inter border-red-500/30 text-red-300 hover:bg-red-500/10"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {swap.status === 'accepted' && (
                      <button
                        onClick={() => setSelectedSwap(swap)}
                        className="btn-primary w-full py-2 px-4 rounded-xl text-sm font-medium font-inter flex items-center justify-center"
                      >
                        💬 Message {swap.sender_name}
                      </button>
                    )}

                    <div className="text-xs text-muted mt-3 font-inter">
                      📅 {new Date(swap.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div className="glass-card rounded-3xl p-8 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">📤</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary font-poppins">Sent Requests</h2>
                <p className="text-secondary text-sm font-inter">{sentRequests.length} requests sent</p>
              </div>
            </div>
            
            {sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-secondary font-inter">No requests sent yet</p>
                <p className="text-muted text-sm font-inter mt-2">Browse users to send swap requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((swap, index) => (
                  <div 
                    key={swap.id} 
                    className="glass border border-white/10 rounded-2xl p-6 animate-fadeInUp"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="avatar w-12 h-12 rounded-full text-sm font-bold">
                          {swap.receiver_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold text-primary font-poppins">{swap.receiver_name}</h3>
                          <span className={`${getStatusColor(swap.status)} px-3 py-1 rounded-full text-xs font-medium inline-flex items-center`}>
                            {getStatusIcon(swap.status)} {swap.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {swap.status === 'pending' && (
                        <button
                          onClick={() => deleteSwapRequest(swap.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-300 p-2 hover:bg-red-500/10 rounded-xl"
                          title="Cancel request"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-secondary font-inter">
                        <span className="text-green-400 font-medium">🎓 You offered:</span> {swap.skill_offered}
                      </p>
                      <p className="text-sm text-secondary font-inter">
                        <span className="text-blue-400 font-medium">📚 You requested:</span> {swap.skill_requested}
                      </p>
                      {swap.message && (
                        <p className="text-sm text-muted font-inter bg-white/5 p-3 rounded-xl mt-3">
                          <span className="font-medium">💬 Your message:</span> {swap.message}
                        </p>
                      )}
                    </div>

                    {swap.status === 'accepted' && (
                      <button
                        onClick={() => setSelectedSwap(swap)}
                        className="btn-primary w-full py-2 px-4 rounded-xl text-sm font-medium font-inter flex items-center justify-center mb-3"
                      >
                        💬 Message {swap.receiver_name}
                      </button>
                    )}

                    <div className="text-xs text-muted font-inter">
                      📅 Sent on {new Date(swap.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="glass-card rounded-3xl p-8 mt-8 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary mb-6 font-poppins">Your Swap Activity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 font-poppins">{receivedRequests.length}</div>
                <div className="text-secondary text-sm font-inter">Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 font-poppins">{sentRequests.length}</div>
                <div className="text-secondary text-sm font-inter">Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 font-poppins">
                  {swaps.filter(s => s.status === 'accepted').length}
                </div>
                <div className="text-secondary text-sm font-inter">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400 font-poppins">
                  {swaps.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-secondary text-sm font-inter">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Modal */}
        {selectedSwap && (
          <Messages 
            swap={selectedSwap} 
            onClose={() => setSelectedSwap(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default Swaps;