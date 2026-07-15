import React, { useState } from "react";
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
  Plus 
} from "lucide-react";
import UserSideBar from "../../components/user/UserSideBar";
import { USER_ROUTES } from "../../constants/Routes";
import avatarImg from "../../assets/vendor/common_avatar.png";

// Mock bookings data matching the screenshot exactly
const mockBookings = [
  {
    id: "1",
    title: "Electric Dreams Festival",
    category: "Music Festival",
    date: "Oct 24, 2024",
    time: "18:00 PM",
    venue: "The Grand Arena, Los Angeles",
    city: "Los Angeles",
    type: "VIP Access",
    tickets: "2 Adults",
    orderId: "#EDF-8821",
    status: "confirmed",
    tab: "upcoming",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "2",
    title: "Future Tech Summit 2024",
    category: "Conference",
    date: "Nov 12, 2024",
    time: "09:00 AM",
    venue: "Silicon Valley Convention Center",
    city: "San Jose",
    type: "Early Bird",
    tickets: "1 Adult",
    orderId: "#FTS-9902",
    status: "confirmed",
    tab: "upcoming",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "3",
    title: "Midnight Jazz & Blues",
    category: "Completed",
    date: "Sept 10, 2024",
    time: "20:00 PM",
    venue: "Blue Note Club, New York",
    city: "New York",
    type: "General",
    tickets: "2 Adults",
    orderId: "#MJB-7719",
    status: "completed",
    tab: "past",
    image: null // triggers "Image not available" placeholder
  }
];

const MyBookings = () => {
  const user = useSelector((state) => state.user?.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past, cancelled

  // Filter bookings based on activeTab and search query
  const filteredBookings = mockBookings.filter((booking) => {
    const matchesTab = booking.tab === activeTab;
    const matchesSearch = booking.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
            {/* Notification Bell */}
            <button className="p-2.5 text-zinc-400 hover:text-white transition-all bg-[#0b0914] hover:bg-[#120f24] rounded-full border border-white/5 cursor-pointer">
              <Bell className="w-5 h-5" />
            </button>
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
          {/* Search bar matching layout */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search by event name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0914] text-white placeholder-zinc-650 pl-11 pr-4 py-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
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

        {/* Tickets Cards List */}
        <div className="space-y-6 relative z-10">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-[#0b0914]/60 border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/15 hover:shadow-[0_0_25px_rgba(139,92,246,0.03)] transition-all flex flex-col md:flex-row h-full group"
              >
                {/* Event Image Column */}
                <div className="relative w-full md:w-56 h-48 md:h-auto bg-[#121021] shrink-0 overflow-hidden">
                  {booking.image ? (
                    <img 
                      src={booking.image} 
                      alt={booking.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-550"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1b1928]/45 flex flex-col items-center justify-center p-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center">Image not available</span>
                    </div>
                  )}

                  {/* Category Badge overlay */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md ${
                      booking.status === "completed" 
                        ? "bg-zinc-950/80 border border-zinc-800 text-zinc-400" 
                        : "bg-purple-950/80 border border-purple-500/20 text-purple-400"
                    }`}>
                      {booking.category}
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
                        <span>{booking.date} • {booking.time}</span>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-xl font-extrabold text-white leading-tight group-hover:text-purple-400 transition-colors">
                        {booking.title}
                      </h3>

                      {/* Venue Location Row */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="truncate">{booking.venue}</span>
                      </div>
                    </div>

                    {/* Metadata details block */}
                    <div className="grid grid-cols-3 gap-4 pt-1 max-w-sm">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Type</span>
                        <p className="text-white text-xs font-bold mt-1">{booking.type}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Tickets</span>
                        <p className="text-white text-xs font-bold mt-1">{booking.tickets}</p>
                      </div>
                      {booking.orderId && (
                        <div>
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Order ID</span>
                          <p className="text-white text-xs font-bold mt-1">{booking.orderId}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions & Status */}
                  <div className="flex flex-col justify-between items-end md:w-44 gap-4">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                      booking.status === "completed"
                        ? "bg-zinc-950/40 border-zinc-800 text-zinc-400"
                        : "bg-emerald-950/30 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {booking.status === "completed" ? "Completed" : "Confirmed"}
                    </span>

                    {/* Actions Grid */}
                    <div className="w-full space-y-2 pt-4">
                      {booking.status === "completed" ? (
                        <div className="flex flex-col gap-2 w-full">
                          {/* Review, Details, Invoice Actions */}
                          <div className="flex justify-end gap-3 text-zinc-400 text-xs font-semibold">
                            <button className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Add Review
                            </button>
                            <button className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
                              <Eye className="w-3.5 h-3.5" />
                              View Details
                            </button>
                            <button className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
                              <FileText className="w-3.5 h-3.5" />
                              Invoice
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 w-full">
                          <div className="flex justify-end gap-4 text-zinc-400 text-xs font-semibold mb-2">
                            <button className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
                              <Share2 className="w-3.5 h-3.5" />
                              Share
                            </button>
                            <button className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </button>
                          </div>

                          <div className="flex gap-2 w-full">
                            <button className="flex-1 py-2 px-3 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer">
                              Cancel Event
                            </button>
                            <button className="flex-1 py-2 px-3 bg-white text-[#05050C] hover:bg-zinc-200 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                              View Ticket
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#0b0914]/20 border border-white/5 rounded-3xl p-12 text-center">
              <p className="text-zinc-550 text-sm font-semibold">No tickets found in this category.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBookings;
