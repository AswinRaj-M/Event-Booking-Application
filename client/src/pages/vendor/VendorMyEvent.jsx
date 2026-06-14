import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  ChevronDown, 
  FileText, 
  MoreHorizontal,
  Bell
} from 'lucide-react';
import VendorSidebar from '../../components/vendor/VendorSidebar';

// Asset imports
import portfolio3 from '../../assets/vendor/portfolio_3.png';
import avatarImg from '../../assets/vendor/common_avatar.png';

const VendorMyEvent = () => {
  // State for filters & search interactivity
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Custom mock data for the 4 events shown in the photo
  const events = [
    {
      id: 1,
      title: 'Future Tech Summit 2024',
      description: 'Explore the future of AI and Robotics',
      category: 'Technology',
      price: '$299',
      date: 'Oct 15, 2024 • 09:00 AM',
      location: 'Convention Center, San Francisco',
      status: 'upcoming',
      ticketsSold: 1240,
      totalSeats: 1500,
      progress: 82,
      hasImage: false,
      actions: ['edit', 'toggle']
    },
    {
      id: 2,
      title: 'Neon Nights Festival',
      description: 'Electronic music under the stars',
      category: 'Music',
      price: '$120',
      date: 'Nov 12, 2024 • 06:00 PM',
      location: 'Waterfront Park, Miami',
      status: 'upcoming',
      ticketsSold: 4500,
      totalSeats: 5000,
      progress: 90,
      hasImage: false,
      actions: ['edit', 'toggle', 'more']
    },
    {
      id: 3,
      title: 'Modern Abstract Showcase',
      description: 'Featuring local contemporary artists',
      category: 'Art Gallery',
      price: '$45',
      date: 'Sep 20, 2024 • 05:00 PM',
      location: 'Downtown Gallery, NY',
      status: 'completed',
      statusMsg: 'Event concluded successfully',
      statusMsgColor: 'bg-emerald-500',
      hasImage: true,
      image: portfolio3,
      actions: ['report', 'delete']
    },
    {
      id: 4,
      title: 'Summer Park Meetup',
      description: 'Annual community gathering',
      category: 'Community',
      price: 'Free',
      date: 'Aug 10, 2024 • 11:00 AM',
      location: 'Central Park, Area 5',
      status: 'cancelled',
      statusMsg: 'Cancelled due to weather',
      statusMsgColor: 'bg-rose-500',
      hasImage: false,
      actions: ['edit', 'delete']
    }
  ];

  // Optional local toggle state for demo
  const [activeToggles, setActiveToggles] = useState({ 1: true, 2: true });

  const handleToggle = (id) => {
    setActiveToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter logic
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-[#070514] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <VendorSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Breadcrumb Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="hover:text-zinc-200 transition-colors cursor-pointer">My Events</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-zinc-400 hover:text-white transition-all bg-white/5 rounded-full border border-white/10 cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#070514]" />
            </button>
            {/* User Profile Info */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <div className="text-right">
                <p className="text-xs font-bold text-white">Alex Morgan</p>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Pro Organizer</p>
              </div>
              <div className="w-9 h-9 rounded-full border border-purple-500/20 overflow-hidden bg-zinc-950">
                <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Manage Events Title Row */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Manage Events</h1>
            <p className="text-sm text-zinc-400">View and manage your published events.</p>
          </div>
          <Link to="/vendor/create-event">
            <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)] cursor-pointer">
              <Plus className="w-4.5 h-4.5" />
              Create New Event
            </button>
          </Link>
        </div>

        {/* Search and Filter Panel */}
        <div className="bg-[#0B0A11] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search events by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12101F] text-white placeholder-zinc-600 pl-11 pr-4 py-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
            />
          </div>

          {/* Filters Select Dropdowns */}
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#12101F] text-white px-4 py-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>

            <div className="relative w-full md:w-44">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#12101F] text-white px-4 py-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-sm"
              >
                <option value="all">All Categories</option>
                <option value="technology">Technology</option>
                <option value="music">Music</option>
                <option value="art gallery">Art Gallery</option>
                <option value="community">Community</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Events Cards Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              // Status Styling
              let statusColor = 'bg-emerald-500';
              let statusText = 'Upcoming';
              let statusBadgeBg = 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400';
              
              if (event.status === 'completed') {
                statusColor = 'bg-zinc-500';
                statusText = 'Completed';
                statusBadgeBg = 'bg-zinc-900 border-zinc-800 text-zinc-400';
              } else if (event.status === 'cancelled') {
                statusColor = 'bg-rose-500';
                statusText = 'Cancelled';
                statusBadgeBg = 'bg-rose-950/30 border-rose-500/20 text-rose-400';
              }

              return (
                <div 
                  key={event.id}
                  className="bg-[#0B0A11] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.05)] transition-all flex flex-col h-full group"
                >
                  {/* Card Banner Section (Image or Empty Grid Pattern) */}
                  <div className="relative h-44 w-full bg-[#12101F] border-b border-white/5 overflow-hidden">
                    {event.hasImage ? (
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[radial-gradient(#1E1B4B_1px,transparent_1px)] [background-size:16px_16px] opacity-60 flex items-center justify-center bg-gradient-to-br from-[#12101F] to-[#0D0A24]" />
                    )}

                    {/* Status Badge top right */}
                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${statusBadgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                      {statusText}
                    </div>

                    {/* Category (bottom left) & Price (bottom right) */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <span className="px-2.5 py-1 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-[10px] font-bold text-zinc-300 rounded-lg uppercase tracking-wide">
                        {event.category}
                      </span>
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg ${event.price === 'Free' ? 'bg-indigo-600/90 border border-indigo-500/30 text-white' : 'bg-purple-600/90 border border-purple-500/30 text-white'}`}>
                        {event.price}
                      </span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-purple-400 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                          {event.description}
                        </p>
                      </div>

                      {/* Details Rows */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-medium">
                          <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-medium">
                          <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        {/* Sold out parameters / progress bar OR status message */}
                        {event.status === 'upcoming' ? (
                          <div className="space-y-2 pt-1.5">
                            <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-medium">
                              <Ticket className="w-4 h-4 text-purple-400 shrink-0" />
                              <span>{event.ticketsSold.toLocaleString()} / {event.totalSeats.toLocaleString()} sold</span>
                            </div>
                            {/* Simple beautiful progress slider */}
                            <div className="w-full h-1.5 bg-zinc-900 border border-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full" 
                                style={{ width: `${event.progress}%` }} 
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-xs pt-1.5">
                            <span className={`w-2 h-2 rounded-full ${event.statusMsgColor}`} />
                            <span className="text-zinc-400 font-semibold">{event.statusMsg}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions block */}
                    <div className="flex gap-3 pt-5 border-t border-white/5 mt-6 items-center justify-between">
                      {/* Report button */}
                      {event.actions.includes('report') && (
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                          <FileText className="w-3.5 h-3.5 text-zinc-400" />
                          View Report
                        </button>
                      )}

                      {/* Edit button */}
                      {event.actions.includes('edit') && (
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                          <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                          Edit
                        </button>
                      )}

                      {/* Active Toggle */}
                      {event.actions.includes('toggle') && (
                        <button 
                          type="button"
                          onClick={() => handleToggle(event.id)}
                          className={`w-9 h-5 rounded-full transition-all relative p-0.5 cursor-pointer shrink-0 ${activeToggles[event.id] ? 'bg-purple-600' : 'bg-zinc-800'}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white transition-all block ${activeToggles[event.id] ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      )}

                      {/* More button */}
                      {event.actions.includes('more') && (
                        <button type="button" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete button */}
                      {event.actions.includes('delete') && (
                        <button type="button" className="p-2.5 bg-white/5 hover:bg-rose-950/20 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0B0A11] border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-zinc-500 text-sm font-semibold">No events found matching your search criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorMyEvent;
