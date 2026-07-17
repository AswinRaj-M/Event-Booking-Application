import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
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
  Info
} from "lucide-react";
import { toast } from "sonner";
import UserSideBar from "../../components/user/UserSideBar";
import { USER_ROUTES } from "../../constants/Routes";
import { getBookingHistory } from "../../services/user.api.js";

const MyBookings = () => {
  const user = useSelector((state) => state.user?.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past, cancelled
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookings on load
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await getBookingHistory();
        if (res.data?.success) {
          setBookings(res.data.history || []);
        } else {
          setError("Failed to fetch booking history.");
        }
      } catch (err) {
        console.error("Fetch bookings error:", err);
        setError(err.response?.data?.message || "Could not retrieve booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

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

  // Filter and process bookings based on activeTab and search query
  const filteredBookings = bookings.filter((booking) => {
    const title = booking.eventId?.title || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());

    const eventDate = booking.eventId?.schedule?.date ? new Date(booking.eventId.schedule.date) : null;
    const now = new Date();

    // Determine booking tab
    let bookingTab = "upcoming";
    if (booking.bookingStatus === "cancelled") {
      bookingTab = "cancelled";
    } else if (booking.bookingStatus === "checked-in" || (eventDate && eventDate < now)) {
      bookingTab = "past";
    }

    return bookingTab === activeTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "cancelled":
        return (
          <span className="px-3 py-1 rounded-full border border-rose-500/20 bg-rose-950/30 text-rose-400 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
            Cancelled
          </span>
        );
      case "checked-in":
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/40 text-zinc-400 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
            Completed
          </span>
        );
      case "confirmed":
        return (
          <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-950/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
            Confirmed
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-3 py-1 rounded-full border border-amber-500/20 bg-amber-950/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
            Pending
          </span>
        );
    }
  };

  const handleActionClick = (actionName) => {
    toast.info(`${actionName} is simulation placeholder`);
  };

  const handleCancelClick = () => {
    toast.info("Please contact the event organizer directly to request a ticket cancellation or refund.");
  };

  return (
    <div className="flex min-h-screen bg-[#05050C] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar Navigation */}
      <UserSideBar />

      {/* Main Container Area */}
      <main className="flex-1 ml-64 p-8 min-h-screen relative z-10 flex flex-col">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo-900/10 rounded-full blur-[160px] pointer-events-none -z-10" />

        {/* Top Header Row */}
        <div className="flex justify-between items-center mb-8 relative z-20">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">My Tickets</h1>
            <p className="text-sm text-zinc-400">View and manage your upcoming and past event tickets.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Browse Events Button */}
            <Link to={USER_ROUTES.EXPLORE}>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer">
                <Plus className="w-4 h-4" />
                Browse Events
              </button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Tabs Panel */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 relative z-20">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
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
          <div className="flex items-center bg-[#0b0914] p-1.5 rounded-xl border border-zinc-850 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 sm:flex-none px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "upcoming"
                  ? "bg-[#1C1A30] text-purple-300 border border-purple-500/15"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`flex-1 sm:flex-none px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "past"
                  ? "bg-[#1C1A30] text-purple-300 border border-purple-500/15"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Past Events
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`flex-1 sm:flex-none px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "cancelled"
                  ? "bg-[#1C1A30] text-purple-300 border border-purple-500/15"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Cancelled
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
          <div className="space-y-6 relative z-10 flex-grow">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => {
                const event = booking.eventId;
                const title = event?.title || "Untitled Event";
                const category = event?.category?.name || (event?.eventType === "Online" ? "Online Event" : "In-person Event");
                const imageUrl = event?.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop";
                const isCompleted = activeTab === "past" || booking.bookingStatus === "checked-in";

                return (
                  <div 
                    key={booking._id}
                    className="bg-[#0b0914]/60 border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/15 hover:shadow-[0_0_25px_rgba(139,92,246,0.03)] transition-all flex flex-col md:flex-row h-full group animate-fadeIn"
                  >
                    {/* Event Image Column */}
                    <div className="relative w-full md:w-56 h-48 md:h-auto bg-[#121021] shrink-0 overflow-hidden">
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
                    <div className="p-6 md:p-7 flex-1 flex flex-col md:flex-row justify-between gap-6">
                      {/* Left Specs */}
                      <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                          {/* Date & Time Row */}
                          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                            <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>
                              {getFormattedDate(event?.schedule?.date)} • {event?.schedule?.startTime || "TBA"}
                            </span>
                          </div>

                          {/* Event Title */}
                          <h3 className="text-xl font-extrabold text-white leading-tight group-hover:text-purple-400 transition-colors">
                            {title}
                          </h3>

                          {/* Venue Location Row */}
                          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                            <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="truncate">
                              {event?.eventType === "Online" ? "Online Event" : `${event?.venue || "Venue TBA"}, ${event?.city || "TBA"}`}
                            </span>
                          </div>
                        </div>

                        {/* Metadata details block */}
                        <div className="grid grid-cols-3 gap-4 pt-1 max-w-sm">
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
                      <div className="flex flex-col justify-between items-end md:w-48 gap-4">
                        {/* Status Badge */}
                        {getStatusBadge(booking.bookingStatus)}

                        {/* Actions Grid */}
                        <div className="w-full space-y-2 pt-4">
                          {isCompleted ? (
                            <div className="flex flex-col gap-2 w-full">
                              {/* Review, Details, Invoice Actions */}
                              <div className="flex justify-end gap-3 text-zinc-400 text-xs font-semibold">
                                <button 
                                  onClick={() => handleActionClick("Add Review")}
                                  className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Add Review
                                </button>
                                <button 
                                  onClick={() => handleActionClick("View Details")}
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
                                    onClick={handleCancelClick}
                                    className="flex-1 py-2 px-3 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => handleActionClick("View Ticket QR")}
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
      </main>
    </div>
  );
};

export default MyBookings;
