import { useState, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Building2,
  MessageSquare,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  const [formType, setFormType] = useState<"demo" | "inquiry">("demo");
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent successfully! We'll be in touch within 24 hours.");
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    submitMutation.mutate({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      formType,
      topic: formData.get("topic") as string,
      message: (formData.get("message") as string) || undefined,
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Get in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Touch</span>
          </h1>
          <p className="mt-5 text-gray-400 text-lg max-w-xl mx-auto">
            Ready to modernise your traffic management workflow? Book a demo or send us an inquiry.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-6 md:p-8">
              {/* Form Type Toggle */}
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => { setFormType("demo"); setSubmitted(false); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${formType === "demo" ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Book a Demo
                </button>
                <button
                  onClick={() => { setFormType("inquiry"); setSubmitted(false); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${formType === "inquiry" ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                  <Building2 className="w-4 h-4" /> Industry Inquiry
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400 text-sm">We'll get back to you within 24 hours.</p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="mt-6 border-gray-700 text-gray-300 hover:bg-white/5"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">First Name *</label>
                      <input
                        name="firstName"
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Last Name *</label>
                      <input
                        name="lastName"
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                      placeholder="john@company.com.au"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Company *</label>
                    <input
                      name="company"
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      {formType === "demo" ? "What would you like to see in the demo?" : "How can we help?"}
                    </label>
                    <select
                      name="topic"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                    >
                      {formType === "demo" ? (
                        <>
                          <option value="general">General platform overview</option>
                          <option value="ai">AI TGS generation</option>
                          <option value="compliance">Compliance engine</option>
                          <option value="mapping">Mapping tools</option>
                          <option value="team">Team collaboration</option>
                        </>
                      ) : (
                        <>
                          <option value="pricing">Pricing inquiry</option>
                          <option value="enterprise">Enterprise plan</option>
                          <option value="integration">Custom integration</option>
                          <option value="partnership">Partnership opportunity</option>
                          <option value="other">Other</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors resize-none"
                      placeholder={formType === "demo" ? "Tell us about your team and what you're looking for..." : "Describe your inquiry..."}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold rounded-lg py-5 shadow-lg shadow-orange-500/20 transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
                  >
                    {submitMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" /> {formType === "demo" ? "Request Demo" : "Send Inquiry"}</>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-white mb-5">Contact Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-white">hello@tgsai.com.au</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-white">+61 3 9000 0000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-white">Level 12, 456 Collins Street<br />Melbourne VIC 3000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Business Hours</p>
                    <p className="text-sm text-white">Mon - Fri: 8:00 AM - 6:00 PM AEST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-white mb-3">Support</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Existing customers can access support through the platform dashboard or email our support team directly.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>In-app support chat</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Knowledge base & documentation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Priority support for Pro & Enterprise</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-white mb-3">Location</h3>
              <div className="rounded-lg overflow-hidden border border-white/10 h-40 bg-[#0f1012] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Melbourne CBD, Victoria</p>
                  <p className="text-[10px] text-gray-600 mt-1">OpenStreetMap integration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
