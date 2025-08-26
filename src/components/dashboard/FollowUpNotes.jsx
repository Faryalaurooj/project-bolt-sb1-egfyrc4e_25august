import React, { useState, useEffect } from 'react';
import { FiPlus, FiUser, FiCalendar, FiTag, FiTrash2 } from 'react-icons/fi';
import { Dialog } from '@headlessui/react';
import { getContacts } from '../../services/contactService';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function NoteCard({ note, onDelete, onStatusChange }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm cursor-move hover:shadow-md transition-all border border-emerald-100"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-emerald-900">{note.title}</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => onStatusChange(note.id)}
            className={`text-sm px-2 py-1 rounded ${
              note.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {note.status === 'completed' ? 'Completed' : 'In Progress'}
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-red-500 hover:text-red-700"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      <p className="text-emerald-600 mb-3">{note.content}</p>
      {note.contactName && (
        <div className="flex items-center text-sm text-emerald-600 mb-2">
          <FiUser className="mr-2" />
          {note.contactName}
        </div>
      )}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FollowUpNotes() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('followUpNotes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    contactId: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
    status: 'inProgress'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setContactsLoading(true);
        setContactsError(null);
        const contactsData = await getContacts();
        setContacts(contactsData || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContactsError('Failed to load contacts');
        setContacts([]);
      } finally {
        setContactsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    localStorage.setItem('followUpNotes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (newNote.title && newNote.content) {
      const contact = contacts.find(c => c.id === newNote.contactId);
      const note = {
        id: Date.now().toString(),
        ...newNote,
        contactName: contact ? `${contact.first_name} ${contact.last_name}` : '',
        createdAt: new Date().toISOString()
      };
      setNotes([note, ...notes]);
      setNewNote({
        title: '',
        content: '',
        contactId: '',
        date: new Date().toISOString().split('T')[0],
        tags: [],
        status: 'inProgress'
      });
      setIsModalOpen(false);
    }
  };

  const handleDelete = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
    }
  };

  const handleStatusChange = (noteId) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, status: note.status === 'completed' ? 'inProgress' : 'completed' }
        : note
    ));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const noteId = active.id;
    const note = notes.find(n => n.id === noteId);
    
    if (note) {
      handleStatusChange(noteId);
    }
  };

  const inProgressNotes = notes.filter(note => note.status !== 'completed');
  const completedNotes = notes.filter(note => note.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-emerald-900">Follow-up Notes</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
        >
          <FiPlus className="mr-2" />
          Add Note
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-emerald-900 mb-4">In Progress</h4>
            <SortableContext items={inProgressNotes.map(n => n.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {inProgressNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </SortableContext>
          </div>

          <div>
            <h4 className="text-lg font-medium text-emerald-900 mb-4">Completed</h4>
            <SortableContext items={completedNotes.map(n => n.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {completedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </div>
      </DndContext>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Add Follow-up Note
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Associated Contact</label>
                <select
                  value={newNote.contactId}
                  onChange={(e) => setNewNote({ ...newNote, contactId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={contactsLoading}
                >
                  <option value="">
                    {contactsLoading ? 'Loading contacts...' : 
                     contactsError ? 'Error loading contacts' : 
                     'Select a contact'}
                  </option>
                  {!contactsLoading && !contactsError && contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                    </option>
                  ))}
                </select>
                {contactsError && (
                  <p className="mt-1 text-sm text-red-600">{contactsError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={newNote.date}
                  onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  placeholder="Add tags (comma separated)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      e.preventDefault();
                      const newTags = e.target.value.split(',').map(tag => tag.trim());
                      setNewNote({
                        ...newNote,
                        tags: [...new Set([...newNote.tags, ...newTags])]
                      });
                      e.target.value = '';
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                {newNote.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700"
                      >
                        {tag}
                        <button
                          onClick={() => setNewNote({
                            ...newNote,
                            tags: newNote.tags.filter((_, i) => i !== index)
                          })}
                          className="ml-1 text-emerald-600 hover:text-emerald-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default FollowUpNotes;