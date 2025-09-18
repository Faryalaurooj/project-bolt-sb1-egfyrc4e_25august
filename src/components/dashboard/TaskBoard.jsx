import React, { useState, useEffect } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import TaskDetailModal from './TaskDetailModal';
import { format } from 'date-fns';
import { FiPlus, FiCalendar, FiRefreshCw, FiPaperclip } from 'react-icons/fi';
import { Dialog } from '@headlessui/react';
import TaskFilters from './TaskFilters';
import { syncTaskWithOutlook, initializeOutlookSync } from '../../services/outlookSync';
import IvansModal from '../ivans/IvansModal';
import { getUsers } from '../../services/api';
import AddTaskModal from '../contacts/AddTaskModal';

function TaskBoard() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : {
      todo: [
        { id: '1', title: 'Review renewal rates', assignedTo: 'John Doe', dueDate: '2024-02-15', project: 'Renewals', priority: 'High', attachments: [], createdBy: 'Admin User', createdAt: '2024-02-01' },
        { id: '2', title: 'Update client contact info', assignedTo: 'Jane Smith', dueDate: '2024-02-16', project: 'Client Management', priority: 'Medium', attachments: [], createdBy: 'Admin User', createdAt: '2024-02-02' }
      ],
      inProgress: [
        { id: '3', title: 'Prepare quarterly report', assignedTo: 'Mike Johnson', dueDate: '2024-02-20', project: 'Reporting', priority: 'High', attachments: [], createdBy: 'Admin User', createdAt: '2024-02-03' }
      ],
      completed: [
        { id: '4', title: 'Send welcome emails', assignedTo: 'Sarah Wilson', dueDate: '2024-02-10', project: 'Onboarding', priority: 'Low', attachments: [], createdBy: 'Admin User', createdAt: '2024-02-04' }
      ]
    };
  });

  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isIvansModalOpen, setIsIvansModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    dueDate: '',
    project: '',
    priority: 'Medium',
    description: '',
    attachments: [],
    createdBy: 'Admin User',
    createdAt: new Date().toISOString()
  });

  const [isAddingNewAssignee, setIsAddingNewAssignee] = useState(false);
  const [isAddingNewProject, setIsAddingNewProject] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');

  const [filters, setFilters] = useState({
    project: '',
    priority: '',
    assignedTo: '',
    search: ''
  });

  const [outlookSyncEnabled, setOutlookSyncEnabled] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setTeamMembersLoading(true);
      console.log('👥 TaskBoard: Fetching team members...');
      const usersData = await getUsers();
      console.log('👥 TaskBoard: Team members fetched:', usersData?.length || 0);
      setTeamMembers(usersData || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setTeamMembers([]);
    } finally {
      setTeamMembersLoading(false);
    }
  };

  const getUserDisplayName = (userId) => {
    const user = teamMembers.find(u => u.id === userId);
    if (user) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
             user.email?.split('@')[0] || 
             'Team Member';
    }
    return userId; // Fallback to the ID if user not found
  };
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const fileAttachments = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      source: 'local'
    }));

    setNewTask(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...fileAttachments]
    }));
  };

  const handleIvansDocumentSelect = (document) => {
    setNewTask(prev => ({
      ...prev,
      attachments: [...prev.attachments, { ...document, source: 'ivans' }]
    }));
    setIsIvansModalOpen(false);
  };

  const handleRemoveAttachment = (index) => {
    setNewTask(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeContainer = Object.keys(tasks).find(key => 
      tasks[key].find(task => task.id === active.id)
    );
    const overContainer = Object.keys(tasks).find(key => 
      tasks[key].find(task => task.id === over.id)
    ) || over.id;
    
    if (activeContainer === overContainer) {
      const activeIndex = tasks[activeContainer].findIndex(task => task.id === active.id);
      const overIndex = tasks[overContainer].findIndex(task => task.id === over.id);
      
      setTasks({
        ...tasks,
        [overContainer]: arrayMove(tasks[overContainer], activeIndex, overIndex)
      });
    } else {
      const movedTask = tasks[activeContainer].find(task => task.id === active.id);
      
      setTasks({
        ...tasks,
        [activeContainer]: tasks[activeContainer].filter(task => task.id !== active.id),
        [overContainer]: [...tasks[overContainer], movedTask]
      });

      if (outlookSyncEnabled) {
        syncTaskWithOutlook({
          ...movedTask,
          status: overContainer
        });
      }
    }
  };

  const handleAddTask = () => {
    const task = {
      id: Date.now().toString(),
      ...newTask,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => ({
      ...prev,
      todo: [...prev.todo, task]
    }));

    if (outlookSyncEnabled) {
      syncTaskWithOutlook(task);
    }

    setNewTask({
      title: '',
      assignedTo: '',
      dueDate: '',
      project: '',
      priority: 'Medium',
      description: '',
      attachments: [],
      createdBy: 'Admin User',
      createdAt: new Date().toISOString()
    });
    setIsNewTaskModalOpen(false);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach(status => {
        const taskIndex = newTasks[status].findIndex(t => t.id === updatedTask.id);
        if (taskIndex !== -1) {
          newTasks[status][taskIndex] = updatedTask;
        }
      });
      return newTasks;
    });
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(status => {
          newTasks[status] = newTasks[status].filter(task => task.id !== taskId);
        });
        return newTasks;
      });
    }
  };

  const handleAssigneeChange = (value) => {
    setNewTask({ ...newTask, assignedTo: value });
  };

  const handleProjectChange = (value) => {
    if (value === 'new') {
      setIsAddingNewProject(true);
      setNewProjectName('');
      setNewTask({ ...newTask, project: '' });
    } else {
      setNewTask({ ...newTask, project: value });
    }
  };

  const handleNewAssigneeSubmit = () => {
    if (newAssigneeName.trim()) {
      setNewTask({ ...newTask, assignedTo: newAssigneeName.trim() });
      setIsAddingNewAssignee(false);
    }
  };

  const handleNewProjectSubmit = () => {
    if (newProjectName.trim()) {
      setNewTask({ ...newTask, project: newProjectName.trim() });
      setIsAddingNewProject(false);
    }
  };

  const filteredTasks = Object.keys(tasks).reduce((acc, columnKey) => {
    acc[columnKey] = tasks[columnKey].filter(task => {
      const matchesProject = !filters.project || task.project === filters.project;
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      const matchesAssigned = !filters.assignedTo || task.assignedTo === filters.assignedTo;
      const matchesSearch = !filters.search || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase());
      return matchesProject && matchesPriority && matchesAssigned && matchesSearch;
    });
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-emerald-900">Task Board</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center px-4 py-2 btn-interactive-hover-primary rounded-md"
          >
            <FiPlus className="mr-2" />
            New Task
          </button>
        </div>
      </div>

      <TaskFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        projects={Array.from(new Set(Object.values(tasks).flat().map(task => task.project)))}
        assignees={Array.from(new Set(Object.values(tasks).flat().map(task => task.assignedTo)))}
      />

      <div className="grid grid-cols-3 gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <TaskColumn 
            title="To Do" 
            tasks={filteredTasks.todo} 
            id="todo" 
            onDeleteTask={handleDeleteTask}
            onViewTask={setSelectedTask}
            getUserDisplayName={getUserDisplayName}
          />
          <TaskColumn 
            title="In Progress" 
            tasks={filteredTasks.inProgress} 
            id="inProgress"
            onDeleteTask={handleDeleteTask}
            onViewTask={setSelectedTask}
            getUserDisplayName={getUserDisplayName}
          />
          <TaskColumn 
            title="Completed" 
            tasks={filteredTasks.completed} 
            id="completed"
            onDeleteTask={handleDeleteTask}
            onViewTask={setSelectedTask}
            getUserDisplayName={getUserDisplayName}
          />
        </DndContext>
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      />
        <AddTaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} />

      <Dialog
        // open={isNewTaskModalOpen}
        // onClose={() => setIsNewTaskModalOpen(false)}
        open={false}
        onClose={() => setIsNewTaskModalOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Create New Task
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={teamMembersLoading}
                >
                  <option value="">
                    {teamMembersLoading ? 'Loading team members...' : 'Select Team Member'}
                  </option>
                  {teamMembers.map(user => (
                    <option key={user.id} value={user.id}>
                      {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                       user.email?.split('@')[0] || 
                       'Team Member'}
                    </option>
                  ))}
                </select>
                {teamMembersLoading && (
                  <div className="mt-1 flex items-center text-xs text-blue-600">
                    <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                    Loading team members...
                  </div>
                )}
                {!teamMembersLoading && teamMembers.length === 0 && (
                  <div className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded-md">
                    No team members found. Check your database connection.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                {isAddingNewProject ? (
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      autoFocus
                    />
                    <button
                      onClick={handleNewProjectSubmit}
                      className="px-3 py-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsAddingNewProject(false)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select
                    value={newTask.project}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="">Select Project</option>
                    {Array.from(new Set(Object.values(tasks).flat().map(task => task.project))).map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                    <option value="new">+ Add New Project</option>
                  </select>
                )}
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Attachments</label>
                <div className="mt-2 space-y-2">
                  {newTask.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <FiPaperclip className="mr-2" />
                        <span className="text-sm">{attachment.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                      <div className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm text-center hover:bg-gray-50">
                        Upload Files
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsIvansModalOpen(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      Select from IVANS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="btn-interactive-hover-primary px-4 py-2 rounded-md"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      <IvansModal
        isOpen={isIvansModalOpen}
        onClose={() => setIsIvansModalOpen(false)}
        onUpload={handleIvansDocumentSelect}
      />
    </div>
  );
}

export default TaskBoard;