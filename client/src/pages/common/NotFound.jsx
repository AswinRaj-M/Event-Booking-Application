import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import gsap from "gsap";
import {
  Home,
  ArrowLeft,
  Ticket,
  Compass,
  Sparkles,
  Calendar,
  QrCode,
  Music,
  Zap,
  Film
} from "lucide-react";
import { COMMON_ROUTES, USER_ROUTES, VENDOR_ROUTES, ADMIN_ROUTES } from "../../constants/Routes";

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user || {});
  const { vendor } = useSelector((state) => state.vendor || {});
  const { admin } = useSelector((state) => state.admin || {});

  const centerRef = useRef(null);
  const ticketsRef = useRef([]);

  // Determine smart home destination based on current authentication role
  const getHomeRoute = () => {
    if (admin?.role === "admin" || admin?.id) {
      return ADMIN_ROUTES.DASHBOARD;
    }
    if (vendor?.role === "vendor" || vendor?.id) {
      return VENDOR_ROUTES.DASHBOARD;
    }
    if (user?.role === "user" || user?.id || user?._id) {
      return USER_ROUTES.HOME;
    }
    return COMMON_ROUTES.LANDING;
  };

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(getHomeRoute());
    }
  };

  // GSAP animation setup with proper React context cleanup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 640;
      const scaleFactor = isMobile ? 0.55 : 1;

      ticketsRef.current.forEach((ticket, i) => {
        if (!ticket) return;

        const targetX = parseFloat(ticket.dataset.targetX || "0") * scaleFactor;
        const targetY = parseFloat(ticket.dataset.targetY || "0") * scaleFactor;
        const targetRot = parseFloat(ticket.dataset.targetRot || "0");
        const floatX = parseFloat(ticket.dataset.floatX || "15") * scaleFactor;
        const floatY = parseFloat(ticket.dataset.floatY || "20") * scaleFactor;
        const duration = parseFloat(ticket.dataset.duration || "4");

        const tl = gsap.timeline();

        // 1. Initial burst out from behind 404
        tl.fromTo(
          ticket,
          {
            x: 0,
            y: 0,
            scale: 0.15,
            opacity: 0,
            rotation: 0,
          },
          {
            x: targetX,
            y: targetY,
            scale: isMobile ? 0.75 : 1,
            opacity: 1,
            rotation: targetRot,
            duration: 1.3,
            delay: 0.15 + i * 0.1,
            ease: "back.out(1.5)",
            onComplete: () => {
              // 2. Continuous floating animation loop
              gsap.to(ticket, {
                x: `+=${floatX}`,
                y: `+=${floatY}`,
                rotation: `+=${targetRot >= 0 ? 8 : -8}`,
                duration: duration,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              });
            },
          }
        );
      });
    }, centerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#05030e] text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-purple-600/30">
      
      {/* Background Ambient Glows */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-gradient-to-tr from-purple-900/25 via-indigo-900/20 to-fuchsia-900/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" 
        style={{ animationDuration: "7s" }} 
      />
      <div 
        className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-violet-950/20 rounded-full blur-[120px] pointer-events-none -z-10" 
      />
      <div 
        className="absolute top-10 left-10 w-[300px] h-[300px] bg-indigo-950/20 rounded-full blur-[100px] pointer-events-none -z-10" 
      />

      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f143d15_1px,transparent_1px),linear-gradient(to_bottom,#1f143d15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10" />

      {/* Floating Particle Elements */}
      <div className="absolute top-20 left-[15%] text-purple-500/20 animate-bounce pointer-events-none hidden sm:block" style={{ animationDuration: "5s" }}>
        <Ticket className="w-8 h-8 rotate-12" />
      </div>
      <div className="absolute bottom-24 left-[20%] text-indigo-500/20 animate-bounce pointer-events-none hidden sm:block" style={{ animationDuration: "6s", animationDelay: "1s" }}>
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="absolute top-28 right-[18%] text-fuchsia-500/20 animate-bounce pointer-events-none hidden sm:block" style={{ animationDuration: "4.5s", animationDelay: "2s" }}>
        <Calendar className="w-7 h-7 -rotate-12" />
      </div>

      {/* Main Center Content Container */}
      <div className="max-w-2xl w-full mx-auto text-center flex flex-col items-center relative z-10 space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Holographic 404 Centerpiece with GSAP Floating Event Tickets */}
        <div ref={centerRef} className="relative group w-full flex flex-col items-center justify-center min-h-[220px] sm:min-h-[280px]">
          
          {/* Neon Halo Ring */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 via-fuchsia-600/20 to-indigo-600/30 rounded-[3rem] blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />

          {/* BACK TICKETS (Positioned behind 404 text: z-0) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            {/* Ticket 1: Top-Left (Behind 404) */}
            <div
              ref={(el) => (ticketsRef.current[0] = el)}
              data-target-x="-190"
              data-target-y="-95"
              data-target-rot="-16"
              data-float-x="-15"
              data-float-y="-20"
              data-duration="4.2"
              className="absolute pointer-events-auto cursor-pointer"
            >
              <div className="relative w-36 sm:w-48 h-16 sm:h-20 bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-900/90 border border-purple-500/40 rounded-xl p-2.5 shadow-lg shadow-purple-950/60 backdrop-blur-md flex items-center justify-between text-left before:absolute before:-left-2.5 before:top-1/2 before:-translate-y-1/2 before:w-4 before:h-4 before:bg-[#05030e] before:rounded-full after:absolute after:-right-2.5 after:top-1/2 after:-translate-y-1/2 after:w-4 after:h-4 after:bg-[#05030e] after:rounded-full hover:scale-105 hover:border-purple-400 transition-transform">
                <div className="flex flex-col justify-between h-full space-y-1">
                  <div className="flex items-center gap-1 text-purple-400 text-[10px] font-extrabold tracking-wider uppercase">
                    <Sparkles className="w-3 h-3" /> VIP PASS
                  </div>
                  <div className="text-white text-xs sm:text-sm font-extrabold tracking-tight">FESTIVO '26</div>
                  <div className="text-zinc-400 text-[9px] font-mono">SEC A1 &bull; SEAT 404</div>
                </div>
                <div className="h-full border-r border-dashed border-purple-500/30 mx-1" />
                <div className="flex flex-col items-center justify-center text-purple-300">
                  <QrCode className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                </div>
              </div>
            </div>

            {/* Ticket 2: Top-Right (Behind 404) */}
            <div
              ref={(el) => (ticketsRef.current[1] = el)}
              data-target-x="195"
              data-target-y="-90"
              data-target-rot="14"
              data-float-x="18"
              data-float-y="-16"
              data-duration="5.0"
              className="absolute pointer-events-auto cursor-pointer"
            >
              <div className="relative w-36 sm:w-44 h-16 sm:h-20 bg-gradient-to-r from-fuchsia-950/90 via-purple-950/90 to-slate-900/90 border border-fuchsia-500/40 rounded-xl p-2.5 shadow-lg shadow-fuchsia-950/60 backdrop-blur-md flex items-center justify-between text-left before:absolute before:-left-2.5 before:top-1/2 before:-translate-y-1/2 before:w-4 before:h-4 before:bg-[#05030e] before:rounded-full after:absolute after:-right-2.5 after:top-1/2 after:-translate-y-1/2 after:w-4 after:h-4 after:bg-[#05030e] after:rounded-full hover:scale-105 hover:border-fuchsia-400 transition-transform">
                <div className="flex flex-col justify-between h-full space-y-1">
                  <div className="flex items-center gap-1 text-fuchsia-400 text-[10px] font-extrabold tracking-wider uppercase">
                    <Music className="w-3 h-3" /> CONCERT STUB
                  </div>
                  <div className="text-white text-xs sm:text-sm font-extrabold tracking-tight">STAGE ALPHA</div>
                  <div className="text-zinc-400 text-[9px] font-mono">ADMIT ONE &bull; VIP</div>
                </div>
                <div className="h-full border-r border-dashed border-fuchsia-500/30 mx-1" />
                <div className="flex flex-col items-center justify-center text-fuchsia-300">
                  <Ticket className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
                </div>
              </div>
            </div>

            {/* Ticket 3: Mid-Right (Behind 404) */}
            <div
              ref={(el) => (ticketsRef.current[2] = el)}
              data-target-x="225"
              data-target-y="25"
              data-target-rot="-10"
              data-float-x="12"
              data-float-y="18"
              data-duration="4.6"
              className="absolute pointer-events-auto cursor-pointer hidden xs:block"
            >
              <div className="relative w-32 sm:w-40 h-14 sm:h-18 bg-gradient-to-r from-indigo-950/90 via-purple-900/80 to-violet-950/90 border border-indigo-500/40 rounded-xl p-2 shadow-lg shadow-indigo-950/60 backdrop-blur-md flex items-center justify-between text-left before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:w-3.5 before:h-3.5 before:bg-[#05030e] before:rounded-full after:absolute after:-right-2 after:top-1/2 after:-translate-y-1/2 after:w-3.5 after:h-3.5 after:bg-[#05030e] after:rounded-full hover:scale-105 transition-transform">
                <div className="flex flex-col justify-between h-full">
                  <div className="flex items-center gap-1 text-indigo-400 text-[9px] font-extrabold uppercase">
                    <Zap className="w-2.5 h-2.5" /> LIVE SHOW
                  </div>
                  <div className="text-white text-xs font-bold">ZONE 04</div>
                  <div className="text-zinc-400 text-[8px] font-mono">ROW 00 &bull; #04</div>
                </div>
                <div className="h-full border-r border-dashed border-indigo-500/30 mx-1" />
                <div className="flex items-center justify-center text-indigo-300">
                  <QrCode className="w-5 h-5 sm:w-6 sm:h-6 opacity-75" />
                </div>
              </div>
            </div>
          </div>

          {/* MAIN 404 DIGITS (z-10) */}
          <div className="relative z-10 flex items-center justify-center select-none py-2">
            <span className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-purple-400 drop-shadow-[0_15px_35px_rgba(147,51,234,0.4)] leading-none">
              4
            </span>
            <span className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-purple-400 via-fuchsia-500 to-indigo-600 drop-shadow-[0_15px_35px_rgba(147,51,234,0.4)] leading-none mx-1 sm:mx-2">
              0
            </span>
            <span className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-purple-400 drop-shadow-[0_15px_35px_rgba(147,51,234,0.4)] leading-none">
              4
            </span>
          </div>

          {/* FRONT TICKETS (Positioned in front of 404 text: z-20) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            {/* Ticket 4: Bottom-Left (In front) */}
            <div
              ref={(el) => (ticketsRef.current[3] = el)}
              data-target-x="-185"
              data-target-y="85"
              data-target-rot="12"
              data-float-x="-18"
              data-float-y="15"
              data-duration="4.8"
              className="absolute pointer-events-auto cursor-pointer"
            >
              <div className="relative w-36 sm:w-44 h-16 sm:h-20 bg-gradient-to-r from-purple-900/90 via-slate-900/95 to-indigo-950/90 border border-purple-400/50 rounded-xl p-2.5 shadow-xl shadow-purple-950/70 backdrop-blur-md flex items-center justify-between text-left before:absolute before:-left-2.5 before:top-1/2 before:-translate-y-1/2 before:w-4 before:h-4 before:bg-[#05030e] before:rounded-full after:absolute after:-right-2.5 after:top-1/2 after:-translate-y-1/2 after:w-4 after:h-4 after:bg-[#05030e] after:rounded-full hover:scale-105 hover:border-purple-300 transition-transform">
                <div className="flex flex-col justify-between h-full space-y-1">
                  <div className="flex items-center gap-1 text-purple-300 text-[10px] font-extrabold uppercase">
                    <Ticket className="w-3 h-3" /> BACKSTAGE
                  </div>
                  <div className="text-white text-xs sm:text-sm font-extrabold tracking-tight">ALL ACCESS</div>
                  <div className="text-purple-300/80 text-[9px] font-mono">PASS #404-B</div>
                </div>
                <div className="h-full border-r border-dashed border-purple-400/40 mx-1" />
                <div className="flex items-center justify-center text-purple-200">
                  <QrCode className="w-6 h-6 sm:w-7 sm:h-7 opacity-90" />
                </div>
              </div>
            </div>

            {/* Ticket 5: Bottom-Right (In front) */}
            <div
              ref={(el) => (ticketsRef.current[4] = el)}
              data-target-x="180"
              data-target-y="90"
              data-target-rot="-14"
              data-float-x="16"
              data-float-y="22"
              data-duration="5.4"
              className="absolute pointer-events-auto cursor-pointer"
            >
              <div className="relative w-36 sm:w-48 h-16 sm:h-20 bg-gradient-to-r from-violet-950/95 via-fuchsia-950/90 to-purple-950/90 border border-fuchsia-400/50 rounded-xl p-2.5 shadow-xl shadow-fuchsia-950/70 backdrop-blur-md flex items-center justify-between text-left before:absolute before:-left-2.5 before:top-1/2 before:-translate-y-1/2 before:w-4 before:h-4 before:bg-[#05030e] before:rounded-full after:absolute after:-right-2.5 after:top-1/2 after:-translate-y-1/2 after:w-4 after:h-4 after:bg-[#05030e] after:rounded-full hover:scale-105 hover:border-fuchsia-300 transition-transform">
                <div className="flex flex-col justify-between h-full space-y-1">
                  <div className="flex items-center gap-1 text-fuchsia-300 text-[10px] font-extrabold uppercase">
                    <Film className="w-3 h-3" /> GOLDEN ENTRY
                  </div>
                  <div className="text-white text-xs sm:text-sm font-extrabold tracking-tight">FESTIVO NIGHT</div>
                  <div className="text-fuchsia-300/80 text-[9px] font-mono">GATE 04 &bull; TICKET</div>
                </div>
                <div className="h-full border-r border-dashed border-fuchsia-400/40 mx-1" />
                <div className="flex items-center justify-center text-fuchsia-200">
                  <Ticket className="w-6 h-6 sm:w-7 sm:h-7 opacity-90" />
                </div>
              </div>
            </div>

            {/* Ticket 6: Mid-Left (In front) */}
            <div
              ref={(el) => (ticketsRef.current[5] = el)}
              data-target-x="-220"
              data-target-y="-15"
              data-target-rot="8"
              data-float-x="-14"
              data-float-y="-16"
              data-duration="3.8"
              className="absolute pointer-events-auto cursor-pointer hidden xs:block"
            >
              <div className="relative w-32 sm:w-40 h-14 sm:h-18 bg-gradient-to-r from-purple-950/90 via-violet-900/90 to-slate-900/90 border border-purple-400/40 rounded-xl p-2 shadow-lg shadow-purple-950/60 backdrop-blur-md flex items-center justify-between text-left before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:w-3.5 before:h-3.5 before:bg-[#05030e] before:rounded-full after:absolute after:-right-2 after:top-1/2 after:-translate-y-1/2 after:w-3.5 after:h-3.5 after:bg-[#05030e] after:rounded-full hover:scale-105 transition-transform">
                <div className="flex flex-col justify-between h-full">
                  <div className="flex items-center gap-1 text-purple-300 text-[9px] font-extrabold uppercase">
                    <Sparkles className="w-2.5 h-2.5" /> EARLY BIRD
                  </div>
                  <div className="text-white text-xs font-bold">EXPO PASS</div>
                  <div className="text-zinc-400 text-[8px] font-mono">CODE #404-EX</div>
                </div>
                <div className="h-full border-r border-dashed border-purple-400/30 mx-1" />
                <div className="flex items-center justify-center text-purple-200">
                  <QrCode className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Micro Status Chip */}
          <div className="relative z-30 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-purple-950/50 mt-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Pass Unresolved &bull; Lost Route</span>
          </div>
        </div>

        {/* Text Details Section */}
        <div className="space-y-3 px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Oops! Page Not Found
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or may have been moved to another stage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-sm pt-2">
          {/* Primary: Back to Home */}
          <button
            onClick={() => navigate(getHomeRoute())}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white text-sm font-extrabold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          {/* Secondary: Go Back */}
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 bg-[#120F24]/80 hover:bg-[#1C1738] border border-purple-500/20 hover:border-purple-500/40 text-zinc-200 hover:text-white text-sm font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 backdrop-blur-md shadow-lg shadow-black/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful Quick Navigation Chips */}
        <div className="pt-6 sm:pt-8 border-t border-white/5 w-full">
          <p className="text-xs uppercase font-bold tracking-widest text-zinc-500 mb-3">
            Looking for something else?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <Link
              to={USER_ROUTES.EXPLORE || "/user/explore"}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-purple-500/30 text-xs font-semibold text-zinc-300 hover:text-purple-300 transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>Explore Events</span>
            </Link>

            <Link
              to={USER_ROUTES.BOOKINGS || "/user/bookings"}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-purple-500/30 text-xs font-semibold text-zinc-300 hover:text-purple-300 transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5 text-indigo-400" />
              <span>My Bookings</span>
            </Link>

            <Link
              to={COMMON_ROUTES.ABOUT || "/about"}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-purple-500/30 text-xs font-semibold text-zinc-300 hover:text-purple-300 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>About Us</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Subtle Footer Watermark */}
      <footer className="mt-8 text-center text-xs text-zinc-600 font-medium">
        &copy; {new Date().getFullYear()} Festivo. All rights reserved.
      </footer>
    </div>
  );
};

export default NotFound;
