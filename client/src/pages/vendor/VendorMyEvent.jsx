import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
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
import { getVendorEventsApi, cancelEventApi, fetchCategories, deleteEventApi } from '../../services/vendor.api';
import VendorEditEventModal from '../../components/vendor/VendorEditEvent.Modal';

import portfolio3 from '../../assets/vendor/portfolio_3.png';
import avatarImg from '../../assets/vendor/common_avatar.png';

const VendorMyEvent = () => {
  const vendor = useSelector((state) => state.vendor?.vendor);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [priceFilter, setPriceFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getVendorEventsApi();
        if (response.data && response.data.success) {
          const fetchedEvents = (response.data.events || []).filter(event => event.eventStatus !== 'draft');
          
          const formatted = fetchedEvents.map(event => {
            const priceStr = event.ticketType === 'Free' ? 'Free' : 'Paid';
            
            let formattedDate = 'N/A';
            if (event.schedule?.date) {
              const d = new Date(event.schedule.date);
              const options = { month: 'short', day: 'numeric', year: 'numeric' };
              formattedDate = `${d.toLocaleDateString('en-US', options)} • ${event.schedule.startTime || ''}`;
            }

            const locationStr = `${event.venue || ''}, ${event.city || ''}`;
            const statusStr = event.eventStatus === 'pending' ? 'upcoming' : event.eventStatus;
            const tSold = event.soldTickets || 0;
            const tTotal = event.totalTickets || 0;
            const progressVal = tTotal > 0 ? Math.round((tSold / tTotal) * 100) : 0;
            
            let actionsList = ['edit', 'cancel'];
            if (statusStr === 'completed') {
              actionsList = ['report', 'delete'];
            } else if (statusStr === 'cancelled') {
              actionsList = ['edit', 'delete'];
            }

            return {
              id: event._id,
              title: event.title,
              description: event.description,
              category: event.category?.name || 'Uncategorized',
              price: priceStr,
              date: formattedDate,
              location: locationStr,
              status: statusStr,
              ticketsSold: tSold,
              totalSeats: tTotal,
              progress: progressVal,
              hasImage: !!event.thumbnail?.fileUrl,
              image: event.thumbnail?.fileUrl || '',
              actions: actionsList,
              statusMsg: statusStr === 'completed' ? 'Event concluded successfully' : statusStr === 'cancelled' ? (event.blockedReason || 'Event cancelled') : '',
              statusMsgColor: statusStr === 'completed' ? 'bg-emerald-500' : 'bg-rose-500',
              rawEvent: event
            };
          });

          setEvents(formatted);
        } else {
          toast.error(response.data?.message || 'Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching vendor events:', error);
        toast.error('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetchCategories();
        if (response.data && response.data.success) {
          setCategories(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    getCategories();
  }, []);

  const handleCancelEvent = (id) => {
    const toastId = toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-xs font-semibold text-white">Are you sure you want to cancel this event?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              toast.dismiss(toastId);
              proceedCancelEvent(id);
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
          >
            Yes
          </button>
          <button 
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
          >
            No
          </button>
        </div>
      </div>
    ), {
      position: 'bottom-center',
      duration: Infinity,
    });
  };

  const proceedCancelEvent = async (id) => {
    try {
      const response = await cancelEventApi(id);
      if (response.data && response.data.success) {
        toast.success("Event cancelled successfully", { position: 'bottom-center' });
        setEvents(prevEvents => 
          prevEvents.map(e => {
            if (e.id === id) {
              return {
                ...e,
                status: 'cancelled',
                actions: ['edit', 'delete'],
                statusMsg: 'Event cancelled',
                statusMsgColor: 'bg-rose-500'
              };
            }
            return e;
          })
        );
      } else {
        toast.error(response.data?.message || "Failed to cancel event", { position: 'bottom-center' });
      }
    } catch (error) {
      console.error("Error cancelling event:", error);
      toast.error(error.response?.data?.message || "Failed to cancel event", { position: 'bottom-center' });
    }
  };

  const handleDeleteEvent = (id) => {
    const toastId = toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-xs font-semibold text-white">Are you sure you want to delete this event?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              toast.dismiss(toastId);
              proceedDeleteEvent(id);
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
          >
            Yes
          </button>
          <button 
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
          >
            No
          </button>
        </div>
      </div>
    ), {
      position: 'bottom-center',
      duration: Infinity,
    });
  };

  const proceedDeleteEvent = async (id) => {
    try {
      const response = await deleteEventApi(id);
      if (response.data && response.data.success) {
        toast.success("Event deleted successfully", { position: 'bottom-center' });
        setEvents(prevEvents => prevEvents.filter(e => e.id !== id));
      } else {
        toast.error(response.data?.message || "Failed to delete event", { position: 'bottom-center' });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.response?.data?.message || "Failed to delete event", { position: 'bottom-center' });
    }
  };

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleEventUpdated = (updatedEvent) => {
    setEvents(prevEvents => 
      prevEvents.map(e => {
        if (e.id === updatedEvent._id) {
          const priceStr = updatedEvent.ticketType === 'Free' ? 'Free' : 'Paid';
          
          let formattedDate = 'N/A';
          if (updatedEvent.schedule?.date) {
            const d = new Date(updatedEvent.schedule.date);
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            formattedDate = `${d.toLocaleDateString('en-US', options)} • ${updatedEvent.schedule.startTime || ''}`;
          }

          const locationStr = `${updatedEvent.venue || ''}, ${updatedEvent.city || ''}`;
          const statusStr = updatedEvent.eventStatus === 'pending' ? 'upcoming' : updatedEvent.eventStatus;
          const tSold = updatedEvent.soldTickets || 0;
          const tTotal = updatedEvent.totalTickets || 0;
          const progressVal = tTotal > 0 ? Math.round((tSold / tTotal) * 100) : 0;
          
          let actionsList = ['edit', 'cancel'];
          if (statusStr === 'completed') {
            actionsList = ['report', 'delete'];
          } else if (statusStr === 'cancelled') {
            actionsList = ['edit', 'delete'];
          }

          return {
            id: updatedEvent._id,
            title: updatedEvent.title,
            description: updatedEvent.description,
            category: updatedEvent.category?.name || 'Uncategorized',
            price: priceStr,
            date: formattedDate,
            location: locationStr,
            status: statusStr,
            ticketsSold: tSold,
            totalSeats: tTotal,
            progress: progressVal,
            hasImage: !!updatedEvent.thumbnail?.fileUrl,
            image: updatedEvent.thumbnail?.fileUrl || '',
            actions: actionsList,
            statusMsg: statusStr === 'completed' ? 'Event concluded successfully' : statusStr === 'cancelled' ? (updatedEvent.blockedReason || 'Event cancelled') : '',
            statusMsgColor: statusStr === 'completed' ? 'bg-emerald-500' : 'bg-rose-500',
            rawEvent: updatedEvent
          };
        }
        return e;
      })
    );
  };


  
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesPrice = priceFilter === 'all' || 
                         (priceFilter === 'free' && event.price === 'Free') || 
                         (priceFilter === 'paid' && event.price !== 'Free');
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPrice;
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
                <p className="text-xs font-bold text-white">{vendor?.organizerName || 'Alex Morgan'}</p>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Pro Organizer</p>
              </div>
              <div className="w-9 h-9 rounded-full border border-purple-500/20 overflow-hidden bg-zinc-950">
                <img src={vendor?.profilePicture?.fileUrl || avatarImg} alt="Avatar" className="w-full h-full object-cover" />
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
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name.toLowerCase()}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>

            <div className="relative w-full md:w-44">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full bg-[#12101F] text-white px-4 py-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-sm"
              >
                <option value="all">All Ticket Types</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Events Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0B0A11] border border-white/5 rounded-2xl w-full">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-400 text-sm font-medium">Loading your events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
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
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg ${
                        event.price === 'Free' 
                          ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-purple-950/80 border border-purple-500/20 text-purple-400'
                      }`}>
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
                        <button 
                          type="button" 
                          onClick={() => handleEditClick(event)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                          Edit
                        </button>
                      )}

                      {/* Cancel Event button */}
                      {event.actions.includes('cancel') && (
                        <button 
                          type="button" 
                          onClick={() => handleCancelEvent(event.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Cancel Event
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
                        <button 
                          type="button" 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2.5 bg-white/5 hover:bg-rose-950/20 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                        >
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
      <VendorEditEventModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        event={selectedEvent} 
        onUpdate={handleEventUpdated} 
      />
    </div>
  );
};

export default VendorMyEvent;
