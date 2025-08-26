import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskItem from './TaskItem';
import { FiPlus, FiClock, FiCheckCircle, FiPlay, FiTarget, FiZap, FiAward } from 'react-icons/fi';

function TaskColumn({ title, tasks, id, onDeleteTask, onViewTask, getUserDisplayName }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalValue = tasks.reduce((sum, task) => sum + (task.value || 0), 0);

  const getColumnIcon = () => {
    switch (id) {
      case 'todo': return <FiTarget className="w-6 h-6" />;
      case 'inProgress': return <FiZap className="w-6 h-6" />;
      case 'completed': return <FiAward className="w-6 h-6" />;
      default: return <FiTarget className="w-6 h-6" />;
    }
  };

  const getColumnGradient = () => {
    switch (id) {
      case 'todo': return 'from-white to-gray-50 border-gray-200';
      case 'inProgress': return 'from-white to-gray-50 border-gray-200';
      case 'completed': return 'from-white to-gray-50 border-gray-200';
      default: return 'from-white to-gray-50 border-gray-200';
    }
  };

  const getHeaderColor = () => {
    switch (id) {
      case 'todo': return 'text-gray-900 bg-white border-gray-200';
      case 'inProgress': return 'text-gray-900 bg-white border-gray-200';
      case 'completed': return 'text-gray-900 bg-white border-gray-200';
      default: return 'text-gray-900 bg-white border-gray-200';
    }
  };

  const getDropZoneStyle = () => {
    if (isOver) {
      switch (id) {
        case 'todo': return 'ring-4 ring-mintyLemonGreen ring-opacity-50 bg-mintyLemonGreen bg-opacity-20';
        case 'inProgress': return 'ring-4 ring-mintyLemonGreen ring-opacity-50 bg-mintyLemonGreen bg-opacity-20';
        case 'completed': return 'ring-4 ring-mintyLemonGreen ring-opacity-50 bg-mintyLemonGreen bg-opacity-20';
        default: return 'ring-4 ring-mintyLemonGreen ring-opacity-50 bg-mintyLemonGreen bg-opacity-20';
      }
    }
    return '';
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-gradient-to-br ${getColumnGradient()} p-6 rounded-2xl border-2 min-h-[700px] flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 ${getDropZoneStyle()}`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${getHeaderColor()} shadow-md border-2`}>
            {getColumnIcon()}
          </div>
          <h3 className="font-bold text-xl text-gray-900 tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`${getHeaderColor()} text-sm px-3 py-1 rounded-xl font-bold shadow-md border-2`}>
            {tasks.length}
          </span>
        </div>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-6 flex-1">
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onDelete={onDeleteTask}
              onViewTask={onViewTask}
              getUserDisplayName={getUserDisplayName}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-center py-16">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <FiPlus className="w-10 h-10 text-gray-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No tasks yet</h4>
                  <p className="text-gray-500 text-sm">Drag tasks here or create new ones</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default TaskColumn;