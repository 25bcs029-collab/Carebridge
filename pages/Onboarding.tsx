
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Button, Input, Logo } from '../components/UI';
import { User, Role } from '../types';
import { useNavigate } from 'react-router-dom';

type SOSStep = 'TYPE' | 'COUNTDOWN' | 'SCANNING' | 'RESULT';

const CareSlotMap: React.FC<{ showRoute: boolean }> = ({ showRoute }) => {
  return (
    <div className="relative w-full h-full bg-[#f8fafc] rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <rect x="0" y="0" width="400" height="400" fill="#f1f5f9" />
        <path d="M0 100 H400 M0 200 H400 M0 300 H400 M100 0 V400 M200 0 V400 M300 0 V400" stroke="#e2e8f0" strokeWidth="2" fill="none" />
        <rect x="20" y="20" width="60" height="60" rx="8" fill="#cbd5e1" />
        <rect x="120" y="220" width="60" height="60" rx="8" fill="#cbd5e1" />
        <rect x="320" y="120" width="40" height="160" rx="8" fill="#cbd5e1" />
        <rect x="20" y="320" width="160" height="40" rx="8" fill="#cbd5e1" />
        <circle cx="80" cy="280" r="16" fill="#3b82f6" className="opacity-20 animate-pulse" />
        <circle cx="80" cy="280" r="8" fill="#3b82f6" stroke="white" strokeWidth="3" />
        <text x="65" y="310" fontSize="10" fontWeight="900" fill="#3b82f6" className="uppercase tracking-tighter">My Location</text>
        <g transform="translate(300, 80)">
          <circle r="18" fill="#ef4444" className="opacity-20 animate-pulse" />
          <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#ef4444" />
          <path d="M-5 0 H5 M0 -5 V5" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </g>
        <text x="245" y="115" fontSize="10" fontWeight="900" fill="#ef4444" className="uppercase tracking-tighter">Metro General</text>
        {showRoute && (
          <path 
            d="M 80 280 L 300 280 L 300 80" 
            stroke="#3b82f6" 
            strokeWidth="6" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            strokeDasharray="500"
            strokeDashoffset="500"
            className="animate-route-draw"
          >
            <animate attributeName="stroke-dashoffset" from="500" to="0" dur="2s" fill="freeze" />
          </path>
        )}
      </svg>
      <style>{`
        @keyframes route-draw {
          to { stroke-dashoffset: 0; }
        }
        .animate-route-draw {
          animation: route-draw 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const Onboarding: React.FC = () => {
  const { setUser, allUsers, setAllUsers, lang } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState<'INITIAL' | 'SIGNUP' | 'LOGIN' | 'SOS'>('INITIAL');
  const [sosStep, setSosStep] = useState<SOSStep>('TYPE');
  const [countdown, setCountdown] = useState(5);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    let timer: any;
    if (view === 'SOS' && sosStep === 'COUNTDOWN') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setSosStep('SCANNING');
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, sosStep]);

  useEffect(() => {
    if (sosStep === 'SCANNING') {
      const timer = setTimeout(() => {
        setSosStep('RESULT');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sosStep]);

  const handleAuth = (role: Role, emergencyType?: string) => {
    if (role === 'EMERGENCY') {
      setUser({
        id: `emergency-${Date.now()}`,
        name: emergencyType || (lang === 'en' ? 'Emergency' : 'அவசரம்'),
        mobile: '000',
        role: 'EMERGENCY',
        isBloodDonor: false,
        isDonorActive: false,
        isOrganDonor: false,
        donatedOrgans: []
      });
      return;
    }
    if (view === 'SIGNUP') {
      if (!name || mobile.length !== 10) return alert("Valid name and 10-digit mobile required.");
      const newUser: User = { id: Math.random().toString(36).substr(2, 9), name, mobile, email, role: 'PUBLIC', isBloodDonor: false, isDonorActive: false, isOrganDonor: false, donatedOrgans: [] };
      setAllUsers([...allUsers, newUser]);
      setUser(newUser);
    } else {
      const existingUser = allUsers.find(u => u.mobile === mobile);
      if (existingUser || mobile === 'admin') setUser(existingUser || { id: 'admin', name: 'Admin', mobile: 'admin', role: 'ADMIN', isBloodDonor: false, isDonorActive: false, isOrganDonor: false, donatedOrgans: [] });
    }
  };

  if (view === 'SOS') {
    if (sosStep === 'TYPE') {
      const emergencyTypes = ['Cardiac Arrest', 'Accident / Trauma', 'Respiratory', 'Pregnancy', 'Severe Bleeding', 'Others'];
      return (
        <div className="absolute inset-0 bg-[#e57373] z-[300] flex flex-col items-center justify-between py-12 px-6 text-white animate-fade-in font-sans overflow-hidden">
          <div className="w-full flex justify-between items-center opacity-80">
            <div className="flex items-center gap-2">
              <i className="fas fa-shield-alt text-xs"></i>
              <span className="font-black text-[10px] uppercase tracking-widest">CareSlot SOS</span>
            </div>
            <button onClick={() => setView('INITIAL')} className="px-3 py-1 border border-white/40 rounded-full text-[9px] font-black uppercase">Close</button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-10">
            <h1 className="text-4xl font-black text-center leading-[0.9] tracking-tighter uppercase mb-2">CHOOSE<br/>EMERGENCY<br/>TYPE</h1>
            <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
              {emergencyTypes.map((type) => (
                <button key={type} onClick={() => setSosStep('COUNTDOWN')} className="h-16 rounded-[22px] border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-[11px] font-black text-center px-4 leading-tight uppercase tracking-tight">{type}</button>
              ))}
            </div>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.25em] opacity-40">ENCRYPTION SECURED • GPS SIGNAL ACTIVE • NETWORK PRIORITY</p>
        </div>
      );
    }
    if (sosStep === 'COUNTDOWN') {
      return (
        <div className="absolute inset-0 bg-[#D32F2F] z-[300] flex flex-col items-center justify-center p-8 text-white animate-fade-in">
          <div className="text-[140px] font-black leading-none mb-4 animate-bounce drop-shadow-2xl">{countdown}</div>
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Transmitting...</h2>
          <p className="text-sm opacity-60 text-center max-w-[200px] font-bold">Connecting to the nearest medical response unit.</p>
          <button onClick={() => setSosStep('TYPE')} className="mt-16 px-10 py-4 rounded-2xl bg-white/10 border border-white/20 font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">Cancel Emergency</button>
        </div>
      );
    }
    if (sosStep === 'SCANNING') {
      return (
        <div className="absolute inset-0 bg-[#1e293b] z-[300] flex flex-col items-center justify-center p-8 text-white">
          <div className="relative w-48 h-48 mb-12">
            <div className="absolute inset-0 border-[10px] border-blue-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-t-[10px] border-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-[10px] border-teal-500/10 rounded-full"></div>
            <div className="absolute inset-4 border-b-[10px] border-teal-500 rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-radar text-5xl text-blue-400 animate-pulse"></i>
            </div>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Scanning Region</h2>
          <p className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] animate-pulse">Checking Hospitals & Ambulances...</p>
        </div>
      );
    }
    if (sosStep === 'RESULT') {
      return (
        <div className="absolute inset-0 bg-white z-[300] flex flex-col animate-fade-in font-sans">
          <header className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100"><i className="fas fa-ambulance"></i></div>
              <div>
                <h3 className="font-black text-slate-900 leading-none text-base">UNIT LOCATED</h3>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Ready for Dispatch</p>
              </div>
            </div>
            <button onClick={() => setView('INITIAL')} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-400"><i className="fas fa-times text-sm"></i></button>
          </header>
          <div className="flex-1 p-5 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 min-h-[250px] relative">
              <CareSlotMap showRoute={isNavigating} />
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl">
              <h4 className="font-black text-lg leading-tight uppercase tracking-tight">Metro General Hospital</h4>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button onClick={() => alert("SOS ALERT dispatched.")} className="bg-red-600 h-16 rounded-2xl font-black uppercase text-[11px]">Call Ambulance</button>
                <button onClick={() => setIsNavigating(true)} className="bg-white text-slate-900 h-16 rounded-2xl font-black uppercase text-[11px]">Navigate</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex-1 flex flex-col relative h-full bg-white">
      {/* Support Section Top Left */}
      <div className="absolute top-6 left-6 z-[50]">
        <button 
          onClick={() => navigate('/support')}
          className="flex items-center gap-2 bg-[#f1f5f9] px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 group"
        >
          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px]">
            <i className="fas fa-question group-hover:scale-110 transition-transform"></i>
          </div>
          <span className="text-[10px] font-black text-[#475569] uppercase tracking-widest">Support</span>
        </button>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        {view === 'INITIAL' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center animate-fade-in">
            <Logo size="lg" className="mb-2 shadow-2xl" />
            <div className="flex flex-col items-center">
              <h1 className="text-[44px] font-black text-slate-900 tracking-[-0.07em] leading-tight select-none italic">
                <span className="text-[#2563eb]">Care</span>
                <span className="text-[#10b981]">Slot</span>
              </h1>
              <p className="text-slate-400 mt-4 text-xs font-bold uppercase tracking-[0.2em] max-w-[200px] leading-relaxed opacity-80">
                Next-Gen Healthcare Portal
              </p>
            </div>
            
            {/* Action Buttons styled like the requested image */}
            <div className="w-full flex flex-col gap-4 mt-12 max-w-[300px]">
              <button 
                onClick={() => setView('SIGNUP')} 
                className="w-full h-[64px] bg-[#2563eb] text-white rounded-xl font-black text-lg uppercase tracking-tight shadow-lg shadow-blue-100 active:scale-[0.98] transition-all"
              >
                PERSONAL CHECKUP
              </button>
              
              <button 
                onClick={() => handleAuth('EMERGENCY')} 
                className="w-full h-[64px] bg-[#f1f5f9] text-[#ef4444] rounded-xl font-black text-lg uppercase tracking-tight active:scale-[0.98] transition-all"
              >
                EMERGENCY USER
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in pt-8">
            <button 
              onClick={() => setView('INITIAL')} 
              className="flex items-center gap-2 text-[#739af0] mb-6 p-1 hover:text-blue-600 transition-colors"
            >
              <i className="fas fa-arrow-left text-xs"></i>
              <span className="text-[11px] font-black uppercase tracking-widest">Back</span>
            </button>
            <h2 className="text-[32px] font-black text-slate-900 mb-8 tracking-tighter">
              {view === 'SIGNUP' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <div className="flex flex-col gap-5">
              {view === 'SIGNUP' && (
                <Input 
                  label="FULL NAME" 
                  value={name} 
                  onChange={setName} 
                  placeholder="John Doe" 
                  required 
                  className="bg-[#f8fafc] border-slate-100"
                />
              )}
              <Input 
                label="MOBILE NUMBER" 
                value={mobile} 
                onChange={setMobile} 
                placeholder="Enter 10-digit mobile" 
                required 
                maxLength={10} 
                type="tel" 
                onlyNumbers={mobile !== 'admin'} 
                className="bg-[#f8fafc] border-slate-100"
              />
              <button 
                onClick={() => handleAuth('PUBLIC')} 
                className="mt-6 w-full h-15 bg-[#739af0] text-white rounded-xl font-black text-base uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all"
              >
                {view === 'SIGNUP' ? 'SIGN UP' : 'LOGIN'}
              </button>
              
              <p className="text-center text-[11px] font-black text-[#94a3b8] mt-8 uppercase tracking-widest">
                {view === 'SIGNUP' ? "ALREADY REGISTERED? " : "NEW TO CARESLOT? "} 
                <button 
                  onClick={() => setView(view === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')} 
                  className="text-[#2563eb] font-black underline underline-offset-4"
                >
                  {view === 'SIGNUP' ? 'Login' : 'Join Now'}
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white mt-auto">
        <button 
          onClick={() => { setSosStep('TYPE'); setView('SOS'); setIsNavigating(false); }} 
          className="w-full h-18 bg-[#ef4444] text-white rounded-[24px] font-black text-xl uppercase tracking-tighter shadow-2xl shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <i className="fas fa-bolt text-lg"></i>
          </div>
          CARESLOT SOS
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
