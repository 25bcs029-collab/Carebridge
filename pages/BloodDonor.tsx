
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Header, Input, Button } from '../components/UI';
import { BLOOD_TYPES } from '../constants';
import * as Gemini from '../services/geminiService';

const MOCK_DONORS = [
  { name: 'Dr. Arul', mobile: '9876543210', place: 'Chennai', status: 'Active', type: 'O+', id: 'm1' },
  { name: 'Priya Mani', mobile: '9123456789', place: 'Madurai', status: 'Active', type: 'B-', id: 'm2' },
  { name: 'Vijay K', mobile: '9001234567', place: 'Adyar, Chennai', status: 'Active', type: 'A+', id: 'm3' },
  { name: 'Anjali S', mobile: '9887766554', place: 'Velachery, Chennai', status: 'Active', type: 'AB-', id: 'm4' },
];

const BloodDonor: React.FC = () => {
  const { user, setUser, allUsers, setAllUsers, lang } = useApp();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regBloodType, setRegBloodType] = useState(user?.bloodType || '');
  const [regLocation, setRegLocation] = useState(user?.location || '');

  // Proximity Search State
  const [searchRadius, setSearchRadius] = useState(10); // in km
  const [nearbyResults, setNearbyResults] = useState<{ text: string; grounding?: any[] } | null>(null);
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (user) {
      setRegBloodType(user.bloodType || '');
      setRegLocation(user.location || '');
    }
  }, [user]);

  const handleNearbySearch = async () => {
    setIsSearchingNearby(true);
    setNearbyResults(null);

    const performSearch = async (lat?: number, lng?: number) => {
      try {
        const query = `Find active blood donation centers, blood banks, or organizations within ${searchRadius}km radius.`;
        const result = await Gemini.findNearbyClinics(query, lat, lng);
        setNearbyResults(result);
      } catch (error: any) {
        console.error("Proximity search failed:", error);
        const errorMsg = error.message || "";
        if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("500")) {
          alert("Proximity search requires a billing-enabled API key for Maps grounding. Please ensure your key is valid.");
          if (typeof (window as any).aistudio?.openSelectKey === 'function') {
            await (window as any).aistudio.openSelectKey();
          }
        } else {
          alert("Could not complete proximity search. Please try again later.");
        }
      } finally {
        setIsSearchingNearby(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          performSearch(coords.lat, coords.lng);
        },
        (err) => {
          console.warn("Geolocation denied, searching without coordinates.", err);
          performSearch();
        }
      );
    } else {
      performSearch();
    }
  };

  const realDonors = allUsers
    .filter(u => u.isBloodDonor && u.bloodType)
    .map(u => ({
      name: u.name,
      mobile: u.mobile,
      place: u.location || 'Unknown',
      status: u.isDonorActive ? 'Active' : 'Inactive',
      type: u.bloodType!,
      id: u.id
    }));

  const allDonorsList = [...MOCK_DONORS, ...realDonors];

  const filteredDonors = allDonorsList.filter(d => {
    const matchesType = selectedType ? d.type === selectedType : true;
    const matchesArea = areaFilter ? d.place.toLowerCase().includes(areaFilter.toLowerCase()) : true;
    return matchesType && matchesArea;
  });

  const handleToggleDonor = () => {
    if (!user) return;
    if (!regBloodType) {
      alert("Please select your blood group first.");
      return;
    }
    const updatedUser = { 
      ...user, 
      isBloodDonor: !user.isBloodDonor,
      isDonorActive: !user.isBloodDonor, // default to active if becoming donor
      bloodType: regBloodType,
      location: regLocation
    };
    setUser(updatedUser);
    setAllUsers(allUsers.map(u => u.id === user.id ? updatedUser : u));
    setIsRegistering(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-20">
      <Header title={lang === 'en' ? "Blood Donors" : "இரத்த தானம்"} showBack icon="fa-tint" />
      
      <main className="p-4 flex flex-col gap-6">
        {/* User Donor Status */}
        <div className={`p-6 rounded-[32px] border-2 transition-all ${user?.isBloodDonor ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${user?.isBloodDonor ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <i className="fas fa-hand-holding-medical text-xl"></i>
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">
                  {user?.isBloodDonor ? 'You are a Donor' : 'Become a Hero'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {user?.isBloodDonor ? `Group: ${user.bloodType}` : 'Pledge to save lives'}
                </p>
              </div>
            </div>
            <Button 
              variant={user?.isBloodDonor ? 'outline' : 'primary'} 
              className="h-10 text-[10px] px-4"
              onClick={() => setIsRegistering(true)}
            >
              {user?.isBloodDonor ? 'Update Profile' : 'Register Now'}
            </Button>
          </div>
        </div>

        {/* Proximity Search Card */}
        <div className="bg-indigo-600 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <i className="fas fa-map-marked-alt text-2xl opacity-80"></i>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest">Proximity Search</h3>
              <p className="text-[10px] font-bold opacity-70">Find donors and banks near you</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-white/10 p-4 rounded-2xl">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Radius: {searchRadius} km</span>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={searchRadius} 
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                className="w-1/2 accent-indigo-400"
              />
            </div>
            <Button 
              onClick={handleNearbySearch} 
              disabled={isSearchingNearby}
              className="bg-white text-indigo-600 h-12 text-xs"
            >
              {isSearchingNearby ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-location-arrow mr-2"></i>}
              {isSearchingNearby ? 'Scanning Area...' : 'Find Near Me'}
            </Button>
          </div>

          {nearbyResults && (
            <div className="bg-white rounded-2xl p-4 text-slate-800 animate-fade-in shadow-inner">
              <p className="text-xs font-medium leading-relaxed mb-3">{nearbyResults.text}</p>
              {nearbyResults.grounding && nearbyResults.grounding.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  {nearbyResults.grounding.map((chunk, idx) => {
                    const uri = chunk.maps?.uri || chunk.web?.uri;
                    const title = chunk.maps?.title || chunk.web?.title || "View Source";
                    if (!uri) return null;
                    return (
                      <a 
                        key={idx} 
                        href={uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-indigo-100 transition-all"
                      >
                        <i className="fas fa-external-link-alt text-[8px]"></i>
                        {title.length > 20 ? title.substring(0, 17) + '...' : title}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual Filters */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Donor Directory</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!selectedType ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100'}`}
            >
              All
            </button>
            {BLOOD_TYPES.map(t => (
              <button 
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedType === t ? 'bg-red-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <Input 
            placeholder="Search city or area..." 
            value={areaFilter} 
            onChange={setAreaFilter} 
            className="h-12 bg-white"
          />
        </div>

        {/* Donor List */}
        <div className="flex flex-col gap-3">
          {filteredDonors.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold opacity-30">
              <i className="fas fa-search text-5xl mb-4"></i>
              <p className="uppercase tracking-widest text-xs">No donors found matching criteria</p>
            </div>
          ) : (
            filteredDonors.map(donor => (
              <div key={donor.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex flex-col items-center justify-center border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <span className="text-xs font-black uppercase tracking-tighter opacity-60">Type</span>
                    <span className="text-lg font-black leading-none">{donor.type}</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-black text-slate-900 text-base leading-tight">{donor.name}</h4>
                    <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1.5">
                      <i className="fas fa-map-marker-alt text-[10px] text-red-400"></i>
                      {donor.place}
                    </p>
                  </div>
                </div>
                <a 
                  href={`tel:${donor.mobile}`}
                  className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <i className="fas fa-phone-alt"></i>
                </a>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Registration Modal */}
      {isRegistering && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end animate-fade-in">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-[40px] p-8 shadow-2xl animate-scale-up flex flex-col gap-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <i className="fas fa-tint text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">Donor Profile</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strengthen the supply chain</p>
                </div>
              </div>
              <button onClick={() => setIsRegistering(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blood Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setRegBloodType(type)}
                      className={`h-11 rounded-xl font-black text-xs transition-all border-2 ${regBloodType === type ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-red-100'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <Input 
                label="City / Area" 
                value={regLocation} 
                onChange={setRegLocation} 
                placeholder="e.g. Adyar, Chennai" 
                required 
              />

              <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-4 border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-slate-100">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  Your mobile number will only be visible to verified users searching for donors. You can opt-out at any time.
                </p>
              </div>

              <Button onClick={handleToggleDonor} className={`w-full h-16 rounded-2xl text-lg font-black tracking-widest shadow-xl transition-all ${user?.isBloodDonor ? 'bg-slate-900' : 'bg-red-600'}`}>
                {user?.isBloodDonor ? 'Update Profile' : 'Confirm Registration'}
              </Button>
              
              {user?.isBloodDonor && (
                <button 
                  onClick={() => {
                    const updated = { ...user, isBloodDonor: false, isDonorActive: false };
                    setUser(updated);
                    setAllUsers(allUsers.map(u => u.id === user.id ? updated : u));
                    setIsRegistering(false);
                  }}
                  className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:underline"
                >
                  Withdraw from Donor List
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonor;
