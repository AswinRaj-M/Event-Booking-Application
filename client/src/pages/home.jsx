import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Search, MapPin, Calendar, Clock, ArrowRight, Ticket, Star } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutUserThunk, logoutUserState } from '../features/user.slice';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    dispatch(logoutUserThunk());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 w-full overflow-hidden">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-semibold tracking-wide text-gray-300">
              Live Events Happening Now
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 mt-2 leading-[1.1]">
            <span className="text-white drop-shadow-lg">Discover Events.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 drop-shadow-xl">Book Experiences.</span>
          </h1>

          <p className="max-w-2xl text-gray-400 text-lg md:text-xl mb-10 leading-relaxed font-light">
            Find concerts, parties, workshops, and unforgettable moments near you. The world's best experiences are just a click away.
          </p>


          <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
            <button onClick={handleLogout}>logout</button>
            <Link to="#" className="px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Explore Events
            </Link>
            <Link to="/vendor/application" className="px-8 py-3.5 text-white font-medium hover:text-purple-400 transition-colors flex items-center gap-2 group">
              Become a Vendor <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-24 w-full max-w-4xl mx-auto border-t border-white/10 pt-12">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-md">0</span>
              <span className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest">Active Events</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-md">0</span>
              <span className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest">Users</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-md">0</span>
              <span className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest">Cities</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-md">0</span>
              <span className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest">Rating</span>
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
              <p className="text-gray-400">Find the perfect vibe for your next outing.</p>
            </div>
            <Link to="#" className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center gap-1 group">
              View all categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Music", color: "bg-purple-500", shadow: "shadow-purple-500/20" },
              { name: "Tech", color: "bg-blue-500", shadow: "shadow-blue-500/20" },
              { name: "Sports", color: "bg-green-500", shadow: "shadow-green-500/20" },
              { name: "Arts", color: "bg-pink-500", shadow: "shadow-pink-500/20" },
              { name: "Party", color: "bg-yellow-500", shadow: "shadow-yellow-500/20" },
              { name: "Culture", color: "bg-cyan-500", shadow: "shadow-cyan-500/20" },
            ].map((cat, i) => (
              <div key={i} className="bg-[#111] hover:bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:border-white/20 hover:-translate-y-1 shadow-lg">
                <div className={`w-3 h-3 rounded-full ${cat.color} mb-1 shadow-[0_0_10px_currentColor] ${cat.shadow}`} />
                <span className="font-medium text-sm text-gray-300">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>


        {/* Featured Events */}
        <section className="max-w-7xl mx-auto px-6 py-16 mb-16 relative">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-purple-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 drop-shadow-sm">Featured Events</h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-light">Hand-picked experiences we think you'll love. Don't miss out on these trending events.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Empty event cards (4)
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group flex flex-col h-full shadow-2xl hover:-translate-y-1">
                <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black w-full overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 z-10 transition-opacity group-hover:bg-black/20" />
                  <span className="text-gray-700 font-medium z-0">Image TBA</span>
                  <div className="absolute top-3 right-3 z-20 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold border border-white/10 shadow-lg text-white">
                    $0.00
                  </div>
                  <div className="absolute bottom-3 left-3 z-20">
                    <span className="bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)] text-white text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider">
                      Upcoming
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col z-20 bg-[#0A0A0A]">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-1">Event Title TBA</h3>
                    <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      0.0
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed font-light">Event details will be updated soon. Stay tuned for an unforgettable experience.</p>

                  <div className="mt-auto space-y-2.5 text-xs text-gray-400 mb-5 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Date TBA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>Location TBA</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-white/5 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-colors mt-auto border border-white/10 shadow-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))} */}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-b from-[#050505] to-[#0A0A0A] py-24 border-t border-white/5 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 inset-x-0 h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-3 text-white">How It Works</h2>
              <p className="text-gray-400 font-light">Your journey to unforgettable experiences in three simple steps.</p>
            </div>

            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-black border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative group transition-transform hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping blur-sm" />
                    <Search className="w-8 h-8 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Browse Events</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed font-light">Explore thousands of events by local artists, tech giants, and communities.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-black border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative group transition-transform hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping blur-sm" style={{ animationDelay: '500ms' }} />
                    <Ticket className="w-8 h-8 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Book Tickets</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed font-light">Secure your spot instantly and get fast, secure booking guarantees.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-black border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative group transition-transform hover:scale-105">
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping blur-sm" style={{ animationDelay: '1000ms' }} />
                    <Star className="w-8 h-8 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Enjoy the Experience</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed font-light">Show up, make memories, and share your experiences with friends.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;