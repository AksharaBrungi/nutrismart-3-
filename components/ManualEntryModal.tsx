
import React, { useState } from 'react';
import { NutritionData } from '../types';
import { api } from '../api';

interface ManualEntryModalProps {
  onAdd: (macros: NutritionData, name: string) => void;
  userTargets: NutritionData;
  onClose: () => void;
}

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ onAdd, userTargets, onClose }) => {
  const [name, setName] = useState('');
  const [macros, setMacros] = useState<NutritionData>({ calories: 500, protein: 20, carbs: 50, fat: 15, fiber: 5 });
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleGetAdvice = async () => {
    setIsAnalysing(true);
    try {
      const res = await api.getRecommendationsForMacros(macros, userTargets);
      setRecommendations(res.alternatives);
    } catch (e) {
      console.error("AI Advice Error:", e);
      alert("AI Advice is currently unavailable. Please check your connection or try again later.");
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manual Log & Advice</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Meal Details</h3>
              <input 
                placeholder="Meal Name (e.g. Chicken Pasta)" 
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-bold"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              {Object.keys(macros).map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{key}</label>
                  <input 
                    type="number"
                    className="w-full px-5 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold"
                    value={(macros as any)[key]}
                    onChange={e => setMacros({...macros, [key]: parseFloat(e.target.value) || 0})}
                  />
                </div>
              ))}
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={handleGetAdvice}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  {isAnalysing ? 'Analysing...' : 'Get AI Advice'}
                </button>
                <button 
                  onClick={() => onAdd(macros, name || 'Quick Log')}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                >
                  Save Log
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Smarter Swaps</h3>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                      <p className="font-black text-indigo-900 text-sm mb-1">{rec.name}</p>
                      <p className="text-[11px] text-indigo-700/70 font-medium leading-relaxed">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl p-10 text-center text-slate-400">
                   <p className="text-xs font-bold">Input macros and click "Get AI Advice" for personalized recommendations.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualEntryModal;
