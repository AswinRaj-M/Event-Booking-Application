import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Search, MapPin, Calendar, Clock, ArrowRight, Ticket, Star, Users, Tag, Copy, Check } from 'lucide-react';
import { VENDOR_ROUTES, USER_ROUTES } from '../../constants/Routes';
import { getExploreEvents, getPublicCouponsApi } from '../../services/user.api.js';
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
  const [copiedCode, setCopiedCode] = useState("");
  const [stats, setStats] = useState({ totalEvents: 0, totalUsers: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [eventsRes, catsRes, couponsRes] = await Promise.all([
          getExploreEvents({ limit: 4 }),
          getAllCategories(),
          getPublicCouponsApi().catch(() => ({ data: { success: false } }))
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
          {publicCoupons.length > 0 && (
            <div className="w-full max-w-4xl mx-auto mb-16">
              <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 border border-purple-500/40 rounded-2xl p-4 md:p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                    <Tag className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                        Promotional Offer
                      </span>
                      {publicCoupons[0].endDate && (
                        <span className="text-[11px] text-gray-400">
                          Expires {new Date(publicCoupons[0].endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white mt-1">
                      {publicCoupons[0].displayName ? publicCoupons[0].displayName : `Save ${publicCoupons[0].discountType === "percentage" ? `${publicCoupons[0].discountValue}% OFF` : `₹${publicCoupons[0].discountValue} OFF`}`} <span className="text-purple-400 font-mono">({publicCoupons[0].code})</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {publicCoupons[0].description || "Apply code during event checkout to claim discount."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-[#0B0914] border border-purple-500/40 rounded-xl px-4 py-2.5 flex items-center gap-3 font-mono font-bold text-sm text-purple-300 shadow-inner">
                    <span>{publicCoupons[0].code}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(publicCoupons[0].code);
                        setCopiedCode(publicCoupons[0].code);
                        toast.success(`Copied coupon code ${publicCoupons[0].code}!`);
                        setTimeout(() => setCopiedCode(""), 3000);
                      }}
                      className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Coupon Code"
                    >
                      {copiedCode === publicCoupons[0].code ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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