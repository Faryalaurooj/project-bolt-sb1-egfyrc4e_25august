import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiImage, FiCalendar, FiLink, FiArrowLeft, FiUpload } from 'react-icons/fi';
import { createSocialMediaPost, updateSocialMediaPost, getSocialMediaPosts } from '../../services/api';
import PixabayImageSearchModal from'../media/PixabayImageSearchModal';

function SocialMediaModal({ isOpen, onClose, preSelectedMedia }) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [postFrom, setPostFrom] = useState('Alisha Hanif');
  const [isPixabayModalOpen, setIsPixabayModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set pre-selected media when modal opens
  useEffect(() => {
    if (preSelectedMedia && isOpen) {
      setMediaUrl(preSelectedMedia);
    }
  }, [preSelectedMedia, isOpen]);

  const platforms = [
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', color: 'bg-sky-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-600' }
  ];

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleImageSelect = (imageUrl) => {
    setMediaUrl(imageUrl);
    setIsPixabayModalOpen(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setMediaUrl(fileUrl);
    }
  };

  const handleSaveAs = async () => {
    if (!content.trim()) {
      alert('Please enter content for your post');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const postData = {
        content: content,
        platforms: selectedPlatforms,
        media_url: mediaUrl || null,
        scheduled_at: scheduledAt || null,
        status: 'draft'
      };

      await createSocialMediaPost(postData);
      alert('Post saved as draft successfully!');
      
      // Reset form
      setContent('');
      setSelectedPlatforms([]);
      setMediaUrl('');
      setScheduledAt('');
      
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    await handleSaveAs(); // Same as save for now
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      alert('Please enter content for your post');
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform to share on');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const postData = {
        content: content,
        platforms: selectedPlatforms,
        media_url: mediaUrl || null,
        scheduled_at: scheduledAt || null,
        status: scheduledAt ? 'scheduled' : 'posted'
      };

      await createSocialMediaPost(postData);
      alert(`Post ${scheduledAt ? 'scheduled' : 'created'} successfully!`);
      
      // Reset form
      setContent('');
      setSelectedPlatforms([]);
      setMediaUrl('');
      setScheduledAt('');
      
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAssistant = () => {
    alert('AI Assistant functionality coming soon!');
  };

  const characterCount = content.length;
  const maxCharacters = 2200;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-6xl mx-4 rounded-lg shadow-xl flex">
            <div className="flex-1 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <button onClick={onClose} className="mr-4 text-gray-500 hover:text-gray-700">
                    <FiArrowLeft className="h-6 w-6" />
                  </button>
                  <h2 className="text-xl font-semibold text-blue-600">New Post ✏️</h2>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveAs}
                    disabled={loading}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium border border-blue-600 rounded-md disabled:opacity-50"
                  >
                    Save as
                  </button>
                  <button
                    onClick={handleSaveAsDraft}
                    disabled={loading}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium border border-blue-600 rounded-md disabled:opacity-50"
                  >
                    Save as draft
                  </button>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post From:
                </label>
                <div className="flex items-center">
                  <select 
                    value={postFrom}
                    onChange={(e) => setPostFrom(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option>Alisha Hanif</option>
                  </select>
                  <div className="ml-2 text-blue-500">ℹ️</div>
                </div>
              </div>

              <button 
                onClick={handleAIAssistant}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <span className="mr-2">✨</span>
                Write post with our AI assistant
              </button>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where to Share
                </label>
                <div className="text-sm text-gray-500 mb-3">
                  Selected user is currently not linked to any social media accounts.
                </div>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedPlatforms.includes(platform.id)
                          ? `${platform.color} text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Write your post content here..."
                  maxLength={maxCharacters}
                />
                <div className="flex justify-end items-center mt-2">
                  <span className="text-sm text-gray-500">
                    😊 {characterCount} / {maxCharacters} characters
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Media
                </label>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setIsPixabayModalOpen(true)}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FiImage className="mr-2" />
                    📷 Free Media
                  </button>
                  <label className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <FiUpload className="mr-2" />
                    + Upload Media
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  <span className="italic">Royalty free media library</span>
                  <span className="ml-8 italic">Choose file from your computer</span>
                </div>

                {mediaUrl && (
                  <div className="mt-4">
                    <img
                      src={mediaUrl}
                      alt="Selected media"
                      className="max-w-xs h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => setMediaUrl('')}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove media
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Post
                </label>
                <div className="flex items-center">
                  <FiCalendar className="text-gray-400 mr-2" />
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="btn-interactive-hover px-4 py-2 font-medium rounded-md disabled:opacity-50 disabled:hover:transform-none disabled:hover:scale-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={loading}
                  className="btn-interactive-hover-primary px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:scale-100"
                >
                  {loading ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </div>

            {/* Right Side Illustration */}
            <div className="w-80 p-6 bg-gray-50 flex flex-col items-center justify-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Let's create a post</h3>
              <img
                src="https://images.pexels.com/photos/7015034/pexels-photo-7015034.jpeg"
                alt="Social Media Post Creation"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </Dialog>

      <PixabayImageSearchModal
        isOpen={isPixabayModalOpen}
        onClose={() => setIsPixabayModalOpen(false)}
        onSelect={handleImageSelect}
      />
    </>
  );
}

export default SocialMediaModal;