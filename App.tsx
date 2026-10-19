
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Doctor, Appointment } from './types';
import { INITIAL_DOCTORS } from './constants';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import DoctorBooking from './pages/DoctorBooking';
import MyAppointments from './pages/MyAppointments';
import BloodDonor from './pages/BloodDonor';
import OrganDonor from './pages/OrganDonor';
import CancerMonitoring from './pages/CancerMonitoring';
import AdminPanel from './pages/AdminPanel';
import Splash from './pages/Splash';
import TokenVerification from './pages/TokenVerification';
import Support from './pages/Support';
import AIHub from './pages/AIHub';
import HealthMap from './pages/HealthMap';

export type LanguageCode = 'en' | 'ta' | 'te' | 'kn' | 'ml' | 'hi';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'BOOKING' | 'BLOOD' | 'SYSTEM';
  isRead: boolean;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  allUsers: User[];
  setAllUsers: (users: User[]) => void;
  doctors: Doctor[];
  setDoctors: (doctors: Doctor[]) => void;
  appointments: Appointment[];
  setAppointments: (apps: Appointment[]) => void;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  updateGlobalUser: (updatedUser: User) => void;
  isPersistent: boolean;
  setIsPersistent: (val: boolean) => void;
  notifications: AppNotification[];
  setNotifications: (notifs: AppNotification[]) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'time' | 'isRead'>) => void;
  cancerHistory: any[];
  setCancerHistory: (history: any[]) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hc_all_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('hc_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('hc_appointments');
    return saved ? JSON.parse(saved) : [];
  });
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem('hc_lang') as LanguageCode) || 'en';
  });
  const [isPersistent, setIsPersistent] = useState<boolean>(() => {
    const saved = localStorage.getItem('hc_persistent');
    return saved ? JSON.parse(saved) : true;
  });
  const [cancerHistory, setCancerHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('hc_cancer_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('hc_notifications');
    const initial = [
      {
        id: '1',
        title: 'Blood Request Nearby',
        message: 'A- Positive blood required at City General Hospital.',
        time: '2 mins ago',
        type: 'BLOOD',
        isRead: false
      }
    ] as AppNotification[];
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 4000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPersistent) {
      localStorage.setItem('hc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hc_user');
    }
  }, [user, isPersistent]);

  useEffect(() => {
    localStorage.setItem('hc_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('hc_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('hc_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('hc_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('hc_persistent', JSON.stringify(isPersistent));
  }, [isPersistent]);

  useEffect(() => {
    localStorage.setItem('hc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('hc_cancer_history', JSON.stringify(cancerHistory));
  }, [cancerHistory]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'time' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      time: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateGlobalUser = (updatedUser: User) => {
    setUser(updatedUser);
    setAllUsers(prev => {
      const exists = prev.some(u => u.id === updatedUser.id);
      if (exists) {
        return prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      }
      return [...prev, updatedUser];
    });
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, allUsers, setAllUsers, doctors, setDoctors, appointments, setAppointments, 
      lang, setLang, updateGlobalUser, isPersistent, setIsPersistent,
      notifications, setNotifications, addNotification, cancerHistory, setCancerHistory
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
          {isAppLoading && <Splash />}
          {!isAppLoading && (
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Onboarding />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/book-doctor" element={<DoctorBooking />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              <Route path="/blood-donor" element={<BloodDonor />} />
              <Route path="/organ-info" element={<OrganDonor />} />
              <Route path="/cancer-monitor" element={<CancerMonitoring />} />
              <Route path="/ai-hub" element={<AIHub />} />
              <Route path="/health-map" element={<HealthMap />} />
              <Route path="/verify/:id" element={<TokenVerification />} />
              <Route path="/support" element={<Support />} />
              <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
            </Routes>
          )}
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
