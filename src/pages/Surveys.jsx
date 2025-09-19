import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2, FiSend, FiEye, FiClipboard, FiTrendingUp, FiUsers, FiCheckCircle } from 'react-icons/fi';

function Surveys() {
  const [surveys, setSurveys] = useState([
    {
      id: 1,
      title: 'Customer Satisfaction Survey',
      description: 'Annual customer satisfaction and feedback survey',
      status: 'Active',
      responses: 45,
      created: '2024-02-01',
      lastModified: '2024-02-10',
      questions: [
        {
          id: 1,
          type: 'rating',
          text: 'How satisfied are you with our service?',
          options: { min: 1, max: 5, labels: ['Very Dissatisfied', 'Very Satisfied'] }
        },
        {
          id: 2,
          type: 'multiChoice',
          text: 'Which products are you currently using?',
          options: ['Auto Insurance', 'Home Insurance', 'Life Insurance', 'Business Insurance']
        },
        {
          id: 3,
          type: 'text',
          text: 'How can we improve our services?'
        }
      ]
    },
    {
      id: 2,
      title: 'Policy Renewal Feedback',
      description: 'Feedback survey for recently renewed policies',
      status: 'Draft',
      responses: 0,
      created: '2024-02-12',
      lastModified: '2024-02-12',
      questions: [
        {
          id: 1,
          type: 'rating',
          text: 'How would you rate the renewal process?',
          options: { min: 1, max: 5, labels: ['Very Difficult', 'Very Easy'] }
        }
      ]
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    questions: []
  });

  const handleCreateSurvey = (e) => {
    e.preventDefault();
    const survey = {
      id: Date.now(),
      ...newSurvey,
      status: 'Draft',
      responses: 0,
      created: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };
    setSurveys([...surveys, survey]);
    setNewSurvey({ title: '', description: '', questions: [] });
    setShowForm(false);
  };

  const handleDeleteSurvey = (id) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      setSurveys(surveys.filter(survey => survey.id !== id));
    }
  };

  const handleViewResults = (survey) => {
    setSelectedSurvey(survey);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-300';
      case 'Draft': return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300';
      case 'Completed': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-purple-50 to-lilac-50 min-h-screen p-6">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-purple-300 via-lilac-600 to-lilac-600 p-8 rounded-3xl shadow-2xl border border-lilac-300 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white border-opacity-30">
              <FiClipboard className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight mb-3 drop-shadow-lg">Surveys & Feedback</h1>
              <p className="text-purple-100 text-xl font-medium">Gather insights and improve your services</p>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-4xl font-black text-white drop-shadow-lg">{surveys.length}</div>
              <div className="text-sm text-purple-200 font-semibold uppercase tracking-wide">Total Surveys</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white drop-shadow-lg">{surveys.filter(s => s.status === 'Active').length}</div>
              <div className="text-sm text-purple-200 font-semibold uppercase tracking-wide">Active</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white drop-shadow-lg">{surveys.reduce((sum, s) => sum + s.responses, 0)}</div>
              <div className="text-sm text-purple-200 font-semibold uppercase tracking-wide">Total Responses</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white font-black py-4 px-8 rounded-2xl flex items-center shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-3xl border-2 border-purple-400"
        >
          <FiPlus className="mr-3 w-6 h-6" />
          <span className="text-lg">Create New Survey</span>
        </button>
      </div>

      {showForm ? (
        <div className="bg-white shadow-2xl rounded-3xl p-8 border-2 border-gray-200 backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Create New Survey</h3>
          </div>
          <form onSubmit={handleCreateSurvey} className="space-y-4">
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">Survey Title</label>
              <input
                type="text"
                value={newSurvey.title}
                onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                className="block w-full rounded-xl border-2 border-gray-300 shadow-lg focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-all duration-200 py-3 px-4 text-base font-medium"
                placeholder="Enter a compelling survey title..."
                required
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={newSurvey.description}
                onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                rows={4}
                className="block w-full rounded-xl border-2 border-gray-300 shadow-lg focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-all duration-200 py-3 px-4 text-base"
                placeholder="Describe the purpose and goals of this survey..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 text-base font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 font-bold text-base shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Create Survey
              </button>
            </div>
          </form>
        </div>
      ) : (
        surveys.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl border-2 border-dashed border-purple-300">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FiClipboard className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">No surveys yet</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">Start gathering valuable feedback from your customers by creating your first survey</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-300 via-pink-500 to-lilac-500 hover:from-purple-300 hover:via-lilac-600 hover:to-lilac-600 text-black font-black py-4 px-10 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 text-lg flex items-center mx-auto"
            >
              <FiPlus className="mr-3 w-6 h-6" />
              Create Your First Survey
            </button>
          </div>
        ) : (
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border-2 border-gray-200 backdrop-blur-sm bg-opacity-95">
          <table className="min-w-full divide-y-2 divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
              <tr>
                <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Survey</th>
                <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Responses</th>
                <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Created</th>
                <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Last Modified</th>
                <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-gray-100">
              {surveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div>
                      <div className="text-lg font-black text-gray-900 mb-2">{survey.title}</div>
                      <div className="text-base text-gray-600 font-medium">{survey.description}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-2 text-sm font-black rounded-2xl border-2 shadow-lg ${getStatusColor(survey.status)}`}>
                      {survey.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <FiUsers className="w-5 h-5 text-blue-600" />
                      <span className="text-lg font-bold text-gray-900">{survey.responses}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-base font-semibold text-gray-700">
                    {new Date(survey.created).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="px-8 py-6 text-base font-semibold text-gray-700">
                    {new Date(survey.lastModified).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewResults(survey)}
                        className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg border border-blue-200"
                        title="View Results"
                      >
                        <FiBarChart2 className="w-5 h-5" />
                      </button>
                      <button
                        className="p-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg border border-emerald-200"
                        title="Send Survey"
                      >
                        <FiSend className="w-5 h-5" />
                      </button>
                      <button
                        className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg border border-gray-200"
                        title="Preview Survey"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg border border-indigo-200"
                        title="Edit Survey"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className="p-3 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg border border-red-200"
                        title="Delete Survey"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )
      )}

      {selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
          <div className="relative top-20 mx-auto p-8 w-4/5 max-w-6xl shadow-2xl rounded-3xl bg-white border-2 border-gray-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FiBarChart2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">{selectedSurvey.title} - Results</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                  <p className="text-lg font-bold text-gray-700">{selectedSurvey.responses} total responses</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSurvey(null)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <FiX className="w-8 h-8" />
              </button>
            </div>
            <div className="space-y-6">
              {selectedSurvey.questions.map((question) => (
                <div key={question.id} className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border-2 border-gray-200 shadow-lg">
                  <h4 className="font-bold text-lg text-gray-900 mb-4">{question.text}</h4>
                  {/* Placeholder for survey results visualization */}
                  <div className="h-48 bg-gradient-to-br from-white to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <FiTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-semibold text-lg">Results visualization would go here</p>
                      <p className="text-gray-400 text-sm mt-2">Interactive charts and analytics coming soon</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Surveys;