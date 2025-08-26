import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiDollarSign, FiUser, FiCalendar, FiTrendingUp, FiMoreVertical, FiTarget, FiClock } from 'react-icons/fi';

function DealCard({ deal, showProbability }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

 // const getProbabilityColor = (probability) => {
 //   if (probability >= 80) return 'from-emerald-500 to-green-600 text-white';
  //  if (probability >= 60) return 'from-blue-500 to-indigo-600 text-white';
 //   if (probability >= 40) return 'from-amber-500 to-orange-600 text-white';
 //   return 'from-red-500 to-pink-600 text-white';
//  };
  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (probability >= 60) return 'bg-green-100 text-green-700 border-green-200';
    if (probability >= 40) return 'bg-green-100 text-green-600 border-green-200';
    return 'bg-green-100 text-green-600 border-green-200';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-xl shadow-md cursor-move border-2 border-gray-200 group hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:bg-mintyLemonGreen hover:border-mintyLemonGreen ${isDragging ? 'scale-105 shadow-lg opacity-90' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-sm text-gray-900 leading-tight flex-1 pr-2 line-clamp-2">{deal.name}</h4>
        <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-xl hover:bg-gray-100">
          <FiMoreVertical className="text-gray-500 hover:text-gray-700 w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <FiDollarSign className="w-3 h-3 text-gray-600" />
            </div>
            <span>${deal.value.toLocaleString()}</span>
          </div>
          {showProbability && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg border ${getProbabilityColor(deal.probability)} shadow-sm`}>
              <FiTrendingUp className="w-3 h-3" />
              <span className="font-medium text-xs">{deal.probability}%</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-700">
          <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
            <FiUser className="w-3 h-3 text-gray-600" />
          </div>
          <span className="font-medium line-clamp-1">{deal.contact}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-700">
          <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
            <FiClock className="w-3 h-3 text-gray-600" />
          </div>
          <span className="font-medium">{new Date(deal.lastUpdated).toLocaleDateString()}</span>
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <FiTarget className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-800 line-clamp-1">Next: {deal.nextAction}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealCard;