
import React, { useState, useMemo } from 'react';
import { Header, Button } from '../components/UI';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Line, Bar } from 'recharts';
import { useApp } from '../App';
import { HealthMetric } from '../types';
import { analyzeHealthMetrics } from '../services/geminiService';

const MOCK_HISTORY: HealthMetric[] = [
  { date: 'Mon', painLevel: 2, energyLevel: 8, appetite: 9, sleepHours: 8 },
  { date: 'Tue', painLevel: 3, energyLevel: 7, appetite: 8, sleepHours: 7 },
  { date: 'Wed', painLevel: 2, energyLevel: 8, appetite: 8, sleepHours: 8 },
  { date: 'Thu', painLevel: 4, energyLevel: 5, appetite: 6, sleepHours: 6 },
  { date: 'Fri', painLevel: 5, energyLevel: 4, appetite: 5, sleepHours: 5 },
  { date: 'Sat', painLevel: 6, energyLevel: 3, appetite: 4, sleepHours: 5 },
  { date: 'Sun', painLevel: 7, energyLevel: 2, appetite: 3, sleepHours: 4 },
];

interface HealthAlert {
  id: string;
  type: 'WARNING' | 'CRITICAL';
  metric: string;
  message: string;
  icon: string;
}

const CancerMonitoring: React.FC = () => {
  const { lang, cancerHistory, setCancerHistory } = useApp();
  const [metrics] = useState<HealthMetric[]>(MOCK_HISTORY);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Visibility toggles for chart metrics
  const [visibleMetrics, setVisibleMetrics] = useState({
    energy: true,
    pain: true,
    appetite: true,
    sleep: false
  });

  const toggleMetric = (key: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Trend Analysis System
  const alerts = useMemo((): HealthAlert[] => {
    if (metrics.length < 2) return [];
    
    const latest = metrics[metrics.length - 1];
    const initial = metrics[0];
    const foundAlerts: HealthAlert[] = [];

    // Pain Trend: Increase of 3+ points over the period
    if (latest.painLevel - initial.painLevel >= 3) {
      foundAlerts.push({
        id: 'pain-trend',
        type: 'CRITICAL',
        metric: 'Pain Level',
        message: 'Significant increase in pain intensity detected over the last 7 days.',
        icon: 'fa-hand-dots'
      });
    }

    // Energy Trend: Decrease of 3+ points
    if (initial.energyLevel - latest.energyLevel >= 3) {
      foundAlerts.push({
        id: 'energy-trend',
        type: 'WARNING',
        metric: 'Energy Level',
        message: 'Persistent decline in energy levels observed. Rest is recommended.',
        icon: 'fa-bolt'
      });
    }

    // Appetite Trend: Decrease of 3+ points
    if (initial.appetite - latest.appetite >= 3) {
      foundAlerts.push({
        id: 'appetite-trend',
        type: 'WARNING',
        metric: 'Appetite',
        message: 'Notable decrease in nutritional intake. Monitor calorie consumption.',
        icon: 'fa-utensils'
      });
    }

    // Sleep Trend: Decrease of 2+ hours
    if (initial.sleepHours - latest.sleepHours >= 2) {
      foundAlerts.push({
        id: 'sleep-trend',
        type: 'CRITICAL',
        metric: 'Sleep Quality',
        message: 'Severe disruption in sleep patterns detected. Contact your care provider.',
        icon: 'fa-moon'
      });
    }

    return foundAlerts;
  }, [metrics]);

  const performAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeHealthMetrics(metrics);
      if (result) {
        setCurrentAnalysis(result);
        const newHistoryItem = {
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          ...result
        };
        setCancerHistory([newHistoryItem, ...cancerHistory].slice(0, 10));
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const metricConfigs = [
    { key: 'energy', label: 'Energy', color: '#8b5cf6', icon: 'fa-bolt' },
    { key: 'pain', label: 'Pain Level', color: '#ef4444', icon: 'fa-hand-dots' },
    { key: 'appetite', label: 'Appetite', color: '#10b981', icon: 'fa-utensils' },
    { key: 'sleep', label: 'Sleep', color: '#f59e0b', icon: 'fa-moon' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto pb-10">
      <Header title={lang === 'en' ? "Recovery Monitor" : "புற்றுநோய் கண்காணிப்பு"} showBack icon="fa-ribbon" />
      
      <div className="p-4 flex flex-col gap-6">
        
        {/* Real-time Alerts Section */}
        {alerts.length > 0 && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <i className="fas fa-bell animate-pulse"></i>
              Health Alerts ({alerts.length})
            </h3>
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-2xl border-l-4 shadow-sm flex gap-4 items-start ${
                  alert.type === 'CRITICAL' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-amber-50 border-amber-500 text-amber-900'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  alert.type === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <i className={`fas ${alert.icon}`}></i>
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-tight">{alert.metric} Trend Alert</h4>
                  <p className="text-xs font-bold opacity-80 mt-1 leading-snug">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Analytics Chart Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">
              {lang === 'en' ? 'Vital Trends' : 'முக்கிய போக்குகள்'}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">7-Day Window</span>
          </div>

          <div className="h-64 w-full min-w-0 overflow-hidden mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: '900', fill: '#94a3b8'}} 
                  dy={10}
                />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold', padding: '12px' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                
                {visibleMetrics.energy && (
                  <Area 
                    type="monotone" 
                    dataKey="energyLevel" 
                    name="Energy"
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorEnergy)" 
                    animationDuration={1000} 
                  />
                )}

                {visibleMetrics.pain && (
                  <Line 
                    type="monotone" 
                    dataKey="painLevel" 
                    name="Pain"
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={1200}
                  />
                )}

                {visibleMetrics.appetite && (
                  <Line 
                    type="monotone" 
                    dataKey="appetite" 
                    name="Appetite"
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                    animationDuration={1400}
                  />
                )}

                {visibleMetrics.sleep && (
                  <Bar 
                    dataKey="sleepHours" 
                    name="Sleep"
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]} 
                    barSize={12}
                    animationDuration={1600}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2">
            {metricConfigs.map(m => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${
                  visibleMetrics[m.key as keyof typeof visibleMetrics]
                    ? `bg-white border-[${m.color}] shadow-sm`
                    : 'bg-slate-50 border-transparent text-slate-400 opacity-60'
                }`}
                style={{ 
                  borderColor: visibleMetrics[m.key as keyof typeof visibleMetrics] ? m.color : 'transparent',
                  color: visibleMetrics[m.key as keyof typeof visibleMetrics] ? m.color : undefined
                }}
              >
                <i className={`fas ${m.icon}`}></i>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Analysis Card */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-purple-600">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-purple-900 flex items-center gap-3 uppercase text-sm tracking-tight">
              <i className="fas fa-brain text-xl"></i> {lang === 'en' ? 'AI Insight Engine' : 'AI பகுப்பாய்வு'}
            </h3>
            {loading && <i className="fas fa-spinner fa-spin text-purple-600 text-xl"></i>}
          </div>

          {!currentAnalysis ? (
            <Button onClick={performAnalysis} variant="outline" className="w-full border-purple-100 text-purple-600 h-14 font-black">
              {lang === 'en' ? 'Run Intelligence Scan' : 'புதிய பகுப்பாய்வு'}
            </Button>
          ) : (
            <div className="animate-fade-in flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${currentAnalysis.status === 'Improving' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {currentAnalysis.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 font-bold leading-relaxed italic">"{currentAnalysis.summary}"</p>
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                {currentAnalysis.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-800 font-black tracking-tight">
                    <i className="fas fa-check-circle text-purple-500 mt-1"></i>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        {cancerHistory.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Recovery Intelligence Logs</h3>
            <div className="flex flex-col gap-3">
              {cancerHistory.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">{item.date}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Improving' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 truncate">{item.summary}</p>
                  </div>
                  <i className="fas fa-chevron-right text-slate-200 group-hover:text-purple-400 transition-colors"></i>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancerMonitoring;
