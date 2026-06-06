
import React, { useState } from 'react';
import { UserProfile, NutritionData } from '../types';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
  onResetData: () => void;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate, onLogout, onResetData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'account'>('goals');
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);

  const handleTargetChange = (key: keyof NutritionData, value: number) => {
    setLocalProfile({
      ...localProfile,
      dailyTargets: {
        ...localProfile.dailyTargets,
        [key]: value
      }
    });
  };

  const handleNameChange = (name: string) => {
    setLocalProfile({ ...localProfile, name });
  };

  const handleSave = () => {
    onUpdate(localProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Command Center</h2>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] mt-1">Status: Optimized</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-sm rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 py-2 border-b border-slate-50">
          <button 
            onClick={() => setActiveTab('goals')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'goals' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
          >
            Daily Goals
          </button>
          <button 
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'account' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
          >
            Account
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {activeTab === 'goals' ? (
            <section className="space-y-8 animate-fade-in">
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                <h4 className="font-black text-emerald-900 text-sm mb-2 uppercase tracking-widest">Macro Architecture</h4>
                <p className="text-xs text-emerald-700/80 leading-relaxed font-medium">
                  Adjusting these targets will automatically update the AI "Verdict" engine and smart recommendations.
                </p>
              </div>
              
              <div className="space-y-10">
                <TargetInput 
                  label="Daily Calories" 
                  unit="kcal"
                  value={localProfile.dailyTargets.calories} 
                  onChange={(v) => handleTargetChange('calories', v)}
                  min={1200} max={5000} step={50}
                  color="emerald"
                />
                <TargetInput 
                  label="Protein Target" 
                  unit="g"
                  value={localProfile.dailyTargets.protein} 
                  onChange={(v) => handleTargetChange('protein', v)}
                  min={30} max={400} step={5}
                  color="blue"
                />
                <TargetInput 
                  label="Carbohydrates" 
                  unit="g"
                  value={localProfile.dailyTargets.carbs} 
                  onChange={(v) => handleTargetChange('carbs', v)}
                  min={20} max={600} step={5}
                  color="amber"
                />
                <TargetInput 
                  label="Fats Allowance" 
                  unit="g"
                  value={localProfile.dailyTargets.fat} 
                  onChange={(v) => handleTargetChange('fat', v)}
                  min={20} max={200} step={5}
                  color="purple"
                />
              </div>
            </section>
          ) : (
            <section className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Profile</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={localProfile.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2 opacity-50">
                  <label className="text-xs font-bold text-slate-600 ml-1">Registered Email</label>
                  <input 
                    disabled
                    type="text"
                    value={localProfile.email}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 outline-none font-bold text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</h3>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[1.5rem] hover:border-red-500 hover:text-red-500 transition-all font-black text-sm group"
                >
                  <span>Log Out of Session</span>
                  <svg className="w-5 h-5 opacity-30 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
                <button 
                  onClick={onResetData}
                  className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[1.5rem] hover:border-orange-500 hover:text-orange-500 transition-all font-black text-sm group"
                >
                  <span>Clear Local History</span>
                  <svg className="w-5 h-5 opacity-30 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </section>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] uppercase tracking-widest text-xs"
          >
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const TargetInput: React.FC<{
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  color: string;
}> = ({ label, unit, value, onChange, min, max, step, color }) => {
  const accentClasses: Record<string, string> = {
    emerald: 'accent-emerald-500 text-emerald-600 bg-emerald-50',
    blue: 'accent-blue-500 text-blue-600 bg-blue-50',
    amber: 'accent-amber-500 text-amber-600 bg-amber-50',
    purple: 'accent-purple-500 text-purple-600 bg-purple-50',
    teal: 'accent-teal-500 text-teal-600 bg-teal-50',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
          <p className="text-3xl font-black text-slate-900 mt-1">{value}<span className="text-sm font-bold text-slate-200 ml-1">{unit}</span></p>
        </div>
      </div>
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer ${accentClasses[color].split(' ')[0]}`}
      />
    </div>
  );
};

export default ProfileSettings;
