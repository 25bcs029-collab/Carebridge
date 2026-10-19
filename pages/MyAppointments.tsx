
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Header, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';

const MyAppointments: React.FC = () => {
  const { user, appointments, doctors, lang, addNotification, setAppointments } = useApp();
  const navigate = useNavigate();
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [cancellingAppId, setCancellingAppId] = useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('ALL');

  const userAppsRaw = useMemo(() => appointments.filter(a => a.userId === user?.id), [appointments, user]);

  // Derived list of specialties from user's appointments for filtering
  const availableSpecialties = useMemo(() => {
    const specs = new Set<string>();
    userAppsRaw.forEach(app => {
      const doc = doctors.find(d => d.id === app.doctorId);
      if (doc) specs.add(doc.specialty);
    });
    return Array.from(specs);
  }, [userAppsRaw, doctors]);

  const filteredApps = useMemo(() => {
    return userAppsRaw.filter(app => {
      const doctor = doctors.find(d => d.id === app.doctorId);
      
      // Status Check
      if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
      
      // Specialty Check
      if (specialtyFilter !== 'ALL' && doctor?.specialty !== specialtyFilter) return false;

      // Time Check (Simplified parsing of "DD MMM, HH:mm - HH:mm")
      if (timeFilter !== 'ALL') {
        try {
          const datePart = app.timeSlot.split(',')[0]; // e.g., "24 Mar"
          const currentYear = new Date().getFullYear();
          const appDate = new Date(`${datePart} ${currentYear}`);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (timeFilter === 'UPCOMING' && appDate < today) return false;
          if (timeFilter === 'PAST' && appDate >= today) return false;
        } catch (e) {
          console.error("Date parsing failed", e);
        }
      }

      return true;
    }).sort((a, b) => {
        // Sort by date (descending)
        try {
            const dateA = new Date(`${a.timeSlot.split(',')[0]} ${new Date().getFullYear()}`);
            const dateB = new Date(`${b.timeSlot.split(',')[0]} ${new Date().getFullYear()}`);
            return dateB.getTime() - dateA.getTime();
        } catch { return 0; }
    });
  }, [userAppsRaw, statusFilter, timeFilter, specialtyFilter, doctors]);

  const getQRUrl = (appId: string) => {
    const baseUrl = window.location.href.split('#')[0];
    const verifyUrl = `${baseUrl}#/verify/${appId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verifyUrl)}&margin=10&bgcolor=ffffff`;
  };

  const handleCancelAppointment = () => {
    if (!cancellingAppId) return;

    const updatedApps = appointments.map(app => 
      app.id === cancellingAppId ? { ...app, status: 'CANCELLED' as const } : app
    );
    
    setAppointments(updatedApps);
    
    const cancelledApp = appointments.find(a => a.id === cancellingAppId);
    const doc = doctors.find(d => d.id === cancelledApp?.doctorId);

    addNotification({
      title: lang === 'en' ? 'Appointment Cancelled' : 'சந்திப்பு ரத்து செய்யப்பட்டது',
      message: lang === 'en' 
        ? `Your appointment with ${doc?.name} has been cancelled.` 
        : `${doc?.name} உடனான உங்கள் சந்திப்பு ரத்து செய்யப்பட்டது.`,
      type: 'SYSTEM'
    });

    setCancellingAppId(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-10">
      <Header title={lang === 'en' ? "My Appointments" : "எனது சந்திப்புகள்"} showBack />
      
      <div className="bg-white border-b sticky top-[68px] z-40 p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Records</h3>
           <button 
             onClick={() => { setStatusFilter('ALL'); setTimeFilter('ALL'); setSpecialtyFilter('ALL'); }}
             className="text-[9px] font-black text-blue-600 uppercase"
           >
             Reset
           </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Status & Time filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             <select 
               value={timeFilter} 
               onChange={(e) => setTimeFilter(e.target.value as any)}
               className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-blue-500"
             >
               <option value="ALL">All Dates</option>
               <option value="UPCOMING">Upcoming</option>
               <option value="PAST">Past</option>
             </select>

             <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value as any)}
               className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-blue-500"
             >
               <option value="ALL">All Status</option>
               <option value="CONFIRMED">Confirmed</option>
               <option value="CANCELLED">Cancelled</option>
             </select>

             <select 
               value={specialtyFilter} 
               onChange={(e) => setSpecialtyFilter(e.target.value)}
               className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-blue-500"
             >
               <option value="ALL">All Specialties</option>
               {availableSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
        </div>
      </div>

      <main className="p-4 flex flex-col gap-6">
        {filteredApps.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <i className="fas fa-calendar-times text-4xl"></i>
            </div>
            <div>
              <p className="text-slate-500 font-medium">
                {lang === 'en' ? "No matching appointments found." : "சந்திப்புகள் எதுவும் இல்லை."}
              </p>
              {userAppsRaw.length === 0 ? (
                <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/book-doctor')}
                >
                    {lang === 'en' ? "Book Now" : "இப்போதே பதிவு செய்க"}
                </Button>
              ) : (
                <button 
                  onClick={() => { setStatusFilter('ALL'); setTimeFilter('ALL'); setSpecialtyFilter('ALL'); }}
                  className="mt-2 text-blue-600 font-black text-xs uppercase"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredApps.map(app => {
            const doctor = doctors.find(d => d.id === app.doctorId);
            const qrCodeUrl = getQRUrl(app.id);
            const isCancelled = app.status === 'CANCELLED';

            return (
              <div 
                key={app.id} 
                className={`relative bg-white rounded-2xl shadow-md border-2 overflow-hidden flex flex-col animate-fade-in transition-opacity ${isCancelled ? 'opacity-70 grayscale-[0.5] border-slate-200' : 'border-slate-100'}`}
                aria-label="Appointment Token"
              >
                {/* Header Strip */}
                <div className={`${isCancelled ? 'bg-slate-400' : (app.isEmergency ? 'bg-red-700' : 'bg-blue-600')} px-4 py-3 flex justify-between items-center text-white`}>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-id-card text-xs"></i>
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {isCancelled 
                        ? (lang === 'en' ? 'Cancelled Token' : 'ரத்து செய்யப்பட்ட டோக்கன்')
                        : (lang === 'en' ? 'Verified Medical Token' : 'சரிபார்க்கப்பட்ட டோக்கன்')
                      }
                    </span>
                  </div>
                  <span className="text-[10px] font-bold opacity-80">REF: {app.id.toUpperCase()}</span>
                </div>

                {/* Ticket Body */}
                <div className="p-6 flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">{doctor?.name}</h3>
                      <p className={`text-xs font-bold uppercase tracking-wide mt-1 ${isCancelled ? 'text-slate-500' : 'text-blue-600'}`}>{doctor?.specialty}</p>
                    </div>
                    {/* Functional QR Code Button */}
                    {!isCancelled && (
                      <button 
                        onClick={() => setSelectedQR(qrCodeUrl)}
                        className="bg-white p-2 rounded-xl border-2 border-slate-100 hover:border-blue-200 transition-all shadow-sm active:scale-95 group"
                      >
                        <img 
                          src={qrCodeUrl} 
                          alt="Verification QR" 
                          className="w-14 h-14 rounded-md"
                        />
                        <div className="flex items-center justify-center gap-1 mt-1.5">
                           <i className="fas fa-expand text-[8px] text-blue-500"></i>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Tap to Expand</p>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6 border-t border-dashed border-slate-200 pt-5">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        {lang === 'en' ? 'PATIENT' : 'நோயாளி'}
                      </p>
                      <p className="font-black text-slate-800 text-sm truncate">{app.patientName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        {lang === 'en' ? 'TIME SLOT' : 'நேரம்'}
                      </p>
                      <p className="font-black text-slate-800 text-sm truncate">{app.timeSlot}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {lang === 'en' ? 'HOSPITAL LOCATION' : 'மருத்துவமனை இடம்'}
                    </p>
                    <div className="flex items-start gap-2">
                      <i className={`fas fa-map-marker-alt mt-1 ${isCancelled ? 'text-slate-400' : 'text-red-500'}`}></i>
                      <p className="text-sm text-slate-700 font-bold leading-snug">
                        {doctor?.hospital}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Area */}
                <div className="bg-slate-50 border-t border-slate-100 p-5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {lang === 'en' ? 'Token Number' : 'டோக்கன் எண்'}
                    </span>
                    <span className={`text-4xl font-black ${isCancelled ? 'text-slate-400' : (app.isEmergency ? 'text-red-700' : 'text-blue-700')}`}>
                      {app.isEmergency ? 'PRIORITY' : `#${app.tokenNumber}`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border-2 ${
                      app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border-green-200' : 
                      isCancelled ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {app.status}
                    </span>
                    {!isCancelled && (
                      <button 
                        onClick={() => setCancellingAppId(app.id)}
                        className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline mt-1"
                      >
                        {lang === 'en' ? 'Cancel Appointment' : 'சந்திப்பை ரத்து செய்'}
                      </button>
                    )}
                    {isCancelled && <p className="text-[9px] font-bold text-slate-300 uppercase italic">Archived Record</p>}
                  </div>
                </div>

                {/* Aesthetic punch holes for ticket look */}
                <div className="absolute top-[68%] -left-3 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200 shadow-inner transform -translate-y-1/2"></div>
                <div className="absolute top-[68%] -right-3 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200 shadow-inner transform -translate-y-1/2"></div>
              </div>
            );
          })
        )}
      </main>

      {/* QR Code Expansion Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => setSelectedQR(null)}>
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 flex flex-col items-center gap-8 shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Token Verification</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Hold screen near the hospital scanner</p>
            </div>
            
            <div className="p-4 bg-white border-4 border-slate-50 rounded-[32px] shadow-inner">
              <img 
                src={selectedQR} 
                alt="Large Scan QR" 
                className="w-64 h-64 rounded-xl"
              />
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="w-12 h-1 bg-slate-100 rounded-full"></div>
              <Button onClick={() => setSelectedQR(null)} variant="secondary" className="w-full h-14 rounded-2xl text-base">
                Dismiss Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingAppId && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => setCancellingAppId(null)}>
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 flex flex-col items-center gap-6 shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-inner">
              <i className="fas fa-exclamation-circle text-4xl"></i>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                {lang === 'en' ? 'Cancel Appointment?' : 'சந்திப்பை ரத்து செய்யவா?'}
              </h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed px-4">
                {lang === 'en' 
                  ? "Are you sure you want to cancel this booking? This action cannot be undone." 
                  : "இந்த பதிவை ரத்து செய்ய விரும்புகிறீர்களா? இந்தச் செயலை மாற்ற முடியாது."}
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleCancelAppointment} variant="danger" className="w-full h-14 rounded-2xl text-base">
                {lang === 'en' ? 'Yes, Cancel Now' : 'ஆம், ரத்து செய்'}
              </Button>
              <Button onClick={() => setCancellingAppId(null)} variant="secondary" className="w-full h-14 rounded-2xl text-base">
                {lang === 'en' ? 'Keep Appointment' : 'வேண்டாம், அப்படியே இருக்கட்டும்'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto p-4 px-10 text-center">
        <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter opacity-60">
          {lang === 'en' 
            ? "Present the Digital Token at the hospital reception for secure instant verification and queue priority." 
            : "மருத்துவமனை வரவேற்பறையில் சரிபார்ப்பதற்காக இந்த டிஜிட்டல் டோக்கனைக் காட்டவும்."}
        </p>
      </footer>
    </div>
  );
};

export default MyAppointments;
