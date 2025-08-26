import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch } from 'react-icons/fi';

function PixabayImageSearchModal({ isOpen, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchImages = async (query = 'business') => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;
      const response = await fetch(
        `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&category=business&min_width=640&per_page=20&safesearch=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.hits || []);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images. Please try again.');
      // Fallback to sample images if API fails
      setImages([
        {
          id: 1,
          webformatURL: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=640',
          tags: 'business, office, professional'
        },
        {
          id: 2,
          webformatURL: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=640',
          tags: 'team, meeting, collaboration'
        },
        {
          id: 3,
          webformatURL: 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg?auto=compress&cs=tinysrgb&w=640',
          tags: 'success, growth, chart'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      searchImages('business');
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchImages(searchTerm);
  };

  const handleImageSelect = (image) => {
    onSelect(image.webformatURL);
    onClose();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    searchImages('business');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white w-full max-w-6xl mx-4 rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center">
              <Dialog.Title className="text-xl font-semibold text-gray-900 mr-4">
                Add Media
              </Dialog.Title>
              <div className="text-sm text-gray-500">
                Powered by <span className="font-medium">Pixabay</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md">
                  IMAGES
                </button>
              </div>
              
              <form onSubmit={handleSearch} className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for royalty free images"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Clear Search
                </button>
              </form>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                <p className="text-gray-600 ml-2">Loading images...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => searchImages(searchTerm || 'business')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => handleImageSelect(image)}
                    className="cursor-pointer group relative overflow-hidden rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={image.webformatURL}
                      alt={image.tags}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && images.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No images found. Try a different search term.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default PixabayImageSearchModal;