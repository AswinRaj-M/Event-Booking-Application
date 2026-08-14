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
  RefreshCw,
  Ticket,
  Percent,
  CheckCircle2
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminAnalyticsApi } from "../../services/admin.api";
import { toast } from "sonner";

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

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
    revenueOverTime: [
      { month: "Jan", revenue: 180000 },
      { month: "Feb", revenue: 205000 },
      { month: "Mar", revenue: 198000 },
      { month: "Apr", revenue: 230000 },
      { month: "May", revenue: 250000 },
      { month: "Jun", revenue: 290000 },
    ],
    bookingsGrowth: [
      { month: "Jan", bookings: 3200 },
      { month: "Feb", bookings: 3900 },
      { month: "Mar", bookings: 4100 },
      { month: "Apr", bookings: 4500 },
      { month: "May", bookings: 5200 },
      { month: "Jun", bookings: 6200 },
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

  const handleExportCSV = () => {
    try {
      toast.loading("Generating analytics CSV report...", { id: "analytics-export" });

      let csv = "Festivo Admin Platform Analytics Report\n\n";
      csv += "=== KEY PERFORMANCE INDICATORS ===\n";
      csv += `Total Users,${analyticsData.kpis.totalUsers},${analyticsData.kpis.userGrowth}\n`;
      csv += `Active Vendors,${analyticsData.kpis.activeVendors},${analyticsData.kpis.vendorGrowth}\n`;
      csv += `Events Created,${analyticsData.kpis.eventsCreated},${analyticsData.kpis.eventGrowth}\n`;
      csv += `Total Bookings,${analyticsData.kpis.totalBookings},${analyticsData.kpis.bookingGrowth}\n`;
      csv += `Commission,$${analyticsData.kpis.commission.toLocaleString()},${analyticsData.kpis.commissionGrowth}\n`;
      csv += `Total Revenue,$${analyticsData.kpis.totalRevenue.toLocaleString()},${analyticsData.kpis.revenueGrowth}\n\n`;

      csv += "=== TOP PERFORMING EVENTS ===\n";
      csv += "Event Name,Vendor,Tickets Sold,Revenue,Status\n";
      analyticsData.topPerformingEvents.forEach((e) => {
        csv += `"${e.name}","${e.vendor}",${e.ticketsSold},$${e.revenue.toLocaleString()},${e.status}\n`;
      });

      csv += "\n=== TOP VENDORS BY REVENUE ===\n";
      csv += "Vendor Name,Total Events,Total Earnings,Commission Paid\n";
      analyticsData.topVendors.forEach((v) => {
        csv += `"${v.vendorName}",${v.totalEvents},$${v.totalEarnings.toLocaleString()},$${v.commissionPaid.toLocaleString()}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `festivo_analytics_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Analytics report downloaded successfully!", { id: "analytics-export" });
    } catch (e) {
      toast.error("Failed to export analytics report.", { id: "analytics-export" });
    }
  };

  // Helper for format currency / numbers
  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  // Calculations for Line Chart SVG
  const revMax = 300000;
  const revPoints = analyticsData.revenueOverTime.map((d, i) => {
    const x = 50 + (i * (460 / 5));
    const y = 240 - ((d.revenue / revMax) * 200);
    return { ...d, x, y };
  });

  const generateCurvedPath = (points) => {
    if (points.length < 2) return "";
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }
    return path;
  };

  // Calculations for Bar Chart SVG
  const bookMax = 8000;
  const barWidth = 44;

  return (
    <div className="flex h-screen bg-[#070514] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Scrollable Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto min-h-screen relative z-10 flex flex-col scrollbar-thin scrollbar-thumb-purple-900/50">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo-900/10 rounded-full blur-[180px] pointer-events-none -z-10" />

        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Header Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#120F26] border border-white/10 rounded-xl text-zinc-300 shadow-md">
              <Layout className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">Analytics Dashboard</h1>
              <p className="text-xs text-zinc-400 font-medium">Platform performance insights and statistics</p>
            </div>
          </div>

          {/* Action Controls (Filters & Export) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe Toggle Buttons (Today, Week, Month) */}
            <div className="bg-[#0D0B1F] border border-white/10 p-1 rounded-xl flex items-center gap-1 shadow-inner">
              {["today", "week", "month"].map((tf) => {
                const isActive = timeframe === tf;
                return (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
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
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-[#0D0B1F] border border-white/10 text-xs font-semibold text-zinc-200 pl-4 pr-9 py-2 rounded-xl focus:outline-none focus:border-purple-500/50 cursor-pointer shadow-md transition-colors"
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

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-extrabold rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-black" />
              Export
            </button>
          </div>
        </div>

        {/* 6 Top KPI Summary Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          
          {/* 1. Total Users */}
          <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400">Total Users</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-2">
              {analyticsData.kpis.totalUsers?.toLocaleString() || "24,592"}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{analyticsData.kpis.userGrowth || "+12.5%"}</span>
              <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
            </div>
          </div>

          {/* 2. Active Vendors */}
          <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400">Active Vendors</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-2">
              {analyticsData.kpis.activeVendors?.toLocaleString() || "1,204"}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{analyticsData.kpis.vendorGrowth || "+5.2%"}</span>
              <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
            </div>
          </div>

          {/* 3. Events Created */}
          <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400">Events Created</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-2">
              {analyticsData.kpis.eventsCreated?.toLocaleString() || "8,432"}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{analyticsData.kpis.eventGrowth || "+18.3%"}</span>
              <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
            </div>
          </div>

          {/* 4. Total Bookings */}
          <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400">Total Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-2">
              {analyticsData.kpis.totalBookings?.toLocaleString() || "18,920"}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{analyticsData.kpis.bookingGrowth || "+14.1%"}</span>
              <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
            </div>
          </div>

          {/* 5. Commission */}
          <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400">Commission</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-2">
              {formatCurrency(analyticsData.kpis.commission || 384000)}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{analyticsData.kpis.commissionGrowth || "+31.2%"}</span>
              <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
            </div>
          </div>

          {/* 6. Total Revenue */}
          <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400">Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-2">
              {formatCurrency(analyticsData.kpis.totalRevenue || 2400000)}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{analyticsData.kpis.revenueGrowth || "+28.4%"}</span>
              <span className="text-zinc-500 font-medium text-[11px] ml-0.5">vs last mo</span>
            </div>
          </div>
        </div>

        {/* Middle Section: 2 Data Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Left Table: Top Performing Events */}
          <div className="bg-[#0A0818]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <div className="mb-5">
              <h3 className="text-base font-extrabold text-white tracking-tight">Top Performing Events</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Events with highest ticket sales</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
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
                      <td className="py-3.5 font-bold text-white pr-2 whitespace-nowrap">{evt.name}</td>
                      <td className="py-3.5 text-zinc-400 whitespace-nowrap">{evt.vendor}</td>
                      <td className="py-3.5 text-right font-medium text-zinc-300">{evt.ticketsSold.toLocaleString()}</td>
                      <td className="py-3.5 text-right font-bold text-white">${evt.revenue.toLocaleString()}</td>
                      <td className="py-3.5 text-right">
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
          <div className="bg-[#0A0818]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <div className="mb-5">
              <h3 className="text-base font-extrabold text-white tracking-tight">Top Vendors by Revenue</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Highest earning vendors on the platform</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
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
                      <td className="py-3.5 font-bold text-white pr-2 whitespace-nowrap">{vendor.vendorName}</td>
                      <td className="py-3.5 text-right font-medium text-zinc-300">{vendor.totalEvents}</td>
                      <td className="py-3.5 text-right font-bold text-white">${vendor.totalEarnings.toLocaleString()}</td>
                      <td className="py-3.5 text-right font-bold text-emerald-400">${vendor.commissionPaid.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Section: 2 Interactive Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Chart: Revenue Over Time */}
          <div className="bg-[#0A0818]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col">
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-white tracking-tight">Revenue Over Time</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Monthly revenue trend for the last 6 months</p>
            </div>

            {/* SVG Curved Chart */}
            <div className="relative w-full h-[260px] flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 540 260">
                <defs>
                  {/* Subtle area gradient under curve */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Line Gradient */}
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8E8B9E" />
                    <stop offset="50%" stopColor="#D4D2E6" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines & Labels */}
                {[
                  { val: 300000, y: 40 },
                  { val: 225000, y: 90 },
                  { val: 150000, y: 140 },
                  { val: 75000, y: 190 },
                  { val: 0, y: 240 },
                ].map((g) => (
                  <g key={g.val}>
                    <text x="0" y={g.y + 4} fill="#8E8B9E" fontSize="11" fontWeight="500">
                      {g.val}
                    </text>
                    <line
                      x1="50"
                      y1={g.y}
                      x2="520"
                      y2={g.y}
                      stroke="#222033"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  </g>
                ))}

                {/* Vertical Grid lines */}
                {revPoints.map((p) => (
                  <line
                    key={p.month}
                    x1={p.x}
                    y1="40"
                    x2={p.x}
                    y2="240"
                    stroke="#222033"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Area Fill */}
                <path
                  d={`${generateCurvedPath(revPoints)} L ${revPoints[revPoints.length - 1].x},240 L ${revPoints[0].x},240 Z`}
                  fill="url(#areaGradient)"
                />

                {/* Main Curved Line */}
                <path
                  d={generateCurvedPath(revPoints)}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data Points / Circles */}
                {revPoints.map((p, idx) => (
                  <g
                    key={p.month}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#131024"
                      strokeWidth="2"
                      className="transition-transform duration-200 hover:scale-150"
                    />
                  </g>
                ))}
              </svg>

              {/* Tooltip on Hover */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none bg-[#1A1633] border border-purple-500/40 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl z-30 transition-all"
                  style={{
                    left: `${(hoveredPoint.x / 540) * 100}%`,
                    top: `${(hoveredPoint.y / 260) * 100 - 15}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <span className="text-zinc-400 block text-[10px]">{hoveredPoint.month} Revenue</span>
                  ${hoveredPoint.revenue.toLocaleString()}
                </div>
              )}
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between pl-12 pr-4 mt-2 text-xs font-bold text-zinc-400">
              {analyticsData.revenueOverTime.map((d) => (
                <span key={d.month}>{d.month}</span>
              ))}
            </div>
          </div>

          {/* Right Chart: Bookings Growth */}
          <div className="bg-[#0A0818]/90 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col">
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-white tracking-tight">Bookings Growth</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Monthly bookings for the last 6 months</p>
            </div>

            {/* SVG / Bar Chart */}
            <div className="relative w-full h-[260px] flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 540 260">
                <defs>
                  {/* Bar Gradient (sleek glassmorphic silver/slate) */}
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#BCBAC9" />
                    <stop offset="100%" stopColor="#555268" />
                  </linearGradient>
                  {/* Hover Bar Gradient */}
                  <linearGradient id="barHoverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines & Labels */}
                {[
                  { val: 8000, y: 40 },
                  { val: 6000, y: 90 },
                  { val: 4000, y: 140 },
                  { val: 2000, y: 190 },
                  { val: 0, y: 240 },
                ].map((g) => (
                  <g key={g.val}>
                    <text x="0" y={g.y + 4} fill="#8E8B9E" fontSize="11" fontWeight="500">
                      {g.val}
                    </text>
                    <line
                      x1="45"
                      y1={g.y}
                      x2="520"
                      y2={g.y}
                      stroke="#222033"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  </g>
                ))}

                {/* Vertical Grid lines */}
                {analyticsData.bookingsGrowth.map((b, i) => {
                  const x = 50 + (i * (460 / 5));
                  return (
                    <line
                      key={b.month}
                      x1={x}
                      y1="40"
                      x2={x}
                      y2="240"
                      stroke="#222033"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {/* Vertical Rounded Bars */}
                {analyticsData.bookingsGrowth.map((b, i) => {
                  const xCenter = 50 + (i * (460 / 5));
                  const barH = (b.bookings / bookMax) * 200;
                  const barY = 240 - barH;
                  const isHovered = hoveredBar?.month === b.month;

                  return (
                    <g
                      key={b.month}
                      onMouseEnter={() => setHoveredBar({ ...b, x: xCenter, y: barY })}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={xCenter - barWidth / 2}
                        y={barY}
                        width={barWidth}
                        height={barH}
                        rx="6"
                        fill={isHovered ? "url(#barHoverGrad)" : "url(#barGrad)"}
                        className="transition-all duration-300 hover:opacity-90"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip on Hover Bar */}
              {hoveredBar && (
                <div
                  className="absolute pointer-events-none bg-[#1A1633] border border-purple-500/40 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl z-30 transition-all"
                  style={{
                    left: `${(hoveredBar.x / 540) * 100}%`,
                    top: `${(hoveredBar.y / 260) * 100 - 15}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <span className="text-zinc-400 block text-[10px]">{hoveredBar.month} Bookings</span>
                  {hoveredBar.bookings.toLocaleString()} tickets
                </div>
              )}
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between pl-12 pr-4 mt-2 text-xs font-bold text-zinc-400">
              {analyticsData.bookingsGrowth.map((d) => (
                <span key={d.month}>{d.month}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
