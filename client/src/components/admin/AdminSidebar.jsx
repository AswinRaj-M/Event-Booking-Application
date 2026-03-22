import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { logoutAdminThunk } from '../../features/admin.slice'
import { ROUTES } from '../../constants/routes'
import {
    LayoutDashboard,
    Store,
    LogOut
} from 'lucide-react'

function AdminSidebar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const adminState = useSelector((state) => state.admin)
    const email = adminState.admin?.email
    const name = adminState.admin?.name

    const handleLogout = async () => {
        try {
            await dispatch(logoutAdminThunk()).unwrap()
            navigate(ROUTES.ADMIN_LOGIN)
        } catch (error) {
            console.error("Logout failed:", error)
        }
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
                        <Link to={ROUTES.ADMIN_VENDORS} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(ROUTES.ADMIN_VENDORS) ? 'bg-[#2A204C] text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                            <Store className={`mr-3 h-5 w-5 ${isActive(ROUTES.ADMIN_VENDORS) ? 'text-purple-400' : 'text-gray-500'}`} />
                            Vendors
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
