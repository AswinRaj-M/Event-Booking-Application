import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Ticket, ArrowRight, ShieldCheck, Calendar, MapPin } from 'lucide-react';
import { USER_ROUTES } from '../../constants/Routes';

const PaymentSuccessView = ({ payment, event }) => {
  return (
    <div className="text-center max-w-3xl mx-auto">
      {/* Animated Success Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-950/60 border-2 border-emerald-500/80 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
        Payment Successful!
      </h1>
      <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
        Your booking has been confirmed. A confirmation receipt and digital ticket have been generated for your account.
      </p>

      {/* Receipt & Order Details Card */}
      <div className="bg-[#120F20] border border-gray-800/80 rounded-2xl p-6 text-left shadow-2xl space-y-6 mb-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Transaction Status</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-0.5">
              <ShieldCheck className="w-4 h-4" /> VERIFIED & PAID
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount Paid</span>
            <div className="text-lg font-black text-purple-400 mt-0.5">
              ₹{payment?.amount ? Number(payment.amount).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>

        {/* Event Summary */}
        {event && (
          <div className="bg-purple-950/20 border border-purple-900/40 rounded-xl p-4 flex items-center gap-4">
            <img
              src={event.images?.[0]?.fileUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300'}
              alt={event.title}
              className="w-14 h-14 rounded-lg object-cover border border-purple-500/30 shrink-0"
            />
            <div className="space-y-0.5 text-xs">
              <h3 className="font-bold text-white text-sm">{event.title}</h3>
              <div className="text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{event.schedule?.date ? new Date(event.schedule.date).toLocaleDateString() : 'Date TBA'}</span>
              </div>
              <div className="text-gray-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>{event.venue || 'Venue TBA'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details Table */}
        <div className="space-y-2.5 text-xs text-gray-300">
          <div className="flex justify-between py-1 border-b border-gray-800/50">
            <span className="text-gray-400">Payment ID</span>
            <span className="font-mono text-white">{payment?.razorpayPaymentId || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-800/50">
            <span className="text-gray-400">Razorpay Order ID</span>
            <span className="font-mono text-white">{payment?.razorpayOrderId || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-800/50">
            <span className="text-gray-400">Payment Method</span>
            <span className="font-semibold text-white capitalize">{payment?.paymentMethod || 'Razorpay'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-800/50">
            <span className="text-gray-400">Date & Time</span>
            <span className="text-gray-300">
              {payment?.createdAt ? new Date(payment.createdAt).toLocaleString() : new Date().toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Action Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={USER_ROUTES.BOOKINGS}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" /> View My Bookings
        </Link>
        <Link
          to={USER_ROUTES.EXPLORE}
          className="w-full sm:w-auto px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          Browse More Events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessView;
