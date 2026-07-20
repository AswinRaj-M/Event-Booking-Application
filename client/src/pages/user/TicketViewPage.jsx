import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  User, 
  Download, 
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Bookmark
} from "lucide-react";
import { getBookingDetails } from "../../services/user.api.js";
import { USER_ROUTES } from "../../constants/Routes";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { toast } from "sonner";

const TicketViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const res = await getBookingDetails(id);
        if (res.data?.success) {
          setBooking(res.data.booking);
        } else {
          setError("Failed to load ticket details.");
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError(err.response?.data?.message || "Could not retrieve ticket information.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const handleDownloadTicket = () => {
    toast.success("Downloading ticket PDF...");
    // Mock PDF generation by printing the ticket card section
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050C] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-zinc-400 text-sm font-medium">Retrieving ticket details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#05050C] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-3xl p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Failed to load ticket</h2>
            <p className="text-zinc-400 text-sm mb-6">{error || "The ticket you are looking for does not exist."}</p>
            <Link to={USER_ROUTES.BOOKINGS}>
              <button className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
                Back to Bookings
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isPending = booking.bookingStatus === "pending";
  const event = booking.eventId;
  
  // Dynamic theme values
  const themeColorClass = isPending ? "text-amber-400" : "text-purple-400";
  const themeBorderClass = isPending ? "border-amber-500/20 hover:border-amber-500/30" : "border-purple-500/20 hover:border-purple-500/30";
  const themeBgGradientClass = isPending ? "from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800" : "from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700";
  const themeGlowClass = isPending ? "bg-amber-600/10 shadow-[0_0_50px_rgba(245,158,11,0.15)]" : "bg-purple-600/10 shadow-[0_0_50px_rgba(139,92,246,0.15)]";
  const themeLogoGlow = isPending ? "shadow-[0_0_25px_rgba(245,158,11,0.5)] border-amber-500/30" : "shadow-[0_0_25px_rgba(139,92,246,0.5)] border-purple-500/30";
  const themeDotColor = isPending ? "bg-amber-500" : "bg-purple-500";

  // Date formatter helper
  const formatEventDate = (dateString) => {
    if (!dateString) return "Date TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return "Date TBA";
    }
  };

  return (
    <div className="min-h-screen bg-[#05050C] text-white flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Lights */}
      <div className={`absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-[120px] pointer-events-none -z-10 transition-all duration-500 ${isPending ? 'bg-amber-500/5' : 'bg-purple-500/5'}`} />
      
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8 max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
        {/* Status Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Logo / Ring structure */}
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-5 bg-[#05050C] ${themeLogoGlow}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-opacity-20 animate-pulse ${isPending ? 'bg-amber-500' : 'bg-purple-500'}`}>
              <div className={`w-3.5 h-3.5 rounded-full ${themeDotColor}`} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            {isPending ? "Booking Pending!" : "Booking Confirmed!"}
          </h1>

          {/* Subheading */}
          <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed">
            {isPending 
              ? "Your booking is currently pending. Please wait for host authorization or payment clearance."
              : "Your tickets are successfully booked and sent to your email. Get ready for an amazing experience!"
            }
          </p>
        </div>

        {/* The Ticket Component Container */}
        <div className={`w-full bg-[#0b0914]/80 border backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[440px] transition-all duration-500 ${themeBorderClass}`}>
          
          {/* Left Ticket Part */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Event Image Banner */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6">
                <img 
                  src={event?.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop"} 
                  alt={event?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md bg-[#05050C]/80 border ${isPending ? 'border-amber-500/30 text-amber-400' : 'border-purple-500/30 text-purple-400'}`}>
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>

              {/* Event Title */}
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                {event?.title}
              </h2>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                {/* Date & Time */}
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 ${themeColorClass}`}>
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-1">Date & Time</span>
                    <p className="text-white text-xs font-bold leading-tight">{formatEventDate(event?.schedule?.date)}</p>
                    <p className="text-zinc-400 text-[10px] font-semibold mt-0.5">{event?.schedule?.startTime} - {event?.schedule?.endTime || "TBA"}</p>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 ${themeColorClass}`}>
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-1">Venue</span>
                    <p className="text-white text-xs font-bold leading-tight line-clamp-1">{event?.venue}</p>
                    <p className="text-zinc-400 text-[10px] font-semibold mt-0.5 line-clamp-1">{event?.city || event?.address}</p>
                  </div>
                </div>

                {/* Ticket Type */}
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 ${themeColorClass}`}>
                    <Ticket className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-1">Ticket Type</span>
                    <p className="text-white text-xs font-bold leading-tight">{booking.tierName || "General Admission"}</p>
                    <p className="text-zinc-400 text-[10px] font-semibold mt-0.5">Seat: General Entry</p>
                  </div>
                </div>

                {/* Guests */}
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 ${themeColorClass}`}>
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-1">Guests</span>
                    <p className="text-white text-xs font-bold leading-tight">{booking.quantity} Guest{booking.quantity > 1 ? 's' : ''}</p>
                    <p className="text-zinc-400 text-[10px] font-semibold mt-0.5">Standard Admission</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider line before price section */}
            <div className="border-t border-zinc-800/60 my-6 pt-5 flex justify-between items-center">
              <div>
                <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-0.5">Order ID</span>
                <p className="text-white text-xs font-bold">#{booking.bookingId || id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-0.5">Total Paid</span>
                <p className={`text-xl font-extrabold ${themeColorClass}`}>${booking.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Separation Divider (with cutouts) */}
          <div className="relative flex flex-row md:flex-col justify-between items-center w-full md:w-auto h-px md:h-auto my-0 mx-6 md:mx-0">
            {/* Top cutout */}
            <div className={`hidden md:block absolute top-[-10px] left-1/2 -translate-x-1/2 w-5 h-5 bg-[#05050C] rounded-full border-b transition-all duration-500 ${isPending ? 'border-amber-500/20' : 'border-purple-500/20'}`} />
            {/* Dotted border line */}
            <div className="w-full md:w-px md:h-full border-t-2 md:border-l-2 border-dashed border-zinc-800/80 self-stretch my-2" />
            {/* Bottom cutout */}
            <div className={`hidden md:block absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-5 h-5 bg-[#05050C] rounded-full border-t transition-all duration-500 ${isPending ? 'border-amber-500/20' : 'border-purple-500/20'}`} />
          </div>

          {/* Right Ticket Part */}
          <div className="w-full md:w-80 p-6 md:p-8 flex flex-col justify-between items-center bg-[#0d0a1c]/30">
            
            {/* Inner aesthetic display instead of QR code */}
            <div className="flex-grow flex flex-col items-center justify-center text-center py-6 w-full">
              <div className={`w-28 h-28 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 ${themeGlowClass}`}>
                <Bookmark className={`w-12 h-12 ${themeColorClass}`} />
              </div>
              <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-1">Ticket Holder</span>
              <h3 className="text-xl font-extrabold text-white truncate max-w-full px-2" title={booking.userId?.fullName}>
                {booking.userId?.fullName || "Alex Morgan"}
              </h3>
              <p className="text-zinc-500 text-xs mt-1 truncate max-w-full px-2" title={booking.userId?.email}>
                {booking.userId?.email}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3.5 mt-6">
              <button 
                onClick={handleDownloadTicket}
                className={`w-full py-3.5 px-4 bg-gradient-to-r text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${themeBgGradientClass}`}
              >
                <Download className="w-4 h-4" />
                Download Ticket
              </button>

              <Link to={USER_ROUTES.BOOKINGS} className="block w-full">
                <button className="w-full py-3.5 px-4 bg-[#12101F] hover:bg-[#1C1A30] border border-zinc-800/80 hover:border-zinc-700/80 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center">
                  View My Bookings
                </button>
              </Link>
            </div>

          </div>

        </div>

        {/* Back Link */}
        <Link to={USER_ROUTES.BOOKINGS} className="mt-8 flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </Link>
      </main>
      
      <Footer />
    </div>
  );
};

export default TicketViewPage;
