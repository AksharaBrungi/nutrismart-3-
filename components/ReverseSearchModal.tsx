
import React, { useState } from 'react';
import { NutritionData, ReverseSearchResult } from '../types';
import { api } from '../api';

interface Props {
  onClose: () => void;
}

const ReverseSearchModal: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState<Partial<NutritionData>>({ calories: 400, protein: 30, carbs: 40 });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReverseSearchResult[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await api.reverseNutritionSearch(query);
      setResults(data);
    } catch (e) {
      console.error("AI Search Error:", e);
      alert("AI Intelligence is currently busy or unavailable. Please check your connection or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-white/20">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Reverse Nutrition Search</h2>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1">Input desired macros to discover meals</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white rounded-2xl transition-all shadow-sm">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Target Metrics</h3>
              <div className="space-y-6">
                {(['calories', 'protein', 'carbs'] as const).map(key => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">{key}</label>
                      <span className="text-sm font-black">{query[key]}{key === 'calories' ? ' kcal' : 'g'}</span>
                    </div>
                    <input 
                      type="range" 
                      min={key === 'calories' ? 100 : 0} 
                      max={key === 'calories' ? 2000 : 150} 
                      value={query[key]} 
                      onChange={e => setQuery({...query, [key]: parseInt(e.target.value)})}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                ))}
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Consulting AI...' : 'Discover Meals'}
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem]">
               <h4 className="font-black text-indigo-900 text-xs uppercase mb-2">How it works</h4>
               <p className="text-[11px] text-indigo-700/70 font-medium leading-relaxed">
                 Our AI scans thousands of recipes to find the exact combination that fits your specific macronutrient requirements for Nutri-Smart.
               </p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {results.length > 0 ? (
              results.map((res, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:border-indigo-200 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{res.mealName}</h3>
                       <div className="flex gap-2 mt-2">
                         {res.ingredients.slice(0,3).map((ing, j) => (
                           <span key={j} className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{ing}</span>
                         ))}
                       </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-indigo-600">{res.macros.calories} kcal</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">P: {res.macros.protein}g | C: {res.macros.carbs}g</p>
                     </div>
                   </div>
                   <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                      <span className="text-lg">🍳</span>
                      <p className="text-xs font-bold text-emerald-800 leading-relaxed italic">"{res.cookingTips}"</p>
                   </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <p className="font-black text-2xl uppercase tracking-tighter">No data queried</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReverseSearchModal;
