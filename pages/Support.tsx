
import React from 'react';
import { Header, Logo } from '../components/UI';
import { useApp } from '../App';

const Support: React.FC = () => {
  const { lang } = useApp();

  const supportSections = [
    {
      title: "About CareSlot",
      icon: "fa-info-circle",
      content: "CareSlot is a premium healthcare management platform designed to bridge the gap between medical providers and patients. Our system ensures seamless appointment booking, priority emergency handling, and life-saving donor connectivity."
    },
    {
      title: "Help & Care",
      icon: "fa-hand-holding-medical",
      content: "If you need assistance with booking, donor registration, or monitoring, our automated systems are designed to guide you. For clinical emergencies, please use the SOS button on the home screen for immediate response."
    },
    {
      title: "Support Desk",
      icon: "fa-headset",
      content: "Our support team is available 24/7. For technical issues, contact tech-support@careslot.hc. For medical facility partnerships, reach out to partners@careslot.hc."
    },
    {
      title: "Emergency Mode",
      icon: "fa-exclamation-triangle",
      content: "Emergency users bypass standard queues to secure the absolute next available slot with specialist doctors. This is a priority lane designed strictly for critical healthcare needs."
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Header title="Care & Support" showBack icon="fa-question" />
      
      <main className="p-6 flex flex-col gap-8 animate-fade-in">
        <div className="text-center flex flex-col items-center gap-4">
          <Logo size="lg" className="shadow-lg" />
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">How can we help?</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">CareSlot Support Center</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {supportSections.map((sec, i) => (
            <div 
              key={sec.title} 
              className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-3"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <i className={`fas ${sec.icon} text-lg`}></i>
                </div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{sec.title}</h3>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-blue-600 p-8 rounded-[40px] text-white flex flex-col items-center text-center gap-4 shadow-xl shadow-blue-200 mt-4 mb-10">
          <i className="fas fa-heart text-4xl opacity-50"></i>
          <h4 className="text-xl font-black leading-tight uppercase tracking-tight">Your Health, Our Priority</h4>
          <p className="text-sm font-medium opacity-80 leading-relaxed">
            CareSlot is dedicated to strengthening health systems globally. Thank you for trusting us with your medical journey.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Support;
