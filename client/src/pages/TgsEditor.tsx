import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  ArrowLeft,
  Brain,
  Shield,
  Download,
  Loader2,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Camera,
  Upload,
  MousePointer,
  Pencil,
  MessageSquare,
  Eye,
  EyeOff,
  Train,
  Footprints,
  GripVertical,
  Undo2,
  Redo2,
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
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPanel, setShowPanel] = useState<"settings" | "compliance" | "photos" | "ai" | null>("settings");
  const [additionalContext, setAdditionalContext] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layer controls state
  const [showTramLayer, setShowTramLayer] = useState(false);
  const [showPedestrianLayer, setShowPedestrianLayer] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const tramLayerRef = useRef<any>(null);
  const pedestrianLayerRef = useRef<any>(null);

  // Manual placement mode
  const [manualMode, setManualMode] = useState(false);
  const [selectedSignType, setSelectedSignType] = useState<string>("T1-1");
  const [showSignPalette, setShowSignPalette] = useState(false);
  const manualMarkersRef = useRef<any[]>([]);

  // Drawing mode
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const drawingLayerRef = useRef<any>(null);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are a Victorian traffic management AI assistant. Help users create compliant Traffic Guidance Schemes. You have context about the current plan and can advise on sign placement, taper calculations, compliance with AS 1742.3, VicRoads standards, tram corridor safety, and Melbourne-specific requirements.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const planQuery = trpc.plans.get.useQuery(
    { id: planId },
    { enabled: isAuthenticated && planId > 0 }
  );

  const updatePlan = trpc.plans.update.useMutation({
    onSuccess: () => {
      toast.success("Plan saved");
      planQuery.refetch();
    },
    onError: (err) => toast.error("Save failed: " + err.message),
  });

  const generateTgs = trpc.ai.generateTgs.useMutation({
    onSuccess: (data) => {
      toast.success("TGS generated successfully!");
      setGenerating(false);
      planQuery.refetch();
      if (data && mapInstanceRef.current) {
        renderTgsPlan(data);
      }
    },
    onError: (err) => {
      toast.error("Generation failed: " + err.message);
      setGenerating(false);
    },
  });

  const checkCompliance = trpc.ai.checkCompliance.useMutation({
    onSuccess: (data) => {
      toast.success(`Compliance check: ${data.result}`);
      setChecking(false);
      setShowPanel("compliance");
      planQuery.refetch();
    },
    onError: (err) => {
      toast.error("Compliance check failed: " + err.message);
      setChecking(false);
    },
  });

  const exportPdf = trpc.exports.generate.useMutation({
    onSuccess: (data) => {
      toast.success("PDF exported successfully!");
      setExporting(false);
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error("Export failed: " + err.message);
      setExporting(false);
    },
  });

  const uploadPhoto = trpc.photos.upload.useMutation({
    onSuccess: (data) => {
      toast.success("Photo uploaded! Starting AI analysis...");
      setUploading(false);
      if (data?.id && data?.url) {
        analyzePhoto.mutate({ photoId: data.id, photoUrl: data.url });
      }
    },
    onError: (err) => {
      toast.error("Upload failed: " + err.message);
      setUploading(false);
    },
  });

  const analyzePhoto = trpc.photos.analyze.useMutation({
    onSuccess: () => {
      toast.success("Photo analysis complete!");
    },
    onError: (err) => {
      toast.error("Analysis failed: " + err.message);
    },
  });

  const aiChat = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      setChatLoading(false);
    },
    onError: (err) => {
      toast.error("AI chat failed: " + err.message);
      setChatLoading(false);
    },
  });

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
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);
  }, []);

  // Render TGS plan elements on the map
  const renderTgsPlan = useCallback((planData: any) => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear existing layers (except base tile and overlay layers)
    map.eachLayer((layer: any) => {
      if (!layer._url && layer !== tramLayerRef.current && layer !== pedestrianLayerRef.current && layer !== drawingLayerRef.current) {
        map.removeLayer(layer);
      }
    });

    // Re-add tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    // Render sign placements
    if (planData.signPlacements?.length) {
      planData.signPlacements.forEach((sign: any) => {
        if (sign.position?.lat && sign.position?.lng) {
          const marker = L.circleMarker([sign.position.lat, sign.position.lng], {
            radius: 8,
            fillColor: "#f97316",
            color: "#fff",
            weight: 2,
            fillOpacity: 0.9,
          }).addTo(map);
          marker.bindPopup(`<b>${sign.type}</b><br/>Distance: ${sign.distanceFromWork}m<br/>Side: ${sign.side}`);
        }
      });
    }

    // Render cone placements
    if (planData.conePlacements?.length) {
      planData.conePlacements.forEach((cone: any) => {
        if (cone.position?.lat && cone.position?.lng) {
          L.circleMarker([cone.position.lat, cone.position.lng], {
            radius: 4,
            fillColor: "#fbbf24",
            color: "#fbbf24",
            weight: 1,
            fillOpacity: 0.8,
          }).addTo(map);
        }
      });
    }

    // Render controller positions
    if (planData.controllerPositions?.length) {
      planData.controllerPositions.forEach((ctrl: any) => {
        if (ctrl.position?.lat && ctrl.position?.lng) {
          const marker = L.circleMarker([ctrl.position.lat, ctrl.position.lng], {
            radius: 10,
            fillColor: "#3b82f6",
            color: "#fff",
            weight: 2,
            fillOpacity: 0.9,
          }).addTo(map);
          marker.bindPopup(`<b>Traffic Controller</b><br/>Role: ${ctrl.role}`);
        }
      });
    }

    // Render vehicle positions
    if (planData.vehiclePositions?.length) {
      planData.vehiclePositions.forEach((vehicle: any) => {
        if (vehicle.position?.lat && vehicle.position?.lng) {
          const marker = L.circleMarker([vehicle.position.lat, vehicle.position.lng], {
            radius: 10,
            fillColor: "#10b981",
            color: "#fff",
            weight: 2,
            fillOpacity: 0.9,
          }).addTo(map);
          marker.bindPopup(`<b>Vehicle</b><br/>Type: ${vehicle.type}`);
        }
      });
    }

    // Fit bounds if we have markers
    const allPositions: [number, number][] = [];
    [...(planData.signPlacements || []), ...(planData.conePlacements || []), ...(planData.controllerPositions || []), ...(planData.vehiclePositions || [])].forEach((item: any) => {
      if (item.position?.lat && item.position?.lng) {
        allPositions.push([item.position.lat, item.position.lng]);
      }
    });

    if (allPositions.length > 0) {
      map.fitBounds(L.latLngBounds(allPositions).pad(0.2));
    }
  }, []);

  // Load existing plan data onto map
  useEffect(() => {
    if (planQuery.data?.planData && mapReady) {
      renderTgsPlan(planQuery.data.planData);
    }
  }, [planQuery.data, mapReady, renderTgsPlan]);

  // ============ LAYER CONTROLS ============
  const toggleTramLayer = useCallback(() => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (showTramLayer) {
      if (tramLayerRef.current) {
        map.removeLayer(tramLayerRef.current);
        tramLayerRef.current = null;
      }
      setShowTramLayer(false);
    } else {
      // Add tram route overlay - Melbourne tram network visualization
      const tramGroup = L.layerGroup();

      // Major Melbourne tram corridors (simplified representative routes)
      const tramRoutes = [
        // Route 96 - St Kilda to East Brunswick (Bourke St section)
        [[-37.8136, 144.9631], [-37.8140, 144.9580], [-37.8145, 144.9530], [-37.8150, 144.9480]],
        // Route 86 - Bundoora to Docklands (La Trobe St section)
        [[-37.8100, 144.9631], [-37.8100, 144.9580], [-37.8100, 144.9530], [-37.8100, 144.9480]],
        // Swanston St corridor
        [[-37.8080, 144.9631], [-37.8120, 144.9631], [-37.8160, 144.9631], [-37.8200, 144.9631]],
        // Collins St corridor
        [[-37.8155, 144.9680], [-37.8155, 144.9631], [-37.8155, 144.9580], [-37.8155, 144.9530]],
        // Flinders St corridor
        [[-37.8180, 144.9680], [-37.8180, 144.9631], [-37.8180, 144.9580], [-37.8180, 144.9530]],
      ];

      tramRoutes.forEach((route) => {
        L.polyline(route, {
          color: "#22c55e",
          weight: 4,
          opacity: 0.7,
          dashArray: "10, 5",
        }).addTo(tramGroup);
      });

      // Add tram stop markers
      const tramStops = [
        { pos: [-37.8136, 144.9631], name: "Melbourne Central" },
        { pos: [-37.8155, 144.9631], name: "Town Hall" },
        { pos: [-37.8100, 144.9631], name: "State Library" },
        { pos: [-37.8180, 144.9631], name: "Flinders St" },
        { pos: [-37.8136, 144.9580], name: "Bourke/Elizabeth" },
        { pos: [-37.8100, 144.9580], name: "La Trobe/Elizabeth" },
      ];

      tramStops.forEach((stop) => {
        L.circleMarker(stop.pos, {
          radius: 6,
          fillColor: "#22c55e",
          color: "#fff",
          weight: 2,
          fillOpacity: 0.8,
        }).addTo(tramGroup).bindPopup(`<b>Tram Stop</b><br/>${stop.name}`);
      });

      tramGroup.addTo(map);
      tramLayerRef.current = tramGroup;
      setShowTramLayer(true);
    }
  }, [showTramLayer]);

  const togglePedestrianLayer = useCallback(() => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (showPedestrianLayer) {
      if (pedestrianLayerRef.current) {
        map.removeLayer(pedestrianLayerRef.current);
        pedestrianLayerRef.current = null;
      }
      setShowPedestrianLayer(false);
    } else {
      const pedGroup = L.layerGroup();

      // Pedestrian crossings in Melbourne CBD area
      const crossings = [
        { pos: [-37.8130, 144.9631], type: "Signalised" },
        { pos: [-37.8150, 144.9631], type: "Signalised" },
        { pos: [-37.8170, 144.9631], type: "Zebra" },
        { pos: [-37.8136, 144.9600], type: "Signalised" },
        { pos: [-37.8136, 144.9660], type: "Signalised" },
        { pos: [-37.8100, 144.9600], type: "Zebra" },
        { pos: [-37.8155, 144.9600], type: "Signalised" },
        { pos: [-37.8180, 144.9600], type: "Signalised" },
        { pos: [-37.8120, 144.9650], type: "Zebra" },
        { pos: [-37.8160, 144.9650], type: "Signalised" },
      ];

      crossings.forEach((crossing) => {
        // Draw crossing lines
        const lat = crossing.pos[0];
        const lng = crossing.pos[1];
        L.rectangle(
          [[lat - 0.00005, lng - 0.0002], [lat + 0.00005, lng + 0.0002]],
          {
            color: "#a855f7",
            weight: 2,
            fillColor: "#a855f7",
            fillOpacity: 0.3,
          }
        ).addTo(pedGroup).bindPopup(`<b>Pedestrian Crossing</b><br/>Type: ${crossing.type}`);
      });

      pedGroup.addTo(map);
      pedestrianLayerRef.current = pedGroup;
      setShowPedestrianLayer(true);
    }
  }, [showPedestrianLayer]);

  // ============ MANUAL SIGN PLACEMENT ============
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const handleMapClick = (e: any) => {
      if (!manualMode) return;
      const L = window.L;
      const { lat, lng } = e.latlng;

      const signInfo = SIGN_TYPES.find((s) => s.id === selectedSignType);
      const color = signInfo?.color || "#f97316";
      const label = signInfo?.label || selectedSignType;

      const marker = L.circleMarker([lat, lng], {
        radius: selectedSignType === "CONE" ? 5 : 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        fillOpacity: 0.9,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`<b>${label}</b><br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}<br/><em>Drag to reposition</em>`);

      // Make marker draggable
      marker.on("click", () => {
        if (!manualMode) return;
        // Double-click to remove
        marker.on("dblclick", () => {
          map.removeLayer(marker);
          manualMarkersRef.current = manualMarkersRef.current.filter((m) => m !== marker);
          toast.info("Sign removed");
        });
      });

      // Enable dragging via Leaflet's built-in marker dragging (circleMarkers don't support dragging natively, so we simulate)
      let isDragging = false;
      marker.on("mousedown", () => { isDragging = true; });
      map.on("mousemove", (moveEvent: any) => {
        if (isDragging) {
          marker.setLatLng(moveEvent.latlng);
        }
      });
      map.on("mouseup", () => { isDragging = false; });

      manualMarkersRef.current.push(marker);
      marker._signType = selectedSignType;
      marker._signLabel = label;

      toast.success(`${label} placed at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [manualMode, selectedSignType, mapReady]);

  const saveManualPlacements = useCallback(() => {
    if (!planQuery.data) return;
    const existingData = (planQuery.data.planData as any) || {};
    const newSigns: any[] = [...(existingData.signPlacements || [])];
    const newCones: any[] = [...(existingData.conePlacements || [])];

    manualMarkersRef.current.forEach((marker) => {
      const pos = marker.getLatLng();
      if (marker._signType === "CONE") {
        newCones.push({ position: { lat: pos.lat, lng: pos.lng }, type: "cone" });
      } else {
        newSigns.push({
          type: marker._signLabel || marker._signType,
          position: { lat: pos.lat, lng: pos.lng },
          distanceFromWork: 0,
          side: "left",
        });
      }
    });

    updatePlan.mutate({
      id: planId,
      planData: { ...existingData, signPlacements: newSigns, conePlacements: newCones },
    });

    // Clear manual markers after save
    manualMarkersRef.current.forEach((m) => mapInstanceRef.current?.removeLayer(m));
    manualMarkersRef.current = [];
    setManualMode(false);
    toast.success("Manual placements saved to plan");
  }, [planQuery.data, planId, updatePlan]);

  // ============ DRAWING TOOLS ============
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const handleDrawClick = (e: any) => {
      if (!drawingMode) return;
      const L = window.L;
      const { lat, lng } = e.latlng;

      setDrawnPoints((prev) => {
        const newPoints: [number, number][] = [...prev, [lat, lng]];

        // Update polyline on map
        if (drawingLayerRef.current) {
          map.removeLayer(drawingLayerRef.current);
        }
        drawingLayerRef.current = L.polyline(newPoints, {
          color: "#f97316",
          weight: 3,
          opacity: 0.8,
          dashArray: "5, 5",
        }).addTo(map);

        return newPoints;
      });
    };

    map.on("click", handleDrawClick);
    return () => {
      map.off("click", handleDrawClick);
    };
  }, [drawingMode, mapReady]);

  const saveDrawnGeometry = useCallback(() => {
    if (!planQuery.data || drawnPoints.length < 2) {
      toast.error("Draw at least 2 points to define road geometry");
      return;
    }

    const existingData = (planQuery.data.planData as any) || {};
    const geometry = {
      type: "LineString",
      coordinates: drawnPoints.map(([lat, lng]) => [lng, lat]),
    };

    updatePlan.mutate({
      id: planId,
      roadGeometry: geometry,
      planData: { ...existingData, drawnGeometry: geometry },
    });

    setDrawingMode(false);
    setDrawnPoints([]);
    toast.success("Road geometry saved. AI will use this for generation.");
  }, [planQuery.data, drawnPoints, planId, updatePlan]);

  const clearDrawing = useCallback(() => {
    const map = mapInstanceRef.current;
    if (drawingLayerRef.current && map) {
      map.removeLayer(drawingLayerRef.current);
      drawingLayerRef.current = null;
    }
    setDrawnPoints([]);
  }, []);

  // ============ AI CHAT ============
  const handleChatSend = useCallback((content: string) => {
    const plan = planQuery.data;
    const newMessages: Message[] = [...chatMessages, { role: "user", content }];
    setChatMessages(newMessages);
    setChatLoading(true);

    aiChat.mutate({
      messages: newMessages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content })),
      planContext: plan ? {
        name: plan.name,
        workType: plan.workType || "lane_closure",
        speedZone: plan.speedZone || 60,
        laneCount: plan.laneCount || 2,
        complianceStatus: plan.complianceStatus || "unchecked",
        hasPlanData: !!plan.planData,
        aiNotes: plan.aiNotes || undefined,
      } : undefined,
    });
  }, [chatMessages, planQuery.data, aiChat]);

  // ============ HANDLERS ============
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const plan = planQuery.data;

  const handleGenerate = () => {
    if (!plan) return;
    setGenerating(true);

    const center = mapInstanceRef.current?.getCenter();
    const bounds = mapInstanceRef.current?.getBounds();

    generateTgs.mutate({
      projectId: plan.projectId,
      planId: plan.id,
      workType: plan.workType || "lane_closure",
      speedZone: plan.speedZone || 60,
      laneCount: plan.laneCount || 2,
      roadGeometry: center ? { center: { lat: center.lat, lng: center.lng }, bounds: { north: bounds?.getNorth(), south: bounds?.getSouth(), east: bounds?.getEast(), west: bounds?.getWest() } } : undefined,
      additionalContext: additionalContext || undefined,
    });
  };

  const handleCheckCompliance = () => {
    if (!plan?.planData) {
      toast.error("Generate a TGS plan first before checking compliance");
      return;
    }
    setChecking(true);
    checkCompliance.mutate({
      planId: plan.id,
      planData: plan.planData,
      speedZone: plan.speedZone || 60,
      workType: plan.workType || "lane_closure",
    });
  };

  const handleExportPdf = () => {
    if (!plan?.planData) {
      toast.error("Generate a TGS plan first before exporting");
      return;
    }
    setExporting(true);
    exportPdf.mutate({ planId: plan.id });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !plan) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum 10MB.");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadPhoto.mutate({
        projectId: plan.projectId,
        filename: file.name,
        mimeType: file.type,
        base64Data: base64,
      });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Editor Header */}
      <header className="border-b border-white/10 bg-background/95 backdrop-blur-md z-50 shrink-0">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={plan ? `/app/project/${plan.projectId}` : "/app"}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <span className="font-display text-sm font-bold text-white">
              {plan?.name || "Loading..."}
            </span>
            {plan && (
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                plan.complianceStatus === "compliant" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                plan.complianceStatus === "non_compliant" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                plan.complianceStatus === "warnings" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                "bg-white/5 text-gray-400 border border-white/10"
              }`}>
                {plan.complianceStatus === "compliant" ? "Compliant" :
                 plan.complianceStatus === "non_compliant" ? "Non-Compliant" :
                 plan.complianceStatus === "warnings" ? "Warnings" : "Unchecked"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanel(showPanel === "settings" ? null : "settings")}
              className={`text-gray-400 hover:text-white ${showPanel === "settings" ? "bg-white/5 text-white" : ""}`}
            >
              <Layers className="w-4 h-4 mr-1" /> Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanel(showPanel === "photos" ? null : "photos")}
              className={`text-gray-400 hover:text-white ${showPanel === "photos" ? "bg-white/5 text-white" : ""}`}
            >
              <Camera className="w-4 h-4 mr-1" /> Photos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanel(showPanel === "ai" ? null : "ai")}
              className={`text-gray-400 hover:text-white ${showPanel === "ai" ? "bg-white/5 text-white" : ""}`}
            >
              <MessageSquare className="w-4 h-4 mr-1" /> AI Chat
            </Button>
            <div className="h-5 w-px bg-white/10" />
            <Button
              onClick={handleGenerate}
              disabled={generating || !plan}
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Brain className="w-4 h-4 mr-1" />}
              Generate TGS
            </Button>
            <Button
              onClick={handleCheckCompliance}
              disabled={checking || !plan?.planData}
              variant="outline"
              size="sm"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Shield className="w-4 h-4 mr-1" />}
              Compliance
            </Button>
            <Button
              onClick={handleExportPdf}
              disabled={exporting || !plan?.planData}
              variant="outline"
              size="sm"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Download className="w-4 h-4 mr-1" />}
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0" />

          {/* Map Toolbar - Left side */}
          <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
            {/* Layer Controls */}
            <div className="bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowLayerPanel(!showLayerPanel)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${showLayerPanel ? "text-orange-400 bg-orange-500/10" : "text-gray-300 hover:text-white hover:bg-white/5"}`}
              >
                <Layers className="w-4 h-4" />
                <span>Layers</span>
              </button>
              {showLayerPanel && (
                <div className="border-t border-white/10 p-2 space-y-1">
                  <button
                    onClick={toggleTramLayer}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${showTramLayer ? "text-green-400 bg-green-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    <Train className="w-3.5 h-3.5" />
                    <span>Tram Lines</span>
                    {showTramLayer ? <Eye className="w-3 h-3 ml-auto" /> : <EyeOff className="w-3 h-3 ml-auto" />}
                  </button>
                  <button
                    onClick={togglePedestrianLayer}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${showPedestrianLayer ? "text-purple-400 bg-purple-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Ped. Crossings</span>
                    {showPedestrianLayer ? <Eye className="w-3 h-3 ml-auto" /> : <EyeOff className="w-3 h-3 ml-auto" />}
                  </button>
                </div>
              )}
            </div>

            {/* Manual Placement Tool */}
            <div className="bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  if (manualMode) {
                    setManualMode(false);
                    setShowSignPalette(false);
                  } else {
                    setManualMode(true);
                    setDrawingMode(false);
                    setShowSignPalette(true);
                  }
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${manualMode ? "text-orange-400 bg-orange-500/10" : "text-gray-300 hover:text-white hover:bg-white/5"}`}
              >
                <MousePointer className="w-4 h-4" />
                <span>Place Signs</span>
              </button>
              {showSignPalette && manualMode && (
                <div className="border-t border-white/10 p-2 space-y-1 max-h-60 overflow-y-auto">
                  {SIGN_TYPES.map((sign) => (
                    <button
                      key={sign.id}
                      onClick={() => setSelectedSignType(sign.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] transition-colors ${selectedSignType === sign.id ? "bg-orange-500/20 text-orange-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sign.color }} />
                      <span className="truncate">{sign.label}</span>
                    </button>
                  ))}
                  <div className="pt-2 border-t border-white/10">
                    <Button
                      size="sm"
                      onClick={saveManualPlacements}
                      className="w-full bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-xs"
                      disabled={manualMarkersRef.current.length === 0}
                    >
                      Save Placements
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawing Tool */}
            <div className="bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  if (drawingMode) {
                    setDrawingMode(false);
                  } else {
                    setDrawingMode(true);
                    setManualMode(false);
                    setShowSignPalette(false);
                  }
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${drawingMode ? "text-orange-400 bg-orange-500/10" : "text-gray-300 hover:text-white hover:bg-white/5"}`}
              >
                <Pencil className="w-4 h-4" />
                <span>Draw Road</span>
              </button>
              {drawingMode && (
                <div className="border-t border-white/10 p-2 space-y-1">
                  <p className="text-[10px] text-gray-500 px-1">Click map to add points. Draw the road centreline.</p>
                  <div className="text-[10px] text-gray-400 px-1">Points: {drawnPoints.length}</div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={saveDrawnGeometry}
                      className="flex-1 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-[10px] h-7"
                      disabled={drawnPoints.length < 2}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearDrawing}
                      className="text-gray-400 hover:text-white text-[10px] h-7"
                    >
                      <Undo2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mode indicator */}
          {(manualMode || drawingMode) && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-orange-500/90 text-black text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
              {manualMode ? `Manual Mode: Click to place ${SIGN_TYPES.find(s => s.id === selectedSignType)?.label || "sign"}` : "Drawing Mode: Click to add road points"}
            </div>
          )}

          {/* Map Legend */}
          {plan?.planData && Object.keys(plan.planData).length > 0 && (
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-xs z-[1000]">
              <div className="font-semibold text-white mb-2">Legend</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 border border-white" />
                  <span className="text-gray-300">Signs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="text-gray-300">Cones/Delineators</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border border-white" />
                  <span className="text-gray-300">Traffic Controllers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 border border-white" />
                  <span className="text-gray-300">Vehicles</span>
                </div>
                {showTramLayer && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-500 border-dashed" />
                    <span className="text-gray-300">Tram Lines</span>
                  </div>
                )}
                {showPedestrianLayer && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-2 bg-purple-500/30 border border-purple-500" />
                    <span className="text-gray-300">Ped. Crossings</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generation overlay */}
          {generating && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
              <div className="bg-card border border-orange-500/20 rounded-xl p-6 text-center shadow-2xl">
                <Brain className="w-10 h-10 text-orange-400 mx-auto mb-3 animate-pulse" />
                <h3 className="text-white font-semibold mb-1">Generating TGS Plan</h3>
                <p className="text-sm text-gray-400">AI is calculating sign placements, tapers, and compliance...</p>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {showPanel && (
          <div className="w-80 border-l border-white/10 bg-card overflow-y-auto shrink-0">
            {showPanel === "settings" && plan && (
              <div className="p-4 space-y-5">
                <h3 className="font-semibold text-white text-sm">Plan Settings</h3>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Work Type</label>
                  <div className="text-sm text-white bg-background border border-white/10 rounded-lg px-3 py-2">
                    {plan.workType?.replace(/_/g, " ") || "Lane Closure"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Speed Zone</label>
                    <div className="text-sm text-white bg-background border border-white/10 rounded-lg px-3 py-2">
                      {plan.speedZone || 60} km/h
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Lanes</label>
                    <div className="text-sm text-white bg-background border border-white/10 rounded-lg px-3 py-2">
                      {plan.laneCount || 2}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Additional Context for AI</label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="e.g., Tram corridor nearby, school zone, night works only..."
                    rows={4}
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-white/10">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How to Use</h4>
                  <ol className="space-y-2 text-xs text-gray-400">
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold shrink-0">1</span>
                      <span>Pan the map to your work site location</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold shrink-0">2</span>
                      <span>Toggle layers (tram, pedestrian) for context</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold shrink-0">3</span>
                      <span>Draw road geometry or place signs manually</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold shrink-0">4</span>
                      <span>Click "Generate TGS" for AI-powered plan</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold shrink-0">5</span>
                      <span>Check compliance and export PDF</span>
                    </li>
                  </ol>
                </div>

                {/* Calculations display */}
                {plan.planData && (plan.planData as any).calculations && (
                  <div className="pt-3 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Calculations</h4>
                    <div className="space-y-2">
                      {Object.entries((plan.planData as any).calculations).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-400">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-white font-medium">{String(value)}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Notes */}
                {plan.aiNotes && (
                  <div className="pt-3 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AI Notes</h4>
                    <div className="text-xs text-gray-300 whitespace-pre-wrap bg-background rounded-lg p-3 border border-white/5">
                      {plan.aiNotes}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showPanel === "photos" && plan && (
              <div className="p-4 space-y-5">
                <h3 className="font-semibold text-white text-sm">Site Photos</h3>
                <p className="text-xs text-gray-400">
                  Upload site photos for AI analysis. The AI will detect lane layouts, road widths, existing signage, and hazards.
                </p>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-orange-500/30 hover:bg-orange-500/5 transition-all"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-orange-400 mx-auto animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-500 mx-auto" />
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    {uploading ? "Uploading..." : "Click to upload site photo"}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">JPEG, PNG up to 10MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="bg-orange-500/5 border border-orange-500/10 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Camera className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-orange-300 font-medium">AI Photo Analysis</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Uploaded photos are analysed by AI to detect road features, lane markings, existing signage, and potential hazards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showPanel === "ai" && (
              <div className="h-full flex flex-col">
                <div className="p-4 pb-2 border-b border-white/10">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4 text-orange-400" />
                    AI Assistant
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">Ask about TGS standards, sign placement, or compliance.</p>
                </div>
                <div className="flex-1 min-h-0">
                  <AIChatBox
                    messages={chatMessages}
                    onSendMessage={handleChatSend}
                    isLoading={chatLoading}
                    placeholder="Ask about traffic management..."
                    height="100%"
                    emptyStateMessage="Ask me about Victorian TGS standards, sign placement, taper calculations, or compliance requirements."
                    suggestedPrompts={[
                      "What signs are needed for a lane closure at 60km/h?",
                      "Calculate taper length for a 80km/h zone",
                      "What are tram corridor safety requirements?",
                      "Check AS 1742.3 requirements for night works",
                    ]}
                  />
                </div>
              </div>
            )}

            {showPanel === "compliance" && (
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-white text-sm">Compliance Results</h3>

                {checkCompliance.data ? (
                  <>
                    <div className={`p-4 rounded-lg border ${
                      checkCompliance.data.result === "pass" ? "bg-green-500/5 border-green-500/20" :
                      checkCompliance.data.result === "fail" ? "bg-red-500/5 border-red-500/20" :
                      "bg-yellow-500/5 border-yellow-500/20"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {checkCompliance.data.result === "pass" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : checkCompliance.data.result === "fail" ? (
                          <XCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        )}
                        <span className="font-semibold text-white capitalize">{checkCompliance.data.result}</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{checkCompliance.data.score}/100</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Standards: {checkCompliance.data.standardsChecked?.join(", ")}
                      </div>
                    </div>

                    {checkCompliance.data.issues?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Issues</h4>
                        <div className="space-y-2">
                          {(checkCompliance.data.issues as any[]).map((issue: any, i: number) => (
                            <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                  issue.severity === "critical" ? "bg-red-500/20 text-red-400" :
                                  issue.severity === "major" ? "bg-orange-500/20 text-orange-400" :
                                  "bg-yellow-500/20 text-yellow-400"
                                }`}>{issue.severity}</span>
                              </div>
                              <p className="text-xs text-gray-300">{issue.description}</p>
                              {issue.standard && (
                                <p className="text-[10px] text-gray-500 mt-1">Ref: {issue.standard}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {checkCompliance.data.warnings?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">Warnings</h4>
                        <div className="space-y-2">
                          {checkCompliance.data.warnings.map((warning: any, i: number) => (
                            <div key={i} className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3">
                              <p className="text-xs text-gray-300">{warning.description}</p>
                              {warning.recommendation && (
                                <p className="text-[10px] text-orange-400 mt-1">Tip: {warning.recommendation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">
                      Generate a TGS plan first, then run compliance check.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
