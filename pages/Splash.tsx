
import React, { useEffect, useState } from 'react';
import { useApp } from '../App';
import { Logo } from '../components/UI';

const Splash: React.FC = () => {
  const { lang } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(nextProgress);
      
      if (nextProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-between p-12">
      {/* Top balance spacer */}
      <div className="h-16"></div>

      {/* Main Branding Focus */}
      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center">
        <Logo size="xl" className="mb-8 animate-pulse shadow-2xl" />
        <h1 className="text-4xl font-black text-blue-900 tracking-tight mb-2">CareSlot</h1>
        <p className="text-slate-400 font-medium text-sm text-center max-w-[220px] leading-relaxed">
          {lang === 'en' ? 'Strengthening Health Systems for All' : 'அனைவருக்கும் சுகாதார அமைப்புகளை வலுப்படுத்துதல்'}
        </p>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="w-full max-w-[280px] mb-8">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-3 px-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {lang === 'en' ? 'Initializing' : 'துவங்குகிறது'}
          </span>
          <span className="text-xs font-black text-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      
      <div className="pb-4">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
          Secure Healthcare Portal
        </p>
      </div>
    </div>
  );
};

export default Splash;
