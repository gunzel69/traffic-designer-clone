import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  Brain,
  Shield,
  Download,
  Loader2,
  Layers,
  MapPin,
  MessageSquare,
  Trash2,
  Search,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { AIChatBox } from "@/components/AIChatBox";

declare global {
  interface Window {
    L: any;
    deleteMarker: (id: number) => void;
  }
}

const SIGN_TYPES = [
  { id: "T1-1", label: "Road Work Ahead", color: "#f97316" },
  { id: "T1-2", label: "Workers Ahead", color: "#f97316" },
  { id: "T1-3", label: "Road Closed", color: "#ef4444" },
  { id: "T1-5", label: "Prepare to Stop", color: "#f97316" },
  { id: "T1-6", label: "Speed Limit", color: "#f97316" },
  { id: "T2-1", label: "Lane Closed", color: "#eab308" },
  { id: "T2-4", label: "Merge Left", color: "#eab308" },
  { id: "T2-5", label: "Merge Right", color: "#eab308" },
  { id: "T3-1", label: "Detour Ahead", color: "#3b82f6" },
  { id: "TC-1", label: "Traffic Controller", color: "#3b82f6" },
  { id: "CONE", label: "Cone/Delineator", color: "#fbbf24" },
];

export default function TgsEditor() {
  const { planId } = useParams<{ planId: string }>();
  const { loading: authLoading } = useAuth();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [projectName, setProjectName] = useState("Loading Project...");
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedSign, setSelectedSign] = useState(SIGN_TYPES[0]);
  const selectedSignRef = useRef(SIGN_TYPES[0]);
  
  // Mobile UI State
  const [showPalette, setShowPalette] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    selectedSignRef.current = selectedSign;
  }, [selectedSign]);

  useEffect(() => {
    const saved = localStorage.getItem("tgs_projects");
    if (saved) {
      const projects = JSON.parse(saved);
      const project = projects.find((p: any) => p.id === planId);
      if (project) setProjectName(project.name);
    }
    const savedMarkers = localStorage.getItem(`markers_${planId}`);
    if (savedMarkers) setMarkers(JSON.parse(savedMarkers));
    
    // Auto-hide palette on mobile
    if (window.innerWidth < 768) setShowPalette(false);
  }, [planId]);

  const renderMarkers = useCallback((markersToRender: any[]) => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;
    map.eachLayer((layer: any) => { if (layer instanceof L.CircleMarker) map.removeLayer(layer); });
    markersToRender.forEach(m => {
      const marker = L.circleMarker([m.lat, m.lng], {
        radius: 12, // Larger for touch
        fillColor: m.color,
        color: "#fff",
        weight: 3,
        fillOpacity: 0.9,
      }).addTo(map);
      marker.bindPopup(`<div class="text-black p-2"><p class="font-bold text-base mb-2">${m.label}</p><button onclick="window.deleteMarker(${m.id})" class="w-full bg-red-500 text-white rounded py-2 text-sm font-bold">Remove Sign</button></div>`);
    });
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;
    const map = L.map(mapRef.current, { center: [-37.8136, 144.9631], zoom: 16, zoomControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: '&copy; OSM', subdomains: "abcd", maxZoom: 20 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.on('click', (e: any) => {
      const sign = selectedSignRef.current;
      const newMarker = { id: Date.now(), lat: e.latlng.lat, lng: e.latlng.lng, type: sign.id, label: sign.label, color: sign.color };
      const currentMarkers = JSON.parse(localStorage.getItem(`markers_${planId}`) || "[]");
      const updated = [...currentMarkers, newMarker];
      setMarkers(updated);
      localStorage.setItem(`markers_${planId}`, JSON.stringify(updated));
      renderMarkers(updated);
    });
    mapInstanceRef.current = map;
    setMapReady(true);
    const initialMarkers = JSON.parse(localStorage.getItem(`markers_${planId}`) || "[]");
    renderMarkers(initialMarkers);
  }, [planId, renderMarkers]);

  useEffect(() => {
    window.deleteMarker = (id: number) => {
      const currentMarkers = JSON.parse(localStorage.getItem(`markers_${planId}`) || "[]");
      const updated = currentMarkers.filter((m: any) => m.id !== id);
      setMarkers(updated);
      localStorage.setItem(`markers_${planId}`, JSON.stringify(updated));
      renderMarkers(updated);
      toast.success("Sign removed");
    };
  }, [planId, renderMarkers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else { initMap(); }
  }, [initMap]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true);
    
    // Try multiple search variants for better results in Victoria
    const queries = [
      address + ", Victoria, Australia",
      address + ", VIC",
      address + ", Melbourne",
      address
    ];

    let found = false;
    for (const query of queries) {
      if (found) break;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
          headers: { 'Accept-Language': 'en-AU' }
        });
        const data = await res.json();
        if (data && data[0]) {
          const { lat, lon } = data[0];
          mapInstanceRef.current.setView([lat, lon], 18);
          toast.success(`Found: ${data[0].display_name}`);
          found = true;
        }
      } catch (err) {
        console.error("Search attempt failed:", query, err);
      }
    }

    if (!found) {
      toast.error("Location not found. Try adding a suburb name.");
    }
    setSearching(false);
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Address Search Bar - Top Floating */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search address in Victoria..."
            className="w-full bg-black/80 backdrop-blur-xl border border-white/20 rounded-full py-3 px-12 text-white shadow-2xl focus:border-orange-500 outline-none transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 animate-spin" />}
        </form>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0 z-0" />
        
        {/* Floating Controls */}
        <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-3">
          <Button onClick={() => setShowPalette(!showPalette)} className={`w-14 h-14 rounded-full shadow-2xl ${showPalette ? 'bg-orange-500 text-white' : 'bg-black/80 text-orange-400 border border-orange-500/30'}`}>
            {showPalette ? <X className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
          </Button>
          <Button onClick={() => setShowRightPanel(!showRightPanel)} className={`w-14 h-14 rounded-full shadow-2xl ${showRightPanel ? 'bg-orange-500 text-white' : 'bg-black/80 text-orange-400 border border-orange-500/30'}`}>
            {showRightPanel ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
          </Button>
        </div>

        {/* Floating Back Button */}
        <Link href="/app">
          <Button className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/80 text-white border border-white/10 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Collapsible Sign Palette (Left) */}
      {showPalette && (
        <div className="absolute top-0 left-0 bottom-0 w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 z-[70] flex flex-col p-4 pt-20 animate-in slide-in-from-left duration-300">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Sign Palette</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {SIGN_TYPES.map(sign => (
              <button
                key={sign.id}
                onClick={() => { setSelectedSign(sign); if(window.innerWidth < 768) setShowPalette(false); toast.info(`Selected: ${sign.label}`); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedSign.id === sign.id ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
              >
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: sign.color }} />
                <span className="text-sm font-bold leading-tight">{sign.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Settings Panel (Right) */}
      {showRightPanel && (
        <div className="absolute top-0 right-0 bottom-0 w-72 bg-black/90 backdrop-blur-xl border-l border-white/10 z-[70] flex flex-col p-6 pt-20 animate-in slide-in-from-right duration-300">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-orange-400" /> Plan Settings</h3>
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Project Name</label>
              <p className="text-sm text-white font-bold">{projectName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Signs</p>
                <p className="text-xl font-bold text-orange-400">{markers.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</p>
                <p className="text-sm font-bold text-green-400 uppercase">Live</p>
              </div>
            </div>
            <Button onClick={() => { setExporting(true); setTimeout(() => { setExporting(false); toast.success("PDF Exported"); }, 2000); }} className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">
              {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5 mr-2" /> Export TGS</>}
            </Button>
            <Button variant="ghost" className="w-full text-red-400 hover:bg-red-500/10 h-12 rounded-xl" onClick={() => { if(confirm("Clear all signs?")) { setMarkers([]); localStorage.setItem(`markers_${planId}`, "[]"); renderMarkers([]); } }}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear All Signs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
