
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Header, Button, Input, Logo } from '../components/UI';
import { useApp } from '../App';
import * as Gemini from '../services/geminiService';

const AIHub: React.FC = () => {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState<'chat' | 'vision' | 'voice' | 'video'>('chat');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string; grounding?: any[] }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(true);

  // Vision State
  const [visionPrompt, setVisionPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<string | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Voice State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const nextStartTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoMessage, setVideoMessage] = useState('');

  // Key Selection Check
  const checkApiKey = async () => {
    if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }
  };

  const handleError = async (error: any) => {
    console.error("Gemini API Error:", error);
    const errorMsg = error.message || "";
    
    // As per rules, if permission denied or entity not found, re-prompt for key
    if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("403")) {
      alert("This action requires a paid API key with appropriate permissions (e.g. Google Search / Veo). Please select a valid key.");
      if (typeof (window as any).aistudio?.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
      }
    } else {
      alert("An error occurred: " + errorMsg);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsThinking(true);
    
    try {
      await checkApiKey();
      const result = await Gemini.chatWithThinking(userMsg, useSearch);
      setChatMessages(prev => [...prev, { role: 'ai', content: result.text, grounding: result.grounding }]);
    } catch (e) {
      handleError(e);
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Connection failed. Please check your API key permissions.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!visionPrompt) return;
    setVisionLoading(true);
    try {
      await checkApiKey();
      const img = await Gemini.generateImage(visionPrompt, imgSize, aspectRatio);
      if (img) setVisionResult(img);
    } catch (e) {
      handleError(e);
    } finally {
      setVisionLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!selectedImage || !visionPrompt) return;
    setVisionLoading(true);
    try {
      await checkApiKey();
      const img = await Gemini.editImage(selectedImage, visionPrompt);
      if (img) setVisionResult(img);
    } catch (e) {
      handleError(e);
    } finally {
      setVisionLoading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage || !visionPrompt) return;
    setVisionLoading(true);
    try {
      await checkApiKey();
      const text = await Gemini.analyzeImage(selectedImage, visionPrompt);
      setChatMessages(prev => [...prev, { role: 'ai', content: `Analysis: ${text}` }]);
      setActiveTab('chat');
    } catch (e) {
      handleError(e);
    } finally {
      setVisionLoading(false);
    }
  };

  const handleVeoVideo = async () => {
    if (!videoPrompt) return;
    
    setVideoLoading(true);
    setVideoMessage("Gemini is imagining your scene...");
    try {
      await checkApiKey();
      const timer = setInterval(() => {
        const msgs = ["Painting every pixel...", "Rendering medical motion...", "Almost ready...", "Finalizing frames..."];
        setVideoMessage(msgs[Math.floor(Math.random() * msgs.length)]);
      }, 5000);
      const video = await Gemini.generateVideoVeo(videoPrompt, selectedImage || undefined);
      clearInterval(timer);
      setVideoResult(video);
    } catch (e) {
      handleError(e);
    } finally {
      setVideoLoading(false);
    }
  };

  const startLive = async () => {
    try {
      await checkApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputNode = audioContextRef.current.createGain();
      outputNode.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            setLiveLog(prev => [...prev, "System: Live connection established."]);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64 && audioContextRef.current) {
              const bytes = atob(base64).split('').map(c => c.charCodeAt(0));
              const buffer = await decodeAudio(new Uint8Array(bytes), audioContextRef.current);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNode);
              const start = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(start);
              nextStartTimeRef.current = start + buffer.duration;
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: (e: any) => handleError(e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });
      await sessionPromise;
    } catch (e) {
      handleError(e);
    }
  };

  async function decodeAudio(data: Uint8Array, ctx: AudioContext) {
    const int16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, int16.length, 24000);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < int16.length; i++) channel[i] = int16[i] / 32768;
    return buffer;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Header title="Gemini AI Hub" showBack icon="fa-sparkles" />
      
      <div className="flex border-b bg-white sticky top-[68px] z-40">
        {(['chat', 'vision', 'voice', 'video'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="flex-1 p-5 overflow-y-auto no-scrollbar pb-24">
        {activeTab === 'chat' && (
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Grounding Mode</span>
                <button 
                  onClick={() => setUseSearch(!useSearch)}
                  className={`w-12 h-6 rounded-full relative transition-all ${useSearch ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useSearch ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">Requires billing enabled API Key for Google Search</p>
            </div>
            
            <div className="flex flex-col gap-3 min-h-[300px]">
              {chatMessages.length === 0 && (
                <div className="py-12 text-center opacity-30 flex flex-col items-center gap-4">
                  <i className="fas fa-comments text-5xl"></i>
                  <p className="font-black uppercase text-xs tracking-widest">Start a medical AI dialogue</p>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`p-4 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-indigo-600 text-white self-end rounded-tr-none' : 'bg-white border text-slate-800 self-start rounded-tl-none shadow-sm'}`}>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  {m.grounding && m.grounding.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Sources Found:</p>
                      <div className="flex flex-wrap gap-2">
                        {m.grounding.map((chunk, ci) => {
                          const uri = chunk.web?.uri || chunk.maps?.uri;
                          const title = chunk.web?.title || chunk.maps?.title || "Source";
                          if (!uri) return null;
                          return (
                            <a key={ci} href={uri} target="_blank" rel="noopener noreferrer" className="bg-blue-50 px-2 py-1 rounded text-[9px] font-black uppercase text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1">
                              <i className="fas fa-external-link-alt text-[8px]"></i>
                              {title.substring(0, 20)}...
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isThinking && <div className="p-4 bg-white border rounded-2xl self-start flex items-center gap-3 animate-pulse">
                <i className="fas fa-brain text-indigo-400"></i>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Analyzing with Thinking Model...</span>
              </div>}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md max-w-md mx-auto flex gap-2 border-t">
              <input 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                placeholder="Ask about medical history, clinics..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button onClick={handleChat} className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'vision' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imaging Assistant</label>
              <p className="text-[9px] font-bold text-indigo-400 uppercase">Requires Gemini 3 Pro Key</p>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {(['1:1', '16:9', '9:16', '3:4', '4:3'] as const).map(r => (
                  <button key={r} onClick={() => setAspectRatio(r)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${aspectRatio === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {(['1K', '2K', '4K'] as const).map(s => (
                  <button key={s} onClick={() => setImgSize(s)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${imgSize === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                    {s}
                  </button>
                ))}
              </div>

              <input 
                type="text" 
                value={visionPrompt} 
                onChange={e => setVisionPrompt(e.target.value)}
                placeholder="Describe image or requested edit..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium"
              />

              <div className="flex gap-2">
                <Button onClick={handleGenerateImage} disabled={visionLoading} className="flex-1 bg-indigo-600 h-14">
                  {visionLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Create'}
                </Button>
                <input type="file" id="img-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <label htmlFor="img-upload" className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-all">
                  <i className="fas fa-camera text-slate-500"></i>
                </label>
              </div>

              {selectedImage && (
                <div className="flex gap-2">
                  <Button onClick={handleEditImage} variant="secondary" className="flex-1 h-12 text-[10px]">Edit Selected</Button>
                  <Button onClick={handleAnalyzeImage} variant="outline" className="flex-1 h-12 text-[10px]">AI Analysis</Button>
                </div>
              )}
            </div>

            {visionResult && (
              <div className="animate-fade-in bg-white p-2 rounded-3xl border shadow-xl">
                <img src={visionResult} className="w-full rounded-2xl" alt="AI Generated" />
                <button 
                  onClick={() => setSelectedImage(visionResult)} 
                  className="w-full mt-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Use for Further Edits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
             <div className={`w-40 h-40 rounded-full flex items-center justify-center relative ${isLiveActive ? 'bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]' : 'bg-slate-200'}`}>
                <div className={`absolute inset-0 rounded-full border-4 border-white/30 ${isLiveActive ? 'animate-ping' : ''}`}></div>
                <i className={`fas ${isLiveActive ? 'fa-waveform-path' : 'fa-microphone-slash'} text-5xl text-white`}></i>
             </div>
             
             <div className="text-center max-w-[280px]">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Native Audio</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time health consultation</p>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-3">Requires Paid Project API Key</p>
             </div>

             <Button 
               onClick={isLiveActive ? () => setIsLiveActive(false) : startLive} 
               className={`w-full h-16 rounded-2xl text-lg font-black tracking-widest shadow-xl ${isLiveActive ? 'bg-red-600' : 'bg-indigo-600'}`}
             >
                {isLiveActive ? 'STOP SESSION' : 'START LIVE CHAT'}
             </Button>

             <div className="w-full bg-white p-6 rounded-3xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Live Session Status</p>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto no-scrollbar italic text-sm text-slate-600 font-medium">
                  {liveLog.length === 0 ? "Voice interface ready. Awaiting connection..." : liveLog.map((l, idx) => <p key={idx}>{l}</p>)}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="flex flex-col gap-5 pb-10">
            <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col gap-4">
               <div className="flex justify-between items-center">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Veo Video Studio</h3>
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] font-black text-blue-600 uppercase hover:underline">Billing Docs</a>
               </div>
               <p className="text-[9px] font-bold text-red-500 uppercase">Warning: Requires paid project API key</p>
               <textarea 
                 value={videoPrompt} 
                 onChange={e => setVideoPrompt(e.target.value)}
                 className="w-full bg-slate-50 border rounded-2xl p-4 text-sm font-medium h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="Describe a cinematic medical scene (e.g. 'A futuristic scan of a human heart with holographic data overlays')..."
               />
               <div className="flex gap-2">
                 <Button 
                   onClick={handleVeoVideo} 
                   disabled={videoLoading}
                   className="flex-1 bg-indigo-600 h-16 text-lg"
                 >
                   {videoLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Animate with Veo'}
                 </Button>
               </div>
            </div>

            {videoLoading && (
               <div className="bg-indigo-600 p-8 rounded-3xl text-white flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-movie text-xl"></i>
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest">{videoMessage}</p>
                  <p className="text-[10px] opacity-60 font-bold">This typically takes 20-60 seconds</p>
               </div>
            )}

            {videoResult && (
              <div className="bg-black rounded-3xl overflow-hidden shadow-2xl animate-scale-up border-4 border-white">
                <video src={videoResult} controls autoPlay className="w-full" />
                <div className="p-4 bg-white flex justify-between items-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Generated by Veo 3.1</p>
                   <a href={videoResult} download="gemini-video.mp4" className="text-indigo-600 font-black text-[10px] uppercase">Download</a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AIHub;
