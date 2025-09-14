import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, ratingsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchUserRatings();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await usersAPI.getUserById(userId);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    setLoading(false);
  };

  const fetchUserRatings = async () => {
    try {
      const response = await ratingsAPI.getUserRatings(userId);
      setRatings(response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return (sum / ratings.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">User Not Found</h2>
          <button onClick={() => navigate('/browse')} className="btn-primary px-6 py-3 rounded-2xl">
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  if (!profile.is_public && profile.id !== currentUser?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-3xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-primary mb-4">Private Profile</h2>
          <p className="text-secondary mb-6">This user has set their profile to private.</p>
          <button onClick={() => navigate('/browse')} className="btn-primary px-6 py-3 rounded-2xl">
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/browse')}
          className="btn-secondary px-4 py-2 rounded-2xl mb-6 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse
        </button>

        {/* Profile Header */}
        <div className="glass-card rounded-3xl p-8 mb-8 animate-fadeInUp">
          <div className="flex flex-col md:flex-row items-center mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-6 md:mb-0 md:mr-8 shadow-2xl">
              {profile.profile_photo_url ? (
                <img
                  src={`http://localhost:5001${profile.profile_photo_url}`}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-primary font-poppins mb-2">{profile.name}</h1>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                {profile.location && (
                  <div className="flex items-center text-secondary">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {profile.location}
                  </div>
                )}
                
                {profile.availability && (
                  <div className="flex items-center text-secondary">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {profile.availability}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-amber-400 mr-2">{getAverageRating()}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(getAverageRating()) ? 'text-amber-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-secondary text-sm ml-2">({ratings.length} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Skills Offered */}
          <div className="glass-card rounded-3xl p-8 animate-fadeInUp">
            <h2 className="text-xl font-bold text-primary mb-6 font-poppins flex items-center">
              <span className="text-2xl mr-3">🎓</span>
              Skills They Can Teach
            </h2>
            <div className="space-y-3">
              {profile.skills_offered?.map((skill, index) => (
                <div key={index} className="skill-tag-offered p-3 rounded-2xl">
                  {skill}
                </div>
              )) || <p className="text-muted">No skills listed yet</p>}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="glass-card rounded-3xl p-8 animate-fadeInUp">
            <h2 className="text-xl font-bold text-primary mb-6 font-poppins flex items-center">
              <span className="text-2xl mr-3">📚</span>
              Skills They Want to Learn
            </h2>
            <div className="space-y-3">
              {profile.skills_wanted?.map((skill, index) => (
                <div key={index} className="skill-tag-wanted p-3 rounded-2xl">
                  {skill}
                </div>
              )) || <p className="text-muted">No learning goals listed yet</p>}
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="glass-card rounded-3xl p-8 animate-fadeInUp">
          <h2 className="text-xl font-bold text-primary mb-6 font-poppins flex items-center">
            <span className="text-2xl mr-3">⭐</span>
            Reviews & Feedback
          </h2>
          
          {ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.slice(0, 5).map((rating) => (
                <div key={rating.id} className="glass border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= rating.score ? 'text-amber-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-muted">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="text-secondary text-sm">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-8">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;