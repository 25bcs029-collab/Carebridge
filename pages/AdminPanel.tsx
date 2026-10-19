
import React, { useState } from 'react';
import { useApp } from '../App';
import { Header, Button, Input } from '../components/UI';
import { SPECIALTIES } from '../constants';

const AdminPanel: React.FC = () => {
  const { doctors, setDoctors, lang } = useApp();
  const [editingDoc, setEditingDoc] = useState<any>(null);

  const handleSave = () => {
    const updated = doctors.map(d => d.id === editingDoc.id ? editingDoc : d);
    setDoctors(updated);
    setEditingDoc(null);
    alert("Doctor profile updated!");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <Header title={lang === 'en' ? "Admin Management" : "நிர்வாக மேலாண்மை"} showBack />
      
      <div className="p-4 flex flex-col gap-4">
        <h3 className="font-bold text-slate-800">Manage Doctors</h3>
        
        <div className="flex flex-col gap-3">
          {doctors.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">{doc.name}</h4>
                <p className="text-xs text-slate-500">{doc.specialty}</p>
              </div>
              <Button onClick={() => setEditingDoc({ ...doc })} variant="secondary" className="text-xs">
                Edit Profile
              </Button>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4 bg-slate-800">
          <i className="fas fa-plus"></i> Add New Doctor
        </Button>
      </div>

      {editingDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Edit Doctor Profile</h3>
            
            <div className="flex flex-col gap-4">
              <Input label="Name" value={editingDoc.name} onChange={v => setEditingDoc({...editingDoc, name: v})} />
              <div className="flex flex-col gap-1 text-left">
                <label className="text-sm font-semibold text-slate-600">Specialty</label>
                <select 
                  className="bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={editingDoc.specialty}
                  onChange={e => setEditingDoc({...editingDoc, specialty: e.target.value})}
                >
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Hospital" value={editingDoc.hospital} onChange={v => setEditingDoc({...editingDoc, hospital: v})} />
              <Input label="Physical Address" value={editingDoc.address || ''} onChange={v => setEditingDoc({...editingDoc, address: v})} placeholder="123 Wellness Rd..." />
              
              <div className="flex flex-col gap-2 text-left">
                <label className="text-sm font-semibold text-slate-600">Timings (Schedule)</label>
                {editingDoc.availability.map((time: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={time}
                      onChange={e => {
                        const newTimes = [...editingDoc.availability];
                        newTimes[i] = e.target.value;
                        setEditingDoc({...editingDoc, availability: newTimes});
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <Button onClick={() => setEditingDoc(null)} variant="secondary" className="flex-1">Cancel</Button>
                <Button onClick={handleSave} className="flex-1">Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
