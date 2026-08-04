import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  User, 
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
import TicketCard from "../../components/user/TicketCard";
import { toast } from "sonner";

const TicketViewPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

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

  const handleDownloadFullBooking = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloading(true);
      toast.loading("Generating full ticket download pass...", { id: "download-booking" });

      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: "#05050C",
        quality: 0.95,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Booking-${booking?.bookingId || id}-FullPass.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Full booking pass downloaded successfully!", { id: "download-booking" });
    } catch (err) {
      console.error("Error capturing ticket image:", err);
      toast.error("Failed to download full booking pass", { id: "download-booking" });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050C] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-zinc-400 text-sm font-medium">Retrieving ticket details & generating QR codes...</p>
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
            <p className="text-zinc-400 text-sm mb-6">Failed to fetch tickets</p>
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
  
  const themeColorClass = isPending ? "text-amber-400" : "text-purple-400";
  const themeBorderClass = isPending ? "border-amber-500/20 hover:border-amber-500/30" : "border-purple-500/20 hover:border-purple-500/30";
  const themeBgGradientClass = isPending ? "from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800" : "from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700";
  const themeLogoGlow = isPending ? "shadow-[0_0_25px_rgba(245,158,11,0.5)] border-amber-500/30" : "shadow-[0_0_25px_rgba(139,92,246,0.5)] border-purple-500/30";
  const themeDotColor = isPending ? "bg-amber-500" : "bg-purple-500";

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
      <div className={`absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-[120px] pointer-events-none -z-10 transition-all duration-500 ${isPending ? 'bg-amber-500/5' : 'bg-purple-500/5'}`} />
      
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto w-full relative z-10 flex flex-col items-center">
        
        {/* Full Capturable Ticket Area */}
        <div ref={ticketRef} className="w-full max-w-5xl p-6 bg-[#05050C] rounded-3xl flex flex-col items-center">
          
          {/* Status Header */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-5 bg-[#05050C] ${themeLogoGlow}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-opacity-20 animate-pulse ${isPending ? 'bg-amber-500' : 'bg-purple-500'}`}>
                <div className={`w-3.5 h-3.5 rounded-full ${themeDotColor}`} />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              {isPending ? "Booking Pending!" : "Booking Confirmed!"}
            </h1>

            <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed">
              {isPending 
                ? "Your booking is currently pending. Please wait for authorization or payment clearance."
                : "Your tickets are successfully booked. Present your QR tickets at event entrance."
              }
            </p>
          </div>

          {/* Main Booking Details Card */}
          <div className={`w-full bg-[#0b0914]/80 border backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl mb-10 transition-all duration-500 ${themeBorderClass}`}>
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between pb-6 border-b border-zinc-800/80">
              <div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md bg-[#05050C]/80 border ${isPending ? 'border-amber-500/30 text-amber-400' : 'border-purple-500/30 text-purple-400'}`}>
                  {booking.bookingStatus}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3 mb-2 leading-tight">
                  {event?.title}
                </h2>
                <p className="text-xs text-zinc-400">Order ID: #{booking.bookingId || id}</p>
              </div>

              <button 
                onClick={handleDownloadFullBooking}
                disabled={downloading}
                className={`py-3 px-5 bg-gradient-to-r text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 ${themeBgGradientClass}`}
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download Full Booking Pass
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 ${themeColorClass}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-0.5">Date</span>
                  <p className="text-white text-xs font-bold">{formatEventDate(event?.schedule?.date)}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 ${themeColorClass}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-0.5">Venue</span>
                  <p className="text-white text-xs font-bold line-clamp-1">{event?.venue}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 ${themeColorClass}`}>
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-0.5">Ticket Tier</span>
                  <p className="text-white text-xs font-bold">{booking.tierName || "Standard"}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 ${themeColorClass}`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold block mb-0.5">Total Tickets</span>
                  <p className="text-white text-xs font-bold">{booking.quantity} Ticket{booking.quantity > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Tickets Display Section */}
          <div className="w-full">
            <h3 className="text-lg font-black text-white mb-4">
              Your QR Entry Passes ({booking.tickets?.length || 0})
            </h3>

            {booking.tickets && booking.tickets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {booking.tickets.map((ticket, idx) => (
                  <TicketCard key={ticket.ticketId || `ticket-${idx}`} ticket={ticket} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#0b0914]/60 border border-zinc-800/80 rounded-2xl text-zinc-400 text-xs">
                No QR tickets generated yet.
              </div>
            )}
          </div>
        </div>

        <Link to={USER_ROUTES.BOOKINGS} className="mt-10 flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to My Bookings
        </Link>
      </main>
      
      <Footer />
    </div>
  );
};

export default TicketViewPage;
