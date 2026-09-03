import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Ticket,
  ShieldCheck,
  Compass,
  Zap,
  Calendar,
  Users,
  Building2,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  ScanLine,
  Layers,
  Wallet,
  Globe,
  Star,
  Award
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { USER_ROUTES, VENDOR_ROUTES, COMMON_ROUTES } from "../../constants/Routes";
import heroBg from "../../assets/landing-page-party.jpg";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const AboutUs = () => {
  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-[#070514] text-white min-h-screen font-sans selection:bg-purple-500/30 selection:text-white overflow-x-hidden flex flex-col">
      {/* Platform Navigation Bar */}
      <Navbar />

      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-20 left-1/3 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[150px]" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 pt-24 pb-12">
        
        {/* ======================================================== */}
        {/* 1. HERO SECTION */}
        {/* ======================================================== */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 text-center px-4 sm:px-6 max-w-6xl mx-auto">
          
          {/* Subtle Background Backdrop */}
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-25 pointer-events-none rounded-3xl"
            style={{
              backgroundImage: `url(${heroBg})`,
              maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 75%)",
            }}
          />

          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(147,51,234,0.15)] animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-purple-300 font-bold">
              About Festivo Platform
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-white">
            Discover. Book. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400">
              Experience.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            Festivo is the premier destination for live experiences. We make discovering,
            booking, and hosting events effortless, secure, and thrilling — connecting passionate
            creators with enthusiastic audiences worldwide.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={USER_ROUTES.EXPLORE}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer group"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to={VENDOR_ROUTES.APPLICATION}
              className="px-8 py-4 bg-[#110D27]/80 hover:bg-[#1C163C] border border-purple-500/30 text-zinc-200 hover:text-white font-extrabold text-sm rounded-2xl transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer shadow-lg hover:border-purple-400"
            >
              <span>Host with Us</span>
            </Link>
          </div>
        </section>


        {/* ======================================================== */}
        {/* 2. ABOUT OUR PLATFORM */}
        {/* ======================================================== */}
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="bg-[#0B081E]/80 border border-white/10 rounded-3xl p-8 sm:p-12 lg:p-14 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            
            {/* Subtle Gradient Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Platform Story */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
                  <Globe className="w-4 h-4" /> Next-Gen Event Tech
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Connecting Event Organizers with Audiences
                </h2>
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                  Festivo brings together the entire live entertainment ecosystem onto a single,
                  intuitive platform. Whether you are searching for electrifying music festivals,
                  high-impact tech conferences, creative workshops, or regional community gatherings,
                  we provide the bridge from discovery to admission.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300">
                      <strong className="text-white">Seamless Discovery:</strong> Filter by categories, dates, and top cities with real-time ticket availability.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300">
                      <strong className="text-white">Secure Ticketing:</strong> Encrypted payments with instant digital QR code tokens delivered to your wallet.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300">
                      <strong className="text-white">Vendor Empowerment:</strong> Comprehensive tools for organizers to configure tiers, manage capacity, and track sales.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Platform Visual Showcase */}
              <div className="lg:col-span-5">
                <div className="relative">
                  {/* Decorative glowing card */}
                  <div className="bg-gradient-to-tr from-[#161138] to-[#0D0924] border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-5 relative">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black">
                          F
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Festivo Experience</div>
                          <div className="text-[11px] text-zinc-400 font-medium">Verified Live Ecosystem</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5">
                        <div className="text-[11px] font-medium text-zinc-400">Entry Speed</div>
                        <div className="text-lg font-black text-white mt-1">&lt; 2.5s</div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">QR Gate Scan</div>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5">
                        <div className="text-[11px] font-medium text-zinc-400">Payment Safety</div>
                        <div className="text-lg font-black text-white mt-1">100%</div>
                        <div className="text-[10px] text-purple-400 mt-0.5">Encrypted Escrow</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-center gap-3">
                      <Award className="w-6 h-6 text-purple-400 shrink-0" />
                      <div className="text-xs text-zinc-300 leading-snug">
                        Trusted by top venues, concert organizers, and thousands of attendees.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ======================================================== */}
        {/* 3. WHY CHOOSE US (4 FEATURE CARDS) */}
        {/* ======================================================== */}
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
              <Star className="w-4 h-4" /> The Festivo Advantage
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Choose Us
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-2">
              Designed from the ground up to give event-goers and organizers a friction-free experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: Easy Ticket Booking */}
            <div className="bg-[#0B081E]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 group-hover:bg-purple-600/30 transition-all shadow-[0_0_15px_rgba(147,51,234,0.2)]">
                  <Ticket className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  Easy Ticket Booking
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Browse ticket tiers, select quantities, and complete reservations in seconds with instant digital ticket passes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-bold text-purple-400 flex items-center gap-1">
                <span>Instant confirmation</span>
              </div>
            </div>

            {/* Feature 2: Secure Payments */}
            <div className="bg-[#0B081E]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 group-hover:bg-indigo-600/30 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  Secure Payments
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Industry-standard encrypted transactions, multi-method payment gateway integration, and automatic wallet refunds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                <span>Bank-grade security</span>
              </div>
            </div>

            {/* Feature 3: Discover Great Events */}
            <div className="bg-[#0B081E]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 group-hover:bg-violet-600/30 transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  Discover Great Events
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Explore curated listings across music, technology, food, sports, arts, and business in your favorite cities.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-bold text-violet-400 flex items-center gap-1">
                <span>Curated recommendations</span>
              </div>
            </div>

            {/* Feature 4: Fast & Simple Experience */}
            <div className="bg-[#0B081E]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-110 group-hover:bg-rose-600/30 transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">
                  Fast & Simple Experience
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Lightning-fast interface, frictionless ticket management, and QR scanner entry for zero gate waiting times.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <span>Zero queue entry</span>
              </div>
            </div>

          </div>
        </section>


        {/* ======================================================== */}
        {/* 4. FOR EVENT ORGANIZERS */}
        {/* ======================================================== */}
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-[#140E31] via-[#0E0A24] to-[#070514] border border-purple-500/25 rounded-3xl p-8 sm:p-12 lg:p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            
            {/* Background Light Orbs */}
            <div className="absolute -top-10 -right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-3xl mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Building2 className="w-3.5 h-3.5" /> For Event Organizers & Vendors
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Turn Your Event Ideas Into Sold-Out Realities
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Festivo provides enterprise-grade tools for independent creators, production houses,
                and large venues to launch, sell, and scale live events seamlessly.
              </p>
            </div>

            {/* 5 Key Vendor Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              
              <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Create Custom Events</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Design beautiful event pages with rich descriptions, banner photos, venue details, and schedules.
                </p>
              </div>

              <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Manage Ticket Tiers</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Configure VIP, Early Bird, and General Admission pricing tiers with independent inventory limits.
                </p>
              </div>

              <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Track Live Bookings</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Monitor real-time reservations, ticket velocities, and customer demographic insights instantly.
                </p>
              </div>

              <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <ScanLine className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Gate Scanner Entry</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Validate attendees in real time using the built-in mobile camera QR code scanner with audio cues.
                </p>
              </div>

              <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <Wallet className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Monitor Earnings & Wallet</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Enjoy transparent platform commissions, earnings tracking, and direct bank withdrawal payouts.
                </p>
              </div>

              <div className="p-5 bg-purple-600/10 border border-purple-500/30 rounded-2xl backdrop-blur-sm flex flex-col justify-center">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-1">Ready to host?</div>
                <p className="text-zinc-300 text-xs mb-3">
                  Join our curated network of event creators and start selling in minutes.
                </p>
                <Link
                  to={VENDOR_ROUTES.APPLICATION}
                  className="text-xs font-extrabold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 group"
                >
                  <span>Apply for vendor access</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>

            {/* Organizer CTA Button */}
            <div>
              <Link
                to={VENDOR_ROUTES.APPLICATION}
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:scale-[1.02] cursor-pointer"
              >
                <span>Become an Organizer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>


        {/* ======================================================== */}
        {/* 5. OUR MISSION */}
        {/* ======================================================== */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="bg-[#09071A]/80 border border-white/5 rounded-3xl p-8 sm:p-14 backdrop-blur-md relative overflow-hidden shadow-xl">
            
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-6 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>

            <h2 className="text-xs uppercase font-bold text-purple-400 tracking-widest mb-3">
              Our Core Purpose
            </h2>

            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-snug mb-8">
              “To connect people through unforgettable moments by making live events effortless to discover, simple to book, and inspiring to host.”
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left pt-6 border-t border-white/5">
              <div className="p-3">
                <div className="text-xs font-bold text-white mb-1">Effortless Discovery</div>
                <div className="text-[12px] text-zinc-400">Curating the finest local and international live experiences.</div>
              </div>
              <div className="p-3">
                <div className="text-xs font-bold text-white mb-1">Instant Booking</div>
                <div className="text-[12px] text-zinc-400">Removing friction from ticketing with secure 1-click checkout.</div>
              </div>
              <div className="p-3">
                <div className="text-xs font-bold text-white mb-1">Creator Growth</div>
                <div className="text-[12px] text-zinc-400">Giving organizers powerful tools to reach and delight fans.</div>
              </div>
              <div className="p-3">
                <div className="text-xs font-bold text-white mb-1">Memorable Moments</div>
                <div className="text-[12px] text-zinc-400">Fostering shared human connection through the magic of live events.</div>
              </div>
            </div>

          </div>
        </section>


        {/* ======================================================== */}
        {/* 6. STATISTICS SECTION */}
        {/* ======================================================== */}
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Stat 1 */}
            <div className="bg-[#0B081E]/80 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md shadow-lg hover:border-purple-500/30 transition-all">
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
                1,000+
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-200">Events Hosted</div>
              <div className="text-[11px] text-zinc-500 mt-1">Concerts, summits & expos</div>
            </div>

            {/* Stat 2 */}
            <div className="bg-[#0B081E]/80 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md shadow-lg hover:border-purple-500/30 transition-all">
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
                25K+
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-200">Active Users</div>
              <div className="text-[11px] text-zinc-500 mt-1">Passionate event-goers</div>
            </div>

            {/* Stat 3 */}
            <div className="bg-[#0B081E]/80 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md shadow-lg hover:border-purple-500/30 transition-all">
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
                500+
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-200">Verified Organizers</div>
              <div className="text-[11px] text-zinc-500 mt-1">Leading brands & creators</div>
            </div>

            {/* Stat 4 */}
            <div className="bg-[#0B081E]/80 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md shadow-lg hover:border-purple-500/30 transition-all">
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
                50K+
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-200">Tickets Booked</div>
              <div className="text-[11px] text-zinc-500 mt-1">100% verified entries</div>
            </div>

          </div>
        </section>


        {/* ======================================================== */}
        {/* 7. CALL TO ACTION (CTA) */}
        {/* ======================================================== */}
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-[#170E3A] via-[#100B2B] to-[#09061C] border border-purple-500/30 rounded-3xl p-10 sm:p-16 text-center backdrop-blur-2xl shadow-[0_0_60px_rgba(124,58,237,0.15)] relative overflow-hidden">
            
            {/* Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Start Your Journey
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Your Next Experience Starts Here.
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Join thousands of attendees discovering live concerts, creative summits, and exclusive gatherings every single week.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to={USER_ROUTES.EXPLORE}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:scale-[1.03] flex items-center gap-2.5 cursor-pointer group"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to={COMMON_ROUTES.SIGNUP}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-2xl transition-all backdrop-blur-md cursor-pointer hover:border-purple-400"
                >
                  <span>Create an Account</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Platform Footer */}
      <Footer />
    </div>
  );
};

export default AboutUs;
