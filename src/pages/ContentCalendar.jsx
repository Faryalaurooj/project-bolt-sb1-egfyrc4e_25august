import React, { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiClock, FiUser, FiCalendar, FiPlus, FiFilter } from 'react-icons/fi';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, parseISO, addQuarters, subQuarters, startOfQuarter, endOfQuarter, isSameDay } from 'date-fns';
import AddTaskModal from '../components/contacts/AddTaskModal';

function ContentCalendar() {
  const [view, setView] = useState('Month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('Social');
  const [industry, setIndustry] = useState('Financial');
  const [category, setCategory] = useState('Featured');
  const [emailChecked, setEmailChecked] = useState(true);
  const [socialMediaChecked, setSocialMediaChecked] = useState(true);
  const [tasksChecked, setTasksChecked] = useState(true);
  const [contentChecked, setContentChecked] = useState(true);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState({});
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Listen for task updates
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const mockContentData = {
    'May': [
      {
        id: 1,
        type: 'Social',
        date: '2025-05-01',
        title: 'World Password Day - May 1',
        status: 'pending',
        assignedTo: 'John Cusmano',
        scheduledBy: null
      },
      {
        id: 2,
        type: 'Email',
        date: '2025-05-02',
        title: 'Prospect Upcoming Renewal',
        status: 'sent',
        assignedTo: null,
        scheduledBy: 'Sarah Wilson'
      },
      {
        id: 3,
        type: 'Social',
        date: '2025-05-06',
        title: 'National Small Business Month - May - Guide to Insurance',
        status: 'pending',
        assignedTo: 'John Cusmano',
        scheduledBy: null,
        category: 'Commercial'
      },
      {
        id: 4,
        type: 'Social',
        date: '2025-05-11',
        title: "Mother's Day - May 11 - Formal",
        status: 'pending',
        assignedTo: 'John Cusmano',
        scheduledBy: null
      }
    ],
    'June': [
      {
        id: 5,
        type: 'Email',
        date: '2025-06-01',
        title: 'June Newsletter',
        status: 'pending',
        assignedTo: 'John Cusmano',
        scheduledBy: null
      },
      {
        id: 6,
        type: 'Social',
        date: '2025-06-14',
        title: 'Flag Day Post',
        status: 'pending',
        assignedTo: 'John Cusmano',
        scheduledBy: null
      }
    ],
    'July': [
      {
        id: 7,
        type: 'Social',
        date: '2025-07-04',
        title: 'Independence Day',
        status: 'pending',
        assignedTo: 'John Cusmano',
        scheduledBy: null
      },
      {
        id: 8,
        type: 'Email',
        date: '2025-07-15',
        title: 'Mid-Summer Check-in',
        status: 'pending',
        assignedTo: 'John Cusmano',
        scheduledBy: null
      }
    ]
  };

  const handlePreviousMonth = () => {
    if (view === 'Month') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else if (view === 'Week') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else if (view === 'Quarter') {
      setCurrentDate(prev => subQuarters(prev, 1));
    }
  };

  const handleNextMonth = () => {
    if (view === 'Month') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else if (view === 'Week') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else if (view === 'Quarter') {
      setCurrentDate(prev => addQuarters(prev, 1));
    }
  };

  const handleApproveAll = () => {
    alert('Approve all functionality coming soon!');
  };

  const handleAddTask = (date) => {
    setSelectedDate(date);
    setIsAddTaskModalOpen(true);
  };

  const handleTaskSaved = () => {
    // Refresh tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  const getTasksForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const allTasks = [...(tasks.todo || []), ...(tasks.inProgress || []), ...(tasks.completed || [])];
    
    return allTasks.filter(task => {
      const taskDate = format(new Date(task.dueDate), 'yyyy-MM-dd');
      const matchesDate = taskDate === dateStr;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'pending' && (tasks.todo || []).includes(task)) ||
        (filterStatus === 'inProgress' && (tasks.inProgress || []).includes(task)) ||
        (filterStatus === 'completed' && (tasks.completed || []).includes(task));
      
      return matchesDate && matchesPriority && matchesStatus;
    });
  };

  const renderTaskItem = (task) => {
    const getStatusColor = (task) => {
      if ((tasks.completed || []).includes(task)) return 'bg-green-500';
      if ((tasks.inProgress || []).includes(task)) return 'bg-yellow-500';
      return 'bg-blue-500';
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'High': return 'border-l-red-500';
        case 'Medium': return 'border-l-yellow-500';
        case 'Low': return 'border-l-green-500';
        default: return 'border-l-gray-500';
      }
    };

    return (
      <div key={`task-${task.id}`} className={`relative ${getStatusColor(task)} text-white p-2 rounded-md mb-2 border-l-4 ${getPriorityColor(task.priority)}`}>
        <div className="flex items-center text-xs mb-1">
          <FiUser className="mr-1" />
          <span className="font-medium">Task</span>
        </div>
        <div className="text-sm font-medium mb-1">{task.title}</div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <FiUser className="mr-1" />
            <span>{task.assignedTo}</span>
          </div>
          <span className="bg-white bg-opacity-20 px-1 rounded text-xs">
            {task.priority}
          </span>
        </div>
        {task.project && (
          <div className="text-xs mt-1 opacity-90">
            Project: {task.project}
          </div>
        )}
      </div>
    );
  };

  const renderContentItem = (content, dayNumber = null) => {
    const typeColor = content.type === 'Social' ? 'bg-purple-500' : 'bg-emerald-500';
    const statusBorder = content.status === 'pending' ? 'border-l-4 border-orange-500' : 'border-l-4 border-green-500';

    return (
      <div key={`content-${content.id}`} className={`relative ${typeColor} text-white p-2 rounded-md mb-2 ${statusBorder}`}>
        {dayNumber && (
          <div className="absolute top-1 right-1 bg-white text-gray-800 px-1 rounded text-xs">
            {dayNumber}
          </div>
        )}
        <div className="flex items-center text-xs mb-1">
          <FiCalendar className="mr-1" />
          <span className="font-medium">{content.type}</span>
        </div>
        <div className="text-sm font-medium">{content.title}</div>
        <div className="flex items-center text-xs mt-1">
          {content.status === 'pending' ? (
            <>
              <FiClock className="mr-1" />
              <span>Pending for: {content.assignedTo}</span>
            </>
          ) : (
            <>
              <FiCheck className="mr-1" />
              <span>Sent by: {content.scheduledBy}</span>
            </>
          )}
        </div>
        {content.status === 'pending' && (
          <button className="mt-2 bg-white text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-100">
            Approve Campaign
          </button>
        )}
      </div>
    );
  };

  const getContentForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return Object.values(mockContentData)
      .flat()
      .filter(item => item.date === dateStr)
      .filter(item => 
        (emailChecked && item.type === 'Email') || 
        (socialMediaChecked && item.type === 'Social')
      );
  };

  const renderMonthView = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const start = startOfWeek(currentDate);
    const end = endOfWeek(addWeeks(start, 5));
    const dates = eachDayOfInterval({ start, end });

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px">
          {days.map(day => (
            <div key={day} className="px-2 py-2 text-sm font-medium text-gray-900 text-center border-b">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {dates.map(date => {
            const isCurrentMonth = isSameMonth(date, currentDate);
            const contentItems = contentChecked ? getContentForDate(date) : [];
            const taskItems = tasksChecked ? getTasksForDate(date) : [];
            const dayNumber = format(date, 'd');
            
            return (
              <div
                key={date.toString()}
                className={`min-h-[140px] bg-white p-2 relative ${
                  isCurrentMonth ? '' : 'bg-gray-50'
                } ${isToday(date) ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {dayNumber}
                  </span>
                  <button
                    onClick={() => handleAddTask(date)}
                    className="opacity-0 hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
                    title="Add Task"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {contentItems.map(content => renderContentItem(content))}
                  {taskItems.map(task => renderTaskItem(task))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    const dates = eachDayOfInterval({ start, end });

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px border-b">
          {dates.map(date => (
            <div key={date.toString()} className="px-4 py-2 text-center">
              <div className="text-sm font-medium text-gray-900">
                {format(date, 'EEEE')}
              </div>
              <div className={`text-lg ${isToday(date) ? 'text-blue-600 font-semibold' : ''}`}>
                {format(date, 'd')}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {dates.map(date => {
            const contentItems = contentChecked ? getContentForDate(date) : [];
            const taskItems = tasksChecked ? getTasksForDate(date) : [];
            
            return (
              <div key={date.toString()} className="min-h-[600px] bg-white p-4 relative">
                <button
                  onClick={() => handleAddTask(date)}
                  className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
                  title="Add Task"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
                <div className="space-y-2">
                  {contentItems.map(content => renderContentItem(content))}
                  {taskItems.map(task => renderTaskItem(task))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderQuarterView = () => {
    const quarterStart = startOfQuarter(currentDate);
    const quarterEnd = endOfQuarter(currentDate);
    const months = [quarterStart, addMonths(quarterStart, 1), addMonths(quarterStart, 2)];

    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map(monthDate => {
          const start = startOfWeek(monthDate);
          const end = endOfWeek(addWeeks(start, 4));
          const dates = eachDayOfInterval({ start, end });

          return (
            <div key={monthDate.toString()} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{format(monthDate, 'MMMM yyyy')}</h3>
              </div>
              <div className="grid grid-cols-7 gap-px p-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px p-2">
                {dates.map(date => {
                  const isCurrentMonth = isSameMonth(date, monthDate);
                  const contentItems = contentChecked ? getContentForDate(date) : [];
                  const taskItems = tasksChecked ? getTasksForDate(date) : [];
                  const dayNumber = format(date, 'd');

                  return (
                    <div
                      key={date.toString()}
                      className={`min-h-[80px] p-1 relative ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isToday(date) ? 'bg-blue-50' : ''}`}
                    >
                      {isCurrentMonth && (
                        <>
                          <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                            <span>{dayNumber}</span>
                            <button
                              onClick={() => handleAddTask(date)}
                              className="opacity-0 hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
                              title="Add Task"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="space-y-1">
                            {contentItems.map(content => renderContentItem(content, dayNumber))}
                            {taskItems.map(task => renderTaskItem(task))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getTaskStats = () => {
    const allTasks = [...(tasks.todo || []), ...(tasks.inProgress || []), ...(tasks.completed || [])];
    const overdueTasks = allTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return taskDate < today && !(tasks.completed || []).includes(task);
    });

    return {
      total: allTasks.length,
      pending: (tasks.todo || []).length,
      inProgress: (tasks.inProgress || []).length,
      completed: (tasks.completed || []).length,
      overdue: overdueTasks.length
    };
  };

  const taskStats = getTaskStats();

  return (
    <div className="flex h-full">
      <div className="flex-1 pr-64">
        <div className="space-y-6">
          {/* Task Statistics Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
                  <div className="text-sm text-blue-600">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
                  <div className="text-sm text-yellow-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{taskStats.inProgress}</div>
                  <div className="text-sm text-orange-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                {taskStats.overdue > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
                    <div className="text-sm text-red-600">Overdue</div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsAddTaskModalOpen(true)}
               className="btn-interactive-hover-primary px-4 py-2 rounded-md flex items-center"
              >
                <FiPlus className="mr-2" />
                Add Task
              </button>
            </div>
          </div>

          {/* Pending Approval Banner */}
          <div className="bg-yellow-50 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-yellow-800">PENDING APPROVAL</span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-sm text-yellow-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  1 Email Campaigns
                </span>
                <span className="flex items-center text-sm text-yellow-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  11 Social Media Posts
                </span>
              </div>
            </div>
            <button 
              onClick={handleApproveAll}
              className="btn-interactive-hover-primary px-4 py-2 rounded-md"
            >
              Approve All
            </button>
          </div>

          {/* Display Options */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Show:</span>
              <button
                onClick={() => setContentChecked(!contentChecked)}
                className={`px-4 py-2 rounded-md text-sm ${
                  contentChecked ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setTasksChecked(!tasksChecked)}
                className={`px-4 py-2 rounded-md text-sm ${
                  tasksChecked ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Tasks
              </button>
            </div>
            
            {contentChecked && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEmailChecked(!emailChecked)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    emailChecked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => setSocialMediaChecked(!socialMediaChecked)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    socialMediaChecked ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Social Media
                </button>
              </div>
            )}
          </div>

          {/* View Controls */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setView('Quarter')}
                className={`px-4 py-2 rounded-md ${
                  view === 'Quarter' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Quarter
              </button>
              <button
                onClick={() => setView('Month')}
                className={`px-4 py-2 rounded-md ${
                  view === 'Month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('Week')}
                className={`px-4 py-2 rounded-md ${
                  view === 'Week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreviousMonth}
                className="text-gray-600 hover:text-gray-900"
              >
                ←
              </button>
              <span className="text-lg font-medium">
                {view === 'Quarter'
                  ? `${format(startOfQuarter(currentDate), 'MMM')} - ${format(endOfQuarter(currentDate), 'MMM yyyy')}`
                  : view === 'Week'
                  ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
                  : format(currentDate, 'MMMM yyyy')}
              </span>
              <button
                onClick={handleNextMonth}
                className="text-gray-600 hover:text-gray-900"
              >
                →
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Turn on suggestions!</span>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  className="peer absolute w-12 h-6 opacity-0 z-10 cursor-pointer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-checked:bg-blue-500 rounded-full"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ease-in-out peer-checked:translate-x-6"></div>
              </div>
            </div>
          </div>

          {/* Calendar Content */}
          {view === 'Month' && renderMonthView()}
          {view === 'Week' && renderWeekView()}
          {view === 'Quarter' && renderQuarterView()}
        </div>
      </div>

      {/* Enhanced Sidebar */}
      <div className="fixed top-0 right-0 w-64 h-full bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search campaigns</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search..."
              />
            </div>
          </div>

          {tasksChecked && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="inProgress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </>
          )}

          {contentChecked && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Social">Social</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Financial">Financial</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Mortgage">Mortgage</option>
                  <option value="Legal">Legal</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Non-Profit">Non-Profit</option>
                  <option value="Home Maintenance">Home Maintenance</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Featured">Featured</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </>
          )}

          {/* Legend */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
            <div className="space-y-2">
              {contentChecked && (
                <>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Social Media</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Email Campaign</span>
                  </div>
                </>
              )}
              {tasksChecked && (
                <>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Pending Task</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">In Progress Task</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Completed Task</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onTaskSaved={handleTaskSaved}
        initialDate={selectedDate}
      />
    </div>
  );
}

export default ContentCalendar;