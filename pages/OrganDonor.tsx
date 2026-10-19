
import React, { useState, useEffect } from 'react';
import { Header, Button, Input } from '../components/UI';
import { ORGANS, BLOOD_TYPES } from '../constants';
import { OrganInfo } from '../types';
import { useApp } from '../App';

const OrganDonor: React.FC = () => {
  const { lang, user, updateGlobalUser, addNotification } = useApp();
  const [selectedOrgan, setSelectedOrgan] = useState<OrganInfo | null>(null);
  const [registeringHospital, setRegisteringHospital] = useState<string | null>(null);
  const [donorBloodType, setDonorBloodType] = useState<string>(user?.bloodType || '');
  const [isSuccess, setIsSuccess] = useState(false);

  // Synchronize local blood type state with user profile if it changes
  useEffect(() => {
    if (user?.bloodType && !donorBloodType) {
      setDonorBloodType(user.bloodType);
    }
  }, [user]);

  const isPledged = (organId: string) => {
    return user?.donatedOrgans?.includes(organId) || false;
  };

  const handlePledge = () => {
    if (!user || !selectedOrgan) return;
    
    if (!donorBloodType) {
      alert(lang === 'en' ? "Please select your blood group." : "தயவுசெய்து உங்கள் இரத்த வகையைத் தேர்ந்தெடுக்கவும்.");
      return;
    }
    
    // Create updated user with new organ pledge and confirmed blood type
    const updatedDonatedOrgans = [...(user.donatedOrgans || [])];
    if (!updatedDonatedOrgans.includes(selectedOrgan.id)) {
      updatedDonatedOrgans.push(selectedOrgan.id);
    }

    updateGlobalUser({
      ...user,
      isOrganDonor: true,
      bloodType: donorBloodType, // Save the blood type
      donatedOrgans: updatedDonatedOrgans
    });

    addNotification({
      title: 'Organ Successfully Registered',
      message: `You have officially pledged your ${selectedOrgan.name} to ${registeringHospital}.`,
      type: 'SYSTEM'
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setRegisteringHospital(null);
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
      <Header title={lang === 'en' ? "Organ Donor Info" : "உடல் உறுப்பு தானம் தகவல்"} showBack icon="fa-lungs" />
      
      <div className="p-4 grid grid-cols-2 gap-4">
        {ORGANS.map(organ => (
          <button
            key={organ.id}
            onClick={() => setSelectedOrgan(organ)}
            className={`relative bg-white p-6 rounded-3xl shadow-sm border-4 transition-all active:scale-95 ${selectedOrgan?.id === organ.id ? 'border-teal-500' : 'border-transparent'}`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md ${isPledged(organ.id) ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600'}`}>
              <i className={`fas ${organ.icon} text-3xl`}></i>
            </div>
            <span className="font-black text-slate-800 uppercase text-xs tracking-tight">{organ.name}</span>
            {isPledged(organ.id) && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm"><i className="fas fa-check"></i></div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 p-8 bg-white rounded-t-[40px] shadow-2xl flex-1 animate-fade-in flex flex-col">
        {!selectedOrgan ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 text-center py-10">
            <i className="fas fa-info-circle text-5xl mb-4 opacity-20"></i>
            <p className="max-w-[200px] font-bold text-sm uppercase tracking-widest">{lang === 'en' ? "Select an organ to see certified hospitals" : "சான்றளிக்கப்பட்ட மருத்துவமனைகளைக் காண ஒரு உறுப்பைத் தேர்ந்தெடுக்கவும்"}</p>
          </div>
        ) : (
          <div className="pb-10 flex-1 flex flex-col">
            <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight uppercase tracking-tighter">{selectedOrgan.name}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{selectedOrgan.description}</p>
            
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Certified Hospitals (Click to Register)</h4>
            <div className="flex flex-col gap-3">
              {selectedOrgan.hospitals.map(h => (
                <button 
                  key={h} 
                  onClick={() => setRegisteringHospital(h)}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-teal-200 hover:bg-teal-50/30 transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm border border-slate-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <i className="fas fa-hospital text-xl"></i>
                    </div>
                    <span className="font-black text-slate-800 text-sm leading-tight">{h}</span>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-teal-500 transition-colors"></i>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {registeringHospital && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end animate-fade-in">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-[40px] p-8 shadow-2xl animate-scale-up flex flex-col gap-6 max-h-[95vh] overflow-y-auto">
            {!isSuccess ? (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner">
                      <i className={`fas ${selectedOrgan?.icon} text-2xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">Donor Registration</h3>
                      <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">{selectedOrgan?.name} • {registeringHospital}</p>
                    </div>
                  </div>
                  <button onClick={() => setRegisteringHospital(null)} className="p-2 text-slate-300 hover:text-slate-900"><i className="fas fa-times text-xl"></i></button>
                </div>

                <div className="flex flex-col gap-5">
                  <Input label="Donor Name" value={user?.name || ''} onChange={() => {}} placeholder="Full Name" className="opacity-70 bg-slate-100" />
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-tighter">Blood Group</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_TYPES.map(type => (
                        <button
                          key={type}
                          onClick={() => setDonorBloodType(type)}
                          className={`h-11 rounded-xl font-black text-xs transition-all border-2 ${donorBloodType === type ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-100 hover:border-teal-100'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input label="Mobile" value={user?.mobile || ''} onChange={() => {}} placeholder="Mobile Number" className="opacity-70 bg-slate-100" />
                  
                  <Button onClick={handlePledge} className="w-full h-14 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-100 mb-4">
                    Register the Organ
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-center animate-scale-up">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <i className="fas fa-check text-4xl"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Registration Complete</h3>
                <p className="text-slate-500 font-bold max-w-[200px]">Thank you for your noble gesture at {registeringHospital}.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganDonor;
