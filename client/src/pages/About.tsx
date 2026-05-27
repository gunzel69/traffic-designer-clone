import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Shield,
  Zap,
  Heart,
  Globe,
  Target,
  Users,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const MELBOURNE_ROAD = "https://d2xsxph8kpxj0f.cloudfront.net/310519663464277314/PDrvRmzeSMQSyfVJgge7rA/tgs-melbourne-road-YUht2oGmFYy25jRtN2HNkr.webp";

const values = [
  { icon: Shield, title: "Safety First", description: "Every feature we build is designed with worksite safety as the primary consideration. Compliance isn't optional — it's foundational." },
  { icon: Zap, title: "Industry Modernisation", description: "We're bringing the traffic management industry into the AI era, replacing manual processes with intelligent automation." },
  { icon: Heart, title: "Reducing Paperwork", description: "Less time on paperwork means more time ensuring worksites are safe. We automate the administrative burden." },
  { icon: Globe, title: "Open Technology", description: "Built on open-source mapping and standards. No vendor lock-in, no expensive proprietary APIs, no hidden costs." },
  { icon: Target, title: "Precision Engineering", description: "Our AI doesn't guess — it calculates. Every taper length, sign spacing, and buffer zone meets exact Victorian standards." },
  { icon: Users, title: "Supporting Australian Industry", description: "Built in Melbourne, for Victoria. We understand Australian roads, regulations, and the unique challenges of our infrastructure." },
];

const milestones = [
  { year: "2023", event: "Founded in Melbourne with a mission to modernise traffic management" },
  { year: "2023", event: "First AI TGS generator prototype developed" },
  { year: "2024", event: "Beta launch with 50+ Victorian traffic management companies" },
  { year: "2024", event: "Full compliance engine for AS 1742.3 and VicRoads standards" },
  { year: "2025", event: "500+ projects completed across Victoria" },
  { year: "2025", event: "Tram corridor detection and Melbourne-specific features launched" },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-orange-500/20 mb-6">
            <span className="text-xs font-medium text-orange-300">Our Mission</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Modernising Australian traffic management through{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">AI-driven automation</span>
          </h1>
          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            We believe every road worker deserves safer worksites, every traffic planner deserves better tools,
            and every Victorian road user deserves compliant traffic management.
          </p>
        </div>
      </section>

      {/* Image */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <img src={MELBOURNE_ROAD} alt="Melbourne road at night" className="w-full h-64 md:h-80 object-cover" loading="lazy" />
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-4">
            What Drives Us
          </h2>
          <p className="text-gray-400 text-center max-w-xl mx-auto mb-14">
            Our core principles guide every decision we make, from product design to customer support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((value, i) => (
              <div key={i} className="glass rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-6">
              The Problem We're Solving
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Traffic management planning in Australia has remained largely manual for decades. Traffic engineers spend hours
                drawing plans by hand or using generic CAD tools that don't understand road regulations. The result? Slow turnaround
                times, costly compliance rejections, and increased risk on worksites.
              </p>
              <p>
                Victorian roads present unique challenges — tram corridors, complex intersections, bike lanes, and pedestrian zones
                all require careful consideration. Traditional tools weren't built for this complexity.
              </p>
              <p>
                TGS AI Victoria was built to solve these problems. By combining AI-powered plan generation with deep knowledge of
                Victorian standards, we help traffic management professionals create safer, more compliant plans in a fraction of the time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-12">Our Journey</h2>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-4 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0 mt-1" />
                  {i < milestones.length - 1 && <div className="w-px flex-1 bg-white/10 mt-2" />}
                </div>
                <div className="pb-2">
                  <span className="text-xs font-mono text-orange-400">{m.year}</span>
                  <p className="text-sm text-gray-300 mt-0.5">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "500+", label: "Projects Completed" },
            { value: "50+", label: "Companies Trust Us" },
            { value: "99.2%", label: "Compliance Rate" },
            { value: "Melbourne", label: "Headquartered" },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-5 text-center">
              <div className="text-2xl font-display font-bold text-orange-400">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-2xl p-10 glow-orange">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Join us in building safer Victorian roads
          </h2>
          <p className="mt-3 text-gray-400">Start your free trial or get in touch to learn more about how we can help your team.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/app">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg shadow-lg shadow-orange-500/25">
                Start Free Trial <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-white/5 rounded-lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
