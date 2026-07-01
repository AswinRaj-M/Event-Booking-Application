import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, PlusCircle, Calendar, CalendarDays, Users } from 'lucide-react';
import VendorSidebar from '../../components/vendor/VendorSidebar';
import { getVendorEventsApi } from '../../services/vendor.api';

const VendorHome = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getVendorEventsApi();
        if (response.data && response.data.success) {
          setEvents(response.data.events || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Calculate metrics
  const totalEvents = events.length;
  
  const totalBookings = events.reduce((sum, e) => sum + (e.soldTickets || 0), 0);
  
  const upcomingEvents = events.filter(e => {
    if (e.eventStatus === 'cancelled' || e.eventStatus === 'draft' || e.eventStatus === 'completed') {
      return false;
    }
    if (e.schedule?.date) {
      const eventDate = new Date(e.schedule.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate >= today) return true;
    }
    return e.eventStatus === 'pending';
  }).length;
  
  const totalEarnings = events.reduce((sum, e) => sum + ((e.soldTickets || 0) * (e.ticketPrice || 0)), 0);


  const currentYear = new Date().getFullYear();

  // Revenue analytics by month for the current year
  const monthlyRevenue = Array(12).fill(0);
  events.forEach(e => {
    if (e.schedule?.date) {
      const d = new Date(e.schedule.date);
      if (d.getFullYear() === currentYear) {
        const month = d.getMonth();
        monthlyRevenue[month] += (e.soldTickets || 0) * (e.ticketPrice || 0);
      }
    }
  });

  const maxRevenue = Math.max(...monthlyRevenue, 100);
  const pointsCount = monthlyRevenue.length;
  const svgWidth = 1000;
  const svgHeight = 300;
  
  // Calculate SVG line points
  const points = monthlyRevenue.map((rev, i) => {
    const x = (i / (pointsCount - 1)) * svgWidth;
    const y = svgHeight - (rev / maxRevenue) * (svgHeight - 60) - 30; // 30px padding top/bottom
    return { x, y };
  });
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = points.length ? `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z` : '';

  // Booking trends by day of the week
  const weeklyBookings = Array(7).fill(0); // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  events.forEach(e => {
    if (e.schedule?.date) {
      const d = new Date(e.schedule.date);
      const day = d.getDay();
      weeklyBookings[day] += (e.soldTickets || 0);
    }
  });
  const maxWeeklyBookings = Math.max(...weeklyBookings, 10);
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#070514] text-white font-sans items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm font-medium animate-pulse">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

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
            <Link to="/vendor/create-event">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer">
                <PlusCircle className="w-4 h-4" />
                Create Event
              </button>
            </Link>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Events */}
          <div className="bg-[#0B0A11] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Total Events</span>
                <span className="text-3xl font-bold">{totalEvents}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-500 text-xs font-semibold">Events listed</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-[#0B0A11] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Total Bookings</span>
                <span className="text-3xl font-bold">{totalBookings}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-500 text-xs font-semibold">Active attendees</span>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-[#0B0A11] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Upcoming Events</span>
                <span className="text-3xl font-bold">{upcomingEvents}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-500 text-xs font-semibold">Scheduled listings</span>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-[#0B0A11] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">Total Earnings</span>
                <span className="text-3xl font-bold">${totalEarnings.toLocaleString()}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450">
                <span className="font-bold text-lg text-emerald-450">$</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-500 text-xs font-semibold">Sales revenue</span>
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
            <p className="text-xs text-gray-500 mb-6">Monthly earnings performance for current year ({currentYear})</p>

            {/* Graph Layout */}
            <div className="flex-1 relative border-l border-b border-white/10 flex items-end ml-10 mb-6 mr-4">
              {/* Y axis labels */}
              <div className="absolute -left-10 bottom-0 top-0 flex flex-col justify-between text-[10px] text-gray-500 py-1 text-right pr-2">
                <span>${maxRevenue.toLocaleString()}</span>
                <span>${Math.round(maxRevenue * 0.75).toLocaleString()}</span>
                <span>${Math.round(maxRevenue * 0.5).toLocaleString()}</span>
                <span>${Math.round(maxRevenue * 0.25).toLocaleString()}</span>
                <span>$0</span>
              </div>

              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-full border-b border-white/5" />
                ))}
              </div>

              {/* SVG Graph line */}
              {points.length > 0 && (
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
                  <defs>
                    <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {areaD && <path d={areaD} fill="url(#glowGradient)" />}
                  {pathD && <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
              )}

              {/* X axis labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
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
                <Link to="/vendor/create-event" className="block w-full">
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_15px_rgba(139,92,246,0.2)] cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <PlusCircle className="w-3 h-3 text-white" />
                    </div>
                    Create New Event
                  </button>
                </Link>

                <Link to="/vendor/events" className="block w-full">
                  <button className="w-full flex items-center gap-3 py-3 px-4 bg-transparent hover:bg-white/5 text-white/90 text-sm font-medium rounded-xl transition-colors text-left cursor-pointer">
                    <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                    View All Events
                  </button>
                </Link>

                <button className="w-full flex items-center gap-3 py-3 px-4 bg-transparent hover:bg-white/5 text-white/90 text-sm font-medium rounded-xl transition-colors text-left cursor-pointer">
                  <Users className="w-4 h-4 text-gray-400" />
                  Manage Attendees
                </button>
              </div>
            </div>

            {/* Booking Trends Bar Chart */}
            <div className="bg-[#0B0A11] p-6 rounded-2xl border border-white/5 flex-1 shadow-lg flex flex-col justify-between">
              <h3 className="font-bold text-white mb-4">Booking Trends</h3>

              <div className="flex items-end justify-between h-36 mt-auto border-b border-white/10 pb-2">
                {weeklyBookings.map((count, index) => {
                  const percent = (count / maxWeeklyBookings) * 100;
                  const heightPercent = count > 0 ? Math.max(percent, 8) : 4;
                  return (
                    <div 
                      key={index} 
                      style={{ height: `${heightPercent}%` }}
                      className="w-6 bg-indigo-500 hover:bg-purple-500 rounded-t-md transition-all group relative cursor-pointer"
                    >
                      {/* Tooltip showing actual bookings count */}
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-950/90 text-white text-[10px] px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {count} booking{count !== 1 ? 's' : ''}
                      </span>
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-semibold">
                        {daysOfWeek[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="h-4" /> {/* Spacer for X axis label padding */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorHome;