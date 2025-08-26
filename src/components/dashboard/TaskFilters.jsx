import React from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';

function TaskFilters({ filters, onFilterChange, projects, assignees }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <FiFilter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filter Tasks</h3>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10 w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-mintyLemonGreen focus:ring-mintyLemonGreen focus:ring-2 transition-all duration-200 p-3"
        />
      </div>

      <div className="flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
          <select
            value={filters.project}
            onChange={(e) => onFilterChange('project', e.target.value)}
            className="rounded-lg border-2 border-gray-200 shadow-sm focus:border-mintyLemonGreen focus:ring-mintyLemonGreen focus:ring-2 transition-all duration-200 p-2"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="rounded-lg border-2 border-gray-200 shadow-sm focus:border-mintyLemonGreen focus:ring-mintyLemonGreen focus:ring-2 transition-all duration-200 p-2"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select
            value={filters.assignedTo}
            onChange={(e) => onFilterChange('assignedTo', e.target.value)}
            className="rounded-lg border-2 border-gray-200 shadow-sm focus:border-mintyLemonGreen focus:ring-mintyLemonGreen focus:ring-2 transition-all duration-200 p-2"
          >
            <option value="">All Assignees</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default TaskFilters;