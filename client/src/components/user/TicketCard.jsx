import React from "react";
import { CheckCircle2, Clock, XCircle, QrCode, Download } from "lucide-react";
import { toast } from "sonner";

const TicketCard = ({ ticket, index }) => {
  const isCheckedIn = ticket.status === "checked-in";
  const isCancelled = ticket.status === "cancelled";
  const isValid = ticket.status === "valid";

  const handleDownload = () => {
    if (!ticket.qrCodeImage) {
      toast.error("QR Code image is not available for download.");
      return;
    }
    const link = document.createElement("a");
    link.href = ticket.qrCodeImage;
    link.download = `${ticket.ticketId || "Ticket"}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${ticket.ticketId || "Ticket"} QR Code!`);
  };

  return (
    <div className="bg-[#0D0A1C]/90 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-5 flex flex-col items-center justify-between transition-all duration-300 shadow-lg relative overflow-hidden group">
      {/* Background Accent glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all pointer-events-none" />

      {/* Ticket Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
            Ticket #{index + 1}
          </span>
          <h4 className="text-sm font-black text-purple-300 tracking-wider">
            {ticket.ticketId}
          </h4>
        </div>

        {/* Status Badge */}
        <div>
          {isValid && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Valid
            </span>
          )}
          {isCheckedIn && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Checked-In
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <XCircle className="w-3 h-3" />
              Cancelled
            </span>
          )}
        </div>
      </div>

      {/* QR Code Container */}
      <div className="my-2 p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-purple-300/30">
        {ticket.qrCodeImage ? (
          <img
            src={ticket.qrCodeImage}
            alt={`QR Code for ${ticket.ticketId}`}
            className="w-40 h-40 object-contain rounded-lg"
          />
        ) : (
          <div className="w-40 h-40 flex flex-col items-center justify-center text-zinc-400 text-xs">
            <QrCode className="w-8 h-8 mb-2 opacity-50" />
            <span>QR Pending</span>
          </div>
        )}
      </div>

      {/* Download & Check-In Footer Details */}
      <div className="w-full text-center mt-3 pt-3 border-t border-zinc-800/80 space-y-3">
        {ticket.qrCodeImage && (
          <button
            onClick={handleDownload}
            className="w-full py-2 px-3 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Ticket
          </button>
        )}

        {isCheckedIn ? (
          <p className="text-[11px] text-blue-300 font-semibold flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Checked in: {new Date(ticket.checkedInAt).toLocaleString()}
          </p>
        ) : (
          <p className="text-[11px] text-zinc-400 font-medium">
            Scan at gate for event entry
          </p>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
