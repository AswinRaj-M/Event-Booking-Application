import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Calendar,
  MapPin,
  Search,
  ChevronDown,
  Bell,
  Sidebar,
  PlusCircle,
  Filter,
  Ban,
  X,
  Clock
} from 'lucide-react';

import AdminSidebar from '../../components/admin/AdminSidebar';
import { fetchAllEventsAdmin, toggleBlockEventApi } from '../../services/admin.api';
import { getAllCategories } from '../../services/common.api';
import avatarImg from '../../assets/vendor/common_avatar.png';
import AdminReasonSending from '../../components/admin/adminReasonSending';
import AdminViewEventDetails from '../../components/admin/AdminViewEventDetails';

const AdminEventManagement = () => {
  const adminState = useSelector((state) => state.admin);

  // States
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockingEvent, setBlockingEvent] = useState(null);

  
  useEffect(() => {
    const getInitialData = async () => {
      try {
        setLoading(true);
        const eventsRes = await fetchAllEventsAdmin();
        if (eventsRes.data && eventsRes.data.success) {
          setEvents(eventsRes.data.events || []);
        }

        const catsRes = await getAllCategories();
        if (catsRes.data && catsRes.data.success) {
          setCategories(catsRes.data.data || []);
        }
      } catch (error) {
        console.error("Error loading events database:", error);
        toast.error("Failed to load platform events data");
      } finally {
        setLoading(false);
      }
    };
    getInitialData();
  }, []);

  const executeToggleBlock = async (event, reason) => {
    try {
      const response = await toggleBlockEventApi(event._id, { reason });
      if (response.data && response.data.success) {
        const updatedEvent = response.data.event;
        setEvents(prev => prev.map(item => item._id === event._id ? updatedEvent : item));
        toast.success(`Event has been ${updatedEvent.isBlocked ? 'blocked' : 'unblocked'} successfully.`, { position: 'bottom-center' });
      }
    } catch (error) {
      console.error("Failed to toggle block status:", error);
      toast.error(error.response?.data?.message || "Failed to update event block status", { position: 'bottom-center' });
    }
  };

  const handleToggleBlockEvent = (event) => {
    const action = event.isBlocked ? 'unblock' : 'block';

    if (action === 'block') {
      setBlockingEvent(event);
      setIsBlockModalOpen(true);
    } else {
      const toastId = toast((t) => (
        <div className="flex flex-col gap-3 p-1 text-white">
          <p className="text-xs font-semibold">
            Are you sure you want to unblock "{event.title}"?
          </p>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={async () => {
                toast.dismiss(toastId);
                await executeToggleBlock(event, '');
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer border-none"
            >
              Unblock
            </button>
            <button 
              onClick={() => toast.dismiss(toastId)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer border-none"
            >
              Cancel
            </button>
          </div>
        </div>
      ), {
        position: 'bottom-center',
        duration: Infinity,
      });
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Field mapper utilities
  const getEventStatusText = (status) => {
    if (status === 'pending') return 'Upcoming';
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    return status;
  };

  const getEventPriceText = (event) => {
    return event.ticketType === 'Free' ? 'Free' : 'Paid';
  };

  const getOrganizerName = (event) => {
    if (event.vendorId) {
      return event.vendorId.organizerName || event.vendorId.businessName || 'Platform Vendor';
    }
    return 'Festivo Admin';
  };

  const getOrganizerRole = (event) => {
    if (event.vendorId) {
      return event.vendorId.role === 'vendor' ? 'Vendor' : 'Admin';
    }
    return 'Admin';
  };

  const getOrganizerAvatar = (event) => {
    return event.vendorId?.profilePicture?.fileUrl || avatarImg;
  };

  const getFormattedDate = (event) => {
    if (!event.schedule?.date) return 'N/A';
    const d = new Date(event.schedule.date);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${d.toLocaleDateString('en-US', options)}${event.schedule.startTime ? ' • ' + event.schedule.startTime : ''}`;
  };

  const getFormattedLocation = (event) => {
    if (!event.venue) return 'Location not set';
    return `${event.venue}, ${event.city || ''}`;
  };

  // Perform multi criteria filtering on real database items
  const filteredEvents = events.filter(event => {
    const title = event.title || '';
    const organizerName = getOrganizerName(event);
    const location = getFormattedLocation(event);
    
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const statusText = getEventStatusText(event.eventStatus);
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter.toLowerCase() === 'blocked') {
        matchesStatus = !!event.isBlocked;
      } else {
        matchesStatus = !event.isBlocked && statusText.toLowerCase() === statusFilter.toLowerCase();
      }
    }
    
    const categoryName = event.category?.name || 'Uncategorized';
    const matchesCategory = categoryFilter === 'all' || categoryName.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-800 bg-[#0B0914] shrink-0">
          <div className="flex items-center text-gray-400 text-sm select-none">
            <Sidebar className="w-5 h-5 mr-4 text-gray-500 cursor-pointer hover:text-white" />
            <span>Management</span>
            <span className="mx-2 text-gray-600">&gt;</span>
            <span className="text-purple-400 font-medium">Events</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full border border-white/10 cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-purple-500 ring-2 ring-[#0B0914]" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Layout Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col min-h-0 scrollbar-hide">
          {/* Page Heading Title Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">All Events</h1>
              <p className="text-sm text-zinc-400">Manage and monitor all platform events</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)] cursor-pointer">
              <PlusCircle className="w-4.5 h-4.5" />
              <span>create coupon</span>
            </button>
          </div>

          {/* Filters Panel Row */}
          <div className="bg-[#151221] border border-gray-800/80 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between mb-8 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search by event name, organizer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0914] text-white placeholder-zinc-600 pl-11 pr-4 py-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              />
            </div>

            {/* Dropdown Selects */}
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              {/* Status Selector */}
              <div className="relative">
                <Filter className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0B0914] text-white pl-10 pr-10 py-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-sm min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Blocked">Blocked</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>

              {/* Categories Selector */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#0B0914] text-white px-4 py-3 pr-10 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-sm min-w-[150px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#151221] border border-white/5 rounded-2xl w-full">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-zinc-400 text-sm font-medium">Loading events from database...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const statusText = getEventStatusText(event.eventStatus);
                const isUpcoming = statusText === 'Upcoming';
                const isCompleted = statusText === 'Completed';
                const isCancelled = statusText === 'Cancelled';
                
                let statusBadgeColor = 'bg-[#8B5CF6]/95 border-purple-500/20 text-white';
                if (isCompleted) {
                  statusBadgeColor = 'bg-[#059669]/95 border-emerald-500/20 text-white';
                } else if (isCancelled) {
                  statusBadgeColor = 'bg-[#DC2626]/95 border-red-500/20 text-white';
                }

                const hasImage = !!event.thumbnail?.fileUrl;

                return (
                  <div 
                    key={event._id}
                    className="bg-[#151221] border border-gray-800/80 rounded-2xl overflow-hidden hover:border-purple-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.05)] transition-all flex flex-col h-full group"
                  >
                    {/* Card Banner Image Section */}
                    <div className="relative h-48 w-full bg-[#1A182E] flex items-center justify-center border-b border-gray-800/50 overflow-hidden">
                      {hasImage ? (
                        <img 
                          src={event.thumbnail.fileUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full bg-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] font-bold text-sm select-none">
                          Image not available
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4">
                        <span className="px-2.5 py-1 bg-[#1F2937]/90 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide">
                          {event.category?.name || 'Uncategorized'}
                        </span>
                      </div>

                      <div className="absolute top-4 right-4">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wide border ${statusBadgeColor}`}>
                          {statusText}
                        </span>
                      </div>
                    </div>

                    {/* Card Body Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Title and Price */}
                        <div className="flex justify-between items-start gap-2">
                          <h3 className={`text-lg font-bold leading-snug group-hover:text-purple-400 transition-colors ${
                            event.isBlocked ? 'text-red-400 line-through' : 'text-white'
                          }`}>
                            {event.title}
                          </h3>
                          <span className={`${
                            getEventPriceText(event) === 'Free' ? 'text-emerald-400' : 'text-purple-400'
                          } text-lg font-bold shrink-0`}>
                            {getEventPriceText(event)}
                          </span>
                        </div>

                        {/* Organizer Row */}
                        <div className="flex items-center gap-3 bg-[#0B0914]/40 p-2 rounded-xl border border-gray-800/30">
                          <img 
                            src={getOrganizerAvatar(event)} 
                            alt={getOrganizerName(event)}
                            className="w-8 h-8 rounded-full object-cover border border-gray-700 bg-zinc-800" 
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-300">{getOrganizerName(event)}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide border ${
                              getOrganizerRole(event) === 'Admin'
                                ? 'bg-purple-950/30 text-purple-400 border-purple-500/20'
                                : 'bg-blue-950/30 text-blue-400 border-blue-500/20'
                            }`}>
                              {getOrganizerRole(event)}
                            </span>
                          </div>
                        </div>

                        {/* Details Rows */}
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-medium">
                            <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>{getFormattedDate(event)}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-medium">
                            <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="truncate">{getFormattedLocation(event)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions Block */}
                      <div className="flex gap-3 pt-5 border-t border-gray-800/80 mt-6 items-center justify-between">
                        {isUpcoming ? (
                          <>
                            <button 
                              type="button" 
                              onClick={() => handleViewDetails(event)}
                              className="flex-1 py-2.5 px-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-[0_0_15px_rgba(139,92,246,0.25)]"
                            >
                              View Event Details
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleToggleBlockEvent(event)}
                              className={`flex items-center gap-1.5 py-2.5 px-3 border transition-all cursor-pointer rounded-xl text-xs font-bold ${
                                event.isBlocked
                                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                  : 'bg-[#0B0914] border-gray-800/80 hover:border-red-500/30 text-gray-400 hover:text-red-400'
                              }`}
                              title={event.isBlocked ? "Unblock Event" : "Block Event"}
                            >
                              <Ban className="w-4 h-4" />
                              <span>{event.isBlocked ? 'Unblock' : 'Block'}</span>
                            </button>
                          </>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => handleViewDetails(event)}
                            className="w-full py-2.5 px-4 bg-[#1F2937]/35 hover:bg-[#1F2937]/60 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                          >
                            View Summary
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#151221] border border-gray-800/80 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-4">
              <p className="text-zinc-500 text-sm font-semibold">No platform events match your current filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail & Summary Modal Overlay */}
      <AdminViewEventDetails
        isOpen={isModalOpen}
        selectedEvent={selectedEvent}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
      />      <AdminReasonSending
        isOpen={isBlockModalOpen}
        eventTitle={blockingEvent?.title || ''}
        onClose={() => {
          setIsBlockModalOpen(false);
          setBlockingEvent(null);
        }}
        onSubmit={async (reason) => {
          const eventToBlock = blockingEvent;
          setIsBlockModalOpen(false);
          setBlockingEvent(null);
          await executeToggleBlock(eventToBlock, reason);
        }}
      />
    </div>
  );
};

export default AdminEventManagement;
