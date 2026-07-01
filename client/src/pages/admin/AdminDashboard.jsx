import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Store,
  Calendar,
  Ticket,
  Settings,
  Bell,
  Sidebar,
  DollarSign,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import Loader from '../../components/common/Loader'
import { fetchAllUsers, getAllVendors, fetchAllEventsAdmin } from '../../services/admin.api'

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    activeEvents: 0,
    totalRevenue: 0,
  });
  const [distribution, setDistribution] = useState({
    userRatio: 50,
    vendorRatio: 50,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState(Array(12).fill(0));
  const [pendingVendorsCount, setPendingVendorsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, vendorsRes, eventsRes] = await Promise.all([
          fetchAllUsers(),
          getAllVendors({ limit: 1000 }),
          fetchAllEventsAdmin(),
        ]);

        let users = [];
        if (usersRes.data && usersRes.data.success) {
          users = (usersRes.data.data || []).filter(u => u.role !== 'admin');
        }

        let vendors = [];
        if (vendorsRes.data && vendorsRes.data.success) {
          vendors = vendorsRes.data.data || [];
        }

        let events = [];
        if (eventsRes.data && eventsRes.data.success) {
          events = eventsRes.data.events || [];
        }

       
        const totalUsers = users.length;
        const totalVendors = vendors.length;
        const pendingVendors = vendors.filter(v => v.applicationStatus === 'pending').length;
        setPendingVendorsCount(pendingVendors);

        const activeEvents = events.filter(e => !e.isBlocked).length;

        const totalRevenue = events.reduce((total, event) => {
          if (event.ticketType === 'Paid' && event.ticketTiers) {
            return total + event.ticketTiers.reduce((sum, tier) => sum + ((tier.sold || 0) * (tier.price || 0)), 0);
          }
          return total;
        }, 0);

        setStats({
          totalUsers,
          totalVendors,
          activeEvents,
          totalRevenue,
        });

        
        const totalAccounts = totalUsers + totalVendors;
        const userRatio = totalAccounts > 0 ? Math.round((totalUsers / totalAccounts) * 100) : 50;
        const vendorRatio = totalAccounts > 0 ? (100 - userRatio) : 50;
        setDistribution({ userRatio, vendorRatio });

        
        const currentYear = new Date().getFullYear();
        const monthlyRev = Array(12).fill(0);
        events.forEach(event => {
          const date = new Date(event.createdAt);
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth();
            if (event.ticketType === 'Paid' && event.ticketTiers) {
              event.ticketTiers.forEach(tier => {
                monthlyRev[month] += (tier.sold || 0) * (tier.price || 0);
              });
            }
          }
        });
        setMonthlyRevenueData(monthlyRev);

        
        const userActivities = users.map(u => ({
          id: `user-${u._id}`,
          name: u.fullName || "User",
          detail: u.email,
          type: "User Registration",
          status: u.isBlocked ? "Blocked" : "Active",
          statusColor: u.isBlocked ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          date: new Date(u.createdAt),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || "User")}&background=random&color=fff`
        }));

        const vendorActivities = vendors.map(v => ({
          id: `vendor-${v._id}`,
          name: v.businessName || v.organizerName || "Vendor",
          detail: v.businessEmail,
          type: "Vendor Application",
          status: v.applicationStatus, 
          statusColor: v.applicationStatus === 'approved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : v.applicationStatus === 'rejected' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20",
          date: new Date(v.createdAt),
          avatar: v.profilePicture?.fileUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.businessName || v.organizerName || "Vendor")}&background=random&color=fff`
        }));

        const eventActivities = events.map(e => ({
          id: `event-${e._id}`,
          name: e.title || "Event",
          detail: e.category?.name || "Category",
          type: "Event Published",
          status: e.isBlocked ? "Blocked" : (e.eventStatus || "Pending"),
          statusColor: e.isBlocked ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20",
          date: new Date(e.createdAt),
          avatar: e.thumbnail?.fileUrl || null
        }));

        const merged = [...userActivities, ...vendorActivities, ...eventActivities];
        merged.sort((a, b) => b.date - a.date);
        setRecentActivities(merged.slice(0, 10));

      } catch (error) {
        console.error("Error fetching dashboard statistics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toFixed(0);
  };

  const maxVal = Math.max(...monthlyRevenueData, 1000);
  const vendorDash = (distribution.vendorRatio / 100) * 188.5;
  const userDash = (distribution.userRatio / 100) * 188.5;

  if (loading) {
    return <Loader />
  }

  return (
    <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-800 bg-[#0B0914] shrink-0">
          <div className="flex items-center text-gray-300">
            <Sidebar className="w-5 h-5 mr-4 text-gray-500 cursor-pointer hover:text-white" />
            <h1 className="text-[17px] font-medium text-gray-200">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-purple-500 ring-2 ring-[#0B0914]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide flex flex-col min-h-0">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 shrink-0">
            {/* Stat Card 1 */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-[13px] text-gray-300">Total Users</p>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">{stats.totalUsers}</h3>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-500 text-xs font-semibold">Active users base</span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-[13px] text-gray-300">Total Vendors</p>
                <Store className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">{stats.totalVendors}</h3>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-500 text-xs font-semibold">Registered vendors</span>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-[13px] text-gray-300">Active Events</p>
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">{stats.activeEvents}</h3>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-500 text-xs font-semibold">Active listings</span>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-[13px] text-gray-300">Total Revenue</p>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-500 text-xs font-semibold">Sales revenue</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10 flex-1 min-h-[420px] ml-5">
            {/* Revenue Overview */}
            <div className="bg-[#100D18] border border-gray-800/60 rounded-xl p-6 lg:col-span-3 flex flex-col">
              <div className="mb-8 shrink-0">
                <h3 className="text-[17px] font-semibold text-gray-100">Revenue Overview</h3>
                <p className="text-[14px] text-gray-500 mt-1">Monthly revenue breakdown for the current year</p>
              </div>
              <div className="flex-1 w-full flex flex-col mt-4 min-h-[220px]">
                <div className="flex-1 relative border-b border-l border-gray-600/50 pb-2 pl-2 flex items-end justify-between gap-1.5 md:gap-3">
                  {/* Dynamic Bars */}
                  {monthlyRevenueData.map((val, idx) => {
                    const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 border border-gray-700 text-xs text-white px-2 py-1 rounded shadow-md z-20 whitespace-nowrap">
                          ${val.toLocaleString()}
                        </div>
                        {/* Bar */}
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t hover:from-indigo-500 hover:to-purple-400 transition-all duration-300 cursor-pointer animate-[fade-in_0.5s_ease-out]"
                          style={{ height: `${pct}%`, minHeight: val > 0 ? '4px' : '0px' }}
                        />
                      </div>
                    );
                  })}

                  {/* X-axis labels */}
                  <div className="absolute left-0 bottom-0 w-full flex justify-between px-2 text-[13px] text-gray-300 pb-1" style={{ bottom: '-35px' }}>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div className="h-1.5 w-px bg-gray-600/50 mb-1"></div>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>

                  {/* Y-axis labels */}
                  <div className="absolute -left-20 top-0 h-full flex flex-col justify-between text-[13px] text-gray-300 text-right pr-2 w-16">
                    <div className="flex items-center justify-end w-full"><span className="mr-1.5">${formatCurrency(maxVal)}</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0"></div></div>
                    <div className="flex items-center justify-end w-full"><span className="mr-1.5">${formatCurrency(maxVal * 0.75)}</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0"></div></div>
                    <div className="flex items-center justify-end w-full"><span className="mr-1.5">${formatCurrency(maxVal * 0.5)}</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0"></div></div>
                    <div className="flex items-center justify-end w-full"><span className="mr-1.5">${formatCurrency(maxVal * 0.25)}</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0"></div></div>
                    <div className="flex items-center justify-end w-full mt-4"><span className="mr-1.5 translate-y-1">$0</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0 bottom-0"></div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Distribution */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 lg:col-span-2 flex flex-col">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-100">User Distribution</h3>
                <p className="text-xs text-gray-400 mt-1">Ratio of Users vs Vendors</p>
              </div>
              <div className="flex-1 flex items-center justify-center relative mt-4">
                <div className="relative w-[180px] h-[180px]">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#1f1a30" strokeWidth="26" />
                    {/* Vendors slice */}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#4a2fb6" strokeWidth="26" strokeDasharray={`${vendorDash} 188.5`} strokeDashoffset="0" />
                    {/* Users slice */}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#9333ea" strokeWidth="26" strokeDasharray={`${userDash} 188.5`} strokeDashoffset={`-${vendorDash}`} />
                  </svg>
                </div>
              </div>
              <div className="mt-8 flex justify-between text-xs text-gray-400 px-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9333ea] block"></span>
                  Users ({distribution.userRatio}%)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4a2fb6] block"></span>
                  Vendors ({distribution.vendorRatio}%)
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4 flex-1 min-h-[350px]">

            {/* Recent Activity Table */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl lg:col-span-2 overflow-hidden flex flex-col relative h-full">
              <div className="p-5 flex justify-between items-center border-b border-gray-800/50 shrink-0">
                <div>
                  <h3 className="text-base font-semibold text-gray-100">Recent Activity</h3>
                  <p className="text-xs text-gray-400 mt-1">Latest registrations and events.</p>
                </div>
                <button 
                  onClick={() => navigate('/admin/users')}
                  className="text-xs text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-700/50 px-3 py-1.5 rounded-md border border-gray-700 transition-colors flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto flex-1 scrollbar-hide">
                <table className="w-full text-left text-[13px] whitespace-nowrap">
                  <thead className="text-xs text-gray-400 bg-black/20 font-medium">
                    <tr>
                      <th className="px-5 py-3.5">User / Event</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {recentActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-[#1C172E]/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {act.avatar ? (
                              <img src={act.avatar} alt={act.name} className="w-8 h-8 rounded-full object-cover border border-gray-800" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                <Calendar className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white leading-tight mb-1">{act.name}</p>
                              <p className="text-xs text-gray-500">{act.detail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-300">
                          {act.type}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${act.statusColor}`}>
                            {act.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-gray-400">
                          {act.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                      </tr>
                    ))}
                    {recentActivities.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                          No recent activities found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#181329] border border-gray-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-full">
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="mb-4 flex items-center gap-2 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-semibold text-gray-100">Quick Actions</h3>
                </div>
                <p className="text-xs text-gray-400 mb-6 shrink-0">Common administrative tasks</p>

                <div className="space-y-3 overflow-y-auto scrollbar-hide pb-2 flex-1">
                  <button 
                    onClick={() => navigate('/admin/vendors')}
                    className="w-full bg-gradient-to-r from-[#9333ea] to-[#4f46e5] hover:opacity-90 text-white rounded-lg p-3 flex border border-purple-500/20 items-center justify-between transition-all shadow-md shadow-purple-900/10 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-white opacity-90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                      <div className="text-left">
                        <p className="text-[13px] font-medium tracking-wide">Approve Vendors</p>
                        <p className="text-[10px] text-purple-200/90 mt-0.5">{pendingVendorsCount} pending reviews</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => navigate('/admin/events')}
                    className="w-full bg-black/20 hover:bg-white/5 border border-transparent rounded-lg p-3 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <div className="text-left">
                        <p className="text-[13px] font-medium text-gray-200">Manage Events</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Review active listings</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => navigate('/admin/users')}
                    className="w-full bg-black/20 hover:bg-white/5 border border-transparent rounded-lg p-3 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <div className="text-left">
                        <p className="text-[13px] font-medium text-gray-200">Manage Users</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">View and update user status</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => navigate('/admin/categories')}
                    className="w-full bg-black/20 hover:bg-white/5 border border-transparent rounded-lg p-3 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-indigo-400" />
                      <div className="text-left">
                        <p className="text-[13px] font-medium text-gray-200">System Categories</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Manage event categories</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard