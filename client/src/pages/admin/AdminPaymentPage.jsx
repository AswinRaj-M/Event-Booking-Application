import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
  AlertCircle,
  Loader2,
  CreditCard,
  ArrowDownLeft
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  getAdminWithdrawalsApi,
  approveWithdrawalApi,
  rejectWithdrawalApi,
  createAdminWalletOrderApi,
  verifyAdminWalletPaymentApi,
  recordAdminWalletPaymentFailureApi,
  getAdminWalletDetailsApi
} from "../../services/admin.api.js";

const AdminPaymentPage = () => {
  const adminState = useSelector((state) => state.admin);
  const adminUser = adminState?.admin;

  // Financial KPI state
  const [platformBalance, setPlatformBalance] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [vendorPayouts, setVendorPayouts] = useState(0);
  const [pendingWithdrawalsAmount, setPendingWithdrawalsAmount] = useState(0);
  const [commissionEarned, setCommissionEarned] = useState(0);
  const [totalCouponCostSponsored, setTotalCouponCostSponsored] = useState(0);
  const [netPlatformRevenue, setNetPlatformRevenue] = useState(0);

  // Add Funds Modal State
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
  const [typeFilter, setTypeFilter] = useState("all");

  // Dynamic Script Loader for Razorpay Checkout SDK
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

  // Fetch Full Financial Data & Unified Transactions Ledger
  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      const [walletRes, withdrawalsRes] = await Promise.all([
        getAdminWalletDetailsApi().catch((err) => {
          console.error("Error fetching admin wallet details:", err);
          return null;
        }),
        getAdminWithdrawalsApi().catch((err) => {
          console.error("Error fetching withdrawals:", err);
          return null;
        }),
      ]);

      // 1. Process Wallet Details & Metrics
      if (walletRes?.data?.success && walletRes.data.data) {
        const { metrics, wallet } = walletRes.data.data;
        setPlatformBalance(Number(metrics.platformBalance) || 0);
        setTotalDeposited(Number(metrics.totalDeposited ?? wallet?.totalDeposited) || 0);
        setVendorPayouts(Number(metrics.vendorPayouts) || 0);
        setPendingWithdrawalsAmount(Number(metrics.pendingWithdrawalsAmount) || 0);
        setCommissionEarned(Number(metrics.commissionEarned) || 0);
        setTotalCouponCostSponsored(Number(metrics.totalCouponCostSponsored) || 0);
        setNetPlatformRevenue(Number(metrics.netPlatformRevenue) || 0);
      }

      // 2. Process Withdrawal Requests
      let mappedWithdrawals = [];
      if (withdrawalsRes?.data?.success && withdrawalsRes.data.requests) {
        const uniqueRequestsMap = new Map();
        withdrawalsRes.data.requests.forEach((r) => {
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
              rejectionReason: r.rejectionReason,
              rawDate: new Date(r.requestedAt || r.createdAt),
            });
          }
        });
        mappedWithdrawals = Array.from(uniqueRequestsMap.values());
        setWithdrawalRequests(mappedWithdrawals);
      }

      // 3. Build Unified Transactions Ledger (Admin Deposits + Vendor Payouts)
      const allTx = [];

      // Add Admin Wallet Transactions (Deposits, Platform Commissions, Refunds)
      if (walletRes?.data?.data?.transactions) {
        walletRes.data.data.transactions.forEach((tx) => {
          const isCredit = tx.amount >= 0;
          let category = "Admin Deposit";
          let from = "Razorpay Payment";
          if (tx.transactionType === "commission") {
            category = "Platform Commission";
            from = "Booking Platform Fee";
          } else if (tx.transactionType === "refund") {
            category = "Refund Reversal";
            from = "Booking Cancellation";
          } else if (tx.transactionType === "payout") {
            category = "Vendor Payout";
            from = "Admin Wallet";
          }

          allTx.push({
            id: tx.razorpayPaymentId || `TXN-${tx._id.slice(-6).toUpperCase()}`,
            type: isCredit ? "Credit" : "Debit",
            category,
            typeBg: isCredit
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
              : "bg-rose-950/60 border-rose-500/30 text-rose-400",
            amount: tx.amount,
            from,
            reason: tx.description || "Admin wallet transaction",
            paymentId: tx.razorpayPaymentId || tx.razorpayOrderId || (tx.metadata?.bookingCode || "N/A"),
            status: tx.status === "completed" ? "Completed" : (tx.status === "failed" ? "Failed" : "Pending"),
            statusBg: tx.status === "completed"
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
              : "bg-rose-950/60 border-rose-500/30 text-rose-400",
            date: new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            rawDate: new Date(tx.createdAt),
          });
        });
      }

      // Add Vendor Payouts/Withdrawals
      mappedWithdrawals.forEach((req) => {
        const isApproved = req.status === "approved";
        const isRejected = req.status === "rejected";
        allTx.push({
          id: `TXN-${req.id.slice(-6).toUpperCase()}`,
          type: "Debit",
          category: "Vendor Payout",
          typeBg: "bg-rose-950/60 border-rose-500/30 text-rose-400",
          amount: -req.amount,
          from: req.vendorName,
          reason: "Vendor payout disbursement",
          paymentId: req.destinationAccount,
          status: isApproved ? "Completed" : (isRejected ? "Rejected" : "Pending"),
          statusBg: isApproved 
            ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400" 
            : (isRejected ? "bg-rose-950/60 border-rose-500/30 text-rose-400" : "bg-amber-950/60 border-amber-500/30 text-amber-400"),
          date: req.reqDate,
          rawDate: req.rawDate,
        });
      });

      // Sort by newest first
      allTx.sort((a, b) => b.rawDate - a.rawDate);
      setTransactions(allTx);

    } catch (err) {
      console.error("Error fetching admin financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Action Handlers for Vendor Withdrawals
  const handleApproveRequest = async (id, vendorName, amount) => {
    try {
      toast.loading("Approving withdrawal request...", { id: "admin-approve-toast" });
      const res = await approveWithdrawalApi(id);
      if (res.data?.success) {
        toast.success(`Withdrawal request of ₹${amount.toLocaleString("en-IN")} for ${vendorName} approved successfully!`, { id: "admin-approve-toast" });
        await fetchFinancialData();
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
        await fetchFinancialData();
      }
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      toast.error(err.response?.data?.message || "Failed to reject withdrawal request.", { id: "admin-reject-toast" });
    }
  };

  // Amount Validation Helper
  const validateDepositAmount = (val) => {
    if (!val || val.trim() === "") {
      setAmountError("Amount is required.");
      return false;
    }
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) {
      setAmountError("Please enter a valid numeric amount.");
      return false;
    }
    if (num <= 0) {
      setAmountError("Amount must be greater than ₹0.");
      return false;
    }
    if (num > 500000) {
      setAmountError("Maximum deposit limit is ₹5,00,000 per transaction.");
      return false;
    }
    // Check max 2 decimal places
    const decimalParts = val.split(".");
    if (decimalParts.length > 1 && decimalParts[1].length > 2) {
      setAmountError("Amount cannot have more than 2 decimal places.");
      return false;
    }
    setAmountError("");
    return true;
  };

  // Handle Add Money via Razorpay
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    const isValid = validateDepositAmount(addAmount);
    if (!isValid) return;

    const numAmount = Number(addAmount);

    try {
      setIsProcessingPayment(true);

      // 1. Load Razorpay SDK dynamically
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay payment SDK. Please check your internet connection.");
        setIsProcessingPayment(false);
        return;
      }

      // 2. Call backend to create Razorpay Order
      toast.loading("Creating secure payment order...", { id: "admin-razorpay-toast" });
      const orderRes = await createAdminWalletOrderApi(numAmount);

      if (!orderRes.data?.success || !orderRes.data?.order_id) {
        toast.error(orderRes.data?.message || "Failed to create payment order.", { id: "admin-razorpay-toast" });
        setIsProcessingPayment(false);
        return;
      }

      toast.dismiss("admin-razorpay-toast");
      const orderData = orderRes.data;

      // 3. Initialize Razorpay Checkout Modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Festivo Admin Platform",
        description: "Admin Platform Reserve Capital Deposit",
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            toast.loading("Verifying payment with bank & crediting wallet...", { id: "admin-verify-toast" });
            
            // 4. Send payment signatures to backend for HMAC verification & atomic balance credit
            const verifyRes = await verifyAdminWalletPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              toast.success(
                verifyRes.data.message || `₹${numAmount.toLocaleString("en-IN")} added to your wallet successfully!`,
                { id: "admin-verify-toast" }
              );
              setShowAddFundsModal(false);
              setAddAmount("");
              setAmountError("");
              await fetchFinancialData();
            }
          } catch (verifyErr) {
            console.error("[Razorpay Verification Error]:", verifyErr);
            toast.error(
              verifyErr.response?.data?.message || "Payment verification failed. Your wallet has not been credited.",
              { id: "admin-verify-toast" }
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: async () => {
            setIsProcessingPayment(false);
            try {
              await recordAdminWalletPaymentFailureApi({
                razorpay_order_id: orderData.order_id,
                reason: "Payment cancelled by admin",
              });
            } catch (e) {
              // silent failure
            }
            toast.info("Payment cancelled. Your wallet has not been credited.");
          },
        },
        prefill: {
          name: adminUser?.name || "Admin",
          email: adminUser?.email || "admin@festivo.com",
        },
        theme: {
          color: "#8B5CF6",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on("payment.failed", async (response) => {
        setIsProcessingPayment(false);
        try {
          await recordAdminWalletPaymentFailureApi({
            razorpay_order_id: orderData.order_id,
            reason: response.error?.description || "Payment failed at gateway",
          });
        } catch (e) {
          // silent failure
        }
        toast.error(response.error?.description || "Payment failed. Your wallet has not been credited.");
      });

      razorpayInstance.open();

    } catch (err) {
      console.error("[Add Funds Error]:", err);
      toast.error(err.response?.data?.message || "An error occurred while initiating payment.");
      setIsProcessingPayment(false);
    }
  };

  // Generate and Download PDF Financial Report
  const handleExportReport = () => {
    try {
      toast.loading("Generating financial report PDF...", { id: "export-pdf" });

      const doc = new jsPDF();

      // Header Title
      doc.setFontSize(18);
      doc.text("Festivo Platform - Financial Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 28);
      doc.setTextColor(0);

      // Section 1: Financial KPI Summary Table
      doc.setFontSize(13);
      doc.text("Financial Summary", 14, 38);

      const summaryRows = [
        ["Admin Wallet Balance", `INR ${platformBalance.toLocaleString("en-IN")}`],
        ["Vendor Payouts Disbursed", `INR ${vendorPayouts.toLocaleString("en-IN")}`],
        ["Pending Withdrawals", `INR ${pendingWithdrawalsAmount.toLocaleString("en-IN")}`],
        ["Platform Commission Earned", `INR ${commissionEarned.toLocaleString("en-IN")}`],
        ["Coupon Cost Sponsored (Platform)", `INR ${totalCouponCostSponsored.toLocaleString("en-IN")}`],
        ["Net Platform Revenue", `INR ${netPlatformRevenue.toLocaleString("en-IN")}`],
      ];

      autoTable(doc, {
        startY: 42,
        head: [["Financial Metric", "Amount"]],
        body: summaryRows,
        theme: "striped",
        headStyles: { fillColor: [109, 40, 217] }, // Purple
        styles: { fontSize: 10 },
      });

      // Section 2: Recent Transactions Ledger
      const currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 110;
      doc.setFontSize(13);
      doc.text("Transaction Ledger", 14, currentY);

      const transactionRows = transactions.map((t) => [
        t.date || "-",
        t.title || t.type || "Transaction",
        t.type || "-",
        t.status || "-",
        t.amount || "-",
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Date", "Description", "Type", "Status", "Amount"]],
        body: transactionRows.length > 0 ? transactionRows : [["-", "No transactions found", "-", "-", "-"]],
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] }, // Indigo
        styles: { fontSize: 9 },
      });

      doc.save(`Admin_Financial_Report_${Date.now()}.pdf`);
      toast.success("Financial report downloaded successfully!", { id: "export-pdf" });
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to generate PDF report. Please try again.", { id: "export-pdf" });
    }
  };
  const pendingRequests = withdrawalRequests.filter(r => r.status === "pending");
  const approvedRequests = withdrawalRequests.filter(r => r.status === "approved");
  const rejectedRequests = withdrawalRequests.filter(r => r.status === "rejected");

  // Tab-filtered withdrawal requests
  const displayedWithdrawals = withdrawalRequests.filter(r => r.status === withdrawalTab);

  // Filtered transactions list
  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || t.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesStatus && matchesType;
  });

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
            <span className="text-purple-400 font-medium">Payments & Platform Wallet</span>
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
              onClick={() => {
                setAddAmount("");
                setAmountError("");
                setShowAddFundsModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Money</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-0 space-y-8 scrollbar-hide">
          
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Payment & Payouts</h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">Platform financial governance, admin reserve wallet, and payout ledger</p>
            </div>
          </div>

          {/* Top 4 Financial KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 shrink-0">
            
            {/* Card 1: Platform Balance (Commission + Admin Added Money) */}
            <div className="bg-[#151221] border border-purple-500/30 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <span className="text-xs font-bold text-purple-300">Admin Wallet Balance</span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 truncate">
                ₹{platformBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] font-semibold text-purple-300/80 mb-3 flex items-center gap-1">
                <span>Commission (₹{netPlatformRevenue.toLocaleString("en-IN")}) + Added (₹{totalDeposited.toLocaleString("en-IN")})</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-500/10">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified
                </span>
                <button
                  onClick={() => {
                    setAddAmount("");
                    setAmountError("");
                    setShowAddFundsModal(true);
                  }}
                  className="text-purple-400 hover:text-purple-300 font-bold cursor-pointer transition-colors"
                >
                  + Add Money
                </button>
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
                Total disbursed to vendors
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

            {/* Card 4: Commission & Platform Revenue */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <span className="text-xs font-bold text-zinc-400">Commission & Net Revenue</span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                  <PieChart className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 truncate">
                ₹{commissionEarned.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-400">Net: ₹{netPlatformRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                {totalCouponCostSponsored > 0 && (
                  <span className="text-purple-400 font-medium truncate ml-1">Coupons: -₹{totalCouponCostSponsored.toLocaleString("en-IN")}</span>
                )}
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
                <h3 className="text-xl font-black text-white tracking-tight">Admin Wallet & Payout Ledger</h3>
                <p className="text-xs text-zinc-400 font-medium mt-1">Real-time credit (deposits) and debit (vendor payouts) audit trail</p>
              </div>

              <div className="flex items-center gap-2.5">
                <Filter className="w-4 h-4 text-zinc-400" />
                
                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0B0914] border border-gray-800 text-zinc-300 text-xs font-bold rounded-xl focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Credits (Deposits)</option>
                  <option value="debit">Debits (Payouts)</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0B0914] border border-gray-800 text-zinc-300 text-xs font-bold rounded-xl focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="w-full rounded-2xl border border-gray-800/80 bg-[#0B0914] overflow-hidden">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] sm:text-[11px] uppercase font-black text-zinc-400 tracking-wider bg-white/[0.02]">
                    <th className="px-4 py-3.5 font-bold">Txn / Payment ID</th>
                    <th className="px-3 py-3.5 font-bold">Type</th>
                    <th className="px-4 py-3.5 font-bold">Amount</th>
                    <th className="px-4 py-3.5 font-bold">Party / Channel</th>
                    <th className="hidden sm:table-cell px-4 py-3.5 font-bold">Description</th>
                    <th className="px-3 py-3.5 font-bold text-center">Status</th>
                    <th className="hidden md:table-cell px-4 py-3.5 font-bold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-zinc-500 font-medium">
                        No transactions found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx, idx) => {
                      const isCredit = tx.type === "Credit";

                      return (
                        <tr key={tx.id || idx} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-zinc-300 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {isCredit ? (
                                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              )}
                              <span>{tx.id}</span>
                            </div>
                          </td>

                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${tx.typeBg}`}>
                              {tx.type} ({tx.category || (isCredit ? "Deposit" : "Payout")})
                            </span>
                          </td>

                          <td className={`px-4 py-3.5 font-black text-xs whitespace-nowrap ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                            {isCredit ? `+₹${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : `-₹${Math.abs(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                          </td>

                          <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap max-w-[160px] truncate" title={tx.from}>
                            {tx.from}
                          </td>

                          <td className="hidden sm:table-cell px-4 py-3.5 text-zinc-400 text-[11px] whitespace-nowrap max-w-[170px] truncate" title={tx.reason}>
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

        {/* Add Funds Modal with Razorpay Checkout Integration */}
        {showAddFundsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#151221] border border-purple-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-2xl text-purple-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Add Money to Wallet</h3>
                    <p className="text-xs text-zinc-400 font-medium">Secure deposit via Razorpay Payment Gateway</p>
                  </div>
                </div>
                <button 
                  onClick={() => !isProcessingPayment && setShowAddFundsModal(false)}
                  disabled={isProcessingPayment}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">Deposit Amount (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">₹</span>
                    <input 
                      type="number" 
                      step="any"
                      min="1"
                      max="500000"
                      disabled={isProcessingPayment}
                      placeholder="5000"
                      value={addAmount}
                      onChange={(e) => {
                        setAddAmount(e.target.value);
                        if (amountError) validateDepositAmount(e.target.value);
                      }}
                      className={`w-full bg-[#0B0914] border ${amountError ? "border-rose-500" : "border-zinc-800"} rounded-2xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors font-bold disabled:opacity-50`}
                    />
                  </div>
                  {amountError ? (
                    <p className="text-[11px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {amountError}
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-500 mt-1">Min: ₹1 • Max: ₹5,00,000 per transaction</p>
                  )}
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1.5">Quick Select Amount</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1000, 2000, 5000, 10000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={() => {
                          setAddAmount(String(preset));
                          setAmountError("");
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          addAmount === String(preset)
                            ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                            : "bg-[#0B0914] border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500/50"
                        }`}
                      >
                        ₹{preset.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Guarantee Note */}
                <div className="bg-[#0B0914] border border-purple-500/20 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    Razorpay 256-bit encrypted checkout. Wallet balance will only be credited after server-side cryptographic signature verification.
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => setShowAddFundsModal(false)}
                    className="flex-1 py-3 bg-[#1C1833] hover:bg-[#2A244D] text-zinc-300 text-xs font-extrabold rounded-2xl transition-all cursor-pointer disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessingPayment}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Proceed to Payment</span>
                    )}
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
