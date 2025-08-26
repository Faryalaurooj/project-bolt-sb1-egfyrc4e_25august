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
      stages[key].deals.find(d => d.id === active.id)
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

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Pipeline Value',
        data: [150000, 180000, 220000, 270000, 310000, calculateTotalValue()],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Weighted Value',
        data: [75000, 90000, 110000, 135000, 155000, calculateWeightedValue()],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Pipeline Trend',
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#1f2937'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
          font: {
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };

  return (
    <div className="space-y-8 bg-white min-h-screen p-6">
      {/* Enhanced Page Header */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-50 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Sales Pipeline</h1>
            <p className="text-gray-600 text-lg font-medium">Track deals through your sales process</p>
          </div>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">${calculateTotalValue().toLocaleString()}</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">Total Pipeline</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">${calculateWeightedValue().toLocaleString()}</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">Weighted Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Import Button */}
      <div className="flex justify-end mb-6">
        <button
          className="bg-white text-gray-900 px-6 py-3 rounded-xl shadow-md transition-all duration-300 hover:bg-mintyLemonGreen hover:scale-105 hover:shadow-lg font-semibold text-base flex items-center space-x-2 border-2 border-gray-200 hover:border-mintyLemonGreen"
        >
          <span className="text-2xl">📊</span>
          <span>Import Deals</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shadow-md border border-gray-200">
              <span className="text-2xl">💼</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pipeline Overview</h2>
          </div>
          <div className="flex space-x-6">
            {/* Existing controls */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="rounded-lg border-2 border-gray-200 shadow-sm focus:border-mintyLemonGreen focus:ring-mintyLemonGreen focus:ring-2 transition-all duration-200 px-3 py-2 font-medium"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-mintyLemonGreen transition-colors">
              <input
                type="checkbox"
                checked={showProbability}
                onChange={(e) => setShowProbability(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-mintyLemonGreen w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Show Probability</span>
            </label>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-mintyLemonGreen hover:border-mintyLemonGreen relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-gray-600 text-base font-medium">Total Pipeline Value</p>
              </div>
              <p className="text-3xl font-bold tracking-tight text-gray-900">${calculateTotalValue().toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-mintyLemonGreen hover:border-mintyLemonGreen relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-gray-600 text-base font-medium">Weighted Pipeline Value</p>
              </div>
              <p className="text-3xl font-bold tracking-tight text-gray-900">${calculateWeightedValue().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Drag and Drop Columns */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <div className="grid grid-cols-5 gap-6">
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
