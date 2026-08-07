import React, { useState, useEffect } from "react";
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  Clock, 
  PieChart, 
  Download, 
  Plus, 
  Filter, 
  Check, 
  X, 
  ChevronRight, 
  ArrowUpRight,
  HandCoins,
  ShieldCheck,
  Building2,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  getAdminWithdrawalsApi,
  approveWithdrawalApi,
  rejectWithdrawalApi
} from "../../services/admin.api.js";

const AdminPaymentPage = () => {
  // Financial KPI state
  const [platformBalance, setPlatformBalance] = useState(142384.00);
  const [vendorPayouts, setVendorPayouts] = useState(84291.50);
  const [pendingWithdrawalsAmount, setPendingWithdrawalsAmount] = useState(12450.00);
  const [commissionEarned, setCommissionEarned] = useState(28940.25);

  // Add Funds Modal State
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addSource, setAddSource] = useState("Platform Reserve Account");

  // Rejection Reason Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Withdrawal Requests State
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Recent Wallet Transactions State
  const [transactions, setTransactions] = useState([
    {
      id: "TXN-8472",
      type: "Credit",
      typeBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      amount: 3250.00,
      from: "Booking #4521",
      reason: "Event commission",
      status: "Completed",
      statusBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      date: "Oct 24, 2024"
    },
    {
      id: "TXN-8471",
      type: "Debit",
      typeBg: "bg-rose-950/60 border-rose-500/30 text-rose-400",
      amount: -1800.00,
      from: "Elite Catering",
      reason: "Vendor payout",
      status: "Completed",
      statusBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      date: "Oct 23, 2024"
    },
    {
      id: "TXN-8470",
      type: "Credit",
      typeBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      amount: 5890.00,
      from: "Booking #4518",
      reason: "Event commission",
      status: "Completed",
      statusBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      date: "Oct 23, 2024"
    },
    {
      id: "TXN-8469",
      type: "Debit",
      typeBg: "bg-rose-950/60 border-rose-500/30 text-rose-400",
      amount: -2450.00,
      from: "Starlight Events",
      reason: "Vendor payout",
      status: "Pending",
      statusBg: "bg-amber-950/60 border-amber-500/30 text-amber-400",
      date: "Oct 22, 2024"
    },
    {
      id: "TXN-8468",
      type: "Credit",
      typeBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      amount: 1250.00,
      from: "Booking #4515",
      reason: "Event commission",
      status: "Completed",
      statusBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      date: "Oct 22, 2024"
    },
    {
      id: "TXN-8467",
      type: "Debit",
      typeBg: "bg-rose-950/60 border-rose-500/30 text-rose-400",
      amount: -5200.00,
      from: "DJ Beats Pro",
      reason: "Vendor payout",
      status: "Pending",
      statusBg: "bg-amber-950/60 border-amber-500/30 text-amber-400",
      date: "Oct 21, 2024"
    },
    {
      id: "TXN-8466",
      type: "Credit",
      typeBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      amount: 4120.00,
      from: "Booking #4512",
      reason: "Event commission",
      status: "Completed",
      statusBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      date: "Oct 21, 2024"
    },
    {
      id: "TXN-8465",
      type: "Debit",
      typeBg: "bg-rose-950/60 border-rose-500/30 text-rose-400",
      amount: -3750.00,
      from: "Venue Masters",
      reason: "Vendor payout",
      status: "Completed",
      statusBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      date: "Oct 20, 2024"
    },
    {
      id: "TXN-8464",
      type: "Credit",
      typeBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      amount: 2890.00,
      from: "Booking #4508",
      reason: "Event commission",
      status: "Completed",
      statusBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      date: "Oct 20, 2024"
    },
    {
      id: "TXN-8463",
      type: "Credit",
      typeBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      amount: 6450.00,
      from: "Booking #4505",
      reason: "Event commission",
      status: "Completed",
      statusBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
      date: "Oct 19, 2024"
    }
  ]);

  // Fetch Real Withdrawal Requests
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await getAdminWithdrawalsApi();
      if (res.data?.success && res.data.requests) {
        const mapped = res.data.requests.map((r) => ({
          id: r._id,
          vendorName: r.vendorId?.businessName || r.vendorId?.fullName || "Vendor Account",
          vendorAvatar: r.vendorId?.profilePicture?.fileUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          amount: r.amount,
          reqDate: new Date(r.requestedAt || r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          balance: `$${r.amount.toLocaleString()}`,
          status: r.status,
          destinationAccount: r.destinationAccount
        }));
        setWithdrawalRequests(mapped);

        // Calculate pending amount total
        const pendingTotal = mapped
          .filter((r) => r.status === "pending")
          .reduce((sum, r) => sum + r.amount, 0);
        setPendingWithdrawalsAmount(pendingTotal);
      }
    } catch (err) {
      console.error("Error fetching admin withdrawal requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Action Handlers
  const handleApproveRequest = async (id, vendorName, amount) => {
    try {
      toast.loading("Approving withdrawal request...", { id: "admin-approve-toast" });
      const res = await approveWithdrawalApi(id);
      if (res.data?.success) {
        toast.success(`Withdrawal request of $${amount.toLocaleString()} for ${vendorName} approved successfully!`, { id: "admin-approve-toast" });
        await fetchWithdrawals();
      }
    } catch (err) {
      console.error("Error approving withdrawal:", err);
      toast.error(err.response?.data?.message || "Failed to approve withdrawal request.", { id: "admin-approve-toast" });
    }
  };

  const openRejectModal = (request) => {
    setRejectingItem(request);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;

    try {
      toast.loading("Rejecting withdrawal request...", { id: "admin-reject-toast" });
      const res = await rejectWithdrawalApi(rejectingItem.id, rejectionReason);
      if (res.data?.success) {
        toast.success(`Withdrawal request for ${rejectingItem.vendorName} rejected.`, { id: "admin-reject-toast" });
        setShowRejectModal(false);
        setRejectingItem(null);
        setRejectionReason("");
        await fetchWithdrawals();
      }
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      toast.error(err.response?.data?.message || "Failed to reject withdrawal request.", { id: "admin-reject-toast" });
    }
  };

  const handleAddFundsSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount to add.");
      return;
    }
    setPlatformBalance(prev => prev + amt);
    setShowAddFundsModal(false);
    setAddAmount("");
    toast.success(`Successfully added $${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })} to Platform Balance!`);
  };

  const handleExportReport = () => {
    toast.info("Preparing financial report... Download will start shortly.");
  };

  return (
    <div className="flex h-screen bg-[#080614] text-white overflow-hidden font-sans">
      {/* Admin Navigation Sidebar */}
      <AdminSidebar />

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[#080614] scrollbar-thin scrollbar-thumb-purple-900/40">
        
        {/* Page Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Admin Wallet</h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">Platform financial overview and transactions</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportReport}
              className="px-4 py-2.5 bg-[#120F24] hover:bg-[#1C1836] border border-white/10 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              Export Report
            </button>

            <button 
              onClick={() => setShowAddFundsModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            >
              <Plus className="w-4 h-4" />
              Add Funds
            </button>
          </div>
        </div>

        {/* Top 4 Financial KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Platform Balance */}
          <div className="bg-[#0D0A1F]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-zinc-400">Platform Balance</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <WalletIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              ${platformBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-400">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-sm" />
              +12.5% from last month
            </div>
          </div>

          {/* Card 2: Vendor Payouts */}
          <div className="bg-[#0D0A1F]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-zinc-400">Vendor Payouts</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                <HandCoins className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              ${vendorPayouts.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-medium text-zinc-400">
              Total disbursed YTD
            </div>
          </div>

          {/* Card 3: Pending Withdrawals */}
          <div className="bg-[#0D0A1F]/90 border border-amber-500/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-zinc-400">Pending Withdrawals</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              ${pendingWithdrawalsAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              {withdrawalRequests.length} requests pending
            </div>
          </div>

          {/* Card 4: Commission Earned */}
          <div className="bg-[#0D0A1F]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-zinc-400">Commission Earned</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              ${commissionEarned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-400">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-sm" />
              +8.2% all time
            </div>
          </div>
        </div>

        {/* Middle Section - Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Earnings Overview (Line Graph) */}
          <div className="bg-[#0B091D]/90 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-6">
              <h3 className="text-lg font-black text-white tracking-tight">Earnings Overview</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Platform revenue trend over the last 6 months</p>
            </div>

            <div className="w-full h-64 relative pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" fill="none">
                {/* Horizontal Grid Lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#1A182E" strokeDasharray="3 3" />
                <text x="0" y="24" fill="#52525B" fontSize="10" fontFamily="sans-serif">26000</text>

                <line x1="40" y1="60" x2="480" y2="60" stroke="#1A182E" strokeDasharray="3 3" />
                <text x="0" y="64" fill="#52525B" fontSize="10" fontFamily="sans-serif">19500</text>

                <line x1="40" y1="100" x2="480" y2="100" stroke="#1A182E" strokeDasharray="3 3" />
                <text x="0" y="104" fill="#52525B" fontSize="10" fontFamily="sans-serif">13000</text>

                <line x1="40" y1="140" x2="480" y2="140" stroke="#1A182E" strokeDasharray="3 3" />
                <text x="0" y="144" fill="#52525B" fontSize="10" fontFamily="sans-serif">6500</text>

                <line x1="40" y1="180" x2="480" y2="180" stroke="#27272A" />
                <text x="24" y="184" fill="#52525B" fontSize="10" fontFamily="sans-serif">0</text>

                {/* X Axis Labels */}
                <text x="50" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Jan</text>
                <text x="130" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Feb</text>
                <text x="210" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Mar</text>
                <text x="290" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Apr</text>
                <text x="370" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">May</text>
                <text x="450" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Jun</text>

                {/* Area Gradient Fill */}
                <defs>
                  <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path 
                  d="M 50 130 C 90 115, 120 100, 130 90 C 170 70, 190 65, 210 65 C 240 75, 270 95, 290 90 C 330 65, 360 40, 370 35 C 410 25, 440 20, 470 15 L 470 180 L 50 180 Z" 
                  fill="url(#purpleArea)" 
                />

                {/* Smooth Purple Curve */}
                <path 
                  d="M 50 130 C 90 115, 120 100, 130 90 C 170 70, 190 65, 210 65 C 240 75, 270 95, 290 90 C 330 65, 360 40, 370 35 C 410 25, 440 20, 470 15" 
                  fill="none" 
                  stroke="#A78BFA" 
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(167,139,250,0.7)]"
                />
              </svg>
            </div>
          </div>

          {/* Chart 2: Financial Breakdown (Dual Bar Chart) */}
          <div className="bg-[#0B091D]/90 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-6">
              <h3 className="text-lg font-black text-white tracking-tight">Financial Breakdown</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Vendor payouts vs. Platform commissions</p>
            </div>

            <div className="w-full h-64 relative pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" fill="none">
                {/* Horizontal Grid Lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#1A182E" strokeDasharray="3 3" />
                <text x="0" y="24" fill="#52525B" fontSize="10" fontFamily="sans-serif">16000</text>

                <line x1="40" y1="60" x2="480" y2="60" stroke="#1A182E" strokeDasharray="3 3" />
                <text x="0" y="64" fill="#52525B" fontSize="10" fontFamily="sans-serif">12000</text>

                <line x1="40" y1="100" x2="480" y2="100" stroke="#1A182E" strokeDasharray="3 3" />
                <text x="0" y="104" fill="#52525B" fontSize="10" fontFamily="sans-serif">8000</text>

                <line x1="40" y1="140" x2="480" y2="140" stroke="#1A182E" strokeDasharray="3 3" />
                <text x="0" y="144" fill="#52525B" fontSize="10" fontFamily="sans-serif">4000</text>

                <line x1="40" y1="180" x2="480" y2="180" stroke="#27272A" />
                <text x="24" y="184" fill="#52525B" fontSize="10" fontFamily="sans-serif">0</text>

                {/* X Axis Labels */}
                <text x="65" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Jan</text>
                <text x="135" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Feb</text>
                <text x="205" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Mar</text>
                <text x="275" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Apr</text>
                <text x="345" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">May</text>
                <text x="415" y="196" fill="#71717A" fontSize="10" fontFamily="sans-serif">Jun</text>

                {/* Dual Bars for Each Month */}
                {/* Jan */}
                <rect x="58" y="100" width="12" height="80" rx="3" fill="#3B82F6" />
                <rect x="73" y="155" width="12" height="25" rx="3" fill="#8B5CF6" />

                {/* Feb */}
                <rect x="128" y="85" width="12" height="95" rx="3" fill="#3B82F6" />
                <rect x="143" y="150" width="12" height="30" rx="3" fill="#8B5CF6" />

                {/* Mar */}
                <rect x="198" y="70" width="12" height="110" rx="3" fill="#3B82F6" />
                <rect x="213" y="145" width="12" height="35" rx="3" fill="#8B5CF6" />

                {/* Apr */}
                <rect x="268" y="78" width="12" height="102" rx="3" fill="#3B82F6" />
                <rect x="283" y="148" width="12" height="32" rx="3" fill="#8B5CF6" />

                {/* May */}
                <rect x="338" y="55" width="12" height="125" rx="3" fill="#3B82F6" />
                <rect x="353" y="140" width="12" height="40" rx="3" fill="#8B5CF6" />

                {/* Jun */}
                <rect x="408" y="30" width="12" height="150" rx="3" fill="#3B82F6" />
                <rect x="423" y="132" width="12" height="48" rx="3" fill="#8B5CF6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Section - 2 Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (1 Col) - Withdrawal Requests */}
          <div className="bg-[#0B091D]/90 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Withdrawal Requests</h3>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">Action required: {withdrawalRequests.length} requests</p>
                </div>
                <span className="px-3 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold rounded-full">
                  Pending
                </span>
              </div>

              {/* List of Requests */}
              <div className="space-y-4">
                {withdrawalRequests.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs font-medium">
                    No pending withdrawal requests.
                  </div>
                ) : (
                  withdrawalRequests.map((req) => (
                    <div key={req.id} className="bg-[#070512] border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={req.vendorAvatar} 
                            alt={req.vendorName} 
                            className="w-9 h-9 rounded-xl object-cover border border-purple-500/30 shrink-0" 
                          />
                          <div>
                            <h4 className="text-sm font-bold text-white leading-tight">{req.vendorName}</h4>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              Req: {req.reqDate} • Bal: {req.balance}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-white tracking-tight">
                            ${req.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button 
                          onClick={() => openRejectModal(req)}
                          className="py-2 bg-[#17142B] hover:bg-[#221E3E] text-zinc-300 hover:text-white text-xs font-extrabold rounded-xl border border-white/5 transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApproveRequest(req.id, req.vendorName, req.amount)}
                          className="py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 text-center">
              <button 
                onClick={() => toast.info("Viewing all withdrawal requests...")}
                className="text-xs font-extrabold text-zinc-400 hover:text-purple-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                View All Requests
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column (2 Cols) - Recent Wallet Transactions */}
          <div className="lg:col-span-2 bg-[#0B091D]/90 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Recent Wallet Transactions</h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Real-time credit and debit log</p>
              </div>

              <button className="px-3.5 py-1.5 bg-[#120F24] hover:bg-[#1C1836] border border-white/10 text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                Filter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-black text-zinc-500 tracking-wider">
                    <th className="pb-3.5 font-bold">Transaction ID</th>
                    <th className="pb-3.5 font-bold">Type</th>
                    <th className="pb-3.5 font-bold">Amount</th>
                    <th className="pb-3.5 font-bold">From</th>
                    <th className="pb-3.5 font-bold">Reason</th>
                    <th className="pb-3.5 font-bold">Status</th>
                    <th className="pb-3.5 font-bold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {transactions.map((tx) => {
                    const isCredit = tx.type === "Credit";

                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3.5 font-mono text-[11px] font-bold text-zinc-400 whitespace-nowrap">
                          #{tx.id}
                        </td>

                        <td className="py-3.5 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${tx.typeBg}`}>
                            {tx.type}
                          </span>
                        </td>

                        <td className={`py-3.5 font-black text-xs whitespace-nowrap ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isCredit ? `+$${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : `-$${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                        </td>

                        <td className="py-3.5 font-bold text-white whitespace-nowrap">
                          {tx.from}
                        </td>

                        <td className="py-3.5 text-zinc-400 text-[11px] whitespace-nowrap">
                          {tx.reason}
                        </td>

                        <td className="py-3.5 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${tx.statusBg}`}>
                            {tx.status}
                          </span>
                        </td>

                        <td className="py-3.5 text-right text-zinc-400 text-[11px] font-medium whitespace-nowrap">
                          {tx.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Funds Modal */}
        {showAddFundsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0E0C20] border border-purple-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-2xl text-purple-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Add Platform Funds</h3>
                    <p className="text-xs text-zinc-400 font-medium">Inject capital into admin reserve balance</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddFundsModal(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddFundsSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">Amount to Add ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="5000.00"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="w-full bg-[#080614] border border-zinc-800 rounded-2xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">Funding Source Account</label>
                  <select 
                    value={addSource}
                    onChange={(e) => setAddSource(e.target.value)}
                    className="w-full bg-[#080614] border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer font-bold"
                  >
                    <option value="Platform Reserve Account">Platform Reserve Account (**** 9912)</option>
                    <option value="Corporate Bank Wire">Corporate Bank Wire (**** 4401)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddFundsModal(false)}
                    className="flex-1 py-3 bg-[#16132D] hover:bg-[#201C3F] text-zinc-300 text-xs font-extrabold rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer"
                  >
                    Confirm Deposit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Withdrawal Request Modal */}
        {showRejectModal && rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0E0C20] border border-rose-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-600/20 border border-rose-500/30 rounded-2xl text-rose-400">
                    <X className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Reject Withdrawal Request</h3>
                    <p className="text-xs text-zinc-400 font-medium">Specify reason for vendor request rejection</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div className="bg-[#070512] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{rejectingItem.vendorName}</span>
                    <span className="text-[11px] text-zinc-400">Requested: ${rejectingItem.amount?.toLocaleString()}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold rounded-full">
                    Pending Review
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">Rejection Reason (Optional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Enter reason for rejecting this payout request (e.g., Invalid bank details)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[#080614] border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-medium resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 py-3 bg-[#16132D] hover:bg-[#201C3F] text-zinc-300 text-xs font-extrabold rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer"
                  >
                    Reject Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPaymentPage;
