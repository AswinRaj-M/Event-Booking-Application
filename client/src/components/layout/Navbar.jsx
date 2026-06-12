import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, ArrowRight } from "lucide-react";
import logo from "../../assets/logo.jpeg";

const Navbar = () => {
    const [activeMenu, setActiveMenu] = useState(() => {
        const path = window.location.pathname;
        const hash = window.location.hash;
        if (path.includes("/profile")) return "Profile";
        if (path.includes("/home")) return "Home";
        if (hash.includes("bookings")) return "My Bookings";
        if (hash.includes("browse")) return "Browse Events";
        if (hash.includes("about")) return "About Us";
        return "Home";
    });

    const menuItems = [
        { name: "Browse Events", path: "#browse" },
        { name: "My Bookings", path: "#My Bookings" },
        { name: "Home", path: "/user/home" },
        { name: "Profile", path: "/user/profile" },
        { name: "About Us", path: "#about" }
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md transition-all duration-300 border-b border-white/5 py-4 px-6 md:px-10 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <img
                    src={logo}
                    alt="Festivo Logo"
                    className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-white font-bold text-xl tracking-wide hidden sm:block">Festivo</span>
            </div>

            {/* Desktop Links (Center Pill) */}
            <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-full p-1.5 shadow-sm">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setActiveMenu(item.name)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out border ${
                            activeMenu === item.name
                                ? "bg-[#251849] border-purple-500/20 text-white shadow-[0_4px_12px_rgba(139,92,246,0.1)]"
                                : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>

            {/* Right Auth/Icons */}
            <div className="flex items-center gap-6">
                <button className="relative text-[#8A8F98] hover:text-white transition-colors outline-none cursor-pointer">
                    <Bell className="w-5 h-5" fill="currentColor" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#ff3366] rounded-full border border-black"></span>
                </button>

                
                <button className="text-[#8A8F98] hover:text-white outline-none cursor-pointer">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
