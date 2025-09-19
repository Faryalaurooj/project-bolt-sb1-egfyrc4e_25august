import React, { useState } from 'react';
import TaskBoard from '../components/dashboard/TaskBoard';
import FollowUpNotes from '../components/dashboard/FollowUpNotes';
import { Tab } from '@headlessui/react';
import { FiPlus } from 'react-icons/fi';
import AddTaskModal from '../components/contacts/AddTaskModal';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function TaskBoards() {
  const categories = ['Task Board', 'Follow-up Notes'];
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8 px-4 md:px-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-emerald-900 tracking-tight">Task Management</h2>
        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Task
        </button>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-2 rounded-xl bg-emerald-900/20 p-1">
          {categories.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2 text-sm font-semibold',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2 transition',
                  selected
                    ? 'bg-white text-emerald-700 shadow'
                    : 'text-emerald-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <TaskBoard />
          </Tab.Panel>
          <Tab.Panel>
            <FollowUpNotes />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onTaskSaved={handleTaskSaved}
      />
    </div>
  );
}

export default TaskBoards;