import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, ChevronRight, HelpCircle } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "For individual traffic controllers and small teams getting started.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    popular: false,
    cta: "Start Free Trial",
    features: [
      "Up to 5 TGS plans/month",
      "Basic compliance checking",
      "OpenStreetMap integration",
      "PDF export (standard)",
      "1 team member",
      "5 GB cloud storage",
      "Email support",
      "Basic sign library",
    ],
  },
  {
    name: "Professional",
    description: "For traffic management companies and civil contractors.",
    monthlyPrice: 149,
    yearlyPrice: 119,
    popular: true,
    cta: "Start Free Trial",
    features: [
      "Unlimited TGS plans",
      "Full compliance engine",
      "AI TGS generation",
      "AI photo analysis",
      "PDF export (branded)",
      "Up to 10 team members",
      "50 GB cloud storage",
      "Priority support",
      "Advanced sign library",
      "Tram corridor detection",
      "Approval workflows",
      "Revision history",
    ],
  },
  {
    name: "Enterprise",
    description: "For councils, utilities, and large organisations with custom needs.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    cta: "Contact Sales",
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "Unlimited cloud storage",
      "Custom integrations",
      "API access",
      "Dedicated account manager",
      "Custom branding",
      "SSO / SAML authentication",
      "SLA guarantees",
      "On-premise deployment option",
      "Custom compliance rules",
      "Training & onboarding",
    ],
  },
];

const comparisonRows = [
  { feature: "TGS Plans", starter: "5/month", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "AI Generation", starter: "—", pro: "Included", enterprise: "Included" },
  { feature: "Compliance Engine", starter: "Basic", pro: "Full", enterprise: "Custom Rules" },
  { feature: "Team Members", starter: "1", pro: "10", enterprise: "Unlimited" },
  { feature: "Cloud Storage", starter: "5 GB", pro: "50 GB", enterprise: "Unlimited" },
  { feature: "PDF Export", starter: "Standard", pro: "Branded", enterprise: "Custom" },
  { feature: "Support", starter: "Email", pro: "Priority", enterprise: "Dedicated" },
  { feature: "API Access", starter: "—", pro: "—", enterprise: "Included" },
  { feature: "Tram Detection", starter: "—", pro: "Included", enterprise: "Included" },
  { feature: "Photo Analysis", starter: "—", pro: "Included", enterprise: "Included" },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Simple, transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">pricing</span>
          </h1>
          <p className="mt-5 text-gray-400 text-lg max-w-xl mx-auto">
            Choose the plan that fits your team. All plans include a 14-day free trial.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isYearly ? 'bg-orange-500' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isYearly ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>Yearly</span>
            {isYearly && <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">Save 20%</span>}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={i}
                className={`rounded-2xl p-7 flex flex-col transition-all duration-300 ${plan.popular ? 'glass border-orange-500/30 glow-orange-strong relative' : 'glass hover:border-orange-500/20'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                </div>
                <div className="mt-5">
                  {price === 0 ? (
                    <span className="text-3xl font-display font-bold text-white">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-display font-bold text-white">A${price}</span>
                      <span className="text-gray-500 text-sm ml-1">/month</span>
                      {isYearly && <span className="text-xs text-gray-600 ml-1">(billed yearly)</span>}
                    </>
                  )}
                </div>
                <div className="mt-6">
                  <Link href={plan.cta === "Contact Sales" ? "/contact" : "/app"}>
                    <Button className={`w-full rounded-lg font-semibold transition-all duration-200 active:scale-[0.97] ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                      {plan.cta} {plan.cta !== "Contact Sales" && <ChevronRight className="ml-1 w-4 h-4" />}
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 pt-5 border-t border-white/5 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold mb-3">Includes</p>
                  <ul className="space-y-2.5">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-white text-center mb-10">Feature Comparison</h2>
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Feature</th>
                    <th className="text-center px-5 py-4 text-gray-400 font-medium">Starter</th>
                    <th className="text-center px-5 py-4 text-orange-400 font-medium">Professional</th>
                    <th className="text-center px-5 py-4 text-gray-400 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3 text-gray-300">{row.feature}</td>
                      <td className="px-5 py-3 text-center text-gray-500">{row.starter}</td>
                      <td className="px-5 py-3 text-center text-white font-medium">{row.pro}</td>
                      <td className="px-5 py-3 text-center text-gray-300">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <HelpCircle className="w-8 h-8 text-orange-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white">Questions about pricing?</h2>
          <p className="mt-3 text-gray-400">Our team is happy to help you find the right plan for your organisation.</p>
          <Link href="/contact">
            <Button variant="outline" className="mt-6 border-gray-700 text-gray-300 hover:bg-white/5 rounded-lg">
              Contact Sales
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
