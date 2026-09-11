import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight,
  MapPin, 
  Calendar, 
  Star, 
  Ticket, 
  Image as ImageIcon, 
  MessageSquare, 
  ShieldCheck, 
  Check, 
  Info, 
  Sparkles, 
  X,
  ExternalLink,
  Award,
  Clock,
  Maximize2,
  UserPlus,
  UserCheck,
  Users,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { USER_ROUTES } from "../../constants/Routes";
import { getOrganizerProfileApi, toggleFollowOrganizerApi } from "../../services/user.api.js";

const StarRating = ({ rating = 5, size = "w-4 h-4" }) => (
  <div className="flex items-center gap-1 text-amber-400 shrink-0">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`${size} ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
      />
    ))}
  </div>
);

const VendorOrganizerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'gallery', 'events', 'reviews'

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingLoading, setFollowingLoading] = useState(false);

  // Completed Events Pagination State
  const [completedEvents, setCompletedEvents] = useState([]);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const [eventsLimit] = useState(6);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Initial Fetch Organizer Profile
  const fetchOrganizerProfile = useCallback(async (page = 1) => {
    try {
      if (page === 1) setLoading(true);
      else setEventsLoading(true);
      setError(null);

      const res = await getOrganizerProfileApi(id, { eventsPage: page, eventsLimit: 6 });
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setProfileData(data);
        setCompletedEvents(data.completedEvents || []);
        setEventsPage(data.eventsCurrentPage || page);
        setEventsTotalPages(data.eventsTotalPages || 1);
        setIsFollowing(!!data.isFollowing);
        setFollowersCount(data.followersCount || 0);
      } else {
        setError("Organizer profile not found.");
      }
    } catch (err) {
      console.error("Organizer profile error:", err);
      setError(err.response?.data?.message || "Failed to load organizer profile.");
    } fontFinally: {
      setLoading(false);
      setEventsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrganizerProfile(1);
  }, [fetchOrganizerProfile]);

  // Handle Event Page Navigation
  const handleEventsPageChange = async (newPage) => {
    if (newPage < 1 || newPage > eventsTotalPages || newPage === eventsPage || eventsLoading) return;
    try {
      setEventsLoading(true);
      const res = await getOrganizerProfileApi(id, { eventsPage: newPage, eventsLimit: eventsLimit });
      if (res.data?.success && res.data.data) {
        setCompletedEvents(res.data.data.completedEvents || []);
        setEventsPage(res.data.data.eventsCurrentPage || newPage);
        setEventsTotalPages(res.data.data.eventsTotalPages || 1);
        
        // Smooth scroll to past events section
        const eventsEl = document.getElementById("past-events-section");
        if (eventsEl) {
          eventsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } catch (err) {
      console.error("Failed to fetch events page:", err);
      toast.error("Failed to load events page");
    } finally {
      setEventsLoading(false);
    }
  };

  // Handle Follow / Unfollow Toggle
  const handleFollowToggle = async () => {
    if (followingLoading) return;
    try {
      setFollowingLoading(true);
      const res = await toggleFollowOrganizerApi(id);
      if (res.data?.success) {
        const nextState = !!res.data.isFollowing;
        const nextCount = res.data.followersCount !== undefined ? res.data.followersCount : followersCount;
        setIsFollowing(nextState);
        setFollowersCount(nextCount);
        if (nextState) {
          toast.success(`You are now following ${profileData?.vendor?.organizerName || "the organizer"}`);
        } else {
          toast.info(`Unfollowed ${profileData?.vendor?.organizerName || "the organizer"}`);
        }
      }
    } catch (err) {
      console.error("Follow error:", err);
      const msg = err.response?.data?.message || "Failed to update follow status. Please log in first.";
      toast.error(msg);
    } finally {
      setFollowingLoading(false);
    }
  };

  const vendor = profileData?.vendor;
  const reviews = profileData?.reviews || [];
  const avgRating = profileData?.avgRating || 0;
  const totalReviews = profileData?.totalReviews || 0;
  const totalCompletedEvents = profileData?.totalCompletedEvents || 0;

  const galleryImages = useMemo(() => {
    return vendor?.portfolioPictures || [];
  }, [vendor]);

  const locationString = useMemo(() => {
    if (!vendor?.location) return "Location TBA";
    const { city, state, country } = vendor.location;
    return [city, state, country].filter(Boolean).join(", ") || "Location TBA";
  }, [vendor]);

  const formatEventDate = (dateStr, startTime) => {
    if (!dateStr) return "Date TBA";
    try {
      const d = new Date(dateStr);
      const formatted = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      return startTime ? `${formatted} • ${startTime}` : formatted;
    } catch (_) {
      return "Date TBA";
    }
  };

  const formatReviewDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    } catch (_) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050C] text-white font-sans w-full overflow-hidden flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 pb-20 max-w-7xl mx-auto w-full px-4 md:px-8 space-y-12">
          {/* Header Skeleton */}
          <div className="w-full h-80 bg-zinc-900/40 rounded-3xl animate-pulse border border-white/5 p-8 flex flex-col justify-end">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-zinc-800" />
              <div className="space-y-3 flex-1">
                <div className="h-7 bg-zinc-800 w-1/3 rounded" />
                <div className="h-4 bg-zinc-800 w-1/4 rounded" />
              </div>
            </div>
          </div>
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-zinc-900/40 rounded-3xl animate-pulse" />
            <div className="h-64 bg-zinc-900/40 rounded-3xl animate-pulse" />
            <div className="h-64 bg-zinc-900/40 rounded-3xl animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-[#05050C] text-white font-sans w-full overflow-hidden flex flex-col">
        <Navbar />
        <main className="flex-grow pt-40 pb-28 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto relative z-10">
          <div className="w-16 h-16 rounded-full bg-purple-950/45 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 animate-pulse">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-3 tracking-tight">Organizer Unavailable</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            {error || "We couldn't load this organizer profile. The page might be removed or blocked."}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              Go Back
            </button>
            <Link
              to={USER_ROUTES.EXPLORE}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Explore Events
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const name = vendor.organizerName || vendor.businessName || "Event Organizer";
  const avatarUrl = vendor.profilePicture?.fileUrl;
  const coverUrl = vendor.coverImage?.fileUrl;
  const categoryName = vendor.eventCategory || "Event Organizer";

  return (
    <div className="min-h-screen bg-[#05050C] text-white font-sans selection:bg-purple-500/30 w-full overflow-hidden flex flex-col relative">
      <Navbar />

      {/* Glow Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[700px] -left-20 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-[400px] -right-20 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Main Content Area */}
      <main className="flex-grow pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
        {/* Navigation Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-purple-400 text-xs font-bold uppercase tracking-wider transition-colors group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to previous page
          </button>
        </div>

        {/* Profile Header Card */}
        <section className="relative bg-[#0b0914]/85 border border-purple-500/15 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] mb-12 backdrop-blur-md">
          {/* Banner Backdrop */}
          <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-gradient-to-r from-purple-950 via-indigo-950 to-black">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={name}
                className="w-full h-full object-cover brightness-75"
              />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-indigo-950/60 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0914] via-[#0b0914]/40 to-transparent" />
          </div>

          {/* Profile Details Header Content */}
          <div className="relative px-6 sm:px-8 md:px-10 pb-8 -mt-20 sm:-mt-24 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 w-full md:w-auto">
              {/* Profile Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-purple-900/60 via-indigo-950 to-black border-4 border-[#0b0914] shadow-[0_0_30px_rgba(147,51,234,0.3)] overflow-hidden flex items-center justify-center select-none">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-purple-300">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div
                  className="absolute bottom-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-[#0b0914] shadow-md"
                  title="Verified Festivo Curator"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              {/* Title, Metadata & Follow Button */}
              <div className="space-y-3 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                    {categoryName}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Verified Organizer
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                    {name}
                  </h1>

                  {/* Follow / Unfollow Button */}
                  <button
                    onClick={handleFollowToggle}
                    disabled={followingLoading}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md border ${
                      isFollowing
                        ? "bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/80 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-purple-500/30 text-white shadow-[0_0_20px_rgba(147,51,234,0.35)]"
                    } disabled:opacity-50`}
                  >
                    {followingLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow Organizer</span>
                      </>
                    )}
                  </button>
                </div>

                {vendor.businessName && vendor.businessName !== vendor.organizerName && (
                  <p className="text-xs sm:text-sm text-purple-300 font-semibold">
                    {vendor.businessName}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium pt-1">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{locationString}</span>
                </div>
              </div>
            </div>

            {/* Overall Rating & Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t border-white/5 md:border-t-0">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-amber-400 font-black text-lg sm:text-xl">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{avgRating > 0 ? avgRating.toFixed(1) : "N/A"}</span>
                </div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-0.5">Rating</span>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-purple-300 font-black text-lg sm:text-xl">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>{followersCount}</span>
                </div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-0.5">Followers</span>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-purple-300 font-black text-lg sm:text-xl">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>{totalReviews}</span>
                </div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-0.5">Reviews</span>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-purple-300 font-black text-lg sm:text-xl">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>{totalCompletedEvents}</span>
                </div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-0.5">Completed</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {vendor.description && (
            <div className="px-6 sm:px-8 md:px-10 pb-8 pt-2 border-t border-white/5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-purple-400 mb-2">About the Organizer</h3>
              <p className="text-zinc-300 text-sm leading-relaxed font-light whitespace-pre-line max-w-4xl">
                {vendor.description}
              </p>
            </div>
          )}
        </section>

        {/* Section Tabs Selector */}
        <div className="flex items-center bg-[#0b0914] p-1.5 rounded-2xl border border-purple-500/20 mb-10 overflow-x-auto max-w-full scrollbar-none w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all"
                ? "bg-[#1C1A30] text-purple-300 border border-purple-500/20 shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Overview All
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "gallery"
                ? "bg-[#1C1A30] text-purple-300 border border-purple-500/20 shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Gallery</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20 text-purple-300">
              {galleryImages.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "events"
                ? "bg-[#1C1A30] text-purple-300 border border-purple-500/20 shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Past Events</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20 text-purple-300">
              {totalCompletedEvents}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "reviews"
                ? "bg-[#1C1A30] text-purple-300 border border-purple-500/20 shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Reviews</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20 text-purple-300">
              {totalReviews}
            </span>
          </button>
        </div>

        {/* Organizer Gallery Section */}
        {(activeTab === "all" || activeTab === "gallery") && (
          <section className="mb-14 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
              <h2 className="text-2xl font-bold tracking-tight text-white">Organizer Portfolio Gallery</h2>
            </div>

            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((img, index) => (
                  <div
                    key={img._id || index}
                    onClick={() => setLightboxImage(img.fileUrl)}
                    className="relative rounded-2xl overflow-hidden aspect-square border border-white/10 group cursor-pointer hover:border-purple-500/40 transition-all duration-300 shadow-lg bg-[#120f26]"
                  >
                    <img
                      src={img.fileUrl}
                      alt={`Portfolio Image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                      <span className="text-xs text-white font-medium">Image #{index + 1}</span>
                      <Maximize2 className="w-4 h-4 text-purple-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0b0914]/50 border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">No Gallery Images</h4>
                <p className="text-zinc-400 text-xs">The organizer has not uploaded any portfolio gallery pictures yet.</p>
              </div>
            )}
          </section>
        )}

        {/* Past Completed Events Section (with Backend Pagination) */}
        {(activeTab === "all" || activeTab === "events") && (
          <section id="past-events-section" className="mb-14 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Past Completed Events</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Events hosted and successfully completed by {name}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-bold">
                {totalCompletedEvents} Total Event{totalCompletedEvents !== 1 ? "s" : ""}
              </span>
            </div>

            {eventsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#0b0914]/60 border border-white/5 rounded-3xl overflow-hidden h-64 animate-pulse" />
                ))}
              </div>
            ) : completedEvents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedEvents.map((event) => {
                    const categoryName = event.category?.name || "Event";
                    const imageUrl = event.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop";

                    return (
                      <Link
                        key={event._id}
                        to={USER_ROUTES.EVENT_DETAILS.replace(":id", event._id)}
                        className="bg-[#0b0914]/80 border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 group flex flex-col shadow-2xl hover:-translate-y-1.5 backdrop-blur-md text-left"
                      >
                        <div className="relative h-48 bg-[#120f26] overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 z-20">
                            <span className="bg-purple-950/80 border border-purple-500/20 backdrop-blur-md text-purple-300 text-[10px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider">
                              {categoryName}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 z-20">
                            <span className="bg-zinc-950/80 border border-zinc-800 backdrop-blur-md text-zinc-400 text-[10px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider">
                              Completed
                            </span>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-2">
                              {event.title}
                            </h3>
                            <div className="space-y-1.5 text-xs text-zinc-400 font-medium">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span>{formatEventDate(event.schedule?.date, event.schedule?.startTime)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span className="truncate">{event.eventType === "Online" ? "Online Event" : `${event.venue || "Venue"}, ${event.city || ""}`}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-purple-400 font-bold group-hover:text-purple-300">
                            <span>View Event Details</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Backend Pagination Bar */}
                {eventsTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      onClick={() => handleEventsPageChange(eventsPage - 1)}
                      disabled={eventsPage <= 1 || eventsLoading}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: eventsTotalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handleEventsPageChange(pageNum)}
                          disabled={eventsLoading}
                          className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            eventsPage === pageNum
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400/40 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                              : "bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleEventsPageChange(eventsPage + 1)}
                      disabled={eventsPage >= eventsTotalPages || eventsLoading}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#0b0914]/50 border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <Ticket className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">No Completed Events</h4>
                <p className="text-zinc-400 text-xs">This organizer does not have any completed events listed yet.</p>
              </div>
            )}
          </section>
        )}

        {/* Customer Ratings & Reviews Section */}
        {(activeTab === "all" || activeTab === "reviews") && (
          <section className="mb-14 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Attendee Ratings & Feedback</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Verified reviews submitted by attendees</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-bold">
                {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const reviewerName = rev.userId?.fullName || "Verified Attendee";
                  const reviewerAvatar = rev.userId?.profilePicture?.fileUrl;
                  const eventTitle = rev.eventId?.title;

                  return (
                    <div
                      key={rev._id}
                      className="bg-[#0b0914]/80 border border-white/10 hover:border-purple-500/30 rounded-3xl p-5 sm:p-6 transition-all shadow-lg backdrop-blur-md text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-950/60 border border-purple-500/30 overflow-hidden flex items-center justify-center text-xs font-bold text-purple-300 shrink-0 select-none">
                            {reviewerAvatar ? (
                              <img src={reviewerAvatar} alt={reviewerName} className="w-full h-full object-cover" />
                            ) : (
                              reviewerName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{reviewerName}</h4>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase">
                                Verified
                              </span>
                            </div>
                            {eventTitle && (
                              <p className="text-[11px] text-zinc-400 font-medium">
                                Reviewed for <span className="text-purple-300 font-semibold">{eventTitle}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          <StarRating rating={rev.rating} size="w-3.5 h-3.5" />
                          <span className="text-xs text-zinc-500 font-semibold">
                            {formatReviewDate(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light whitespace-pre-line pl-1 sm:pl-13">
                        "{rev.feedback}"
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#0b0914]/50 border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">No Reviews Yet</h4>
                <p className="text-zinc-400 text-xs">This organizer does not have any customer reviews yet.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Gallery Lightbox Modal */}
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
            <img src={lightboxImage} alt="Enlarged gallery preview" className="w-full h-full object-contain max-h-[85vh]" />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VendorOrganizerProfile;
