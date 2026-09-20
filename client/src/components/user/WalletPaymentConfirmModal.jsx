import React from 'react';
import { Wallet, ShieldCheck, X, Loader2, Check } from 'lucide-react';

const WalletPaymentConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  event,
  walletBalance = 0,
  currentTotal = 0
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#120F20] border border-purple-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        
        {/* Close button */}
        <button
          type="button"
          onClick={() => !isProcessing && onClose()}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Confirm Wallet Payment</h3>
            <p className="text-xs text-gray-400">Review payment details before proceeding</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-[#1A162B] border border-purple-500/20 rounded-xl p-4 space-y-3 text-xs">
          <div className="pb-2.5 border-b border-gray-800/60 flex items-center justify-between">
            <span className="text-gray-400">Event</span>
            <span className="font-bold text-white truncate max-w-[200px]">{event?.title || 'Event'}</span>
          </div>

          <div className="flex justify-between text-gray-300">
            <span className="text-gray-400">Current Wallet Balance</span>
            <span className="font-semibold text-white">₹{walletBalance.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-purple-400 font-bold">
            <span>Total Deduction</span>
            <span>- ₹{currentTotal.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-purple-900/40 flex justify-between font-bold">
            <span className="text-gray-300">Remaining Balance</span>
            <span className="text-emerald-400 text-sm">₹{Math.max(0, walletBalance - currentTotal).toFixed(2)}</span>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-purple-950/30 border border-purple-500/20 rounded-lg p-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>This amount will be deducted directly from your Festivo Wallet balance.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm & Pay ₹{currentTotal.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default WalletPaymentConfirmModal;
