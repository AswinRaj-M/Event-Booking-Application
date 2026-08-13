import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from "../../components/admin/AdminSidebar";
import { ADMIN_ROUTES } from '../../constants/Routes';
import {
  Sidebar,
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  RotateCcw,
  Edit3,
  Trash2,
  X,
  Tag,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllCouponsApi,
  createCouponApi,
  updateCouponApi,
  toggleCouponStatusApi,
  deleteCouponApi
} from "../../services/admin.api";

function AdminCouponManagement() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [scopeFilter, setScopeFilter] = useState("All Types");
  const [eventFilter, setEventFilter] = useState("All Events");
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    scope: "All Events",
    usageLimit: "100",
    startDate: "",
    endDate: "",
    description: "",
    minOrder: "1000",
    maxDiscount: "500",
    minTickets: "1",
    target: "All Users"
  });

  const deduplicateCoupons = (list) => {
    if (!Array.isArray(list)) return [];
    const seenCodes = new Set();
    const seenIds = new Set();

    return list.filter((coupon) => {
      if (!coupon) return false;
      const normalizedCode = coupon.code
        ? String(coupon.code).trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
        : '';
      const normalizedId = String(coupon.id || coupon._id || '').trim();

      if (normalizedId && seenIds.has(normalizedId)) {
        return false;
      }
      if (normalizedCode && seenCodes.has(normalizedCode)) {
        return false;
      }

      if (normalizedId) seenIds.add(normalizedId);
      if (normalizedCode) seenCodes.add(normalizedCode);
      return true;
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const mapServerCouponToUi = (coupon) => {
    const isPercentage = coupon.discountType === "percentage";
    const discountStr = isPercentage ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`;
    
    let status = coupon.isActive ? "Active" : "Expired";
    const now = new Date();
    const end = coupon.endDate ? new Date(coupon.endDate) : null;
    const start = coupon.startDate ? new Date(coupon.startDate) : null;
    
    if (end && end < now) {
      status = "Expired";
    } else if (start && start > now) {
      status = "Scheduled";
    } else if (coupon.isActive) {
      status = "Active";
    }

    return {
      id: coupon._id || coupon.id,
      code: coupon.code,
      discount: discountStr,
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue,
      scope: coupon.applicableEvents ? "Event Specific" : "All Events",
      usageCount: coupon.usedCount || 0,
      usageLimit: coupon.usagelimit || coupon.usageLimit || 100,
      startDate: formatDate(coupon.startDate),
      endDate: formatDate(coupon.endDate),
      status: status,
      createdBy: "Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      description: coupon.description || `Special ${discountStr} promotional discount.`,
      minOrder: coupon.minPurchaseAmount ? `₹${coupon.minPurchaseAmount.toLocaleString()}` : "₹0",
      minTickets: isPercentage ? (coupon.minTickets ? `${coupon.minTickets} ticket${coupon.minTickets > 1 ? 's' : ''}` : "1 ticket") : "N/A",
      maxDiscount: isPercentage ? (coupon.maxDiscountAmount ? `₹${coupon.maxDiscountAmount.toLocaleString()}` : "No Limit") : "N/A",
      perUser: `${coupon.perUserLimit || 1} time`,
      totalCap: `${coupon.usagelimit || coupon.usageLimit || 100} uses`,
      target: ["All Users"],
      raw: coupon
    };
  };

  const fetchCoupons = async (currentPage = page, searchVal = searchQuery, statusVal = statusFilter, scopeVal = scopeFilter) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit,
        search: searchVal || undefined,
        statusFilter: statusVal !== "All Status" ? statusVal : undefined,
        scopeFilter: scopeVal !== "All Types" ? scopeVal : undefined
      };

      const res = await getAllCouponsApi(params);
      if (res.data && res.data.success && Array.isArray(res.data.coupons)) {
        const mapped = res.data.coupons.map(mapServerCouponToUi);
        const unique = deduplicateCoupons(mapped);
        setCoupons(unique);

        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalCoupons(res.data.pagination.totalCoupons || 0);
        }

        if (unique.length > 0) {
          setExpandedRowId(unique[0].id);
        }
      } else {
        setCoupons([]);
        setTotalPages(1);
        setTotalCoupons(0);
      }
    } catch (error) {
      console.error("Failed to fetch coupons from server:", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(page, searchQuery, statusFilter, scopeFilter);
  }, [page, searchQuery, statusFilter, scopeFilter]);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setScopeFilter("All Types");
    setEventFilter("All Events");
    setPage(1);
    toast.info("Filters reset to default");
  };

  const handleToggleStatus = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await toggleCouponStatusApi(id);
      if (res.data && res.data.success) {
        toast.success(res.data.message || "Coupon status updated!");
        fetchCoupons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteCoupon = (id, code) => {
    toast(`Are you sure you want to delete coupon "${code}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteCouponApi(id);
            toast.success(`Coupon ${code} deleted successfully`);
            fetchCoupons();
          } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete coupon");
          }
        }
      },
      cancel: {
        label: "Cancel"
      }
    });
  };

  const handleOpenCreateModal = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      scope: "All Events",
      usageLimit: "100",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: "",
      minOrder: "1000",
      maxDiscount: "500",
      target: "All Users"
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (coupon, e) => {
    e.stopPropagation();
    setEditingCoupon(coupon);
    const raw = coupon.raw || {};
    setFormData({
      code: coupon.code || raw.code || "",
      discountType: coupon.discountType || raw.discountType || "percentage",
      discountValue: coupon.discountValue !== undefined ? coupon.discountValue : (raw.discountValue || ""),
      scope: coupon.scope || "All Events",
      usageLimit: String(raw.usagelimit || raw.usageLimit || coupon.usageLimit || "100"),
      startDate: raw.startDate ? new Date(raw.startDate).toISOString().split('T')[0] : "",
      endDate: raw.endDate ? new Date(raw.endDate).toISOString().split('T')[0] : "",
      description: coupon.description || raw.description || "",
      minOrder: raw.minPurchaseAmount !== undefined ? String(raw.minPurchaseAmount) : String(coupon.minOrder).replace(/[^0-9]/g, ''),
      maxDiscount: raw.maxDiscountAmount !== undefined ? String(raw.maxDiscountAmount) : String(coupon.maxDiscount).replace(/[^0-9]/g, ''),
      minTickets: raw.minTickets !== undefined ? String(raw.minTickets) : "1",
      target: Array.isArray(coupon.target) ? coupon.target.join(", ") : "All Users"
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.endDate) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minPurchaseAmount: Number(formData.minOrder) || 0,
      maxDiscountAmount: Number(formData.maxDiscount) || 0,
      startDate: formData.startDate || new Date(),
      endDate: formData.endDate,
      usagelimit: Number(formData.usageLimit) || 100,
      perUserLimit: 1,
      isActive: true,
      description: formData.description
    };

    try {
      const res = await createCouponApi(payload);
      if (res.data && res.data.success) {
        toast.success(`Coupon "${payload.code}" created successfully!`);
        setIsCreateModalOpen(false);
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error creating coupon via API:", error);
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCoupon) return;

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Coupon code is required");
      return;
    }

    const discountVal = Number(formData.discountValue);
    if (!formData.discountValue || isNaN(discountVal) || discountVal <= 0) {
      toast.error("Please enter a valid discount value greater than 0");
      return;
    }

    if (formData.discountType === "fixed") {
      const minOrderVal = Number(formData.minOrder);
      if (!formData.minOrder || isNaN(minOrderVal) || minOrderVal <= 0) {
        toast.error("Minimum order value is required and must be greater than 0 for fixed amount coupons");
        return;
      }

      if (discountVal >= minOrderVal) {
        toast.error(`Discount Value (₹${discountVal}) must be strictly less than Minimum Order Value (₹${minOrderVal})`);
        return;
      }
    } else if (formData.discountType === "percentage") {
      if (discountVal > 100) {
        toast.error("Percentage discount cannot exceed 100%");
        return;
      }
      if (formData.minOrder && Number(formData.minOrder) < 0) {
        toast.error("Minimum order value cannot be negative");
        return;
      }
      if (formData.maxDiscount && Number(formData.maxDiscount) < 0) {
        toast.error("Maximum discount amount cannot be negative");
        return;
      }
      if (formData.minTickets && (Number(formData.minTickets) < 1 || !Number.isInteger(Number(formData.minTickets)))) {
        toast.error("Minimum tickets required must be an integer of at least 1");
        return;
      }
    }

    const payload = {
      code: cleanCode,
      discountType: formData.discountType,
      discountValue: discountVal,
      minPurchaseAmount: Number(formData.minOrder) || 0,
      minTickets: formData.discountType === "fixed" ? 1 : (Number(formData.minTickets) || 1),
      usagelimit: Number(formData.usageLimit) || 100,
      description: formData.description?.trim() || ""
    };

    if (formData.discountType === "percentage" && formData.maxDiscount && Number(formData.maxDiscount) > 0) {
      payload.maxDiscountAmount = Number(formData.maxDiscount);
    }
    if (formData.startDate) payload.startDate = formData.startDate;
    if (formData.endDate) payload.endDate = formData.endDate;

    try {
      const res = await updateCouponApi(editingCoupon.id, payload);
      if (res.data && res.data.success) {
        toast.success(`Coupon "${payload.code}" updated successfully!`);
        setIsEditModalOpen(false);
        fetchCoupons();
      }
    } catch (error) {
      console.error("Failed to update coupon:", error);
      toast.error(error.response?.data?.message || "Failed to update coupon");
    }
  };

  // Paginated coupons from backend
  const filteredCoupons = deduplicateCoupons(coupons);

  // Metrics calculation
  const totalCouponsCount = totalCoupons;
  const activeCouponsCount = coupons.filter(c => c.status === "Active").length;
  const expiredCouponsCount = coupons.filter(c => c.status === "Expired").length;

  return (
    <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-800/80 bg-[#0B0914] shrink-0">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors">
              <Sidebar className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Coupons</h1>
              <p className="text-xs text-gray-400">Manage all promotional coupons</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input Box */}
            <div className="relative w-64 md:w-80">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              </div>
              <input
                type="text"
                placeholder="Search coupon code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151221] border border-gray-800/90 text-xs rounded-xl pl-8 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            {/* Refresh button */}
            <button
              onClick={fetchCoupons}
              className="p-2.5 bg-[#151221] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Coupons"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>

            {/* Create Coupon Button */}
            <button
              onClick={() => navigate(ADMIN_ROUTES.CREATE_COUPON)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-purple-900/30 cursor-pointer transition-all active:scale-95"
            >
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
              Create Coupon
            </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-hide">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
            
            {/* Card 1: Total Coupons */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-400">Total Coupons</span>
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.9)]"></div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{totalCouponsCount.toLocaleString()}</h2>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="text-[10px]">▲</span> +12%
                </span>
                <span className="text-gray-500">from last month</span>
              </div>
            </div>

            {/* Card 2: Active Coupons */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-400">Active Coupons</span>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"></div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{activeCouponsCount.toLocaleString()}</h2>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="text-[10px]">▲</span> +5%
                </span>
                <span className="text-gray-500">active usage rate</span>
              </div>
            </div>

            {/* Card 3: Expired Coupons */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-red-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-400">Expired Coupons</span>
                <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"></div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{expiredCouponsCount.toLocaleString()}</h2>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs">
                <span className="text-gray-500">Requires review</span>
              </div>
            </div>

          </div>

          {/* Filter Bar Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-1">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filters Title */}
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mr-1">
                <Filter className="w-4 h-4 text-purple-400" />
                <span>Filters</span>
              </div>

              {/* Status Select Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-[#151221] border border-gray-800 text-xs rounded-xl pl-4 pr-9 py-2 text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer transition-all"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Expired">Expired</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Scope/Types Select Dropdown */}
              <div className="relative">
                <select
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                  className="appearance-none bg-[#151221] border border-gray-800 text-xs rounded-xl pl-4 pr-9 py-2 text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer transition-all"
                >
                  <option value="All Types">All Types</option>
                  <option value="All Events">All Events</option>
                  <option value="Event Specific">Event Specific</option>
                  <option value="Vendor Specific">Vendor Specific</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Events Select Dropdown */}
              <div className="relative">
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="appearance-none bg-[#151221] border border-gray-800 text-xs rounded-xl pl-4 pr-9 py-2 text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer transition-all"
                >
                  <option value="All Events">All Events</option>
                  <option value="Music Festivals">Music Festivals</option>
                  <option value="Tech Conferences">Tech Conferences</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Date Range Button */}
              <button className="flex items-center gap-2 bg-[#151221] border border-gray-800 text-xs text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-800/40 transition-colors">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Date Range</span>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Main Coupons Table Container */}
          <div className="bg-[#12101A] border border-gray-800/90 rounded-2xl overflow-hidden shadow-2xl min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Fetching coupon data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800/80 bg-[#0E0C16] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-4 w-10"></th>
                      <th className="py-4 px-4">Coupon Code</th>
                      <th className="py-4 px-4">Discount</th>
                      <th className="py-4 px-4">Scope</th>
                      <th className="py-4 px-6">Usage</th>
                      <th className="py-4 px-4">Validity</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Created By</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50 text-xs">
                    {filteredCoupons.map((coupon) => {
                      const isExpanded = expandedRowId === coupon.id;
                      const usagePercent = Math.round((coupon.usageCount / coupon.usageLimit) * 100);

                      // Badge color variants
                      let codeBadgeStyle = "bg-purple-950/60 text-purple-300 border-purple-800/50";
                      let scopeBadgeStyle = "bg-gray-800/60 text-gray-300 border-gray-700";
                      let progressBarColor = "bg-purple-500";

                      if (coupon.code === "MUSICFEST50") {
                        codeBadgeStyle = "bg-pink-950/70 text-pink-300 border-pink-800/50";
                        scopeBadgeStyle = "bg-blue-950/70 text-blue-300 border-blue-800/50";
                        progressBarColor = "bg-pink-500";
                      } else if (coupon.code === "WELCOME10") {
                        codeBadgeStyle = "bg-gray-800/80 text-gray-300 border-gray-700";
                        progressBarColor = "bg-gray-500";
                      } else if (coupon.code === "TECHCONF50") {
                        codeBadgeStyle = "bg-purple-950/70 text-purple-300 border-purple-800/50";
                        scopeBadgeStyle = "bg-purple-950/70 text-purple-300 border-purple-800/50";
                        progressBarColor = "bg-purple-500";
                      }

                      // Status style
                      let statusStyle = "bg-emerald-950/80 text-emerald-400 border-emerald-800/50";
                      if (coupon.status === "Scheduled") {
                        statusStyle = "bg-amber-950/80 text-amber-400 border-amber-800/50";
                      } else if (coupon.status === "Expired") {
                        statusStyle = "bg-gray-800/90 text-gray-400 border-gray-700";
                      }

                      return (
                        <React.Fragment key={coupon.id}>
                          {/* Main Table Row */}
                          <tr
                            onClick={() => toggleRow(coupon.id)}
                            className={`group cursor-pointer transition-colors ${
                              isExpanded ? "bg-[#161324]" : "hover:bg-[#151222]"
                            }`}
                          >
                            {/* Chevron Icon Column */}
                            <td className="py-4 px-4 text-gray-500 group-hover:text-white">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-purple-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </td>

                            {/* Coupon Code Column */}
                            <td className="py-4 px-4 font-medium">
                              <span className={`inline-block px-3 py-1 rounded-md text-xs font-mono font-bold border ${codeBadgeStyle}`}>
                                {coupon.code}
                              </span>
                            </td>

                            {/* Discount Column */}
                            <td className="py-4 px-4 font-semibold text-white">
                              {coupon.discount}
                            </td>

                            {/* Scope Column */}
                            <td className="py-4 px-4">
                              <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium border ${scopeBadgeStyle}`}>
                                {coupon.scope}
                              </span>
                            </td>

                            {/* Usage Column with Progress Bar */}
                            <td className="py-4 px-6 min-w-[140px]">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-gray-200">
                                  {coupon.usageCount} / {coupon.usageLimit}
                                </span>
                                <div className="w-full bg-gray-800/90 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>

                            {/* Validity Column */}
                            <td className="py-4 px-4 text-gray-300">
                              <div className="flex flex-col text-[11px] leading-tight">
                                <span className="font-medium text-gray-200">{coupon.startDate}</span>
                                <span className="text-gray-500">to {coupon.endDate}</span>
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="py-4 px-4">
                              <button
                                onClick={(e) => handleToggleStatus(coupon.id, e)}
                                title="Click to toggle status"
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-transform active:scale-95 ${statusStyle}`}
                              >
                                <span>{coupon.status}</span>
                              </button>
                            </td>

                            {/* Created By Column */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <img
                                  src={coupon.avatar}
                                  alt={coupon.createdBy}
                                  className="w-6 h-6 rounded-full object-cover border border-gray-700"
                                />
                                <span className="text-gray-300 text-xs font-medium">{coupon.createdBy}</span>
                              </div>
                            </td>

                            {/* Actions Column */}
                            <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => handleOpenEditModal(coupon, e)}
                                  className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
                                  title="Edit Coupon"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-800 transition-colors"
                                  title="Delete Coupon"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Details Sub-Row */}
                          {isExpanded && (
                            <tr className="bg-[#0D0B16] border-b border-gray-800/80">
                              <td colSpan="9" className="p-0">
                                <div className="px-10 py-5 border-l-2 border-pink-500/80 my-2 ml-4 mr-6 rounded-r-xl bg-[#0F0C1B]">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                                    
                                    {/* Description */}
                                    <div>
                                      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Description
                                      </h4>
                                      <p className="text-gray-300 leading-relaxed">
                                        {coupon.description}
                                      </p>
                                    </div>

                                    {/* Constraints */}
                                    <div>
                                      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Constraints
                                      </h4>
                                      <div className="space-y-1 text-gray-300">
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-500">Min Order:</span>
                                          <span className="font-semibold text-gray-200">{coupon.minOrder}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-500">Min Tickets:</span>
                                          <span className="font-semibold text-gray-200">{coupon.minTickets}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-500">Max Discount:</span>
                                          <span className="font-semibold text-gray-200">{coupon.maxDiscount}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Usage Limits */}
                                    <div>
                                      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Usage Limits
                                      </h4>
                                      <div className="space-y-1 text-gray-300">
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-500">Per User:</span>
                                          <span className="font-medium text-gray-200">{coupon.perUser}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-500">Total Cap:</span>
                                          <span className="font-medium text-gray-200">{coupon.totalCap}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Target Badges */}
                                    <div>
                                      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Target
                                      </h4>
                                      <div className="flex flex-wrap gap-1.5">
                                        {coupon.target.map((tag, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2.5 py-1 rounded-md bg-gray-800/80 border border-gray-700 text-gray-300 text-[11px] font-medium"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {filteredCoupons.length === 0 && (
                      <tr>
                        <td colSpan="9" className="py-12 text-center text-gray-500">
                          No coupons found in database. Click "+ Create Coupon" to add your first coupon.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && totalCoupons > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 px-2 text-xs text-gray-400">
              <div>
                Showing <span className="font-semibold text-white">{Math.min((page - 1) * limit + 1, totalCoupons)}</span> to{" "}
                <span className="font-semibold text-white">{Math.min(page * limit, totalCoupons)}</span> of{" "}
                <span className="font-semibold text-white">{totalCoupons}</span> coupons
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        pNum === page
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                          : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>



      {/* Edit Coupon Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#151221] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Edit Coupon ({formData.code})</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed Amount (₹ OFF)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Discount Fields */}
              {formData.discountType === "fixed" ? (
                /* Fixed Amount: Discount Value & Minimum Order Value only */
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Fixed Discount Value (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder="500"
                      className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Minimum Order Value (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.minOrder}
                      onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                      placeholder="2000"
                      className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[10px] text-purple-400/80 mt-1">Must be &gt; Discount Value</p>
                  </div>
                </div>
              ) : (
                /* Percentage: Discount %, Max Discount, Min Order, Min Tickets */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Discount Value (%) *</label>
                      <input
                        type="number"
                        max="100"
                        required
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        placeholder="20"
                        className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Max Discount Amount (₹)</label>
                      <input
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        placeholder="500"
                        className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Min Order Value (₹)</label>
                      <input
                        type="number"
                        value={formData.minOrder}
                        onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                        placeholder="1000"
                        className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-medium">Min Tickets Required</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minTickets}
                        onChange={(e) => setFormData({ ...formData, minTickets: e.target.value })}
                        placeholder="1"
                        className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Expiry Date (End Date)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Scope</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="All Events">All Events</option>
                    <option value="Event Specific">Event Specific</option>
                    <option value="Vendor Specific">Vendor Specific</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-semibold shadow-lg shadow-purple-900/30 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCouponManagement;
