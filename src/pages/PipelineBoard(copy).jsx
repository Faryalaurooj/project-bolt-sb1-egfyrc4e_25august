import React, { useState, useEffect } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import DealStageColumn from './DealStageColumn';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [showProbability, setShowProbability] = useState(true);

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

  // Chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Pipeline Value',
        data: [150000, 180000, 220000, 270000, 310000, calculateTotalValue()],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Weighted Value',
        data: [75000, 90000, 110000, 135000, 155000, calculateWeightedValue()],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Pipeline Trend'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
          <div className="flex space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showProbability}
                onChange={(e) => setShowProbability(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Probability</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-blue-100 mb-2">Total Pipeline Value</p>
            <p className="text-3xl font-bold">${calculateTotalValue().toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-purple-100 mb-2">Weighted Pipeline Value</p>
            <p className="text-3xl font-bold">${calculateWeightedValue().toLocaleString()}</p>
          </div>
        </div>

        <div className="h-64 mb-8">
          <Line data={chartData} options={chartOptions} />
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
                showProbability={showProbability}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}

export default PipelineBoard;