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
import { createEmailTemplate, updateEmailTemplate, getEmailTemplates } from '../services/api';

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


  // Email templates state
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailModalMode, setEmailModalMode] = useState('send'); // 'send', 'edit', 'saveAs'
  
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
    fetchEmailTemplates();
  }, [refreshTrigger]);

  const fetchEmailTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const templates = await getEmailTemplates();
      
      // Add sample Keep-in-Touch templates based on screenshots
      const keepInTouchTemplates = [
        {
          id: 'kit-1',
          title: 'September Email Newsletter - Customize',
          subject: 'September Newsletter - Fall Preparation Tips',
          content: `Hi {first_name},

As we transition into fall, it's a great time to prepare for the season ahead. Here are some tips to help you get ready:

1. Home maintenance checklist
2. Insurance coverage review
3. Emergency preparedness

Stay safe and prepared!

Best regards,
Your Insurance Team`
        }
      ];

      setEmailTemplates(templates || []);
      // Add sample templates if none exist
      const sampleTemplates = [
        {
          id: 'sample-1',
          title: 'John Calendar Link',
          subject: 'John Calendar Link',
          content: `Hi {first_name},

15 Minute Phone call

Sincerely,
Alisha Hanif
Customer Service Manager at Cusmano Agency
Phone 203-394-6645 Fax 203-394-6646
Web www.cusmanoagency.com
Email alisha@cusmanoagency.com
425 Kings Hwy E, Fairfield, CT 06825`,
          category: 'MY TEMPLATES',
          created_at: new Date().toISOString()
        },
        { 
          id: 'sample-2',
          title: 'New Policy Email',
          subject: 'Your Insurance Policies',
          content: `Hi {first_name},

This is {sender first_name} from the Cusmano Agency. I wanted to let you know that your {{policy type}} insurance policies have been successfully issued by {{carrier name}}. I have provided the new homeowners' policy information to your mortgage company as well.

I've also sent you an email via PandaDoc with a request to complete e-signatures. This will ensure your policy is fully finalized. Please be on the lookout for that, as it\'s the final step.

For your convenience, I'm sending this email separately with the remaining policy documents attached. You can keep them for your records. If you have any questions or need assistance, don\'t hesitate to reach out - I'm here to help!

Thank you for choosing The Cusmano Agency and {{carrier name}}. I look forward to assisting you with any future needs.

Sincerely,
Alisha Hanif
Customer Service Manager at Cusmano Agency
Phone 203-394-6645 Fax 203-394-6646
Web www.cusmanoagency.com
Email alisha@cusmanoagency.com
425 Kings Hwy E, Fairfield, CT 06825`,
          category: 'MY TEMPLATES',
          created_at: new Date().toISOString()
        },
        { 
          id: 'sample-3',
          title: 'Renewals',
          subject: 'Upcoming Renewal',
          content: `Dear {first_name},

We wanted to remind you that your insurance policy with our agency is up for renewal in the next 45 days.

As part of our commitment to providing excellent service, Penny at The Cusmano Agency will be reviewing your premiums to ensure you have the best coverage at the most competitive rates. If you have any concerns or questions regarding your policy or if there are any changes you would like to make, please do not hesitate to reach out to Penny. She can be reached 203-394-6645 or email at penny@cusmanoagency.com.

Thank you for choosing The Cusmano Agency for your insurance needs. We value your business and look forward to serving you for another year.

Sincerely,
Alisha Hanif
Customer Service Manager at Cusmano Agency
Phone 203-394-6645 Fax 203-394-6646
Web www.cusmanoagency.com
Email alisha@cusmanoagency.com
425 Kings Hwy E, Fairfield, CT 06825`,
          category: 'MY TEMPLATES',
          created_at: new Date().toISOString()
        },
        { 
          id: 'keep-1',
          title: 'Back-to-School Check-In - Formal',
          subject: 'Quick check-in',
          content: `Hi {first_name},

I hope you're doing well. As the back-to-school season kicks into gear, I just wanted to take a moment to check in.

This time of year often brings new routines and full calendars, and I know how quickly things can get busy. If there's anything you need from me or any way I can be a resource during this transition, please don\'t hesitate to reach out.

Wishing you and your family a smooth and successful start to the school year.

Take care,

Sincerely,
Alisha Hanif
Customer Service Manager at Cusmano Agency
Phone 203-394-6645 Fax 203-394-6646
Web www.cusmanoagency.com
Email alisha@cusmanoagency.com
425 Kings Hwy E, Fairfield, CT 06825`,
          category: 'KEEP-IN-TOUCH',
          created_at: new Date().toISOString(),
          autoStop: '9/16/2025'
        }, 
        {
          id: 'keep-2',
          title: 'Football is Back - GIF - Check-In - Customize',
          subject: 'Checking in',
          content: `Hi {first_name},

I hope you're doing well. With football season underway, I wanted to drop a quick note and say that I hope your favorite team is off to a strong start. At the end of the day, though, football is officially back, which is already a win!

That said, if there's anything I can do to help you score some [INDUSTRY/SERVICE] wins off the field this fall, don\'t hesitate to reach out. I'm here to support you however I can.

Best,

Sincerely,
Alisha Hanif
Customer Service Manager at Cusmano Agency
Phone 203-394-6645 Fax 203-394-6646
Web www.cusmanoagency.com
Email alisha@cusmanoagency.com
425 Kings Hwy E, Fairfield, CT 06825`,
          category: 'KEEP-IN-TOUCH',
          created_at: new Date().toISOString(),
          autoStop: '11/1/2025',
          hasGif: true
        },
        {
          id: 'keep-3',
          title: 'Checking In Post Tornados - Insurance Reminders',
          subject: 'Checking in post-storm',
          content: `Hi {first_name},

I hope you're doing well. After the recent tornados in our area, I wanted to reach out and check in on you and your family. I know how scary these storms can be, and I hope you\'re safe and beginning to recover from any impact.

However, if your property was affected, please know I'm here to help guide you through the next steps. Below are a few important steps to take in the days following a storm like this:

*   Start your claim as soon as you can. Even if you're still assessing the full extent of the damage, it's smart to begin the claims process early. Insurance companies tend to receive a high volume of claims after major weather events, and getting started sooner can help avoid delays.
*   Document all damage. When it\'s safe to do so, use your phone to take photos and videos of any damage — both wide shots and close-ups. This can be essential in supporting your claim.
*   Keep your receipts. If you've had to stay somewhere temporarily or cover other unexpected expenses (like meals or emergency repairs), hold onto those receipts. Depending on your policy, some of these costs may be reimbursed.
*   Review your policy. Now is a good time to revisit your coverage details — especially with more spring and summer storms likely ahead. Understanding what your policy includes can make the recovery process clearer.
*   Inspect for hidden damage. Even if things seem okay at first glance, check your roof, siding, windows, and foundation for smaller issues that might become bigger problems down the road.

Please don't hesitate to reach out if you have questions or need help navigating anything. I\'m here for you — whether you need help filing a claim, understanding your coverage, or just talking through the next steps.

Take care and stay safe,

Sincerely,
Alisha Hanif
Customer Service Manager at Cusmano Agency
Phone 203-394-6645 Fax 203-394-6646
Web www.cusmanoagency.com
Email alisha@cusmanoagency.com
425 Kings Hwy E, Fairfield, CT 06825`,
          category: 'KEEP-IN-TOUCH',
          created_at: new Date().toISOString(),
          autoStop: '12/31/2025'
        },
        {
          id: 'keep-4',
          title: 'Tornado Safety Reminder',
          subject: 'Tornado safety reminders',
          content: `Hi {first_name},

I hope you're doing well. With our area currently under tornado watches and warnings, we wanted to share a few safety reminders to help you and your loved ones stay protected. Tornados can develop quickly and cause serious damage, so preparation is key.

Here are a few important things to keep in mind right now:

1.  Remind your family of the basics
    *   A "tornado watch\" means conditions are favorable — stay tuned and be ready to act.
    *   A "tornado warning\" means a tornado has been spotted or indicated by radar — take shelter immediately.
    *   Be sure to monitor trusted sources like local news and the National Weather Service for real-time updates and alerts.
2.  Know where to go
Shelter in a small, windowless room on the lowest level of a sturdy building you can. If you are not in a sturdy building, try to reach a safer location ahead of the storm. If that's not possible, stay as low as you can and protect your head and neck.

3.  Take cover right away
If you're under a warning, move to your safe location without delay. Protect your head and neck with your arms or objects like pillows or blankets.

4.  Prepare to be without power
Change your phone and devices now. Have flashlights, extra batteries, and a battery-powered radio ready.

5.  Avoid danger after the storm
Once conditions have cleared, be cautious of downed power lines, broken glass, and structural damage. Do not enter damaged buildings until they are confirmed safe.

Please stay safe, and don't hesitate to contact us if any needs arise that we can help with — we\'re here for you.

Take care,

Sincerely,
Alisha Hanif
Customer Service Manager at Cusmano Agency
Phone 203-394-6645 Fax 203-394-6646
Web www.cusmanoagency.com
Email alisha@cusmanoagency.com
425 Kings Hwy E, Fairfield, CT 06825`,
          category: 'KEEP-IN-TOUCH',
          created_at: new Date().toISOString(),
          autoStop: '12/31/2025'
        }
      ];
      
      setEmailTemplates([...templates, ...sampleTemplates]);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      setEmailTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };
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
    setSelectedTemplate(content);
    setEmailModalMode('preview');
    setIsEmailModalOpen(true);
    setIsEmailModalOpen(true);
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

  const handleTemplateAction = (template, action) => {
    setSelectedTemplate(template);
    setEmailModalMode(action);
    setIsEmailModalOpen(true);
  };

  const handleTemplateSaved = () => {
    fetchEmailTemplates();
    showSuccess('📧 Template saved successfully!');
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
            {['ALL', 'MY TEMPLATES', 'KEEP-IN-TOUCH', 'FEATURED'].map(category => (
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
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedCategory === 'MY TEMPLATES' ? 'My Email Templates' : 
                 selectedCategory === 'KEEP-IN-TOUCH' ? 'Keep-in-Touch Templates' : 
                 'Featured Email Campaigns'}
              </h3>
              <button
                onClick={handleBrowseAllFeatured}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {selectedCategory === 'FEATURED' ? 'Browse All Featured Posts →' : 'Create New Template →'}
              </button>
            </div>
            
            {selectedCategory === 'FEATURED' ? (
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
            ) : (
              <div className="space-y-6">
                {templatesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-600 ml-4 font-medium">Loading email templates...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {emailTemplates
                      .filter(template => template.category === selectedCategory)
                      .map(template => (
                        <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-interactive-hover">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">{template.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">Subject: {template.subject}</p>
                                {template.autoStop && (
                                  <div className="flex items-center text-xs text-blue-600 mb-2">
                                    <span className="mr-1">⏰</span>
                                    Auto-stops: {template.autoStop}
                                  </div>
                                )}
                                {template.hasGif && (
                                  <div className="flex items-center text-xs text-purple-600 mb-2">
                                    <span className="mr-1">🎬</span>
                                    Includes GIF
                                  </div>
                                )}
                                <div className="text-sm text-gray-500 line-clamp-3">
                                  {template.content.substring(0, 150)}...
                                </div>
                              </div>
                              {selectedCategory === 'KEEP-IN-TOUCH' && (
                                <div className="ml-4 bg-blue-50 px-2 py-1 rounded-full">
                                  <span className="text-xs text-blue-600 font-medium">Available for social media!</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handlePreview(template)}
                                className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm flex items-center justify-center"
                              >
                                <FiEdit2 className="mr-1 w-3 h-3" />
                                + Add Keyword
                              </button>
                              <button
                                onClick={() => handleTemplateAction(template, 'edit')}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm flex items-center justify-center"
                              >
                                <FiEdit2 className="mr-1 w-3 h-3" />
                                Save as
                              </button>
                              <button
                                onClick={() => handleTemplateAction(template, 'send')}
                                className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm flex items-center justify-center"
                              >
                                <FiMail className="mr-1 w-3 h-3" />
                                Send Email
                              </button>
                            </div>
                            
                            {/* Keywords Section */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500">Keywords:</span>
                                <button
                                  onClick={() => showInfo('🔑 Add keyword functionality coming soon!')}
                                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                                >
                                  <FiSettings className="mr-1 w-3 h-3" />
                                  + Add Keyword
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {template.category === 'MY TEMPLATES' && (
                                  <>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">personal</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">policy</span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">renewal</span>
                                  </>
                                )}
                                {template.category === 'KEEP-IN-TOUCH' && (
                                  <>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">seasonal</span>
                                    <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">check-in</span>
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">relationship</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                
                {!templatesLoading && emailTemplates.filter(template => template.category === selectedCategory).length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FiMail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No {selectedCategory.toLowerCase().replace('-', ' ')} templates yet
                    </h3>
                    <p className="text-gray-600 mb-4">Create your first template to get started</p>
                    <button
                      onClick={() => {
                        setSelectedTemplate(null);
                        setEmailModalMode('create');
                        setIsEmailModalOpen(true);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <FiPlus className="mr-2" />
                      Create Template
                    </button>
                  </div>
                )}
              </div>
            )}
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

      {/* All Modals */}
      <EmailCampaignModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        mode={emailModalMode}
        initialTemplateData={selectedTemplate}
        onTemplateSaved={handleTemplateSaved}
      />
      
      <SocialMediaModal
        preSelectedMedia={selectedCards.length > 0 ? selectedCards[0].webformatURL : null}
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
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