
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, LanguageCode } from '../App';
import { Header, Logo, Button } from '../components/UI';

const Dashboard: React.FC = () => {
  const { user, setUser, lang, setLang, appointments, isPersistent, setIsPersistent, notifications, setNotifications } = useApp();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showTranslatorMenu, setShowTranslatorMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userApps = appointments.filter(a => a.userId === user?.id);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const menuOptions = [
    { 
      id: 'A', 
      title: lang === 'ta' ? 'மருத்துவர் சந்திப்பு பதிவு' : 'Book Doctor Appointment', 
      icon: 'fa-user-md', 
      color: 'bg-blue-500', 
      route: '/book-doctor',
      delay: '0.1s'
    },
    { 
      id: 'B', 
      title: lang === 'ta' ? 'ரத்த தானம் செய்பவர் தேடல்' : 'Blood Donor Finder', 
      icon: 'fa-tint', 
      color: 'bg-red-500', 
      route: '/blood-donor',
      delay: '0.2s'
    },
    { 
      id: 'MAP', 
      title: lang === 'ta' ? 'மருத்துவ வரைபடம்' : 'Health Map', 
      icon: 'fa-map-location-dot', 
      color: 'bg-emerald-600', 
      route: '/health-map',
      delay: '0.3s'
    },
    { 
      id: 'D', 
      title: lang === 'ta' ? 'AI சுகாதார மையம்' : 'Gemini AI Hub', 
      icon: 'fa-sparkles', 
      color: 'bg-indigo-600', 
      route: '/ai-hub',
      delay: '0.4s'
    },
  ];

  const handleLogout = () => {
    setUser(null);
    setShowSettings(false);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const languages: { code: LanguageCode; name: string; native: string }[] = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'மலையாளம்' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  ];

  const headerActions = (
    <div className="flex items-center gap-1">
      <button 
        onClick={() => { setShowNotifications(true); markAllRead(); }}
        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors focus:ring-2 focus:ring-slate-300 outline-none relative"
        aria-label="Notifications"
      >
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>
      <button 
        onClick={() => setShowSettings(true)}
        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors focus:ring-2 focus:ring-slate-300 outline-none"
        aria-label="Settings"
      >
        <i className="fas fa-cog text-xl"></i>
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen relative overflow-hidden">
      <Header title="CareSlot" rightAction={headerActions} />
      
      <div className="p-6 bg-white shadow-sm mb-2 animate-fade-in fill-forwards">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Welcome back,' : 'மீண்டும் வருக,'}</p>
            <h2 className="text-2xl font-black text-slate-900 mt-1 leading-tight">{user?.name}</h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => navigate('/admin')} 
                className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black border border-amber-200 uppercase tracking-tighter"
              >
                Admin Mode
              </button>
            )}
            <button 
              onClick={() => navigate('/my-appointments')} 
              className="relative px-4 py-2 bg-blue-600 text-white rounded-full text-[11px] font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <i className="fas fa-calendar-check"></i>
              {lang === 'ta' ? 'எனது பதிவுகள்' : 'MY BOOKINGS'}
              {userApps.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full ring-2 ring-white font-black animate-pulse">
                  {userApps.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 gap-4 flex-1">
        {menuOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => navigate(opt.route)}
            style={{ animationDelay: opt.delay }}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 group transition-all duration-300 hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1 active:scale-95 animate-fade-in opacity-0 fill-forwards aspect-square"
            aria-label={opt.title}
          >
            <div className={`w-14 h-14 ${opt.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <i className={`fas ${opt.icon} text-2xl`}></i>
            </div>
            <div className="text-center px-1">
              <span className="text-[13px] font-black text-slate-800 leading-tight block">
                {opt.title}
              </span>
            </div>
          </button>
        ))}
        {/* Special Cancer Monitor Tile */}
        <button
          onClick={() => navigate('/cancer-monitor')}
          className="col-span-2 flex items-center p-6 bg-purple-600 text-white rounded-3xl shadow-lg hover:shadow-purple-200 transition-all active:scale-95 animate-fade-in opacity-0 fill-forwards"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mr-4">
            <i className="fas fa-ribbon text-xl"></i>
          </div>
          <div className="text-left">
            <h4 className="font-black text-sm uppercase tracking-tight">Cancer Health Monitor</h4>
            <p className="text-[10px] opacity-80 font-bold">Track symptoms & AI Analysis</p>
          </div>
          <i className="fas fa-chevron-right ml-auto opacity-50"></i>
        </button>
      </div>

      <div className="px-6 pb-8">
        <button 
          onClick={() => {
            const lastApp = appointments.filter(a => a.userId === user?.id).pop();
            if (lastApp) navigate(`/verify/${lastApp.id}`);
            else alert("Please book an appointment first to test the Hospital Scanner.");
          }}
          className="w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-between px-6 hover:bg-slate-800 transition-colors shadow-xl group"
        >
          <div className="flex items-center gap-3">
             <i className="fas fa-hospital-user text-lg text-blue-400"></i>
             <div className="text-left">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Hospital Portal</p>
               <p className="text-xs font-bold mt-1">Staff Verification Tool</p>
             </div>
          </div>
          <i className="fas fa-qrcode text-xl group-hover:scale-110 transition-transform"></i>
        </button>
      </div>

      {showNotifications && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-end animate-fade-in" onClick={() => setShowNotifications(false)}>
          <div 
            className="w-full max-w-md mx-auto bg-white rounded-t-[40px] shadow-2xl p-8 flex flex-col gap-6 animate-scale-up max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">{lang === 'en' ? 'Notifications' : 'அறிவிப்புகள்'}</h3>
              <button onClick={() => setShowNotifications(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold">
                  {lang === 'en' ? 'No notifications yet' : 'அறிவிப்புகள் எதுவும் இல்லை'}
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-4 rounded-2xl border transition-all ${notif.isRead ? 'bg-slate-50 border-slate-100' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notif.type === 'BLOOD' ? 'bg-red-100 text-red-600' : 
                        notif.type === 'BOOKING' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <i className={`fas ${
                          notif.type === 'BLOOD' ? 'fa-tint' : 
                          notif.type === 'BOOKING' ? 'fa-calendar-check' : 'fa-info-circle'
                        }`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-black text-slate-900 leading-tight">{notif.title}</p>
                          <span className="text-[9px] font-black text-slate-400 uppercase whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-end animate-fade-in" onClick={() => { setShowSettings(false); setShowTranslatorMenu(false); }}>
          <div 
            className="w-full max-w-md mx-auto bg-white rounded-t-[40px] shadow-2xl p-8 flex flex-col gap-6 animate-scale-up max-h-[95vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <Logo size="sm" className="w-12 h-12" />
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{lang === 'en' ? 'Settings' : 'அமைப்புகள்'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Preferences & Profile' : 'விருப்பங்கள் மற்றும் சுயவிவரம்'}</p>
                </div>
              </div>
              <button onClick={() => { setShowSettings(false); setShowTranslatorMenu(false); }} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{lang === 'en' ? 'Profile Details' : 'சுயவிவர விவரங்கள்'}</h4>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-xl"></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 leading-tight">{user?.name}</p>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{user?.mobile}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{lang === 'en' ? 'Translator' : 'மொழி பெயர்ப்பாளர்'}</h4>
              {!showTranslatorMenu ? (
                <button 
                  onClick={() => setShowTranslatorMenu(true)}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <i className="fas fa-language text-xl"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{languages.find(l => l.code === lang)?.native}</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300"></i>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 animate-fade-in">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setShowTranslatorMenu(false); }}
                      className={`p-3 rounded-xl font-black text-xs uppercase transition-all flex flex-col items-center justify-center border-2 ${lang === l.code ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'}`}
                    >
                      <span className="text-sm">{l.native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="w-full h-14 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-red-100 transition-colors border-2 border-red-100"
            >
              <i className="fas fa-sign-out-alt"></i>
              {lang === 'en' ? 'Logout' : 'வெளியேறு'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
