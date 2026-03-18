import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarDays,
    FileEdit,
    PlusCircle,
    Ticket,
    Wallet,
    UserCircle,
    Settings,
    LogOut
} from "lucide-react";

const VendorSidebar = () => {
    const location = useLocation();

    // Navigation Links Data
    const mainLinks = [
        { path: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/vendor/events", icon: CalendarDays, label: "My Events" },
        { path: "/vendor/events/drafts", icon: FileEdit, label: "Draft Events" },
        { path: "/vendor/events/create", icon: PlusCircle, label: "Create Event" },
        { path: "/vendor/bookings", icon: Ticket, label: "Bookings" },
        { path: "/vendor/earnings", icon: Wallet, label: "Earnings" },
    ];

    const accountLinks = [
        { path: "/vendor/profile", icon: UserCircle, label: "Vendor Profile" },
        { path: "/vendor/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <div className="w-64 h-screen bg-[#070514] border-r border-white/5 flex flex-col fixed top-0 left-0 font-sans selection:bg-purple-500/30 overflow-hidden">

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-8 px-4 pb-20 scrollbar-thin scrollbar-thumb-purple-900/50 scrollbar-track-transparent">

                {/* Main Links */}
                <div className="space-y-1">
                    {mainLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;

                        if (link.primary) {
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="flex items-center gap-3 px-3 py-2.5 mt-2 mb-2 bg-[#2D1B69] hover:bg-[#382282] text-white rounded-xl transition-all shadow-[0_4px_15px_rgba(45,27,105,0.4)] group"
                                >
                                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium tracking-wide">{link.label}</span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                    ? "bg-white/5 text-white"
                                    : "text-gray-300 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : "text-gray-400"}`} />
                                <span className="text-sm font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Account Section */}
                <div className="mt-8">
                    <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3 px-3">
                        Account
                    </h3>
                    <div className="space-y-1">
                        {accountLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                        ? "bg-white/5 text-white"
                                        : "text-gray-300 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : "text-gray-400"}`} />
                                    <span className="text-sm font-medium">{link.label}</span>
                                </Link>
                            );
                        })}

                        {/* Logout Button */}
                        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all mt-1">
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* User Profile Footer (Sticky bottom) */}
            <div className="p-4 border-t border-white/5 bg-[#0B091A]">
                <Link to="/vendor/profile" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center border border-white/10 overflow-hidden cursor-pointer group-hover:border-purple-500 transition-colors">
                        <UserCircle className="w-6 h-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Your Profile</span>
                        <span className="text-[11px] text-gray-500 group-hover:text-gray-400 transition-colors">Vendor Account</span>
                    </div>
                </Link>
            </div>

        </div>
    );
};

export default VendorSidebar;
