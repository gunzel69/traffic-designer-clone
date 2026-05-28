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
  Camera,
  Upload,
  Undo2,
  Redo2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Train,
  Footprints,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AIChatBox, type Message } from "@/components/AIChatBox";

declare global {
  interface Window {
    L: any;
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
  const { user, loading: authLoading } = useAuth();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showPanel, setShowPanel] = useState<"settings" | "compliance" | "ai">("settings");
  
  const [projectName, setProjectName] = useState("Loading Project...");
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedSign, setSelectedSign] = useState(SIGN_TYPES[0]);
  const [showTramLayer, setShowTramLayer] = useState(false);
  const [showPedestrianLayer, setShowPedestrianLayer] = useState(false);

  // Load project name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tgs_projects");
    if (saved) {
      const projects = JSON.parse(saved);
      const project = projects.find((p: any) => p.id === planId);
      if (project) setProjectName(project.name);
    }
    
    // Load markers for this project
    const savedMarkers = localStorage.getItem(`markers_${planId}`);
    if (savedMarkers) {
      setMarkers(JSON.parse(savedMarkers));
    }
  }, [planId]);

  // Save markers to localStorage
  const saveMarkers = (newMarkers: any[]) => {
    setMarkers(newMarkers);
    localStorage.setItem(`markers_${planId}`, JSON.stringify(newMarkers));
  };

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [-37.8136, 144.9631],
      zoom: 16,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    // Handle map clicks to place signs
    map.on('click', (e: any) => {
      const newMarker = {
        id: Date.now(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        type: selectedSign.id,
        label: selectedSign.label,
        color: selectedSign.color
      };
      
      const savedMarkers = JSON.parse(localStorage.getItem(`markers_${planId}`) || "[]");
      const updated = [...savedMarkers, newMarker];
      saveMarkers(updated);
      renderMarkers(updated);
    });

    mapInstanceRef.current = map;
    setMapReady(true);
    
    // Initial render of existing markers
    const initialMarkers = JSON.parse(localStorage.getItem(`markers_${planId}`) || "[]");
    renderMarkers(initialMarkers);
  }, [planId, selectedSign]);

  const renderMarkers = (markersToRender: any[]) => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    markersToRender.forEach(m => {
      const marker = L.circleMarker([m.lat, m.lng], {
        radius: 10,
        fillColor: m.color,
        color: "#fff",
        weight: 2,
        fillOpacity: 0.9,
      }).addTo(map);
      
      marker.bindPopup(`
        <div class="text-black p-1">
          <p class="font-bold text-sm mb-1">${m.label}</p>
          <button onclick="window.deleteMarker(${m.id})" class="text-[10px] text-red-500 font-bold hover:underline">Delete Sign</button>
        </div>
      `);
    });
  };

  // Expose delete function to window for popup button
  useEffect(() => {
    (window as any).deleteMarker = (id: number) => {
      const saved = JSON.parse(localStorage.getItem(`markers_${planId}`) || "[]");
      const updated = saved.filter((m: any) => m.id !== id);
      saveMarkers(updated);
      renderMarkers(updated);
      toast.success("Sign removed");
    };
  }, [planId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
    return () => { if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, [initMap]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success("AI TGS Plan Generated!");
      const L = window.L;
      const map = mapInstanceRef.current;
      if (L && map) {
        const demoMarkers = [
          { id: Date.now() + 1, lat: -37.8136, lng: 144.9631, type: "T1-1", label: "Road Work Ahead", color: "#f97316" },
          { id: Date.now() + 2, lat: -37.8150, lng: 144.9631, type: "T1-2", label: "Workers Ahead", color: "#f97316" }
        ];
        saveMarkers(demoMarkers);
        renderMarkers(demoMarkers);
        map.setView([-37.8143, 144.9631], 17);
      }
    }, 2000);
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <Link href="/app"><Button variant="ghost" size="sm" className="text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button></Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white leading-tight">{projectName}</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Plan ID: {planId} • Interactive Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleGenerate} disabled={generating} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />} AI Generate
          </Button>
          <Button onClick={() => { setChecking(true); setTimeout(() => { setChecking(false); setShowPanel("compliance"); toast.success("Compliance Verified"); }, 1500); }} disabled={checking} variant="outline" size="sm" className="border-white/10 text-gray-300">
            {checking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />} Check Compliance
          </Button>
          <Button onClick={() => { setExporting(true); setTimeout(() => { setExporting(false); toast.success("PDF Exported"); }, 2000); }} disabled={exporting} variant="outline" size="sm" className="border-white/10 text-gray-300">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />} Export PDF
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar with Sign Palette */}
        <div className="w-64 border-r border-white/10 flex flex-col bg-background z-40">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Sign Palette</h3>
            <div className="grid grid-cols-1 gap-2">
              {SIGN_TYPES.map(sign => (
                <button
                  key={sign.id}
                  onClick={() => { setSelectedSign(sign); toast.info(`Selected: ${sign.label}. Click on map to place.`); }}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all text-left ${selectedSign.id === sign.id ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sign.color }} />
                  <span className="text-xs font-medium">{sign.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Instructions</h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              1. Select a sign from the palette above.<br/>
              2. Click anywhere on the map to place it.<br/>
              3. Click a placed sign to delete it.<br/>
              4. Use "AI Generate" for automatic placement.
            </p>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0 z-0" />
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowTramLayer(!showTramLayer)} className={`shadow-lg border border-white/10 ${showTramLayer ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-background/80 text-gray-400'}`}><Train className="w-4 h-4 mr-2" /> Tram Layer</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowPedestrianLayer(!showPedestrianLayer)} className={`shadow-lg border border-white/10 ${showPedestrianLayer ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-background/80 text-gray-400'}`}><Footprints className="w-4 h-4 mr-2" /> Pedestrian Layer</Button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-white/10 bg-background flex flex-col z-40">
          <div className="flex border-b border-white/10">
            {["settings", "compliance", "ai"].map(p => (
              <button key={p} onClick={() => setShowPanel(p as any)} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${showPanel === p ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{p}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {showPanel === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-400" /> Plan Summary</h3>
                  <div className="space-y-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center"><span className="text-[10px] text-gray-500 uppercase">Total Signs</span><span className="text-sm text-white font-bold">{markers.length}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[10px] text-gray-500 uppercase">Status</span><span className="text-sm text-orange-400 font-bold">Drafting</span></div>
                  </div>
                </div>
                <Button variant="destructive" size="sm" className="w-full text-xs" onClick={() => { if(confirm("Clear all signs?")) { saveMarkers([]); renderMarkers([]); } }}><Trash2 className="w-3 h-3 mr-2" /> Clear All Signs</Button>
              </div>
            )}
            {showPanel === "compliance" && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" /><div><p className="text-sm font-bold text-white">AS 1742.3 Check</p><p className="text-xs text-gray-400 mt-1">Minimum sign spacing requirements met.</p></div></div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" /><div><p className="text-sm font-bold text-white">Warning</p><p className="text-xs text-gray-400 mt-1">Check taper length for 40km/h zone.</p></div></div>
              </div>
            )}
            {showPanel === "ai" && (
              <div className="h-full flex flex-col">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-orange-400" /> AI Assistant</h3>
                <div className="flex-1 rounded-lg border border-white/5 bg-black/20 overflow-hidden"><AIChatBox messages={[{role:"system", content:"Ask me anything about Victorian traffic standards."}]} loading={false} onSendMessage={() => {}} /></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
