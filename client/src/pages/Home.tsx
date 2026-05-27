import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import {
  ChevronRight,
  Shield,
  Map,
  Brain,
  FileText,
  Users,
  Camera,
  CheckCircle2,
  Plus,
  Minus,
  ArrowRight,
  Zap,
  Target,
  Clock,
} from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663464277314/PDrvRmzeSMQSyfVJgge7rA/tgs-hero-dark-GbojZTKxnd6eTWAAamiUMz.webp";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663464277314/PDrvRmzeSMQSyfVJgge7rA/tgs-dashboard-mockup-MyaY7cGG3VrYPHSwLse2sx.webp";
const MELBOURNE_ROAD = "https://d2xsxph8kpxj0f.cloudfront.net/310519663464277314/PDrvRmzeSMQSyfVJgge7rA/tgs-melbourne-road-YUht2oGmFYy25jRtN2HNkr.webp";
const AI_ANALYSIS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663464277314/PDrvRmzeSMQSyfVJgge7rA/tgs-ai-analysis-5Ezwpbak3rMCh23gHyn6HT.webp";

const features = [
  { icon: Brain, title: "AI TGS Generator", description: "Automatic compliant traffic guidance scheme creation with smart sign spacing, taper calculations, and cone placement." },
  { icon: Shield, title: "Compliance Engine", description: "Real-time compliance checking against Victorian standards. Detect missing signs, unsafe layouts, and tram corridor conflicts." },
  { icon: Map, title: "Smart Mapping", description: "Interactive road map editor with lane closure tools, auto road direction detection, and tram line overlays using OpenStreetMap." },
  { icon: Camera, title: "AI Photo Analysis", description: "Upload site photos and let AI analyse lane layouts, road widths, existing signage, and hazards automatically." },
  { icon: FileText, title: "PDF Export", description: "Export professional print-ready TGS PDFs with revision history, cloud storage, and client sharing capabilities." },
  { icon: Users, title: "Team Collaboration", description: "Shared workspaces, live editing, approval workflows, and mobile site crew access for seamless teamwork." },
];

const stats = [
  { value: "85%", label: "Faster Plan Creation", icon: Zap },
  { value: "99.2%", label: "Compliance Rate", icon: Target },
  { value: "< 5 min", label: "Average TGS Generation", icon: Clock },
  { value: "500+", label: "Victorian Projects", icon: CheckCircle2 },
];

const testimonials = [
  { quote: "TGS AI Victoria has completely transformed how we approach traffic management planning. What used to take hours now takes minutes.", name: "Mark Thompson", role: "Senior Traffic Engineer", company: "Melbourne Civil Works" },
  { quote: "The compliance engine alone has saved us from countless approval rejections. It catches issues we would have missed.", name: "Sarah Chen", role: "Project Manager", company: "VicRoads Contractor" },
  { quote: "Finally, a traffic management tool that understands Melbourne's tram corridors. The AI suggestions are remarkably accurate.", name: "James Mitchell", role: "Operations Director", company: "Metro Traffic Solutions" },
];

const faqItems = [
  { question: "What Victorian standards does the platform comply with?", answer: "TGS AI Victoria is built to comply with AS 1742.3, VicRoads Code of Practice for Worksite Safety, and all current Victorian traffic management regulations. Our compliance engine is regularly updated as standards evolve." },
  { question: "How does the AI generate traffic guidance schemes?", answer: "Our AI analyses road geometry, traffic conditions, and worksite parameters to automatically generate compliant TGS layouts. It considers sign spacing, taper lengths, buffer zones, and traffic controller positioning based on Victorian standards." },
  { question: "Does it work with Melbourne's tram network?", answer: "Yes. Our platform includes dedicated tram corridor detection and conflict warnings. It automatically identifies tram tracks, overhead wires, and tram stops to ensure your TGS accounts for tram operations." },
  { question: "What mapping technology do you use?", answer: "We use open-source mapping technologies including OpenStreetMap, Leaflet.js, and MapLibre GL JS. This means no expensive Google Maps API costs while still providing detailed road geometry and lane information." },
  { question: "Can I try it before committing to a plan?", answer: "Absolutely. We offer a free trial that includes access to the AI TGS generator, compliance checker, and mapping tools. No credit card required to start." },
  { question: "Is my project data secure?", answer: "All data is encrypted at rest and in transit. We use Australian-hosted cloud infrastructure and comply with Australian Privacy Principles. Your traffic plans and site data remain confidential." },
];

const blogPosts = [
  { title: "New AS 1742.3 Updates: What Traffic Managers Need to Know", category: "Compliance", date: "May 2026", excerpt: "Key changes to Australian Standard 1742.3 and how they affect your traffic guidance schemes in Victoria." },
  { title: "How AI is Transforming Traffic Management Planning", category: "Industry", date: "Apr 2026", excerpt: "From manual CAD drawings to AI-generated compliant plans in minutes — the evolution of TGS creation." },
  { title: "Melbourne Tram Corridor Safety: Best Practices", category: "Safety", date: "Mar 2026", excerpt: "Essential considerations for traffic management near Melbourne's extensive tram network." },
];

const caseStudies = [
  { title: "Swanston St Major Works", client: "Melbourne Civil Works", result: "75% reduction in plan approval time", description: "Complex multi-lane closure adjacent to tram corridor completed with zero compliance rejections." },
  { title: "West Gate Tunnel Approach", client: "VicRoads Contractor", result: "50+ TGS plans generated", description: "Large-scale infrastructure project with AI-assisted traffic management across multiple work zones." },
  { title: "CBD Night Works Program", client: "Metro Traffic Solutions", result: "3x faster turnaround", description: "Overnight road maintenance program using AI photo analysis for rapid site assessment and TGS generation." },
];

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <Layout>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <DashboardPreview />
      <CaseStudiesSection />
      <TestimonialsSection />
      <BlogSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-24 pb-0 overflow-hidden">
      {/* Animated background visuals */}
      <div className="absolute inset-0">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent animate-pulse" />
          <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        {/* Floating particles */}
        <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full bg-orange-400/30 animate-float" />
        <div className="absolute top-40 right-1/3 w-1.5 h-1.5 rounded-full bg-amber-400/20 animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-60 left-2/3 w-1 h-1 rounded-full bg-orange-300/25 animate-float" style={{ animationDelay: '0.8s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-orange-500/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs font-medium text-orange-300">Victorian Standards Compliant</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight max-w-4xl mx-auto">
          AI-Powered Traffic Guidance Schemes{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">for Victoria</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Automatically generate safer, compliant traffic management plans using AI and smart mapping technology.
          Built for Australian roads, designed for Victorian standards.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/app">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold px-8 py-6 text-base rounded-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 active:scale-[0.97]">
              Start Free Trial <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-white/5 hover:text-white px-8 py-6 text-base rounded-lg">
              Book Demo
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> AS 1742.3 Compliant</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> VicRoads Approved</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Open-Source Mapping</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Australian Hosted</span>
        </div>
      </div>

      {/* Dashboard preview */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-4">
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 glow-orange">
          <img src={DASHBOARD_IMG} alt="TGS AI Victoria Dashboard" className="w-full h-auto" loading="lazy" />
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`glass rounded-xl p-6 text-center transition-all duration-500 hover:glow-orange ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <stat.icon className="w-5 h-5 text-orange-400 mx-auto mb-3" />
            <div className="text-2xl sm:text-3xl font-display font-bold text-white">{stat.value}</div>
            <div className="mt-1 text-xs sm:text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Built for <span className="text-orange-400">Victorian Traffic Management</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Purpose-built tools for traffic management companies, civil contractors, councils, and event planners across Victoria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass rounded-xl p-6 group hover:border-orange-500/30 hover:glow-orange transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <feature.icon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="font-display font-semibold text-white text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/features">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg">
              View All Features <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            Professional CAD-Grade<br />
            <span className="text-orange-400">Traffic Planning</span>
          </h2>
          <p className="mt-5 text-gray-400 leading-relaxed">
            Our platform combines the precision of professional CAD software with the intelligence of modern AI.
            Design traffic guidance schemes on real Melbourne road geometry with automatic compliance validation.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Interactive road map editor with lane closure tools",
              "Auto road direction and lane count detection",
              "Tram line overlays and intersection detection",
              "Real-time compliance alerts as you design",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/app">
            <Button className="mt-8 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg shadow-lg shadow-orange-500/20 transition-all duration-200 active:scale-[0.97]">
              Try the Demo <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
          <img src={AI_ANALYSIS} alt="AI Road Analysis" className="w-full h-auto" loading="lazy" />
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Trusted by <span className="text-orange-400">Industry Professionals</span>
          </h2>
          <p className="mt-3 text-gray-400">Real results from traffic management teams across Victoria.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="glass rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-orange-400 text-sm">&#9733;</span>
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">"{t.quote}"</p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="font-semibold text-sm text-white">{t.name}</div>
                <div className="text-xs text-gray-500">{t.role}</div>
                <div className="text-xs text-orange-400/70 mt-0.5">{t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-white pr-4 text-sm">{item.question}</span>
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${openFaq === i ? 'bg-orange-500 text-black' : 'bg-white/5 text-gray-400'}`}>
                  {openFaq === i ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudiesSection() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Case <span className="text-orange-400">Studies</span>
          </h2>
          <p className="mt-3 text-gray-400">Real projects, real results across Victorian roads.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {caseStudies.map((cs, i) => (
            <div key={i} className="glass rounded-xl p-6 group hover:border-orange-500/30 hover:glow-orange transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-semibold">
                  Case Study
                </span>
              </div>
              <h3 className="font-display font-semibold text-white text-lg mb-1">{cs.title}</h3>
              <p className="text-xs text-orange-400/70 mb-3">{cs.client}</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{cs.description}</p>
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300 font-medium">{cs.result}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogSection() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Latest <span className="text-orange-400">Updates</span>
            </h2>
            <p className="mt-2 text-gray-400">Industry news, compliance updates, and platform insights.</p>
          </div>
          <Button variant="outline" className="hidden sm:inline-flex border-gray-700 text-gray-300 hover:bg-white/5 rounded-lg">
            View All <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {blogPosts.map((post, i) => (
            <article key={i} className="glass rounded-xl overflow-hidden group hover:border-orange-500/30 transition-all duration-300 cursor-pointer">
              <div className="h-32 bg-gradient-to-br from-orange-500/5 to-amber-500/5 flex items-center justify-center border-b border-white/5">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-orange-400 font-semibold">{post.category}</span>
                  <span className="text-[10px] text-gray-600">{post.date}</span>
                </div>
                <h3 className="font-display font-semibold text-white text-sm mb-2 leading-snug">{post.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto relative rounded-2xl overflow-hidden">
        <img src={MELBOURNE_ROAD} alt="" className="w-full h-72 md:h-80 object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 flex flex-col items-center justify-center text-center px-6">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-white leading-tight">
            Ready to modernise your traffic planning?
          </h2>
          <p className="mt-3 text-white/70 max-w-lg">
            Join hundreds of Victorian traffic management professionals already using AI-powered TGS generation.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link href="/app">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg shadow-lg shadow-orange-500/30 transition-all duration-200 active:scale-[0.97]">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 rounded-lg">
                Book Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
