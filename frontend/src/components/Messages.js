import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Messages = ({ swap, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const otherUser = swap.sender_id === user.id 
    ? { id: swap.receiver_id, name: swap.receiver_name, photo: swap.receiver_photo }
    : { id: swap.sender_id, name: swap.sender_name, photo: swap.sender_photo };

  useEffect(() => {
    fetchMessages();
    markAsRead();
  }, [swap.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for swap:', swap.id);
      const response = await messagesAPI.getMessages(swap.id);
      console.log('Messages response:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const markAsRead = async () => {
    try {
      await messagesAPI.markAsRead(swap.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      console.log('Sending message:', {
        swap_id: swap.id,
        receiver_id: otherUser.id,
        message: newMessage.trim()
      });
      const response = await messagesAPI.sendMessage({
        swap_id: swap.id,
        receiver_id: otherUser.id,
        message: newMessage.trim()
      });
      console.log('Message sent:', response.data);
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-3xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
              {otherUser.photo ? (
                <img src={`http://localhost:5001${otherUser.photo}`} alt={otherUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold">{otherUser.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary font-poppins">{otherUser.name}</h3>
              <p className="text-sm text-secondary font-inter">
                {swap.skill_offered} ↔ {swap.skill_requested}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender_id === user.id 
                  ? 'bg-blue-500 text-white' 
                  : 'glass border border-white/10 text-primary'
              }`}>
                <p className="text-sm font-inter">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === user.id ? 'text-blue-100' : 'text-secondary'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="input-glass flex-1 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-inter"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="btn-primary px-6 py-3 rounded-2xl font-semibold font-inter disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Messages;