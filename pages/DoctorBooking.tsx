
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../App';
import { Header, Input, Button } from '../components/UI';
import { SPECIALTIES } from '../constants';
import { Doctor, Appointment } from '../types';
import { useNavigate } from 'react-router-dom';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DoctorBooking: React.FC = () => {
  const { doctors, appointments, setAppointments, user, lang, addNotification } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  
  // Booking Form State
  const [bookingDoc, setBookingDoc] = useState<Doctor | null>(null);
  const [patientName, setPatientName] = useState(user?.role === 'EMERGENCY' ? (lang === 'en' ? 'Emergency Patient' : 'அவசர நோயாளி') : (user?.name || ''));
  const [patientMobile, setPatientMobile] = useState(user?.role === 'EMERGENCY' ? 'N/A' : (user?.mobile || ''));
  const [reason, setReason] = useState('');
  
  // Date Selection State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  
  // Success State
  const [confirmedApp, setConfirmedApp] = useState<Appointment | null>(null);

  const userApps = appointments.filter(a => a.userId === user?.id && a.status === 'CONFIRMED');

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.diseases.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = selectedSpecialty ? doc.specialty === selectedSpecialty : true;
    
    return matchesSearch && matchesSpecialty;
  });

  // Generate next 14 days
  const upcomingDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i <= 14; i++) { // Include today
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  // Check if doctor works on selected day
  const doctorSchedule = useMemo(() => {
    if (!bookingDoc) return { workingDays: [], offDays: [] };
    const workingDays = bookingDoc.availability.map(s => s.split(' ')[0]);
    const offDays = DAYS_SHORT.filter(d => !workingDays.includes(d));
    return { workingDays, offDays };
  }, [bookingDoc]);

  const getAvailableSlotsForDate = (doc: Doctor, date: Date) => {
    const dayName = DAYS_SHORT[date.getDay()];
    const daySchedule = doc.availability.find(s => s.startsWith(dayName));
    if (!daySchedule) return [];

    const timeRange = daySchedule.split(' ')[1];
    if (!timeRange) return [];

    const [startStr, endStr] = timeRange.split('-');
    const startHour = parseInt(startStr.split(':')[0]);
    const endHour = parseInt(endStr.split(':')[0]);

    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      const start = h.toString().padStart(2, '0') + ':00';
      const end = (h + 1).toString().padStart(2, '0') + ':00';
      slots.push(`${start} - ${end}`);
    }
    return slots;
  };

  // Emergency Auto-Fill Logic
  useEffect(() => {
    if (bookingDoc && user?.role === 'EMERGENCY') {
      // Find first available day
      let foundDate = null;
      let foundSlot = null;

      for (const date of upcomingDates) {
        const slots = getAvailableSlotsForDate(bookingDoc, date);
        if (slots.length > 0) {
          foundDate = date;
          foundSlot = slots[0]; // Earliest slot
          break;
        }
      }

      if (foundDate && foundSlot) {
        setSelectedDate(foundDate);
        setSelectedSlot(foundSlot);
        setIsAutoFilled(true);
      }
    } else {
      setIsAutoFilled(false);
    }
  }, [bookingDoc, user?.role, upcomingDates]);

  const availableHourlySlots = useMemo(() => {
    if (!bookingDoc) return [];
    return getAvailableSlotsForDate(bookingDoc, selectedDate);
  }, [bookingDoc, selectedDate]);

  const isDoctorAvailableOnDate = availableHourlySlots.length > 0;

  const handleBook = () => {
    if (!user || !bookingDoc || !selectedSlot) {
      alert(lang === 'en' ? "Please select a time slot." : "தயவுசெய்து நேரத்தைத் தேர்ந்தெடுக்கவும்.");
      return;
    }

    const isEmergency = user.role === 'EMERGENCY';

    if (!isEmergency && (!patientName || !patientMobile)) {
      alert(lang === 'en' ? "Please fill in patient name and mobile number." : "தயவுசெய்து பெயர் மற்றும் மொபைல் எண்ணை நிரப்பவும்.");
      return;
    }

    const formattedDate = selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const fullTimeSlot = `${formattedDate}, ${selectedSlot}`;

    let token: number | string = 'PRIORITY';
    if (!isEmergency) {
      const countForSlot = appointments.filter(
        a => a.doctorId === bookingDoc.id && a.timeSlot === fullTimeSlot && !a.isEmergency
      ).length;
      token = countForSlot + 1;
    }

    const newApp: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      doctorId: bookingDoc.id,
      patientName: isEmergency ? (lang === 'en' ? 'Emergency Patient' : 'அவசர நோயாளி') : patientName,
      patientMobile: isEmergency ? 'N/A' : patientMobile,
      reason,
      timeSlot: fullTimeSlot,
      tokenNumber: token,
      isEmergency,
      status: 'CONFIRMED'
    };

    setAppointments([...appointments, newApp]);
    
    addNotification({
      title: 'Appointment Booked',
      message: `Your visit with ${bookingDoc.name} is confirmed for ${fullTimeSlot}. Token #${token}`,
      type: 'BOOKING'
    });

    setConfirmedApp(newApp);
    setBookingDoc(null);
    resetForm();
  };

  const resetForm = () => {
    setPatientName(user?.role === 'EMERGENCY' ? (lang === 'en' ? 'Emergency Patient' : 'அவசர நோயாளி') : (user?.name || ''));
    setPatientMobile(user?.role === 'EMERGENCY' ? 'N/A' : (user?.mobile || ''));
    setReason('');
    setSelectedSlot('');
    setSelectedDate(new Date());
  };

  const isEmergencyUser = user?.role === 'EMERGENCY';

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-10">
      <Header 
        title={lang === 'en' ? "Book Appointment" : "சந்திப்பு பதிவு"} 
        showBack 
        backRoute="/dashboard" 
        icon="fa-user-md"
      />
      
      <main className="flex-1 flex flex-col" role="main">
        {userApps.length > 0 && !searchTerm && !selectedSpecialty && (
          <section className="p-4 bg-blue-600 text-white shadow-lg" aria-label="Active Bookings">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-ticket-alt"></i>
                {lang === 'en' ? 'YOUR ACTIVE TOKENS' : 'உங்கள் நேரடி டோக்கன்கள்'}
              </h2>
              <button onClick={() => navigate('/my-appointments')} className="text-[10px] font-bold bg-white/20 px-3 py-1.5 rounded uppercase hover:bg-white/30 transition-colors">
                {lang === 'en' ? 'VIEW ALL' : 'அனைத்தையும் காண்க'}
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {userApps.map(app => (
                <div key={app.id} onClick={() => navigate('/my-appointments')} className="flex-shrink-0 bg-white text-slate-900 p-4 rounded-xl min-w-[160px] shadow-md cursor-pointer hover:scale-[0.98] transition-transform flex flex-col gap-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none tracking-tight">
                    {doctors.find(d => d.id === app.doctorId)?.name.split(' ').slice(-1)}
                  </p>
                  <p className="text-sm font-black text-slate-900 truncate">{app.timeSlot}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">TOKEN:</span>
                    <span className="text-lg font-black text-blue-600">
                      {app.isEmergency ? 'PRIORITY' : `#${app.tokenNumber}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center mt-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
              {lang === 'en' ? "AVAILABLE SPECIALISTS" : "கிடைக்கக்கூடிய நிபுணர்கள்"}
            </h2>
          </div>
          
          {isEmergencyUser && (
            <div className="bg-red-700 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 ring-2 ring-red-900 ring-offset-2" role="alert">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
              <div>
                <p className="font-black text-sm uppercase">{lang === 'en' ? 'Emergency Mode Active' : 'அவசர முறை செயலில் உள்ளது'}</p>
                <p className="text-xs opacity-90">{lang === 'en' ? 'Priority scheduling enabled. First available slot will be auto-selected.' : 'முன்னுரிமை திட்டமிடல் இயக்கப்பட்டது. முதல் கிடைக்கும் நேரம் தானாகவே தேர்ந்தெடுக்கப்படும்.'}</p>
              </div>
            </div>
          )}

          <Input 
            placeholder={lang === 'en' ? "Disease or Hospital..." : "தேடுங்கள்..."}
            value={searchTerm} 
            onChange={setSearchTerm}
            className="h-12"
          />
          
          <div className="flex overflow-x-auto gap-2 py-2 no-scrollbar">
            <button onClick={() => setSelectedSpecialty('')} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-black uppercase transition-colors ${!selectedSpecialty ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200'}`}>
              {lang === 'en' ? 'All' : 'அனைத்தும்'}
            </button>
            {SPECIALTIES.map(s => (
              <button key={s} onClick={() => setSelectedSpecialty(s)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-black uppercase transition-colors ${selectedSpecialty === s ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="p-4 flex flex-col gap-4">
          {filteredDoctors.map(doc => (
            <article key={doc.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 flex-shrink-0 ${isEmergencyUser ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-600'} rounded-2xl flex items-center justify-center`}>
                  <i className="fas fa-user-md text-3xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{doc.name}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-wide mb-0.5 ${isEmergencyUser ? 'text-red-700' : 'text-blue-600'}`}>{doc.specialty}</p>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1 truncate">
                    <i className="fas fa-hospital opacity-50"></i> {doc.hospital}
                  </p>
                </div>
              </div>
              <Button onClick={() => { setBookingDoc(doc); }} variant={isEmergencyUser ? 'danger' : 'primary'} className="w-full h-12">
                {isEmergencyUser ? (lang === 'en' ? "Quick Emergency Booking" : "விரைவான அவசர பதிவு") : (lang === 'en' ? "Book Appointment" : "பதிவு செய்க")}
              </Button>
            </article>
          ))}
        </section>
      </main>

      {bookingDoc && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">
                {isEmergencyUser ? 'Priority Emergency Setup' : 'Registration Form'}
              </h3>
              <button onClick={() => setBookingDoc(null)} className="p-2 text-slate-400 hover:text-slate-600"><i className="fas fa-times text-lg"></i></button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Auto-fill Alert for Emergency */}
              {isAutoFilled && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                  <i className="fas fa-magic text-blue-600"></i>
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">System secured the first upcoming slot</p>
                </div>
              )}

              {/* Doctor Header */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isEmergencyUser ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Consulting Specialist</p>
                  <p className="font-black text-slate-900 text-lg leading-tight">{bookingDoc.name}</p>
                </div>
              </div>

              {!isEmergencyUser && (
                <>
                  <Input label="Patient Name" required value={patientName} onChange={setPatientName} placeholder="Enter full name" />
                  <Input label="Mobile Number" required type="tel" value={patientMobile} onChange={setPatientMobile} placeholder="Enter 10-digit mobile" onlyNumbers maxLength={10} />
                </>
              )}

              {/* Date Selection */}
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block">
                  {lang === 'en' ? "Appointment Date" : "சந்திப்பு தேதி"}
                </label>
                <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                  {upcomingDates.map((date, idx) => {
                    const isSelected = selectedDate.toDateString() === date.toDateString();
                    const dayName = DAYS_SHORT[date.getDay()];
                    const slotsForDate = getAvailableSlotsForDate(bookingDoc, date);
                    const isOff = slotsForDate.length === 0;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(''); setIsAutoFilled(false); }}
                        className={`flex-shrink-0 w-14 py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-0.5 ${
                          isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 
                          isOff ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-white text-slate-500 border-slate-100'
                        }`}
                        disabled={isOff && !isEmergencyUser}
                      >
                        <span className="text-[8px] font-black uppercase">{dayName}</span>
                        <span className="text-base font-black">{date.getDate()}</span>
                        <span className="text-[8px] font-bold uppercase">{date.toLocaleDateString('en', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block">
                  {lang === 'en' ? "Available Timing" : "நேரம்"}
                </label>
                {!isDoctorAvailableOnDate ? (
                  <div className="p-6 bg-red-50 rounded-2xl border border-dashed border-red-200 text-center">
                    <i className="fas fa-calendar-times text-red-300 text-xl mb-2"></i>
                    <p className="text-xs font-black text-red-700 uppercase tracking-widest">
                      Doctor is on leave this day
                    </p>
                    <p className="text-[10px] font-bold text-red-500 mt-1 uppercase">Select another date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableHourlySlots.map(slot => (
                      <button 
                        key={slot}
                        onClick={() => { setSelectedSlot(slot); setIsAutoFilled(false); }}
                        className={`p-3 border-2 rounded-xl text-center transition-all ${selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-100 text-slate-600 font-bold text-xs hover:border-blue-200'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleBook} variant={isEmergencyUser ? 'danger' : 'primary'} className="mt-2 h-14 text-lg" disabled={!isDoctorAvailableOnDate || !selectedSlot}>
                {isEmergencyUser ? 'BOOK PRIORITY NOW' : 'CONFIRM BOOKING'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmedApp && (
        <div className={`fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md ${confirmedApp.isEmergency ? 'bg-red-700/90' : 'bg-blue-700/90'}`}>
          <div className="bg-white w-full max-sm rounded-3xl p-8 text-center animate-scale-up shadow-2xl relative overflow-hidden">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmedApp.isEmergency ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <i className={`fas ${confirmedApp.isEmergency ? 'fa-bolt' : 'fa-check'} text-4xl`}></i>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
              {confirmedApp.isEmergency ? 'PRIORITY SECURED' : 'Booking Successful!'}
            </h2>
            
            <div className={`rounded-2xl p-6 my-6 border-2 ${confirmedApp.isEmergency ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex flex-col items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Status</span>
                <span className={`text-5xl font-black ${confirmedApp.isEmergency ? 'text-red-700' : 'text-blue-700'}`}>
                  {confirmedApp.isEmergency ? 'PRIORITY' : `#${confirmedApp.tokenNumber}`}
                </span>
              </div>
              <div className="text-left flex flex-col gap-2 pt-4 border-t border-dashed border-slate-300">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Doctor:</span>
                  <span className="text-slate-900">{doctors.find(d => d.id === confirmedApp.doctorId)?.name}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Date/Time:</span>
                  <span className="text-slate-900">{confirmedApp.timeSlot}</span>
                </div>
              </div>
            </div>

            <Button onClick={() => setConfirmedApp(null)} variant={confirmedApp.isEmergency ? 'danger' : 'primary'} className="w-full h-14 text-lg">
              DONE
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorBooking;
