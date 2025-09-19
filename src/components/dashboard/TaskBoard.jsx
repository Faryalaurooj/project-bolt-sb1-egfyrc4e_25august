import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiPlus, FiMoreHorizontal, FiCalendar, FiUser } from 'react-icons/fi';

const SortableTask = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 mb-3 bg-white rounded-lg shadow-sm border-l-4 cursor-move hover:shadow-md transition-shadow ${getPriorityColor(task.priority)}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{task.title}</h4>
        <button className="text-gray-400 hover:text-gray-600">
          <FiMoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {task.assignee && (
            <div className="flex items-center space-x-1">
              <FiUser className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{task.assignee}</span>
            </div>
          )}
        </div>
        
        {task.dueDate && (
          <div className="flex items-center space-x-1">
            <FiCalendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">{task.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskColumn = ({ column, tasks }) => {
  const getColumnColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 min-h-[500px] w-80">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColumnColor(column.id)}`}>
            {tasks.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <FiPlus className="w-4 h-4" />
        </button>
      </div>
      
      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

function TaskBoard() {
  const [columns] = useState([
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ]);

  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Update client contact information',
      description: 'Review and update contact details for existing clients',
      status: 'todo',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-02-15'
    },
    {
      id: '2',
      title: 'Prepare quarterly report',
      description: 'Compile data and create quarterly performance report',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Jane Smith',
      dueDate: '2024-02-20'
    },
    {
      id: '3',
      title: 'Follow up with prospects',
      description: 'Call potential clients from last week\'s leads',
      status: 'todo',
      priority: 'medium',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-18'
    },
    {
      id: '4',
      title: 'Review policy documents',
      description: 'Check and approve new policy documentation',
      status: 'review',
      priority: 'low',
      assignee: 'Sarah Wilson',
      dueDate: '2024-02-22'
    }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTasks((tasks) => {
        const oldIndex = tasks.findIndex(task => task.id === active.id);
        const newIndex = tasks.findIndex(task => task.id === over.id);

        return arrayMove(tasks, oldIndex, newIndex);
      });
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Board</h2>
        <p className="text-gray-600">Manage and track your tasks across different stages</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default TaskBoard;