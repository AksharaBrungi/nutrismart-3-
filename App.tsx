
import React, { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import MacroTracker from './components/MacroTracker';
import DetectionOverlay from './components/DetectionOverlay';
import Auth from './components/Auth';
import ProfileSettings from './components/ProfileSettings';
import DashboardAnalytics from './components/DashboardAnalytics';
import ManualEntryModal from './components/ManualEntryModal';
import ReverseSearchModal from './components/ReverseSearchModal';
import AbstractModal from './components/AbstractModal';
import { FoodItem, UserProfile, DetectionResult, NutritionData, HistoryItem } from './types';
import { api } from './api';
import { resizeImage } from './lib/imageUtils';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isReverseSearchOpen, setIsReverseSearchOpen] = useState(false);
  const [isAbstractOpen, setIsAbstractOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult | null>(null);
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 });
  const [waterTotal, setWaterTotal] = useState(0);
  const [customWater, setCustomWater] = useState('');
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRange, setFilterRange] = useState<'today' | '7days' | 'all'>('all');

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Session restoration and data fetching
    const init = async () => {
      const user = await api.me();
      if (user) {
        setUser(user);
        setWaterTotal(user.waterTotal || 0);
        const history = await api.getHistory();
        setHistory(history);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      api.updateWater(waterTotal);
    }
  }, [waterTotal, user]);

  const consumedToday = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return history
      .filter(item => new Date(item.timestamp).setHours(0, 0, 0, 0) === today)
      .reduce((acc, entry) => ({
        calories: acc.calories + entry.totalMacros.calories,
        protein: acc.protein + entry.totalMacros.protein,
        carbs: acc.carbs + entry.totalMacros.carbs,
        fat: acc.fat + entry.totalMacros.fat,
        fiber: acc.fiber + entry.totalMacros.fiber,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const nameMatch = item.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const now = Date.now();
      const itemTime = item.timestamp;
      let dateMatch = true;

      if (filterRange === 'today') {
        dateMatch = new Date(itemTime).toDateString() === new Date().toDateString();
      } else if (filterRange === '7days') {
        dateMatch = (now - itemTime) <= 7 * 24 * 60 * 60 * 1000;
      }

      return nameMatch && dateMatch;
    });
  }, [history, searchTerm, filterRange]);

  const handleManualAdd = async (macros: NutritionData, name: string) => {
    const newEntry: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      image: '', 
      items: [{ id: 'manual', name, confidence: 1, box: {ymin:0,xmin:0,ymax:0,xmax:0}, nutritionPer100g: macros, estimatedWeightGrams: 100 }],
      totalMacros: macros
    };
    try {
      await api.addHistory(newEntry);
      setHistory(prev => [newEntry, ...prev]);
      setIsManualModalOpen(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {
      alert("Failed to save entry");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setDetectionResults(null);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const fullBase64 = reader.result as string;
        const base64 = await resizeImage(fullBase64);
        const result = await api.analyzeFoodImage(base64, user.dailyTargets);
        setDetectionResults(result);
        
        const totalMacros = result.items.reduce((acc, item) => {
          const f = item.estimatedWeightGrams / 100;
          return {
            calories: acc.calories + (item.nutritionPer100g.calories * f),
            protein: acc.protein + (item.nutritionPer100g.protein * f),
            carbs: acc.carbs + (item.nutritionPer100g.carbs * f),
            fat: acc.fat + (item.nutritionPer100g.fat * f),
            fiber: acc.fiber + (item.nutritionPer100g.fiber * f),
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

        const newEntry: HistoryItem = { id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), image: previewUrl, items: result.items, totalMacros };
        await api.addHistory(newEntry);
        setHistory(prev => [newEntry, ...prev]);
        setIsAnalyzing(false);
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.7 } });
      } catch (error) {
        console.error("AI Analysis Error:", error);
        alert("AI Intelligence busy or unavailable. Please check your connection or try again later.");
        setIsAnalyzing(false);
      }
    };
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setHistory([]);
  };

  const handleUpdateProfile = async (updatedUser: UserProfile) => {
    try {
      await api.updateProfile({ name: updatedUser.name, dailyTargets: updatedUser.dailyTargets });
      setUser(updatedUser);
    } catch (e) {
      alert("Failed to update profile");
    }
  };

  const handleResetData = async () => {
    try {
      await api.clearHistory();
      setHistory([]);
      setWaterTotal(0);
    } catch (e) {
      alert("Failed to reset data");
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
      setHistory(h => h.filter(x => x.id !== id));
    } catch (e) {
      alert("Failed to delete item");
    }
  };

  if (!user) return <Auth onLogin={async (u) => {
    setUser(u);
    setWaterTotal(u.waterTotal || 0);
    try {
      const h = await api.getHistory();
      setHistory(h);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  }} />;

  return (
    <div className="min-h-screen pb-24 bg-slate-50 text-slate-900">
      <Header />
      {isSettingsOpen && (
        <ProfileSettings 
          profile={user} 
          onUpdate={handleUpdateProfile} 
          onLogout={handleLogout}
          onResetData={handleResetData}
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
      {isManualModalOpen && <ManualEntryModal userTargets={user.dailyTargets} onAdd={handleManualAdd} onClose={() => setIsManualModalOpen(false)} />}
      {isReverseSearchOpen && <ReverseSearchModal onClose={() => setIsReverseSearchOpen(false)} />}
      {isAbstractOpen && <AbstractModal onClose={() => setIsAbstractOpen(false)} />}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200 overflow-hidden border-4 border-white">
               <img 
                 src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=150&auto=format&fit=crop" 
                 alt="NutriSmart AI" 
                 className="w-full h-full object-cover"
               />
             </div>
             <div>
               <h2 className="text-4xl font-black tracking-tighter">NutriSmart AI</h2>
               <button onClick={() => setIsAbstractOpen(true)} className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:underline flex items-center gap-1 mt-1">
                  View Project Abstract <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
               </button>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setIsReverseSearchOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-widest transition-all active:scale-95 border-b-4 border-indigo-800"
            >
              Reverse Search
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 transition-all active:scale-95"
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </div>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-1">Analytical Intelligence Dashboard</h3>
          <DashboardAnalytics history={history} targets={user.dailyTargets} current={consumedToday} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-2xl tracking-tighter">AI Core Scan</h3>
                <div className="flex gap-3">
                  <button onClick={() => setIsManualModalOpen(true)} className="px-5 py-3 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Manual Entry</button>
                  <label className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 cursor-pointer active:scale-95">
                    <span>Scan Plate</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="relative aspect-video bg-slate-50 rounded-[2.5rem] flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group">
                {imagePreview ? (
                  <>
                    <img ref={imageRef} src={imagePreview} className="max-h-full w-auto object-contain" onLoad={() => setImageDims({width: imageRef.current?.clientWidth||0, height: imageRef.current?.clientHeight||0})} />
                    {detectionResults && <DetectionOverlay items={detectionResults.items} imageWidth={imageDims.width} imageHeight={imageDims.height} />}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-lg flex flex-col items-center justify-center animate-fade-in">
                        <div className="w-16 h-16 border-[6px] border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-6 font-black text-emerald-900 uppercase tracking-[0.3em] text-xs">YOLO v8 DETECTION ACTIVE</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-16">
                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                      <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                    </div>
                    <p className="font-black text-xl text-slate-900 uppercase tracking-tighter">NutriSmart Vision Module</p>
                    <p className="text-sm text-slate-400 mt-2 font-bold max-w-xs mx-auto">Upload a meal image to start the automated portion estimation and macro breakdown.</p>
                  </div>
                )}
              </div>
            </div>

            {detectionResults && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[2.5rem] text-white shadow-xl">
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-emerald-300">Portion Scaling Advice</h4>
                   <div className="space-y-4">
                     {detectionResults.items.map(item => (
                       <div key={item.id} className="bg-white/10 p-4 rounded-2xl">
                         <div className="flex justify-between items-center mb-2">
                           <p className="font-black text-sm uppercase">{item.name}</p>
                           <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-lg">{item.estimatedWeightGrams}g</span>
                         </div>
                         <p className="text-[10px] font-bold text-emerald-100 italic leading-relaxed">Optimization Tip: Reducing this by 15% would save ~{Math.round(item.nutritionPer100g.calories * 0.15)} calories.</p>
                       </div>
                     ))}
                   </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl border border-white/5">
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-slate-500">Chef's Healthy Prep Tips</h4>
                   <div className="space-y-4">
                     {detectionResults.items.map(item => (
                       <div key={item.id} className="border-l-2 border-emerald-500 pl-4 py-2">
                         <p className="text-xs font-black uppercase tracking-widest text-emerald-500">{item.name}</p>
                         <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1">
                           {item.cookingMethodAdvice || "Try poaching or air-frying to maintain nutrient density and reduce added oils."}
                         </p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <h3 className="font-black text-2xl text-slate-900 tracking-tighter">Daily History Feed</h3>
                <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Search items..." 
                      className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black outline-none focus:border-indigo-500 transition-all w-56 shadow-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  <select 
                    className="bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest py-3 px-4 outline-none shadow-sm cursor-pointer"
                    value={filterRange}
                    onChange={e => setFilterRange(e.target.value as any)}
                  >
                    <option value="all">All Logs</option>
                    <option value="today">Today Only</option>
                    <option value="7days">Past Week</option>
                  </select>
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="bg-white rounded-[3rem] border border-slate-200 p-24 text-center text-slate-300 shadow-sm italic font-bold uppercase tracking-widest">
                  No data points found
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredHistory.map(item => (
                    <div key={item.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all animate-fade-in shadow-sm">
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100 relative">
                          {item.image ? (
                            <img src={item.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-500 bg-indigo-50">
                              <span className="text-3xl">🍲</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xl tracking-tighter">{item.items.map(i => i.name).join(', ')}</p>
                          <div className="flex items-center space-x-3 mt-1 font-black uppercase text-[10px] tracking-widest">
                            <span className="text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                            <span className="text-emerald-600">{Math.round(item.totalMacros.calories)} KCAL</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteHistoryItem(item.id)} className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-3xl transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <MacroTracker current={consumedToday} targets={user.dailyTargets} />
            
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200">
              <h3 className="font-black text-xl text-slate-900 mb-6 tracking-tighter uppercase text-[10px] tracking-[0.3em] text-slate-400">NutriSmart Verdict</h3>
              <div className="space-y-4">
                <VerdictRow label="Protein Goal" value={consumedToday.protein} target={user.dailyTargets.protein} unit="g" />
                <VerdictRow label="Max Fats" value={consumedToday.fat} target={user.dailyTargets.fat} unit="g" />
                <VerdictRow label="Fiber Count" value={consumedToday.fiber} target={user.dailyTargets.fiber} unit="g" inverse />
              </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/10">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-2xl tracking-tighter">Hydration Hub</h4>
                  <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-xl text-emerald-400 border border-emerald-400/20">{waterTotal}ml</span>
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-8">Daily Quota: 3.0L</p>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[250, 500, 1000].map(amt => (
                    <button key={amt} onClick={() => setWaterTotal(v => v + amt)} className="py-4 bg-white/5 hover:bg-emerald-500 rounded-2xl text-[10px] font-black tracking-widest transition-all border border-white/5 active:scale-95 shadow-lg">+{amt}ML</button>
                  ))}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); const v = parseInt(customWater); if(v > 0) {setWaterTotal(w => w + v); setCustomWater('');} }} className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Log custom..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:border-emerald-500 transition-all"
                    value={customWater}
                    onChange={e => setCustomWater(e.target.value)}
                  />
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-2xl shadow-lg transition-all active:scale-90">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </form>
              </div>
              <div className="absolute -right-12 -bottom-12 opacity-10">
                <svg className="w-56 h-56" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-200">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Goal Sync Status</h4>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" strokeWidth={3} /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Synchronized</p>
                    <p className="text-[10px] font-bold text-slate-400">Next advice in 2 hours</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const VerdictRow: React.FC<{ label: string; value: number; target: number; unit: string; inverse?: boolean }> = ({ label, value, target, unit, inverse }) => {
  const ratio = value / target;
  let statusColor = ratio >= 1 ? 'text-emerald-500' : (ratio > 0.8 ? 'text-amber-500' : 'text-slate-400');
  if (inverse && ratio < 0.5) statusColor = 'text-red-500';

  return (
    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-black text-slate-900">{Math.round(value)}{unit}</span>
          <span className="text-[10px] text-slate-400 font-bold">/ {target}{unit}</span>
        </div>
      </div>
      <div className={`text-2xl font-bold ${statusColor}`}>
        {ratio >= 1 ? '✅' : (ratio > 0.8 ? '⚠️' : '🔋')}
      </div>
    </div>
  );
};

export default App;
