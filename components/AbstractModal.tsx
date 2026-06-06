
import React from 'react';

interface Props {
  onClose: () => void;
}

const AbstractModal: React.FC<Props> = ({ onClose }) => {
  const agendaItems = [
    { title: "Abstract", content: "Nutri-Smart is an advanced AI-driven nutrition analysis system designed to help individuals track calories and optimize diet through image-based detection. It eliminates manual input errors using state-of-the-art vision models." },
    { title: "Introduction", content: "The integration of AI in healthcare and wellness. Nutri-Smart serves as a personal health assistant that translates visual food data into actionable nutritional insights in real-time." },
    { title: "Literature Review", content: "Analysis of existing dietary apps like MyFitnessPal and Cronometer. Identifying gaps in automated portion estimation and the lack of integrated cooking advice in traditional systems." },
    { title: "Problem Statement", content: "Manual dietary logging is tedious, inaccurate, and lacks immediate feedback. Users struggle to estimate portion sizes and nutritional values from complex, multi-item meals." },
    { title: "Objectives", content: "1. Automate food item detection. 2. Provide precise macro-nutritional breakdowns. 3. Suggest healthier alternative recipes. 4. Offer real-time hydration and goal tracking." },
    { title: "Functional Requirements", content: "Image upload/capture, AI processing, Macro visualization, History persistence. Non-functional: 99% uptime, <3s response time, responsive UI." },
    { title: "Hardware & Software", content: "Hardware: Camera-enabled device, Laptop. Software: React.js, Tailwind CSS, Google Gemini 3.0 API, TypeScript, Vite." },
    { title: "Proposed Methodology", content: "Utilizing Gemini 3.0 Flash for Multimodal inference. Image parsing via Base64, JSON Schema mapping for structured nutrition data, and SVG coordinate mapping for UI overlays." },
    { title: "System Architecture", content: "Client-Serverless Architecture. The frontend communicates directly with Cloud AI models. Data flow: Image -> AI Vision Core -> Nutrition API -> Dynamic UI Rendering." },
    { title: "Future Course of Action", content: "Implementation of real-time video stream analysis, integration with wearable health devices (Apple Health/Google Fit), and AI-driven meal plan automation." }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-fade-in border border-white/20">
        
        {/* Academic Header (From PPT Template) */}
        <div className="bg-white border-b-4 border-emerald-500 p-8 text-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="flex flex-col items-center mb-4">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2 overflow-hidden border border-slate-100">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100" className="w-full h-full object-cover" alt="CVR Logo" />
             </div>
             <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter">CVR COLLEGE OF ENGINEERING</h4>
             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">(An UGC Autonomous Institute, Accredited by NAAC with 'A' Grade)</p>
          </div>
          
          <div className="space-y-0.5">
            <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Department of CSE (AI&ML)</h5>
            <p className="text-[10px] font-bold text-slate-400 uppercase">B. Tech CSE(AI&ML)-A III Year II Semester</p>
            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Industry Oriented Major Project (IOMP)</p>
          </div>

          <div className="mt-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">AI-BASED NUTRI-SMART</h2>
          </div>

          <div className="mt-8 flex justify-between items-end text-left">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Supervisor:</p>
              <p className="text-xs font-bold text-slate-900">Department Faculty Lead</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Presented By:</p>
              <p className="text-[11px] font-bold text-slate-900">S. Akhila (Roll no 1)</p>
              <p className="text-[11px] font-bold text-slate-900">B. Akshara (Roll no 2)</p>
              <p className="text-[11px] font-bold text-slate-900">M. Thapaswi (Roll no 3)</p>
            </div>
          </div>
        </div>

        {/* Content Body - The Agenda */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-50/30">
           <div className="border-b border-slate-200 pb-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Agenda of the IOMP Presentation</h3>
           </div>

           <div className="space-y-10">
              {agendaItems.map((item, index) => (
                <section key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-1">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">{item.title}</h4>
                      <p className="text-slate-600 leading-relaxed font-medium text-sm">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </section>
              ))}
           </div>

           {/* Thank You Section (From PPT) */}
           <div className="py-24 text-center border-t border-slate-100 bg-white rounded-[3rem] mt-12 shadow-sm">
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic">THANK YOU</h2>
              <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mt-4">End of Presentation</p>
           </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex justify-center">
           <button 
             onClick={onClose}
             className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-100"
           >
             Close Documentation
           </button>
        </div>
      </div>
    </div>
  );
};

export default AbstractModal;
