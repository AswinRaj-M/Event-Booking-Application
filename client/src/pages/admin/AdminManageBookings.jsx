import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  ChevronDown,
  Calendar,
  Download,
  RotateCw,
  RotateCcw,
  Eye,
  X,
  Ticket,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Tag,
  Building2,
  Phone,
  Mail,
  IndianRupee,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sidebar
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAllBookingsAdminApi } from "../../services/admin.api";
import { toast } from "sonner";

const AdminManageBookings = () => {
  const adminState = useSelector((state) => state.admin);
  const adminUser = adminState?.admin;

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);

  // Selected Booking for Modal Details View
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Data State
  const [data, setData] = useState({
    kpis: {
      totalBookings: 12450,
      bookingsGrowth: "+12.5% this month",
      totalEvents: 847,
      eventsLabel: "Events",
      cancelledBookings: 432,
      cancelledGrowth: "+2.1% from last week",
      totalRevenue: 842000,
      revenueGrowth: "+18% year over year",
    },
    bookings: [
      {
        _id: "1",
        bookingId: "BK-7829",
        user: {
          name: "John Doe",
          email: "john.d@example.com",
          phone: "+91 98765 43210",
          profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "Neon Tech Summit 2026",
          organizer: "FutureSystems Inc.",
        },
        date: "Oct 24, 2026",
        ticketsCount: 2,
        ticketPrice: 2500,
        originalAmount: 5000,
        couponDiscount: 0,
        totalAmount: 5000,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        tierName: "VIP Pass",
        tickets: [
          { ticketId: "TK-9921", status: "valid" },
          { ticketId: "TK-9922", status: "valid" },
        ],
      },
      {
        _id: "2",
        bookingId: "BK-7828",
        user: {
          name: "Sarah Lee",
          email: "sarah.lee@design.co",
          phone: "+91 98765 43211",
          profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "UX Design Workshop",
          organizer: "Creative Minds",
        },
        date: "Oct 23, 2026",
        ticketsCount: 1,
        ticketPrice: 1500,
        originalAmount: 1500,
        couponDiscount: 0,
        totalAmount: 1500,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        tierName: "Standard",
        tickets: [{ ticketId: "TK-9915", status: "valid" }],
      },
      {
        _id: "3",
        bookingId: "BK-7827",
        user: {
          name: "Michael Johnson",
          email: "m.johnson@tech.io",
          phone: "+91 98765 43212",
          profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "AI & Machine Learning Expo",
          organizer: "DataScience Hub",
        },
        date: "Oct 22, 2026",
        ticketsCount: 3,
        ticketPrice: 3000,
        originalAmount: 9000,
        couponDiscount: 1000,
        totalAmount: 8000,
        paymentStatus: "pending",
        bookingStatus: "pending",
        tierName: "All-Access",
        tickets: [
          { ticketId: "TK-9901", status: "valid" },
          { ticketId: "TK-9902", status: "valid" },
          { ticketId: "TK-9903", status: "valid" },
        ],
      },
      {
        _id: "4",
        bookingId: "BK-7826",
        user: {
          name: "Emily Parker",
          email: "emily.p@startup.com",
          phone: "+91 98765 43213",
          profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "Startup Pitch Night",
          organizer: "Venture Capital Group",
        },
        date: "Oct 21, 2026",
        ticketsCount: 1,
        ticketPrice: 2000,
        originalAmount: 2000,
        couponDiscount: 0,
        totalAmount: 2000,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        tierName: "General",
        tickets: [{ ticketId: "TK-9880", status: "valid" }],
      },
      {
        _id: "5",
        bookingId: "BK-7825",
        user: {
          name: "David Wilson",
          email: "d.wilson@corp.net",
          phone: "+91 98765 43214",
          profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "Blockchain Conference 2026",
          organizer: "CryptoWorld",
        },
        date: "Oct 20, 2026",
        ticketsCount: 2,
        ticketPrice: 4000,
        originalAmount: 8000,
        couponDiscount: 0,
        totalAmount: 8000,
        paymentStatus: "failed",
        bookingStatus: "cancelled",
        tierName: "VIP",
        tickets: [
          { ticketId: "TK-9861", status: "cancelled" },
          { ticketId: "TK-9862", status: "cancelled" },
        ],
      },
      {
        _id: "6",
        bookingId: "BK-7824",
        user: {
          name: "Lisa Martinez",
          email: "lisa.m@agency.com",
          phone: "+91 98765 43215",
          profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "Digital Marketing Summit",
          organizer: "Marketing Pro",
        },
        date: "Oct 19, 2026",
        ticketsCount: 4,
        ticketPrice: 1200,
        originalAmount: 4800,
        couponDiscount: 400,
        totalAmount: 4400,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        tierName: "Standard",
        tickets: [
          { ticketId: "TK-9841", status: "valid" },
          { ticketId: "TK-9842", status: "valid" },
          { ticketId: "TK-9843", status: "valid" },
          { ticketId: "TK-9844", status: "valid" },
        ],
      },
      {
        _id: "7",
        bookingId: "BK-7823",
        user: {
          name: "Robert Brown",
          email: "r.brown@finance.io",
          phone: "+91 98765 43216",
          profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "FinTech Innovation Forum",
          organizer: "Global Finance",
        },
        date: "Oct 18, 2026",
        ticketsCount: 1,
        ticketPrice: 3500,
        originalAmount: 3500,
        couponDiscount: 0,
        totalAmount: 3500,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        tierName: "Executive",
        tickets: [{ ticketId: "TK-9830", status: "valid" }],
      },
      {
        _id: "8",
        bookingId: "BK-7822",
        user: {
          name: "Jennifer Taylor",
          email: "j.taylor@media.com",
          phone: "+91 98765 43217",
          profilePicture: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "Content Creator Meetup",
          organizer: "Social Media Hub",
        },
        date: "Oct 17, 2026",
        ticketsCount: 2,
        ticketPrice: 1800,
        originalAmount: 3600,
        couponDiscount: 0,
        totalAmount: 3600,
        paymentStatus: "pending",
        bookingStatus: "pending",
        tierName: "Creator Pass",
        tickets: [
          { ticketId: "TK-9810", status: "valid" },
          { ticketId: "TK-9811", status: "valid" },
        ],
      },
      {
        _id: "9",
        bookingId: "BK-7821",
        user: {
          name: "Chris Garcia",
          email: "c.garcia@dev.io",
          phone: "+91 98765 43218",
          profilePicture: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "Cloud Computing Workshop",
          organizer: "AWS Community",
        },
        date: "Oct 16, 2026",
        ticketsCount: 1,
        ticketPrice: 2200,
        originalAmount: 2200,
        couponDiscount: 200,
        totalAmount: 2000,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        tierName: "Standard",
        tickets: [{ ticketId: "TK-9801", status: "valid" }],
      },
      {
        _id: "10",
        bookingId: "BK-7820",
        user: {
          name: "Amanda Nelson",
          email: "a.nelson@health.org",
          phone: "+91 98765 43219",
          profilePicture: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
        },
        event: {
          title: "Healthcare Innovation Summit",
          organizer: "MedTech Solutions",
        },
        date: "Oct 15, 2026",
        ticketsCount: 3,
        ticketPrice: 3200,
        originalAmount: 9600,
        couponDiscount: 0,
        totalAmount: 9600,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        tierName: "All-Access",
        tickets: [
          { ticketId: "TK-9781", status: "valid" },
          { ticketId: "TK-9782", status: "valid" },
          { ticketId: "TK-9783", status: "valid" },
        ],
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 12450,
      totalPages: 10,
    },
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookingsAdminApi({
        page: currentPage,
        limit,
        search: searchTerm,
        status: statusFilter,
        paymentStatus: paymentFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.data?.success && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching admin bookings:", err);
      // Keep rich fallback demonstration data if backend is offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, paymentFilter, startDate, endDate]);

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchBookings();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Export Bookings PDF Report with jsPDF
  const handleExportPDF = async () => {
    try {
      toast.loading("Generating bookings report PDF...", { id: "booking-pdf" });
      
      // If there are more records than currently loaded in the page, fetch full list for export
      let exportBookings = data.bookings;
      if (data.pagination && data.pagination.total > data.bookings.length) {
        try {
          const exportRes = await getAllBookingsAdminApi({
            page: 1,
            limit: Math.min(200, data.pagination.total),
            search: searchTerm,
            status: statusFilter,
            paymentStatus: paymentFilter,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          });
          if (exportRes.data?.success && exportRes.data.data?.bookings) {
            exportBookings = exportRes.data.data.bookings;
          }
        } catch (e) {
          // Fallback to current page bookings if full fetch fails
          exportBookings = data.bookings;
        }
      }

      const doc = new jsPDF("landscape");

      // Report Header
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 30);
      doc.text("Festivo Platform - Booking Management Report", 14, 18);

      // Metadata Subtitle
      const dateRangeLabel = startDate && endDate
        ? `${startDate} to ${endDate}`
        : startDate
        ? `From ${startDate}`
        : endDate
        ? `Until ${endDate}`
        : "All Time";

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Generated on: ${new Date().toLocaleString("en-IN")} | Date Filter: ${dateRangeLabel} | Total Records: ${exportBookings.length} | Status: ${statusFilter.toUpperCase()} | Payment: ${paymentFilter.toUpperCase()}`,
        14,
        25
      );
      doc.setTextColor(0);

      // Section 1: Platform Summary KPI Table
      doc.setFontSize(12);
      doc.text("Platform Summary", 14, 34);

      const kpiRows = [
        [
          "Total Bookings",
          `${data.kpis.totalBookings?.toLocaleString() || "0"} (${data.kpis.bookingsGrowth})`,
          "Total Events",
          `${data.kpis.totalEvents?.toLocaleString() || "0"} (${data.kpis.eventsLabel || "Events"})`,
          "Cancelled Bookings",
          `${data.kpis.cancelledBookings?.toLocaleString() || "0"} (${data.kpis.cancelledGrowth})`,
          "Total Revenue",
          `INR ${(data.kpis.totalRevenue || 0).toLocaleString("en-IN")} (${data.kpis.revenueGrowth})`,
        ],
      ];

      autoTable(doc, {
        startY: 38,
        head: [["Metric", "Value", "Metric", "Value", "Metric", "Value", "Metric", "Value"]],
        body: kpiRows,
        theme: "striped",
        headStyles: { fillColor: [109, 40, 217] },
        styles: { fontSize: 8 },
      });

      // Section 2: Bookings Table
      const currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 60;
      doc.setFontSize(12);
      doc.text("Event Bookings Ledger", 14, currentY);

      const bookingRows = exportBookings.map((b) => [
        b.bookingId || "-",
        b.user?.name || "Customer",
        b.user?.email || "-",
        b.event?.title || "Event",
        b.event?.organizer || "Vendor",
        b.date || "-",
        b.ticketsCount?.toString() || "1",
        `INR ${Number(b.totalAmount || 0).toLocaleString("en-IN")}`,
        b.paymentStatus?.toUpperCase() || "PENDING",
        b.bookingStatus?.toUpperCase() || "PENDING",
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Booking ID", "Customer", "Email", "Event Title", "Organizer", "Date", "Tickets", "Amount", "Payment", "Status"]],
        body: bookingRows.length > 0 ? bookingRows : [["-", "No bookings found", "-", "-", "-", "-", "-", "-", "-", "-"]],
        theme: "striped",
        headStyles: { fillColor: [109, 40, 217] },
        styles: { fontSize: 8 },
      });

      doc.save(`festivo_bookings_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Bookings PDF report downloaded successfully!", { id: "booking-pdf" });
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to generate PDF report.", { id: "booking-pdf" });
    }
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Helper format currency
  const formatCurrency = (val) => {
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div className="flex h-screen bg-[#070512] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative z-10">
        
        {/* Top Header Row */}
        <header className="h-16 border-b border-white/5 bg-[#090717]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-zinc-300">
              <Sidebar className="w-4 h-4 text-purple-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Booking Management
            </h1>
          </div>

          {/* Admin User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{adminUser?.name || "Alex Morgan"}</div>
              <div className="text-[10px] text-zinc-400 font-medium">Super Admin</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1.5px] shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Admin"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div data-lenis-prevent className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0 space-y-6 scrollbar-thin scrollbar-thumb-purple-900/50">
          
          {/* Top 4 KPI Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Bookings */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-zinc-400 block mb-2">Total Bookings</span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                  {data.kpis.totalBookings?.toLocaleString() || "12,450"}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{data.kpis.bookingsGrowth || "+12.5% this month"}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.25)] shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Total Events */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-blue-500/30 transition-all flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-zinc-400 block mb-2">Total Events</span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                  {data.kpis.totalEvents?.toLocaleString() || "847"}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{data.kpis.eventsLabel || "Events"}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)] shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Cancelled */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-rose-500/30 transition-all flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-zinc-400 block mb-2">Cancelled</span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                  {data.kpis.cancelledBookings?.toLocaleString() || "432"}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <TrendingUp className="w-3.5 h-3.5 rotate-180" />
                  <span>{data.kpis.cancelledGrowth || "+2.1% from last week"}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)] shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Total Revenue */}
            <div className="bg-[#0B0918]/90 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-amber-500/30 transition-all flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-zinc-400 block mb-2">Total Revenue</span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                  {formatCurrency(data.kpis.totalRevenue || 842000)}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{data.kpis.revenueGrowth || "+18% year over year"}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filters Controls Row */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0A0818]/90 border border-white/5 p-3 rounded-2xl shadow-lg backdrop-blur-md">
            
            {/* Search Input Bar */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings.."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#120F26] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors font-medium"
              />
            </div>

            {/* Filters Group */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Dropdown */}
              <div className="relative flex-1 sm:flex-initial min-w-[120px]">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-[#120F26] border border-white/10 text-xs font-semibold text-zinc-300 pl-3.5 pr-8 py-2 rounded-xl focus:outline-none focus:border-purple-500/50 cursor-pointer transition-colors"
                >
                  <option value="all">Status: All</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Payment Dropdown */}
              <div className="relative flex-1 sm:flex-initial min-w-[130px]">
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-[#120F26] border border-white/10 text-xs font-semibold text-zinc-300 pl-3.5 pr-8 py-2 rounded-xl focus:outline-none focus:border-purple-500/50 cursor-pointer transition-colors"
                >
                  <option value="all">Payment: All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Date Filter Range */}
              <div className="flex items-center gap-1.5 bg-[#120F26] border border-white/10 p-1 rounded-xl">
                <div className="flex items-center gap-1 px-1.5 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hidden xl:inline">Date:</span>
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  title="Start Date"
                  className="bg-[#0D0B1F] border border-white/5 text-xs font-semibold text-zinc-200 px-2 py-1 rounded-lg focus:outline-none focus:border-purple-500/50 cursor-pointer"
                />
                <span className="text-zinc-600 text-xs font-bold">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  title="End Date"
                  className="bg-[#0D0B1F] border border-white/5 text-xs font-semibold text-zinc-200 px-2 py-1 rounded-lg focus:outline-none focus:border-purple-500/50 cursor-pointer"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setCurrentPage(1);
                    }}
                    title="Reset Date Filter"
                    className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Export PDF Button */}
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Recent Bookings Data Table Card */}
          <div className="bg-[#0A0818]/90 border border-white/5 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md min-w-0 flex flex-col">
            
            {/* Table Header Row */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">Recent Bookings</h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">Manage and track all event reservations.</p>
              </div>

              <button
                onClick={() => fetchBookings()}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
                <span>Refresh List</span>
              </button>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0 scrollbar-thin scrollbar-thumb-purple-900/30">
              <table className="min-w-[850px] w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="pb-3.5 font-semibold">ID</th>
                    <th className="pb-3.5 font-semibold">User</th>
                    <th className="pb-3.5 font-semibold">Event & Organizer</th>
                    <th className="pb-3.5 font-semibold">Date</th>
                    <th className="pb-3.5 font-semibold text-center">Tickets</th>
                    <th className="pb-3.5 font-semibold text-center">Payment</th>
                    <th className="pb-3.5 font-semibold text-center">Status</th>
                    <th className="pb-3.5 font-semibold text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {data.bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-zinc-500 font-medium">
                        No event bookings found matching your search and filters.
                      </td>
                    </tr>
                  ) : (
                    data.bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-white/[0.02] transition-colors group">
                        
                        {/* ID */}
                        <td className="py-4 font-mono font-bold text-zinc-300 whitespace-nowrap">
                          #{b.bookingId}
                        </td>

                        {/* User Profile */}
                        <td className="py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 overflow-hidden shrink-0">
                              {b.user?.profilePicture ? (
                                <img
                                  src={b.user.profilePicture}
                                  alt={b.user.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-purple-300 font-bold text-xs">
                                  {b.user?.name?.[0] || "U"}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs">{b.user?.name || "Customer"}</div>
                              <div className="text-[11px] text-zinc-400">{b.user?.email || "customer@example.com"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Event & Organizer */}
                        <td className="py-4 whitespace-nowrap max-w-[220px]">
                          <div className="font-bold text-purple-400 text-xs truncate hover:text-purple-300 transition-colors cursor-pointer" onClick={() => openDetailsModal(b)}>
                            {b.event?.title || "Event Title"}
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate">
                            by {b.event?.organizer || "Organizer"}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 text-zinc-400 whitespace-nowrap text-xs">
                          {b.date}
                        </td>

                        {/* Tickets */}
                        <td className="py-4 text-center font-black text-white text-xs whitespace-nowrap">
                          {b.ticketsCount}
                        </td>

                        {/* Payment Status */}
                        <td className="py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                              b.paymentStatus === "paid" || b.paymentStatus === "completed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : b.paymentStatus === "pending"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : b.paymentStatus === "refunded"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {b.paymentStatus === "paid" ? "Paid" : b.paymentStatus === "pending" ? "Pending" : b.paymentStatus === "refunded" ? "Refunded" : "Failed"}
                          </span>
                        </td>

                        {/* Booking Status */}
                        <td className="py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                              b.bookingStatus === "confirmed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : b.bookingStatus === "pending"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : b.bookingStatus === "completed"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {b.bookingStatus === "confirmed" ? "Confirmed" : b.bookingStatus === "pending" ? "Pending" : b.bookingStatus === "completed" ? "Completed" : "Cancelled"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-right pr-2 whitespace-nowrap">
                          <button
                            onClick={() => openDetailsModal(b)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-600/20 text-zinc-400 hover:text-purple-300 border border-white/10 transition-colors cursor-pointer"
                            title="View Booking Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: Math.min(5, data.pagination?.totalPages || 1) }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      currentPage === num
                        ? "bg-[#7C3AED] text-white shadow-md"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                {data.pagination?.totalPages > 5 && (
                  <>
                    <span className="text-zinc-600 text-xs px-1">...</span>
                    <button
                      onClick={() => setCurrentPage(data.pagination.totalPages)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        currentPage === data.pagination.totalPages
                          ? "bg-[#7C3AED] text-white shadow-md"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {data.pagination.totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(data.pagination?.totalPages || 1, p + 1))}
                  disabled={currentPage >= (data.pagination?.totalPages || 1)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Showing stats text */}
              <div className="text-xs text-zinc-400 font-medium">
                Showing <span className="font-bold text-white">{(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, data.pagination?.total || data.bookings.length)}</span> of{" "}
                <span className="font-bold text-white">{(data.pagination?.total || data.bookings.length).toLocaleString()}</span> bookings
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#120F26] border border-purple-500/30 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900/50">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-2xl text-purple-400">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Booking #{selectedBooking.bookingId}</h3>
                  <p className="text-xs text-zinc-400 font-medium">Created on {selectedBooking.date}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Highlights */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0B0918] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Payment Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  selectedBooking.paymentStatus === "paid"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  {selectedBooking.paymentStatus}
                </span>
              </div>
              <div className="bg-[#0B0918] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Booking Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  selectedBooking.bookingStatus === "confirmed"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}>
                  {selectedBooking.bookingStatus}
                </span>
              </div>
            </div>

            {/* User & Customer Details */}
            <div className="bg-[#0B0918] p-4 rounded-2xl border border-white/5 space-y-2.5">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" /> Customer Information
              </h4>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Name:</span>
                <span className="font-bold text-white">{selectedBooking.user?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Email:</span>
                <span className="font-bold text-white">{selectedBooking.user?.email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Phone:</span>
                <span className="font-bold text-white">{selectedBooking.user?.phone || "N/A"}</span>
              </div>
            </div>

            {/* Event & Organizer Details */}
            <div className="bg-[#0B0918] p-4 rounded-2xl border border-white/5 space-y-2.5">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> Event Details
              </h4>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Event:</span>
                <span className="font-bold text-purple-400">{selectedBooking.event?.title}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Organizer:</span>
                <span className="font-bold text-white">{selectedBooking.event?.organizer}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Ticket Tier:</span>
                <span className="font-bold text-white">{selectedBooking.tierName || "Standard"}</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-[#0B0918] p-4 rounded-2xl border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Payment Breakdown
              </h4>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Tickets ({selectedBooking.ticketsCount} × ₹{selectedBooking.ticketPrice}):</span>
                <span className="font-bold text-white">₹{selectedBooking.originalAmount?.toLocaleString()}</span>
              </div>
              {selectedBooking.couponDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Coupon Discount ({selectedBooking.couponCode || "COUPON"}):</span>
                  <span>-₹{selectedBooking.couponDiscount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                <span>Total Amount Paid:</span>
                <span className="text-purple-400">₹{selectedBooking.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Tickets List */}
            {selectedBooking.tickets && selectedBooking.tickets.length > 0 && (
              <div className="bg-[#0B0918] p-4 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-purple-400" /> Issued Tickets ({selectedBooking.tickets.length})
                </h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900/30">
                  {selectedBooking.tickets.map((t, idx) => (
                    <div key={t.ticketId || idx} className="flex items-center justify-between text-xs py-1.5 px-3 bg-white/[0.02] rounded-lg">
                      <span className="font-mono text-zinc-300 font-bold">{t.ticketId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "valid" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminManageBookings;
