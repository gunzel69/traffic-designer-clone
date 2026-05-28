import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
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
  XCircle,
  MessageSquare,
  Eye,
  EyeOff,
  Train,
  Footprints,
} from "lucide-react";
import { toast } from "sonner";
import { AIChatBox, type Message } from "@/components/AIChatBox";

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

// Sign types for manual placement
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
  const { planId: planIdStr } = useParams<{ planId: string }>();
  const planId = parseInt(planIdStr || "0");
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showPanel, setShowPanel] = useState<"settings" | "compliance" | "photos" | "ai" | null>("settings");

  // Layer controls state
  const [showTramLayer, setShowTramLayer] = useState(false);
  const [showPedestrianLayer, setShowPedestrianLayer] = useState(false);
  const tramLayerRef = useRef<any>(null);
  const pedestrianLayerRef = useRef<any>(null);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are a Victorian traffic management AI assistant. Help users create compliant Traffic Guidance Schemes. You have context about the current plan and can advise on sign placement, taper calculations, compliance with AS 1742.3, VicRoads standards, tram corridor safety, and Melbourne-specific requirements.",
    },
  ]);

  // Load Leaflet
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
      script.onload = () => {
        initMap();
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

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

    mapInstanceRef.current = map;
    setMapReady(true);
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success("AI TGS Plan Generated (Demo Mode)");
      // Add some dummy markers
      const L = window.L;
      const map = mapInstanceRef.current;
      if (L && map) {
        L.circleMarker([-37.8136, 144.9631], { radius: 10, color: "#f97316" }).addTo(map).bindPopup("T1-1: Road Work Ahead");
        L.circleMarker([-37.8150, 144.9631], { radius: 10, color: "#f97316" }).addTo(map).bindPopup("T1-2: Workers Ahead");
        map.setView([-37.8143, 144.9631], 17);
      }
    }, 2000);
  };

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setShowPanel("compliance");
      toast.success("Compliance Check Complete (Demo Mode)");
    }, 1500);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success("PDF Exported (Demo Mode)");
    }, 2000);
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Editor Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <Link href="/app">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white leading-tight">Swanston St Intersection Upgrade</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">TMP-2024-0156 • In Review</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
            AI Generate
          </Button>
          <Button
            onClick={handleCheck}
            disabled={checking}
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
            Check Compliance
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Export PDF
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <div className="w-14 border-r border-white/10 flex flex-col items-center py-4 gap-4 bg-background z-40">
          <Button variant="ghost" size="icon" className="text-orange-400 bg-orange-500/10"><Layers className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-gray-500"><Camera className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-gray-500"><Upload className="w-5 h-5" /></Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="text-gray-500"><Undo2 className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-gray-500"><Redo2 className="w-5 h-5" /></Button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0 z-0" />
          
          {/* Layer Toggle Floating Menu */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTramLayer(!showTramLayer)}
              className={`shadow-lg border border-white/10 ${showTramLayer ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-background/80 text-gray-400'}`}
            >
              <Train className="w-4 h-4 mr-2" /> Tram Layer
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPedestrianLayer(!showPedestrianLayer)}
              className={`shadow-lg border border-white/10 ${showPedestrianLayer ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-background/80 text-gray-400'}`}
            >
              <Footprints className="w-4 h-4 mr-2" /> Pedestrian Layer
            </Button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-white/10 bg-background flex flex-col z-40">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setShowPanel("settings")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${showPanel === "settings" ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              Settings
            </button>
            <button
              onClick={() => setShowPanel("compliance")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${showPanel === "compliance" ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              Compliance
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {showPanel === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-400" /> Location Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Address</label>
                      <p className="text-sm text-gray-300">Swanston St & La Trobe St, Melbourne VIC 3000</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Speed Limit</label>
                      <p className="text-sm text-gray-300">40 km/h (Work Zone)</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" /> Schedule
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Work Period</label>
                      <p className="text-sm text-gray-300">Day Shift (09:30 - 15:30)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showPanel === "compliance" && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">AS 1742.3 Compliant</p>
                    <p className="text-xs text-gray-400 mt-1">Plan meets minimum Australian standards for traffic control.</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">VicRoads Recommendation</p>
                    <p className="text-xs text-gray-400 mt-1">Increase taper length by 5m for improved safety at 40km/h.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-400" /> AI Assistant
            </h3>
            <div className="h-64 rounded-lg border border-white/5 bg-black/20 overflow-hidden">
              <AIChatBox messages={chatMessages} loading={false} onSendMessage={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
