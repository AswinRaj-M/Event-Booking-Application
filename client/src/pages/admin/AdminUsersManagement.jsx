import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  UserPlus,
  Ban,
  Bell,
  Sidebar,
  Circle,
} from "lucide-react";
import { fetchAllUsers, toggleUserBlock } from "../../services/admin.api";
import { toast } from "sonner";
import Loader from "../../components/common/Loader";

const AdminUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  // Fetch Users on Mount
  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const response = await fetchAllUsers();
        if (response.data && response.data.success) {
          const nonAdmins = (response.data.data || []).filter(u => u.role !== "admin");
          setUsers(nonAdmins);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users database");
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  // Derived statistics computed directly from local users list state
  const totalCount = users.length;
  const activeCount = users.filter((u) => !u.isBlocked).length;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  // Toggle user block status on backend & update state locally
  const handleToggleBlock = async (id, isCurrentlyBlocked) => {
    try {
      const response = await toggleUserBlock(id);
      if (response.data && response.data.success) {
        const updatedUser = response.data.data;
        
        // Update local array state to trigger derived recalculation
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u._id === id ? { ...u, isBlocked: updatedUser.isBlocked } : u))
        );
        
        const actionText = updatedUser.isBlocked ? "blocked" : "unblocked";
        toast.success(`User ${actionText} successfully!`);
      }
    } catch (error) {
      console.error("Failed to toggle user block status:", error);
      toast.error(error.response?.data?.message || "Failed to update user block status");
    }
  };

  // Perform multi criteria filtering
  const filteredUsers = users.filter((item) => {
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (item.fullName && item.fullName.toLowerCase().includes(query)) ||
      (item.email && item.email.toLowerCase().includes(query)) ||
      (item.phoneNumber && item.phoneNumber.toLowerCase().includes(query));

    let matchesStatus = true;
    if (selectedStatus === "Active") {
      matchesStatus = !item.isBlocked;
    } else if (selectedStatus === "Blocked") {
      matchesStatus = !!item.isBlocked;
    }

    return matchesSearch && matchesStatus;
  });

  // Derived paginated slice of filtered list
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if(loading){
    return(
     <>
      <Loader/>
    </>
  )
}

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
            <span>Dashboard</span>
            <span className="mx-2">&gt;</span>
            <span className="text-purple-400 font-medium">Manage Users</span>
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
          {/* Page Header Title Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Manage Users
              </h1>
              <p className="text-gray-400 text-sm">
                View, manage, and monitor all registered users and vendors.
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-900/20">
              <UserPlus size={16} />
              <span>Add New User</span>
            </button>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
            {/* Total Users */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Total Users</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{totalCount}</h3>
                </div>
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Registered users base
              </p>
            </div>

            {/* Active Users */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Active Users</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{activeCount}</h3>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Circle size={20} className="fill-emerald-400 text-emerald-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Active sessions base
              </p>
            </div>

            {/* Blocked Users */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Blocked Users</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{blockedCount}</h3>
                </div>
                <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
                  <Ban size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Suspended account base
              </p>
            </div>
          </div>

          {/* Directory Card */}
          <div className="bg-[#151221] border border-gray-800/80 rounded-xl flex flex-col shrink-0 mb-6">
            {/* Directory Header Section */}
            <div className="p-6 border-b border-gray-800/80 shrink-0">
              <h3 className="text-lg font-semibold text-white mb-1">User Directory</h3>
              <p className="text-sm text-gray-400 mb-6">Search and filter through the user database.</p>

              {/* Filters Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                {/* Search and Filters */}
                <div className="flex flex-1 flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, email, or phone..."
                      className="w-full bg-[#0B0914] border border-gray-700/80 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 text-gray-200 transition-colors"
                    />
                  </div>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0B0914] border border-gray-700 hover:border-purple-500/50 hover:bg-[#201A33] rounded-lg text-sm transition-colors text-gray-300">
                    <Filter size={14} />
                    <span>Filters</span>
                  </button>
                </div>

                 {/* Dropdowns */}
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-[#0B0914] border border-gray-700/80 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-purple-500 text-gray-300 appearance-none cursor-pointer min-w-[120px]"
                    >
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Blocked</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Area (Responsive Table scrolling configuration) */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800/85 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">User</th>
                    <th className="py-4 px-6 font-semibold">Role</th>
                    <th className="py-4 px-6 font-semibold">Phone</th>
                    <th className="py-4 px-6 font-semibold">Joined</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-sm text-gray-300">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-purple-400 font-medium">
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                          <span>Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                        No users or vendors found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((item) => (
                      <tr key={item._id} className="hover:bg-[#1C172E]/40 transition-colors">

                        {/* User Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName || "User")}&background=random&color=fff`}
                              alt={item.fullName || "User"}
                              className="w-10 h-10 rounded-full object-cover border border-gray-800"
                            />
                            <div>
                              <p className="font-semibold text-white leading-tight mb-1">{item.fullName || "User"}</p>
                              <p className="text-xs text-gray-500">{item.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <User size={14} className={item.role === "admin" ? "text-purple-400" : "text-blue-400"} />
                            <span className="capitalize">{item.role || "user"}</span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-6 text-gray-400">{item.phoneNumber || "N/A"}</td>

                        {/* Joined */}
                        <td className="py-4 px-6 text-gray-400">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                              item.isBlocked
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {item.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          {item.isBlocked ? (
                            <div className="flex items-center justify-end gap-3">
                              <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                              <button
                                onClick={() => handleToggleBlock(item._id, item.isBlocked)}
                                className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                              >
                                Unblock
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                              <button
                                onClick={() => handleToggleBlock(item._id, item.isBlocked)}
                                className="text-sm font-semibold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                Block
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredUsers.length > 0 && (
              <div className="p-6 border-t border-gray-800/80 flex items-center justify-between shrink-0">
                <span className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-300">
                    {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                  </span>{" "}
                  of <span className="font-semibold text-gray-300">{filteredUsers.length}</span> matching users
                </span>

                <div className="flex items-center gap-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0914] border border-gray-700 hover:border-purple-500/50 hover:bg-[#201A33] rounded-lg text-xs font-semibold transition-all text-gray-400 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                          currentPage === pageNumber
                            ? "bg-purple-600/90 text-white shadow-lg shadow-purple-900/20"
                            : "bg-[#0B0914] border border-gray-700 text-gray-400 hover:bg-[#201A33] hover:text-white"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0914] border border-gray-700 hover:border-purple-500/50 hover:bg-[#201A33] rounded-lg text-xs font-semibold transition-all text-gray-400 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsersManagement;
