import React, { useState, useEffect } from 'react';
import { ratingsAPI, swapsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Ratings = () => {
  const [completedSwaps, setCompletedSwaps] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [rating, setRating] = useState({
    score: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchCompletedSwaps();
      fetchMyRatings();
    }
  }, [user]);

  const fetchCompletedSwaps = async () => {
    try {
      const response = await swapsAPI.getSwaps();
      const accepted = response.data.filter(swap => 
        swap.status === 'accepted' && 
        (swap.sender_id === user.id || swap.receiver_id === user.id)
      );
      setCompletedSwaps(accepted);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    }
  };

  const fetchMyRatings = async () => {
    try {
      console.log('Fetching ratings for user ID:', user.id);
      const response = await ratingsAPI.getGivenRatings(user.id);
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      setMyRatings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching ratings:', error.response || error);
      setMyRatings([]);
    }
  };

  const submitRating = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await ratingsAPI.addRating({
        swap_id: selectedSwap.id,
        rated_user: selectedSwap.sender_id === user.id ? selectedSwap.receiver_id : selectedSwap.sender_id,
        score: rating.score,
        comment: rating.comment
      });
      
      // Show notification
      const event = new CustomEvent('showNotification', {
        detail: { 
          type: 'success', 
          title: 'Rating Submitted!', 
          message: 'Thank you for your feedback' 
        }
      });
      window.dispatchEvent(event);
      
      setSelectedSwap(null);
      setRating({ score: 5, comment: '' });
      // Refresh data after successful rating
      await fetchMyRatings();
      await fetchCompletedSwaps();
    } catch (error) {
      const event = new CustomEvent('showNotification', {
        detail: { type: 'error', title: 'Rating Failed', message: 'Unable to submit rating' }
      });
      window.dispatchEvent(event);
    }
    setLoading(false);
  };

  const hasRated = (swapId) => {
    return myRatings.some(r => r.swap_id === parseInt(swapId));
  };

  return (
    <div className="min-h-screen px-4 py-8 transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-4xl font-bold font-poppins bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            Ratings & Feedback
          </h1>
          <p className="text-muted text-lg font-inter">Share your experience and build trust in the community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rate Completed Swaps */}
          <div className="glass-card rounded-3xl p-8 animate-fadeInUp">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary font-poppins">Rate Your Swaps</h2>
                <p className="text-secondary text-sm font-inter">{completedSwaps.length} completed swaps</p>
              </div>
            </div>
            
            {completedSwaps.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🤝</div>
                <p className="text-secondary font-inter">No completed swaps yet</p>
                <p className="text-muted text-sm font-inter mt-2">Complete some skill swaps to leave ratings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedSwaps.map((swap) => (
                  <div key={swap.id} className="glass border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-primary font-poppins">
                          {swap.sender_id === user.id ? swap.receiver_name : swap.sender_name}
                        </h3>
                        <p className="text-sm text-secondary font-inter">
                          <span className="text-green-400">🎓 {swap.skill_offered}</span> ↔ 
                          <span className="text-blue-400 ml-1">📚 {swap.skill_requested}</span>
                        </p>
                      </div>
                      
                      {hasRated(swap.id) ? (
                        <span className="status-accepted px-3 py-1 rounded-full text-xs font-medium">
                          ✅ Rated
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedSwap(swap)}
                          className="btn-primary px-4 py-2 rounded-xl text-sm font-medium font-inter"
                        >
                          ⭐ Rate
                        </button>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted font-inter">
                      📅 Completed: {new Date(swap.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Reviews */}
          <div className="glass-card rounded-3xl p-8 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary font-poppins">My Reviews</h2>
                <p className="text-secondary text-sm font-inter">{myRatings.length} reviews given</p>
              </div>
            </div>
            
            {myRatings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-secondary font-inter">No reviews yet</p>
                <p className="text-muted text-sm font-inter mt-2">Rate completed swaps to see your reviews here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRatings.map((review) => (
                  <div key={review.id} className="glass border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-primary font-poppins text-sm">
                          Rated: {review.rated_user_name}
                        </h4>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= review.score ? 'text-amber-400' : 'text-gray-400'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-xs text-secondary font-inter">
                            {review.score}/5 stars
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted font-inter">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <div className="mt-2">
                        <p className="text-sm text-secondary font-inter italic">
                          "{review.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rating Modal */}
        {selectedSwap && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeInUp">
            <div className="glass-card rounded-3xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">⭐</span>
                </div>
                <h3 className="text-2xl font-bold text-primary font-poppins mb-2">
                  Rate Your Experience
                </h3>
                <p className="text-secondary font-inter">
                  with {selectedSwap.sender_id === user.id ? selectedSwap.receiver_name : selectedSwap.sender_name}
                </p>
              </div>
              
              <form onSubmit={submitRating} className="space-y-6">
                <div>
                  <label className="block text-secondary text-sm font-semibold mb-3 font-inter">
                    ⭐ Rating
                  </label>
                  <div className="flex justify-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating({...rating, score: star})}
                        className={`w-10 h-10 rounded-full transition-all duration-300 ${
                          star <= rating.score 
                            ? 'text-amber-400 scale-110' 
                            : 'text-gray-400 hover:text-amber-300'
                        }`}
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-secondary font-inter">
                    {rating.score === 1 && "Poor experience"}
                    {rating.score === 2 && "Below average"}
                    {rating.score === 3 && "Average experience"}
                    {rating.score === 4 && "Good experience"}
                    {rating.score === 5 && "Excellent experience"}
                  </p>
                </div>

                <div>
                  <label className="block text-secondary text-sm font-semibold mb-3 font-inter">
                    💬 Feedback (Optional)
                  </label>
                  <textarea
                    value={rating.comment}
                    onChange={(e) => setRating({...rating, comment: e.target.value})}
                    className="input-glass w-full px-4 py-4 rounded-2xl focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 resize-none font-inter"
                    rows="4"
                    placeholder="Share your experience with this skill swap..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedSwap(null)}
                    className="btn-secondary flex-1 py-3 px-6 rounded-2xl font-semibold font-inter"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 py-3 px-6 rounded-2xl font-semibold font-inter disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Submit Rating
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ratings;