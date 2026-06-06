
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { HistoryItem, NutritionData } from '../types';

interface DashboardAnalyticsProps {
  history: HistoryItem[];
  targets: NutritionData;
  current: NutritionData;
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ history, targets, current }) => {
  // 7-day progress data
  const chartData = React.useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString([], { weekday: 'short' });
    });

    const totalsByDay: Record<string, number> = {};
    history.forEach(item => {
      const dateKey = new Date(item.timestamp).toLocaleDateString([], { weekday: 'short' });
      totalsByDay[dateKey] = (totalsByDay[dateKey] || 0) + item.totalMacros.calories;
    });

    return days.map(day => ({
      name: day,
      calories: Math.round(totalsByDay[day] || 0),
      target: targets.calories
    }));
  }, [history, targets]);

  // Radar chart data for P/C/F balance
  const radarData = [
    { subject: 'Protein', A: (current.protein / targets.protein) * 100, fullMark: 100 },
    { subject: 'Carbs', A: (current.carbs / targets.carbs) * 100, fullMark: 100 },
    { subject: 'Fat', A: (current.fat / targets.fat) * 100, fullMark: 100 },
    { subject: 'Fiber', A: (current.fiber / targets.fiber) * 100, fullMark: 100 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">7-Day Calorie Trend</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 800 }}
              />
              <Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="target" stroke="#e2e8f0" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Macro Balance Radar</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
              <Radar name="Intake" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
