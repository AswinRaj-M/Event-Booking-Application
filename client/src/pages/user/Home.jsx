import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Search, MapPin, Calendar, ArrowRight, Ticket, Star, Users, Tag, Copy, Check, Award, ChevronLeft, ChevronRight, MessageSquare, X, Sparkles, Compass } from 'lucide-react';
import { VENDOR_ROUTES, USER_ROUTES } from '../../constants/Routes';
import { getExploreEvents, getPublicCouponsApi, getOrganizersApi } from '../../services/user.api.js';
import { getAllCategories } from '../../services/common.api.js';
import { toast } from 'sonner';
import gsap from 'gsap';

const formatEventDate = (dateString, startTime) => {
  if (!dateString) return "Date TBA";
  try {
    const d = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateFormatted = d.toLocaleDateString('en-US', options);
    return startTime ? `${dateFormatted} • ${startTime}` : dateFormatted;
  } catch (error) {
    return "Date TBA";
  }
};

const getEventPriceInfo = (event) => {
  const tiers = event.ticketTiers || [];
  const totalCapacity = tiers.length > 0 
    ? tiers.reduce((sum, tier) => sum + (tier.capacity || 0), 0) 
    : (event.totalTickets || 0);

  const totalSold = tiers.length > 0 
    ? tiers.reduce((sum, tier) => sum + (tier.sold || 0), 0) 
    : (event.soldTickets || 0);

  const isSoldOut = totalCapacity > 0 && totalSold >= totalCapacity;

  if (isSoldOut) return { priceVal: "Sold Out", isSoldOut: true };
  if (event.ticketType === "Free" || tiers.length === 0) return { priceVal: "Free", isSoldOut: false };
  
  const minPrice = Math.min(...tiers.map(t => t.price || 0));
  return { priceVal: `₹${minPrice}`, isSoldOut: false };
};

const StarRating = React.memo(({ rating = 5, size = "w-2.5 h-2.5" }) => (
  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`${size} ${s <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
      />
    ))}
  </div>
));

// Authentic SVG Purple Ticket Graphic
const AuthenticPurpleTicket = React.memo(({ className = "", style = {} }) => {
  const maskId = React.useId();
  const gradId = React.useId();
  const sideNotches = [18, 36, 55, 74, 92];
  const barcodeBars = [
    [145, 4], [151, 2], [155, 5], [162, 2],
    [166, 4], [172, 6], [180, 2], [184, 4]
  ];

  return (
    <svg
      viewBox="0 0 200 110"
      className={`filter drop-shadow-[0_4px_10px_rgba(147,51,234,0.4)] select-none pointer-events-none ${className || "w-6 sm:w-8 md:w-10"}`}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b566ff" />
          <stop offset="50%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>

        <mask id={maskId}>
          <rect x="0" y="0" width="200" height="110" fill="white" rx="10" />
          {sideNotches.map((y) => (
            <React.Fragment key={y}>
              <circle cx="0" cy={y} r="5" fill="black" />
              <circle cx="200" cy={y} r="5" fill="black" />
            </React.Fragment>
          ))}
          <circle cx="138" cy="0" r="6" fill="black" />
          <circle cx="138" cy="110" r="6" fill="black" />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        <rect x="0" y="0" width="138" height="110" fill={`url(#${gradId})`} />
        <rect x="10" y="10" width="118" height="90" rx="14" fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="2.5" />

        <g fill="#ffffff">
          <polygon points="49,23 51,28 56,28 52,31 53,36 49,33 45,36 46,31 42,28 47,28" />
          <polygon points="69,20 71,25 76,25 72,28 73,33 69,30 65,33 66,28 62,25 67,25" />
          <polygon points="89,23 91,28 96,28 92,31 93,36 89,33 85,36 86,31 82,28 87,28" />
        </g>

        <text x="69" y="62" fill="#ffffff" fontSize="23" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1.5">
          TICKET
        </text>

        <g fill="#ffffff">
          <polygon points="49,75 51,80 56,80 52,83 53,88 49,85 45,88 46,83 42,80 47,80" />
          <polygon points="69,77 71,82 76,82 72,85 73,90 69,87 65,90 66,85 62,82 67,82" />
          <polygon points="89,75 91,80 96,80 92,83 93,88 89,85 85,88 86,83 82,80 88,80" />
        </g>

        <line x1="138" y1="0" x2="138" y2="110" stroke="rgba(168, 85, 247, 0.45)" strokeWidth="2" strokeDasharray="4 4" />
        <rect x="138" y="0" width="62" height="110" fill="#ffffff" />

        <g fill="#7e22ce">
          {barcodeBars.map(([x, w], i) => (
            <rect key={i} x={x} y="14" width={w} height="82" />
          ))}
        </g>
      </g>
    </svg>
  );
});

// Zero-Gravity Wandering Background Tickets with Mouse Repulsion & Return Physics
const WanderingHeroTickets = React.memo(() => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ticketItems = containerRef.current.querySelectorAll('.wandering-ticket-item');

    const ctx = gsap.context(() => {
      ticketItems.forEach((ticket, idx) => {
        const startRot = (Math.random() - 0.5) * 70;
        gsap.set(ticket, { rotation: startRot, transformOrigin: "center center" });

        gsap.to(ticket, {
          y: "random(-35, 35)",
          x: "random(-40, 40)",
          rotation: `+=${(Math.random() - 0.5) * 50}`,
          rotationX: "random(-20, 20)",
          rotationY: "random(-20, 20)",
          duration: 3 + Math.random() * 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: (idx % 10) * 0.15,
        });

        gsap.to(ticket, {
          scale: 1.1,
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
    }, containerRef);

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      ticketItems.forEach((node) => {
        const inner = node.querySelector('.ticket-repel-inner');
        if (!inner) return;

        const nodeRect = node.getBoundingClientRect();
        const nodeX = nodeRect.left + nodeRect.width / 2 - rect.left;
        const nodeY = nodeRect.top + nodeRect.height / 2 - rect.top;

        const dx = nodeX - mouseX;
        const dy = nodeY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 160;

        if (dist < repelRadius && dist > 0) {
          const force = (repelRadius - dist) / repelRadius;
          const pushDist = force * 90;
          const pushX = (dx / dist) * pushDist;
          const pushY = (dy / dist) * pushDist;

          gsap.to(inner, {
            x: pushX,
            y: pushY,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        } else {
          gsap.to(inner, {
            x: 0,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, []);

  const ticketItems = useMemo(() => {
    const items = [];
    const sizes = [
      "w-3 sm:w-4 md:w-5",
      "w-4 sm:w-5 md:w-6",
      "w-5 sm:w-6 md:w-7",
      "w-6 sm:w-7 md:w-8",
      "w-3.5 sm:w-4.5 md:w-5.5"
    ];
    const opacities = ["opacity-35", "opacity-50", "opacity-65", "opacity-80", "opacity-90"];

    for (let i = 0; i < 75; i++) {
      const top = `${(i * 1.25 + (Math.sin(i * 1.5) * 4)) % 92 + 2}%`;
      const left = `${(i * 1.33 * 17 + (Math.cos(i * 2.1) * 8)) % 94 + 3}%`;
      const scale = sizes[i % sizes.length];
      const opacity = opacities[i % opacities.length];
      items.push({ top, left, scale, opacity });
    }
    return items;
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {ticketItems.map((pos, idx) => (
        <div
          key={idx}
          className="wandering-ticket-item absolute"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className={`ticket-repel-inner ${pos.opacity}`}>
            <AuthenticPurpleTicket className={pos.scale} />
          </div>
        </div>
      ))}
    </div>
  );
});

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publicCoupons, setPublicCoupons] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [copiedCode, setCopiedCode] = useState("");
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  const [feedbacksModalOrg, setFeedbacksModalOrg] = useState(null);
  const [stats, setStats] = useState({ totalEvents: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePrevCoupon = useCallback(() => {
    if (publicCoupons.length <= 1) return;
    setCurrentCouponIndex((prev) => (prev === 0 ? publicCoupons.length - 1 : prev - 1));
  }, [publicCoupons.length]);

  const handleNextCoupon = useCallback(() => {
    if (publicCoupons.length <= 1) return;
    setCurrentCouponIndex((prev) => (prev === publicCoupons.length - 1 ? 0 : prev + 1));
  }, [publicCoupons.length]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [eventsRes, catsRes, couponsRes, organizersRes] = await Promise.all([
          getExploreEvents({ limit: 4 }),
          getAllCategories(),
          getPublicCouponsApi().catch(() => ({ data: { success: false } })),
          getOrganizersApi({ limit: 8 }).catch((err) => {
            console.error("Error fetching organizers:", err);
            return { data: { success: false } };
          })
        ]);

        if (eventsRes.data && eventsRes.data.success) {
          setUpcomingEvents(eventsRes.data.events || []);
          setStats({
            totalEvents: eventsRes.data.totalEvents || 0,
            totalUsers: eventsRes.data.totalUsers || 0,
          });
        }

        if (catsRes.data && catsRes.data.success) {
          const uniqueCats = [];
          const seenNames = new Set();
          const rawCats = catsRes.data.data || [];
          for (const cat of rawCats) {
            const nameLower = cat.name?.trim().toLowerCase();
            if (nameLower && !seenNames.has(nameLower)) {
              seenNames.add(nameLower);
              uniqueCats.push(cat);
            }
          }
          setCategories(uniqueCats);
        }

        if (couponsRes.data && couponsRes.data.success) {
          setPublicCoupons(couponsRes.data.coupons || []);
        }

        if (organizersRes.data && organizersRes.data.success) {
          setOrganizers(organizersRes.data.organizers || []);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError(err.response?.data?.message || "Failed to load home data");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="bg-[#03010a] text-white min-h-screen font-sans selection:bg-purple-500/30 selection:text-white overflow-x-hidden flex flex-col relative">
      <Navbar />

      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-indigo-950/15 rounded-full blur-[180px]" />
        <div className="absolute bottom-20 left-1/3 w-[500px] h-[500px] bg-purple-950/10 rounded-full blur-[160px]" />
      </div>

      <main className="relative z-10 flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center relative min-h-[520px]">
          <WanderingHeroTickets />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/25 mb-8 backdrop-blur-md shadow-[0_0_25px_rgba(147,51,234,0.12)] animate-in fade-in duration-500 relative z-20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-purple-300 font-bold">
              Live Events Happening Now
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-white relative z-20">
            <span className="text-white drop-shadow-lg">Discover Events.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.3)]">
              Book Experiences.
            </span>
          </h1>

          <p className="max-w-2xl text-zinc-400 text-base sm:text-lg md:text-xl mb-10 leading-relaxed font-normal relative z-20">
            Find concerts, parties, workshops, and unforgettable moments near you. The world's best experiences are just a click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 relative z-20">
            <Link
              to={USER_ROUTES.EXPLORE}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(124,58,237,0.45)] hover:shadow-[0_0_40px_rgba(124,58,237,0.65)] hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer group"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to={VENDOR_ROUTES.APPLICATION}
              className="px-8 py-4 bg-[#0a061d]/80 hover:bg-[#150d38] border border-purple-500/30 text-zinc-200 hover:text-white font-extrabold text-sm rounded-2xl transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer shadow-lg hover:border-purple-400 group"
            >
              <span>Become a Vendor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Active Public Promotional Coupon Banner */}
          {publicCoupons.length > 0 && (() => {
            const activeCoupon = publicCoupons[currentCouponIndex] || publicCoupons[0];
            return (
              <div className="w-full max-w-4xl mx-auto mb-16 relative group z-20">
                <div className="bg-gradient-to-br from-[#0c0822] via-[#080518] to-[#04020a] border border-purple-500/30 rounded-3xl p-5 md:p-7 backdrop-blur-xl shadow-[0_0_40px_rgba(147,51,234,0.18)] flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
                  <div className="flex items-center gap-4 text-left w-full md:w-auto">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-[0_0_15px_rgba(147,51,234,0.2)]">
                      <Tag className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-500/30">
                          Promotional Offer
                        </span>
                        {publicCoupons.length > 1 && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-200 text-[10px] font-extrabold border border-purple-400/30">
                            {currentCouponIndex + 1} of {publicCoupons.length}
                          </span>
                        )}
                        {activeCoupon.endDate && (
                          <span className="text-[11px] text-zinc-400">
                            Expires {new Date(activeCoupon.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-white mt-1">
                        {activeCoupon.displayName
                          ? activeCoupon.displayName
                          : `Save ${activeCoupon.discountType === "percentage" ? `${activeCoupon.discountValue}% OFF` : `₹${activeCoupon.discountValue} OFF`}`}{" "}
                        <span className="text-purple-400 font-mono">({activeCoupon.code})</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {activeCoupon.description || "Apply code during event checkout to claim discount."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
                    <div className="bg-[#03010a] border border-purple-500/40 rounded-2xl px-4 py-2.5 flex items-center gap-3 font-mono font-bold text-sm text-purple-300 shadow-inner">
                      <span>{activeCoupon.code}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeCoupon.code);
                          setCopiedCode(activeCoupon.code);
                          toast.success(`Copied coupon code ${activeCoupon.code}!`);
                          setTimeout(() => setCopiedCode(""), 3000);
                        }}
                        className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Coupon Code"
                      >
                        {copiedCode === activeCoupon.code ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {publicCoupons.length > 1 && (
                      <div className="flex items-center gap-1 bg-black/50 border border-purple-500/30 rounded-xl p-1 backdrop-blur-sm">
                        <button
                          onClick={handlePrevCoupon}
                          aria-label="Previous Coupon"
                          className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/40 transition-all active:scale-95 cursor-pointer"
                          title="Previous Coupon"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextCoupon}
                          aria-label="Next Coupon"
                          className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/40 transition-all active:scale-95 cursor-pointer"
                          title="Next Coupon"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {publicCoupons.length > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-3">
                    {publicCoupons.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentCouponIndex(idx)}
                        aria-label={`Go to coupon ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          currentCouponIndex === idx
                            ? "w-6 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                            : "w-1.5 bg-white/20 hover:bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mx-auto pt-6 relative z-20">
            <div className="bg-[#070412]/90 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md shadow-xl hover:border-purple-500/30 transition-all flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 mb-1">{stats.totalEvents}</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-widest text-center">Active Events</span>
            </div>
            <div className="bg-[#070412]/90 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md shadow-xl hover:border-purple-500/30 transition-all flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 mb-1">{stats.totalUsers}</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-widest text-center">Users</span>
            </div>
            <div className="bg-[#070412]/90 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md shadow-xl hover:border-purple-500/30 transition-all flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 mb-1">0</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-widest text-center">Rating</span>
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
                <Compass className="w-4 h-4" /> Category Selection
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Browse by Category</h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-1">Find the perfect vibe for your next outing.</p>
            </div>
            <Link to={USER_ROUTES.EXPLORE} className="text-purple-400 hover:text-purple-300 text-sm font-bold flex items-center gap-1.5 group">
              <span>View all categories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.length > 0 ? (
              categories.map((cat, i) => (
                <div key={cat._id || i} className="bg-[#070412]/90 hover:bg-[#100a26] border border-white/5 hover:border-purple-500/35 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-2xl backdrop-blur-md group">
                  {cat.categoryIcon?.fileUrl && (
                    <img src={cat.categoryIcon.fileUrl} alt={cat.name} className="w-8 h-8 object-contain mb-1 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="font-bold text-sm text-zinc-200 group-hover:text-purple-300 transition-colors">{cat.name}</span>
                </div>
              ))
            ) : (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#070412]/90 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 animate-pulse h-[100px]">
                  <div className="w-8 h-8 rounded bg-zinc-800" />
                  <div className="h-4 bg-zinc-800 w-16 rounded" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Featured Events */}
        <section className="max-w-7xl mx-auto px-6 py-16 mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-purple-900/15 rounded-full blur-[160px] -z-10 pointer-events-none" />

          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" /> Trending Experiences
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">Upcoming Events</h2>
            <p className="text-zinc-400 text-sm sm:text-base font-normal">Hand-picked experiences we think you'll love. Don't miss out on these trending events.</p>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#070412]/90 border border-white/5 rounded-3xl overflow-hidden animate-pulse flex flex-col h-[380px]">
                  <div className="h-48 bg-zinc-900 w-full" />
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="h-4 bg-zinc-950 w-1/3 rounded" />
                    <div className="h-6 bg-zinc-950 w-3/4 rounded" />
                    <div className="h-4 bg-zinc-950 w-full rounded mt-2" />
                    <div className="h-10 bg-zinc-950 w-full rounded-2xl mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-10">
              <p className="text-rose-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && upcomingEvents.length === 0 && (
            <div className="text-center py-10 bg-[#070412]/90 border border-white/5 rounded-3xl p-6 max-w-md mx-auto backdrop-blur-md">
              <p className="text-zinc-400 text-sm">No upcoming events found.</p>
            </div>
          )}

          {!loading && !error && upcomingEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.map((event) => {
                const categoryName = event.category?.name || (typeof event.category === 'string' ? event.category : 'General');
                const imageSrc = event.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop";
                const { priceVal, isSoldOut } = getEventPriceInfo(event);

                return (
                  <Link
                    key={event._id}
                    to={USER_ROUTES.EVENT_DETAILS.replace(':id', event._id)}
                    className="bg-[#070412]/90 border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 group flex flex-col h-full shadow-2xl hover:-translate-y-1.5 backdrop-blur-md text-left"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black w-full overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className={`absolute top-3 right-3 z-20 ${
                        isSoldOut 
                          ? "bg-rose-600/90 text-white border-rose-500/40 uppercase tracking-wider" 
                          : "bg-black/80 text-white border-white/10"
                      } backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold border shadow-lg`}>
                        {priceVal}
                      </div>
                      <div className="absolute bottom-3 left-3 z-20">
                        <span className="bg-purple-600/90 backdrop-blur-md shadow-[0_0_15px_rgba(147,51,234,0.5)] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider">
                          {categoryName}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col bg-[#070412]/95">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                      </div>
                      {event.description && (
                        <p className="text-zinc-400 text-xs mb-4 line-clamp-2 leading-relaxed font-normal">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-auto space-y-2 text-xs text-zinc-400 mb-5 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{formatEventDate(event.schedule?.date, event.schedule?.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          <span className="line-clamp-1">{event.venue}, {event.city}</span>
                        </div>
                      </div>

                      <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] border border-purple-500/30 cursor-pointer">
                        View Details
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Event Organizers Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-indigo-900/15 rounded-full blur-[160px] -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Award className="w-3.5 h-3.5" />
                <span>Verified Curators</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">Event Organizers</h2>
              <p className="text-zinc-400 text-sm sm:text-base">Discover the passionate teams and creators bringing unforgettable events to life.</p>
            </div>
            <Link to={USER_ROUTES.EXPLORE} className="text-purple-400 hover:text-purple-300 text-sm font-bold flex items-center gap-1.5 group">
              <span>Explore events</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#070412]/90 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center animate-pulse h-[280px] justify-between">
                  <div className="w-20 h-20 rounded-full bg-zinc-900 mb-4" />
                  <div className="h-5 bg-zinc-900 w-32 rounded mb-2" />
                  <div className="h-3 bg-zinc-900 w-24 rounded mb-4" />
                  <div className="h-12 bg-zinc-900 w-full rounded-2xl mb-4" />
                  <div className="h-9 bg-zinc-900 w-full rounded-2xl mt-auto" />
                </div>
              ))}
            </div>
          )}

          {!loading && organizers.length === 0 && (
            <div className="text-center py-12 bg-[#070412]/90 border border-white/5 rounded-3xl p-8 max-w-md mx-auto backdrop-blur-md">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No Organizers Found</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">Active event organizers will be showcased here once events are published.</p>
            </div>
          )}

          {!loading && organizers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {organizers.map((org) => {
                const name = org.organizerName || org.businessName || "Event Organizer";
                const initial = name.charAt(0).toUpperCase();
                const avatar = org.profilePicture?.fileUrl;
                const locationStr = [org.location?.city, org.location?.state].filter(Boolean).join(", ");
                const categoryOrLocation = org.eventCategory || locationStr || "Verified Organizer";

                return (
                  <div
                    key={org._id}
                    className="bg-[#070412]/90 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center hover:border-purple-500/40 transition-all duration-300 group hover:-translate-y-1.5 shadow-2xl backdrop-blur-md relative hover:z-40 focus-within:z-40"
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-purple-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-900/40 via-indigo-950/40 to-black border-2 border-purple-500/30 overflow-hidden flex items-center justify-center shadow-lg group-hover:border-purple-400/60 transition-colors select-none">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-2xl font-black text-purple-300">
                            {initial}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-[#03010a] shadow" title="Verified Organizer">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
                      {name}
                    </h3>
                    <p className="text-xs text-zinc-400 mb-4 line-clamp-1 font-medium">
                      {categoryOrLocation}
                    </p>

                    <div className="w-full grid grid-cols-2 gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-2.5 mb-5 text-xs">
                      <div className="flex flex-col items-center justify-center border-r border-white/5 pr-1">
                        {org.totalReviews > 0 ? (
                          <>
                            <div className="flex items-center gap-1 text-amber-400 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{Number(org.rating).toFixed(org.rating % 1 === 0 ? 1 : 2)}</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5 truncate">
                              {org.totalReviews} {org.totalReviews === 1 ? "Review" : "Reviews"}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-zinc-400 font-semibold text-[11px]">
                              No ratings yet
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
                              0 Reviews
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col items-center justify-center pl-1">
                        <div className="flex items-center gap-1 text-purple-300 font-bold">
                          <Ticket className="w-3.5 h-3.5 text-purple-400" />
                          <span>{org.totalEvents}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">
                          {org.totalEvents === 1 ? "Event" : "Events"}
                        </span>
                      </div>
                    </div>

                    {org.recentReviews && org.recentReviews.length > 0 ? (
                      <div className="w-full bg-[#0d0824]/80 border border-purple-500/20 rounded-2xl p-3 mb-4 text-left shadow-inner flex flex-col justify-between flex-grow relative">
                        <p className="text-xs text-zinc-300 italic line-clamp-2 leading-relaxed font-normal mb-2">
                          "{org.recentReviews[0].feedback}"
                        </p>

                        <div className="flex items-center justify-between gap-1.5 mt-auto pt-1.5 border-t border-white/5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div className="w-4 h-4 rounded-full bg-purple-900/60 border border-purple-500/30 overflow-hidden flex items-center justify-center text-[8px] font-bold text-purple-300 shrink-0 select-none">
                              {org.recentReviews[0].reviewerAvatar ? (
                                <img
                                  src={org.recentReviews[0].reviewerAvatar}
                                  alt={org.recentReviews[0].reviewerName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                org.recentReviews[0].reviewerName?.charAt(0).toUpperCase() || "U"
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-medium truncate">
                              — {org.recentReviews[0].reviewerName || "Verified Attendee"}
                            </span>
                          </div>

                          {org.recentReviews.length > 1 && (
                            <div className="relative group/tooltip shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFeedbacksModalOrg(org);
                                }}
                                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline underline-offset-2 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>View feedbacks</span>
                                <span className="bg-purple-500/25 text-purple-300 px-1 py-0.2 rounded text-[9px] font-extrabold">
                                  {org.recentReviews.length}
                                </span>
                              </button>

                              <div className="hidden sm:block absolute bottom-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mb-2 w-72 sm:w-80 max-w-[calc(100vw-3rem)] bg-[#070412]/98 border border-purple-500/40 rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.95)] z-50 pointer-events-none group-hover/tooltip:pointer-events-auto opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 transform translate-y-1 group-hover/tooltip:translate-y-0 backdrop-blur-2xl max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900/50 text-left">
                                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-purple-500/20">
                                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                                    All Feedbacks ({org.recentReviews.length})
                                  </span>
                                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    <span>{Number(org.rating).toFixed(1)}</span>
                                  </div>
                                </div>

                                <div className="space-y-2.5">
                                  {org.recentReviews.map((rev, rIdx) => (
                                    <div key={rev._id || rIdx} className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 hover:border-purple-500/20 transition-colors">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-5 h-5 rounded-full bg-purple-950/80 border border-purple-500/30 overflow-hidden flex items-center justify-center text-[9px] font-bold text-purple-300 shrink-0 select-none">
                                            {rev.reviewerAvatar ? (
                                              <img src={rev.reviewerAvatar} alt={rev.reviewerName} className="w-full h-full object-cover" />
                                            ) : (
                                              rev.reviewerName?.charAt(0).toUpperCase() || "U"
                                            )}
                                          </div>
                                          <span className="text-xs font-bold text-white truncate">
                                            {rev.reviewerName || "Verified Attendee"}
                                          </span>
                                        </div>
                                        <StarRating rating={rev.rating} />
                                      </div>
                                      <p className="text-[11px] text-zinc-300 italic font-normal leading-relaxed">
                                        "{rev.feedback}"
                                      </p>
                                      {rev.createdAt && (
                                        <span className="text-[9px] text-zinc-500 block mt-1">
                                          {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-3 mb-4 text-center flex items-center justify-center flex-grow">
                        <p className="text-xs text-zinc-500 italic font-normal">
                          "No reviews yet"
                        </p>
                      </div>
                    )}

                    <Link
                      to={USER_ROUTES.EXPLORE}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center gap-1 group/btn mt-auto"
                    >
                      <span>Explore Events</span>
                      <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedbacks Modal Dialog */}
          {feedbacksModalOrg && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
              onClick={() => setFeedbacksModalOrg(null)}
            >
              <div
                className="bg-[#070412] border border-purple-500/30 rounded-3xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(147,51,234,0.25)] relative text-left max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setFeedbacksModalOrg(null)}
                  className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-5 pr-8">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-white tracking-tight truncate">
                      {feedbacksModalOrg.organizerName || feedbacksModalOrg.businessName || "Organizer Feedbacks"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-white ml-0.5">{Number(feedbacksModalOrg.rating).toFixed(1)}</span>
                      </div>
                      <span>•</span>
                      <span>{feedbacksModalOrg.recentReviews?.length || 0} Feedbacks</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-purple-900/50">
                  {feedbacksModalOrg.recentReviews?.map((rev, rIdx) => (
                    <div key={rev._id || rIdx} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-purple-950/80 border border-purple-500/30 overflow-hidden flex items-center justify-center text-[10px] font-bold text-purple-300 shrink-0 select-none">
                            {rev.reviewerAvatar ? (
                              <img src={rev.reviewerAvatar} alt={rev.reviewerName} className="w-full h-full object-cover" />
                            ) : (
                              rev.reviewerName?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <span className="text-xs font-bold text-white truncate">
                            {rev.reviewerName || "Verified Attendee"}
                          </span>
                        </div>
                        <StarRating rating={rev.rating} size="w-3 h-3" />
                      </div>
                      <p className="text-xs text-zinc-300 italic font-normal leading-relaxed">
                        "{rev.feedback}"
                      </p>
                      {rev.createdAt && (
                        <span className="text-[10px] text-zinc-500 block mt-2">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-b from-[#03010a] via-[#070412] to-[#03010a] py-24 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
                <Sparkles className="w-4 h-4" /> Simple Steps
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">How It Works</h2>
              <p className="text-zinc-400 font-normal">Your journey to unforgettable experiences in three simple steps.</p>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#03010a] border border-purple-500/35 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(147,51,234,0.2)] relative group transition-transform hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping blur-sm" />
                    <Search className="w-8 h-8 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Browse Events</h3>
                  <p className="text-sm text-zinc-400 max-w-xs leading-relaxed font-normal">Explore thousands of events by local artists, tech giants, and communities.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#03010a] border border-purple-500/35 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(147,51,234,0.2)] relative group transition-transform hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping blur-sm" style={{ animationDelay: '500ms' }} />
                    <Ticket className="w-8 h-8 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Book Tickets</h3>
                  <p className="text-sm text-zinc-400 max-w-xs leading-relaxed font-normal">Secure your spot instantly and get fast, secure booking guarantees.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#03010a] border border-purple-500/35 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(147,51,234,0.2)] relative group transition-transform hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping blur-sm" style={{ animationDelay: '1000ms' }} />
                    <Star className="w-8 h-8 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Enjoy the Experience</h3>
                  <p className="text-sm text-zinc-400 max-w-xs leading-relaxed font-normal">Show up, make memories, and share your experiences with friends.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;