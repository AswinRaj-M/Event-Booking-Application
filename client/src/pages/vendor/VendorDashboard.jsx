import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, PlusCircle, Calendar, CalendarDays, Users } from 'lucide-react';
import { vendorLogoutState } from '../../features/vendorSlice';
import VendorSidebar from '../../components/vendor/VendorSidebar';
import { ROUTES } from '../../constants/routes';

const VendorHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(vendorLogoutState());
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="flex min-h-screen bg-[#070514] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <VendorSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="w-3 h-3 border-2 border-gray-400 rounded-sm" />
            </div>
            <h1 className="text-xl font-bold tracking-wide">Vendor Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full border border-white/10">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#070514]" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <PlusCircle className="w-4 h-4" />
              Create Event
            </button>
            <button onClick={handleLogout} className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Events */}
          <div className="bg-[#0B0A11] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Total Events</span>
                <span className="text-3xl font-bold">0</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-500 text-xs font-semibold">+0 this month</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-[#0B0A11] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Total Bookings</span>
                <span className="text-3xl font-bold">0</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-500 text-xs font-semibold">+0% vs last month</span>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-[#0B0A11] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Upcoming Events</span>
                <span className="text-3xl font-bold">0</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-gray-500 text-xs">Next: None</span>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-[#0B0A11] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Total Earnings</span>
                <span className="text-3xl font-bold">$0</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <span className="font-bold text-lg">$</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-500 text-xs font-semibold">+0.0% growth</span>
            </div>
          </div>
        </div>

        {/* Dashboard Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue Analytics Graph Area */}
          <div className="lg:col-span-2 bg-[#0B0A11] p-6 rounded-2xl border border-white/5 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded bg-indigo-500" />
              <h3 className="font-bold text-white tracking-wide">Revenue Analytics</h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">Monthly earnings performance for current year</p>

            {/* Mock Graph Layout */}
            <div className="flex-1 relative border-l border-b border-white/10 flex items-end ml-8 mb-4">
              {/* Y axis labels */}
              <div className="absolute -left-8 bottom-0 top-0 flex flex-col justify-between text-[10px] text-gray-500 py-1">
                <span>400</span>
                <span>300</span>
                <span>200</span>
                <span>100</span>
                <span>0</span>
              </div>

              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-full border-b border-white/5" />
                ))}
              </div>

              {/* SVG Graph line - Simulated curve */}
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
                {/* Graph data empty */}
              </svg>

              {/* X axis labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-gray-500">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </div>
          </div>

          {/* Right Side Column */}
          <div className="flex flex-col gap-6">
            {/* Quick Actions */}
            <div className="bg-[#110D1E] p-6 rounded-2xl border border-white/5 shadow-lg">
              <h3 className="font-bold text-white mb-2">Quick Actions</h3>
              <p className="text-xs text-gray-400 mb-6">Manage your events efficiently</p>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_15px_rgba(139,92,246,0.2)]">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <PlusCircle className="w-3 h-3 text-white" />
                  </div>
                  Create New Event
                </button>

                <button className="w-full flex items-center gap-3 py-3 px-4 bg-transparent hover:bg-white/5 text-white/90 text-sm font-medium rounded-xl transition-colors">
                  <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                  View All Events
                </button>

                <button className="w-full flex items-center gap-3 py-3 px-4 bg-transparent hover:bg-white/5 text-white/90 text-sm font-medium rounded-xl transition-colors">
                  <Users className="w-4 h-4 text-gray-400" />
                  Manage Attendees
                </button>
              </div>
            </div>

            {/* Booking Trends Bar Chart */}
            <div className="bg-[#0B0A11] p-6 rounded-2xl border border-white/5 flex-1 shadow-lg">
              <h3 className="font-bold text-white mb-8">Booking Trends</h3>

              <div className="flex items-end justify-between h-32 mt-auto border-b border-white/10 pb-2">
                {/* Simulated Bars */}
                <div className="w-6 bg-indigo-500 rounded-t-sm h-[20%] group relative">
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">M</span>
                </div>
                <div className="w-6 bg-indigo-500 rounded-t-sm h-[30%] group relative">
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">T</span>
                </div>
                <div className="w-6 bg-indigo-500 rounded-t-sm h-[40%] group relative">
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">W</span>
                </div>
                <div className="w-6 bg-indigo-500 rounded-t-sm h-[35%] group relative">
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">T</span>
                </div>
                <div className="w-6 bg-indigo-500 rounded-t-sm h-[60%] group relative">
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">F</span>
                </div>
                <div className="w-6 bg-indigo-500 rounded-t-sm h-[80%] group relative">
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">S</span>
                </div>
                <div className="w-6 bg-indigo-500 rounded-t-sm h-[50%] group relative">
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">S</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorHome;