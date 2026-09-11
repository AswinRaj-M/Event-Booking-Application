import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Users,
  Ticket,
  CheckCircle,
  Maximize2,
  X,
  ExternalLink,
  ShieldCheck,
  Star,
  Sparkles,
  Tag,
  Building,
  Award,
  Info,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { USER_ROUTES } from "../../constants/Routes";
import { getEventById } from "../../services/user.api.js";

const UserPastEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchPastEventDetails();
  }, [id]);

  const fetchPastEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEventById(id);
      if (res.data?.success && res.data.data) {
        setEvent(res.data.data);
      } else {
        setError("Event details could not be found.");
      }
    } catch (err) {
      console.error("Error fetching past event details:", err);
      setError(err.response?.data?.message || "Failed to load past event details.");
    } finally {
      setLoading(false);
    }
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070510] text-white flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin shadow-[0_0_20px_rgba(147,51,234,0.3)]" />
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest animate-pulse">
              Loading Event Showcase...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#070510] text-white flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#0d091f] border border-purple-500/20 rounded-3xl p-8 space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 mx-auto">
              <Info className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Event Unavailable</h2>
            <p className="text-zinc-400 text-xs">{error || "The requested past event details could not be loaded."}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const organizer = event.vendorId || {};
  const category = event.category || {};
  const allImages = [];
  if (event.thumbnail?.fileUrl) allImages.push(event.thumbnail.fileUrl);
  if (Array.isArray(event.images)) {
    event.images.forEach((img) => {
      if (img?.fileUrl && !allImages.includes(img.fileUrl)) {
        allImages.push(img.fileUrl);
      }
    });
  }

  const isOnline = event.eventType === "Online";
  const venueTitle = isOnline ? "Virtual Experience" : event.venue || "Event Venue";
  const venueAddress = isOnline ? "Online Live Stream" : `${event.address || ""}${event.address ? ", " : ""}${event.city || ""}, ${event.state || ""}`.trim();
  const totalCapacity = event.totalTickets || (Array.isArray(event.ticketTiers) ? event.ticketTiers.reduce((acc, t) => acc + (t.capacity || 0), 0) : 0);
  const totalSold = event.soldTickets || (Array.isArray(event.ticketTiers) ? event.ticketTiers.reduce((acc, t) => acc + (t.sold || 0), 0) : 0);

  return (
    <div className="min-h-screen bg-[#070510] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      {/* Top Breadcrumb & Navigation Bar */}
      <div className="bg-[#0b081a]/90 border-b border-white/5 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium truncate">
            <Link to={USER_ROUTES.HOME} className="hover:text-purple-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            {organizer._id ? (
              <>
                <Link to={USER_ROUTES.ORGANIZER_PROFILE.replace(":id", organizer._id)} className="hover:text-purple-300 transition-colors truncate">
                  {organizer.organizerName || organizer.businessName || "Organizer"}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              </>
            ) : null}
            <span className="text-purple-400 font-bold truncate">Completed Event</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Share Event Link"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* HERO SECTION: Cinematic Cover & Key Info */}
        <section className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-[#0c091f] shadow-[0_0_50px_rgba(147,51,234,0.15)]">
          <div className="relative h-72 sm:h-96 w-full overflow-hidden">
            <img
              src={event.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop"}
              alt={event.title}
              className="w-full h-full object-cover filter brightness-95"
            />
            {/* Vignette Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c091f] via-[#0c091f]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c091f]/90 via-transparent to-[#0c091f]/50" />

            {/* Top Status Badges */}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2.5 z-10">
              <span className="px-3.5 py-1.5 rounded-2xl bg-zinc-950/85 border border-purple-500/40 text-purple-300 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span>Completed Event</span>
              </span>
              {category.name && (
                <span className="px-3.5 py-1.5 rounded-2xl bg-purple-950/85 border border-purple-500/30 text-purple-200 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>{category.name}</span>
                </span>
              )}
              <span className="px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-white text-xs font-extrabold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5">
                {isOnline ? <Globe className="w-3.5 h-3.5 text-indigo-400" /> : <MapPin className="w-3.5 h-3.5 text-pink-400" />}
                <span>{event.eventType || "In-person"}</span>
              </span>
            </div>

            {/* Bottom Hero Content */}
            <div className="absolute bottom-6 left-6 right-6 z-10 space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {event.title}
              </h1>

              {organizer._id && (
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    to={USER_ROUTES.ORGANIZER_PROFILE.replace(":id", organizer._id)}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-purple-950/80 border border-purple-500/30 text-xs font-bold text-zinc-200 hover:text-white transition-all backdrop-blur-md group"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-900 overflow-hidden flex items-center justify-center text-[10px] font-black text-purple-300 shrink-0">
                      {organizer.profilePicture?.fileUrl ? (
                        <img src={organizer.profilePicture.fileUrl} alt={organizer.organizerName} className="w-full h-full object-cover" />
                      ) : (
                        (organizer.organizerName || "O").charAt(0).toUpperCase()
                      )}
                    </div>
                    <span>Hosted by <strong className="text-purple-300 group-hover:underline">{organizer.organizerName || organizer.businessName}</strong></span>
                    <ExternalLink className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* HIGHLIGHTS & STATS METRICS GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0c091f]/90 border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold block">Event Date</span>
              <span className="text-white text-xs sm:text-sm font-bold block">{formatFullDate(event.schedule?.date)}</span>
              {event.schedule?.startTime && (
                <span className="text-[11px] text-purple-300 font-medium block">{event.schedule.startTime} {event.schedule.endTime ? `- ${event.schedule.endTime}` : ""}</span>
              )}
            </div>
          </div>

          <div className="bg-[#0c091f]/90 border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              {isOnline ? <Globe className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold block">Location</span>
              <span className="text-white text-xs sm:text-sm font-bold block truncate">{venueTitle}</span>
              <span className="text-[11px] text-purple-300 font-medium block truncate">{event.city ? `${event.city}, ${event.state || ""}` : "Virtual Stream"}</span>
            </div>
          </div>

          <div className="bg-[#0c091f]/90 border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold block">Attendance</span>
              <span className="text-white text-xs sm:text-sm font-bold block">
                {totalSold > 0 ? `${totalSold} Attendee${totalSold !== 1 ? "s" : ""}` : "Concluded Event"}
              </span>
              <span className="text-[11px] text-purple-300 font-medium block">
                {totalCapacity > 0 ? `Capacity: ${totalCapacity}` : "Archived Showcase"}
              </span>
            </div>
          </div>

          <div className="bg-[#0c091f]/90 border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold block">Entry Requirement</span>
              <span className="text-white text-xs sm:text-sm font-bold block">
                {event.ageRestriction?.enabled ? `${event.ageRestriction.minAge}+ Age Limit` : "All Ages Welcome"}
              </span>
              <span className="text-[11px] text-purple-300 font-medium block">
                {event.ticketType || "Paid Entry"}
              </span>
            </div>
          </div>
        </section>

        {/* MAIN LAYOUT: Left (Details, Gallery, Venue) vs Right (Organizer & Closed Banner) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-10">
            {/* 1. Full Event Description & Story */}
            <section className="bg-[#0c091f]/70 border border-purple-500/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-left">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                <h2 className="text-xl font-bold text-white tracking-tight">About This Completed Event</h2>
              </div>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light whitespace-pre-line">
                {event.description || "No detailed description was recorded for this past event."}
              </p>
            </section>

            {/* 2. Event Media & Gallery (Showcase) */}
            <section className="bg-[#0c091f]/70 border border-purple-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-left">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Event Gallery & Memories</h2>
                    <p className="text-xs text-zinc-400">Photos captured during and for this event</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-bold">
                  {allImages.length} Photo{allImages.length !== 1 ? "s" : ""}
                </span>
              </div>

              {allImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Large Featured Image */}
                  <div
                    onClick={() => setLightboxImage(allImages[0])}
                    className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer shadow-lg"
                  >
                    <img
                      src={allImages[0]}
                      alt="Featured event media"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-4 py-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                        <Maximize2 className="w-4 h-4" />
                        <span>Preview Photo</span>
                      </div>
                    </div>
                  </div>

                  {/* Remaining Grid */}
                  {allImages.length > 1 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {allImages.slice(1).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxImage(imgUrl)}
                          className="relative h-36 rounded-xl overflow-hidden border border-white/10 group cursor-pointer shadow-md"
                        >
                          <img
                            src={imgUrl}
                            alt={`Gallery photo ${idx + 2}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-purple-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
                  <p className="text-xs text-zinc-400 font-medium">No additional gallery photos were uploaded for this past event.</p>
                </div>
              )}
            </section>

            {/* 3. Venue & Location Section */}
            <section className="bg-[#0c091f]/70 border border-purple-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-left">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {isOnline ? "Virtual Event Details" : "Venue & Location"}
                </h2>
              </div>

              {!isOnline ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                  <div className="sm:col-span-2 space-y-3">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                      <Building className="w-4 h-4" />
                      <span>{event.venue || "Physical Venue"}</span>
                    </div>
                    <p className="text-zinc-200 text-sm font-semibold leading-relaxed">
                      {event.address || "Address unavailable"}
                    </p>
                    <p className="text-xs text-zinc-400 font-medium">
                      {[event.city, event.state].filter(Boolean).join(", ")}
                    </p>
                    {event.location?.latitude && event.location?.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${event.location.latitude},${event.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all shadow-md mt-2"
                      >
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span>Open Location in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="bg-[#140f30] border border-purple-500/20 rounded-2xl p-5 text-center space-y-2">
                    <MapPin className="w-8 h-8 text-purple-400 mx-auto" />
                    <span className="text-xs font-bold text-white block">In-Person Gathering</span>
                    <span className="text-[11px] text-zinc-400 block">Hosted live at specified venue location</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#140f30] border border-purple-500/20 rounded-2xl p-6 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Globe className="w-4 h-4" />
                    <span>Online Live Event Stream</span>
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed">
                    This was a virtual event broadcast online. Live streaming access link was provided to confirmed attendees during the scheduled time.
                  </p>
                </div>
              )}
            </section>

            {/* 4. Ticket Tiers Offered (Read-Only Showcase) */}
            {Array.isArray(event.ticketTiers) && event.ticketTiers.length > 0 && (
              <section className="bg-[#0c091f]/70 border border-purple-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Ticket Tiers Offered</h2>
                      <p className="text-xs text-zinc-400">Archived pricing breakdown for this event</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase">
                    Concluded Tiers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.ticketTiers.map((tier) => (
                    <div
                      key={tier._id || tier.name}
                      className="bg-[#120e29] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-base">{tier.name}</h4>
                          <span className="text-purple-300 font-extrabold text-sm">
                            {tier.price === 0 ? "Free" : `₹${tier.price}`}
                          </span>
                        </div>
                        {tier.capacity && (
                          <p className="text-[11px] text-zinc-400 font-medium">
                            Capacity: {tier.capacity} seats {tier.sold ? `(${tier.sold} sold)` : ""}
                          </p>
                        )}
                      </div>

                      {Array.isArray(tier.benefits) && tier.benefits.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-white/5">
                          {tier.benefits.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                              <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Organizer & Concluded Assurance Card */}
          <div className="space-y-6">
            {/* Organizer Card */}
            {organizer._id && (
              <div className="bg-[#0c091f]/90 border border-purple-500/30 rounded-3xl p-6 space-y-5 shadow-2xl backdrop-blur-md text-left sticky top-20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/40 overflow-hidden flex items-center justify-center text-base font-black text-purple-300 shrink-0 shadow-lg">
                    {organizer.profilePicture?.fileUrl ? (
                      <img src={organizer.profilePicture.fileUrl} alt={organizer.organizerName} className="w-full h-full object-cover" />
                    ) : (
                      (organizer.organizerName || "O").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1 truncate">
                    <h3 className="font-bold text-white text-base truncate">{organizer.organizerName || organizer.businessName}</h3>
                    {organizer.location && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{organizer.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {organizer.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed font-light line-clamp-3">
                    {organizer.description}
                  </p>
                )}

                <Link
                  to={USER_ROUTES.ORGANIZER_PROFILE.replace(":id", organizer._id)}
                  className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/30 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Organizer Profile</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Permanent Booking Restriction Notice Card */}
            <div className="bg-[#0a0717] border border-purple-500/20 rounded-3xl p-6 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto shadow-md">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-white text-base">Completed Event Showcase</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  This event has concluded. Booking options and ticket sales are permanently closed for completed past events.
                </p>
              </div>

              <div className="pt-2">
                <button
                  disabled
                  className="w-full py-3.5 bg-[#120e29] border border-zinc-800 text-zinc-500 text-xs font-extrabold rounded-xl cursor-not-allowed uppercase tracking-wider shadow-inner"
                >
                  Bookings Closed
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal for Gallery Images */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer z-50"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30">
            <img src={lightboxImage} alt="Enlarged event gallery preview" className="w-full h-full object-contain max-h-[85vh]" />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserPastEventDetails;
