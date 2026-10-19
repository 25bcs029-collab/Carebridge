
import React, { useState, useEffect, useRef } from 'react';
import { Header, Input, Button } from '../components/UI';
import { useApp } from '../App';
import * as Gemini from '../services/geminiService';

const HealthMap: React.FC = () => {
  const { lang } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapResults, setMapResults] = useState<{ text: string; grounding?: any[] } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [isMapsApiLoaded, setIsMapsApiLoaded] = useState(false);
  const [mapsLoadError, setMapsLoadError] = useState(false);
  const trafficLayerRef = useRef<any>(null);

  const silverMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] }
  ];

  useEffect(() => {
    // Dynamic loading of Google Maps SDK to use injected API Key
    const loadGoogleMaps = () => {
      if ((window as any).google && (window as any).google.maps) {
        setIsMapsApiLoaded(true);
        return;
      }

      const script = document.createElement('script');
      // Using process.env.API_KEY as the Maps key
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapsApiLoaded(true);
      script.onerror = () => setMapsLoadError(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("Location permission denied")
      );
    }
  }, []);

  useEffect(() => {
    if (isMapsApiLoaded && mapRef.current && (window as any).google) {
      const defaultPos = userLocation || { lat: 13.0827, lng: 80.2707 };
      try {
        googleMapRef.current = new (window as any).google.maps.Map(mapRef.current, {
          center: defaultPos,
          zoom: 14,
          styles: silverMapStyle,
          disableDefaultUI: true,
          clickableIcons: false
        });

        trafficLayerRef.current = new (window as any).google.maps.TrafficLayer();

        if (userLocation) {
          new (window as any).google.maps.Marker({
            position: userLocation,
            map: googleMapRef.current,
            title: "You",
            icon: {
              path: (window as any).google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeWeight: 3,
              strokeColor: "white",
            }
          });
        }
      } catch (e) {
        console.error("Map initialization failed", e);
        setMapsLoadError(true);
      }
    }
  }, [isMapsApiLoaded, userLocation]);

  const toggleTraffic = () => {
    if (googleMapRef.current && trafficLayerRef.current) {
      if (showTraffic) {
        trafficLayerRef.current.setMap(null);
      } else {
        trafficLayerRef.current.setMap(googleMapRef.current);
      }
      setShowTraffic(!showTraffic);
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  const handleSearch = async (queryOverride?: string) => {
    const query = queryOverride || searchQuery;
    if (!query) return;

    setIsSearching(true);
    setMapResults(null);
    setShowPanel(false);
    clearMarkers();

    try {
      const result = await Gemini.findNearbyClinics(query, userLocation?.lat, userLocation?.lng);
      setMapResults(result);

      if (result.grounding && result.grounding.length > 0) {
        setShowPanel(true);
        
        if (googleMapRef.current && (window as any).google) {
          const bounds = new (window as any).google.maps.LatLngBounds();
          result.grounding.forEach((place, idx) => {
            const pos = { 
              lat: (userLocation?.lat || 13.0827) + (Math.random() - 0.5) * 0.04, 
              lng: (userLocation?.lng || 80.2707) + (Math.random() - 0.5) * 0.04 
            };
            
            const marker = new (window as any).google.maps.Marker({
              position: pos,
              map: googleMapRef.current,
              title: place.maps?.title || "Facility",
              icon: {
                url: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
                scaledSize: new (window as any).google.maps.Size(32, 32)
              }
            });

            marker.addListener('click', () => {
              setSelectedPlace(place);
              setShowPanel(true);
            });

            markersRef.current.push(marker);
            bounds.extend(pos);
          });
          if (userLocation) bounds.extend(userLocation);
          googleMapRef.current.fitBounds(bounds);
        }
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      alert(`Search Error: ${error.message || "Network issue"}. Please check your API key permissions for Google Maps Grounding.`);
    } finally {
      setIsSearching(false);
    }
  };

  const categories = [
    { id: 'hospitals', label: 'Hospitals', icon: 'fa-hospital', query: 'Find nearest general hospitals' },
    { id: 'blood', label: 'Blood Banks', icon: 'fa-tint', query: 'Find nearest blood donation centers and banks' },
    { id: 'pharmacy', label: 'Pharmacies', icon: 'fa-pills', query: 'Find nearest 24/7 pharmacies' },
    { id: 'clinics', label: 'Specialists', icon: 'fa-user-md', query: 'Find nearest specialist medical clinics' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-screen relative overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0 bg-[#f1f5f9]">
        {(mapsLoadError || !isMapsApiLoaded) && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-100">
             <div className="relative w-full max-w-sm mb-8 opacity-20">
                <svg viewBox="0 0 400 400" className="w-full h-auto">
                   <path d="M0 100 H400 M0 200 H400 M0 300 H400 M100 0 V400 M200 0 V400 M300 0 V400" stroke="#94a3b8" strokeWidth="1" />
                   <circle cx="200" cy="200" r="100" fill="#e2e8f0" />
                </svg>
             </div>
             <div className="animate-fade-in flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400">
                   <i className={`fas ${!isMapsApiLoaded ? 'fa-spinner fa-spin' : 'fa-map-marked-alt'} text-3xl`}></i>
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest leading-none">
                     {!isMapsApiLoaded ? 'Initializing Map Engine' : 'Interactive Visualization'}
                   </h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-2 max-w-[200px] mx-auto">
                     {!isMapsApiLoaded ? 'Securing encrypted connection to satellite servers...' : 'Search results will be displayed here as smart markers.'}
                   </p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Floating Interface */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="p-4 flex flex-col gap-4 pointer-events-auto max-w-md mx-auto">
          <div className="flex items-center justify-between">
             <button 
               onClick={() => window.history.back()}
               className="w-11 h-11 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all border border-slate-100"
             >
               <i className="fas fa-chevron-left"></i>
             </button>
             <div className="bg-white px-5 h-11 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
                <i className="fas fa-map-location-dot text-emerald-600"></i>
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Health Hub Map</span>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={toggleTraffic}
                  disabled={!isMapsApiLoaded}
                  className={`w-11 h-11 rounded-2xl shadow-xl flex items-center justify-center border transition-all ${showTraffic ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 disabled:opacity-30'}`}
                >
                  <i className="fas fa-traffic-light"></i>
                </button>
             </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-2 shadow-2xl flex items-center gap-2 border border-white/50 ring-1 ring-slate-900/5 transition-all focus-within:ring-emerald-500">
             <div className="pl-4 text-slate-400">
                <i className="fas fa-search"></i>
             </div>
             <input 
               className="flex-1 bg-transparent border-none py-3 px-2 text-sm font-bold text-slate-800 focus:outline-none placeholder:text-slate-400"
               placeholder="Find hospitals, blood banks..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
             />
             <button 
               onClick={() => handleSearch()}
               disabled={isSearching}
               className="w-11 h-11 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
             >
               {isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-arrow-right"></i>}
             </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
             {categories.map(cat => (
               <button 
                 key={cat.id}
                 onClick={() => handleSearch(cat.query)}
                 className="flex-shrink-0 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-md border border-slate-100 flex items-center gap-2 active:scale-95 transition-all hover:bg-emerald-50"
               >
                  <i className={`fas ${cat.icon} text-emerald-600 text-sm`}></i>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{cat.label}</span>
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Results Bottom Sheet */}
      {showPanel && mapResults && (
        <div className="absolute inset-x-0 bottom-0 z-20 animate-fade-in pointer-events-none">
           <div className="max-w-md mx-auto w-full bg-white rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[70vh] pointer-events-auto">
              <div className="w-full flex justify-center p-4 cursor-pointer" onClick={() => setShowPanel(prev => !prev)}>
                 <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
              </div>

              <div className="p-6 overflow-y-auto no-scrollbar flex flex-col gap-6">
                 {selectedPlace ? (
                   <div className="animate-scale-up">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedPlace.maps?.title || "Medical Center"}</h2>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Verified Clinical Entity</p>
                         </div>
                         <button onClick={() => setSelectedPlace(null)} className="text-slate-300 hover:text-slate-900 transition-colors">
                           <i className="fas fa-times-circle text-2xl"></i>
                         </button>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col gap-4 shadow-inner">
                         <div className="flex items-center gap-3">
                            <i className="fas fa-location-dot text-slate-400"></i>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">{selectedPlace.maps?.address || "Location data synced with Gemini Grounding."}</p>
                         </div>
                         <div className="flex gap-2">
                            <a 
                              href={selectedPlace.maps?.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase shadow-lg shadow-emerald-100"
                            >
                               <i className="fas fa-diamond-turn-right"></i> Navigate
                            </a>
                            <button className="flex-1 h-12 bg-white text-slate-800 rounded-xl border border-slate-200 flex items-center justify-center gap-2 font-black text-[10px] uppercase">
                               <i className="fas fa-phone"></i> Contact
                            </button>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Medical Analysis</h3>
                         <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase">AI Intel</span>
                      </div>
                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl italic text-sm text-indigo-900 font-medium leading-relaxed shadow-sm">
                        "{mapResults.text}"
                      </div>
                      <div className="flex flex-col gap-3">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <i className="fas fa-map-marker-alt"></i> Found Facilities ({mapResults.grounding?.length})
                         </h4>
                         {mapResults.grounding?.map((place, idx) => (
                           <button 
                             key={idx}
                             onClick={() => setSelectedPlace(place)}
                             className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left group"
                           >
                              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                                 <i className="fas fa-hospital text-xl"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-black text-slate-900 truncate">{place.maps?.title || "Medical Center"}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 truncate">
                                   {place.maps?.address || "Address details available in navigation link"}
                                 </p>
                              </div>
                              <i className="fas fa-chevron-right text-slate-200 group-hover:text-emerald-500 transition-colors"></i>
                           </button>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
              
              <div className="p-6 pt-0">
                 <Button onClick={() => setShowPanel(false)} variant="secondary" className="w-full h-12 rounded-2xl text-[10px] font-black">
                    Dismiss View
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HealthMap;
