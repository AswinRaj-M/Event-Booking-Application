import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUserData } from "../../features/user.slice";
import { 
  Search, 
  Bell, 
  Calendar, 
  MapPin, 
  Share2, 
  Download, 
  MessageSquare, 
  FileText, 
  Eye, 
  Plus,
  ShieldCheck,
  Info,
  Star,
  X,
  Check,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import UserSideBar from "../../components/user/UserSideBar";
import NotificationBell from "../../components/common/NotificationBell";
import { USER_ROUTES } from "../../constants/Routes";
import { 
  getBookingHistory, 
  cancelTicketApi, 
  cancelBookingApi,
  submitOrganizerReviewApi,
  getMyReviewsApi
} from "../../services/user.api.js";

const MyBookings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past, cancelled
  const [bookings, setBookings] = useState([]);
  const [userReviews, setUserReviews] = useState({}); // { [eventId]: review }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Fetch bookings and user reviews helper
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsRes, reviewsRes] = await Promise.all([
        getBookingHistory(),
        getMyReviewsApi().catch(() => ({ data: { success: false, reviews: [] } })),
      ]);

      if (bookingsRes.data?.success) {
        const rawList = bookingsRes.data.history || bookingsRes.data.bookings || [];
        setBookings(Array.isArray(rawList) ? rawList : []);
      } else {
        setError("Failed to fetch booking history.");
      }

      if (reviewsRes.data?.success && Array.isArray(reviewsRes.data.reviews)) {
        const reviewMap = {};
        reviewsRes.data.reviews.forEach((r) => {
          const evId = r.eventId?._id || r.eventId;
          if (evId) {
            reviewMap[evId] = r;
          }
        });
        setUserReviews(reviewMap);
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError(err.response?.data?.message || "Could not retrieve booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewRating(5);
    setReviewHoverRating(0);
    setReviewFeedback("");
    setReviewError(null);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    if (submittingReview) return;
    setIsReviewModalOpen(false);
    setSelectedBookingForReview(null);
    setReviewFeedback("");
    setReviewError(null);
  };

  const handleReviewSubmit = async () => {
    if (!selectedBookingForReview) return;

    if (!reviewFeedback || reviewFeedback.trim().length < 5) {
      setReviewError("Please write at least 5 characters of feedback.");
      return;
    }

    if (reviewFeedback.trim().length > 1000) {
      setReviewError("Feedback cannot exceed 1000 characters.");
      return;
    }

    const eventId = selectedBookingForReview.eventId?._id;
    if (!eventId) {
      toast.error("Invalid event reference for review.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);

      const res = await submitOrganizerReviewApi({
        eventId,
        rating: reviewRating,
        feedback: reviewFeedback.trim(),
      });

      if (res.data?.success) {
        toast.success("Thank you for your feedback! Your review has been submitted.");
        // Immediately record in local userReviews map
        const newReview = res.data.review || {
          eventId,
          rating: reviewRating,
          feedback: reviewFeedback.trim(),
          createdAt: new Date().toISOString(),
        };
        setUserReviews((prev) => ({
          ...prev,
          [eventId]: newReview,
        }));
        closeReviewModal();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      const msg = err.response?.data?.message || "Failed to submit review. Please try again.";
      setReviewError(msg);
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Format Date Helper
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "Date TBA";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    } catch (_) {
      return "Date TBA";
    }
  };

  // Helper to accurately determine when an event's schedule actually finishes
  const getEventEndDateTime = (schedule) => {
    if (!schedule?.date) return null;
    const d = new Date(schedule.date);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = d.getMonth();
    const date = d.getDate();

    if (schedule.endTime) {
      const match = String(schedule.endTime).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3]?.toUpperCase();
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return new Date(year, month, date, hours, minutes, 59, 999);
      }
    }
    // If no endTime provided, consider it active until the end of that day (23:59:59)
    return new Date(year, month, date, 23, 59, 59, 999);
  };

  // Calculate dynamic counts for each tab
  const counts = useMemo(() => {
    let upcoming = 0;
    let past = 0;
    let cancelled = 0;

    const now = new Date();

    bookings.forEach((booking) => {
      // Exclude failed payments, expired checkout sessions, and pending uncompleted bookings
      if (
        booking.paymentStatus === "failed" ||
        booking.paymentStatus === "expired" ||
        booking.paymentStatus === "pending" ||
        booking.bookingStatus === "failed" ||
        booking.bookingStatus === "expired" ||
        booking.bookingStatus === "pending"
      ) {
        return;
      }

      const isCancelled = booking.bookingStatus === "cancelled" || booking.eventId?.eventStatus === "cancelled";
      const endDateTime = getEventEndDateTime(booking.eventId?.schedule);
      const isCompleted = 
        booking.bookingStatus === "checked-in" ||
        booking.bookingStatus === "completed" ||
        booking.eventId?.eventStatus === "completed" ||
        (endDateTime && now > endDateTime);

      if (isCancelled) {
        cancelled++;
      } else if (isCompleted) {
        past++;
      } else {
        upcoming++;
      }
    });

    return { upcoming, past, cancelled };
  }, [bookings]);

  // Filter and process bookings based on activeTab and search query
  const filteredBookings = bookings.filter((booking) => {
    // Exclude failed payments, expired checkout sessions, and pending uncompleted bookings
    if (
      booking.paymentStatus === "failed" ||
      booking.paymentStatus === "expired" ||
      booking.paymentStatus === "pending" ||
      booking.bookingStatus === "failed" ||
      booking.bookingStatus === "expired" ||
      booking.bookingStatus === "pending"
    ) {
      return false;
    }

    const title = booking.eventId?.title || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());

    const endDateTime = getEventEndDateTime(booking.eventId?.schedule);
    const now = new Date();

    const isCancelled = booking.bookingStatus === "cancelled" || booking.eventId?.eventStatus === "cancelled";
    
    // An event is completed/past ONLY if explicitly marked completed/checked-in OR its end time has truly elapsed
    const isCompleted = 
      booking.bookingStatus === "checked-in" ||
      booking.bookingStatus === "completed" ||
      booking.eventId?.eventStatus === "completed" ||
      (endDateTime && now > endDateTime);

    // Determine booking tab
    let bookingTab = "upcoming";
    if (isCancelled) {
      bookingTab = "cancelled";
    } else if (isCompleted) {
      bookingTab = "past";
    } else {
      bookingTab = "upcoming";
    }

    return bookingTab === activeTab && matchesSearch;
  });

  const getStatusBadge = (status, eventStatus, endDateTime) => {
    if (status === "cancelled" || eventStatus === "cancelled") {
      return (
        <span className="px-3 py-1 rounded-full border border-rose-500/20 bg-rose-950/30 text-rose-400 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
          Cancelled
        </span>
      );
    }
    if (status === "checked-in" || status === "completed" || eventStatus === "completed" || (endDateTime && new Date() > endDateTime)) {
      return (
        <span className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/40 text-zinc-400 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
          Completed
        </span>
      );
    }
    if (status === "confirmed") {
      return (
        <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-950/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
          Confirmed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full border border-amber-500/20 bg-amber-950/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
        Pending
      </span>
    );
  };

  const handleActionClick = (actionName, bookingId) => {
    if (actionName === "View Ticket QR" || actionName === "View Details") {
      navigate(USER_ROUTES.TICKET_VIEW.replace(":id", bookingId));
    } else {
      toast.info(`${actionName} is simulation placeholder`);
    }
  };

  const proceedCancelBooking = async (booking) => {
    try {
      toast.loading("Processing booking refund...", { id: "cancel-ticket-toast" });
      const bookingId = booking._id || booking.id;
      const res = await cancelBookingApi(bookingId);
      
      if (res.data?.newWalletBalance !== undefined && user) {
        dispatch(updateUserData({ ...user, walletBalance: res.data.newWalletBalance }));
      }
      
      toast.success(
        res.data?.message || "Booking cancelled successfully! Refund has been credited to your wallet.",
        { id: "cancel-ticket-toast" }
      );
      fetchBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error(
        err.response?.data?.message || "Failed to cancel booking. Please check cancellation deadline.",
        { id: "cancel-ticket-toast" }
      );
    }
  };

  const handleCancelClick = (booking) => {
    if (!booking || !booking.tickets || booking.tickets.length === 0) {
      toast.info("Please contact the event organizer directly to request a ticket cancellation or refund.");
      return;
    }

    const unCancelledTickets = booking.tickets.filter((t) => t.status !== "cancelled");
    if (unCancelledTickets.length === 0 || booking.bookingStatus === "cancelled") {
      toast.info("All tickets for this booking are already cancelled.");
      return;
    }

    const bookingCode = booking.bookingId || "Booking";
    toast("Cancel Booking Confirmation", {
      description: `Are you sure you want to cancel your booking (${bookingCode}) and refund the amount to your wallet?`,
      action: {
        label: "Confirm Cancel",
        onClick: () => proceedCancelBooking(booking),
      },
      cancel: {
        label: "Dismiss",
        onClick: () => {},
      },
      duration: 6000,
    });
  };

  return (
    <div className="flex min-h-screen bg-[#05050C] text-white font-sans selection:bg-purple-500/30 w-full max-w-full overflow-x-hidden relative">
      {/* Sidebar Navigation */}
      <UserSideBar />

      {/* Main Container Area */}
      <main className="flex-1 ml-64 p-4 sm:p-6 lg:p-8 min-h-screen relative z-10 flex flex-col min-w-0 max-w-[calc(100vw-16rem)] overflow-x-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo-900/10 rounded-full blur-[160px] pointer-events-none -z-10" />

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 relative z-20 w-full min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 truncate">My Tickets</h1>
            <p className="text-xs sm:text-sm text-zinc-400">View and manage your upcoming and past event tickets.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell Dropdown */}
            <NotificationBell />

            {/* Browse Events Button */}
            <Link to={USER_ROUTES.EXPLORE}>
              <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer whitespace-nowrap">
                <Plus className="w-4 h-4" />
                Browse Events
              </button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Tabs Panel */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-8 relative z-20 w-full min-w-0">
          {/* Search bar */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search by event name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0914] text-white placeholder-zinc-550 pl-11 pr-4 py-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
            />
          </div>

          {/* Toggle Tab Selectors */}
          <div className="flex items-center bg-[#0b0914] p-1.5 rounded-xl border border-zinc-800/80 w-full lg:w-auto overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 sm:flex-none px-3.5 sm:px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === "upcoming"
                  ? "bg-[#1C1A30] text-purple-300 border border-purple-500/15"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>Upcoming</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "upcoming" ? "bg-purple-500/20 text-purple-300" : "bg-zinc-800 text-zinc-400"}`}>
                {counts.upcoming}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`flex-1 sm:flex-none px-3.5 sm:px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === "past"
                  ? "bg-[#1C1A30] text-purple-300 border border-purple-500/15"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>Past Events</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "past" ? "bg-purple-500/20 text-purple-300" : "bg-zinc-800 text-zinc-400"}`}>
                {counts.past}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`flex-1 sm:flex-none px-3.5 sm:px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === "cancelled"
                  ? "bg-[#1C1A30] text-purple-300 border border-purple-500/15"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>Cancelled</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "cancelled" ? "bg-rose-500/20 text-rose-300" : "bg-zinc-800 text-zinc-400"}`}>
                {counts.cancelled}
              </span>
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400 text-sm">Loading your tickets...</p>
          </div>
        ) : error ? (
          <div className="flex-grow flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-purple-950/45 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 animate-pulse">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Error Loading Bookings</h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#1b1437]/80 hover:bg-[#251b4c] border border-purple-500/20 text-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          /* Tickets Cards List */
          <div className="space-y-6 relative z-10 flex-grow w-full min-w-0">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => {
                const event = booking.eventId;
                const title = event?.title || "Untitled Event";
                const category = event?.category?.name || (event?.eventType === "Online" ? "Online Event" : "In-person Event");
                const imageUrl = event?.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop";
                const endDateTime = getEventEndDateTime(event?.schedule);
                const isCompleted = 
                  activeTab === "past" || 
                  booking.bookingStatus === "checked-in" || 
                  booking.bookingStatus === "completed" || 
                  event?.eventStatus === "completed" || 
                  (endDateTime && new Date() > endDateTime);

                return (
                  <div 
                    key={booking._id}
                    className="bg-[#0b0914]/60 border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/15 hover:shadow-[0_0_25px_rgba(139,92,246,0.03)] transition-all flex flex-col lg:flex-row w-full min-w-0 group animate-fadeIn"
                  >
                    {/* Event Image Column */}
                    <div className="relative w-full lg:w-56 h-48 lg:h-auto min-h-[180px] bg-[#121021] shrink-0 overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      {/* Category Badge overlay */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md ${
                          isCompleted
                            ? "bg-zinc-950/80 border border-zinc-800 text-zinc-400" 
                            : "bg-purple-950/80 border border-purple-500/20 text-purple-400"
                        }`}>
                          {category}
                        </span>
                      </div>
                    </div>

                    {/* Info & Details Column */}
                    <div className="p-5 sm:p-6 lg:p-7 flex-1 flex flex-col md:flex-row justify-between gap-6 min-w-0">
                      {/* Left Specs */}
                      <div className="space-y-4 flex-1 min-w-0">
                        <div className="space-y-2 min-w-0">
                          {/* Date & Time Row */}
                          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                            <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="truncate">
                              {getFormattedDate(event?.schedule?.date)} • {event?.schedule?.startTime || "TBA"}
                            </span>
                          </div>

                          {/* Event Title */}
                          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight group-hover:text-purple-400 transition-colors break-words">
                            {title}
                          </h3>

                          {/* Venue Location Row */}
                          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium min-w-0">
                            <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="truncate">
                              {event?.eventType === "Online" ? "Online Event" : `${event?.venue || "Venue TBA"}, ${event?.city || "TBA"}`}
                            </span>
                          </div>
                        </div>

                        {/* Metadata details block */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-1 max-w-sm">
                          <div>
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Type</span>
                            <p className="text-white text-xs font-bold mt-1 truncate">{booking.tierName || "General"}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Tickets</span>
                            <p className="text-white text-xs font-bold mt-1">{booking.quantity} Ticket{booking.quantity > 1 ? "s" : ""}</p>
                          </div>
                          {booking.bookingId && (
                            <div>
                              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Order ID</span>
                              <p className="text-white text-xs font-bold mt-1 truncate">{booking.bookingId}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Actions & Status */}
                      <div className="flex flex-col justify-between items-start md:items-end w-full md:w-52 shrink-0 gap-4 min-w-0">
                        {/* Status Badge */}
                        <div className="self-start md:self-end">
                          {getStatusBadge(booking.bookingStatus, event?.eventStatus, endDateTime)}
                        </div>

                        {/* Actions Grid */}
                        <div className="w-full space-y-2 pt-2 md:pt-4 min-w-0">
                          {isCompleted ? (
                            <div className="flex flex-col gap-2.5 w-full">
                              {/* If user already reviewed this event, display their rating and feedback */}
                              {userReviews[event?._id] ? (
                                <div className="w-full bg-[#120f26]/90 border border-purple-500/25 rounded-2xl p-3 flex flex-col gap-1 shadow-sm text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                      Your Review
                                    </span>
                                    <div className="flex items-center gap-0.5 text-amber-400">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                          key={s}
                                          className={`w-3 h-3 ${
                                            s <= (userReviews[event._id]?.rating || 0)
                                              ? "fill-amber-400 text-amber-400"
                                              : "text-zinc-700"
                                          }`}
                                        />
                                      ))}
                                      <span className="text-xs font-bold text-white ml-1">
                                        {userReviews[event._id]?.rating}.0
                                      </span>
                                    </div>
                                  </div>
                                  {userReviews[event._id]?.feedback && (
                                    <p className="text-xs text-zinc-300 italic line-clamp-2 leading-relaxed font-light">
                                      "{userReviews[event._id].feedback}"
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <button 
                                  onClick={() => openReviewModal(booking)}
                                  className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.25)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  Rate Event Organizer
                                </button>
                              )}

                              {/* Details Action */}
                              <div className="flex justify-end gap-3 text-zinc-400 text-xs font-semibold">
                                <button 
                                  onClick={() => handleActionClick("View Details", booking._id)}
                                  className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Details
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 w-full">
                              <div className="flex justify-end gap-4 text-zinc-400 text-xs font-semibold mb-2">
                                <button 
                                  onClick={() => handleActionClick("Share Ticket")}
                                  className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  Share
                                </button>
                                <button 
                                  onClick={() => handleActionClick("Download PDF")}
                                  className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  PDF
                                </button>
                              </div>

                              {booking.bookingStatus !== "cancelled" && (
                                <div className="flex gap-2 w-full">
                                  <button 
                                    onClick={() => handleCancelClick(booking)}
                                    className="flex-1 py-2 px-3 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => handleActionClick("View Ticket QR", booking._id)}
                                    className="flex-1 py-2 px-3 bg-white text-[#05050C] hover:bg-zinc-200 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                  >
                                    View Ticket
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#0b0914]/20 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <p className="text-zinc-550 text-sm font-semibold mb-4">No tickets found in this tab.</p>
                <Link to={USER_ROUTES.EXPLORE}>
                  <button className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer">
                    Book Your First Event
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Rate Event Organizer Modal */}
        {isReviewModalOpen && selectedBookingForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#0b0914] border border-purple-500/30 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-[0_0_50px_rgba(147,51,234,0.15)] relative text-left">
              {/* Close Button */}
              <button
                onClick={closeReviewModal}
                disabled={submittingReview}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Rate Event Organizer
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                    {selectedBookingForReview.eventId?.title || "Event Feedback"}
                  </p>
                </div>
              </div>

              {/* Organizer Info Box */}
              <div className="bg-[#120f26] border border-purple-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Organizer</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {selectedBookingForReview.eventId?.vendorId?.organizerName ||
                     selectedBookingForReview.eventId?.vendorId?.businessName ||
                     "Event Organizer"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  Verified Attendee
                </span>
              </div>

              {/* Star Rating Picker */}
              <div className="mb-6 text-center bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  Select your rating
                </label>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (reviewHoverRating || reviewRating)
                            ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            : "text-zinc-700 hover:text-zinc-500"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-purple-400">
                  {reviewRating === 5 && "5.0 — Excellent! Outstanding experience"}
                  {reviewRating === 4 && "4.0 — Very Good! Really enjoyed it"}
                  {reviewRating === 3 && "3.0 — Good, average experience"}
                  {reviewRating === 2 && "2.0 — Fair, needs improvement"}
                  {reviewRating === 1 && "1.0 — Poor, unsatisfactory"}
                </span>
              </div>

              {/* Written Feedback Textarea */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Feedback <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    {reviewFeedback.length}/1000
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={reviewFeedback}
                  onChange={(e) => {
                    setReviewFeedback(e.target.value);
                    if (reviewError) setReviewError(null);
                  }}
                  placeholder="Enter your experience with the event organizer, organization, venue, and quality..."
                  className="w-full bg-[#05050c] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none font-light"
                />
                {reviewError && (
                  <p className="text-xs text-rose-400 mt-2 font-medium">
                    {reviewError}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold rounded-xl border border-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
