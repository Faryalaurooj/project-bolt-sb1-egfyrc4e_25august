import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSun, FiMoon, FiType, FiEye, FiEyeOff, FiRotateCcw, FiMove } from 'react-icons/fi';
import { useCustomization } from '../../context/CustomizationContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSection({ id, section, onToggleVisibility }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sectionLabels = {
    kpiCards: 'KPI Cards',
    quickActions: 'Quick Actions',
    engagementStats: 'Engagement Stats',
    tasksOverview: 'Tasks Overview',
    upcomingRenewals: 'Upcoming Renewals',
    recentNotes: 'Recent Notes',
    calendarSection: 'Team Calendar',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
    >
      <div className="flex items-center">
        <div
          {...listeners}
          className="cursor-move mr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <FiMove className="w-4 h-4" />
        </div>
        <span className="text-gray-900 dark:text-gray-100">{sectionLabels[id]}</span>
      </div>
      <button
        onClick={() => onToggleVisibility(id)}
        className={`p-1 rounded ${
          section.visible 
            ? 'text-green-600 hover:text-green-700 dark:text-green-400' 
            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
        }`}
      >
        {section.visible ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}

function CustomizationSettingsModal({ isOpen, onClose }) {
  const {
    settings,
    toggleTheme,
    setFontSize,
    setIconStyle,
    toggleSectionVisibility,
    toggleStickyNotesVisibility,
    updateSectionOrder,
    resetToDefaults
  } = useCustomization();

  const [sectionOrder, setSectionOrder] = useState(() => 
    Object.entries(settings.dashboardSections)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([id]) => id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        updateSectionOrder(newOrder);
        return newOrder;
      });
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all customization settings to defaults?')) {
      resetToDefaults();
      setSectionOrder(['kpiCards', 'quickActions', 'engagementStats', 'tasksOverview', 'upcomingRenewals', 'recentNotes']);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl mx-4 rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Dashboard Customization
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Theme Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Theme</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    settings.theme === 'light'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <FiSun className="w-4 h-4 mr-2" />
                  Light
                </button>
                <button
                  onClick={toggleTheme}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    settings.theme === 'dark'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <FiMoon className="w-4 h-4 mr-2" />
                  Dark
                </button>
              </div>
            </div>

            {/* Font Size Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Font Size</h3>
              <div className="flex items-center space-x-4">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors capitalize ${
                      settings.fontSize === size
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FiType className="w-4 h-4 mr-2" />
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Style Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Icon Style</h3>
              <div className="flex items-center space-x-4">
                {['default', 'alternative'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setIconStyle(style)}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors capitalize ${
                      settings.iconStyle === style
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Sections */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Dashboard Sections
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag to reorder sections and toggle visibility
              </p>
              
              {/* Sticky Notes Toggle */}
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600 dark:text-yellow-400">📌</span>
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Show Sticky Notes</span>
                  </div>
                  <button
                    onClick={toggleStickyNotesVisibility}
                    className={`p-1 rounded ${
                      settings.showStickyNotes 
                        ? 'text-green-600 hover:text-green-700 dark:text-green-400' 
                        : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
                    }`}
                  >
                    {settings.showStickyNotes ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                  </button>
                </label>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sectionOrder.map((sectionId) => (
                      <SortableSection
                        key={sectionId}
                        id={sectionId}
                        section={settings.dashboardSections[sectionId]}
                        onToggleVisibility={toggleSectionVisibility}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiRotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="btn-interactive-hover-primary px-6 py-2 rounded-md dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default CustomizationSettingsModal;