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
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import { USER_ROUTES } from '../../constants/Routes';
import { getEventById, getPublicCouponsApi } from '../../services/user.api.js';
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

  const { 
    event, 
    selectedTier, 
    tierId, 
    quantity = 1, 
    ticketPrice = 0, 
    subtotal = 0, 
    platformFee = 50,
    totalPlatformFee: passedTotalPlatformFee,
    serviceFee = 0, 
    discountAmount: initialDiscount = 0,
    totalAmount: initialTotal = 0 
  } = checkoutData;

  const effectivePlatformFeePerTicket = Number(platformFee) || 0;
  const effectiveTotalPlatformFee = Number(passedTotalPlatformFee) >= 0 
    ? Number(passedTotalPlatformFee) 
    : (effectivePlatformFeePerTicket * quantity) || Number(serviceFee) || 0;

  // Local Form & Checkout States
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'card' | 'venue'
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);

  // Expiring Checkout Session State (10 Minutes)
  const [sessionExpiresAt, setSessionExpiresAt] = useState(() => {
    try {
      const saved = sessionStorage.getItem('checkoutSessionExpiresAt');
      if (saved && Number(saved) > Date.now()) {
        return Number(saved);
      }
    } catch (e) {}
    const defaultExp = Date.now() + 10 * 60 * 1000;
    try {
      sessionStorage.setItem('checkoutSessionExpiresAt', defaultExp.toString());
    } catch (e) {}
    return defaultExp;
  });

  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.floor((sessionExpiresAt - Date.now()) / 1000)));
  const [isExpired, setIsExpired] = useState(() => (sessionExpiresAt - Date.now()) <= 0);

  // Save latest valid checkout state to sessionStorage
  React.useEffect(() => {
    if (checkoutData && checkoutData.event) {
      try {
        sessionStorage.setItem('lastCheckoutState', JSON.stringify({
          ...checkoutData,
          appliedCoupon: appliedCoupon || checkoutData.appliedCoupon,
          couponDiscount: couponDiscount || checkoutData.couponDiscount || 0
        }));
      } catch (e) {}
    }
  }, [checkoutData, appliedCoupon, couponDiscount]);

  // Verify event status (blocked / deleted) whenever user enters checkout page
  React.useEffect(() => {
    const targetEventId = event?._id || event?.id || checkoutData?.event?._id || checkoutData?.event?.id;
    if (!targetEventId) return;

    let isMounted = true;
    const verifyEventStatus = async () => {
      try {
        const res = await getEventById(targetEventId);
        if (res.data?.success && res.data.event?.isBlocked) {
          if (!isMounted) return;
          try {
            sessionStorage.removeItem('checkoutSessionExpiresAt');
            sessionStorage.removeItem('lastCheckoutState');
          } catch (e) {}
          toast.error("This event is blocked by admin");
          navigate(USER_ROUTES.EXPLORE, { replace: true });
        }
      } catch (err) {
        if (!isMounted) return;
        const errorMsg = err.response?.data?.message || "";
        if (err.response?.status === 403 || errorMsg.toLowerCase().includes("blocked")) {
          try {
            sessionStorage.removeItem('checkoutSessionExpiresAt');
            sessionStorage.removeItem('lastCheckoutState');
          } catch (e) {}
          toast.error(errorMsg || "This event is blocked by admin");
          navigate(USER_ROUTES.EXPLORE, { replace: true });
        }
      }
    };

    verifyEventStatus();
    return () => {
      isMounted = false;
    };
  }, [event?._id, event?.id, checkoutData?.event?._id, checkoutData?.event?.id, navigate]);

  const handleNextCouponCard = () => {
    if (availableCoupons.length <= 1) return;
    setCurrentCouponIndex((prev) => (prev + 1) % availableCoupons.length);
  };

  const handlePrevCouponCard = () => {
    if (availableCoupons.length <= 1) return;
    setCurrentCouponIndex((prev) => (prev - 1 + availableCoupons.length) % availableCoupons.length);
  };

  // Fetch Available Public Coupons
  React.useEffect(() => {
    let isMounted = true;
    const fetchCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const res = await getPublicCouponsApi();
        if (isMounted && res.data?.success) {
          const allCoupons = res.data.coupons || [];
          const now = new Date();
          const targetEventId = event?._id || event?.id;
          const targetCategoryId = event?.category?._id || event?.category;

          const applicable = allCoupons.filter((c) => {
            if (!c.isActive) return false;
            if (c.startDate && new Date(c.startDate) > now) return false;
            if (c.endDate && new Date(c.endDate) < now) return false;
            if (c.usagelimit && c.usedCount >= c.usagelimit) return false;
            
            // Check event applicability
            if (c.applicableEvents) {
              const couponEventId = typeof c.applicableEvents === 'object' ? c.applicableEvents._id : c.applicableEvents;
              if (couponEventId && String(couponEventId) !== String(targetEventId)) return false;
            }
            
            // Check category applicability
            if (c.applicableCategory) {
              const couponCatId = typeof c.applicableCategory === 'object' ? c.applicableCategory._id : c.applicableCategory;
              if (couponCatId && String(couponCatId) !== String(targetCategoryId)) return false;
            }

            return true;
          });
          setAvailableCoupons(applicable);
        }
      } catch (err) {
        console.error('Failed to load available coupons:', err);
      } finally {
        if (isMounted) setLoadingCoupons(false);
      }
    };

    if (event) {
      fetchCoupons();
    }
    return () => {
      isMounted = false;
    };
  }, [event]);

  // Real-time countdown tick
  React.useEffect(() => {
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((sessionExpiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [sessionExpiresAt]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRestartBooking = () => {
    try {
      sessionStorage.removeItem('checkoutSessionExpiresAt');
      sessionStorage.removeItem('lastCheckoutState');
      sessionStorage.removeItem('lastAppliedCoupon');
    } catch (e) {}
    const targetEventId = event?._id || event?.id;
    if (targetEventId) {
      navigate(USER_ROUTES.EVENT_DETAILS.replace(':id', targetEventId));
    } else {
      navigate(USER_ROUTES.EXPLORE);
    }
  };

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

  // Apply Coupon Code Helper
  const applyCouponCode = async (codeToApply) => {
    const cleanCode = codeToApply ? codeToApply.trim().toUpperCase() : '';
    if (!cleanCode) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (!event?._id && !event?.id) {
      toast.error('Missing event details to apply coupon');
      return;
    }

    const targetEventId = event?._id || event?.id;

    try {
      setApplyingCoupon(true);
      setCouponInput(cleanCode);
      const res = await axiosInstance.post('/users/booking/validate-coupon', {
        couponCode: cleanCode,
        eventId: targetEventId,
        subtotal: subtotal,
        quantity: Number(quantity) || 1
      });

      if (res.data && res.data.success) {
        const discountVal = Number(res.data.discountAmount) || 0;
        const couponObj = {
          code: res.data.couponCode || cleanCode,
          discountType: res.data.discountType,
          discountValue: res.data.discountValue,
          maxDiscountAmount: res.data.maxDiscountAmount,
          minTickets: res.data.minTickets
        };
        setAppliedCoupon(couponObj);
        setCouponDiscount(discountVal);

        try {
          sessionStorage.setItem('lastAppliedCoupon', JSON.stringify(couponObj));
        } catch (e) {}

        toast.success(res.data.message || `Coupon "${res.data.couponCode}" applied successfully!`);
      }
    } catch (err) {
      console.error('Failed to validate coupon:', err);
      const errorMsg = err.response?.data?.message || 'Invalid or expired coupon code';
      if (err.response?.status === 403 || errorMsg.toLowerCase().includes("blocked")) {
        try {
          sessionStorage.removeItem('checkoutSessionExpiresAt');
          sessionStorage.removeItem('lastCheckoutState');
        } catch (e) {}
        toast.error(errorMsg || "This event is blocked by admin");
        navigate(USER_ROUTES.EXPLORE, { replace: true });
        return;
      }
      toast.error(errorMsg);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Apply Coupon Handler for manual form submit
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    applyCouponCode(couponInput);
  };

  // Remove Applied Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput('');
    try {
      sessionStorage.removeItem('lastAppliedCoupon');
    } catch (e) {}
    toast.info('Coupon removed');
  };

  // Auto re-apply coupon on retry payment if user applied a coupon recently
  React.useEffect(() => {
    const targetEventId = event?._id || event?.id;
    if (!targetEventId) return;

    let codeToAutoApply = null;
    if (location.state?.appliedCoupon?.code) {
      codeToAutoApply = location.state.appliedCoupon.code;
    } else if (checkoutData?.appliedCoupon?.code) {
      codeToAutoApply = checkoutData.appliedCoupon.code;
    } else {
      try {
        const saved = sessionStorage.getItem('lastAppliedCoupon');
        if (saved) {
          const parsed = JSON.parse(saved);
          codeToAutoApply = parsed?.code;
        }
      } catch (e) {}
    }

    if (codeToAutoApply && !appliedCoupon) {
      applyCouponCode(codeToAutoApply);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?._id, event?.id]);

  // Dynamic Script Loader for Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
      } else {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      }
    });
  };

  // Final Payment Submission & Razorpay Integration
  const handleFinalPayment = async () => {
    const targetEventId = event?._id || event?.id;
    if (!targetEventId) {
      toast.error('Booking information is invalid');
      return;
    }

    if (isExpired || timeLeft <= 0) {
      toast.error("Checkout session has expired. Please restart your booking.");
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

      // Sync real server-side session expiration
      if (orderData.checkoutExpiresAt) {
        const serverExp = new Date(orderData.checkoutExpiresAt).getTime();
        setSessionExpiresAt(serverExp);
        try {
          sessionStorage.setItem('checkoutSessionExpiresAt', serverExp.toString());
        } catch (e) {}
      }

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
              try {
                sessionStorage.removeItem('lastAppliedCoupon');
              } catch (e) {}
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
                  checkoutState: { ...checkoutData, appliedCoupon, couponDiscount }
                }
              });
            }
          } catch (err) {
            toast.dismiss("verify-toast");
            console.error('Payment verification error:', err);
            const errorMsg = err.response?.data?.message || "Payment verification failed.";
            if (err.response?.status === 403 || errorMsg.toLowerCase().includes("blocked")) {
              try {
                sessionStorage.removeItem('checkoutSessionExpiresAt');
                sessionStorage.removeItem('lastCheckoutState');
              } catch (e) {}
              toast.error(errorMsg || "This event is blocked by admin");
              navigate(USER_ROUTES.EXPLORE, { replace: true });
              return;
            }
            toast.error(errorMsg);
            navigate(USER_ROUTES.PAYMENT_STATUS, {
              state: {
                status: 'failure',
                reason: errorMsg,
                orderId: orderData.order_id,
                checkoutState: { ...checkoutData, appliedCoupon, couponDiscount }
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
                checkoutState: { ...checkoutData, appliedCoupon, couponDiscount }
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
            checkoutState: { ...checkoutData, appliedCoupon, couponDiscount }
          }
        });
      });

      // Step 5: Open Razorpay Modal
      razorpayInstance.open();

    } catch (err) {
      console.error('Checkout error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to initialize payment.';
      setIsProcessing(false);

      if (err.response?.status === 403 || errorMsg.toLowerCase().includes("blocked")) {
        try {
          sessionStorage.removeItem('checkoutSessionExpiresAt');
          sessionStorage.removeItem('lastCheckoutState');
        } catch (e) {}
        toast.error(errorMsg || "This event is blocked by admin");
        navigate(USER_ROUTES.EXPLORE, { replace: true });
        return;
      }

      toast.error(errorMsg);
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
          <div className="mb-4">
            <Link
              to={`${USER_ROUTES.EVENT_DETAILS.replace(':id', event._id)}`}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Event Details
            </Link>
          </div>

          {/* Real-time Checkout Session Countdown Banner */}
          {!isExpired ? (
            <div className="mb-6 bg-[#120F20] border border-purple-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-purple-950/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${timeLeft < 120 ? 'bg-rose-950/60 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-purple-950/60 border-purple-500/40 text-purple-400'}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Tickets Temporarily Reserved</div>
                  <div className="text-[11px] text-zinc-400">Complete your payment within the reservation window</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-zinc-400">Complete payment in:</span>
                <span className={`text-base font-black px-3.5 py-1 rounded-xl border font-mono tracking-wider transition-colors ${timeLeft < 120 ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-purple-950/60 border-purple-500/40 text-purple-300'}`}>
                  {formatCountdown(timeLeft)}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-rose-950/40 border border-rose-500/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-rose-600/20 border border-rose-500/40 rounded-2xl text-rose-400 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Checkout Session Expired</h3>
                  <p className="text-xs text-rose-300/80 mt-0.5">Your 10-minute ticket reservation has expired and the reserved seats were released. Please restart your booking.</p>
                </div>
              </div>
              <button
                onClick={handleRestartBooking}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg cursor-pointer shrink-0 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Restart Booking
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Order Summary Card Widget */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-[#120F20] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
                
                {/* Event Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-purple-950/40">
                  <img
                    src={event.thumbnail?.fileUrl || event.images?.[0]?.fileUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'}
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
                        Ticket Price ({selectedTier?.name || 'Standard'} ₹{ticketPrice.toFixed(2)} <span className="text-purple-400 font-bold">x{quantity}</span>)
                      </span>
                      <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {effectiveTotalPlatformFee > 0 && (
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Platform Fee (₹{effectivePlatformFeePerTicket.toFixed(2)} × {quantity})</span>
                        <span className="text-gray-200 font-semibold">₹{effectiveTotalPlatformFee.toFixed(2)}</span>
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
                  
                  {/* Option 1: Razorpay Secure (Default & Only Payment Method) */}
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
                </div>

              </div>

              {/* Promo Code & Available Coupons Box */}
              <div className="bg-[#120F20] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-800/60">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white">Coupons & Promo Codes</span>
                  </div>
                  {availableCoupons.length > 0 && (
                    <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/80 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                      {availableCoupons.length} Available
                    </span>
                  )}
                </div>

                {/* Manual Promo Code Input Form */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      disabled={!!appliedCoupon || applyingCoupon}
                      className="w-full bg-[#0B0914] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
                    />
                  </div>

                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2.5 bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                    >
                      {applyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  )}
                </form>

                {appliedCoupon && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 font-medium">
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied! You saved <strong>₹{couponDiscount.toFixed(2)}</strong></span>
                  </div>
                )}

                {/* Available Coupons List with Slide Animation */}
                <div className="pt-2 border-t border-gray-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Available Coupons ({availableCoupons.length})
                    </div>

                    {availableCoupons.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-purple-300">
                          {currentCouponIndex + 1} / {availableCoupons.length}
                        </span>
                        <div className="flex items-center gap-1 bg-black/60 border border-purple-500/30 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={handlePrevCouponCard}
                            aria-label="Previous Coupon"
                            className="p-1 rounded-md text-purple-300 hover:text-white hover:bg-purple-600/50 transition-all cursor-pointer active:scale-95"
                            title="Previous Coupon"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextCouponCard}
                            aria-label="Next Coupon"
                            className="p-1 rounded-md text-purple-300 hover:text-white hover:bg-purple-600/50 transition-all cursor-pointer active:scale-95"
                            title="Next Coupon"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {loadingCoupons ? (
                    <div className="flex items-center justify-center py-4 text-xs text-gray-400 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span>Checking available coupons...</span>
                    </div>
                  ) : availableCoupons.length > 0 ? (
                    <div className="space-y-2">
                      {/* Animated Slide Carousel View */}
                      <div className="relative overflow-hidden rounded-xl">
                        <div 
                          className="flex transition-transform duration-300 ease-out"
                          style={{ transform: `translateX(-${currentCouponIndex * 100}%)` }}
                        >
                          {availableCoupons.map((coupon) => {
                            const isApplied = appliedCoupon?.code === coupon.code;
                            const isPercentage = coupon.discountType === 'percentage';
                            const discountLabel = isPercentage
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`;

                            return (
                              <div
                                key={coupon._id || coupon.code}
                                className="w-full shrink-0 p-3.5 rounded-xl border bg-[#0B0914] transition-all flex items-center justify-between gap-3 box-border"
                                style={{
                                  borderColor: isApplied ? 'rgba(168, 85, 247, 0.6)' : 'rgba(75, 85, 99, 0.4)',
                                  backgroundColor: isApplied ? 'rgba(88, 28, 135, 0.25)' : '#0B0914'
                                }}
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold text-xs text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-md">
                                      {coupon.code}
                                    </span>
                                    <span className="text-[11px] font-black text-emerald-400">
                                      {discountLabel}
                                    </span>
                                  </div>
                                  {coupon.description && (
                                    <p className="text-[11px] text-gray-300 truncate">
                                      {coupon.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2.5 text-[10px] text-gray-400 flex-wrap">
                                    {coupon.minPurchaseAmount > 0 && (
                                      <span>Min spend ₹{coupon.minPurchaseAmount}</span>
                                    )}
                                    {coupon.minTickets > 1 && (
                                      <span>Min {coupon.minTickets} tickets</span>
                                    )}
                                    {coupon.maxDiscountAmount > 0 && isPercentage && (
                                      <span>Max disc. ₹{coupon.maxDiscountAmount}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  {isApplied ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg">
                                      <Check className="w-3.5 h-3.5" /> Applied
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={applyingCoupon || !!appliedCoupon}
                                      onClick={() => applyCouponCode(coupon.code)}
                                      className="text-[11px] font-bold text-purple-300 hover:text-white bg-purple-900/40 hover:bg-purple-600 border border-purple-500/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                                    >
                                      Apply
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pagination Dots */}
                      {availableCoupons.length > 1 && (
                        <div className="flex items-center justify-center gap-1.5 pt-1">
                          {availableCoupons.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              type="button"
                              onClick={() => setCurrentCouponIndex(dotIdx)}
                              aria-label={`Go to coupon ${dotIdx + 1}`}
                              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                currentCouponIndex === dotIdx
                                  ? 'w-5 bg-purple-400'
                                  : 'w-1.5 bg-gray-700 hover:bg-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500 text-center py-2 italic">
                      No active coupons available for this event at present.
                    </div>
                  )}
                </div>

              </div>

              {/* Pay / Action Button */}
              {isExpired ? (
                <button
                  onClick={handleRestartBooking}
                  className="w-full py-4 px-6 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-white font-extrabold text-base rounded-2xl transition-all shadow-[0_0_25px_rgba(244,63,94,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Session Expired — Restart Booking</span>
                </button>
              ) : (
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
              )}

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
