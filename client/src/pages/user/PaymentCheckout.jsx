import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { 
  Lock, 
  ShieldCheck, 
  Ticket, 
  Calendar, 
  MapPin, 
  Tag, 
  ArrowRight, 
  Check, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  AlertCircle, 
  Info,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { USER_ROUTES } from '../../constants/Routes';
import { createBooking } from '../../services/user.api.js';
import axiosInstance from '../../services/axiosInstance.js';
import { toast } from 'sonner';

const PaymentCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State passed from UserEventDetails or restored from sessionStorage
  let checkoutData = location.state;
  if (!checkoutData || !checkoutData.event) {
    try {
      const saved = sessionStorage.getItem('lastCheckoutState');
      if (saved) {
        checkoutData = JSON.parse(saved);
      }
    } catch (e) {}
  }
  checkoutData = checkoutData || {};

  // Save latest valid checkout state to sessionStorage
  React.useEffect(() => {
    if (checkoutData && checkoutData.event) {
      try {
        sessionStorage.setItem('lastCheckoutState', JSON.stringify(checkoutData));
      } catch (e) {}
    }
  }, [checkoutData]);

  const { 
    event, 
    selectedTier, 
    tierId, 
    quantity = 1, 
    ticketPrice = 0, 
    subtotal = 0, 
    serviceFee = 0, 
    discountAmount: initialDiscount = 0,
    totalAmount: initialTotal = 0 
  } = checkoutData;

  // Local Form & Checkout States
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'card' | 'venue'
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate final totals
  const currentTotal = Math.max(0, initialTotal - couponDiscount);

  // Format date helper
  const formatEventDate = (dateString, startTime) => {
    if (!dateString) return 'Date TBA';
    try {
      const d = new Date(dateString);
      const dateFormatted = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return startTime ? `${dateFormatted} • ${startTime}` : dateFormatted;
    } catch (e) {
      return 'Date TBA';
    }
  };

  // Apply Coupon Handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (!event?._id) {
      toast.error('Missing event details to apply coupon');
      return;
    }

    try {
      setApplyingCoupon(true);
      const res = await axiosInstance.post('/users/booking/validate-coupon', {
        couponCode: couponInput.trim(),
        eventId: event._id,
        subtotal: subtotal,
        quantity: Number(quantity) || 1
      });

      if (res.data && res.data.success) {
        const discountVal = Number(res.data.discountAmount) || 0;
        setAppliedCoupon({
          code: res.data.couponCode || couponInput.trim().toUpperCase(),
          discountType: res.data.discountType,
          discountValue: res.data.discountValue,
          maxDiscountAmount: res.data.maxDiscountAmount,
          minTickets: res.data.minTickets
        });
        setCouponDiscount(discountVal);
        toast.success(res.data.message || `Coupon "${res.data.couponCode}" applied successfully!`);
      }
    } catch (err) {
      console.error('Failed to validate coupon:', err);
      toast.error(err.response?.data?.message || 'Invalid or expired coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Remove Applied Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput('');
    toast.info('Coupon removed');
  };

  // Dynamic Script Loader for Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Final Payment Submission & Razorpay Integration
  const handleFinalPayment = async () => {
    const targetEventId = event?._id || event?.id;
    if (!targetEventId) {
      toast.error('Booking information is invalid');
      return;
    }

    try {
      setIsProcessing(true);

      // Step 1: Create Razorpay order on backend
      const orderPayload = {
        eventId: targetEventId,
        tierId: (tierId && tierId !== "undefined" && tierId !== "null") ? tierId : (selectedTier?._id || undefined),
        quantity: Number(quantity) || 1,
        couponCode: appliedCoupon?.code ? appliedCoupon.code.trim().toUpperCase() : undefined
      };

      const orderRes = await axiosInstance.post('/payments/create-order', orderPayload);

      if (!orderRes.data || !orderRes.data.order_id) {
        toast.error('Failed to create payment order.');
        setIsProcessing(false);
        return;
      }

      const orderData = orderRes.data;

      // Step 2: Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      // Step 3: Configure Razorpay Checkout Options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Festivo Event Booking",
        description: `Ticket booking for ${event.title}`,
        image: event.images?.[0]?.fileUrl || "/logo.jpeg",
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            toast.loading("Verifying payment signature...", { id: "verify-toast" });

            // Step 4: Verify Payment Signature Server-Side
            const verifyRes = await axiosInstance.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.dismiss("verify-toast");

            if (verifyRes.data && verifyRes.data.success) {
              toast.success("Payment verified & booking confirmed!");
              navigate(USER_ROUTES.PAYMENT_STATUS, {
                state: {
                  status: 'success',
                  payment: verifyRes.data.payment,
                  event: event
                }
              });
            } else {
              toast.error("Payment verification failed.");
              navigate(USER_ROUTES.PAYMENT_STATUS, {
                state: {
                  status: 'failure',
                  reason: "Signature verification failed",
                  orderId: orderData.order_id,
                  checkoutState: checkoutData
                }
              });
            }
          } catch (err) {
            toast.dismiss("verify-toast");
            console.error('Payment verification error:', err);
            toast.error(err.response?.data?.message || "Payment verification failed.");
            navigate(USER_ROUTES.PAYMENT_STATUS, {
              state: {
                status: 'failure',
                reason: err.response?.data?.message || "Verification failed",
                orderId: orderData.order_id,
                checkoutState: checkoutData
              }
            });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async function () {
            toast.warning("Payment cancelled by user.");
            setIsProcessing(false);
            try {
              await axiosInstance.post('/payments/fail', {
                razorpay_order_id: orderData.order_id,
                status: "CANCELLED",
                reason: "User closed Razorpay checkout popup"
              });
            } catch (e) {}
            navigate(USER_ROUTES.PAYMENT_STATUS, {
              state: {
                status: 'failure',
                reason: "Payment cancelled by user",
                orderId: orderData.order_id,
                checkoutState: checkoutData
              }
            });
          }
        },
        theme: {
          color: "#9333ea"
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", async function (response) {
        toast.error(`Payment Failed: ${response.error?.description || "Gateway failure"}`);
        setIsProcessing(false);
        try {
          await axiosInstance.post('/payments/fail', {
            razorpay_order_id: orderData.order_id,
            status: "FAILED",
            reason: response.error?.description || "Payment failed at gateway"
          });
        } catch (e) {}
        navigate(USER_ROUTES.PAYMENT_STATUS, {
          state: {
            status: 'failure',
            reason: response.error?.description || "Payment failed at gateway",
            orderId: orderData.order_id,
            checkoutState: checkoutData
          }
        });
      });

      // Step 5: Open Razorpay Modal
      razorpayInstance.open();

    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.message || 'Failed to initialize payment.');
      setIsProcessing(false);
    }
  };

  // Fallback if accessed without booking state
  if (!event) {
    return (
      <div className="min-h-screen bg-[#080612] text-white flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-auto px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mx-auto mb-6 text-purple-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Order Details Found</h2>
          <p className="text-gray-400 text-sm mb-8">
            Please select an event and choose your tickets before proceeding to checkout.
          </p>
          <Link
            to={USER_ROUTES.EXPLORE}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30"
          >
            <ChevronLeft className="w-4 h-4" /> Browse Events
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080612] text-white font-sans selection:bg-purple-500/30 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header Navigation Link */}
          <div className="mb-6">
            <Link
              to={`${USER_ROUTES.EVENT_DETAILS.replace(':id', event._id)}`}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Event Details
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Order Summary Card Widget */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-[#120F20] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
                
                {/* Event Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-purple-950/40">
                  <img
                    src={event.images?.[0]?.fileUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120F20] via-[#120F20]/40 to-transparent" />
                  
                  {/* Category / Status Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-600/90 text-white text-[11px] font-bold tracking-wide uppercase shadow-lg backdrop-blur-md">
                    {event.category?.name || 'Live Event'}
                  </span>

                  {/* Title Overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-md leading-tight">
                      {event.title}
                    </h2>
                  </div>
                </div>

                {/* Event Info Details */}
                <div className="p-5 space-y-4 text-xs text-gray-300">
                  
                  {/* Date & Time */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {formatEventDate(event.schedule?.date, event.schedule?.startTime)}
                      </div>
                      {event.schedule?.endTime && (
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Ends at {event.schedule.endTime}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location & Venue */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {event.venue || 'Venue TBA'}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {event.address ? `${event.address}, ${event.city || ''}` : (event.city || 'Location details available on ticket')}
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="pt-4 border-t border-gray-800/80 space-y-2.5">
                    <div className="flex justify-between items-center text-gray-300">
                      <span>
                        {selectedTier?.name || 'Access Ticket'} <span className="text-purple-400 font-bold">x{quantity}</span>
                      </span>
                      <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {serviceFee > 0 && (
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Booking Fee</span>
                        <span>₹{serviceFee.toFixed(2)}</span>
                      </div>
                    )}

                    {initialDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400">
                        <span>Event Discount</span>
                        <span>-₹{initialDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" /> Coupon ({appliedCoupon.code} {appliedCoupon.discountType === 'percentage' ? `• ${appliedCoupon.discountValue}% OFF` : `• ₹${appliedCoupon.discountValue} OFF`})
                        </span>
                        <span>-₹{couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total Payable */}
                  <div className="pt-4 border-t border-purple-500/30 flex justify-between items-center">
                    <span className="text-base font-bold text-white">Total Payable</span>
                    <span className="text-2xl font-black text-purple-400 drop-shadow-sm">
                      ₹{currentTotal.toFixed(2)}
                    </span>
                  </div>

                </div>

              </div>

              {/* Informational Footer Note */}
              <div className="bg-[#120F20]/60 border border-gray-800/60 rounded-xl p-3.5 flex items-start gap-3 text-[11px] text-gray-400 leading-normal">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Tickets will be sent to your email immediately after successful booking. Need help? Contact Support.
                </span>
              </div>

            </div>

            {/* RIGHT COLUMN: Payment Method & Checkout */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Header Title */}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Checkout</h1>
                <p className="text-xs text-gray-400 mt-1">Complete your purchase securely.</p>
              </div>

              {/* Payment Methods Card Container */}
              <div className="bg-[#120F20] border border-gray-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                
                {/* Header Section */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-800/60">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Payment Method</h3>
                    <p className="text-[11px] text-gray-400">Select your preferred payment option</p>
                  </div>
                </div>

                {/* Method Options List */}
                <div className="space-y-3">
                  
                  {/* Option 1: Razorpay Secure (Default) */}
                  <label 
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`block rounded-xl border p-4 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                        : 'border-gray-800/80 bg-black/40 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="razorpay"
                            checked={paymentMethod === 'razorpay'} 
                            onChange={() => setPaymentMethod('razorpay')}
                            className="accent-purple-500 w-4 h-4 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">Razorpay Secure</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Pay securely using UPI, Cards, NetBanking, or Wallets.
                          </p>

                          {/* Accepted Methods Grid */}
                          {paymentMethod === 'razorpay' && (
                            <div className="mt-4 pt-3 border-t border-purple-900/40">
                              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                                Accepted Methods
                              </div>
                              <div className="grid grid-cols-4 gap-2 text-[11px]">
                                <div className="bg-[#1A162B] border border-purple-500/20 rounded-lg p-2 flex flex-col items-center justify-center gap-1 text-purple-300">
                                  <Smartphone className="w-4 h-4 text-purple-400" />
                                  <span>UPI / QR</span>
                                </div>
                                <div className="bg-[#1A162B] border border-purple-500/20 rounded-lg p-2 flex flex-col items-center justify-center gap-1 text-purple-300">
                                  <CreditCard className="w-4 h-4 text-purple-400" />
                                  <span>Card</span>
                                </div>
                                <div className="bg-[#1A162B] border border-purple-500/20 rounded-lg p-2 flex flex-col items-center justify-center gap-1 text-purple-300">
                                  <Building2 className="w-4 h-4 text-purple-400" />
                                  <span>NetBanking</span>
                                </div>
                                <div className="bg-[#1A162B] border border-purple-500/20 rounded-lg p-2 flex flex-col items-center justify-center gap-1 text-purple-300">
                                  <Wallet className="w-4 h-4 text-purple-400" />
                                  <span>Wallet</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Razorpay Badge */}
                      <span className="text-[10px] text-gray-500 font-semibold px-2 py-0.5 rounded bg-gray-900 border border-gray-800 shrink-0">
                        Powered by <strong className="text-purple-400">Razorpay</strong>
                      </span>
                    </div>
                  </label>

                  {/* Option 2: Card / Netbanking Direct */}
                  <label 
                    onClick={() => setPaymentMethod('card')}
                    className={`block rounded-xl border p-4 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                        : 'border-gray-800/80 bg-black/40 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="card"
                          checked={paymentMethod === 'card'} 
                          onChange={() => setPaymentMethod('card')}
                          className="accent-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-sm text-white">Credit / Debit Card</div>
                          <div className="text-xs text-gray-400">Visa, Mastercard, RuPay, Maestro</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                        VISA / MC
                      </span>
                    </div>
                  </label>

                  {/* Option 3: Pay at Venue */}
                  <label 
                    onClick={() => setPaymentMethod('venue')}
                    className={`block rounded-xl border p-4 cursor-pointer transition-all ${
                      paymentMethod === 'venue'
                        ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                        : 'border-gray-800/80 bg-black/40 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="venue"
                          checked={paymentMethod === 'venue'} 
                          onChange={() => setPaymentMethod('venue')}
                          className="accent-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-sm text-white">Pay at Venue / Offline</div>
                          <div className="text-xs text-gray-400">Reserve now and pay upon entry</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/50">
                        Reserve Mode
                      </span>
                    </div>
                  </label>

                </div>

              </div>

              {/* Promo Code Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300">
                  Have a promo code?
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code here"
                      disabled={!!appliedCoupon || applyingCoupon}
                      className="w-full bg-[#120F20] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
                    />
                  </div>

                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-5 py-3 bg-red-950/40 border border-red-800/60 text-red-300 hover:bg-red-900/60 text-xs font-bold rounded-xl transition-all"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-6 py-3 bg-gray-800 hover:bg-purple-600 disabled:bg-gray-800/50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {applyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  )}
                </form>

                {appliedCoupon && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1 font-medium">
                    <Check className="w-4 h-4" /> Coupon <strong>{appliedCoupon.code}</strong> applied! You saved ₹{couponDiscount.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Pay Button */}
              <button
                onClick={handleFinalPayment}
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-base rounded-2xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{currentTotal.toFixed(2)} Securely</span>
                  </>
                )}
              </button>

              {/* Security Badges Footer */}
              <div className="pt-2 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> 256-bit SSL Encrypted Payment
                </div>
                
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
                  <span className="px-2 py-1 rounded bg-gray-900 border border-gray-800">VISA</span>
                  <span className="px-2 py-1 rounded bg-gray-900 border border-gray-800">MASTERCARD</span>
                  <span className="px-2 py-1 rounded bg-gray-900 border border-gray-800">AMEX</span>
                  <span className="px-2 py-1 rounded bg-gray-900 border border-gray-800">PCI-DSS</span>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PaymentCheckout;
