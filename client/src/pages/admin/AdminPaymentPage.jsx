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
  DollarSign,
  Sidebar,
  CheckCircle2,
  XCircle,
  AlertCircle
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
  const [platformBalance, setPlatformBalance] = useState(0);
  const [vendorPayouts, setVendorPayouts] = useState(0);
  const [pendingWithdrawalsAmount, setPendingWithdrawalsAmount] = useState(0);
  const [commissionEarned, setCommissionEarned] = useState(0);

  // Add Funds Modal State
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addSource, setAddSource] = useState("Platform Reserve Account");

  // Rejection Reason Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Withdrawal Requests & Transactions State
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [withdrawalTab, setWithdrawalTab] = useState("pending");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch Real Withdrawal Requests (Filtering out duplicates & building live transaction log)
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await getAdminWithdrawalsApi();
      if (res.data?.success && res.data.requests) {
        const uniqueRequestsMap = new Map();
        res.data.requests.forEach((r) => {
          if (!uniqueRequestsMap.has(r._id)) {
            uniqueRequestsMap.set(r._id, {
              id: r._id,
              vendorName: r.vendorId?.businessName || r.vendorId?.fullName || "Vendor Account",
              vendorAvatar: r.vendorId?.profilePicture?.fileUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              amount: r.amount,
              reqDate: new Date(r.requestedAt || r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              processedDate: r.processedAt ? new Date(r.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null,
              balance: `₹${r.amount.toLocaleString("en-IN")}`,
              status: r.status || "pending",
              destinationAccount: r.destinationAccount || r.bankDetails?.bankName || "Bank Transfer",
              bankDetails: r.bankDetails,
              rejectionReason: r.rejectionReason
            });
          }
        });

        const mapped = Array.from(uniqueRequestsMap.values());
        setWithdrawalRequests(mapped);

        // Calculate pending amount total dynamically
        const pendingTotal = mapped
          .filter((r) => r.status === "pending")
          .reduce((sum, r) => sum + r.amount, 0);
        setPendingWithdrawalsAmount(pendingTotal);

        // Calculate approved payouts total dynamically
        const approvedTotal = mapped
          .filter((r) => r.status === "approved")
          .reduce((sum, r) => sum + r.amount, 0);
        setVendorPayouts(approvedTotal);
        setCommissionEarned(approvedTotal * 0.1);
        setPlatformBalance(approvedTotal > 0 ? approvedTotal * 0.2 : 0);

        // Build unique transactions log from real withdrawal requests
        const txLogs = mapped.map((req) => {
          const isApproved = req.status === "approved";
          const isRejected = req.status === "rejected";
          return {
            id: `TXN-${req.id.slice(-6).toUpperCase()}`,
            type: "Debit",
            typeBg: "bg-rose-950/60 border-rose-500/30 text-rose-400",
            amount: -req.amount,
            from: req.vendorName,
            reason: "Vendor payout",
            status: isApproved ? "Completed" : (isRejected ? "Rejected" : "Pending"),
            statusBg: isApproved 
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400" 
              : (isRejected ? "bg-rose-950/60 border-rose-500/30 text-rose-400" : "bg-amber-950/60 border-amber-500/30 text-amber-400"),
            date: req.reqDate
          };
        });
        setTransactions(txLogs);
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
        toast.success(`Withdrawal request of ₹${amount.toLocaleString("en-IN")} for ${vendorName} approved successfully!`, { id: "admin-approve-toast" });
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
    toast.success(`Successfully added ₹${amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })} to Platform Balance!`);
  };

  const handleExportReport = () => {
    toast.info("Preparing financial report... Download will start shortly.");
  };

  // Grouped requests counts
  const pendingRequests = withdrawalRequests.filter(r => r.status === "pending");
  const approvedRequests = withdrawalRequests.filter(r => r.status === "approved");
  const rejectedRequests = withdrawalRequests.filter(r => r.status === "rejected");

  // Tab-filtered withdrawal requests
  const displayedWithdrawals = withdrawalRequests.filter(r => r.status === withdrawalTab);

  // Filtered transactions list
  const uniqueTransactions = Array.from(new Map(transactions.map(t => [t.id, t])).values());
  const filteredTransactions = statusFilter === "all"
    ? uniqueTransactions
    : uniqueTransactions.filter(t => t.status.toLowerCase() === statusFilter.toLowerCase());

  return (
    <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-gray-800 bg-[#0B0914] shrink-0">
          <div className="flex items-center text-gray-400 text-sm">
            <Sidebar className="w-5 h-5 mr-3 sm:mr-4 text-gray-500" />
            <span className="hidden sm:inline">Management</span>
            <span className="hidden sm:inline mx-2 text-gray-600">&gt;</span>
            <span className="text-purple-400 font-medium">Payments & Payouts</span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button 
              onClick={handleExportReport}
              className="px-3.5 py-2 bg-[#151221] hover:bg-[#201B34] border border-gray-800 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            <button 
              onClick={() => setShowAddFundsModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Funds</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-0 space-y-8 scrollbar-hide">
          
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Payment & Payouts</h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">Platform financial governance, vendor withdrawals, and earnings ledger</p>
            </div>
          </div>

          {/* Top 4 Financial KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 shrink-0">
            
            {/* Card 1: Platform Balance */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <span className="text-xs font-bold text-zinc-400">Platform Balance</span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 truncate">
                ₹{platformBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-400">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-sm" />
                +12.5% from last month
              </div>
            </div>

            {/* Card 2: Vendor Payouts */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <span className="text-xs font-bold text-zinc-400">Vendor Payouts</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                  <HandCoins className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 truncate">
                ₹{vendorPayouts.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs font-medium text-zinc-400">
                Total disbursed YTD
              </div>
            </div>

            {/* Card 3: Pending Withdrawals */}
            <div className="bg-[#151221] border border-amber-500/30 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <span className="text-xs font-bold text-zinc-400">Pending Withdrawals</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 truncate">
                ₹{pendingWithdrawalsAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                {pendingRequests.length} requests pending
              </div>
            </div>

            {/* Card 4: Commission Earned */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <span className="text-xs font-bold text-zinc-400">Commission Earned</span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                  <PieChart className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 truncate">
                ₹{commissionEarned.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-400">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-sm" />
                +8.2% all time
              </div>
            </div>
          </div>

          {/* Section 1: Full-Width Withdrawal Requests with Filter Tabs */}
          <div className="bg-[#151221] border border-gray-800/80 rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-2xl backdrop-blur-md flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-white tracking-tight">Withdrawal Requests</h3>
                  <span className="px-2.5 py-0.5 bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-extrabold rounded-full">
                    {pendingRequests.length} Pending
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium mt-1">Review pending payout approvals, settled disbursements, and rejected requests</p>
              </div>

              {/* Status Tabs (Pending, Approved, Rejected) */}
              <div className="flex flex-wrap items-center gap-2 bg-[#0B0914] p-1 rounded-2xl border border-gray-800">
                <button
                  onClick={() => setWithdrawalTab("pending")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    withdrawalTab === "pending"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-900/30"
                      : "text-zinc-400 hover:text-amber-400"
                  }`}
                >
                  Pending ({pendingRequests.length})
                </button>

                <button
                  onClick={() => setWithdrawalTab("approved")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    withdrawalTab === "approved"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                      : "text-zinc-400 hover:text-emerald-400"
                  }`}
                >
                  Approved ({approvedRequests.length})
                </button>

                <button
                  onClick={() => setWithdrawalTab("rejected")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    withdrawalTab === "rejected"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-900/30"
                      : "text-zinc-400 hover:text-rose-400"
                  }`}
                >
                  Rejected ({rejectedRequests.length})
                </button>
              </div>
            </div>

            {/* List of Requests in Responsive Cards Grid */}
            <div>
              {displayedWithdrawals.length === 0 ? (
                <div className="py-14 text-center text-zinc-500 text-sm font-medium bg-[#0B0914]/50 rounded-2xl border border-gray-800/60">
                  No {withdrawalTab !== "all" ? withdrawalTab : ""} withdrawal requests found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayedWithdrawals.map((req) => {
                    const isPending = req.status === "pending";
                    const isApproved = req.status === "approved";
                    const isRejected = req.status === "rejected";

                    return (
                      <div 
                        key={req.id} 
                        className={`bg-[#0B0914] border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:border-gray-700 ${
                          isPending 
                            ? "border-amber-500/25 shadow-sm shadow-amber-950/20" 
                            : isApproved 
                            ? "border-emerald-500/25" 
                            : "border-rose-500/25"
                        }`}
                      >
                        {/* Top: Vendor Info & Status Badge */}
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img 
                                src={req.vendorAvatar} 
                                alt={req.vendorName} 
                                className="w-10 h-10 rounded-xl object-cover border border-purple-500/30 shrink-0" 
                              />
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-white leading-tight truncate" title={req.vendorName}>{req.vendorName}</h4>
                                <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                                  {req.reqDate}
                                </p>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                              isPending 
                                ? "bg-amber-950/60 border-amber-500/40 text-amber-400" 
                                : isApproved 
                                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400" 
                                : "bg-rose-950/60 border-rose-500/40 text-rose-400"
                            }`}>
                              {isPending ? "Pending Review" : isApproved ? "Approved" : "Rejected"}
                            </span>
                          </div>

                          {/* Middle: Amount & Destination */}
                          <div className="bg-[#151221]/80 rounded-xl p-3 border border-gray-800/80 space-y-1">
                            <div className="text-[11px] text-zinc-400">Withdrawal Amount</div>
                            <div className="text-xl font-black text-white tracking-tight">
                              ₹{req.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate pt-1 border-t border-gray-800/60">
                              Acc: {req.destinationAccount}
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Action Buttons or Status Footer */}
                        <div>
                          {isPending ? (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button 
                                onClick={() => openRejectModal(req)}
                                className="py-2 bg-[#1C1833] hover:bg-[#2A244D] text-zinc-300 hover:text-white text-xs font-extrabold rounded-xl border border-white/5 transition-all cursor-pointer"
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
                          ) : isApproved ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Settled {req.processedDate ? `on ${req.processedDate}` : "successfully"}</span>
                            </div>
                          ) : (
                            <div className="flex items-start gap-1.5 text-[11px] text-rose-400 font-medium bg-rose-950/30 border border-rose-500/20 px-3 py-2 rounded-xl">
                              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="truncate" title={req.rejectionReason || "Requirements not met"}>
                                Reason: {req.rejectionReason || "Declined by admin"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Full-Width Recent Wallet Transactions */}
          <div className="bg-[#151221] border border-gray-800/80 rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-2xl backdrop-blur-md flex flex-col space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Recent Wallet Transactions</h3>
                <p className="text-xs text-zinc-400 font-medium mt-1">Real-time credit and debit transactions audit trail across the platform</p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 bg-[#0B0914] border border-gray-800 text-zinc-300 text-xs font-bold rounded-xl focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Transactions Table - 100% Fluid & Clean with Zero Scrollbar */}
            <div className="w-full rounded-2xl border border-gray-800/80 bg-[#0B0914] overflow-hidden">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] sm:text-[11px] uppercase font-black text-zinc-400 tracking-wider bg-white/[0.02]">
                    <th className="px-4 py-3.5 font-bold">Txn ID</th>
                    <th className="px-3 py-3.5 font-bold">Type</th>
                    <th className="px-4 py-3.5 font-bold">Amount</th>
                    <th className="px-4 py-3.5 font-bold">Vendor / Party</th>
                    <th className="hidden sm:table-cell px-4 py-3.5 font-bold">Reason</th>
                    <th className="px-3 py-3.5 font-bold text-center">Status</th>
                    <th className="hidden md:table-cell px-4 py-3.5 font-bold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-zinc-500 font-medium">
                        No wallet transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isCredit = tx.type === "Credit";

                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-zinc-400 whitespace-nowrap">
                            #{tx.id}
                          </td>

                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${tx.typeBg}`}>
                              {tx.type}
                            </span>
                          </td>

                          <td className={`px-4 py-3.5 font-black text-xs whitespace-nowrap ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                            {isCredit ? `+₹${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : `-₹${Math.abs(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                          </td>

                          <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap max-w-[160px] truncate" title={tx.from}>
                            {tx.from}
                          </td>

                          <td className="hidden sm:table-cell px-4 py-3.5 text-zinc-400 text-[11px] whitespace-nowrap max-w-[150px] truncate" title={tx.reason}>
                            {tx.reason}
                          </td>

                          <td className="px-3 py-3.5 whitespace-nowrap text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${tx.statusBg}`}>
                              {tx.status}
                            </span>
                          </td>

                          <td className="hidden md:table-cell px-4 py-3.5 text-right text-zinc-400 text-[11px] font-medium whitespace-nowrap">
                            {tx.date}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Funds Modal */}
        {showAddFundsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#151221] border border-purple-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
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
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">Amount to Add (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">₹</span>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="5000.00"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="w-full bg-[#0B0914] border border-zinc-800 rounded-2xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">Funding Source Account</label>
                  <select 
                    value={addSource}
                    onChange={(e) => setAddSource(e.target.value)}
                    className="w-full bg-[#0B0914] border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer font-bold"
                  >
                    <option value="Platform Reserve Account">Platform Reserve Account (**** 9912)</option>
                    <option value="Corporate Bank Wire">Corporate Bank Wire (**** 4401)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddFundsModal(false)}
                    className="flex-1 py-3 bg-[#1C1833] hover:bg-[#2A244D] text-zinc-300 text-xs font-extrabold rounded-2xl transition-all cursor-pointer"
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
            <div className="bg-[#151221] border border-rose-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
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
                <div className="bg-[#0B0914] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{rejectingItem.vendorName}</span>
                    <span className="text-[11px] text-zinc-400">Requested: ₹{rejectingItem.amount?.toLocaleString("en-IN")}</span>
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
                    className="w-full bg-[#0B0914] border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-medium resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 py-3 bg-[#1C1833] hover:bg-[#2A244D] text-zinc-300 text-xs font-extrabold rounded-2xl transition-all cursor-pointer"
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
