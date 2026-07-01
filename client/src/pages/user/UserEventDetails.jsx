import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Ticket, 
  Star, 
  Share2, 
  Facebook, 
  Twitter, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Navigation, 
  Plus, 
  Minus, 
  Info, 
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Link2
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { getExploreEvents } from "../../services/user.api.js";

// Style config matching categories to color codes
const categoryBadgeStyles = {
  "Music": "bg-purple-950/65 text-purple-300 border border-purple-500/20",
  "Technology": "bg-blue-950/65 text-blue-300 border border-blue-500/20",
  "Networking": "bg-emerald-950/65 text-emerald-300 border border-emerald-500/20",
  "Art & Culture": "bg-rose-950/65 text-rose-300 border border-rose-500/20",
  "Sports": "bg-amber-950/65 text-amber-300 border border-amber-500/20",
  "Food & Drink": "bg-orange-950/65 text-orange-300 border border-orange-500/20"
};

// Map Mockup styling
const MapMockup = ({ venue, address, city }) => {
  return (
    <div className="relative w-full h-[260px] md:h-[300px] rounded-3xl overflow-hidden border border-purple-500/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-[#090810]">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: `
          linear-gradient(to right, #6d28d9 1px, transparent 1px),
          linear-gradient(to bottom, #6d28d9 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px'
      }} />

      {/* Styled vector roadmaps */}
      <svg className="absolute inset-0 w-full h-full text-purple-900/10" xmlns="http://www.w3.org/2000/svg">
        <path d="M -50 150 Q 150 120 400 220 T 900 100" stroke="#6d28d9" strokeWidth="2" fill="none" opacity="0.3" />
        <path d="M 120 -50 Q 200 150 150 350" stroke="#6d28d9" strokeWidth="1.5" fill="none" opacity="0.2" />
        <path d="M 350 -50 Q 220 200 450 350" stroke="#6d28d9" strokeWidth="2" fill="none" opacity="0.25" />
        <path d="M -50 50 L 900 300" stroke="#6d28d9" strokeWidth="1" fill="none" opacity="0.15" />
      </svg>

      {/* Pulsing Glowing Marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <span className="absolute w-24 h-24 rounded-full bg-purple-500/10 animate-ping pointer-events-none" />
        <span className="absolute w-12 h-12 rounded-full bg-purple-500/20 animate-pulse border border-purple-500/30 pointer-events-none" />
        
        <div className="relative flex flex-col items-center bg-[#0e0c1b] border border-purple-500/35 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.35)] z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-white text-xs font-bold tracking-wide whitespace-nowrap">{venue || "Zenith Arena"}</span>
          </div>
          {/* Caret below pin */}
          <div className="absolute -bottom-1 w-2.5 h-2.5 bg-[#0e0c1b] border-r border-b border-purple-500/35 rotate-45" />
        </div>
      </div>

      {/* Compass / Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-15">
        <button className="w-8 h-8 rounded-lg bg-[#110d24]/90 border border-purple-500/15 text-zinc-400 hover:text-white flex items-center justify-center text-lg font-bold shadow-md cursor-pointer transition-colors" onClick={() => toast.info("Interactive map zooming simulated")}>+</button>
        <button className="w-8 h-8 rounded-lg bg-[#110d24]/90 border border-purple-500/15 text-zinc-400 hover:text-white flex items-center justify-center text-lg font-bold shadow-md cursor-pointer transition-colors" onClick={() => toast.info("Interactive map zooming simulated")}>-</button>
      </div>

      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/5 rounded-lg px-2.5 py-1 flex items-center gap-1 text-[10px] text-zinc-400 font-bold tracking-wider uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
        Live GPS Mockup
      </div>
    </div>
  );
};

const UserEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user?.user);

  const [event, setEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking states
  const [quantity, setQuantity] = useState(1);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  // Ref for similar events scrolling
  const similarContainerRef = useRef(null);

  // Fetch events on mount
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await getExploreEvents();
        if (response.data?.success) {
          const eventsList = response.data.events || [];
          setAllEvents(eventsList);
          
          const foundEvent = eventsList.find(e => e._id === id);
          if (foundEvent) {
            setEvent(foundEvent);
            // Default selected date to event schedule date
            if (foundEvent.schedule?.date) {
              // Date is saved on the event schema
            }
          } else {
            setError("Event not found or has been removed.");
          }
        } else {
          setError("Failed to fetch events details.");
        }
      } catch (err) {
        console.error("Event Details fetch error:", err);
        setError("Something went wrong while retrieving event details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  // Scroll to top when event ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Derived similar events
  const similarEvents = useMemo(() => {
    if (!event) return [];
    const eventCategoryName = event.category?.name || (typeof event.category === 'string' ? event.category : '');
    
    // Filter by same category, excluding current event
    let filtered = allEvents.filter(e => {
      if (e._id === event._id) return false;
      const catName = e.category?.name || (typeof e.category === 'string' ? e.category : '');
      return catName.toLowerCase() === eventCategoryName.toLowerCase();
    });

    // Fallback if no events match category
    if (filtered.length === 0) {
      filtered = allEvents.filter(e => e._id !== event._id);
    }
    return filtered.slice(0, 8);
  }, [event, allEvents]);

  // Formatting dates
  const formattedDates = useMemo(() => {
    if (!event?.schedule?.date) return { short: "Date TBA", full: "Date TBA", monthDay: "Date TBA" };
    try {
      const d = new Date(event.schedule.date);
      const short = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const full = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
      return { short, full, monthDay };
    } catch (_) {
      return { short: "Date TBA", full: "Date TBA", monthDay: "Date TBA" };
    }
  }, [event]);

  // Coupon and Pricing Calculations
  const ticketPrice = useMemo(() => {
    if (event?.ticketTiers && event.ticketTiers.length > 0) {
      return event.ticketTiers[selectedTierIndex]?.price || 0;
    }
    return event?.ticketPrice || 0;
  }, [event, selectedTierIndex]);
  const isFree = event?.ticketType === "Free";
  const maxQuantity = event?.maxTicketPerPerson || 5;

  // Standard Mock Service Fee matches photo ($14.90 for standard booking, or $0 if free)
  const serviceFee = isFree ? 0 : 14.90;

  // Active coupon discount percent
  const discountPercent = useMemo(() => {
    if (couponCode === "WELCOME10") return 10;
    if (couponCode === "FESTIVE15") return 15;
    
    // Auto discount from event schema if available
    if (event?.offer?.enabled && quantity >= (event.offer.minTicketsRequired || 0)) {
      // Check if offer is within valid date range
      const now = new Date();
      let valid = true;
      if (event.offer.validFrom && new Date(event.offer.validFrom) > now) valid = false;
      if (event.offer.validUntil && new Date(event.offer.validUntil) < now) valid = false;
      
      if (valid) {
        return event.offer.discountValue || 0;
      }
    }
    return 0;
  }, [couponCode, event?.offer, quantity]);

  const subtotal = isFree ? 0 : ticketPrice * quantity;
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalAmount = isFree ? 0 : subtotal - discountAmount + serviceFee;

  const handleBookTickets = () => {
    setIsBooking(true);
    // Simulate booking loading
    setTimeout(() => {
      setIsBooking(false);
    }, 1000);
  };

  const handleShare = (platform) => {
    const pageUrl = window.location.href;
    const text = `Check out this awesome event: ${event?.title}!`;
    
    if (platform === "copy") {
      navigator.clipboard.writeText(pageUrl);
      toast.success("Link copied to clipboard!");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing(prev => {
      const next = !prev;
      if (next) {
        toast.success(`You are now following ${event?.vendorId?.organizerName || "the organizer"}`);
      } else {
        toast.info(`Unfollowed ${event?.vendorId?.organizerName || "the organizer"}`);
      }
      return next;
    });
  };

  const handleContactOrganizer = () => {
    const emailAddress = event?.vendorId?.businessEmail || "organizer@example.com";
    window.location.href = `mailto:${emailAddress}?subject=Inquiry about ${encodeURIComponent(event?.title)}`;
    toast.info(`Opening email client to contact ${event?.vendorId?.organizerName || "organizer"}`);
  };

  const scrollSimilar = (direction) => {
    if (similarContainerRef.current) {
      const scrollAmt = direction === "left" ? -340 : 340;
      similarContainerRef.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050C] text-white font-sans w-full overflow-hidden flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 pb-20 max-w-7xl mx-auto w-full px-4 md:px-8 space-y-12">
          {/* Hero Banner Skeleton */}
          <div className="w-full h-[400px] bg-zinc-900/40 rounded-3xl animate-pulse flex flex-col justify-end p-8 border border-white/5">
            <div className="h-6 w-32 bg-zinc-800 rounded-full mb-4" />
            <div className="h-12 w-2/3 bg-zinc-800 rounded-xl mb-6" />
            <div className="flex gap-4">
              <div className="h-14 w-44 bg-zinc-800 rounded-2xl" />
              <div className="h-14 w-44 bg-zinc-800 rounded-2xl" />
              <div className="h-14 w-44 bg-zinc-800 rounded-2xl" />
            </div>
          </div>
          {/* Content Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-4">
                <div className="h-8 w-48 bg-zinc-900/60 rounded-lg" />
                <div className="h-4 w-full bg-zinc-900/60 rounded" />
                <div className="h-4 w-5/6 bg-zinc-900/60 rounded" />
              </div>
              <div className="h-[250px] bg-zinc-900/60 rounded-3xl animate-pulse" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-[450px] bg-zinc-900/40 rounded-3xl border border-white/5 animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#05050C] text-white font-sans w-full overflow-hidden flex flex-col">
        <Navbar />
        <main className="flex-grow pt-40 pb-28 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto relative z-10">
          <div className="w-16 h-16 rounded-full bg-purple-950/45 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 animate-pulse">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Event Unavailable</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            {error || "We couldn't load this event details. It might have been deleted, draft, or blocked by administration."}
          </p>
          <div className="flex gap-4">
            <Link
              to="/user/explore"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              Browse Events
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold tracking-wide transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = event.category?.name || (typeof event.category === 'string' ? event.category : 'General Event');
  const eventThumbnail = event.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#05050C] text-white font-sans selection:bg-purple-500/30 w-full overflow-hidden flex flex-col">
      <Navbar />

      {/* Glow Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-20 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[600px] -right-20 w-[450px] h-[450px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Main Content Area */}
      <main className="flex-grow pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Dynamic Back Navigation */}
        <div className="mb-6">
          <Link 
            to="/user/explore" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-purple-400 text-xs font-semibold uppercase tracking-wider transition-colors group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to explore
          </Link>
        </div>

        {/* Hero Section Banner */}
        <section className="relative rounded-3xl overflow-hidden mb-12 border border-white/5 shadow-2xl h-[380px] sm:h-[420px] md:h-[480px]">
          {/* Blurred Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 brightness-40 group-hover:scale-102"
            style={{ backgroundImage: `url(${eventThumbnail})` }}
          />
          {/* Dark/Neon Gradients Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050C] via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05050C]/60 via-transparent to-transparent" />

          {/* Details Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10 flex flex-col justify-end h-full">
            {/* Category Tag Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md ${categoryBadgeStyles[categoryName] || 'bg-zinc-800 text-zinc-300'}`}>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                {categoryName}
              </span>
            </div>

            {/* Event Name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] leading-[1.1]">
              {event.title}
            </h1>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-3xl">
              {/* Date Card */}
              <div className="bg-white/[0.03] border border-white/10 hover:border-purple-500/20 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-950/45 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Date</span>
                  <span className="text-white text-xs sm:text-sm font-bold truncate">{formattedDates.short}</span>
                </div>
              </div>

              {/* Time Card */}
              <div className="bg-white/[0.03] border border-white/10 hover:border-purple-500/20 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-950/45 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Time</span>
                  <span className="text-white text-xs sm:text-sm font-bold truncate">
                    {event.schedule?.startTime || "TBA"} - {event.schedule?.endTime || "TBA"}
                  </span>
                </div>
              </div>

              {/* Venue Card */}
              <div className="bg-white/[0.03] border border-white/10 hover:border-purple-500/20 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-950/45 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Location</span>
                  <span className="text-white text-xs sm:text-sm font-bold truncate" title={`${event.venue}, ${event.city}`}>
                    {event.venue || "TBA"}, {event.city || "TBA"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details Grid Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* Left Panel: About, Venue, Organizer (Colspan 8) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* About Event */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
                <h2 className="text-2xl font-bold tracking-tight">About This Event</h2>
              </div>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light whitespace-pre-line">
                {event.description || "No description provided for this event. Please refer to scheduling or contact the organizer."}
              </p>
            </div>

            {/* Event Gallery */}
            {event.images && event.images.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
                  <h2 className="text-2xl font-bold tracking-tight">Event Gallery</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {event.images.map((img, index) => (
                    <div 
                      key={index} 
                      className="relative rounded-2xl overflow-hidden aspect-video border border-white/5 group/gallery cursor-pointer hover:border-purple-500/30 transition-all duration-300 shadow-lg"
                      onClick={() => setActiveImage(img.fileUrl)}
                    >
                      <img 
                        src={img.fileUrl} 
                        alt={`Gallery ${index + 1}`} 
                        className="w-full h-full object-cover transform duration-500 group-hover/gallery:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-xs text-white/90 font-medium">Image {index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue & Location Map */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
                <h2 className="text-2xl font-bold tracking-tight">Venue & Location</h2>
              </div>

              {/* Map Canvas Mock */}
              <MapMockup 
                venue={event.venue} 
                address={event.address} 
                city={event.city} 
              />

              {/* Venue Info Box */}
              <div className="bg-[#0b0914]/65 border border-purple-500/10 hover:border-purple-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 shadow-lg">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base tracking-tight">{event.venue}</h4>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      {event.address ? `${event.address}, ` : ''}{event.city || "TBA"}, {event.state || "TBA"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1b1437]/80 hover:bg-[#251b4c] border border-purple-500/20 text-purple-300 hover:text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm shrink-0"
                  onClick={() => toast.info(`Directions placeholder for ${event.venue || "Zenith Arena"}`)}
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </div>

            {/* Organizer Block */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
                <h2 className="text-2xl font-bold tracking-tight">Organizer</h2>
              </div>

              <div className="bg-[#0b0914]/65 border border-purple-500/10 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start gap-5 shadow-xl">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-purple-950/50 border-2 border-purple-500/30 overflow-hidden flex items-center justify-center shrink-0 shadow-lg select-none">
                  {event.vendorId?.profilePicture?.fileUrl ? (
                    <img 
                      src={event.vendorId.profilePicture.fileUrl} 
                      alt={event.vendorId.organizerName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-purple-300 font-extrabold text-xl">
                      {event.vendorId?.organizerName?.charAt(0).toUpperCase() || "O"}
                    </span>
                  )}
                </div>

                {/* Organizer details */}
                <div className="flex-grow space-y-3">
                  <div>
                    <h3 className="font-extrabold text-white text-lg tracking-tight">
                      {event.vendorId?.organizerName || "Organizer"}
                    </h3>
                    
                    {/* Fake Metadata */}
                    <div className="flex items-center gap-3 flex-wrap text-zinc-500 text-xs mt-1.5 font-medium">
                      <span>Since 2015</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span>50+ Events Hosted</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        4.8 rating
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed font-light">
                    {event.vendorId?.description || "This organizer has hosted numerous high-quality gatherings. Dedicated to delivering seamless scheduling, sound fidelity, and premium entertainment environments."}
                  </p>

                  {/* Organizer Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleFollowToggle}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isFollowing
                          ? "bg-purple-950/50 border border-purple-500/30 text-purple-300"
                          : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)]"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    
                    <button
                      onClick={handleContactOrganizer}
                      className="inline-flex items-center gap-1.5 bg-[#120f26] hover:bg-[#1a1538] border border-purple-900/30 text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Booking Widget (Colspan 4) */}
          <div className="lg:col-span-4 relative">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* Ticket Booking Card Widget */}
              <div className="bg-[#0b0914]/85 backdrop-blur-md border border-purple-500/15 rounded-3xl p-6 md:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4 border-b border-purple-950/40 pb-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Ticket Tier</span>
                    <h3 className="font-bold text-white text-base mt-0.5">
                      {isFree ? "General Admission" : "Early Bird Ticket"}
                    </h3>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mb-6">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Ticket Price</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-3xl font-extrabold ${isFree ? "text-emerald-400" : "text-purple-400"}`}>
                      {isFree ? "Free" : `$${ticketPrice}`}
                    </span>
                    {!isFree && <span className="text-zinc-500 text-xs font-medium">/ person</span>}
                  </div>
                </div>

                {/* Ticket Tier Dropdown Selection if multiple tiers exist */}
                {!isFree && event?.ticketTiers && event.ticketTiers.length > 0 && (
                  <div className="mb-4">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold block mb-2">Select Ticket Tier</label>
                    <div className="relative">
                      <Ticket className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={selectedTierIndex}
                        onChange={(e) => setSelectedTierIndex(Number(e.target.value))}
                        className="w-full bg-[#120f26] border border-purple-900/35 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer transition-colors"
                      >
                        {event.ticketTiers.map((tier, idx) => (
                          <option key={idx} value={idx}>
                            {tier.name} (${tier.price} - {tier.capacity - (tier.sold || 0)} left)
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
                    </div>
                  </div>
                )}

                {/* Selected Tier Benefits Quick Reference */}
                {!isFree && event?.ticketTiers && event.ticketTiers.length > 0 && event.ticketTiers[selectedTierIndex]?.benefits?.length > 0 && (
                  <div className="mb-4 bg-[#120f26]/40 border border-purple-900/10 rounded-2xl p-4">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block mb-2">Included with {event.ticketTiers[selectedTierIndex].name}:</span>
                    <ul className="space-y-1.5">
                      {event.ticketTiers[selectedTierIndex].benefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                          <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                          <span className="leading-tight">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Coupon Selection Option */}
                {!isFree && (
                  <div className="mb-6">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold block mb-2">Apply Coupon</label>
                    <div className="relative">
                      <Sparkles className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-[#120f26] border border-purple-900/35 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer transition-colors"
                      >
                        <option value="">No Coupon Applied</option>
                        {event.offer?.enabled && (
                          <option value="AUTO_OFFER">
                            Auto {event.offer.discountValue}% discount (Min {event.offer.minTicketsRequired} tkt)
                          </option>
                        )}
                        <option value="WELCOME10">WELCOME10 - 10% Off</option>
                        <option value="FESTIVE15">FESTIVE15 - 15% Off</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
                    </div>
                  </div>
                )}

                {/* Quantity Control Stepper */}
                <div className="mb-6 bg-[#120f26]/60 border border-purple-900/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white text-sm font-bold tracking-tight">Quantity</span>
                      <span className="text-[10px] text-purple-400 font-semibold block mt-0.5">
                        {event.totalTickets - event.soldTickets || 14} tickets left
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-[#1a1437]/80 hover:bg-[#251b4c] border border-purple-500/20 text-purple-300 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      
                      <span className="text-white font-extrabold text-base w-6 text-center">
                        {quantity}
                      </span>
                      
                      <button
                        onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                        disabled={quantity >= maxQuantity}
                        className="w-8 h-8 rounded-lg bg-[#1a1437]/80 hover:bg-[#251b4c] border border-purple-500/20 text-purple-300 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Financial breakdown */}
                {!isFree && (
                  <div className="space-y-2.5 text-xs text-zinc-400 border-t border-purple-950/40 pt-4 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount ({discountPercent}%)</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span className="text-white font-medium">${serviceFee.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-purple-950/40 my-1" />

                    <div className="flex justify-between items-baseline text-sm font-bold text-white pt-1">
                      <span>Total Amount</span>
                      <span className="text-lg font-extrabold text-purple-400">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBookTickets}
                  disabled={isBooking}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:via-indigo-500 hover:to-fuchsia-500 text-white font-extrabold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-60 disabled:pointer-events-none"
                >
                  <Ticket className="w-5 h-5 shrink-0" />
                  {isBooking ? "Confirming Spot..." : "Book Tickets"}
                </button>

                {/* Secure checkout assurances */}
                <div className="bg-green-950/20 border border-green-500/10 px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-green-400 text-[10px] mt-4 font-bold tracking-wide uppercase select-none">
                  <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                  Secure payment processing
                </div>



              </div>
            </div>
          </div>

        </section>

        {/* Similar Events Row */}
        {similarEvents.length > 0 && (
          <section className="mt-20 border-t border-purple-950/40 pt-16 relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Similar Events</h2>
                <p className="text-zinc-500 text-xs sm:text-sm mt-1.5 font-medium">More experiences you might enjoy</p>
              </div>

              {/* Slider Arrows */}
              <div className="flex items-center gap-2 select-none">
                <button
                  onClick={() => scrollSimilar("left")}
                  className="w-10 h-10 rounded-full bg-[#110d24] border border-purple-500/15 hover:border-purple-500/40 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => scrollSimilar("right")}
                  className="w-10 h-10 rounded-full bg-[#110d24] border border-purple-500/15 hover:border-purple-500/40 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Event List Slider */}
            <div
              ref={similarContainerRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
            >
              {similarEvents.map((simEvent) => {
                const simCat = simEvent.category?.name || (typeof simEvent.category === 'string' ? simEvent.category : 'General');
                const simThumb = simEvent.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop";
                const simPrice = simEvent.ticketType === "Free" ? "Free" : "Paid";
                
                // Formatted similar event date
                let simDateFormatted = "Date TBA";
                if (simEvent.schedule?.date) {
                  try {
                    const d = new Date(simEvent.schedule.date);
                    simDateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
                  } catch (_) {}
                }

                return (
                  <div
                    key={simEvent._id}
                    className="group bg-[#0b0914]/65 hover:bg-[#0c0a1c]/90 border border-white/5 hover:border-purple-500/20 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col shrink-0 w-[300px] snap-start"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={simThumb}
                        alt={simEvent.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Badge overlay */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md ${categoryBadgeStyles[simCat] || 'bg-zinc-800 text-zinc-300'}`}>
                          {simCat}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Date */}
                        <span className="text-purple-400 text-[10px] font-extrabold uppercase tracking-wider block">
                          {simDateFormatted} • {simEvent.schedule?.startTime || "TBA"}
                        </span>
                        
                        {/* Title */}
                        <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                          {simEvent.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-purple-400/80 shrink-0" />
                          <span className="truncate">{simEvent.venue}, {simEvent.city}</span>
                        </div>
                      </div>

                      <div className="border-t border-purple-950/40 my-3.5" />

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Price</span>
                          <span className={`${
                            simPrice === "Free" ? "text-emerald-400" : "text-purple-400"
                          } font-extrabold text-sm mt-0.5`}>{simPrice}</span>
                        </div>
                        
                        <Link
                          to={`/user/event/${simEvent._id}`}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition-all"
                        >
                          View Event
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* Lightbox Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActiveImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/5 border border-white/10 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors cursor-pointer"
            onClick={() => setActiveImage(null)}
          >
            ✕
          </button>
          <img 
            src={activeImage} 
            alt="Enlarged preview" 
            className="max-w-full max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain" 
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserEventDetails;
