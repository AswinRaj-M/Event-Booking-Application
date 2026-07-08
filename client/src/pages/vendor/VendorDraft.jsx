import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Search,
  ChevronDown,
  Trash2,
  Bell,
  SlidersHorizontal,
  Layout,
  PlusCircle,
  FileQuestion
} from 'lucide-react';

import VendorSidebar from '../../components/vendor/VendorSidebar';
import { getVendorEventsApi, deleteEventApi, updateEventApi } from '../../services/vendor.api';
import VendorEditEventModal from '../../components/vendor/VendorEditEvent.Modal';
import { VENDOR_ROUTES } from '../../constants/Routes';
import avatarImg from '../../assets/vendor/common_avatar.png';

const VendorDraft = () => {
  const vendor = useSelector((state) => state.vendor?.vendor);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'alpha'
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await getVendorEventsApi();
      if (response.data && response.data.success) {
        const allEvents = response.data.events || [];
        const draftEvents = allEvents.filter(event => event.eventStatus === 'draft');
        setDrafts(draftEvents);
      } else {
        toast.error(response.data?.message || 'Failed to fetch draft events');
      }
    } catch (error) {
      console.error('Error fetching draft events:', error);
      toast.error('Failed to load draft events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDeleteDraft = async (id) => {
    if (!window.confirm("Are you sure you want to delete this draft event?")) {
      return;
    }

    try {
      const response = await deleteEventApi(id);
      if (response.data && response.data.success) {
        toast.success("Draft deleted successfully");
        setDrafts(prev => prev.filter(item => item._id !== id));
      } else {
        toast.error(response.data?.message || "Failed to delete draft");
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error(error.response?.data?.message || "Failed to delete draft");
    }
  };

  const handlePublishDraft = async (event) => {
    // Check if event has all required fields to publish
    if (!event.title || !event.description || !event.category || !event.schedule?.date || 
        !event.venue || !event.city || !event.state || !event.totalTickets || !event.thumbnail?.fileUrl) {
      
      toast.error("Please fill in all required fields in the edit modal before publishing");
      setSelectedEvent({ id: event._id, rawEvent: event });
      setIsEditModalOpen(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('eventStatus', 'pending');
      
      const response = await updateEventApi(event._id, formData);
      if (response.data && response.data.success) {
        toast.success("Draft published successfully! (Pending Admin approval)");
        setDrafts(prev => prev.filter(item => item._id !== event._id));
      } else {
        toast.error(response.data?.message || "Failed to publish draft");
      }
    } catch (error) {
      console.error("Error publishing draft:", error);
      toast.error(error.response?.data?.message || "Failed to publish draft");
    }
  };

  const handleEditClick = (event) => {
    setSelectedEvent({ id: event._id, rawEvent: event });
    setIsEditModalOpen(true);
  };

  const handleEventUpdated = (updatedEvent) => {
    if (updatedEvent.eventStatus !== 'draft') {
      setDrafts(prev => prev.filter(item => item._id !== updatedEvent._id));
      toast.success("Event published successfully!");
    } else {
      setDrafts(prev => prev.map(item => item._id === updatedEvent._id ? updatedEvent : item));
      toast.success("Draft updated successfully!");
    }
  };

  const formatDateRange = (dateStr) => {
    if (!dateStr) return 'No Date Set';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'No Date Set';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };

  const calculateProgress = (event) => {
    let progress = 15;
    if (event.description && event.description.trim()) progress += 15;
    if (event.category) progress += 15;
    if (event.schedule?.date) progress += 15;
    if (event.venue && event.venue.trim()) progress += 15;
    if (event.totalTickets && event.totalTickets > 0) progress += 15;
    if (event.thumbnail?.fileUrl) progress += 10;
    return Math.min(progress, 100);
  };

  const filteredDrafts = drafts
    .filter(draft => {
      const title = draft.title || '';
      const desc = draft.description || '';
      return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             desc.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      } else if (sortBy === 'alpha') {
        const titleA = a.title || '';
        const titleB = b.title || '';
        return titleA.localeCompare(titleB);
      }
      return 0;
    });

  return (
    <div className="flex min-h-screen bg-[#070514] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <VendorSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <button className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1.5 bg-white/5 border border-white/10 rounded-lg">
              <Layout className="w-4.5 h-4.5 text-purple-400" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 hover:text-zinc-300 cursor-pointer">Events</span>
              <span className="text-zinc-600">/</span>
              <span className="text-white font-semibold">Drafts</span>
            </div>
          </div>
          <button className="relative p-2 text-zinc-400 hover:text-white transition-all bg-white/5 rounded-full border border-white/10 cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
          </button>
        </div>

        {/* Title Row */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Draft Events</h1>
            <p className="text-sm text-zinc-400">Manage your unpublished events before they go live.</p>
          </div>
          <Link to={VENDOR_ROUTES.CREATE_EVENT}>
            <button className="flex items-center gap-2 px-5 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)] cursor-pointer">
              <PlusCircle className="w-4.5 h-4.5" />
              Create New Event
            </button>
          </Link>
        </div>

        {/* Search & Filter Panel */}
        <div className="bg-[#0B0A11] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search drafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12101F] text-white placeholder-zinc-600 pl-11 pr-4 py-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
            />
          </div>

          {/* Sort and Filters */}
          <div className="flex gap-4 w-full md:w-auto items-center justify-end">
            <div className="relative w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#12101F] text-white px-4 py-3 pr-10 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-sm font-medium"
              >
                <option value="newest">Newest Updated</option>
                <option value="oldest">Oldest Updated</option>
                <option value="alpha">Alphabetical</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>

            <button className="p-3 bg-[#12101F] hover:bg-[#1D1936] text-zinc-400 hover:text-white rounded-xl border border-zinc-800/80 transition-all cursor-pointer">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Draft Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0B0A11] border border-white/5 rounded-2xl w-full animate-pulse">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-400 text-sm font-medium">Loading draft events...</p>
          </div>
        ) : filteredDrafts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrafts.map((draft) => {
              const progress = calculateProgress(draft);
              const hasImage = !!draft.thumbnail?.fileUrl;

              return (
                <div 
                  key={draft._id}
                  className="bg-[#0B0A11] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.05)] transition-all flex flex-col h-full group"
                >
                  {/* Card Image Area */}
                  <div className="relative h-48 w-full bg-white flex items-center justify-center border-b border-white/5 overflow-hidden">
                    {hasImage ? (
                      <img 
                        src={draft.thumbnail.fileUrl} 
                        alt={draft.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="text-[#9CA3AF] font-bold text-sm select-none">Image not available</div>
                    )}

                    {/* Category pill left, Draft status right */}
                    <div className="absolute top-4 left-4">
                      <span className="px-2.5 py-1 bg-[#1F2937] text-white text-[10px] font-bold rounded-lg uppercase tracking-wide">
                        {draft.category?.name || 'Uncategorized'}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 bg-[#FEF3C7] text-[#D97706] text-[10px] font-extrabold rounded-lg uppercase tracking-wide border border-[#FDE68A]">
                        Draft
                      </span>
                    </div>
                  </div>

                  {/* Card Details Area */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Title & relative updated text */}
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-purple-400 transition-colors">
                          {draft.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Last updated {getRelativeTime(draft.updatedAt)}</span>
                        </div>
                      </div>

                      {/* Icon Rows */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-medium">
                          <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{formatDateRange(draft.schedule?.date)}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-medium">
                          <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="truncate">
                            {draft.venue ? `${draft.venue}, ${draft.city || ''}` : 'Location not set'}
                          </span>
                        </div>

                        {/* Completeness bar */}
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            <span>Completeness</span>
                            <span className="text-amber-500">{progress}% Complete</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-900 border border-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex gap-3 pt-5 border-t border-white/5 mt-6 items-center justify-between">
                      {/* Edit Button */}
                      <button 
                        type="button" 
                        onClick={() => handleEditClick(draft)}
                        className="flex-1 py-2.5 px-4 bg-[#12101F] hover:bg-[#1D1936] border border-zinc-800/80 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                      >
                        Edit
                      </button>

                      {/* Publish Button */}
                      <button 
                        type="button" 
                        onClick={() => handlePublishDraft(draft)}
                        className="flex-1 py-2.5 px-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-[0_0_15px_rgba(139,92,246,0.25)]"
                      >
                        Publish
                      </button>

                      {/* Delete trash button */}
                      <button 
                        type="button" 
                        onClick={() => handleDeleteDraft(draft._id)}
                        className="p-2.5 bg-transparent hover:bg-rose-950/20 border border-transparent hover:border-rose-500/25 text-zinc-500 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0B0A11] border border-white/5 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileQuestion className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">No draft events found</h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                Any events you save as draft during the event creation process will show up here.
              </p>
            </div>
            <Link to={VENDOR_ROUTES.CREATE_EVENT} className="mt-2">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1C1A30] hover:bg-[#252245] text-white text-xs font-bold rounded-xl border border-purple-500/20 transition-all cursor-pointer">
                Create New Event
              </button>
            </Link>
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

export default VendorDraft;
