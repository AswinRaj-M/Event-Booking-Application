import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    Bell,
    Menu,
    X,
    Compass,
    LayoutDashboard,
    Ticket,
    Wallet,
    User,
    Settings,
    HelpCircle,
    LogOut,
    Sparkles,
    LogIn,
    UserPlus,
    ChevronRight,
    ArrowRight,
    Trash2,
    CheckCircle2,
    CreditCard,
    XCircle,
    Clock,
    AlertTriangle
} from "lucide-react";
import logo from "../../assets/logo.jpeg";
import { USER_ROUTES, COMMON_ROUTES, VENDOR_ROUTES } from "../../constants/Routes";
import { logoutUserThunk, logoutUserState } from "../../features/user.slice";
import { toast } from "sonner";
import { getSocket } from "../../services/socket";
import NotificationBell from "../common/NotificationBell";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [activeMenu, setActiveMenu] = useState(() => {
        const path = window.location.pathname;
        const hash = window.location.hash;
        if (path === USER_ROUTES.PROFILE) return "Profile";
        if (path === USER_ROUTES.HOME) return "Home";
        if (path === USER_ROUTES.EXPLORE) return "Browse Events";
        if (path === USER_ROUTES.BOOKINGS) return "My Bookings";
        if (path === COMMON_ROUTES.ABOUT || hash.includes("about")) return "About Us";
        if (hash.includes("browse")) return "Browse Events";
        return "Home";
    });

    // Keep activeMenu synced with route changes
    useEffect(() => {
        const path = location.pathname;
        const hash = location.hash;
        if (path === USER_ROUTES.PROFILE) setActiveMenu("Profile");
        else if (path === USER_ROUTES.HOME) setActiveMenu("Home");
        else if (path === USER_ROUTES.EXPLORE) setActiveMenu("Browse Events");
        else if (path === USER_ROUTES.BOOKINGS) setActiveMenu("My Bookings");
        else if (path === COMMON_ROUTES.ABOUT || hash.includes("about")) setActiveMenu("About Us");
        else if (hash.includes("browse")) setActiveMenu("Browse Events");
    }, [location.pathname, location.hash]);

    // Lock body scroll when sidebar drawer is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isSidebarOpen]);

    // Handle Escape key to close sidebar
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsSidebarOpen(false);
                setIsNotificationOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleLogout = async () => {
        try {
            setIsSidebarOpen(false);
            await dispatch(logoutUserThunk()).unwrap();
            dispatch(logoutUserState());
            toast.success("Logged out successfully");
            navigate(COMMON_ROUTES.LOGIN);
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    };

    const menuItems = [
        { name: "Browse Events", path: USER_ROUTES.EXPLORE },
        { name: "My Bookings", path: USER_ROUTES.BOOKINGS },
        { name: "Home", path: USER_ROUTES.HOME },
        { name: "Profile", path: USER_ROUTES.PROFILE },
        { name: "About Us", path: COMMON_ROUTES.ABOUT }
    ];

    const sidebarNavLinks = [
        { name: "Browse Events", path: USER_ROUTES.EXPLORE, icon: Compass, badge: "New" },
        { name: "Home / Dashboard", path: USER_ROUTES.HOME, icon: LayoutDashboard },
        { name: "My Bookings", path: USER_ROUTES.BOOKINGS, icon: Ticket },
        { name: "My Wallet", path: USER_ROUTES.WALLET, icon: Wallet },
        { name: "My Profile", path: USER_ROUTES.PROFILE, icon: User },
    ];

    const hostLinks = [
        { name: "Host Events / Vendor", path: VENDOR_ROUTES.APPLICATION, icon: Sparkles },
    ];

    const supportLinks = [
        { name: "Settings", path: "#settings", icon: Settings },
        { name: "Help & Support", path: "#help", icon: HelpCircle },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-40 bg-black/60 backdrop-blur-md transition-all duration-300 border-b border-white/5 py-4 px-6 md:px-10 flex items-center justify-between">
                {/* Logo */}
                <Link to={USER_ROUTES.HOME} className="flex items-center gap-3 group">
                    <img
                        src={logo}
                        alt="Festivo Logo"
                        className="w-10 h-10 rounded-full object-cover border border-purple-500/20 group-hover:border-purple-500/50 transition-all shadow-md"
                    />
                    <div className="flex flex-col">
                        <span className="text-white font-black text-xl tracking-wide">Festivo</span>
                    </div>
                </Link>

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
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Notification Bell & Dropdown */}
                    <NotificationBell />

                    {/* 3 Lines Hamburger Menu Button */}
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open Navigation Sidebar"
                        className="text-[#8A8F98] hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all outline-none cursor-pointer active:scale-95 flex items-center justify-center"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* Sidebar Drawer Overlay & Panel */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
                    />

                    {/* Sliding Drawer Container */}
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <aside className="w-80 sm:w-88 max-w-[88vw] bg-[#070512]/98 border-l border-purple-500/20 backdrop-blur-2xl text-white flex flex-col h-full shadow-[0_0_60px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-300">
                            
                            {/* Drawer Header */}
                            <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={logo}
                                        alt="Festivo Logo"
                                        className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
                                    />
                                    <div>
                                        <h3 className="font-black text-base text-white tracking-wide leading-none">Festivo</h3>
                                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mt-0.5 block">
                                            Navigation Menu
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setIsSidebarOpen(false)}
                                    aria-label="Close Sidebar"
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* User Profile Quick Summary Card */}
                            <div className="p-4 border-b border-white/5">
                                {user ? (
                                    <div className="bg-[#110C24]/90 border border-purple-500/25 rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md overflow-hidden shrink-0">
                                                {user?.profilePicture?.fileUrl ? (
                                                    <img src={user.profilePicture.fileUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    (user?.fullName || "U").charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-bold text-white truncate">{user.fullName || "Festivo User"}</h4>
                                                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="pt-2.5 border-t border-purple-500/15 flex items-center justify-between text-xs">
                                            <span className="text-zinc-400 font-medium">Wallet Balance:</span>
                                            <span className="text-emerald-400 font-black">
                                                ₹{(user?.walletBalance !== undefined ? user.walletBalance : 0.0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[#110C24]/90 border border-purple-500/20 rounded-2xl p-4 space-y-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Welcome to Festivo</h4>
                                            <p className="text-xs text-zinc-400 mt-0.5">Sign in to book tickets and manage events</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <Link
                                                to={COMMON_ROUTES.LOGIN}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className="py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl text-center transition-all shadow-md flex items-center justify-center gap-1.5"
                                            >
                                                <LogIn className="w-3.5 h-3.5" />
                                                Login
                                            </Link>
                                            <Link
                                                to={COMMON_ROUTES.SIGNUP}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-bold text-xs rounded-xl text-center transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <UserPlus className="w-3.5 h-3.5" />
                                                Sign Up
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Navigation Area */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-none">
                                
                                {/* Section 1: Main Platform Navigation */}
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-3 block mb-2">
                                        Platform
                                    </span>
                                    <div className="space-y-1">
                                        {sidebarNavLinks.map((link) => {
                                            const IconComp = link.icon;
                                            const isActive = location.pathname === link.path;

                                            return (
                                                <Link
                                                    key={link.name}
                                                    to={link.path}
                                                    onClick={() => setIsSidebarOpen(false)}
                                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                                                        isActive
                                                            ? "bg-[#251849] border-purple-500/30 text-white shadow-[0_4px_15px_rgba(139,92,246,0.15)]"
                                                            : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <IconComp className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-zinc-500"}`} />
                                                        <span>{link.name}</span>
                                                    </div>
                                                    {link.badge && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                            {link.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Section 2: Hosting & Vendors */}
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-3 block mb-2">
                                        Organizers
                                    </span>
                                    <div className="space-y-1">
                                        {hostLinks.map((link) => {
                                            const IconComp = link.icon;
                                            const isActive = location.pathname === link.path;

                                            return (
                                                <Link
                                                    key={link.name}
                                                    to={link.path}
                                                    onClick={() => setIsSidebarOpen(false)}
                                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                                                        isActive
                                                            ? "bg-[#251849] border-purple-500/30 text-white shadow-[0_4px_15px_rgba(139,92,246,0.15)]"
                                                            : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <IconComp className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-purple-400"}`} />
                                                        <span>{link.name}</span>
                                                    </div>
                                                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Section 3: Preferences & Support */}
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-3 block mb-2">
                                        Help & Info
                                    </span>
                                    <div className="space-y-1">
                                        {supportLinks.map((link) => {
                                            const IconComp = link.icon;

                                            return (
                                                <Link
                                                    key={link.name}
                                                    to={link.path}
                                                    onClick={() => setIsSidebarOpen(false)}
                                                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-transparent text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                                >
                                                    <IconComp className="w-4 h-4 text-zinc-500" />
                                                    <span>{link.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>

                            {/* Drawer Footer Actions */}
                            <div className="p-4 border-t border-white/5 bg-[#05040d]">
                                {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-red-400 hover:text-red-300 font-bold text-xs transition-all cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out of Account</span>
                                    </button>
                                ) : (
                                    <Link
                                        to={COMMON_ROUTES.LOGIN}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span>Log In to Get Started</span>
                                    </Link>
                                )}
                            </div>

                        </aside>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;

