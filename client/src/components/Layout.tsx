import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/app", label: "App" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-strong shadow-lg shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-black font-bold text-xs">TGS</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-white leading-tight">TGS AI</span>
            <span className="text-[10px] text-orange-400 font-medium leading-tight tracking-wide">VICTORIA</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <span className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === link.href ? 'text-orange-400 bg-orange-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/contact">
            <Button variant="outline" className="hidden sm:inline-flex rounded-md border-gray-700 text-gray-300 hover:bg-white/5 hover:text-white text-sm">
              Book Demo
            </Button>
          </Link>
          <Link href="/app">
            <Button className="rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold text-sm hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/20 transition-all duration-200 active:scale-[0.97]">
              Start Free Trial <ChevronRight className="ml-1 w-3.5 h-3.5" />
            </Button>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-white/5 text-gray-400"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden glass-strong border-t border-white/5 px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium ${location === link.href ? 'text-orange-400 bg-orange-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0d0d0f] py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <span className="text-black font-bold text-xs">TGS</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-white leading-tight">TGS AI</span>
              <span className="text-[10px] text-orange-400 font-medium leading-tight tracking-wide">VICTORIA</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Smarter Traffic Management Starts Here. AI-powered traffic guidance schemes for Victorian roads.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Victorian Compliant
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm text-white mb-4">Platform</h4>
          <ul className="space-y-2.5">
            <li><Link href="/features"><span className="text-sm text-gray-500 hover:text-orange-400 transition-colors">Features</span></Link></li>
            <li><Link href="/app"><span className="text-sm text-gray-500 hover:text-orange-400 transition-colors">Launch App</span></Link></li>
            <li><Link href="/pricing"><span className="text-sm text-gray-500 hover:text-orange-400 transition-colors">Pricing</span></Link></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">API Docs</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm text-white mb-4">Company</h4>
          <ul className="space-y-2.5">
            <li><Link href="/about"><span className="text-sm text-gray-500 hover:text-orange-400 transition-colors">About Us</span></Link></li>
            <li><Link href="/contact"><span className="text-sm text-gray-500 hover:text-orange-400 transition-colors">Contact</span></Link></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">Blog</a></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm text-white mb-4">Compliance</h4>
          <ul className="space-y-2.5">
            <li><a href="#" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">AS 1742.3</a></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">VicRoads Standards</a></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} TGS AI Victoria. All rights reserved.</p>
        <p className="text-xs text-gray-600">Melbourne, Victoria, Australia</p>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid bg-noise">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
