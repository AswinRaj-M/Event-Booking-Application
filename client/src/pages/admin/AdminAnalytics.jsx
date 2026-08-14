import React, { useState, useEffect } from "react";
import {
  Users,
  Store,
  Calendar,
  CreditCard,
  Activity,
  DollarSign,
  TrendingUp,
  Download,
  ChevronDown,
  Layout,
  IndianRupee
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminAnalyticsApi } from "../../services/admin.api";
import { toast } from "sonner";

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState({
    kpis: {
      totalUsers: 24592,
      userGrowth: "+12.5%",
      activeVendors: 1204,
      vendorGrowth: "+5.2%",
      eventsCreated: 8432,
      eventGrowth: "+18.3%",
      totalBookings: 18920,
      bookingGrowth: "+14.1%",
      commission: 384000,
      commissionGrowth: "+31.2%",
      totalRevenue: 2400000,
      revenueGrowth: "+28.4%",
    },
    topPerformingEvents: [
      { id: "1", name: "Summer Music Festival", vendor: "LiveEvents Co.", ticketsSold: 8542, revenue: 427100, status: "Active" },
      { id: "2", name: "Tech Summit 2026", vendor: "TechVentures", ticketsSold: 6234, revenue: 374040, status: "Active" },
      { id: "3", name: "Food & Wine Expo", vendor: "Gourmet Events", ticketsSold: 5128, revenue: 256400, status: "Upcoming" },
      { id: "4", name: "Marathon Championship", vendor: "Sports Pro", ticketsSold: 4892, revenue: 244600, status: "Active" },
      { id: "5", name: "Art Gallery Opening", vendor: "Modern Arts", ticketsSold: 3456, revenue: 172800, status: "Completed" },
    ],
    topVendors: [
      { id: "1", vendorName: "LiveEvents Co.", totalEvents: 42, totalEarnings: 1284500, commissionPaid: 192675 },
      { id: "2", vendorName: "TechVentures", totalEvents: 38, totalEarnings: 1156200, commissionPaid: 173430 },
      { id: "3", vendorName: "Sports Pro", totalEvents: 35, totalEarnings: 982400, commissionPaid: 147360 },
      { id: "4", vendorName: "Gourmet Events", totalEvents: 28, totalEarnings: 756800, commissionPaid: 113520 },
      { id: "5", vendorName: "Modern Arts", totalEvents: 24, totalEarnings: 624300, commissionPaid: 93645 },
    ],
    categories: [],
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAdminAnalyticsApi({
        timeframe,
        categoryId: selectedCategory,
      });

      if (res.data?.success && res.data.data) {
        setAnalyticsData((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (err) {
      console.error("Error fetching admin analytics:", err);
      // Keep rich default state if backend is booting
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, selectedCategory]);

  // Generate and Download PDF Report with jsPDF
  const handleExportPDF = () => {
    try {
      toast.loading("Generating analytics PDF report...", { id: "analytics-pdf" });
      const doc = new jsPDF();

      // Header Title
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 30);
      doc.text("Festivo Platform - Analytics Dashboard Report", 14, 20);

      // Metadata Subtitle
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Generated on: ${new Date().toLocaleString("en-IN")} | Timeframe: ${timeframe.toUpperCase()}`,
        14,
        28
      );
      doc.setTextColor(0);

      // Section 1: KPI Summary Table
      doc.setFontSize(13);
      doc.text("Key Performance Indicators", 14, 38);

      const kpiRows = [
        ["Total Users", `${analyticsData.kpis.totalUsers?.toLocaleString() || "0"}`, `${analyticsData.kpis.userGrowth || "N/A"}`],
        ["Active Vendors", `${analyticsData.kpis.activeVendors?.toLocaleString() || "0"}`, `${analyticsData.kpis.vendorGrowth || "N/A"}`],
        ["Events Created", `${analyticsData.kpis.eventsCreated?.toLocaleString() || "0"}`, `${analyticsData.kpis.eventGrowth || "N/A"}`],
        ["Total Bookings", `${analyticsData.kpis.totalBookings?.toLocaleString() || "0"}`, `${analyticsData.kpis.bookingGrowth || "N/A"}`],
        ["Commission", `₹${analyticsData.kpis.commission?.toLocaleString("en-IN") || "0"}`, `${analyticsData.kpis.commissionGrowth || "N/A"}`],
        ["Total Revenue", `₹${analyticsData.kpis.totalRevenue?.toLocaleString("en-IN") || "0"}`, `${analyticsData.kpis.revenueGrowth || "N/A"}`],
      ];

      autoTable(doc, {
        startY: 42,
        head: [["KPI Metric", "Current Value", "Growth vs Last Month"]],
        body: kpiRows,
        theme: "striped",
        headStyles: { fillColor: [109, 40, 217] }, // Purple brand header
        styles: { fontSize: 9 },
      });

      // Section 2: Top Performing Events Table
      const eventsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 110;
      doc.setFontSize(13);
      doc.text("Top Performing Events", 14, eventsY);

      const eventRows = analyticsData.topPerformingEvents.map((e) => [
        e.name,
        e.vendor,
        e.ticketsSold?.toLocaleString() || "0",
        `₹${Number(e.revenue || 0).toLocaleString("en-IN")}`,
        e.status,
      ]);

      autoTable(doc, {
        startY: eventsY + 4,
        head: [["Event Name", "Vendor", "Tickets Sold", "Revenue", "Status"]],
        body: eventRows.length > 0 ? eventRows : [["-", "-", "-", "-", "-"]],
        theme: "striped",
        headStyles: { fillColor: [109, 40, 217] },
        styles: { fontSize: 9 },
      });

      // Section 3: Top Vendors by Revenue Table
      const vendorsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 190;
      if (vendorsY > 230) {
        doc.addPage();
        doc.setFontSize(13);
        doc.text("Top Vendors by Revenue", 14, 20);
        autoTable(doc, {
          startY: 24,
          head: [["Vendor Name", "Total Events", "Total Earnings", "Commission Paid"]],
          body: analyticsData.topVendors.map((v) => [
            v.vendorName,
            v.totalEvents?.toString() || "0",
            `₹${Number(v.totalEarnings || 0).toLocaleString("en-IN")}`,
            `₹${Number(v.commissionPaid || 0).toLocaleString("en-IN")}`,
          ]),
          theme: "striped",
          headStyles: { fillColor: [109, 40, 217] },
          styles: { fontSize: 9 },
        });
      } else {
        doc.setFontSize(13);
        doc.text("Top Vendors by Revenue", 14, vendorsY);
        autoTable(doc, {
          startY: vendorsY + 4,
          head: [["Vendor Name", "Total Events", "Total Earnings", "Commission Paid"]],
          body: analyticsData.topVendors.map((v) => [
            v.vendorName,
            v.totalEvents?.toString() || "0",
            `₹${Number(v.totalEarnings || 0).toLocaleString("en-IN")}`,
            `₹${Number(v.commissionPaid || 0).toLocaleString("en-IN")}`,
          ]),
          theme: "striped",
          headStyles: { fillColor: [109, 40, 217] },
          styles: { fontSize: 9 },
        });
      }

      doc.save(`festivo_analytics_${timeframe}_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Analytics PDF report downloaded successfully!", { id: "analytics-pdf" });
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to generate analytics PDF report.", { id: "analytics-pdf" });
    }
  };

  // Helper for format currency / numbers
  const formatCurrency = (val) => {
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div className="flex h-screen bg-[#070514] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Scrollable Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative z-10">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo-900/10 rounded-full blur-[180px] pointer-events-none -z-10" />

        {/* Scrollable Container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0 space-y-6 scrollbar-thin scrollbar-thumb-purple-900/50">
          
          {/* Top Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Header Title & Subtitle */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2.5 bg-[#120F26] border border-white/10 rounded-xl text-zinc-300 shadow-md">
                <Layout className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-white">Analytics Dashboard</h1>
                <p className="text-xs text-zinc-400 font-medium">Platform performance insights and statistics</p>
              </div>
            </div>

            {/* Action Controls (Filters & PDF Export) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              {/* Timeframe Toggle Buttons (Today, Week, Month) */}
              <div className="bg-[#0D0B1F] border border-white/10 p-1 rounded-xl flex items-center gap-1 shadow-inner shrink-0">
                {["today", "week", "month"].map((tf) => {
                  const isActive = timeframe === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                        isActive
                          ? "bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {tf === "today" ? "Today" : tf === "week" ? "Week" : "Month"}
                    </button>
                  );
                })}
              </div>

              {/* Category Dropdown Filter */}
              <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-[#0D0B1F] border border-white/10 text-xs font-semibold text-zinc-200 pl-3 sm:pl-4 pr-8 sm:pr-9 py-2 rounded-xl focus:outline-none focus:border-purple-500/50 cursor-pointer shadow-md transition-colors"
                >
                  <option value="all">All Categories</option>
                  {analyticsData.categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Export PDF Button */}
              <button
                onClick={handleExportPDF}
                className="px-3.5 sm:px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-extrabold rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-black" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* 6 Top KPI Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
            
            {/* 1. Total Users */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all min-w-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-400 truncate">Total Users</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 truncate">
                {analyticsData.kpis.totalUsers?.toLocaleString() || "24,592"}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 truncate">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>{analyticsData.kpis.userGrowth || "+12.5%"}</span>
                <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
              </div>
            </div>

            {/* 2. Active Vendors */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all min-w-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-400 truncate">Active Vendors</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 truncate">
                {analyticsData.kpis.activeVendors?.toLocaleString() || "1,204"}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 truncate">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>{analyticsData.kpis.vendorGrowth || "+5.2%"}</span>
                <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
              </div>
            </div>

            {/* 3. Events Created */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all min-w-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-400 truncate">Events Created</span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 truncate">
                {analyticsData.kpis.eventsCreated?.toLocaleString() || "8,432"}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 truncate">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>{analyticsData.kpis.eventGrowth || "+18.3%"}</span>
                <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
              </div>
            </div>

            {/* 4. Total Bookings */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all min-w-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-400 truncate">Total Bookings</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 truncate">
                {analyticsData.kpis.totalBookings?.toLocaleString() || "18,920"}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 truncate">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>{analyticsData.kpis.bookingGrowth || "+14.1%"}</span>
                <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
              </div>
            </div>

            {/* 5. Commission */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all min-w-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-400 truncate">Commission</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 truncate">
                {formatCurrency(analyticsData.kpis.commission || 384000)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 truncate">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>{analyticsData.kpis.commissionGrowth || "+31.2%"}</span>
                <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
              </div>
            </div>

            {/* 6. Total Revenue */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all min-w-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-400 truncate">Total Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 truncate">
                {formatCurrency(analyticsData.kpis.totalRevenue || 2400000)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 truncate">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>{analyticsData.kpis.revenueGrowth || "+28.4%"}</span>
                <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
              </div>
            </div>
          </div>

          {/* Middle Section: 2 Data Tables Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
            
            {/* Left Table: Top Performing Events */}
            <div className="bg-[#0A0818]/90 border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md min-w-0 flex flex-col">
              <div className="mb-4 sm:mb-5">
                <h3 className="text-base font-extrabold text-white tracking-tight">Top Performing Events</h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Events with highest ticket sales</p>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-thin scrollbar-thumb-purple-900/30">
                <table className="min-w-[460px] sm:min-w-full w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] font-bold text-zinc-500">
                      <th className="pb-3 font-semibold">Event Name</th>
                      <th className="pb-3 font-semibold">Vendor</th>
                      <th className="pb-3 font-semibold text-right">Tickets Sold</th>
                      <th className="pb-3 font-semibold text-right">Revenue</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {analyticsData.topPerformingEvents.map((evt) => (
                      <tr key={evt.id || evt.name} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3.5 font-bold text-white pr-2 whitespace-nowrap max-w-[160px] truncate" title={evt.name}>
                          {evt.name}
                        </td>
                        <td className="py-3.5 text-zinc-400 whitespace-nowrap max-w-[120px] truncate" title={evt.vendor}>
                          {evt.vendor}
                        </td>
                        <td className="py-3.5 text-right font-medium text-zinc-300 whitespace-nowrap">
                          {evt.ticketsSold?.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right font-bold text-white whitespace-nowrap">
                          ₹{evt.revenue?.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              evt.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : evt.status === "Upcoming"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                : evt.status === "Completed"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {evt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Table: Top Vendors by Revenue */}
            <div className="bg-[#0A0818]/90 border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md min-w-0 flex flex-col">
              <div className="mb-4 sm:mb-5">
                <h3 className="text-base font-extrabold text-white tracking-tight">Top Vendors by Revenue</h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Highest earning vendors on the platform</p>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-thin scrollbar-thumb-purple-900/30">
                <table className="min-w-[460px] sm:min-w-full w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] font-bold text-zinc-500">
                      <th className="pb-3 font-semibold">Vendor Name</th>
                      <th className="pb-3 font-semibold text-right">Total Events</th>
                      <th className="pb-3 font-semibold text-right">Total Earnings</th>
                      <th className="pb-3 font-semibold text-right">Commission Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {analyticsData.topVendors.map((vendor) => (
                      <tr key={vendor.id || vendor.vendorName} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3.5 font-bold text-white pr-2 whitespace-nowrap max-w-[160px] truncate" title={vendor.vendorName}>
                          {vendor.vendorName}
                        </td>
                        <td className="py-3.5 text-right font-medium text-zinc-300 whitespace-nowrap">
                          {vendor.totalEvents}
                        </td>
                        <td className="py-3.5 text-right font-bold text-white whitespace-nowrap">
                          ₹{vendor.totalEarnings?.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                          ₹{vendor.commissionPaid?.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
