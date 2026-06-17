import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Search, MapPin, Calendar, Music, RotateCcw, ArrowRight } from 'lucide-react';
import { getExploreEvents } from '../../services/user.api.js';

const categoryBadgeStyles = {
  "Music": "bg-purple-950/65 text-purple-300 border border-purple-500/20",
  "Technology": "bg-blue-950/65 text-blue-300 border border-blue-500/20",
  "Networking": "bg-emerald-950/65 text-emerald-300 border border-emerald-500/20",
  "Art & Culture": "bg-rose-950/65 text-rose-300 border border-rose-500/20",
  "Sports": "bg-amber-950/65 text-amber-300 border border-amber-500/20",
  "Food & Drink": "bg-orange-950/65 text-orange-300 border border-orange-500/20"
};

const mockAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
];

const formatEventDate = (dateString, startTime) => {
  if (!dateString) return "Date TBA";
  try {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('en-US', options).toUpperCase();
    return `${formattedDate} • ${startTime || 'TBA'}`;
  } catch (e) {
    return "Date TBA";
  }
};

const UserExploreEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getExploreEvents();
        if (response.data?.success) {
          setEvents(response.data.events || []);
        } else {
          setError("Failed to fetch events data.");
        }
      } catch (err) {
        console.error("Explore events fetch error:", err);
        setError("Something went wrong while fetching events.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Compute unique filter options from real data
  const categories = useMemo(() => {
    const set = new Set();
    events.forEach(e => {
      const name = e.category?.name || (typeof e.category === 'string' ? e.category : '');
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [events]);

  const locations = useMemo(() => {
    const set = new Set();
    events.forEach(e => {
      if (e.city) set.add(e.city);
    });
    return Array.from(set);
  }, [events]);

  const dates = useMemo(() => {
    const set = new Set();
    events.forEach(e => {
      if (e.schedule?.date) {
        try {
          const monthName = new Date(e.schedule.date).toLocaleDateString('en-US', { month: 'long' });
          set.add(monthName);
        } catch (_) {}
      }
    });
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const title = event.title || "";
      const venue = event.venue || "";
      const city = event.city || "";
      const matchesSearch = searchQuery === "" || 
        title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const catName = event.category?.name || (typeof event.category === 'string' ? event.category : "");
      const matchesCategory = selectedCategory === "" || 
        catName.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLocation = selectedLocation === "" || 
        city.toLowerCase() === selectedLocation.toLowerCase();

      let matchesDate = selectedDate === "";
      if (!matchesDate && event.schedule?.date) {
        try {
          const m = new Date(event.schedule.date).toLocaleDateString('en-US', { month: 'long' });
          matchesDate = m.toLowerCase() === selectedDate.toLowerCase();
        } catch (_) {}
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesDate;
    });
  }, [events, searchQuery, selectedCategory, selectedLocation, selectedDate]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSelectedDate("");
  };

  return (
    <div className="min-h-screen bg-[#05050C] text-white font-sans selection:bg-purple-500/30 w-full overflow-hidden flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full relative">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[500px] -left-20 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Heading Section */}
        <div className="text-center mt-6 mb-12 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-violet-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">Events</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-4 max-w-lg mx-auto font-medium leading-relaxed">
            Discover unforgettable experiences by category, location, and date.
          </p>
          <div className="w-16 h-[3px] bg-gradient-to-r from-purple-500 to-fuchsia-500 mx-auto mt-6 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
        </div>

        {/* Filter Bar Panel */}
        <div className="mb-8 relative z-20">
          <div className="bg-[#0b0914]/80 border border-purple-500/15 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
              {/* Search */}
              <div className="lg:col-span-4 relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#110d21]/80 border border-purple-900/30 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder-zinc-500 transition-colors"
                />
              </div>

              {/* Categories */}
              <div className="lg:col-span-2 relative">
                <Music className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#110d21]/80 border border-purple-900/30 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 appearance-none cursor-pointer transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
              </div>

              {/* Location */}
              <div className="lg:col-span-2 relative">
                <MapPin className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-[#110d21]/80 border border-purple-900/30 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 appearance-none cursor-pointer transition-colors"
                >
                  <option value="">Location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
              </div>

              {/* Date Select */}
              <div className="lg:col-span-3 relative">
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#110d21]/80 border border-purple-900/30 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 appearance-none cursor-pointer transition-colors"
                >
                  <option value="">Select Date</option>
                  {dates.map((m) => (
                    <option key={m} value={m}>{m} 2026</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
              </div>

              {/* Submit Button */}
              <div className="lg:col-span-1 flex justify-end sm:justify-start lg:justify-center">
                <button 
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 flex items-center justify-center text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.35)] cursor-pointer"
                  title="Search"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Meta Info */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-purple-950/40 text-xs md:text-sm text-zinc-400">
              <div>
                Showing <span className="text-purple-400 font-semibold">{filteredEvents.length}</span> results
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading Spinner / Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div
                key={sk}
                className="bg-[#0b0914]/40 border border-white/5 rounded-3xl overflow-hidden h-[450px] animate-pulse flex flex-col justify-between p-6"
              >
                <div className="w-full h-44 bg-zinc-800/60 rounded-2xl mb-4" />
                <div className="space-y-3 flex-grow">
                  <div className="h-4 w-1/3 bg-zinc-800/60 rounded" />
                  <div className="h-6 w-3/4 bg-zinc-800/60 rounded" />
                  <div className="h-4 w-5/6 bg-zinc-800/60 rounded" />
                </div>
                <div className="pt-4 border-t border-purple-950/30 flex justify-between items-center">
                  <div className="space-y-1.5 w-1/3">
                    <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
                    <div className="h-5 w-3/4 bg-zinc-800/60 rounded" />
                  </div>
                  <div className="h-10 w-24 bg-zinc-800/60 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {!loading && error && (
          <div className="text-center py-20 relative z-10">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              Retry
            </button>
          </div>
        )}

        {/* No Events Found */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="text-center py-24 relative z-10 bg-[#0b0914]/20 border border-white/5 rounded-3xl p-8 max-w-lg mx-auto">
            <p className="text-zinc-500 text-base mb-6">No events match your selected filters.</p>
            <button
              onClick={handleResetFilters}
              className="bg-[#110d21] border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-500/50 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {filteredEvents.map((event) => {
              const categoryName = event.category?.name || (typeof event.category === 'string' ? event.category : 'General');
              const imageSrc = event.thumbnail?.fileUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop";
              const priceLabel = event.ticketType === "Free" ? "Entry" : "Starting from";
              const priceVal = event.ticketType === "Free" ? "Free" : `$${event.ticketPrice || 0}`;
              const buttonText = event.ticketType === "Free" ? "RSVP Now" : "View Details";

              // Show description if it exists (like Abstract Minds Exhibit in screenshot)
              // Otherwise render stack of avatars and attendee text
              const hasDescription = !!event.description;

              // Generate deterministic attendee count for beautiful mock-up display
              const attendingCountNum = event.soldTickets || (Math.floor((new Date(event.createdAt || Date.now()).getTime() % 1500)) + 80);
              const formattedAttending = attendingCountNum >= 1000 
                ? `+${(attendingCountNum / 1000).toFixed(1)}k attending` 
                : `+${attendingCountNum} attending`;

              return (
                <div
                  key={event._id}
                  className="group bg-[#0b0914]/60 hover:bg-[#0c0a1c]/90 border border-white/5 hover:border-purple-500/20 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Event Image */}
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Badge Overlay */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${categoryBadgeStyles[categoryName] || 'bg-zinc-800 text-zinc-300'}`}>
                        {categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Event Details Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Date & Time */}
                      <span className="text-purple-400 text-xs font-bold uppercase tracking-wider block mb-2.5">
                        {formatEventDate(event.schedule?.date, event.schedule?.startTime)}
                      </span>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-purple-300 transition-colors line-clamp-1" title={event.title}>
                        {event.title}
                      </h3>

                      {/* Description (if present) */}
                      {hasDescription && (
                        <p className="text-zinc-400 text-sm mb-4 line-clamp-2 leading-relaxed font-light">
                          {event.description}
                        </p>
                      )}

                      {/* Location info */}
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-4">
                        <MapPin className="w-3.5 h-3.5 text-purple-400/80" />
                        <span className="line-clamp-1">{event.venue}, {event.city}</span>
                      </div>
                    </div>

                    <div>
                      {/* Render attendee avatars or skip depending on description visibility */}
                      {!hasDescription && (
                        <div className="flex items-center gap-2 mb-6">
                          <div className="flex -space-x-2.5 overflow-hidden">
                            {mockAvatars.map((avatar, idx) => (
                              <img
                                key={idx}
                                src={avatar}
                                alt="Attendee"
                                className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-[#0b0914] object-cover"
                              />
                            ))}
                          </div>
                          <span className="text-zinc-500 text-xs font-medium">
                            {formattedAttending}
                          </span>
                        </div>
                      )}

                      {/* Card Separator */}
                      <div className="border-t border-purple-950/40 my-4.5" />

                      {/* Footer (Price & CTA Button) */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                            {priceLabel}
                          </span>
                          <span className="text-white font-extrabold text-lg mt-0.5">
                            {priceVal}
                          </span>
                        </div>

                        <button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all cursor-pointer">
                          {buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UserExploreEvent;
