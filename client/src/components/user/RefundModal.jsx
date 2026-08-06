import React, { useState, useEffect } from "react";
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  RotateCcw, 
  DollarSign, 
  Calendar, 
  ShieldAlert,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { checkRefundEligibility, requestRefund } from "../../services/user.api.js";

const RefundModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [ineligibleError, setIneligibleError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      setReason("");
      setIsSuccess(false);
      setIneligibleError(null);
      setEligibilityData(null);
      verifyEligibility(booking._id || booking.bookingId);
    }
  }, [isOpen, booking]);

  const verifyEligibility = async (bookingId) => {
    try {
      setCheckingEligibility(true);
      setIneligibleError(null);
      const res = await checkRefundEligibility(bookingId);
      if (res.data?.success) {
        setEligibilityData(res.data.eligibility);
      } else {
        setIneligibleError(res.data?.message || "Booking is not eligible for refund.");
      }
    } catch (err) {
      console.error("Refund eligibility check failed:", err);
      const errMsg = err.response?.data?.message || "Booking is not eligible for refund.";
      setIneligibleError(errMsg);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    if (!booking) return;

    try {
      setSubmitting(true);
      const targetBookingId = booking._id || booking.bookingId;
      const res = await requestRefund({
        bookingId: targetBookingId,
        reason: reason.trim(),
      });

      if (res.data?.success) {
        setIsSuccess(true);
        toast.success("Refund request submitted successfully!");
        if (onSuccess) {
          onSuccess(res.data.refund);
        }
      } else {
        toast.error(res.data?.message || "Failed to submit refund request");
      }
    } catch (err) {
      console.error("Error requesting refund:", err);
      const errMsg = err.response?.data?.message || "Failed to submit refund request";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg bg-[#0b0914] border border-purple-500/20 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden flex flex-col">
        {/* Glow Accent Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">Request Refund</h3>
              <p className="text-xs text-zinc-400 font-medium">Verify eligibility and submit refund request</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* 1. Loading Eligibility */}
          {checkingEligibility && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              <p className="text-sm font-semibold text-zinc-300">Checking refund eligibility...</p>
              <p className="text-xs text-zinc-500">Validating tickets, payment status & cancellation window</p>
            </div>
          )}

          {/* 2. Success View */}
          {!checkingEligibility && isSuccess && (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">Refund Request Submitted!</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Your refund request for Order #{booking?.bookingId || booking?._id} has been recorded and is currently pending review.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* 3. Ineligible Alert Error */}
          {!checkingEligibility && !isSuccess && ineligibleError && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Refund Ineligible</h4>
                  <p className="text-xs text-rose-200/80 leading-relaxed">{ineligibleError}</p>
                </div>
              </div>

              {/* Summary details */}
              <div className="bg-[#05050C] border border-zinc-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Event</span>
                  <span className="text-white font-semibold">{booking?.eventId?.title || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Booking Code</span>
                  <span className="text-white font-semibold">{booking?.bookingId || booking?._id}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Payment Status</span>
                  <span className="text-white font-semibold uppercase">{booking?.paymentStatus}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          )}

          {/* 4. Eligible - Form to submit */}
          {!checkingEligibility && !isSuccess && !ineligibleError && (
            <form onSubmit={handleSubmitRefund} className="space-y-5">
              {/* Eligible Alert */}
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300 font-medium">
                  This booking is eligible for a full refund.
                </p>
              </div>

              {/* Refund Info Card */}
              <div className="bg-[#05050C] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800">
                  <span className="text-zinc-400 font-medium">Event Name</span>
                  <span className="text-white font-bold truncate max-w-[200px]">
                    {booking?.eventId?.title}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800">
                  <span className="text-zinc-400 font-medium">Booking ID</span>
                  <span className="text-white font-bold">{booking?.bookingId || booking?._id}</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800">
                  <span className="text-zinc-400 font-medium">Tickets Quantity</span>
                  <span className="text-white font-bold">{booking?.quantity} Ticket{booking?.quantity > 1 ? "s" : ""}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-400 font-medium">Refund Amount</span>
                  <span className="text-emerald-400 font-black text-sm">
                    ₹{booking?.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Reason Input Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Reason for Refund (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell us why you are requesting a refund..."
                  className="w-full bg-[#05050C] text-white text-xs placeholder-zinc-550 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
