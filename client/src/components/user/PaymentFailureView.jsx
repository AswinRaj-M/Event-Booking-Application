import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import { USER_ROUTES } from '../../constants/Routes';

const PaymentFailureView = ({ reason, orderId, checkoutState }) => {
  const navigate = useNavigate();

  const handleRepayment = () => {
    let targetState = checkoutState;
    if (!targetState || !targetState.event) {
      try {
        const saved = sessionStorage.getItem('lastCheckoutState');
        if (saved) {
          targetState = JSON.parse(saved);
        }
      } catch (e) {}
    }

    if (targetState && targetState.event) {
      navigate(USER_ROUTES.CHECKOUT, { state: targetState });
    } else {
      navigate(USER_ROUTES.EXPLORE);
    }
  };

  return (
    <div className="text-center max-w-xl mx-auto">
      {/* Animated Failure Icon */}
      <div className="w-20 h-20 rounded-full bg-red-950/60 border-2 border-red-500/80 flex items-center justify-center mx-auto mb-6 text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-pulse">
        <XCircle className="w-10 h-10" />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
        Payment Unsuccessful
      </h1>
      <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
        We couldn't process your payment. Don't worry, your account has not been charged for failed attempts.
      </p>

      {/* Failure Alert Box */}
      <div className="bg-red-950/20 border border-red-800/50 rounded-2xl p-6 text-left shadow-xl space-y-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
          <AlertTriangle className="w-4 h-4" /> Failure Details
        </div>
        <p className="text-xs text-red-200 leading-relaxed font-medium">
          {reason || 'Payment processing failed or was cancelled by user'}
        </p>
        {orderId && (
          <div className="pt-3 border-t border-red-900/40 text-[11px] text-gray-400 flex justify-between">
            <span>Order Reference:</span>
            <span className="font-mono text-gray-300">{orderId}</span>
          </div>
        )}
      </div>

      {/* Navigation Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleRepayment}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Re-payment
        </button>
        <Link
          to={USER_ROUTES.HOME}
          className="w-full sm:w-auto px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailureView;
