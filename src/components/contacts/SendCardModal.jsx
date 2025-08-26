import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch } from 'react-icons/fi';
import { getCardTemplates } from '../../services/api';

function SendCardModal({ isOpen, onClose, selectedContacts }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('Insurance');
  const [selectedCategory, setSelectedCategory] = useState('Congrats');
  const [cardTemplates, setCardTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['Congrats', 'Holiday', 'Birthday', 'Thank You', 'Sympathy', 'Business', 'Blank'];
  const industries = ['Insurance', 'Financial', 'Real Estate', 'Healthcare'];

  useEffect(() => {
    if (isOpen) {
      fetchCardTemplates();
    }
  }, [isOpen]);

  const fetchCardTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const templates = await getCardTemplates();
      setCardTemplates(templates || []);
    } catch (err) {
      console.error('Error fetching card templates:', err);
      setError('Failed to load card templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cardTemplates.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'All' || card.industry === selectedIndustry;
    return matchesSearch && matchesCategory && matchesIndustry;
  });

  const handleSendCard = (card) => {
    console.log(`Sending ${card.name} to ${selectedContacts.length} contacts`);
    alert(`Card "${card.name}" will be sent to ${selectedContacts.length} contact(s)`);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-6xl mx-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Select Card to Send
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search card type or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="All">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
              <p className="text-gray-600 ml-2">Loading card templates...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchCardTemplates}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCards.map(card => (
                <div key={card.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{card.name}</h3>
                      <p className="text-xs text-gray-500">{card.category}</p>
                    </div>
                    <button
                      onClick={() => handleSendCard(card)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      Choose Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredCards.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No cards found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

export default SendCardModal;