import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminClearMessages, adminLoginThunk } from "../../features/admin.slice";
import { ROUTES } from "../../constants/routes";
import Loader from "../../components/common/Loader";

const AdminLogin = () => {

    const [email ,setEmail] = useState("")
    const [password, setPassword] = useState("")

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {loading , success} = useSelector((state) => state.admin)
   
    const handleSubmit = (e) =>{
        e.preventDefault()
        dispatch(adminLoginThunk({
            email,
            password
        }))
    }

    useEffect(()=>{
        if(success){
            dispatch(adminClearMessages())
            navigate(ROUTES.ADMIN_DASHBOARD, { replace: true })
        }
    },[success,navigate,dispatch])

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1b1b24] text-white p-4 font-sans selection:bg-purple-500/30">
            {/* Top Logo & Text */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-[#2c1f4a] rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-500/20">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-[#a855f7]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold tracking-wide flex items-center">
                    Event<span className="font-semibold text-gray-200">Admin</span>
                </h1>
                <p className="text-xs text-gray-400 mt-2 tracking-wide font-medium">
                    Secure access for platform administrators
                </p>
            </div>

            {/* Main Login Card */}
            <div className="w-full max-w-md bg-[#13131a] rounded-xl shadow-2xl overflow-hidden border border-white/5">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">
                            Admin Login
                        </h2>
                        <p className="text-xs text-gray-400 font-medium">
                            Enter your credentials to access the dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label
                                className="text-xs font-semibold text-gray-300 ml-1"
                                htmlFor="email"
                            >
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#a855f7] transition-colors">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 bg-[#1c1c24] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#a855f7] focus:border-[#a855f7] transition-all placeholder:text-gray-600"
                                    placeholder="admin@eventplatform.com"
                                    onChange={(e)=> setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label
                                className="text-xs font-semibold text-gray-300 ml-1"
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#a855f7] transition-colors">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    autoComplete="new-pasword"
                                    type="password"
                                    className="w-full pl-10 pr-10 py-3 bg-[#1c1c24] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#a855f7] focus:border-[#a855f7] transition-all placeholder:text-gray-600 tracking-widest"
                                    placeholder="••••••••••••"
                                    onChange={(e)=> setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex items-center justify-center pt-1">
                            <a
                                href="#"
                                className="text-xs font-semibold text-[#a855f7] hover:text-[#c084fc] transition-colors"
                            >
                                Forgot Password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] hover:from-[#9333ea] hover:to-[#7c3aed] text-white text-sm font-semibold rounded-lg shadow-[0_4px_20px_rgba(168,85,247,0.4)] transition-all duration-200 transform hover:-translate-y-0.5 mt-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                />
                            </svg>
                            {loading ? "loging in..." : "Login to Admin Panel"}
                        </button>
                    </form>
                </div>

                {/* Footer info inside card */}
                <div className="px-8 py-4 bg-[#0a0a0e] border-t border-gray-800/80 flex items-center justify-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    <span className="text-[10px] text-gray-500 font-semibold tracking-wide">
                        Authorized personnel only. All activities are monitored.
                    </span>
                </div>
            </div>

            {/* Bottom Links */}
            <div className="mt-8 text-center space-y-3">
                <p className="text-xs text-gray-500 font-medium">
                    Having trouble logging in?{" "}
                    <a
                        href="#"
                        className="text-[#a855f7] hover:text-[#c084fc] transition-colors"
                    >
                        Contact IT Support
                    </a>
                </p>
                <p className="text-[10px] text-gray-600 font-medium tracking-wide">
                    © 2024 EventPlatform Inc. &nbsp;•&nbsp;{" "}
                    <a href="#" className="hover:text-gray-400 transition-colors">
                        Privacy Policy
                    </a>{" "}
                    &nbsp;•&nbsp;{" "}
                    <a href="#" className="hover:text-gray-400 transition-colors">
                        Terms
                    </a>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
