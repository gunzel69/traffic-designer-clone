import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Brain,
  Shield,
  Map,
  Camera,
  FileText,
  Users,
  Smartphone,
  Globe,
  ChevronRight,
  CheckCircle2,
  Layers,
  AlertTriangle,
  Ruler,
  TrainTrack,
} from "lucide-react";

const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663464277314/PDrvRmzeSMQSyfVJgge7rA/tgs-dashboard-mockup-MyaY7cGG3VrYPHSwLse2sx.webp";
const AI_ANALYSIS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663464277314/PDrvRmzeSMQSyfVJgge7rA/tgs-ai-analysis-5Ezwpbak3rMCh23gHyn6HT.webp";

const mainFeatures = [
  {
    icon: Brain,
    title: "AI TGS Generator",
    description: "Automatically create compliant traffic guidance schemes in minutes, not hours.",
    details: [
      "Automatic TGS creation from worksite parameters",
      "Victorian standards compliance built-in",
      "Smart sign spacing calculations",
      "Taper length and angle calculations",
      "Cone placement optimisation",
      "Buffer zone calculations",
      "Traffic controller positioning",
      "Vehicle positioning suggestions",
    ],
  },
  {
    icon: Shield,
    title: "Compliance Checker",
    description: "Real-time validation against Victorian traffic management regulations.",
    details: [
      "Detect missing or incorrectly placed signs",
      "Identify unsafe layout configurations",
      "Flag incorrect taper lengths",
      "Pedestrian safety zone checks",
      "Tram corridor conflict warnings",
      "Bike lane conflict detection",
      "Night-time visibility validation",
      "AS 1742.3 conformance checks",
    ],
  },
  {
    icon: Map,
    title: "Smart Mapping Tools",
    description: "Professional-grade mapping powered by open-source technology.",
    details: [
      "Interactive road map editor",
      "Lane closure drawing tools",
      "Auto road direction detection",
      "Lane count estimation from OSM data",
      "Intersection detection algorithms",
      "Melbourne tram line overlays",
      "Pedestrian crossing detection",
      "Real road geometry analysis",
    ],
  },
  {
    icon: Camera,
    title: "AI Photo Analysis",
    description: "Upload site photos and let AI understand your worksite conditions.",
    details: [
      "Automatic lane layout detection",
      "Road width measurement estimation",
      "Existing signage identification",
      "Intersection geometry analysis",
      "Hazard zone detection",
      "Tram track identification",
      "Pedestrian area mapping",
      "Automatic TGS layout suggestions",
    ],
  },
  {
    icon: FileText,
    title: "PDF & Export System",
    description: "Generate professional, print-ready traffic management documentation.",
    details: [
      "Export professional TGS PDFs",
      "Print-ready A3/A4 layouts",
      "Client sharing with view links",
      "Cloud project storage",
      "Full revision history",
      "Custom branding on exports",
      "Batch export capabilities",
      "CAD-compatible formats",
    ],
  },
  {
    icon: Users,
    title: "Collaboration Features",
    description: "Work together seamlessly across your traffic management team.",
    details: [
      "Team project workspaces",
      "Shared plan libraries",
      "Live collaborative editing",
      "Approval workflows",
      "Site crew mobile access",
      "Role-based permissions",
      "Comment and annotation tools",
      "Activity audit trails",
    ],
  },
];

const additionalFeatures = [
  { icon: Smartphone, title: "Mobile Site Access", description: "Access plans on-site from any device. Review and approve TGS layouts from the field." },
  { icon: Globe, title: "Open-Source Mapping", description: "Built on OpenStreetMap, Leaflet.js, and MapLibre. No expensive Google Maps API costs." },
  { icon: Layers, title: "Layer Controls", description: "Toggle road layers, tram corridors, bike lanes, pedestrian zones, and work areas independently." },
  { icon: AlertTriangle, title: "Risk Assessment", description: "Automated risk scoring based on road speed, traffic volume, and worksite complexity." },
  { icon: Ruler, title: "Measurement Tools", description: "Precise distance, area, and angle measurements directly on the map canvas." },
  { icon: TrainTrack, title: "Tram Integration", description: "Dedicated Melbourne tram corridor detection with conflict warnings and clearance checks." },
];

export default function Features() {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-orange-500/20 mb-6">
            <span className="text-xs font-medium text-orange-300">Platform Features</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Everything you need for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Victorian TGS</span>
          </h1>
          <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto">
            Purpose-built for Australian traffic management professionals. From AI-powered generation to compliance checking and team collaboration.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          {mainFeatures.map((feature, i) => (
            <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-gray-400 leading-relaxed">{feature.description}</p>
                <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {feature.details.map((detail, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-xl overflow-hidden border border-white/10 shadow-xl ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <img
                  src={i % 2 === 0 ? DASHBOARD_IMG : AI_ANALYSIS}
                  alt={feature.title}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-12">
            And much more...
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalFeatures.map((feature, i) => (
              <div key={i} className="glass rounded-xl p-6 hover:border-orange-500/30 hover:glow-orange transition-all duration-300">
                <feature.icon className="w-5 h-5 text-orange-400 mb-3" />
                <h4 className="font-display font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-2xl p-10 glow-orange">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Ready to experience the future of traffic planning?
          </h2>
          <p className="mt-3 text-gray-400">Start your free trial today. No credit card required.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/app">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg shadow-lg shadow-orange-500/25">
                Start Free Trial <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-white/5 rounded-lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
