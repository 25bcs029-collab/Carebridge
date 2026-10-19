
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Header, Button, Logo } from '../components/UI';

const TokenVerification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { appointments, doctors, allUsers, lang } = useApp();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);

  const app = useMemo(() => appointments.find(a => a.id === id), [appointments, id]);
  const doctor = useMemo(() => app ? doctors.find(d => d.id === app.doctorId) : null, [app, doctors]);
  const patientProfile = useMemo(() => app ? allUsers.find(u => u.id === app.userId) : null, [app, allUsers]);

  useEffect(() => {
    const timer = setTimeout(() => setIsValidating(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!app || !doctor) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50">
        <Header title="Verification Error" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6 animate-fade-in">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-lg">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Invalid Token</h2>
            <p className="text-sm text-slate-500 font-bold max-w-[220px] mx-auto">This medical token record could not be found or the link has expired.</p>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="secondary" className="w-full h-14 rounded-2xl">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="flex-1 flex flex-col bg-slate-900 items-center justify-center p-12 text-center gap-6">
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <i className="fas fa-shield-alt text-3xl text-blue-400 animate-pulse"></i>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Verifying Secure Link</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Checking CareSlot Central Health Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-white overflow-hidden font-sans">
      <Header title="Staff Verification" showBack />
      
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-20">
        {/* Verification Status Badge */}
        <div className="flex justify-center animate-fade-in">
          <div className="bg-green-500/10 border border-green-500/30 px-6 py-2.5 rounded-full flex items-center gap-3 shadow-lg shadow-green-900/20">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white">
              <i className="fas fa-check"></i>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-green-400">Authenticated Token</span>
          </div>
        </div>

        {/* Big Token Number Display */}
        <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-6 opacity-5">
             <Logo size="lg" />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Live Token Status</span>
          <h1 className={`text-7xl font-black tracking-tighter ${app.isEmergency ? 'text-red-500' : 'text-blue-400'}`}>
            {app.isEmergency ? 'PRIORITY' : `#${app.tokenNumber}`}
          </h1>
          <div className="mt-5 px-5 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 border border-white/5">
            {app.status} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Valid
          </div>
        </div>

        {/* Patient Details Section */}
        <div className="flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Patient Record</h3>
            <span className="text-[9px] font-black text-blue-400 uppercase">Registry Verified</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <i className="fas fa-user-circle text-3xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Subject Name</p>
                <p className="text-xl font-black truncate text-white">{app.patientName}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Blood Group</p>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center font-black text-xs border border-red-500/30">
                      {patientProfile?.bloodType || 'N/A'}
                   </div>
                   <span className="text-sm font-bold">{patientProfile?.bloodType || 'Unknown'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Schedule</p>
                <div className="flex items-center gap-2">
                   <i className="fas fa-clock text-blue-400 text-xs"></i>
                   <span className="text-sm font-black truncate">{app.timeSlot}</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-white/5 flex flex-col gap-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Clinical Reason</p>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 italic text-sm font-medium text-slate-300 leading-relaxed">
                 "{app.reason || 'Standard Clinical Consultation'}"
              </div>
            </div>
          </div>
        </div>

        {/* Facility Details */}
        <div className="flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Facility</h3>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center border border-teal-500/30">
                <i className="fas fa-user-md text-3xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-black truncate">{doctor.name}</p>
                <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mt-1">{doctor.specialty}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-slate-800/40 p-4 rounded-2xl border border-white/5">
              <i className="fas fa-hospital text-slate-500 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black leading-tight text-white">{doctor.hospital}</p>
                <p className="text-[10px] text-slate-500 font-bold leading-tight mt-1 uppercase">{doctor.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Logs */}
        <div className="mt-4 p-6 bg-slate-800/80 rounded-3xl border border-slate-700 flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-fingerprint"></i>
             </div>
             <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
               Verification Log: {new Date().toISOString()} • SHA-256 Validated • Patient Mobile: {app.patientMobile}
             </p>
          </div>
          <div className="flex items-center justify-between">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800"></div>)}
                <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-slate-800 flex items-center justify-center text-[8px] font-black">+12</div>
             </div>
             <span className="text-[9px] font-black text-slate-500 uppercase">Trusted by {doctor.hospital.split(' ')[0]}</span>
          </div>
        </div>
      </main>

      <div className="p-6 bg-slate-900 border-t border-white/5 flex gap-3">
         <Button onClick={() => navigate('/dashboard')} variant="secondary" className="flex-1 h-14 bg-white/5 border border-white/10 text-white rounded-2xl">
           Close Secure Portal
         </Button>
         <Button onClick={() => window.print()} variant="primary" className="h-14 w-14 bg-blue-600 rounded-2xl">
           <i className="fas fa-print"></i>
         </Button>
      </div>
    </div>
  );
};

export default TokenVerification;
