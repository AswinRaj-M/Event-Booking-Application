import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu } from "lucide-react";
import logo from "../../assets/logo.jpeg";
import { USER_ROUTES, COMMON_ROUTES } from "../../constants/Routes";
import { logoutUserThunk, logoutUserState } from "../../features/user.slice";
import { toast } from "sonner";
import NotificationBell from "../common/NotificationBell";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

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

    const handleLogout = async () => {
        try {
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

    return (
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

                {/* 3 Lines Hamburger Menu Icon */}
                <div className="text-[#8A8F98] p-2 rounded-xl flex items-center justify-center">
                    <Menu className="w-6 h-6" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
