import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutAdminState } from '../../features/admin.slice'
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

    const handleLogout = () => {
        dispatch(logoutAdminState())
        navigate("/admin/login")
    }

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
                        <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg bg-[#2A204C] text-white">
                            <LayoutDashboard className="mr-3 h-5 w-5 text-purple-400" />
                            Dashboard
                        </a>
                        <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                            <Users className="mr-3 h-5 w-5 text-gray-500" />
                            Users
                        </a>
                        <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                            <Store className="mr-3 h-5 w-5 text-gray-500" />
                            Vendors
                        </a>
                        <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                            <Calendar className="mr-3 h-5 w-5 text-gray-500" />
                            Events
                        </a>
                    </nav>
                </div>

                <div className="px-4 mb-6">
                    <p className="px-4 text-[11px] font-semibold text-gray-500 mb-2 uppercase">Management</p>
                    <nav className="space-y-1">
                        <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                            <Ticket className="mr-3 h-5 w-5 text-gray-500" />
                            Bookings
                        </a>
                        <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                            <CreditCard className="mr-3 h-5 w-5 text-gray-500" />
                            Payments
                        </a>
                        <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                            <BarChart3 className="mr-3 h-5 w-5 text-gray-500" />
                            Analytics
                        </a>
                    </nav>
                </div>

                <div className="px-4">
                    <p className="px-4 text-[11px] font-semibold text-gray-500 mb-2 uppercase">System</p>
                    <nav className="space-y-1">
                        <a href="#" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                            <Settings className="mr-3 h-5 w-5 text-gray-500" />
                            Settings
                        </a>
                    </nav>
                </div>
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            className="h-9 w-9 rounded-md object-cover"
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt="Admin avatar"
                        />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">Jonathan Davis</p>
                            <p className="text-xs text-gray-500">admin@platform.com</p>
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
