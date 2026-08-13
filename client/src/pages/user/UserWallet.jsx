import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Building2, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Bell, 
  LayoutGrid, 
  Info, 
  ArrowRight,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Ticket as TicketIcon
} from "lucide-react";
import { toast } from "sonner";
import UserSideBar from "../../components/user/UserSideBar";
import { 
  getBookingHistory,
  createUserWalletOrderApi,
  verifyUserWalletPaymentApi,
  recordUserWalletFailureApi,
  getUserWalletDetailsApi,
  requestUserWithdrawalApi
} from "../../services/user.api.js";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const UserWallet = () => {
  const user = useSelector((state) => state.user?.user);
  const userId = user?._id || user?.id || "guest";

  // Wallet Balance State (Default starting balance ₹0.00 or loaded from user profile)
  const [balance, setBalance] = useState(() => Number(user?.walletBalance) || 0.00);

  const [activeTab, setActiveTab] = useState("all"); // 'all', 'credits', 'debits'
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Add Money Modal State
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);

  // Transactions State
  const [userTransactions, setUserTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unique Wallet ID based on user ID
  const walletId = `WLT-${userId.toString().slice(-8).toUpperCase()}`;

  // Fetch real wallet details, server transactions, and booking history
  const fetchRealData = async () => {
    try {
      setLoading(true);

      // 1. Fetch server-side wallet details (real balance & transactions from DB)
      const walletRes = await getUserWalletDetailsApi().catch(() => null);
      const serverBalance = walletRes?.data?.data?.walletBalance;
      const serverTransactions = walletRes?.data?.data?.transactions || [];

      // 2. Fetch booking history
      const res = await getBookingHistory().catch(() => ({ data: { history: [] } }));
      const bookings = res.data?.history || [];

      // Convert DB user wallet transactions into standard list format
      const dbTxList = serverTransactions.map((tx) => {
        const createdDate = new Date(tx.createdAt || tx.createdTime || Date.now());
        const isDeposit = tx.transactionType === "deposit";
        const isWithdrawal = tx.transactionType === "withdrawal";
        return {
          id: `tx-db-${tx._id}`,
          trxId: tx.razorpayPaymentId ? `#RZP-${tx.razorpayPaymentId.slice(-8).toUpperCase()}` : `#TX-${tx._id.slice(-8).toUpperCase()}`,
          type: isDeposit || tx.amount > 0 ? "credit" : "debit",
          title: isDeposit ? "Wallet Top-up (Razorpay)" : isWithdrawal ? "Withdrawal Request" : "Wallet Transaction",
          subtitle: tx.description || (isDeposit ? "Via Razorpay Payment Gateway" : "Wallet Payout"),
          date: createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: createdDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          timestamp: createdDate.getTime(),
          amount: tx.amount,
          status: tx.status === "completed" ? "Success" : tx.status === "pending" ? "Processing" : "Failed",
          iconBg: isDeposit ? "bg-purple-950/60 border-purple-500/30 text-purple-400" : "bg-rose-950/60 border-rose-500/30 text-rose-400",
          iconType: isDeposit ? "wallet" : "credit-card"
        };
      });

      // Convert real bookings into transactions and track ticket refunds
      const bookingTxList = [];
      bookings.forEach((bk) => {
        const title = bk.eventId?.title || "Event Booking";
        const singleTicketPrice = bk.ticketPrice || (bk.quantity ? (bk.totalAmount / bk.quantity) : bk.totalAmount) || 0;
        const totalBkAmount = bk.totalAmount || (singleTicketPrice * (bk.quantity || 1)) || 0;
        const createdDate = bk.createdAt 
          ? new Date(bk.createdAt) 
          : (bk.eventId?.schedule?.date ? new Date(bk.eventId.schedule.date) : new Date());

        const formattedDate = createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const formattedTime = createdDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const idCode = (bk.bookingId || bk._id || "0000").slice(-8).toUpperCase();

        const cancelledTickets = (bk.tickets || []).filter((t) => t.status === "cancelled");
        
        // 1. Credit transaction for refund if booking or ticket is cancelled
        if (bk.bookingStatus === "cancelled" || cancelledTickets.length > 0) {
          const refundCount = bk.bookingStatus === "cancelled" ? (bk.quantity || 1) : cancelledTickets.length;
          const refundAmount = bk.bookingStatus === "cancelled" ? totalBkAmount : (singleTicketPrice * refundCount);

          bookingTxList.push({
            id: `tx-ref-${bk._id}`,
            trxId: `#REF-${idCode}`,
            type: "credit",
            title: "Ticket Cancellation Refund",
            subtitle: `Refund for ${title} (${refundCount} ticket${refundCount > 1 ? 's' : ''})`,
            date: formattedDate,
            time: formattedTime,
            timestamp: createdDate.getTime() + 1000,
            amount: refundAmount,
            status: "Success",
            iconBg: "bg-blue-950/60 border-blue-500/30 text-blue-400",
            iconType: "refund"
          });
        }

        // 2. Debit transaction for ticket purchase
        if (bk.paymentStatus === "paid" || bk.bookingStatus === "confirmed" || bk.bookingStatus === "checked-in" || bk.bookingStatus === "cancelled") {
          bookingTxList.push({
            id: `tx-bk-${bk._id}`,
            trxId: `#BK-${idCode}`,
            type: "debit",
            title: "Ticket Purchase",
            subtitle: title,
            date: formattedDate,
            time: formattedTime,
            timestamp: createdDate.getTime(),
            amount: -totalBkAmount,
            status: bk.bookingStatus === "cancelled" ? "Cancelled" : "Success",
            iconBg: "bg-purple-950/60 border-purple-500/30 text-purple-400",
            iconType: "ticket"
          });
        }
      });

      if (serverBalance !== undefined && serverBalance !== null) {
        setBalance(serverBalance);
      } else {
        setBalance(Number(user?.walletBalance) || 0.00);
      }

      // Combine DB transactions and booking transactions
      const combined = [...dbTxList, ...bookingTxList];
      const uniqueMap = new Map();
      combined.forEach((tx) => {
        if (!uniqueMap.has(tx.id)) {
          uniqueMap.set(tx.id, tx);
        }
      });

      // Sort by timestamp descending
      const sortedTx = Array.from(uniqueMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setUserTransactions(sortedTx);

    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, [userId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(walletId);
    setCopiedId(true);
    toast.success("Wallet ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 10) {
      toast.error("Minimum withdrawal amount is ₹10.00");
      return;
    }
    if (amt > 5000) {
      toast.error("Maximum withdrawal limit per transaction is ₹5,000.00");
      return;
    }
    if (amt > balance) {
      toast.error("Insufficient wallet balance for this withdrawal.");
      return;
    }
    if (!payoutMethod) {
      toast.error("Please select a payout method.");
      return;
    }

    try {
      setWithdrawLoading(true);
      toast.loading("Processing withdrawal request...", { id: "withdraw-toast" });

      const res = await requestUserWithdrawalApi({
        amount: amt,
        payoutMethod,
        accountDetails,
      });

      toast.dismiss("withdraw-toast");
      if (res.data && res.data.success) {
        toast.success(res.data.message || `Withdrawal of ₹${amt.toFixed(2)} requested successfully!`);
        if (res.data.data?.newBalance !== undefined) {
          setBalance(res.data.data.newBalance);
        }
        setWithdrawAmount("");
        setAccountDetails("");
        fetchRealData();
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast.dismiss("withdraw-toast");
      toast.error(err.response?.data?.message || "Failed to process withdrawal request.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Real Razorpay Add Money Handler
  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (!amt || amt < 1) {
      toast.error("Minimum top-up amount is ₹1.00");
      return;
    }
    if (amt > 100000) {
      toast.error("Maximum top-up amount is ₹1,00,000.00");
      return;
    }

    try {
      setTopUpLoading(true);
      toast.loading("Initiating Razorpay payment...", { id: "topup-toast" });

      // Step 1: Create Razorpay Order on Backend
      const res = await createUserWalletOrderApi(amt);
      const orderData = res.data?.data;

      if (!orderData || !orderData.order_id) {
        toast.error(res.data?.message || "Failed to create payment order.", { id: "topup-toast" });
        setTopUpLoading(false);
        return;
      }

      // Step 2: Load Razorpay SDK Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your internet connection.", { id: "topup-toast" });
        setTopUpLoading(false);
        return;
      }

      toast.dismiss("topup-toast");

      // Step 3: Open Razorpay Modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Festivo Wallet Top-up",
        description: `Add ₹${amt.toFixed(2)} to your Festivo Wallet`,
        image: "/logo.jpeg",
        order_id: orderData.order_id,
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.phoneNumber || "",
        },
        handler: async function (response) {
          try {
            toast.loading("Verifying payment with bank...", { id: "wallet-verify-toast" });
            const verifyRes = await verifyUserWalletPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.dismiss("wallet-verify-toast");
            if (verifyRes.data && verifyRes.data.success) {
              toast.success(verifyRes.data.message || `₹${amt.toFixed(2)} added to your wallet!`);
              setShowAddMoneyModal(false);
              setTopUpAmount("");
              if (verifyRes.data.data?.newBalance !== undefined) {
                setBalance(verifyRes.data.data.newBalance);
              }
              fetchRealData();
            }
          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
            toast.dismiss("wallet-verify-toast");
            toast.error(verifyErr.response?.data?.message || "Payment verification failed.");
          } finally {
            setTopUpLoading(false);
          }
        },
        modal: {
          ondismiss: async function () {
            setTopUpLoading(false);
            try {
              await recordUserWalletFailureApi({
                razorpay_order_id: orderData.order_id,
                reason: "User closed Razorpay modal",
              });
            } catch (e) {}
          },
        },
        theme: {
          color: "#8B5CF6",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", async function (response) {
        toast.error(`Payment Failed: ${response.error?.description || "Transaction failed"}`);
        setTopUpLoading(false);
        try {
          await recordUserWalletFailureApi({
            razorpay_order_id: orderData.order_id,
            reason: response.error?.description || "Payment failed at gateway",
          });
        } catch (e) {}
      });

      razorpayInstance.open();

    } catch (err) {
      console.error("Add money error:", err);
      toast.dismiss("topup-toast");
      toast.error(err.response?.data?.message || "Failed to initialize payment gateway.");
      setTopUpLoading(false);
    }
  };

  // Filter transactions
  const filteredTransactions = userTransactions.filter((tx) => {
    const matchesTab = 
      activeTab === "all" ? true :
      activeTab === "credits" ? tx.type === "credit" :
      tx.type === "debit";

    const matchesSearch = 
      tx.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#05050C] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar Navigation */}
      <UserSideBar />

      {/* Main Container */}
      <main className="flex-1 ml-64 p-8 min-h-screen relative z-10 flex flex-col">
        {/* Background Ambient Glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo-900/10 rounded-full blur-[180px] pointer-events-none -z-10" />

        {/* Top Header Row */}
        <div className="flex justify-between items-center mb-8 relative z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#120F26] border border-purple-500/20 rounded-2xl text-purple-400 shadow-md">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Wallet</h1>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Manage your balance and transactions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bell Icon Button */}
            <button className="relative p-2.5 bg-[#0E0C1D] hover:bg-[#1A1633] border border-white/5 rounded-2xl transition-all cursor-pointer">
              <Bell className="w-4 h-4 text-zinc-400 hover:text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full" />
            </button>

            {/* Profile Pill */}
            <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-[#0E0C1D] border border-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md overflow-hidden shrink-0">
                {user?.profilePicture?.fileUrl ? (
                  <img src={user.profilePicture.fileUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}</span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">{user?.fullName || "User Account"}</span>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{user?.role || "Member"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Balance Main Banner Card */}
        <div className="w-full bg-gradient-to-r from-[#160D38] via-[#1A1144] to-[#120A2B] border border-purple-500/25 rounded-3xl p-7 md:p-8 shadow-2xl mb-8 relative overflow-hidden group">
          {/* Ambient Purple Glow inside card */}
          <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-600/30 transition-all duration-700" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* Balance Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <WalletIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Available Balance</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-5 text-xs text-zinc-400 font-medium pt-1">
                <button 
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 px-3 py-1 bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl transition-all cursor-pointer text-zinc-300 hover:text-white"
                >
                  <span>ID: {walletId}</span>
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                </button>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Updated just now</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => setShowAddMoneyModal(true)}
                className="px-6 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] flex items-center gap-2.5 cursor-pointer active:scale-95"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </div>
                Add Money
              </button>
            </div>
          </div>
        </div>

        {/* 2 Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2 Cols) - Transaction History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Transaction History</h2>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search transaction ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0E0C1C] border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/60 transition-colors"
                  />
                </div>

                <button className="p-2.5 bg-[#0E0C1C] hover:bg-[#18142F] border border-zinc-800/80 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all" 
                    ? "bg-[#17132F] border border-purple-500/40 text-white shadow-md" 
                    : "text-zinc-400 hover:text-white hover:bg-[#0E0C1C]"
                }`}
              >
                All Transactions
              </button>
              <button 
                onClick={() => setActiveTab("credits")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "credits" 
                    ? "bg-[#17132F] border border-purple-500/40 text-white shadow-md" 
                    : "text-zinc-400 hover:text-white hover:bg-[#0E0C1C]"
                }`}
              >
                Credits
              </button>
              <button 
                onClick={() => setActiveTab("debits")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "debits" 
                    ? "bg-[#17132F] border border-purple-500/40 text-white shadow-md" 
                    : "text-zinc-400 hover:text-white hover:bg-[#0E0C1C]"
                }`}
              >
                Debits
              </button>
            </div>

            {/* Transactions Card Container */}
            <div className="bg-[#0A0818]/90 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase font-black text-zinc-500 tracking-wider">
                      <th className="pb-4 font-bold">Date & Time</th>
                      <th className="pb-4 font-bold">Description</th>
                      <th className="pb-4 font-bold">Transaction ID</th>
                      <th className="pb-4 font-bold">Amount</th>
                      <th className="pb-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-zinc-500 text-xs">
                          Loading your transactions...
                        </td>
                      </tr>
                    ) : filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => {
                        const isCredit = tx.type === "credit";
                        
                        // Helper to safely select icon component
                        let IconComp = WalletIcon;
                        if (tx.iconType === "ticket") IconComp = TicketIcon;
                        else if (tx.iconType === "refund") IconComp = RefreshCw;
                        else if (tx.iconType === "credit-card") IconComp = CreditCard;
                        else if (tx.iconType === "wallet") IconComp = WalletIcon;
                        else if (typeof tx.icon === "function") IconComp = tx.icon;

                        return (
                          <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 text-zinc-400 font-medium">
                              <span className="block text-white font-bold">{tx.date}</span>
                              <span className="text-[10px] text-zinc-500">{tx.time}</span>
                            </td>

                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${tx.iconBg}`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="block font-bold text-white leading-tight">{tx.title}</span>
                                  <span className="text-[10px] text-zinc-400">{tx.subtitle}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 text-zinc-400 font-mono text-[11px]">
                              {tx.trxId}
                            </td>

                            <td className={`py-4 font-extrabold ${isCredit ? "text-emerald-400" : "text-white"}`}>
                              {isCredit ? `+₹${Math.abs(tx.amount).toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                            </td>

                            <td className="py-4 text-right">
                              {tx.status === "Success" && (
                                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Success
                                </span>
                              )}
                              {tx.status === "Processing" && (
                                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  Processing
                                </span>
                              )}
                              {tx.status === "Cancelled" && (
                                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  Cancelled
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-zinc-500 text-xs">
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-2 text-xs text-zinc-500">
                <span>Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}</span>

                <div className="flex items-center gap-2">
                  <button className="p-2 bg-[#0E0C1C] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white cursor-pointer disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-[#0E0C1C] border border-zinc-800 rounded-xl text-zinc-400 hover:text-white cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col) - Withdraw Funds Form Card */}
          <div className="bg-[#0B0918]/90 border border-purple-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <WalletIcon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">Withdraw Funds</h3>
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-1.5">Transfer money to your bank account.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">₹</span>
                  <input 
                    id="withdraw-amount-input"
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-[#080612] border border-zinc-800/90 rounded-2xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-1.5 px-1 font-medium">
                  <span>Min: ₹10.00</span>
                  <span>Max: ₹5,000.00</span>
                </div>
              </div>

              {/* Payout Method Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Payout Method</label>
                <select 
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-[#080612] border border-zinc-800/90 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="">Select method</option>
                  <option value="Bank Account">Bank Account</option>
                  <option value="UPI / GPay">UPI / GPay</option>
                  <option value="Debit Card">Debit / Credit Card</option>
                </select>
              </div>

              {/* Account Details Input */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Account Details</label>
                <input 
                  type="text" 
                  placeholder="Enter Account No. / UPI ID"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full bg-[#080612] border border-zinc-800/90 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Processing Time Info Box */}
              <div className="bg-[#120F28]/80 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3 mt-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-purple-300 mb-0.5">Processing Time</span>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                    Withdrawals are processed within 24-48 hours on business days.
                  </p>
                </div>
              </div>

              {/* Request Withdrawal Button */}
              <button 
                type="submit"
                disabled={withdrawLoading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] mt-4"
              >
                {withdrawLoading ? "Processing Request..." : "Request Withdrawal"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B0918] border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowAddMoneyModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Add Funds to Wallet</h3>
                <p className="text-xs text-zinc-400">Top up your balance instantly via Razorpay</p>
              </div>
            </div>

            <form onSubmit={handleAddMoneySubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">Enter Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-base">₹</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    max="100000"
                    placeholder="100.00"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    disabled={topUpLoading}
                    className="w-full bg-[#080612] border border-zinc-800 rounded-2xl pl-9 pr-4 py-3 text-base font-bold text-white focus:outline-none focus:border-purple-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-1.5 px-1 font-medium">
                  <span>Min: ₹1.00</span>
                  <span>Max: ₹1,00,000.00</span>
                </div>
              </div>

              {/* Quick Amount Options */}
              <div className="flex gap-2">
                {[50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={topUpLoading}
                    onClick={() => setTopUpAmount(amt.toString())}
                    className="flex-1 py-2 bg-[#14102B] hover:bg-[#1F1840] border border-purple-500/20 text-purple-300 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <button 
                type="submit"
                disabled={topUpLoading || !topUpAmount}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {topUpLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing with Razorpay...</span>
                  </>
                ) : (
                  <span>Proceed to Pay with Razorpay</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWallet;
