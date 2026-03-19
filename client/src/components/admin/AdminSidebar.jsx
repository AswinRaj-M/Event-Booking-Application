import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { logoutAdminState } from '../../features/admin.slice'
import { ROUTES } from '../../constants/routes'
import {
    LayoutDashboard,
    Users,
    Store,
    Calendar,
    Ticket,
    CreditCard,
    BarChart3,
    Settings,
    LogOut
} from 'lucide-react'

function AdminSidebar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const adminState = useSelector((state) => state.admin)
    const email = adminState.admin?.email
    const name = adminState.admin?.name

    const handleLogout = () => {
        dispatch(logoutAdminState())
        navigate(ROUTES.ADMIN_LOGIN)
    }

    const isActive = (path) => location.pathname === path

    return (
        <aside className="w-64 bg-[#131022] flex flex-col border-r border-gray-800 hidden md:flex h-full">
            {/* Logo Area */}
            <div className="p-6 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                    <LayoutDashboard size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold tracking-wide text-gray-100">FestivoAdmin</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
                <div className="px-4 mb-6">
                    <p className="px-4 text-[11px] font-semibold text-gray-500 mb-2 uppercase">Platform</p>
                    <nav className="space-y-1">
                        <Link to={ROUTES.ADMIN_DASHBOARD} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(ROUTES.ADMIN_DASHBOARD) ? 'bg-[#2A204C] text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                            <LayoutDashboard className={`mr-3 h-5 w-5 ${isActive(ROUTES.ADMIN_DASHBOARD) ? 'text-purple-400' : 'text-gray-500'}`} />
                            Dashboard
                        </Link>
                        <Link to={ROUTES.ADMIN_USER_MANAGEMENT} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(ROUTES.ADMIN_USER_MANAGEMENT) ? 'bg-[#2A204C] text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                            <Users className={`mr-3 h-5 w-5 ${isActive(ROUTES.ADMIN_USER_MANAGEMENT) ? 'text-purple-400' : 'text-gray-500'}`} />
                            Users
                        </Link>
                        <Link to={ROUTES.ADMIN_VENDORS} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(ROUTES.ADMIN_VENDORS) ? 'bg-[#2A204C] text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                            <Store className={`mr-3 h-5 w-5 ${isActive(ROUTES.ADMIN_VENDORS) ? 'text-purple-400' : 'text-gray-500'}`} />
                            Vendors
                        </Link>
                        <Link to={ROUTES.ADMIN_EVENT_MANAGEMENT} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(ROUTES.ADMIN_EVENT_MANAGEMENT) ? 'bg-[#2A204C] text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                            <Calendar className={`mr-3 h-5 w-5 ${isActive(ROUTES.ADMIN_EVENT_MANAGEMENT) ? 'text-purple-400' : 'text-gray-500'}`} />
                            Events
                        </Link>
                    </nav>
                </div>

                <div className="px-4 mb-6">
                    <p className="px-4 text-[11px] font-semibold text-gray-500 mb-2 uppercase">Management</p>
                    <nav className="space-y-1">
                        <Link to={ROUTES.ADMIN_BOOKING_MANAGEMENT} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(ROUTES.ADMIN_BOOKING_MANAGEMENT) ? 'bg-[#2A204C] text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                            <Ticket className={`mr-3 h-5 w-5 ${isActive(ROUTES.ADMIN_BOOKING_MANAGEMENT) ? 'text-purple-400' : 'text-gray-500'}`} />
                            Bookings
                        </Link>
                        <Link to={ROUTES.ADMIN_PAYMENT_MANAGEMENT} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(ROUTES.ADMIN_PAYMENT_MANAGEMENT) ? 'bg-[#2A204C] text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                            <CreditCard className={`mr-3 h-5 w-5 ${isActive(ROUTES.ADMIN_PAYMENT_MANAGEMENT) ? 'text-purple-400' : 'text-gray-500'}`} />
                            Payments
                        </Link>
                        <Link to={ROUTES.ADMIN_ANALYTICS} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(ROUTES.ADMIN_ANALYTICS) ? 'bg-[#2A204C] text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                            <BarChart3 className={`mr-3 h-5 w-5 ${isActive(ROUTES.ADMIN_ANALYTICS) ? 'text-purple-400' : 'text-gray-500'}`} />
                            Analytics
                        </Link>
                    </nav>
                </div>

                <div className="px-4">
                    <p className="px-4 text-[11px] font-semibold text-gray-500 mb-2 uppercase">System</p>
                    <nav className="space-y-1">
                        <Link to={ROUTES.ADMIN_SETTINGS} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(ROUTES.ADMIN_SETTINGS) ? 'bg-[#2A204C] text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                            <Settings className={`mr-3 h-5 w-5 ${isActive(ROUTES.ADMIN_SETTINGS) ? 'text-purple-400' : 'text-gray-500'}`} />
                            Settings
                        </Link>
                    </nav>
                </div>
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            className="h-9 w-9 rounded-md object-cover"
                            src="https://www.google.com/imgres?q=admin%20Image&imgurl=https%3A%2F%2Fcdn-icons-png.flaticon.com%2F512%2F2304%2F2304226.png&imgrefurl=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fadmin_2304226&docid=MPecgjYIogc5eM&tbnid=LZk5dbwIspAbdM&vet=12ahUKEwjjgs3TioGTAxVT2DgGHUsUDK0QnPAOegQIHxAB..i&w=512&h=512&hcb=2&ved=2ahUKEwjjgs3TioGTAxVT2DgGHUsUDK0QnPAOegQIHxAB"
                            alt="Admin avatar"
                        />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">{name || "Admin" }</p>
                            <p className="text-xs text-gray-500">{ email || "admin@gmail.com" }</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors" title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default AdminSidebar
