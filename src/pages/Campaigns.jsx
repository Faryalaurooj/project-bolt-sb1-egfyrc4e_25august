import React, { useState, useEffect } from 'react';
import { FiSearch, FiMail, FiImage, FiCreditCard, FiMessageSquare, FiPlus, FiEdit2, FiUser, FiPhone, FiEye, FiRefreshCw, FiX, FiSend, FiSettings, FiCalendar } from 'react-icons/fi';
import EmailCampaignModal from '../components/campaigns/EmailCampaignModal';
import SocialMediaModal from '../components/campaigns/SocialMediaModal';
import TextCampaignModal from '../components/campaigns/TextCampaignModal';
import AddNoteModal from '../components/campaigns/AddNoteModal';
import NewContactModal from '../components/campaigns/NewContactModal';
import AddPhoneCallModal from '../components/campaigns/AddPhoneCallModal';
import AddActionItemModal from '../components/campaigns/AddActionItemModal';
import { getTextCampaigns } from '../services/api';
import PixabayImageSearchModal from "../components/media/PixabayImageSearchModal";
import { useToast } from '../hooks/useToast';

function Campaigns() {
  const { showSuccess, showInfo, showWarning, showError } = useToast();
  
  const [selectedTab, setSelectedTab] = useState('EMAIL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('Insurance');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [isAddPhoneCallModalOpen, setIsAddPhoneCallModalOpen] = useState(false);
  const [isAddActionItemModalOpen, setIsAddActionItemModalOpen] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [fabHoverLabel, setFabHoverLabel] = useState('');
  const [pixabayCards, setPixabayCards] = useState([]);
  const [loadingPixabay, setLoadingPixabay] = useState(false);
  const [searchQuery, setSearchQuery] = useState("greeting cards");
  const [selectedCards, setSelectedCards] = useState([]);
  const [textCampaigns, setTextCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isPixabayModalOpen, setIsPixabayModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  
  const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

  const fetchPixabayCards = async (query = "greeting cards") => {
    setLoadingPixabay(true);
    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&category=backgrounds&per_page=20`
      );
      const data = await response.json();
      setPixabayCards(data.hits || []);
    } catch (error) {
      console.error("Error fetching from Pixabay:", error);
      showError("Failed to load images from Pixabay");
    } finally {
      setLoadingPixabay(false);
    }
  };

  useEffect(() => {
    fetchPixabayCards();
  }, []);

  useEffect(() => {
    fetchTextCampaigns();
  }, [refreshTrigger]);

  const fetchTextCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      setCampaignsError(null);
      console.log('📱 Fetching text campaigns...');
      
      const data = await getTextCampaigns();
      setTextCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching text campaigns:', error);
      setCampaignsError(error.message || 'Failed to load campaigns');
      setTextCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const featuredPosts = [
    {
      id: 1,
      title: "New Year's Resolution - January 1",
      description: "Start the year with a fresh perspective on your insurance needs",
      image: "https://images.pexels.com/photos/1303090/pexels-photo-1303090.jpeg?auto=compress&cs=tinysrgb&w=400",
      isNew: true,
      type: 'email'
    },
    {
      id: 2,
      title: "Winter Safety Tips",
      description: "Keep your family safe during the winter months",
      image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
      isNew: false,
      type: 'social'
    },
    {
      id: 3,
      title: "Insurance Review Reminder",
      description: "Annual policy review to ensure optimal coverage",
      image: "https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=400",
      isNew: true,
      type: 'email'
    }
  ];

  const textingTemplates = [
    {
      id: 1,
      name: "Welcome New Client",
      message: "Welcome to our agency! We're excited to serve you.",
      status: "Active",
      lastUsed: "2024-02-15",
      category: "Onboarding"
    },
    {
      id: 2,
      name: "Policy Renewal Reminder",
      message: "Your policy is up for renewal. Let's schedule a review.",
      status: "Draft",
      lastUsed: "2024-02-10",
      category: "Renewals"
    },
    {
      id: 3,
      name: "Birthday Wishes",
      message: "Happy Birthday! Hope you have a wonderful day.",
      status: "Active",
      lastUsed: "2024-02-08",
      category: "Personal"
    }
  ];

  const handleCardSelect = (card) => {
    const isSelected = selectedCards.find(c => c.id === card.id);
    if (isSelected) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleUseSelectedCards = () => {
    if (selectedCards.length === 0) {
      showWarning('⚠️ Please select at least one card first');
      return;
    }
    
    // Open social media modal with the first selected card as pre-selected media
    setIsSocialModalOpen(true);
    showSuccess(`📸 ${selectedCards.length} card(s) selected for your campaign!`);
  };

  const handlePreview = (content) => {
    setPreviewContent(content);
    setIsPreviewModalOpen(true);
  };

  const handleBrowseAllFeatured = () => {
    showInfo('📚 Content Library feature coming soon! You\'ll be able to browse our complete collection of featured posts, templates, and media assets.');
  };

  const handleAddCredits = () => {
    showInfo('💳 Credit management feature coming soon! You\'ll be able to purchase and manage credits for premium content and features.');
  };

  const handleRefreshCampaigns = () => {
    setRefreshTrigger(prev => prev + 1);
    showSuccess('🔄 Campaigns refreshed successfully!');
  };

  const fabActions = [
    { 
      id: 'note', 
      icon: FiEdit2, 
      label: 'Add Note', 
      action: () => setIsAddNoteModalOpen(true),
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    { 
      id: 'contact', 
      icon: FiUser, 
      label: 'New Contact', 
      action: () => setIsNewContactModalOpen(true),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      id: 'call', 
      icon: FiPhone, 
      label: 'Add Phone Call', 
      action: () => setIsAddPhoneCallModalOpen(true),
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      id: 'action', 
      icon: FiEdit2, 
      label: 'Add Action Item', 
      action: () => setIsAddActionItemModalOpen(true),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      id: 'email', 
      icon: FiMail, 
      label: 'Send Email', 
      action: () => setIsEmailModalOpen(true),
      color: 'bg-red-500 hover:bg-red-600'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              🚀 Marketing Campaigns
            </h1>
            <p className="text-gray-600">Create and manage your email, social media, and text campaigns</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{featuredPosts.length}</div>
              <div className="text-sm text-gray-500">Featured Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{textCampaigns.length}</div>
              <div className="text-sm text-gray-500">Text Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedCards.length}</div>
              <div className="text-sm text-gray-500">Cards Selected</div>
            </div>
            <button
              onClick={handleRefreshCampaigns}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh campaigns"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex space-x-1 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 p-1 shadow-sm mb-6">
          {[
            { id: 'EMAIL', label: 'Email Campaigns', icon: FiMail },
            { id: 'SOCIAL', label: 'Social Media', icon: FiImage },
            { id: 'CARDS', label: 'Greeting Cards', icon: FiCreditCard },
            { id: 'TEXTING', label: 'Text Campaigns', icon: FiMessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 rounded-lg py-3 px-6 text-sm font-semibold transition-all duration-200 focus:outline-none ${
                selectedTab === tab.id
                  ? 'bg-white text-blue-700 shadow-md transform scale-105'
                  : 'text-blue-600 hover:bg-white hover:bg-opacity-50 hover:text-blue-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Enhanced Category Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {['ALL', 'MY TEMPLATES', 'FEATURED'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Enhanced Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 w-64 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-2 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'EMAIL' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Featured Email Campaigns</h3>
              <button
                onClick={handleBrowseAllFeatured}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Browse All Featured Posts →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.filter(post => post.type === 'email').map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-interactive-hover">
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    {post.isNew && (
                      <span className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        New!
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                    <p className="text-gray-600 text-sm mb-4">{post.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreview(post)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm flex items-center justify-center"
                      >
                        <FiEye className="mr-2 w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'SOCIAL' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Featured Social Media Posts</h3>
              <button
                onClick={handleBrowseAllFeatured}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Browse All Featured Posts →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.filter(post => post.type === 'social').map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-interactive-hover">
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    {post.isNew && (
                      <span className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        New!
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                    <p className="text-gray-600 text-sm mb-4">{post.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreview(post)}
                        className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm flex items-center justify-center"
                      >
                        <FiEye className="mr-2 w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => setIsSocialModalOpen(true)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'CARDS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Greeting Cards</h3>
                <p className="text-gray-600 text-sm">Select cards to use in your campaigns</p>
              </div>
              <div className="flex items-center space-x-4">
                {selectedCards.length > 0 && (
                  <button
                    onClick={handleUseSelectedCards}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center"
                  >
                    <FiSend className="mr-2" />
                    Use Selected Cards ({selectedCards.length})
                  </button>
                )}
                <button
                  onClick={handleAddCredits}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  Add Credits
                </button>
              </div>
            </div>

            {/* Enhanced Search for Cards */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search greeting cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-all duration-200 p-4 text-lg placeholder-gray-400"
                />
                <button
                  onClick={() => fetchPixabayCards(searchQuery)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </div>

            {loadingPixabay ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-600 ml-4 font-medium">Loading beautiful cards...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {pixabayCards.map(card => (
                  <div
                    key={card.id}
                    onClick={() => handleCardSelect(card)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 transform hover:scale-105 ${
                      selectedCards.find(c => c.id === card.id)
                        ? 'ring-4 ring-purple-500 shadow-lg'
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <img
                      src={card.webformatURL}
                      alt={card.tags}
                      className="w-full h-32 object-cover"
                    />
                    {selectedCards.find(c => c.id === card.id) && (
                      <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'TEXTING' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Text Message Templates</h3>
              <button
                onClick={() => setIsTextModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center"
              >
                <FiPlus className="mr-2" />
                New Text Campaign
              </button>
            </div>

            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-600 ml-4 font-medium">Loading text campaigns...</p>
              </div>
            ) : campaignsError ? (
              <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-red-600 font-medium mb-4">{campaignsError}</p>
                <button
                  onClick={handleRefreshCampaigns}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-green-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Template</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Used</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {textingTemplates.map(template => (
                      <tr key={template.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500 mt-1">{template.message}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(template.status)}`}>
                            {template.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {template.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(template.lastUsed).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePreview(template)}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setIsTextModalOpen(true)}
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                              title="Use Template"
                            >
                              <FiSend className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => showInfo('📝 Template editing feature coming soon!')}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit Template"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Floating Action Button */}
      <div
        className="fixed bottom-8 right-8 flex flex-col-reverse items-end space-y-reverse space-y-3"
        onMouseLeave={() => {
          setIsFabExpanded(false);
          setFabHoverLabel('');
        }}
      >
        {isFabExpanded && fabActions.map(({ id, icon: Icon, label, action, color }) => (
          <div key={id} className="flex items-center" onMouseEnter={() => setFabHoverLabel(id)}>
            {fabHoverLabel === id && (
              <span className="mr-3 py-2 px-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
                {label}
              </span>
            )}
            <button
              onClick={action}
              className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110`}
            >
              <Icon className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          onMouseEnter={() => setIsFabExpanded(true)}
          className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-110 ${isFabExpanded ? 'rotate-45' : ''}`}
        >
          <FiPlus className="w-6 h-6" />
        </button>
      </div>

      {/* Preview Modal */}
      {isPreviewModalOpen && previewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Content Preview</h3>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            {previewContent.image && (
              <img
                src={previewContent.image}
                alt={previewContent.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">{previewContent.title || previewContent.name}</h4>
              <p className="text-gray-600 text-sm">{previewContent.description || previewContent.message}</p>
              {previewContent.category && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {previewContent.category}
                </span>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  if (previewContent.type === 'email') {
                    setIsEmailModalOpen(true);
                  } else if (previewContent.type === 'social') {
                    setIsSocialModalOpen(true);
                  } else {
                    setIsTextModalOpen(true);
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Modals */}
      <EmailCampaignModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        preSelectedMedia={selectedCards.length > 0 ? selectedCards[0].webformatURL : null}
      />
      
      <SocialMediaModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        preSelectedMedia={selectedCards.length > 0 ? selectedCards[0].webformatURL : null}
      />

      <TextCampaignModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
      />

      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onNoteSaved={() => setRefreshTrigger(prev => prev + 1)}
      />

      <NewContactModal
        isOpen={isNewContactModalOpen}
        onClose={() => setIsNewContactModalOpen(false)}
        onContactSaved={() => setRefreshTrigger(prev => prev + 1)}
      />

      <AddPhoneCallModal
        isOpen={isAddPhoneCallModalOpen}
        onClose={() => setIsAddPhoneCallModalOpen(false)}
        onPhoneCallSaved={() => setRefreshTrigger(prev => prev + 1)}
      />

      <AddActionItemModal
        isOpen={isAddActionItemModalOpen}
        onClose={() => setIsAddActionItemModalOpen(false)}
        onActionItemSaved={() => setRefreshTrigger(prev => prev + 1)}
      />

      <PixabayImageSearchModal
        isOpen={isPixabayModalOpen}
        onClose={() => setIsPixabayModalOpen(false)}
        onSelect={(imageUrl) => {
          setSelectedCards([...selectedCards, { id: Date.now(), webformatURL: imageUrl }]);
          setIsPixabayModalOpen(false);
          showSuccess('📸 Image added to selection!');
        }}
      />
    </div>
  );
}

export default Campaigns;