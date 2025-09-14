import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';

const ImageUpload = ({ currentImage, onImageUpdate, size = 'large' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    xlarge: 'w-32 h-32'
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await uploadAPI.uploadProfileImage(formData);
      onImageUpdate(response.data.imageUrl);
      setPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setPreview(null);
    }
    setUploading(false);
  };

  const getImageUrl = () => {
    if (preview) return preview;
    if (currentImage) return `http://localhost:5001${currentImage}`;
    return null;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl cursor-pointer group`}>
        {getImageUrl() ? (
          <img
            src={getImageUrl()}
            alt="Profile"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onClick={triggerFileInput}
          />
        ) : (
          <div 
            onClick={triggerFileInput}
            className="w-full h-full flex items-center justify-center text-white font-bold text-xl transition-transform duration-300 group-hover:scale-110"
          >
            +
          </div>
        )}
      </div>
      
      {/* Upload Button */}
      <button
        onClick={triggerFileInput}
        disabled={uploading}
        className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50"
        title="Change profile picture"
      >
        {uploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;