import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  QrCode, 
  Download, 
  Users, 
  Ticket as TicketIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";

const TicketCard = ({ booking, index }) => {
  const [showTicketsList, setShowTicketsList] = useState(false);

  if (!booking) return null;

  const isCheckedIn = booking.isCheckedIn || (booking.tickets?.length > 0 && booking.tickets.every(t => t.status === "checked-in"));
  const isCancelled = booking.bookingStatus === "cancelled";
  const isValid = !isCancelled && !isCheckedIn && (booking.paymentStatus === "paid" || booking.bookingStatus === "confirmed");

  const quantity = booking.quantity || booking.tickets?.length || 1;
  const qrImage = booking.qrCodeImage || (booking.tickets?.[0]?.qrCodeImage);

  const handleDownload = () => {
    if (!qrImage) {
      toast.error("QR Code image is not available for download.");
      return;
    }
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `Booking-${booking.bookingId || "Pass"}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded Entry Pass QR Code for #${booking.bookingId || "Booking"}!`);
  };

  return (
    <div className="bg-[#0D0A1C]/95 border border-purple-500/20 hover:border-purple-500/40 rounded-3xl p-6 flex flex-col items-center justify-between transition-all duration-300 shadow-2xl relative overflow-hidden group max-w-md w-full mx-auto">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/15 rounded-full blur-3xl group-hover:bg-purple-600/25 transition-all pointer-events-none" />

      {/* Card Top Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800/50">
              {booking.tierName || "General Pass"}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800">
              <Users className="w-3 h-3 text-purple-400" />
              {quantity} {quantity > 1 ? "Tickets" : "Ticket"}
            </span>
          </div>
          <h4 className="text-sm font-black text-white tracking-wider mt-2">
            #{booking.bookingId || (index !== undefined ? `PASS-${index + 1}` : "PASS")}
          </h4>
        </div>

        {/* Status Badge */}
        <div>
          {isValid && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Valid Pass
            </span>
          )}
          {isCheckedIn && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Checked-In
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <XCircle className="w-3.5 h-3.5" />
              Cancelled
            </span>
          )}
        </div>
      </div>

      {/* Single Booking QR Code Container */}
      <div className="my-2 p-4 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center border-4 border-purple-500/20 relative group-hover:border-purple-500/40 transition-colors">
        {qrImage ? (
          <img
            src={qrImage}
            alt={`QR Code for Booking ${booking.bookingId || "Entry Pass"}`}
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
          />
        ) : (
          <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center text-zinc-400 text-xs">
            <QrCode className="w-10 h-10 mb-2 opacity-50 text-purple-400" />
            <span className="font-semibold">QR Code Generating...</span>
          </div>
        )}
      </div>

      {/* Admittance Instruction */}
      <div className="text-center my-3">
        <p className="text-xs font-bold text-purple-300">
          Single QR Admits {quantity} {quantity > 1 ? "Attendees" : "Attendee"}
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Scan this single QR code once at the venue gate for the entire party.
        </p>
      </div>

      {/* Individual Ticket Numbers Accordion (if tickets exist) */}
      {booking.tickets && booking.tickets.length > 0 && (
        <div className="w-full bg-[#080611] border border-zinc-800/80 rounded-2xl p-3 my-2 text-xs">
          <button
            type="button"
            onClick={() => setShowTicketsList(!showTicketsList)}
            className="w-full flex items-center justify-between text-zinc-400 hover:text-white transition-colors font-semibold"
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              <TicketIcon className="w-3.5 h-3.5 text-purple-400" />
              Ticket Numbers Included ({booking.tickets.length})
            </span>
            {showTicketsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTicketsList && (
            <div className="mt-2 pt-2 border-t border-zinc-800/60 space-y-1.5">
              {booking.tickets.map((t, i) => (
                <div key={t.ticketId || i} className="flex items-center justify-between text-[11px] px-2 py-1 bg-zinc-900/60 rounded-lg">
                  <span className="text-zinc-300 font-mono font-medium">#{t.ticketId}</span>
                  <span className={`text-[10px] uppercase font-bold ${
                    t.status === "checked-in" ? "text-blue-400" :
                    t.status === "cancelled" ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Download & Check-In Footer */}
      <div className="w-full text-center mt-3 pt-4 border-t border-zinc-800/80 space-y-3">
        {qrImage && (
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            Download QR Entry Pass
          </button>
        )}

        {isCheckedIn ? (
          <p className="text-[11px] text-blue-300 font-semibold flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Checked in: {booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleString() : "Confirmed"}
          </p>
        ) : (
          <p className="text-[11px] text-zinc-500 font-medium">
            Gate entry pass • Please keep ready upon arrival
          </p>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
