import React, { useState } from "react";
import { HelpCircle, Mail, Phone, BookOpen, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

export default function Feedback() {
  const [activeTab, setActiveTab] = useState<"faq" | "about" | "contact" | "terms">("faq");
  
  // Contact Us state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Feedback");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // FAQ Expand state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is Kaviyam Reading platform?",
      a: "Kaviyam Reading is a warm, elegant platform built for literary enthusiasts. It offers classic and preset fantasy, sci-fi, and mystery novels, and lets users craft custom multi-chapter stories dynamically in collaboration with Gemini AI."
    },
    {
      q: "How does the AI Novel Builder work?",
      a: "By feeding a prompt, theme, or character seed into our AI Builder, server-side APIs contact Gemini 3.5 Flash. It constructs a cohesive title, summary, chapter headings, and fully-formed literary text, compiling it directly into a readable book format for you."
    },
    {
      q: "Is my account authentication fully secure?",
      a: "Yes! While this sandbox environment simulates email-based verification, password resets, and 2FA tokens directly inside your Simulated Mailbox, the authentication layer employs robust JWT encryption and industry-standard security practices to prevent credential spoofing."
    },
    {
      q: "Can I manage active sessions or view security history?",
      a: "Absolutely. Under the 'Security & Login' profile settings, you can check active login IP logs, inspect which devices are currently authenticated, set up 2FA, or terminate external mobile/desktop browser sessions instantly."
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8e2cf] p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 text-left" id="feedback-root">
      {/* Sidebar navigation */}
      <div className="md:col-span-3 space-y-2">
        <h3 className="font-serif font-bold text-stone-800 text-sm px-3 mb-2">Help & Legal</h3>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "faq" ? "bg-[#faf6e8] text-stone-800 border-l-4 border-l-[#d4af37]" : "text-stone-500 hover:bg-stone-50"
            }`}
            id="help-tab-faq"
          >
            <HelpCircle size={14} />
            FAQ / Help Center
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "about" ? "bg-[#faf6e8] text-stone-800 border-l-4 border-l-[#d4af37]" : "text-stone-500 hover:bg-stone-50"
            }`}
            id="help-tab-about"
          >
            <BookOpen size={14} />
            About Our Mission
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "contact" ? "bg-[#faf6e8] text-stone-800 border-l-4 border-l-[#d4af37]" : "text-stone-500 hover:bg-stone-50"
            }`}
            id="help-tab-contact"
          >
            <Mail size={14} />
            Contact Us Form
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "terms" ? "bg-[#faf6e8] text-stone-800 border-l-4 border-l-[#d4af37]" : "text-stone-500 hover:bg-stone-50"
            }`}
            id="help-tab-terms"
          >
            <ShieldCheck size={14} />
            Terms & Privacy
          </button>
        </nav>
      </div>

      {/* Main help content area */}
      <div className="md:col-span-9 bg-[#fdfdfc] p-6 rounded-xl border border-[#f3eee0]">
        {activeTab === "faq" && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-stone-800 border-b border-[#f3eee0] pb-2">
              Frequently Asked Questions (FAQ)
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={idx} className="border border-[#e8e2cf] rounded-xl bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-4 flex justify-between items-center text-left text-xs font-bold text-stone-800 hover:bg-stone-50 transition"
                      id={`faq-accordion-${idx}`}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={14} className="text-[#d4af37]" /> : <ChevronDown size={14} />}
                    </button>
                    {isOpen && (
                      <div className="p-4 border-t border-[#e8e2cf] text-xs text-stone-600 leading-relaxed bg-[#fcfbfa]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-4 text-xs text-stone-600 leading-relaxed font-serif">
            <h3 className="font-serif text-lg font-semibold text-stone-800 border-b border-[#f3eee0] pb-2 font-sans">
              About Kaviyam Reading
            </h3>
            <p>
              Welcome to <strong>Kaviyam Reading</strong>, a literary platform born out of deep respect for written words.
              Our mission is to combine the warmth of classical publishing with cutting-edge AI capabilities, making reading interactive and customizable.
            </p>
            <p>
              We believe every reader harbors unique fantasy worlds, romance dreams, and sci-fi mysteries. By putting the Gemini LLM directly in your hands, we let you become both the catalog patron and the creative novelist.
            </p>
            <div className="bg-amber-50/60 p-4 border border-amber-100 rounded-xl font-sans text-stone-700 mt-4">
              <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-stone-800">Our Core Principles:</h4>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Atmospheric Design:</strong> Paper-like canvases and rich serif typography that rest the eyes.</li>
                <li><strong>Security Integrity:</strong> Transparent logs and simulated 2FA that teach modern secure design.</li>
                <li><strong>AI Assistance:</strong> Utilizing Google Gemini as an interactive, helper partner, never a cheap text replacer.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-stone-800 border-b border-[#f3eee0] pb-2">
              Contact Support & Editorial Team
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Have feedback, a copyright report, or a business query? Fill out our form below, and we will reply to your simulated inbox!
            </p>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                Thank you! Your feedback message has been received. We have sent a simulated acknowledgment message to your inbox.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 border border-[#e8e2cf] bg-white rounded-lg focus:outline-none focus:border-[#d4af37]"
                      id="contact-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3 py-2 border border-[#e8e2cf] bg-white rounded-lg focus:outline-none focus:border-[#d4af37]"
                      id="contact-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e8e2cf] bg-white rounded-lg focus:outline-none focus:border-[#d4af37]"
                    id="contact-subject-select"
                  >
                    <option value="General Feedback">General Feedback</option>
                    <option value="Feature Request">AI Novel Feature Request</option>
                    <option value="Security Report">Security Vulnerability / Audits</option>
                    <option value="Other">Other Business Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Detailed Message</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your query in full..."
                    className="w-full px-3 py-2 border border-[#e8e2cf] bg-white rounded-lg focus:outline-none focus:border-[#d4af37]"
                    id="contact-message-textarea"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#d4af37] hover:bg-[#c19b2e] text-black font-semibold px-4 py-2 rounded-lg transition"
                  id="contact-submit-btn"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === "terms" && (
          <div className="space-y-4 text-xs text-stone-600 leading-relaxed font-serif max-h-[400px] overflow-y-auto pr-2">
            <h3 className="font-serif text-lg font-semibold text-stone-800 border-b border-[#f3eee0] pb-2 font-sans">
              Terms & Conditions & Privacy Policy
            </h3>
            
            <h4 className="font-sans font-bold text-stone-800 mt-4">1. Agreement to Terms</h4>
            <p>
              By accessing our platform (Kaviyam Reading), you agree to be bound by these legal terms. We simulate standard registration patterns to ensure educational clarity on security audits, CAPTCHAs, and Two-Factor Authentication.
            </p>

            <h4 className="font-sans font-bold text-stone-800 mt-4">2. AI Story Content Generation</h4>
            <p>
              AI generated stories are processed using Gemini large language models. The prompt you provide is securely sent through server-side proxy routes. You own the copyright to the creative results generated inside your workspace, but agree to utilize the AI system responsibly.
            </p>

            <h4 className="font-sans font-bold text-stone-800 mt-4">3. Data Integrity & Privacy</h4>
            <p>
              We prioritize privacy. The username, DOB, phone numbers, and profile photos entered here are strictly managed and stored within your private sandboxed container state. PII information is never exposed to public internet endpoints or unauthenticated client scrapers.
            </p>

            <h4 className="font-sans font-bold text-stone-800 mt-4">4. Account Termination</h4>
            <p>
              Administrators reserve the right to temporarily block, unblock, or permanently purge account databases if continuous login failures trigger safety lockout guards or malicious prompt injections are detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
