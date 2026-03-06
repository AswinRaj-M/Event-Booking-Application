import React from 'react'
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


function AdminDashboard() {
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
                <Users className="w-4 h-4 text-gray-500" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">0</h3>
                <p className="flex items-center text-[11px] mt-2 text-gray-400">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400 mr-0.5" />
                  <span className="text-emerald-400 font-medium mr-1.5">+0%</span>
                  from last month
                </p>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-[13px] text-gray-300">Total Vendors</p>
                <Store className="w-4 h-4 text-gray-500" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">0</h3>
                <p className="flex items-center text-[11px] mt-2 text-gray-400">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400 mr-0.5" />
                  <span className="text-emerald-400 font-medium mr-1.5">+0%</span>
                  new applications
                </p>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-[13px] text-gray-300">Active Events</p>
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">0</h3>
                <p className="flex items-center text-[11px] mt-2 text-gray-400">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400 mr-0.5" />
                  <span className="text-emerald-400 font-medium mr-1.5">+0%</span>
                  active listings
                </p>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-[13px] text-gray-300">Total Revenue</p>
                <DollarSign className="w-4 h-4 text-gray-500" />
              </div>
              <div className="mt-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">0.00</h3>
                <p className="flex items-center text-[11px] mt-2 text-gray-400">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400 mr-0.5" />
                  <span className="text-emerald-400 font-medium mr-1.5">+0%</span>
                  from last month
                </p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10 flex-1 min-h-[420px] ml-5">
            {/* Revenue Overview Placeholder */}
            <div className="bg-[#100D18] border border-gray-800/60 rounded-xl p-6 lg:col-span-3 flex flex-col">
              <div className="mb-8 shrink-0">
                <h3 className="text-[17px] font-semibold text-gray-100">Revenue Overview</h3>
                <p className="text-[14px] text-gray-500 mt-1">Monthly revenue breakdown for the current year</p>
              </div>
              <div className="flex-1 w-full flex flex-col mt-4 min-h-[220px]">
                <div className="flex-1 relative border-b border-l border-gray-600/50 pb-2 pl-2">
                  <div className="absolute left-0 bottom-0 w-full flex justify-between px-2 text-[13px] text-gray-300 pb-1" style={{ bottom: '-35px' }}>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Jan</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Feb</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Mar</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Apr</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>May</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Jun</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Jul</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Aug</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Sep</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Oct</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Nov</span></div>
                    <div className="flex flex-col items-center"><div className="h-1.5 w-px bg-gray-600/50 mb-1"></div><span>Dec</span></div>
                  </div>
                  <div className="absolute -left-16 top-0 h-full flex flex-col justify-between text-[13px] text-gray-300 text-right pr-2">
                    <div className="flex items-center justify-end w-full"><span className="mr-1.5">100K</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0"></div></div>
                    <div className="flex items-center justify-end w-full"><span className="mr-1.5">75K</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0"></div></div>
                    <div className="flex items-center justify-end w-full"><span className="mr-1.5">50K</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0"></div></div>
                    <div className="flex items-center justify-end w-full"><span className="mr-1.5">25K</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0"></div></div>
                    <div className="flex items-center justify-end w-full mt-4"><span className="mr-1.5 translate-y-1">0</span><div className="w-1.5 h-px bg-gray-600/50 absolute right-0 bottom-0"></div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Distribution Placeholder */}
            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 lg:col-span-2 flex flex-col">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-100">User Distribution</h3>
                <p className="text-xs text-gray-400 mt-1">Ratio of Users vs Vendors</p>
              </div>
              <div className="flex-1 flex items-center justify-center relative mt-4">
                <div className="relative w-[180px] h-[180px]">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Background circle / Vendors 25% bg */}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#1f1a30" strokeWidth="26" />
                    {/* Vendors 25% slice */}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#000000" strokeWidth="30" strokeDasharray="50 165" className="opacity-70" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#4a2fb6" strokeWidth="26" strokeDasharray="55 165" />
                    {/* Foreground Users 75% */}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#000000" strokeWidth="30" strokeDasharray="3 220" strokeDashoffset="-55" />
                  </svg>
                </div>
              </div>
              <div className="mt-8 flex justify-between text-xs text-gray-400 px-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black border border-gray-700 block"></span>
                  Users (75%)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4a2fb6] block"></span>
                  Vendors (25%)
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
                  <p className="text-xs text-gray-400 mt-1">Latest registrations and bookings.</p>
                </div>
                <button className="text-xs text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-700/50 px-3 py-1.5 rounded-md border border-gray-700 transition-colors flex items-center gap-1">
                  View All <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto">
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
                    {/* Add dynamic activity rows here */}
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
                  <button className="w-full bg-gradient-to-r from-[#9333ea] to-[#4f46e5] hover:opacity-90 text-white rounded-lg p-3 flex border border-purple-500/20 items-center justify-between transition-all shadow-md shadow-purple-900/10">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-white opacity-90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                      <div className="text-left">
                        <p className="text-[13px] font-medium tracking-wide">Approve Vendors</p>
                        <p className="text-[10px] text-purple-200/90 mt-0.5">3 pending reviews</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-black/20 hover:bg-white/5 border border-transparent rounded-lg p-3 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <div className="text-left">
                        <p className="text-[13px] font-medium text-gray-200">Manage Events</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Review flagged listings</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-black/20 hover:bg-white/5 border border-transparent rounded-lg p-3 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <div className="text-left">
                        <p className="text-[13px] font-medium text-gray-200">User Reports</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">View recent tickets</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-black/20 hover:bg-white/5 border border-transparent rounded-lg p-3 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-indigo-400" />
                      <div className="text-left">
                        <p className="text-[13px] font-medium text-gray-200">System Status</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">All systems operational</p>
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