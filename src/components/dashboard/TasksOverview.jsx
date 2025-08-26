import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiClock } from 'react-icons/fi';

function TasksOverview() {
  const navigate = useNavigate();
  const tasks = JSON.parse(localStorage.getItem('tasks') || '{"todo":[],"inProgress":[],"completed":[]}');
  
  const taskCounts = {
    todo: tasks.todo.length,
    inProgress: tasks.inProgress.length,
    completed: tasks.completed.length,
    total: tasks.todo.length + tasks.inProgress.length + tasks.completed.length
  };

  const recentTasks = [...tasks.todo, ...tasks.inProgress]
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
    .slice(0, 3);

  const handleMarkComplete = (taskId) => {
    const updatedTasks = { ...tasks };
    
    // Find and move task from todo/inProgress to completed
    let taskToComplete = null;
    if (updatedTasks.todo.some(t => t.id === taskId)) {
      taskToComplete = updatedTasks.todo.find(t => t.id === taskId);
      updatedTasks.todo = updatedTasks.todo.filter(t => t.id !== taskId);
    } else if (updatedTasks.inProgress.some(t => t.id === taskId)) {
      taskToComplete = updatedTasks.inProgress.find(t => t.id === taskId);
      updatedTasks.inProgress = updatedTasks.inProgress.filter(t => t.id !== taskId);
    }
    
    if (taskToComplete) {
      updatedTasks.completed.push(taskToComplete);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      // Trigger a storage event to update other components
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleTaskClick = (task) => {
    navigate('/taskboards');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'Low': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-emerald-100 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Tasks Overview</h3>
        <Link 
          to="/taskboards" 
          className="flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
        >
          View All Tasks
          <FiArrowRight className="ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{taskCounts.total}</div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400">Total Tasks</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{taskCounts.todo}</div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400">To Do</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{taskCounts.inProgress}</div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400">In Progress</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{taskCounts.completed}</div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400">Completed</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-4">Recent Tasks</h4>
        <div className="space-y-3">
          {recentTasks.map(task => (
            <div
              key={task.id} 
              className="group p-3 bg-emerald-50 dark:bg-emerald-900 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-700"
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="font-medium text-emerald-900 dark:text-emerald-100">{task.title}</div>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).includes('red') ? 'bg-red-400' : getPriorityColor(task.priority).includes('yellow') ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-3 h-3" />
                      <span className={isOverdue(task.dueDate) ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {isOverdue(task.dueDate) && <span className="text-red-600 dark:text-red-400 text-xs">(Overdue)</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkComplete(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                    title="Mark as complete"
                  >
                    <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {recentTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FiCheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent tasks</p>
              <Link to="/taskboards" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Create your first task
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TasksOverview;