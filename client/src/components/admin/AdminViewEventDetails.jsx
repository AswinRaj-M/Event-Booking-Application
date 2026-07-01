import React from 'react';
import { X, Calendar, MapPin } from 'lucide-react';
import avatarImg from '../../assets/vendor/common_avatar.png';

const AdminViewEventDetails = ({ isOpen, selectedEvent, onClose }) => {
  if (!isOpen || !selectedEvent) return null;

  // Helper mapper utilities
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#151221] border border-gray-800 w-full max-w-2xl rounded-2xl overflow-hidden relative text-white font-sans shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Image Header Section */}
        <div className="relative h-56 w-full bg-[#1A182E] flex items-center justify-center border-b border-gray-850">
          {selectedEvent.thumbnail?.fileUrl ? (
            <img 
              src={selectedEvent.thumbnail.fileUrl} 
              alt={selectedEvent.title}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] font-bold text-sm">
              Image not available
            </div>
          )}

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg border border-white/10 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Status Overlay */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="px-2.5 py-1 bg-purple-600/90 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide">
              {selectedEvent.category?.name || 'Uncategorized'}
            </span>
            <span className="px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide border border-white/10">
              {getEventStatusText(selectedEvent.eventStatus)}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="flex justify-between items-start gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white leading-tight">
                {selectedEvent.title}
              </h2>
              <span className={`${
                getEventPriceText(selectedEvent) === 'Free' ? 'text-emerald-400' : 'text-purple-400'
              } text-2xl font-extrabold shrink-0`}>
                {getEventPriceText(selectedEvent)}
              </span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">
              {selectedEvent.description || 'No description provided.'}
            </p>
          </div>

          {/* Organizer Row */}
          <div className="bg-[#0B0914] p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={getOrganizerAvatar(selectedEvent)} 
                alt={getOrganizerName(selectedEvent)}
                className="w-10 h-10 rounded-full object-cover border border-gray-700 bg-zinc-800" 
              />
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">{getOrganizerName(selectedEvent)}</h4>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Host Organizer</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-lg uppercase tracking-wide">
              {getOrganizerRole(selectedEvent)} Account
            </span>
          </div>

          {/* Event Schedule & Location Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0B0914] p-4 rounded-xl border border-gray-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date & Time</span>
              </div>
              <p className="text-xs text-zinc-300">{getFormattedDate(selectedEvent)}</p>
            </div>

            <div className="bg-[#0B0914] p-4 rounded-xl border border-gray-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location</span>
              </div>
              <p className="text-xs text-zinc-300 truncate">{getFormattedLocation(selectedEvent)}</p>
            </div>
          </div>

          {/* Ticket Tiers Section */}
          {selectedEvent.ticketType !== 'Free' && selectedEvent.ticketTiers && selectedEvent.ticketTiers.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Ticket Tiers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedEvent.ticketTiers.map((tier, idx) => (
                  <div key={idx} className="bg-[#0B0914] border border-gray-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-white text-sm">{tier.name}</span>
                      <span className="text-purple-400 text-sm font-extrabold">${tier.price}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 flex justify-between">
                      <span>Capacity: {tier.capacity}</span>
                      <span>Sold: {tier.sold || 0}</span>
                    </div>
                    {tier.benefits && tier.benefits.length > 0 && (
                      <div className="pt-2 border-t border-gray-800/60">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1 font-semibold">Benefits:</span>
                        <ul className="space-y-1">
                          {tier.benefits.map((benefit, bIdx) => (
                            <li key={bIdx} className="text-[10px] text-zinc-300 flex items-start gap-1">
                              <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0B0914] border-t border-gray-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminViewEventDetails;
