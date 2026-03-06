import React, { useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Search,
  Bell,
  Sidebar,
  FileText,
  Plus,
  Files,
  Hourglass,
  XCircle,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllVendorsThunk } from "../../features/admin.slice";

function AdminVendorManagement() {
  const dispatch = useDispatch();
  const { vendors, loading } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState("new");
  console.log(vendors)

  useEffect(() => {
    dispatch(getAllVendorsThunk({ status: activeTab }));
  }, [dispatch, activeTab]);

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
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#151221] border border-gray-800 text-sm rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-64 transition-colors"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-purple-500 ring-2 ring-[#0B0914]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide flex flex-col min-h-0">
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

          {/* Tabs */}
          <div className="flex bg-[#151221] border border-gray-800/80 rounded-xl p-1 mb-8 shrink-0 w-fit">
            <button
              onClick={() => setActiveTab("new")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "new" ? "bg-[#2A204C] text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
            >
              New Applications
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "approved" ? "bg-[#2A204C] text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
            >
              Approved Vendors
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-300">
                  Total Applications
                </p>
                <Files className="w-5 h-5 text-purple-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  0
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
                  0
                </h3>
                <p className="text-xs mt-1 text-gray-500">Requires attention</p>
              </div>
            </div>

            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-300">
                  Rejected (This Month)
                </p>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-orange-500 tracking-tight">
                  0
                </h3>
                <p className="text-xs mt-1 text-gray-500">0% rejection rate</p>
              </div>
            </div>
          </div>

          {/* Table Toolbar */}
          <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="bg-[#0B0914] border border-gray-800 text-sm rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full sm:w-80 transition-colors"
                />
              </div>
              <button className="p-2.5 bg-[#0B0914] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0B0914] border border-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-800/50 transition-colors w-full sm:w-auto justify-between sm:justify-center min-w-[160px]">
              All Categories
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-[#151221] border border-gray-800/80 rounded-xl overflow-hidden flex-1 flex flex-col min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs text-gray-300 font-semibold border-b border-gray-800 bg-[#131022]">
                  <tr>
                    <th className="px-6 py-4">App ID</th>
                    <th className="px-6 py-4">Business Info</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {/* Empty state or dynamically mapped rows will go here */}

                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : vendors.length > 0 ?(
                        vendors.map((vendor) => (
                            <tr key={vendor.id}>
                                <td  className="px-6 py-4">{vendor._id}</td>
                                <td  className="px-6 py-4">{vendor.businessName}</td>
                                <td  className="px-6 py-4">{vendor.contactPhone}</td>
                                <td  className="px-6 py-4">{vendor.eventCategory}</td>
                                <td  className="px-6 py-4">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                                <td  className="px-6 py-4">{vendor.applicationStatus}</td>
                                <td  className="px-6 py-4">Actions</td>
                                
                            </tr>   
                        ))
                  ) :(
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-gray-800/80 flex items-center justify-between text-sm text-gray-400 mt-auto bg-[#131022]/50">
              <p>
                Showing <strong className="text-white">0</strong> of{" "}
                <strong className="text-white">0</strong> applications
              </p>

              <div className="flex items-center gap-1">
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                  disabled
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center px-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2A204C] text-white font-medium">
                    1
                  </button>
                  {/* Other pages would map here */}
                </div>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                  disabled
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
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
