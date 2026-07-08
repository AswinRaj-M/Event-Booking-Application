import React, { useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { ADMIN_ROUTES } from "../../constants/Routes";
import {
  Search,
  Bell,
  Sidebar,
  FileText,
  Plus,
  Files,
  Hourglass,
  XCircle,
  CheckCircle,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllVendorsThunk } from "../../features/admin.slice";
import { getAllCategories } from "../../services/common.api";

function AdminVendorManagement() {
  const dispatch = useDispatch();
  const { total, currentPage, totalPages, vendors, vendorsLoading: loading, vendorStats } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);
  const limit = 4;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        if (response.data && response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    dispatch(
      getAllVendorsThunk({
        status: activeTab,
        page,
        limit,
        search: searchQuery,
        category: selectedCategory,
      }),
    );
  }, [dispatch, activeTab, page, searchQuery, selectedCategory]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-800 bg-[#0B0914] shrink-0">
          <div className="flex items-center text-gray-400 text-sm">
            <Sidebar className="w-5 h-5 mr-4 text-gray-500 cursor-pointer hover:text-white" />
            <span className="mx-2">&gt;</span>
            <span className="text-gray-200 font-medium">Vendors</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-purple-500 ring-2 ring-[#0B0914]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col min-h-0 scrollbar-hide">
          {/* Page Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Vendor Management
              </h1>
              <p className="text-gray-400 text-sm">
                Manage vendor onboarding requests and oversee approved partners.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#151221] border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium text-gray-200 transition-colors">
                <FileText className="w-4 h-4" />
                Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-900/20 transition-all">
                <Plus className="w-4 h-4" />
                Invite Vendor
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-8 shrink-0">
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-300">
                  Total Applications
                </p>
                <Files className="w-5 h-5 text-purple-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {vendorStats?.total || 0}
                </h3>
                <p className="text-xs mt-1 text-gray-500">
                  <span className="text-emerald-400">+0%</span> from last month
                </p>
              </div>
            </div>

            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-300">
                  Pending Review
                </p>
                <Hourglass className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-blue-500 tracking-tight">
                  {vendorStats?.pending || 0}
                </h3>
                <p className="text-xs mt-1 text-gray-500">Requires attention</p>
              </div>
            </div>

            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-300">
                  Approved Vendors
                </p>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-emerald-500 tracking-tight">
                  {vendorStats?.approved || 0}
                </h3>
                <p className="text-xs mt-1 text-gray-500">Active partners</p>
              </div>
            </div>

            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-300">
                  Suspended Vendors
                </p>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-red-500 tracking-tight">
                  {vendorStats?.suspended || 0}
                </h3>
                <p className="text-xs mt-1 text-gray-500">Temporarily blocked</p>
              </div>
            </div>

            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-300">
                  Rejected (Total)
                </p>
                <XCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-orange-500 tracking-tight">
                  {vendorStats?.rejected || 0}
                </h3>
                <p className="text-xs mt-1 text-gray-500">0% rejection rate</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#151221] border border-gray-800/80 rounded-xl p-1 mb-8 shrink-0 w-fit">
            <button
              onClick={() => {
                setActiveTab("pending");
                setPage(1);
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "pending" ? "bg-[#2A204C] text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
            >
              New Applications
            </button>
            <button
              onClick={() => {
                setActiveTab("approved");
                setPage(1);
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "approved" ? "bg-[#2A204C] text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
            >
              Approved Vendors
            </button>
            <button
              onClick={() => {
                setActiveTab("suspended");
                setPage(1);
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "suspended" ? "bg-[#2A204C] text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
            >
              Suspended Vendors
            </button>
            <button
              onClick={() => {
                setActiveTab("rejected");
                setPage(1);
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "rejected" ? "bg-[#2A204C] text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
            >
              Rejected Applications
            </button>
          </div>

          {/* Table Toolbar */}
          <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by business, name, email..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="bg-[#0B0914] border border-gray-800 text-sm rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full sm:w-80 transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Select */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="appearance-none bg-[#0B0914] border border-gray-800 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 focus:outline-none focus:border-purple-500 w-full sm:w-48 cursor-pointer transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-[#151221] border border-gray-800/80 rounded-xl overflow-hidden flex flex-col shrink-0">
            <div className="overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs text-gray-300 font-semibold border-b border-gray-800 bg-[#131022]">
                  <tr className="h-12">
                    <th className="px-6">App ID</th>
                    <th className="px-6">Business Info</th>
                    <th className="px-6">Contact</th>
                    <th className="px-6">Category</th>
                    <th className="px-6">Submitted</th>
                    <th className="px-6">Status</th>
                    <th className="px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {/* Empty state or dynamically mapped rows will go here */}

                  {loading ? (
                    <tr className="h-[288px]">
                      <td
                        colSpan="7"
                        className="px-6 text-center text-gray-500"
                      >
                        <div className="flex items-center justify-center h-full">
                          Loading applications...
                        </div>
                      </td>
                    </tr>
                  ) : vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <tr key={vendor._id} className="h-[72px]">
                        <td className="px-6">#{vendor._id.toString().slice(-6).toUpperCase()}</td>
                        <td className="px-6">
                          <div className="flex flex-col">
                            <span className="text-white font-medium font-sans">{vendor.businessName}</span>
                            <span className="text-gray-500 text-xs font-sans ">{vendor.organizerName}</span>
                          </div>
                        </td>
                        <td className="px-6">
                          <div className="flex flex-col font-sans">
                            <span className="text-gray-300">{vendor.businessEmail}</span>
                            <span className="text-gray-500 text-xs">{vendor.contactPhone}</span>
                          </div>
                        </td>
                        <td className="px-6">
                          <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs font-sans">
                            {vendor.eventCategory}
                          </span>
                        </td>
                        <td className="px-6 text-gray-400 font-sans">
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium font-sans ${
                            vendor.isBlocked
                              ? 'bg-red-900/30 text-red-400 border border-red-800/30'
                              : vendor.applicationStatus === 'approved'
                              ? 'bg-emerald-900/30 text-emerald-400'
                              : vendor.applicationStatus === 'pending'
                              ? 'bg-amber-900/30 text-amber-400'
                              : 'bg-red-900/30 text-red-400'
                            }`}>
                            {vendor.isBlocked
                              ? 'Suspended'
                              : vendor.applicationStatus.charAt(0).toUpperCase() + vendor.applicationStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 text-right">
                          <Link
                            to={ADMIN_ROUTES.VENDOR_APPLICATION.replace(':id', vendor._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A204C] text-purple-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            View Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="h-[288px]">
                      <td
                        colSpan="7"
                        className="px-6 text-center text-gray-500"
                      >
                        <div className="flex items-center justify-center h-full">
                          No applications found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-gray-800/80 flex items-center justify-between text-sm text-gray-400 mt-auto bg-[#131022]/50">
              <p>
                Showing{" "}
                <strong className="text-white">{(page - 1) * limit + 1}</strong>{" "}
                to{" "}
                <strong className="text-white">
                  {Math.min(page * limit, total)}
                </strong>{" "}
                of <strong className="text-white">{total}</strong> applications
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                  disabled={page === totalPages || totalPages === 0}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminVendorManagement;
