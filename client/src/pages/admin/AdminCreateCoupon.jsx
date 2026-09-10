import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from "../../components/admin/AdminSidebar";
import { ADMIN_ROUTES } from '../../constants/Routes';
import {
  Sidebar,
  ChevronRight,
  Percent,
  Calendar,
  AlertTriangle,
  Users,
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";
import { createCouponApi } from "../../services/admin.api";
import { getAllCategories } from "../../services/common.api";

function AdminCreateCoupon() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [isActive, setIsActive] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  
  const [discountType, setDiscountType] = useState("percentage"); // "percentage" | "fixed"
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [minTickets, setMinTickets] = useState("1");

  // Scope & Category Dynamic Data
  const [scope, setScope] = useState("All Events");
  const [minPriceThreshold, setMinPriceThreshold] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const [totalUses, setTotalUses] = useState("");
  const [usesPerUser, setUsesPerUser] = useState("1");
  const [newUsersOnly, setNewUsersOnly] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [autoExpire, setAutoExpire] = useState(true);

  const [visibility, setVisibility] = useState("public"); // "public" | "private"

  // Fetch categories from database for dropdown options
  useEffect(() => {
    const loadScopeOptions = async () => {
      try {
        const catRes = await getAllCategories();
        if (catRes.data && catRes.data.success && Array.isArray(catRes.data.data)) {
          setCategoriesList(catRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories list:", err);
      }
    };

    loadScopeOptions();
  }, []);

  // Random Code Generator
  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponCode(code);
    toast.success(`Generated code: ${code}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Coupon Code is required");
      return;
    }
    const codeRegex = /^[A-Z0-9_-]{3,20}$/;
    if (!codeRegex.test(cleanCode)) {
      toast.error("Coupon Code must be 3-20 characters (letters, numbers, hyphens, underscores)");
      return;
    }

    const discountVal = Number(discountValue);
    if (!discountValue || isNaN(discountVal) || discountVal <= 0) {
      toast.error("Please enter a valid discount value greater than 0");
      return;
    }

    if (discountType === "fixed") {
      const minOrderVal = Number(minOrderValue);
      if (!minOrderValue || isNaN(minOrderVal) || minOrderVal <= 0) {
        toast.error("Minimum order value is required and must be greater than 0 for fixed amount coupons");
        return;
      }

      if (discountVal >= minOrderVal) {
        toast.error(`Discount Value (₹${discountVal}) must be strictly less than Minimum Order Value (₹${minOrderVal})`);
        return;
      }
    } else if (discountType === "percentage") {
      if (discountVal > 100) {
        toast.error("Percentage discount cannot exceed 100%");
        return;
      }

      if (minOrderValue && Number(minOrderValue) < 0) {
        toast.error("Minimum order value cannot be negative");
        return;
      }

      if (maxDiscountAmount && Number(maxDiscountAmount) < 0) {
        toast.error("Maximum discount amount cannot be negative");
        return;
      }

      if (minTickets && (Number(minTickets) < 1 || !Number.isInteger(Number(minTickets)))) {
        toast.error("Minimum tickets required must be an integer of at least 1");
        return;
      }
    }

    if (totalUses) {
      const usesNum = Number(totalUses);
      if (isNaN(usesNum) || usesNum < 1 || !Number.isInteger(usesNum)) {
        toast.error("Usage limit must be a positive integer (at least 1)");
        return;
      }
    }

    if (!endDate) {
      toast.error("Expiry date (End Date) is required");
      return;
    }

    const expDate = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(expDate.getTime()) || expDate < today) {
      toast.error("Expiry date cannot be in the past");
      return;
    }

    if (scope === "Price Range" && (!minPriceThreshold || Number(minPriceThreshold) <= 0)) {
      toast.error("Please enter a valid minimum event price threshold");
      return;
    }

    const effectiveMinPurchase = scope === "Price Range"
      ? (Number(minPriceThreshold) || 0)
      : (Number(minOrderValue) || 0);

    const payload = {
      code: couponCode.trim().toUpperCase(),
      discountType: discountType,
      discountValue: Number(discountValue),
      minPurchaseAmount: effectiveMinPurchase,
      minTickets: discountType === "fixed" ? 1 : (Number(minTickets) || 1),
      startDate: startDate || new Date(),
      endDate: endDate,
      usagelimit: Number(totalUses) || 100,
      perUserLimit: Number(usesPerUser) || 1,
      isActive: isActive,
      isPublic: visibility === "public",
      displayName: displayName.trim(),
      description: description.trim()
    };

    if (discountType === "percentage" && maxDiscountAmount && Number(maxDiscountAmount) > 0) {
      payload.maxDiscountAmount = Number(maxDiscountAmount);
    }

    try {
      setSubmitting(true);
      const res = await createCouponApi(payload);
      if (res.data && res.data.success) {
        toast.success(`Coupon "${payload.code}" published successfully!`);
        navigate(ADMIN_ROUTES.COUPONS);
      }
    } catch (error) {
      console.error("Failed to publish coupon:", error);
      toast.error(error.response?.data?.message || "Failed to publish coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden">
      <AdminSidebar />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-800/80 bg-[#0B0914] shrink-0">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button 
              type="button"
              onClick={() => navigate(ADMIN_ROUTES.COUPONS)} 
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <Sidebar className="w-4 h-4" />
            </button>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate(ADMIN_ROUTES.DASHBOARD)}>Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="hover:text-white cursor-pointer" onClick={() => navigate(ADMIN_ROUTES.COUPONS)}>Coupons</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-white font-medium">Create</span>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(ADMIN_ROUTES.COUPONS)}
              className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer font-medium px-3 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-purple-900/30 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse"></div>
              {submitting ? "Publishing..." : "Publish Coupon"}
            </button>
          </div>
        </header>

        {/* Main Scrollable Canvas */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 scrollbar-hide">
          
          {/* Main Title Section */}
          <div className="mb-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Create New Coupon</h1>
            <p className="text-xs text-gray-400 mt-1">
              Configure discount rules, usage limits, and validity periods for your new promotion.
            </p>
          </div>

          {/* Grid Layout: 2 Cols Form + 1 Col Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: 6 Step Form Cards */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* STEP 1: Coupon Basics */}
              <div className="bg-[#151221] border border-gray-800/90 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Coupon Basics</h3>
                      <p className="text-[11px] text-gray-400">Define the core identity of this coupon.</p>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 font-medium text-[11px]">Active</span>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        isActive ? "bg-purple-600" : "bg-gray-800"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Coupon Code Input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full bg-[#0B0914] border border-gray-800 rounded-xl pl-3 pr-20 py-2.5 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-purple-500 transition-all"
                        placeholder="SUMMER2025"
                      />
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 rounded bg-purple-950/60 border border-purple-800/60 cursor-pointer"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  {/* Display Name Input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                      Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="Summer Music Festival Special"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={description}
                    maxLength={150}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#0B0914] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="Get discount on all weekend passes for the Festival."
                  ></textarea>
                  <div className="text-right text-[10px] text-gray-500 mt-1">
                    {description.length}/150 characters
                  </div>
                </div>
              </div>

              {/* STEP 2: Discount Configuration */}
              <div className="bg-[#151221] border border-gray-800/90 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Discount Configuration</h3>
                  </div>
                </div>

                {/* Discount Type Radio Selection Cards */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-2">Discount Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: Percentage Off */}
                    <div
                      onClick={() => setDiscountType("percentage")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                        discountType === "percentage"
                          ? "border-purple-500 bg-purple-950/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                          : "border-gray-800 bg-[#0F0D18] hover:border-gray-700"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-purple-400">
                        <Percent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white">Percentage Off</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        discountType === "percentage" ? "border-purple-500" : "border-gray-600"
                      }`}>
                        {discountType === "percentage" && (
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        )}
                      </div>
                    </div>

                    {/* Option 2: Fixed Amount */}
                    <div
                      onClick={() => setDiscountType("fixed")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                        discountType === "fixed"
                          ? "border-purple-500 bg-purple-950/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                          : "border-gray-800 bg-[#0F0D18] hover:border-gray-700"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-purple-400">
                        <span className="text-xs font-bold">₹</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white">Fixed Amount</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        discountType === "fixed" ? "border-purple-500" : "border-gray-600"
                      }`}>
                        {discountType === "fixed" && (
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditional Dynamic Value Inputs */}
                {discountType === "fixed" ? (
                  /* Fixed Amount Inputs: Only Discount Value & Minimum Order Value */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                        Fixed Discount Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          className="w-full bg-[#0B0914] border border-gray-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                          placeholder="500"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Exact amount deducted from order</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                        Minimum Order Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={minOrderValue}
                          onChange={(e) => setMinOrderValue(e.target.value)}
                          className="w-full bg-[#0B0914] border border-gray-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                          placeholder="2000"
                        />
                      </div>
                      <p className="text-[10px] text-purple-400/80 mt-1">Must be strictly greater than Discount Value</p>
                    </div>
                  </div>
                ) : (
                  /* Percentage Inputs: Discount %, Max Discount, Min Order, Min Tickets */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                        Discount Percentage <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">%</span>
                        <input
                          type="number"
                          max="100"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          className="w-full bg-[#0B0914] border border-gray-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                          placeholder="20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                        Max Discount Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={maxDiscountAmount}
                          onChange={(e) => setMaxDiscountAmount(e.target.value)}
                          className="w-full bg-[#0B0914] border border-gray-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                          placeholder="500"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Leave empty for no limit</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                        Min Order Value
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={minOrderValue}
                          onChange={(e) => setMinOrderValue(e.target.value)}
                          className="w-full bg-[#0B0914] border border-gray-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                          placeholder="1000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                        Min Tickets Required
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={minTickets}
                          onChange={(e) => setMinTickets(e.target.value)}
                          className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                          placeholder="1"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Default 1 ticket</p>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3 & 4 (2 Column Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* STEP 3: Scope */}
                <div className="bg-[#151221] border border-gray-800/90 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 font-bold text-xs">
                      3
                    </div>
                    <h3 className="text-sm font-bold text-white">Scope</h3>
                  </div>

                  {/* Scope Selection */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">Apply Coupon To</label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="All Events">All Events (Platform-wide)</option>
                      <option value="Price Range">Events Above Minimum Price (Price Range)</option>
                    </select>
                  </div>

                  {/* Conditional Price Range Input */}
                  {scope === "Price Range" && (
                    <div className="animate-in fade-in duration-200">
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                        Minimum Event Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={minPriceThreshold}
                          onChange={(e) => {
                            setMinPriceThreshold(e.target.value);
                            setMinOrderValue(e.target.value);
                          }}
                          className="w-full bg-[#0B0914] border border-purple-800/60 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                          placeholder="500"
                        />
                      </div>
                      <p className="text-[10px] text-purple-400 mt-1">
                        Coupon applies only to events with price ≥ ₹{minPriceThreshold || 0}.
                      </p>
                    </div>
                  )}

                  {/* Dynamic Category Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">Filter Category (Optional)</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="">Select category</option>
                      {categoriesList.map((cat) => (
                        <option key={cat._id} value={cat.name || cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* STEP 4: Usage Limits */}
                <div className="bg-[#151221] border border-gray-800/90 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 font-bold text-xs">
                      4
                    </div>
                    <h3 className="text-sm font-bold text-white">Usage Limits</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">Total Uses</label>
                      <input
                        type="number"
                        value={totalUses}
                        onChange={(e) => setTotalUses(e.target.value)}
                        className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">Uses Per User</label>
                      <input
                        type="number"
                        value={usesPerUser}
                        onChange={(e) => setUsesPerUser(e.target.value)}
                        className="w-full bg-[#0B0914] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* New Users Only Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-bold text-white">New Users Only</p>
                      <p className="text-[10px] text-gray-500">First booking only</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewUsersOnly(!newUsersOnly)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        newUsersOnly ? "bg-purple-600" : "bg-gray-800"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          newUsersOnly ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>

              </div>

              {/* STEP 5: Validity Period */}
              <div className="bg-[#151221] border border-gray-800/90 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 font-bold text-xs">
                    5
                  </div>
                  <h3 className="text-sm font-bold text-white">Validity Period</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">Start Date & Time</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#0B0914] border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">End Date & Time</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-[#0B0914] border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoExpire"
                    checked={autoExpire}
                    onChange={(e) => setAutoExpire(e.target.checked)}
                    className="rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5"
                  />
                  <label htmlFor="autoExpire" className="text-xs text-gray-400 cursor-pointer">
                    Auto-expire coupon when usage limit is reached
                  </label>
                </div>
              </div>

              {/* STEP 6: Visibility & Promotion */}
              <div className="bg-[#151221] border border-gray-800/90 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 font-bold text-xs">
                    6
                  </div>
                  <h3 className="text-sm font-bold text-white">Visibility & Promotion</h3>
                </div>

                {/* Public vs Private Cards */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-2">Coupon Visibility</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setVisibility("public")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        visibility === "public"
                          ? "border-purple-500 bg-purple-950/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                          : "border-gray-800 bg-[#0F0D18] hover:border-gray-700"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white mb-1">Public</p>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          Shown on checkout pages and event banners automatically.
                        </p>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        visibility === "public" ? "border-purple-500" : "border-gray-600"
                      }`}>
                        {visibility === "public" && <div className="w-2 h-2 rounded-full bg-purple-400"></div>}
                      </div>
                    </div>

                    <div
                      onClick={() => setVisibility("private")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        visibility === "private"
                          ? "border-purple-500 bg-purple-950/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                          : "border-gray-800 bg-[#0F0D18] hover:border-gray-700"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white mb-1">Private (Hidden)</p>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          User must manually enter the code to apply discount.
                        </p>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        visibility === "private" ? "border-purple-500" : "border-gray-600"
                      }`}>
                        {visibility === "private" && <div className="w-2 h-2 rounded-full bg-purple-400"></div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Ticket Card Live Preview & Summary Stats */}
            <div className="space-y-6">
              
              {/* Vibrant Live Ticket Preview Widget */}
              <div className="bg-[#151221] border border-gray-800/90 rounded-2xl overflow-hidden shadow-2xl relative">
                
                {/* Purple Ticket Banner Top */}
                <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 p-6 text-center relative overflow-hidden">
                  {/* Left & Right Notch Cutouts */}
                  <div className="w-4 h-4 rounded-full bg-[#151221] absolute -left-2 top-1/2 -translate-y-1/2"></div>
                  <div className="w-4 h-4 rounded-full bg-[#151221] absolute -right-2 top-1/2 -translate-y-1/2"></div>

                  <h2 className="text-xl font-black text-white font-mono tracking-wider drop-shadow-md">
                    {couponCode || "YOUR CODE"}
                  </h2>
                  <p className="text-xs text-purple-200 mt-1 font-medium">
                    {displayName || "Promotion Title"}
                  </p>
                </div>

                {/* Ticket Details Body */}
                <div className="p-6 text-center space-y-4 bg-[#12101A]">
                  <div>
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {discountValue ? (discountType === "percentage" ? `${discountValue}%` : `₹${discountValue}`) : "0%"}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1.5">OFF</span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed px-2">
                    {description || "Coupon discount description."}
                  </p>

                  {selectedCategory && (
                    <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                      <span className="px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[10px] font-semibold">
                        {selectedCategory}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-800/80 text-[11px] text-gray-500 font-medium">
                    Valid until {endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Expiry Date"}
                  </div>
                </div>

              </div>

              {/* Summary Card */}
              <div className="bg-[#151221] border border-gray-800/90 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Summary</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-800/50">
                    <span className="text-gray-400">Type</span>
                    <span className="font-semibold text-white capitalize">{discountType}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-800/50">
                    <span className="text-gray-400">Value</span>
                    <span className="font-bold text-purple-400">
                      {discountType === "percentage" ? `${discountValue || 0}%` : `₹${discountValue || 0}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-800/50">
                    <span className="text-gray-400">Scope</span>
                    <span className="font-semibold text-white">{scope}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-800/50">
                    <span className="text-gray-400">Max Uses</span>
                    <span className="font-semibold text-white">{totalUses || "-"}</span>
                  </div>
                </div>

                {/* Warning Alert Banner */}
                <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3.5 flex items-start gap-2.5 text-[11px] text-amber-300 leading-normal">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Warning:</strong> Once a coupon is used by a customer, its value and type cannot be edited.
                  </span>
                </div>

              </div>

              {/* Bottom Quick Analytics Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#151221] border border-gray-800/90 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center mb-1 text-purple-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-black text-white">1.2k</div>
                  <div className="text-[10px] text-gray-400 font-medium">Potential Users</div>
                </div>

                <div className="bg-[#151221] border border-gray-800/90 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center mb-1 text-purple-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-black text-white">All</div>
                  <div className="text-[10px] text-gray-400 font-medium">Eligible Events</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </form>
    </div>
  );
}

export default AdminCreateCoupon;
