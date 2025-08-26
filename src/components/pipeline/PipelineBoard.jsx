import React, { useState, useEffect } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import DealStageColumn from './DealStageColumn';

const initialStages = {
  lead: {
    title: 'Lead',
    deals: [
      { id: '1', name: 'Tech Solutions Inc', value: 25000, probability: 20, company: 'Tech Solutions', contact: 'John Smith', nextAction: 'Initial Meeting', lastUpdated: '2024-02-15' },
      { id: '2', name: 'Marketing Pro Services', value: 15000, probability: 30, company: 'Marketing Pro', contact: 'Sarah Johnson', nextAction: 'Follow-up Call', lastUpdated: '2024-02-14' }
    ]
  },
  qualified: {
    title: 'Qualified',
    deals: [
      { id: '3', name: 'Insurance Package Deal', value: 50000, probability: 50, company: 'ABC Corp', contact: 'Mike Wilson', nextAction: 'Proposal Review', lastUpdated: '2024-02-13' }
    ]
  },
  proposal: {
    title: 'Proposal',
    deals: [
      { id: '4', name: 'Enterprise Solution', value: 75000, probability: 70, company: 'Enterprise Ltd', contact: 'Lisa Brown', nextAction: 'Contract Negotiation', lastUpdated: '2024-02-12' }
    ]
  },
  negotiation: {
    title: 'Negotiation',
    deals: []
  },
  closed: {
    title: 'Closed Won',
    deals: [
      { id: '5', name: 'Small Business Package', value: 30000, probability: 100, company: 'Small Biz Inc', contact: 'David Lee', nextAction: 'Implementation', lastUpdated: '2024-02-10' }
    ]
  }
};

function PipelineBoard() {
  const [stages, setStages] = useState(() => {
    const savedStages = localStorage.getItem('pipelineStages');
    return savedStages ? JSON.parse(savedStages) : initialStages;
  });

  useEffect(() => {
    localStorage.setItem('pipelineStages', JSON.stringify(stages));
  }, [stages]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeStage = Object.keys(stages).find(key =>
      stages[key].deals.find(deal => deal.id === active.id)
    );
    
    const overStage = over.id;

    if (activeStage !== overStage) {
      setStages(prev => {
        const deal = prev[activeStage].deals.find(d => d.id === active.id);
        
        return {
          ...prev,
          [activeStage]: {
            ...prev[activeStage],
            deals: prev[activeStage].deals.filter(d => d.id !== active.id)
          },
          [overStage]: {
            ...prev[overStage],
            deals: [...prev[overStage].deals, { ...deal, probability: getProbabilityForStage(overStage) }]
          }
        };
      });
    }
  };

  const getProbabilityForStage = (stage) => {
    const probabilities = {
      lead: 20,
      qualified: 40,
      proposal: 60,
      negotiation: 80,
      closed: 100
    };
    return probabilities[stage] || 0;
  };

  const calculateTotalValue = () => {
    return Object.values(stages).reduce((total, stage) => {
      return total + stage.deals.reduce((stageTotal, deal) => stageTotal + deal.value, 0);
    }, 0);
  };

  const calculateWeightedValue = () => {
    return Object.values(stages).reduce((total, stage) => {
      return total + stage.deals.reduce((stageTotal, deal) => {
        return stageTotal + (deal.value * (deal.probability / 100));
      }, 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
        <div className="flex space-x-6">
          <div>
            <p className="text-sm text-gray-500">Total Pipeline Value</p>
            <p className="text-xl font-semibold">${calculateTotalValue().toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Weighted Pipeline Value</p>
            <p className="text-xl font-semibold">${calculateWeightedValue().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(stages).map(([id, stage]) => (
            <DealStageColumn
              key={id}
              id={id}
              title={stage.title}
              deals={stage.deals}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default PipelineBoard;