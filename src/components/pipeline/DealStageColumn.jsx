import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DealCard from './DealCard';

function DealStageColumn({ id, title, deals, showProbability }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

  const getStageGradient = () => {
    switch (id) {
      case 'lead': return 'from-white to-gray-50 border-gray-200';
      case 'qualified': return 'from-white to-gray-50 border-gray-200';
      case 'proposal': return 'from-white to-gray-50 border-gray-200';
      case 'negotiation': return 'from-white to-gray-50 border-gray-200';
      case 'closed': return 'from-white to-gray-50 border-gray-200';
      default: return 'from-white to-gray-50 border-gray-200';
    }
  };

  const getStageIcon = () => {
    switch (id) {
      case 'lead': return '🎯';
      case 'qualified': return '✅';
      case 'proposal': return '📋';
      case 'negotiation': return '🤝';
      case 'closed': return '🏆';
      default: return '📊';
    }
  };

  const getDropZoneStyle = () => {
    if (isOver) {
      return 'ring-4 ring-mintyLemonGreen ring-opacity-50 scale-105 shadow-xl bg-mintyLemonGreen bg-opacity-20';
    }
    return '';
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-gradient-to-br ${getStageGradient()} rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${getDropZoneStyle()}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStageIcon()}</span>
          <h3 className="font-bold text-lg text-gray-900 tracking-tight">{title}</h3>
        </div>
        <span className="bg-white text-gray-800 text-sm px-3 py-1 rounded-xl font-semibold shadow-md border border-gray-200">
          {deals.length}
        </span>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Value</p>
          <p className="text-xl font-bold text-gray-900">
            ${totalValue.toLocaleString()}
          </p>
        </div>
        {showProbability && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Weighted Value</p>
            <p className="text-xl font-bold text-gray-900">
              ${weightedValue.toLocaleString()}
            </p>
          </div>
        )}
      </div>
      
      <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {deals.map(deal => (
            <DealCard 
              key={deal.id} 
              deal={deal}
              showProbability={showProbability}
            />
          ))}
          {deals.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">➕</span>
              </div>
              <p className="text-gray-500 text-sm">Drop deals here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default DealStageColumn;