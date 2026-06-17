import React, { useState, useMemo } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Search, MapPin, Calendar, Music, RotateCcw, ArrowRight } from 'lucide-react';

const initialEvents = [
  {
    id: 1,
    title: "Neon Nights Festival",
    category: "Music",
    date: "SAT, AUG 12 • 8:00 PM",
    month: "August",
    location: "Brooklyn Mirage, New York",
    city: "New York",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop",
    attendees: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
    ],
    attendingCount: "+2.4k attending",
    priceLabel: "Starting from",
    price: "$120",
    buttonText: "View Details"
  },
  {
    id: 2,
    title: "Future AI Summit 2024",
    category: "Technology",
    date: "WED, SEP 24 • 9:00 AM",
    month: "September",
    location: "Moscone Center, SF",
    city: "San Francisco",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop",
    attendees: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
    ],
    attendingCount: "+850 attending",
    priceLabel: "Registration",
    price: "$499",
    buttonText: "View Details"
  },
  {
    id: 3,
    title: "Founders & Funders",
    category: "Networking",
    date: "THU, OCT 05 • 8:30 PM",
    month: "October",
    location: "SoHo House, London",
    city: "London",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop",
    attendees: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60"
    ],
    attendingCount: "+120 attending",
    priceLabel: "Entry",
    price: "Free",
    buttonText: "RSVP Now"
  },
  {
    id: 4,
    title: "Abstract Minds Exhibit",
    category: "Art & Culture",
    date: "SUN, NOV 12 • 11:00 AM",
    month: "November",
    location: "MOMA, New York",
    city: "New York",
    description: "Experience the latest in contemporary abstract art from emerging global artists.",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop",
    attendees: [],
    priceLabel: "General",
    price: "$35",
    buttonText: "View Details"
  },
  {
    id: 5,
    title: "City Charity Marathon",
    category: "Sports",
    date: "SUN, DEC 03 • 6:00 AM",
    month: "December",
    location: "Central Park, NY",
    city: "New York",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format&fit=crop",
    attendees: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
    ],
    attendingCount: "+1.2k attending",
    priceLabel: "Registration",
    price: "$45",
    buttonText: "Register"
  },
  {
    id: 6,
    title: "Electric Dreams Party",
    category: "Music",
    date: "SAT, DEC 09 • 10:00 PM",
    month: "December",
    location: "Warehouse District, LA",
    city: "Los Angeles",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
    attendees: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
    ],
    attendingCount: "+1.8k attending",
    priceLabel: "Early Bird",
    price: "$85",
    buttonText: "View Details"
  },
  {
    id: 7,
    title: "Street Food Festival",
    category: "Food & Drink",
    date: "SAT, NOV 18 • 12:00 PM",
    month: "November",
    location: "Pier 17, New York",
    city: "New York",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
    attendees: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60"
    ],
    attendingCount: "+3.1k attending",
    priceLabel: "Entry",
    price: "Free",
    buttonText: "RSVP Now"
  },
  {
    id: 8,
    title: "Jazz Under the",
    category: "Music",
    date: "FRI, OCT 20 • 9:00 PM",
    month: "October",
    location: "Blue Note, New York",
    city: "New York",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop",
    attendees: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
    ],
    attendingCount: "+580 attending",
    priceLabel: "Tickets from",
    price: "$65",
    buttonText: "View Details"
  },
  {
    id: 9,
    title: "Web3 Developer Workshop",
    category: "Technology",
    date: "FRI, SEP 15 • 2:00 PM",
    month: "September",
    location: "Tech Hub, Austin",
    city: "Austin",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop",
    attendees: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60"
    ],
    attendingCount: "+340 attending",
    priceLabel: "Workshop Fee",
    price: "$89",
    buttonText: "View Details"
  }
];

const categoryBadgeStyles = {
  "Music": "bg-purple-950/65 text-purple-300 border border-purple-500/20",
  "Technology": "bg-blue-950/65 text-blue-300 border border-blue-500/20",
  "Networking": "bg-emerald-950/65 text-emerald-300 border border-emerald-500/20",
  "Art & Culture": "bg-rose-950/65 text-rose-300 border border-rose-500/20",
  "Sports": "bg-amber-950/65 text-amber-300 border border-amber-500/20",
  "Food & Drink": "bg-orange-950/65 text-orange-300 border border-orange-500/20"
};

const UserExploreEvent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const filteredEvents = useMemo(() => {
    return initialEvents.filter(event => {
      const matchesSearch = searchQuery === "" || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "" || 
        event.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLocation = selectedLocation === "" || 
        event.city.toLowerCase() === selectedLocation.toLowerCase();

      const matchesDate = selectedDate === "" || 
        event.month.toLowerCase() === selectedDate.toLowerCase();

      return matchesSearch && matchesCategory && matchesLocation && matchesDate;
    });
  }, [searchQuery, selectedCategory, selectedLocation, selectedDate]);

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
                  <option value="Music">Music</option>
                  <option value="Technology">Technology</option>
                  <option value="Networking">Networking</option>
                  <option value="Art & Culture">Art & Culture</option>
                  <option value="Sports">Sports</option>
                  <option value="Food & Drink">Food & Drink</option>
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
                  <option value="New York">New York</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="London">London</option>
                  <option value="Los Angeles">Los Angeles</option>
                  <option value="Austin">Austin</option>
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
                  <option value="August">August 2026</option>
                  <option value="September">September 2026</option>
                  <option value="October">October 2026</option>
                  <option value="November">November 2026</option>
                  <option value="December">December 2026</option>
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

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group bg-[#0b0914]/60 hover:bg-[#0c0a1c]/90 border border-white/5 hover:border-purple-500/20 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
            >
              {/* Event Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Badge Overlay */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${categoryBadgeStyles[event.category] || 'bg-zinc-800 text-zinc-300'}`}>
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Event Details Content */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  {/* Date & Time */}
                  <span className="text-purple-400 text-xs font-bold uppercase tracking-wider block mb-2.5">
                    {event.date}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-purple-300 transition-colors line-clamp-1">
                    {event.title}
                  </h3>

                  {/* Optional Description */}
                  {event.description && (
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2 leading-relaxed font-light">
                      {event.description}
                    </p>
                  )}

                  {/* Location info */}
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-4">
                    <MapPin className="w-3.5 h-3.5 text-purple-400/80" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>

                <div>
                  {/* Attendee avatars list if present */}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex -space-x-2.5 overflow-hidden">
                        {event.attendees.map((avatar, idx) => (
                          <img
                            key={idx}
                            src={avatar}
                            alt="Attendee"
                            className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-[#0b0914] object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-zinc-500 text-xs font-medium">
                        {event.attendingCount}
                      </span>
                    </div>
                  )}

                  {/* Card Separator */}
                  <div className="border-t border-purple-950/40 my-4.5" />

                  {/* Footer (Price & CTA Button) */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                        {event.priceLabel}
                      </span>
                      <span className="text-white font-extrabold text-lg mt-0.5">
                        {event.price}
                      </span>
                    </div>

                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all cursor-pointer">
                      {event.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserExploreEvent;
