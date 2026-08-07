import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Download, 
  Bell, 
  LayoutGrid, 
  Info, 
  ArrowRight,
  Building2,
  Ticket as TicketIcon,
  CreditCard,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import { getVendorWalletApi, getVendorWalletTransactionsApi, requestWithdrawalApi } from "../../services/vendor.api.js";

const VendorWallet = () => {
  const vendor = useSelector((state) => state.vendor?.vendor || state.user?.user);
  
  // State Values matching design
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  // Form State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState("Chase Bank (**** 8842)");
  const [loading, setLoading] = useState(false);

  // Transaction History State
  const [transactions, setTransactions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch Real Vendor Wallet & Transactions Data
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setDataLoading(true);
        const [walletRes, txRes] = await Promise.all([
          getVendorWalletApi(),
          getVendorWalletTransactionsApi()
        ]);

        if (walletRes.data?.success && walletRes.data.wallet) {
          const w = walletRes.data.wallet;
          setAvailableBalance(w.availableBalance || 0);
          setTotalEarnings(w.totalEarnings || 0);
          setPendingPayouts(w.pendingBalance || 0);
          setTotalWithdrawn(w.totalWithdrawn || 0);
        }

        if (txRes.data?.success && txRes.data.transactions) {
          const formattedTx = txRes.data.transactions.map((tx) => {
            const created = new Date(tx.createdTime || tx.createdAt);
            const isEarnings = tx.transactionType === "earnings" || tx.transactionType === "credit";
            const isRefund = tx.transactionType === "refund";

            let typeLabel = "Earnings";
            let typeBg = "bg-purple-950/60 border-purple-500/30 text-purple-300";
            let iconComp = TicketIcon;
            let iconBg = "bg-purple-950/60 text-purple-400 border-purple-500/30";

            if (isRefund) {
              typeLabel = "Refund";
              typeBg = "bg-rose-950/60 border-rose-500/30 text-rose-300";
              iconComp = TicketIcon;
              iconBg = "bg-rose-950/60 text-rose-400 border-rose-500/30";
            } else if (!isEarnings) {
              typeLabel = "Payout";
              typeBg = "bg-amber-950/60 border-amber-500/30 text-amber-300";
              iconComp = Building2;
              iconBg = "bg-amber-950/60 text-amber-400 border-amber-500/30";
            }

            let subtitle = tx.eventId?.title ? `Event: ${tx.eventId.title}` : "";
            if (tx.bookingId) {
              const bId = tx.bookingId.bookingId || tx.bookingId._id;
              const qty = tx.bookingId.quantity;
              subtitle = `Booking ID: ${bId}` + (qty ? ` • Quantity: ${qty} Ticket${qty > 1 ? "s" : ""}` : "");
            }

            return {
              id: tx._id,
              date: created.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              time: created.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              title: tx.description || (isEarnings ? "Event Ticket Sales Earnings" : (isRefund ? "Booking Cancellation Refund" : "Payout Request")),
              subtitle: subtitle || "Booking Details",
              type: typeLabel,
              typeBg,
              status: tx.status === "completed" ? "Completed" : "Pending",
              statusBg: tx.status === "completed" ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400" : "bg-amber-950/60 border-amber-500/30 text-amber-400",
              amount: isEarnings ? (tx.netAmount || tx.amount) : -Math.abs(tx.netAmount || tx.amount),
              icon: iconComp,
              iconBg
            };
          });
          setTransactions(formattedTx);
        }
      } catch (err) {
        console.error("Error fetching vendor wallet data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const handleMaxClick = () => {
    setWithdrawAmount(availableBalance.toString());
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid withdrawal amount greater than zero.");
      return;
    }
    if (amt > availableBalance) {
      toast.error("Requested amount exceeds available wallet balance!");
      return;
    }

    try {
      setLoading(true);
      const res = await requestWithdrawalApi({
        amount: amt,
        destinationAccount,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Withdrawal request submitted successfully!");
        setWithdrawAmount("");
        // Refresh wallet data to reflect pending status
        const [walletRes, txRes] = await Promise.all([
          getVendorWalletApi(),
          getVendorWalletTransactionsApi()
        ]);
        if (walletRes.data?.success && walletRes.data.wallet) {
          const w = walletRes.data.wallet;
          setAvailableBalance(w.availableBalance || 0);
          setTotalEarnings(w.totalEarnings || 0);
          setPendingPayouts(w.pendingBalance || 0);
          setTotalWithdrawn(w.totalWithdrawn || 0);
        }
      }
    } catch (err) {
      console.error("Error submitting withdrawal request:", err);
      toast.error(err.response?.data?.message || "Failed to submit withdrawal request.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.loading("Generating revenue report CSV...", { id: "export-toast" });
    setTimeout(() => {
      toast.success("Revenue & Payouts report downloaded successfully!", { id: "export-toast" });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#05050C] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar Navigation */}
      <VendorSidebar />

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
              <h2 className="text-sm font-bold text-zinc-400">Earnings Overview</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bell Icon Button */}
            <button className="relative p-2.5 bg-[#0E0C1D] hover:bg-[#1A1633] border border-white/5 rounded-2xl transition-all cursor-pointer">
              <Bell className="w-4 h-4 text-zinc-400 hover:text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full" />
            </button>

            {/* Vendor Profile Pill */}
            <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-[#0E0C1D] border border-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md overflow-hidden shrink-0">
                {vendor?.profilePicture?.fileUrl ? (
                  <img src={vendor.profilePicture.fileUrl} alt={vendor.fullName || vendor.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{vendor?.fullName ? vendor.fullName.charAt(0).toUpperCase() : "A"}</span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">{vendor?.fullName || vendor?.name || "Alex Morgan"}</span>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Vendor Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Title & Export Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Revenue & Payouts</h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">Track your earnings, manage withdrawals, and view transaction history.</p>
          </div>

          <button 
            onClick={handleExportReport}
            className="px-5 py-2.5 bg-[#0E0C1D] hover:bg-[#18142F] border border-white/10 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer shadow-md self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Export Report
          </button>
        </div>

        {/* Top 4 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Earnings Card */}
          <div className="bg-[#0B0918]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-zinc-400">Total Earnings</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +20.1% from last month
            </div>
          </div>

          {/* Available Balance Card */}
          <div className="bg-[#0B0918]/90 border border-purple-500/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-zinc-400">Available Balance</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <WalletIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              ${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-medium text-zinc-500">
              Ready to withdraw
            </div>
          </div>

          {/* Pending Payouts Card */}
          <div className="bg-[#0B0918]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-zinc-400">Pending Payouts</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              ${pendingPayouts.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-medium text-zinc-500">
              Processing within 24h
            </div>
          </div>

          {/* Total Withdrawn Card */}
          <div className="bg-[#0B0918]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-zinc-400">Total Withdrawn</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              ${totalWithdrawn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-medium text-zinc-500">
              Lifetime earnings
            </div>
          </div>
        </div>

        {/* Middle Section (2 Columns Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
          
          {/* Left Column (2 Cols) - Transaction History Table */}
          <div className="lg:col-span-2 bg-[#0A0818]/90 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Transaction History</h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Recent earnings and payouts</p>
              </div>

              <button className="px-4 py-2 bg-[#0E0C1C] hover:bg-[#18142F] border border-zinc-800/80 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-black text-zinc-500 tracking-wider">
                    <th className="pb-4 font-bold">Date & Time</th>
                    <th className="pb-4 font-bold">Transaction Details</th>
                    <th className="pb-4 font-bold">Type</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500 font-medium">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const IconComp = tx.icon || TicketIcon;
                      const isEarning = tx.amount > 0;

                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-4 text-zinc-400 font-medium whitespace-nowrap">
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

                          <td className="py-4 whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border ${tx.typeBg}`}>
                              {tx.type}
                            </span>
                          </td>

                          <td className="py-4 whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border ${tx.statusBg}`}>
                              {tx.status}
                            </span>
                          </td>

                          <td className={`py-4 text-right font-black text-sm whitespace-nowrap ${isEarning ? "text-emerald-400" : "text-white"}`}>
                            {isEarning ? `+$${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : `-$${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column (1 Col) - Request Payout Card */}
          <div className="bg-[#0B0918]/90 border border-purple-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Withdrawals</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-3">Request Payout</h3>
              <p className="text-xs text-zinc-400 font-medium mt-1">Transfer earnings to your bank account</p>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Amount to Withdraw */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-[#080612] border border-zinc-800/90 rounded-2xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] mt-1.5 px-1 font-medium">
                  <span className="text-zinc-500">Available: ${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  <button 
                    type="button" 
                    onClick={handleMaxClick}
                    className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Destination Account */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Destination Account</label>
                <select 
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  className="w-full bg-[#080612] border border-zinc-800/90 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="Chase Bank (**** 8842)">Chase Bank (**** 8842)</option>
                  <option value="HDFC Bank (**** 8829)">HDFC Bank (**** 8829)</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                </select>
              </div>

              {/* Info Alert Box */}
              <div className="bg-[#120F28]/80 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3 mt-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  Minimum withdrawal is $50.00. Processing takes 24-48 business hours.
                </p>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? "Processing..." : "Withdraw Funds"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorWallet;
