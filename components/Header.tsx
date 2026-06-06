
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-emerald-200 border-2 border-white">
             <img 
               src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100&auto=format&fit=crop" 
               alt="NutriSmart Logo" 
               className="w-full h-full object-cover"
             />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900">
            NUTRI<span className="text-emerald-500">SMART</span>
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[9px] uppercase tracking-widest">AI Vision</span>
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Health Intelligence</span>
             <span className="text-xs font-black text-emerald-600 flex items-center">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
               ACTIVE ANALYSIS
             </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
