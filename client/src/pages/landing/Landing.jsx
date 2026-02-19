import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar.jsx";
import logo from "../../assets/logo.jpeg";

const LandingPage = () => {
  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Hero Section */}
        <header className="relative pt-32 pb-20 w-full text-center z-10">

          {/* Background Image for Hero Section */}
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-60 pointer-events-none"
            style={{
              backgroundImage: `url('https://weezevent.com/wp-content/uploads/2019/01/12145054/organiser-soiree.jpg')`, // Party/Event Theme
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))'
            }}
          />

          <div className="max-w-5xl mx-auto px-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-medium">
                The Future of Live Events
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 relative">
              Discover, Create & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Experience Events
              </span>
              <br />
              Like Never Before
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 relative">
              Your one-stop platform to explore trending concerts, festivals, and workshops,
              or host unforgettable experiences for your own audience.
            </p>
          </div>

        </header>

        {/* Cards Section */}
        <main className="flex-grow max-w-4xl mx-auto grid md:grid-cols-2 gap-8 px-6 pb-20">

          {/* User Card */}
          <div className="group relative bg-gradient-to-b from-indigo-900/40 to-black border border-white/10 p-10 rounded-3xl text-center backdrop-blur-md hover:border-purple-500/30 transition-all duration-300 min-h-[450px] flex flex-col justify-center">
            <div className="absolute inset-0 bg-purple-600/5 rounded-3xl group-hover:bg-purple-600/10 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Continue as User</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                Browse exclusive events, book tickets instantly, and immerse yourself in amazing experiences curated just for you.
              </p>
              <Link to="/signup">
                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20">
                  Explore Events <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Vendor Card */}
          <div className="group relative bg-gradient-to-b from-pink-900/20 to-black border border-white/10 p-10 rounded-3xl text-center backdrop-blur-md hover:border-pink-500/30 transition-all duration-300 min-h-[450px] flex flex-col justify-center">
            <div className="absolute inset-0 bg-pink-600/5 rounded-3xl group-hover:bg-pink-600/10 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-900/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Continue as Vendor</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                Create stunning event pages, manage ticket sales, and grow your audience with powerful hosting tools.
              </p>
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2">
                Host an Event
              </button>
            </div>
          </div>

        </main>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto w-full px-6 py-12 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start p-4 hover:bg-white/5 rounded-2xl transition">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center flex-shrink-0 text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Secure Booking</h4>
                <p className="text-sm text-gray-500">Encrypted transactions & instant confirmation</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 hover:bg-white/5 rounded-2xl transition">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center flex-shrink-0 text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Verified Vendors</h4>
                <p className="text-sm text-gray-500">Trusted organizers vetted by our team</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 hover:bg-white/5 rounded-2xl transition">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center flex-shrink-0 text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Real-Time Management</h4>
                <p className="text-sm text-gray-500">Live analytics & check-in tools</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Festivo Logo" className="w-6 h-6 rounded-full object-cover" />
              <span className="font-bold text-sm">Festivo</span>
            </div>
            <p className="text-gray-600 text-xs">© 2024 Festivo Inc. All rights reserved.</p>
            <div className="flex gap-6 text-gray-600 text-xs">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Settings</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;
