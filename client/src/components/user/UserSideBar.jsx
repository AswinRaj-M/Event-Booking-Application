import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Ticket,
  Wallet,
  User,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { logoutUserThunk, logoutUserState } from "../../features/user.slice";
import { toast } from "sonner";
import { COMMON_ROUTES, USER_ROUTES } from "../../constants/Routes";

const UserSideBar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const platformLinks = [
    { path: USER_ROUTES.HOME, icon: LayoutDashboard, label: "Dashboard" },
    { path: USER_ROUTES.BOOKINGS, icon: Ticket, label: "My Bookings" },
    { path: USER_ROUTES.PROFILE + "#wallet", icon: Wallet, label: "Wallet" }
  ];

  const accountLinks = [
    { path: USER_ROUTES.PROFILE, icon: User, label: "Profile" },
    { path: USER_ROUTES.SETTINGS, icon: Settings, label: "Settings" },
    { path: USER_ROUTES.SUPPORT, icon: HelpCircle, label: "Help & Support" }
  ];

  return (
    <div className="w-64 h-screen bg-[#050505] border-r border-zinc-900 flex flex-col fixed top-0 left-0 font-sans selection:bg-purple-500/30 overflow-hidden">
      
      {/* Brand Header */}
      <div className="p-6 pb-2 flex flex-col justify-center">
        <div className="flex flex-col">
          <span className="text-white font-extrabold text-lg tracking-wider leading-none">Festivo</span>
          <span className="text-[10px] text-zinc-500 font-semibold tracking-wider mt-1.5 uppercase">Premium Booking</span>
        </div>
      </div>

      {/* Main Navigation Area */}
      <div className="flex-grow overflow-y-auto px-4 py-6 space-y-7 scrollbar-none">
        
        {/* Platform Section */}
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest px-3 mb-3">
            Platform
          </h3>
          <div className="space-y-1">
            {platformLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path.includes("#") && location.pathname + location.hash === link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 border ${
                    isActive
                      ? "bg-[#251849] border-purple-500/20 text-white shadow-[0_4px_12px_rgba(139,92,246,0.1)]"
                      : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-105 ${isActive ? "text-purple-400" : "text-zinc-500"}`} />
                    <span className="text-sm font-medium tracking-wide">{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-[#241d3d] text-purple-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-purple-500/10">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest px-3 mb-3">
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
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-300 border ${
                    isActive
                      ? "bg-[#251849] border-purple-500/20 text-white shadow-[0_4px_12px_rgba(139,92,246,0.1)]"
                      : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-purple-400" : "text-zinc-500"}`} />
                  <span className="text-sm font-medium tracking-wide">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-4 border-t border-zinc-900 mt-auto bg-[#070707]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3.5 px-3 py-2.5 rounded-xl text-red-500/95 hover:bg-red-500/5 hover:text-red-400 transition-all font-semibold text-sm cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="tracking-wide">Log out</span>
        </button>
      </div>

    </div>
  );
};

export default UserSideBar;
