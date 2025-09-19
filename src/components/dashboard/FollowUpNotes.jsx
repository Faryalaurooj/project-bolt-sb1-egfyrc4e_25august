import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiUser } from 'react-icons/fi';

function FollowUpNotes() {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Follow up with John Smith',
      content: 'Discuss policy renewal options and answer questions about coverage',
      priority: 'high',
      dueDate: '2024-02-15',
      contact: 'John Smith',
      createdAt: '2024-02-10'
    },
    {
      id: 2,
      title: 'Send quote to Sarah Johnson',
      content: 'Prepare and send auto insurance quote based on our conversation',
      priority: 'medium',
      dueDate: '2024-02-18',
      contact: 'Sarah Johnson',
      createdAt: '2024-02-12'
    },
    {
      id: 3,
      title: 'Schedule meeting with Mike Davis',
      content: 'Set up appointment to review business insurance needs',
      priority: 'low',
      dueDate: '2024-02-20',
      contact: 'Mike Davis',
      createdAt: '2024-02-13'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    priority: 'medium',
    dueDate: '',
    contact: ''
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (newNote.title && newNote.content) {
      const note = {
        id: Date.now(),
        ...newNote,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setNotes([note, ...notes]);
      setNewNote({
        title: '',
        content: '',
        priority: 'medium',
        dueDate: '',
        contact: ''
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Follow-up Notes</h2>
          <p className="text-gray-600">Keep track of important follow-ups and reminders</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Note</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Follow-up Note</h3>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter note title..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter note content..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newNote.priority}
                  onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newNote.dueDate}
                  onChange={(e) => setNewNote({ ...newNote, dueDate: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={newNote.contact}
                  onChange={(e) => setNewNote({ ...newNote, contact: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Contact name..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Note
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {notes.map(note => (
          <div key={note.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                <p className="text-gray-600 mb-3">{note.content}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(note.priority)}`}>
                  {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                </span>
                
                {note.contact && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <FiUser className="w-4 h-4" />
                    <span>{note.contact}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {note.dueDate && (
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>Due: {note.dueDate}</span>
                  </div>
                )}
                <span>Created: {note.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FiEdit2 className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-up notes yet</h3>
          <p className="text-gray-600 mb-4">Create your first follow-up note to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Note
          </button>
        </div>
      )}
    </div>
  );
}

export default FollowUpNotes;