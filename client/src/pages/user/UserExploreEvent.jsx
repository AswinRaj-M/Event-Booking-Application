import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Search, MapPin, Calendar, Music, RotateCcw, ArrowRight, Users, ArrowUpDown } from 'lucide-react';
import { getExploreEvents } from '../../services/user.api.js';
import { getAllCategories } from '../../services/common.api.js';





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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [categoriesList, setCategoriesList] = useState([]);
  const [sortBy, setSortBy] = useState("newest");

  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        if (response.data?.success) {
          setCategoriesList(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getExploreEvents({
          search: debouncedSearch,
          category: selectedCategory,
          date: selectedDate,
          page: currentPage,
          limit: 9,
          sortBy
        });
        if (response.data?.success) {
          setEvents(response.data.events || []);
          setTotalPages(response.data.totalPages || 1);
          setTotalResults(response.data.totalEvents || 0);
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
  }, [debouncedSearch, selectedCategory, selectedDate, currentPage, sortBy]);

  const categories = useMemo(() => {
    return categoriesList.map(c => c.name);
  }, [categoriesList]);

  const filteredEvents = events;

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDate("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
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
              <div className="lg:col-span-5 relative">
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
                  onChange={handleCategoryChange}
                  className="w-full bg-[#110d21]/80 border border-purple-900/30 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 appearance-none cursor-pointer transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
              </div>

              {/* Date Select (Calendar) */}
              <div className="lg:col-span-2 relative">
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-[#110d21]/80 border border-purple-900/30 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors cursor-pointer select-none"
                />
              </div>

              {/* Sort By */}
              <div className="lg:col-span-3 relative">
                <ArrowUpDown className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full bg-[#110d21]/80 border border-purple-900/30 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 appearance-none cursor-pointer transition-colors"
                >
                  <option value="newest">Sort By: Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
              </div>
            </div>

            {/* Filter Meta Info */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-purple-950/40 text-xs md:text-sm text-zinc-400">
              <div>
                Showing <span className="text-purple-400 font-semibold">{totalResults}</span> results
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
              const priceLabel = event.ticketType === "Free" ? "Entry" : "Admission";
              const priceVal = event.ticketType === "Free" ? "Free" : "Paid";

              // Show description if it exists (like Abstract Minds Exhibit in screenshot)
              // Otherwise render stack of avatars and attendee text
              const hasDescription = !!event.description;

              // Generate deterministic attendee count for beautiful mock-up display
              const attendingCountNum = event.soldTickets || (Math.floor((new Date(event.createdAt || Date.now()).getTime() % 1500)) + 80);
              const formattedAttending = attendingCountNum >= 1000 
                ? `+${(attendingCountNum / 1000).toFixed(1)}k attending` 
                : `+${attendingCountNum} attending`;

              return (
                <Link
                  key={event._id}
                  to={`/user/event/${event._id}`}
                  className="group bg-[#0b0914]/60 hover:bg-[#0c0a1c]/90 border border-white/5 hover:border-purple-500/20 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full text-left"
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
                      <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md bg-purple-950/80 text-purple-300 border border-purple-500/20">
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
                      <div className="block group-hover:underline decoration-purple-500 decoration-2 underline-offset-4">
                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-purple-300 transition-colors line-clamp-1" title={event.title}>
                          {event.title}
                        </h3>
                      </div>

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
                        <div className="flex items-center gap-1.5 mb-6">
                          <Users className="w-3.5 h-3.5 text-purple-400/60" />
                          <span className="text-zinc-500 text-xs font-medium">
                            {formattedAttending}
                          </span>
                        </div>
                      )}

                      {/* Card Separator */}
                      <div className="border-t border-purple-950/40 my-4.5" />

                      {/* Footer (Price Only) */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                            {priceLabel}
                          </span>
                          <span className={`${
                            priceVal === "Free" ? "text-emerald-400" : "text-purple-400"
                          } font-extrabold text-lg mt-0.5`}>
                            {priceVal}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 relative z-10">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#0b0914] border border-purple-500/15 text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:text-zinc-400 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-1"
            >
              ◀ Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                  currentPage === p
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-purple-500/35'
                    : 'bg-[#0b0914] border border-purple-500/15 text-zinc-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#0b0914] border border-purple-500/15 text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:text-zinc-400 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-1"
            >
              Next ▶
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UserExploreEvent;
