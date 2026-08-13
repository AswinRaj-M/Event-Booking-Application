import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Ticket as TicketIcon, 
  Users, 
  Download, 
  ArrowLeft,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { toPng } from "html-to-image";
import { getBookingDetails } from "../../services/user.api.js";
import { USER_ROUTES } from "../../constants/Routes";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { toast } from "sonner";

const TicketViewPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const ticketPassRef = useRef(null);

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
        setError("Failed to fetch tickets");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const handleDownloadTicket = async () => {
    if (!ticketPassRef.current) return;
    try {
      setDownloading(true);
      toast.loading("Generating your entry pass...", { id: "download-pass" });

      const dataUrl = await toPng(ticketPassRef.current, {
        cacheBust: true,
        backgroundColor: "#07060F",
        quality: 0.98,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Pass-${booking?.bookingId || id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Entry pass downloaded successfully!", { id: "download-pass" });
    } catch (err) {
      console.error("Error downloading pass:", err);
      toast.error("Failed to download entry pass", { id: "download-pass" });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07060F] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-zinc-400 text-sm font-medium">Generating your official entry pass...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#07060F] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-3xl p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Failed to load ticket</h2>
            <p className="text-zinc-400 text-sm mb-6">{error || "Ticket not found"}</p>
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

  const event = booking.eventId || {};
  const isPending = booking.bookingStatus === "pending";

  const formatEventDate = (dateString) => {
    if (!dateString) return "Date TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "2-digit", 
        year: "numeric" 
      });
    } catch (e) {
      return "Date TBA";
    }
  };

  const formatEventTime = (schedule) => {
    if (!schedule) return "Time TBA";
    const start = schedule.startTime || "08:00 PM";
    const end = schedule.endTime || "02:00 AM";
    return `${start} - ${end}`;
  };

  const eventBannerUrl = event.thumbnail?.fileUrl || event.thumbnail || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop";
  const holderName = booking.userId?.fullName || "Ticket Holder";
  const quantity = booking.quantity || 1;

  return (
    <div className="min-h-screen bg-[#07060F] text-white flex flex-col justify-between font-sans relative overflow-hidden selection:bg-purple-500/30">
      {/* Background ambient lighting */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[180px] pointer-events-none -z-10" />
      
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto w-full relative z-10 flex flex-col items-center">
        
        {/* Top Header Glow Badge & Confirmation Title */}
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Glowing concentric rings icon */}
          <div className="w-20 h-20 rounded-full bg-[#120B2E] border border-purple-500/30 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(139,92,246,0.4)] relative">
            <div className="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-400/50 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_15px_#ffffff]" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
            {isPending ? "Booking Pending!" : "Booking Confirmed!"}
          </h1>

          <p className="text-zinc-400 text-xs sm:text-sm md:text-base max-w-md mx-auto font-medium leading-relaxed">
            {isPending
              ? "Your booking is currently pending confirmation. Please check back shortly."
              : "Your tickets are successfully booked and sent to your email. Get ready for an amazing experience!"
            }
          </p>
        </div>

        {/* The Exact Ticket Card UI from Design */}
        <div 
          ref={ticketPassRef}
          className="w-full max-w-4xl bg-[#0D0B1C] border border-purple-500/20 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 relative">
            
            {/* Left Side: Event Details */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between relative z-10">
              
              {/* Event Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden mb-6 h-48 sm:h-52 w-full bg-zinc-950 border border-white/5">
                <img 
                  src={eventBannerUrl} 
                  alt={event.title || "Event Banner"} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1C] via-[#0D0B1C]/40 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-bold text-white border border-white/10">
                    Upcoming
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                    {event.title || "Neon Nights Festival"}
                  </h2>
                </div>
              </div>

              {/* 2x2 Event Meta Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                
                {/* Date & Time */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Date & Time</span>
                  </div>
                  <p className="text-sm font-bold text-white">{formatEventDate(event.schedule?.date)}</p>
                  <p className="text-xs text-zinc-400 font-medium">{formatEventTime(event.schedule)}</p>
                </div>

                {/* Venue */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Venue</span>
                  </div>
                  <p className="text-sm font-bold text-white line-clamp-1">{event.venue || "Skyline Arena"}</p>
                  <p className="text-xs text-zinc-400 font-medium line-clamp-1">
                    {event.city ? `${event.city}${event.address ? `, ${event.address}` : ''}` : "Brooklyn, New York"}
                  </p>
                </div>

                {/* Ticket Type */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
                    <TicketIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Ticket Type</span>
                  </div>
                  <p className="text-sm font-bold text-white">{booking.tierName || "VIP Access"}</p>
                  <p className="text-xs text-zinc-400 font-medium">Row A, Seat 12-14</p>
                </div>

                {/* Guests */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Guests</span>
                  </div>
                  <p className="text-sm font-bold text-white">{quantity} {quantity > 1 ? "Adults" : "Adult"}</p>
                </div>
              </div>

              {/* Order ID & Total Paid Footer */}
              <div className="border-t border-zinc-800/80 pt-4 mt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Order ID</span>
                  <span className="text-xs sm:text-sm font-extrabold text-white font-mono mt-0.5 block">
                    #{booking.bookingId || (id ? id.slice(-10).toUpperCase() : "EVT-8823-99X")}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Total Paid</span>
                  <span className="text-xl sm:text-2xl font-black text-[#A855F7] tracking-tight mt-0.5 block">
                    ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Perforation Divider Notches for Desktop */}
            <div className="hidden lg:block absolute -top-3.5 left-7/12 -translate-x-1/2 w-7 h-7 bg-[#07060F] rounded-full border border-purple-500/20 z-20" />
            <div className="hidden lg:block absolute -bottom-3.5 left-7/12 -translate-x-1/2 w-7 h-7 bg-[#07060F] rounded-full border border-purple-500/20 z-20" />
            <div className="hidden lg:block absolute top-4 bottom-4 left-7/12 -translate-x-1/2 w-[1px] border-r border-dashed border-zinc-800/80 pointer-events-none z-10" />

            {/* Right Side: QR Entry Pass & Buttons */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0F0C22]/90 border-t lg:border-t-0 lg:border-l border-zinc-800/60 flex flex-col items-center justify-between text-center relative z-10">
              
              {/* Header */}
              <div className="w-full">
                <h3 className="text-base sm:text-lg font-bold text-white">Entry Pass</h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Scan at the gate</p>
              </div>

              {/* QR Code Container */}
              <div className="my-6 p-3 sm:p-3.5 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                {booking.qrCodeImage ? (
                  <img 
                    src={booking.qrCodeImage} 
                    alt="Entry Pass QR Code" 
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-44 h-44 sm:w-48 sm:h-48 flex flex-col items-center justify-center text-zinc-400 text-xs">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
                    <span className="font-bold text-zinc-700">Generating QR...</span>
                  </div>
                )}
              </div>

              {/* Ticket Holder Name */}
              <div className="w-full mb-6">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Ticket Holder</span>
                <span className="text-base font-bold text-white mt-0.5 block">{holderName}</span>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={handleDownloadTicket}
                  disabled={downloading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download Ticket
                </button>

                <Link to={USER_ROUTES.BOOKINGS} className="block w-full">
                  <button
                    type="button"
                    className="w-full py-3 px-4 bg-[#141126] hover:bg-[#1C1838] border border-white/5 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    View My Bookings
                  </button>
                </Link>
              </div>

            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default TicketViewPage;
