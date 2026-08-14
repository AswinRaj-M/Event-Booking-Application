import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Search, MapPin, Calendar, Clock, ArrowRight, Ticket, Star, Users, Tag, Copy, Check, Award, ChevronLeft, ChevronRight, MessageSquare, X } from 'lucide-react';
import { VENDOR_ROUTES, USER_ROUTES } from '../../constants/Routes';
import { getExploreEvents, getPublicCouponsApi, getOrganizersApi } from '../../services/user.api.js';
import { getAllCategories } from '../../services/common.api.js';
import { toast } from 'sonner';

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

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publicCoupons, setPublicCoupons] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [copiedCode, setCopiedCode] = useState("");
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  const [feedbacksModalOrg, setFeedbacksModalOrg] = useState(null);
  const [stats, setStats] = useState({ totalEvents: 0, totalUsers: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const [organizersLoading, setOrganizersLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePrevCoupon = () => {
    if (publicCoupons.length <= 1) return;
    setCurrentCouponIndex((prev) => (prev === 0 ? publicCoupons.length - 1 : prev - 1));
  };

  const handleNextCoupon = () => {
    if (publicCoupons.length <= 1) return;
    setCurrentCouponIndex((prev) => (prev === publicCoupons.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setOrganizersLoading(true);
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
            rating: 0
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
        setOrganizersLoading(false);
      }
    };

    fetchHomeData();
  }, []);
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 w-full overflow-hidden">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-semibold tracking-wide text-gray-300">
              Live Events Happening Now
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 mt-2 leading-[1.1]">
            <span className="text-white drop-shadow-lg">Discover Events.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 drop-shadow-xl">Book Experiences.</span>
          </h1>

          <p className="max-w-2xl text-gray-400 text-lg md:text-xl mb-10 leading-relaxed font-light">
            Find concerts, parties, workshops, and unforgettable moments near you. The world's best experiences are just a click away.
          </p>


          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
            <Link to={USER_ROUTES.EXPLORE} className="px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Explore Events
            </Link>
            <Link to={VENDOR_ROUTES.APPLICATION} className="px-8 py-3.5 text-white font-medium hover:text-purple-400 transition-colors flex items-center gap-2 group">
              Become a Vendor <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Active Public Promotional Coupon Banner */}
          {publicCoupons.length > 0 && (() => {
            const activeCoupon = publicCoupons[currentCouponIndex] || publicCoupons[0];
            return (
              <div className="w-full max-w-4xl mx-auto mb-16 relative group">
                <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 border border-purple-500/40 rounded-2xl p-4 md:p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
                  
                  {/* Left Side: Coupon Tag & Offer Info */}
                  <div className="flex items-center gap-4 text-left w-full md:w-auto">
                    <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Tag className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                          Promotional Offer
                        </span>
                        {publicCoupons.length > 1 && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-200 text-[10px] font-extrabold border border-purple-400/30">
                            {currentCouponIndex + 1} of {publicCoupons.length}
                          </span>
                        )}
                        {activeCoupon.endDate && (
                          <span className="text-[11px] text-gray-400">
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
                      <p className="text-xs text-gray-400 mt-0.5">
                        {activeCoupon.description || "Apply code during event checkout to claim discount."}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Copy Code Button + Arrows Navigation */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
                    {/* Coupon Code Pill */}
                    <div className="bg-[#0B0914] border border-purple-500/40 rounded-xl px-4 py-2.5 flex items-center gap-3 font-mono font-bold text-sm text-purple-300 shadow-inner">
                      <span>{activeCoupon.code}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeCoupon.code);
                          setCopiedCode(activeCoupon.code);
                          toast.success(`Copied coupon code ${activeCoupon.code}!`);
                          setTimeout(() => setCopiedCode(""), 3000);
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Coupon Code"
                      >
                        {copiedCode === activeCoupon.code ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Arrow Navigation Buttons (when multiple coupons exist) */}
                    {publicCoupons.length > 1 && (
                      <div className="flex items-center gap-1 bg-black/40 border border-purple-500/30 rounded-xl p-1 backdrop-blur-sm">
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

                {/* Bottom Dot Indicators */}
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
          <div className="grid grid-cols-3 gap-6 md:gap-16 w-full max-w-3xl mx-auto border-t border-white/10 pt-12">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-md">{stats.totalEvents}</span>
              <span className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest text-center">Active Events</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-md">{stats.totalUsers}</span>
              <span className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest text-center">Users</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-md">0</span>
              <span className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest text-center">Rating</span>
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
              <p className="text-gray-400">Find the perfect vibe for your next outing.</p>
            </div>
            <Link to="#" className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center gap-1 group">
              View all categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.length > 0 ? (
              categories.map((cat, i) => (
                <div key={cat._id || i} className="bg-[#111] hover:bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:border-white/20 hover:-translate-y-1 shadow-lg">
                  {cat.categoryIcon?.fileUrl && (
                    <img src={cat.categoryIcon.fileUrl} alt={cat.name} className="w-8 h-8 object-contain mb-1" />
                  )}
                  <span className="font-medium text-sm text-gray-300">{cat.name}</span>
                </div>
              ))
            ) : (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 animate-pulse h-[100px]">
                  <div className="w-8 h-8 rounded bg-zinc-800" />
                  <div className="h-4 bg-zinc-800 w-16 rounded" />
                </div>
              ))
            )}
          </div>
        </section>


        {/* Featured Events */}
        <section className="max-w-7xl mx-auto px-6 py-16 mb-16 relative">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-purple-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 drop-shadow-sm">Upcoming Events</h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-light">Hand-picked experiences we think you'll love. Don't miss out on these trending events.</p>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden animate-pulse flex flex-col h-[380px]">
                  <div className="h-48 bg-zinc-900 w-full" />
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="h-4 bg-zinc-950 w-1/3 rounded" />
                    <div className="h-6 bg-zinc-950 w-3/4 rounded" />
                    <div className="h-4 bg-zinc-950 w-full rounded mt-2" />
                    <div className="h-10 bg-zinc-950 w-full rounded-xl mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-10">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl text-xs font-semibold transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && upcomingEvents.length === 0 && (
            <div className="text-center py-10 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-zinc-500 text-sm">No upcoming events found.</p>
            </div>
          )}

          {!loading && !error && upcomingEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.map((event) => {
                const categoryName = event.category?.name || (typeof event.category === 'string' ? event.category : 'General');
                const imageSrc = event.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop";
                
                const totalCapacity = (event.ticketTiers && event.ticketTiers.length > 0)
                  ? event.ticketTiers.reduce((sum, tier) => sum + (tier.capacity || 0), 0)
                  : (event.totalTickets || 0);

                const totalSold = (event.ticketTiers && event.ticketTiers.length > 0)
                  ? event.ticketTiers.reduce((sum, tier) => sum + (tier.sold || 0), 0)
                  : (event.soldTickets || 0);

                const isSoldOut = totalCapacity > 0 && totalSold >= totalCapacity;

                const priceVal = isSoldOut
                  ? "Sold Out"
                  : event.ticketType === "Free" || !event.ticketTiers || event.ticketTiers.length === 0
                  ? "Free"
                  : `₹${Math.min(...event.ticketTiers.map(t => t.price || 0))}`;

                return (
                  <Link
                    key={event._id}
                    to={USER_ROUTES.EVENT_DETAILS.replace(':id', event._id)}
                    className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/20 transition-all group flex flex-col h-full shadow-2xl hover:-translate-y-1 text-left"
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
                      } backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold border shadow-lg`}>
                        {priceVal}
                      </div>
                      <div className="absolute bottom-3 left-3 z-20">
                        <span className="bg-purple-600/85 backdrop-blur-md shadow-[0_0_10px_rgba(147,51,234,0.5)] text-white text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider">
                          {categoryName}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col bg-[#0A0A0A]">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-base text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                      </div>
                      {event.description && (
                        <p className="text-zinc-400 text-xs mb-4 line-clamp-2 leading-relaxed font-light">
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

                      <button className="w-full py-2.5 bg-white/5 group-hover:bg-purple-600 text-white text-xs font-bold rounded-xl border border-white/10 group-hover:border-transparent transition-all shadow-sm">
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
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-indigo-900/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Award className="w-3.5 h-3.5" />
                <span>Verified Curators</span>
              </div>
              <h2 className="text-3xl font-bold mb-2 text-white">Event Organizers</h2>
              <p className="text-gray-400">Discover the passionate teams and creators bringing unforgettable events to life.</p>
            </div>
            <Link to={USER_ROUTES.EXPLORE} className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center gap-1 group">
              Explore events <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {organizersLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center animate-pulse h-[280px] justify-between">
                  <div className="w-20 h-20 rounded-full bg-zinc-900 mb-4" />
                  <div className="h-5 bg-zinc-900 w-32 rounded mb-2" />
                  <div className="h-3 bg-zinc-900 w-24 rounded mb-4" />
                  <div className="h-12 bg-zinc-900 w-full rounded-xl mb-4" />
                  <div className="h-9 bg-zinc-900 w-full rounded-xl mt-auto" />
                </div>
              ))}
            </div>
          )}

          {!organizersLoading && organizers.length === 0 && (
            <div className="text-center py-12 bg-[#0A0A0A] border border-white/5 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-purple-950/40 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No Organizers Found</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">Active event organizers will be showcased here once events are published.</p>
            </div>
          )}

          {!organizersLoading && organizers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {organizers.map((org) => {
                const name = org.organizerName || org.businessName || "Event Organizer";
                const initial = name.charAt(0).toUpperCase();
                const avatar = org.profilePicture?.fileUrl;
                const hasRating = org.rating && org.rating > 0;
                const locationStr = [org.location?.city, org.location?.state].filter(Boolean).join(", ");
                const categoryOrLocation = org.eventCategory || locationStr || "Verified Organizer";

                return (
                  <div
                    key={org._id}
                    className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center hover:border-purple-500/30 transition-all duration-300 group hover:-translate-y-1 shadow-xl hover:shadow-[0_10px_30px_rgba(147,51,234,0.1)] relative hover:z-40 focus-within:z-40"
                  >
                    {/* Background subtle hover glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-950/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Avatar Container */}
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
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-[#0A0A0A] shadow" title="Verified Organizer">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    {/* Organizer Name & Category/Location */}
                    <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
                      {name}
                    </h3>
                    <p className="text-xs text-zinc-400 mb-4 line-clamp-1 font-medium">
                      {categoryOrLocation}
                    </p>

                    {/* Metrics Row (Rating & Events Count) */}
                    <div className="w-full grid grid-cols-2 gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-2.5 mb-5 text-xs">
                      <div className="flex flex-col items-center justify-center border-r border-white/5 pr-1">
                        {org.totalReviews > 0 ? (
                          <>
                            <div className="flex items-center gap-1 text-amber-400 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{Number(org.rating).toFixed(org.rating % 1 === 0 ? 1 : 2)}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5 truncate">
                              {org.totalReviews} {org.totalReviews === 1 ? "Review" : "Reviews"}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-zinc-400 font-semibold text-[11px]">
                              No ratings yet
                            </span>
                            <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mt-0.5">
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
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
                          {org.totalEvents === 1 ? "Event" : "Events"}
                        </span>
                      </div>
                    </div>

                    {/* Recent Written Feedback Section */}
                    {org.recentReviews && org.recentReviews.length > 0 ? (
                      <div className="w-full bg-[#120f26]/70 border border-purple-500/15 rounded-xl p-3 mb-4 text-left shadow-inner flex flex-col justify-between flex-grow relative">
                        <p className="text-xs text-zinc-300 italic line-clamp-2 leading-relaxed font-light mb-2">
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

                          {/* View All Feedbacks Hover Trigger */}
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

                              {/* Hover Floating Popover with All Feedbacks (Desktop hover) */}
                              <div className="hidden sm:block absolute bottom-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mb-2 w-72 sm:w-80 max-w-[calc(100vw-3rem)] bg-[#0E0C1F]/98 border border-purple-500/40 rounded-2xl p-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.95)] z-50 pointer-events-none group-hover/tooltip:pointer-events-auto opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 transform translate-y-1 group-hover/tooltip:translate-y-0 backdrop-blur-2xl max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900/50 text-left">
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
                                        <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                                          {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                              key={s}
                                              className={`w-2.5 h-2.5 ${s <= (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <p className="text-[11px] text-zinc-300 italic font-light leading-relaxed">
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
                      <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 mb-4 text-center flex items-center justify-center flex-grow">
                        <p className="text-xs text-zinc-500 italic font-light">
                          "No reviews yet"
                        </p>
                      </div>
                    )}

                    {/* Explore Events Button */}
                    <Link
                      to={USER_ROUTES.EXPLORE}
                      className="w-full py-2 bg-white/5 hover:bg-purple-600 text-white text-xs font-bold rounded-xl border border-white/10 hover:border-transparent transition-all shadow-sm flex items-center justify-center gap-1 group/btn mt-auto"
                    >
                      <span>Explore Events</span>
                      <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedbacks Modal Dialog (Mobile & Click View) */}
          {feedbacksModalOrg && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
              onClick={() => setFeedbacksModalOrg(null)}
            >
              <div
                className="bg-[#0B0914] border border-purple-500/30 rounded-3xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(147,51,234,0.2)] relative text-left max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setFeedbacksModalOrg(null)}
                  className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-5 pr-8">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
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
                        <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 italic font-light leading-relaxed">
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
        <section className="bg-gradient-to-b from-[#050505] to-[#0A0A0A] py-24 border-t border-white/5 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 inset-x-0 h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-3 text-white">How It Works</h2>
              <p className="text-gray-400 font-light">Your journey to unforgettable experiences in three simple steps.</p>
            </div>

            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-black border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative group transition-transform hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping blur-sm" />
                    <Search className="w-8 h-8 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Browse Events</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed font-light">Explore thousands of events by local artists, tech giants, and communities.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-black border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative group transition-transform hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping blur-sm" style={{ animationDelay: '500ms' }} />
                    <Ticket className="w-8 h-8 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Book Tickets</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed font-light">Secure your spot instantly and get fast, secure booking guarantees.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-black border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative group transition-transform hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping blur-sm" style={{ animationDelay: '1000ms' }} />
                    <Star className="w-8 h-8 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Enjoy the Experience</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed font-light">Show up, make memories, and share your experiences with friends.</p>
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