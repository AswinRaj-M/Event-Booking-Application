import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserTicketsThunk } from "../../features/user.slice";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import TicketCard from "../../components/user/TicketCard";
import { Loader2, Ticket, Calendar, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const MyTicketsPage = () => {
  const dispatch = useDispatch();
  const { tickets: bookings, ticketsLoading, ticketsError } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getUserTicketsThunk())
      .unwrap()
      .catch((err) => {
        toast.error(err || "Failed to load tickets");
      });
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getUserTicketsThunk())
      .unwrap()
      .then(() => toast.success("Tickets refreshed!"))
      .catch((err) => toast.error(err || "Failed to refresh tickets"));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Date TBA";
    }
  };

  return (
    <div className="min-h-screen bg-[#05050C] text-white flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-zinc-800/80 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Ticket className="w-8 h-8 text-purple-400" />
              My Event Tickets
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Present your QR code tickets at the event entry for seamless check-in.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={ticketsLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#12101F] hover:bg-[#1C1A30] border border-purple-500/30 text-purple-300 text-xs font-bold rounded-xl transition-all shadow-md hover:border-purple-500/50 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${ticketsLoading ? "animate-spin" : ""}`} />
            Refresh Tickets
          </button>
        </div>

        {/* Loading State */}
        {ticketsLoading && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-zinc-400 text-sm font-medium">Generating & loading your QR tickets...</p>
          </div>
        )}

        {/* Error State */}
        {!ticketsLoading && ticketsError && (
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-3xl p-8 text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Could not fetch tickets</h3>
            <p className="text-zinc-400 text-xs mb-4">{ticketsError}</p>
            <button
              onClick={handleRefresh}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!ticketsLoading && !ticketsError && (!bookings || bookings.length === 0) && (
          <div className="bg-[#0b0914]/60 border border-zinc-800/80 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 backdrop-blur-md">
            <Ticket className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Active Tickets Found</h3>
            <p className="text-zinc-400 text-sm mb-6">
              You haven't booked any paid tickets yet. Explore upcoming events and secure your entry!
            </p>
          </div>
        )}

        {/* Bookings List */}
        {!ticketsLoading && !ticketsError && bookings && bookings.length > 0 && (
          <div className="space-y-12">
            {bookings.map((booking) => {
              const event = booking.eventId;
              return (
                <div
                  key={booking._id}
                  className="bg-[#0B0914]/80 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6"
                >
                  {/* Event Info Header */}
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pb-6 border-b border-zinc-800/80">
                    <div className="flex gap-4 items-center">
                      <img
                        src={
                          event?.thumbnail?.fileUrl ||
                          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=300&auto=format&fit=crop"
                        }
                        alt={event?.title || "Event"}
                        className="w-20 h-20 object-cover rounded-2xl border border-purple-500/30"
                      />
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-white">
                          {event?.title || "Event Title"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            {formatDate(event?.schedule?.date)}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-purple-400" />
                            {event?.venue || "Venue TBA"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
                        Booking ID
                      </span>
                      <p className="text-xs font-bold text-zinc-300">
                        #{booking.bookingId || booking._id}
                      </p>
                      <span className="inline-block mt-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-extrabold uppercase rounded-full">
                        {booking.tierName || "General Ticket"} ({booking.quantity})
                      </span>
                    </div>
                  </div>

                  {/* Individual Tickets Grid */}
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-4">
                      Individual QR Tickets ({booking.tickets?.length || 0})
                    </h3>

                    {booking.tickets && booking.tickets.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {booking.tickets.map((ticket, idx) => (
                          <TicketCard key={ticket.ticketId || idx} ticket={ticket} index={idx} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No tickets generated for this booking.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyTicketsPage;
