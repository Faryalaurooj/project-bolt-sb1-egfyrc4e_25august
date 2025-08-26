import React from 'react';
import TaskBoard from '../components/dashboard/TaskBoard';
import FollowUpNotes from '../components/dashboard/FollowUpNotes';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function TaskBoards() {
  const categories = ['Task Board', 'Follow-up Notes'];

  return (
    <div className="space-y-8 px-4 md:px-8">
      <h2 className="text-3xl font-bold text-emerald-900 tracking-tight">Task Management</h2>

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
    </div>
  );
}

export default TaskBoards;