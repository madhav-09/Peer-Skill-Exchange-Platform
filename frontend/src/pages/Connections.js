import React, { useState, useEffect } from 'react';
import { swapsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Messages from '../components/Messages';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await swapsAPI.getSwaps();
      // Only show accepted swaps as connections
      const acceptedSwaps = response.data.filter(swap => swap.status === 'accepted');
      setConnections(acceptedSwaps);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-secondary font-inter">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 via-blue-600 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold font-poppins bg-gradient-to-r from-green-500 via-blue-600 to-purple-500 bg-clip-text text-transparent mb-4">
            Your Connections
          </h1>
          <p className="text-muted text-xl font-inter max-w-2xl mx-auto">
            Chat with people you've connected with through skill swaps
          </p>
        </div>

        {connections.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center animate-fadeInUp">
            <div className="text-6xl mb-6">🤝</div>
            <h3 className="text-2xl font-bold text-primary mb-4 font-poppins">No Connections Yet</h3>
            <p className="text-secondary font-inter mb-6 max-w-md mx-auto">
              Accept swap requests to start building your network of skill exchange partners
            </p>
            <a href="/browse" className="btn-primary px-8 py-3 rounded-2xl font-medium font-inter inline-block">
              Browse Users
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection, index) => {
              const otherUser = connection.sender_id === user.id 
                ? { id: connection.receiver_id, name: connection.receiver_name, photo: connection.receiver_photo }
                : { id: connection.sender_id, name: connection.sender_name, photo: connection.sender_photo };

              return (
                <div 
                  key={connection.id} 
                  className="glass-card rounded-3xl p-6 animate-fadeInUp cursor-pointer hover:scale-105 transition-transform duration-300" 
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={() => setSelectedConnection(connection)}
                >
                  {/* User Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                      {otherUser.photo ? (
                        <img
                          src={`http://localhost:5001${otherUser.photo}`}
                          alt={otherUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-primary text-lg font-poppins">
                        {otherUser.name}
                      </h3>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Skills Exchange */}
                  <div className="mb-4 p-3 glass rounded-2xl">
                    <div className="text-sm text-secondary font-inter mb-2">
                      <span className="text-green-400 font-medium">🎓 Teaching:</span> {connection.skill_offered}
                    </div>
                    <div className="text-sm text-secondary font-inter">
                      <span className="text-blue-400 font-medium">📚 Learning:</span> {connection.skill_requested}
                    </div>
                  </div>

                  {/* Connection Date */}
                  <div className="text-xs text-muted font-inter mb-4">
                    📅 Connected on {new Date(connection.updated_at || connection.created_at).toLocaleDateString()}
                  </div>

                  {/* Message Button */}
                  <button className="btn-primary w-full py-3 px-6 rounded-2xl font-semibold font-inter">
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Messages Modal */}
        {selectedConnection && (
          <Messages 
            swap={selectedConnection} 
            onClose={() => setSelectedConnection(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default Connections;