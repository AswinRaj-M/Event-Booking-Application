import React, { useState, useMemo } from "react";
import {
  Search,
  Ticket,
  CreditCard,
  User,
  Calendar,
  ShieldCheck,
  Wrench,
  ChevronDown,
  Sparkles,
  Headphones,
  ArrowRight,
  HelpCircle,
  X,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { toast } from "sonner";

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Category definitions
  const categories = [
    {
      id: "booking",
      title: "Booking & Tickets",
      icon: Ticket,
      color: "text-purple-400 bg-purple-600/20 border-purple-500/30",
      description: "Learn how to select seats, reserve tickets, view digital passes, and manage your event bookings."
    },
    {
      id: "payments",
      title: "Payments & Refunds",
      icon: CreditCard,
      color: "text-indigo-400 bg-indigo-600/20 border-indigo-500/30",
      description: "Understand payment methods, billing safety, pricing tiers, and automated refund processing."
    },
    {
      id: "account",
      title: "Account & Profile",
      icon: User,
      color: "text-violet-400 bg-violet-600/20 border-violet-500/30",
      description: "Manage your profile details, password security, email verification, and notification settings."
    },
    {
      id: "events",
      title: "Events",
      icon: Calendar,
      color: "text-fuchsia-400 bg-fuchsia-600/20 border-fuchsia-500/30",
      description: "Information about event schedules, venue entries, organizer policies, and status updates."
    },
    {
      id: "security",
      title: "Security",
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-600/20 border-emerald-500/30",
      description: "Learn about account privacy, encrypted checkout, QR gate verification, and safety guidelines."
    },
    {
      id: "other",
      title: "Other Issues",
      icon: Wrench,
      color: "text-rose-400 bg-rose-600/20 border-rose-500/30",
      description: "Technical troubleshooting, app navigation help, feature feedback, and general assistance."
    }
  ];

  // FAQ list
  const faqs = [
    {
      id: "faq-1",
      category: "booking",
      categoryName: "Booking & Tickets",
      question: "How do I book an event?",
      answer: "To book an event, navigate to the Explore Events page, select your desired event, choose your preferred ticket tier and quantity, and click 'Proceed to Checkout'. Follow the secure payment steps. Upon completion, your digital ticket QR code pass will be immediately generated and accessible under 'My Tickets'."
    },
    {
      id: "faq-2",
      category: "booking",
      categoryName: "Booking & Tickets",
      question: "Where can I find my tickets?",
      answer: "All your confirmed event tickets are stored securely in your account. Simply click on 'My Bookings' or 'My Tickets' in the top navigation bar. You will see a complete list of your upcoming and past events, along with booking reference IDs, event schedules, and entry QR codes."
    },
    {
      id: "faq-3",
      category: "payments",
      categoryName: "Payments & Refunds",
      question: "How do I cancel my booking?",
      answer: "You can initiate a cancellation by navigating to the 'My Bookings' page, selecting the active booking you wish to cancel, and clicking 'Cancel Booking'. Please note that cancellations are subject to the event organizer's policy and cut-off deadlines."
    },
    {
      id: "faq-4",
      category: "payments",
      categoryName: "Payments & Refunds",
      question: "How does the refund process work?",
      answer: "Once an eligible cancellation request is confirmed, the refund amount is automatically credited back to your Festivo User Wallet or your original payment method within 3 to 5 business days. You can monitor your balance and transaction history on your Wallet page."
    },
    {
      id: "faq-5",
      category: "security",
      categoryName: "Security",
      question: "How do I use my QR ticket?",
      answer: "On the day of the event, open your Festivo app, navigate to 'My Tickets', and present the dynamic QR code pass to the gate staff at the entrance. The venue scanner will instantly validate your entry for quick, queue-free access."
    },
    {
      id: "faq-6",
      category: "events",
      categoryName: "Events",
      question: "What happens if an event is cancelled?",
      answer: "If an event is cancelled by the organizer, all registered attendees will receive immediate email and in-app notifications. A 100% full refund will be automatically credited directly to your Festivo Wallet without requiring any manual action."
    },
    {
      id: "faq-7",
      category: "account",
      categoryName: "Account & Profile",
      question: "How do I update my profile or reset my password?",
      answer: "Go to your Profile settings by clicking on your user avatar or profile link in the top menu. From there, you can edit your name, contact details, profile picture, and access the 'Change Password' option to keep your account safe."
    },
    {
      id: "faq-8",
      category: "other",
      categoryName: "Other Issues",
      question: "Is there a limit on how many tickets I can purchase?",
      answer: "Ticket purchase limits are configured by individual event organizers to ensure fair availability for all fans. The maximum allowed quantity per order is clearly shown during the ticket selection step before checkout."
    }
  ];

  // Filter FAQs based on active category and search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleContactSupportClick = () => {
    toast.info("Support Team Contacted", {
      description: "This is a UI demonstration. For urgent inquiries, please check the FAQ section above.",
      icon: <Headphones className="w-5 h-5 text-purple-400" />
    });
  };

  const handleCategorySelect = (categoryId) => {
    if (activeCategory === categoryId) {
      setActiveCategory("all");
    } else {
      setActiveCategory(categoryId);
      // Smooth scroll to FAQ section
      const faqSection = document.getElementById("faq-section");
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="bg-[#070514] text-white min-h-screen font-sans selection:bg-purple-500/30 selection:text-white overflow-x-hidden flex flex-col">
      {/* Navbar Header */}
      <Navbar />

      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-20 left-1/3 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[150px]" />
      </div>

      {/* Main Page Content */}
      <main className="relative z-10 flex-1 pt-24 md:pt-28 pb-16">
        
        {/* ======================================================== */}
        {/* 1. HEADER / HERO SECTION */}
        {/* ======================================================== */}
        <section className="relative py-12 md:py-16 text-center px-4 sm:px-6 max-w-5xl mx-auto">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(147,51,234,0.15)] animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-purple-300 font-bold">
              Help & Support Center
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-5 text-white">
            How can we{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400">
              help?
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Find instant answers to common questions about ticket bookings, refunds, account security, and live event experiences.
          </p>

          {/* Search Input UI */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="relative bg-[#0B081E]/90 border border-purple-500/30 focus-within:border-purple-400 focus-within:shadow-[0_0_30px_rgba(147,51,234,0.25)] transition-all duration-300 rounded-2xl p-2 flex items-center backdrop-blur-xl">
              <Search className="w-5 h-5 text-purple-400 shrink-0 ml-3 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base outline-none py-2 pr-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors mr-2 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </section>


        {/* ======================================================== */}
        {/* 2. HELP CATEGORIES SECTION */}
        {/* ======================================================== */}
        <section className="py-10 px-4 sm:px-6 max-w-6xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Help Categories
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Select a topic to explore related questions and guidance.
              </p>
            </div>
            {activeCategory !== "all" && (
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20"
              >
                <span>View All Topics</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const CategoryIcon = cat.icon;
              const isSelected = activeCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`bg-[#0B081E]/80 border rounded-3xl p-6 backdrop-blur-md cursor-pointer transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 shadow-xl ${
                    isSelected
                      ? "border-purple-500 ring-2 ring-purple-500/40 bg-[#130d35]/90"
                      : "border-white/10 hover:border-purple-500/40 hover:bg-[#0E0A24]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${cat.color}`}>
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Active Filter
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                    <span>Explore questions</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

        </section>


        {/* ======================================================== */}
        {/* 3. FREQUENTLY ASKED QUESTIONS (FAQ Accordion UI) */}
        {/* ======================================================== */}
        <section id="faq-section" className="py-12 px-4 sm:px-6 max-w-5xl mx-auto scroll-mt-28">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
              <HelpCircle className="w-4 h-4" /> FAQ Section
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400 text-sm mt-2">
              Everything you need to know about navigating Festivo and managing your event passes.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar justify-start sm:justify-center">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                activeCategory === "all"
                  ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              All Questions ({faqs.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Search Result Feedback */}
          {searchQuery.trim() !== "" && (
            <div className="mb-6 p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between">
              <span>
                Showing <strong>{filteredFaqs.length}</strong> {filteredFaqs.length === 1 ? "result" : "results"} for "{searchQuery}"
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="underline hover:text-white transition-colors cursor-pointer"
              >
                Reset search
              </button>
            </div>
          )}

          {/* Accordion Container */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={faq.id}
                    className={`bg-[#0B081E]/80 border rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300 ${
                      isOpen
                        ? "border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.15)] bg-[#0E0A24]"
                        : "border-white/10 hover:border-purple-500/30"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        <span className="text-base sm:text-lg font-bold text-white leading-snug">
                          {faq.question}
                        </span>
                      </div>
                      <div className={`p-2 rounded-xl bg-white/5 border border-white/5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 bg-purple-600/20 text-purple-400 border-purple-500/30" : "text-zinc-400"}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-zinc-300 text-sm sm:text-base leading-relaxed border-t border-white/5 pt-4 animate-in fade-in duration-200">
                        <p className="mb-3">{faq.answer}</p>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Category: {faq.categoryName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* Empty state if search finds nothing */
              <div className="bg-[#0B081E]/60 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-md">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No matching questions found</h3>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  We couldn't find any questions matching "{searchQuery}". Try revising your search keywords or browse by help category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

        </section>


        {/* ======================================================== */}
        {/* 4. STILL NEED HELP SECTION */}
        {/* ======================================================== */}
        <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#160E36] via-[#0E0927] to-[#070514] border border-purple-500/30 rounded-3xl p-8 sm:p-14 text-center backdrop-blur-2xl shadow-[0_0_50px_rgba(124,58,237,0.15)] relative overflow-hidden">
            
            {/* Ambient Center Orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-lg">
                <Headphones className="w-7 h-7" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Still need help?
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Can't find the answer you're looking for? Our dedicated support team is available 24/7 to assist with your bookings, account settings, and live event inquiries.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleContactSupportClick}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] hover:scale-[1.03] inline-flex items-center gap-2.5 cursor-pointer group"
                >
                  <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Contact Support</span>
                </button>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Existing Footer */}
      <Footer />
    </div>
  );
};

export default HelpSupport;
