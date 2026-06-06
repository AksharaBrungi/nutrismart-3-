
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { NutritionData } from '../types';

interface MacroTrackerProps {
  current: NutritionData;
  targets: NutritionData;
}

const MacroTracker: React.FC<MacroTrackerProps> = ({ current, targets }) => {
  const getProgressColor = (val: number, target: number) => {
    const ratio = val / target;
    if (ratio > 1.1) return '#ef4444'; // Over limit - Red
    if (ratio > 0.8) return '#10b981'; // Near target - Green
    return '#3b82f6'; // Under - Blue
  };

  const macroData = [
    { name: 'Protein', current: current.protein, target: targets.protein, color: '#3b82f6' },
    { name: 'Carbs', current: current.carbs, target: targets.carbs, color: '#f59e0b' },
    { name: 'Fat', current: current.fat, target: targets.fat, color: '#8b5cf6' },
  ];

  const calorieRatio = Math.min((current.calories / targets.calories) * 100, 100);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Daily Allowance</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-full text-slate-500 uppercase">Live Tracking</span>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Total Calories</span>
          <span className="font-bold">{Math.round(current.calories)} / {targets.calories} kcal</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${calorieRatio}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {macroData.map((macro) => (
          <div key={macro.name} className="flex flex-col items-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: Math.min(macro.current, macro.target) },
                      { value: Math.max(0, macro.target - macro.current) }
                    ]}
                    innerRadius="70%"
                    outerRadius="100%"
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill={macro.color} />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-center items-center justify-center">
                <span className="text-[10px] sm:text-xs font-bold">{Math.round((macro.current / macro.target) * 100)}%</span>
              </div>
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-600">{macro.name}</span>
            <span className="text-[10px] text-slate-400">{Math.round(macro.current)}g</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MacroTracker;
