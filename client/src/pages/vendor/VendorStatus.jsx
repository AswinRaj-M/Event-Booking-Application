import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vendorLogoutState } from '../../features/vendorSlice';
import logo from '../../assets/logo.jpeg';
import { CheckCircle2, Clock, XCircle, RefreshCw, LogOut } from 'lucide-react';

const VendorStatus = () => {
    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const vendor = useSelector((state) => state.vendor?.vendor)
    
    const status = vendor?.applicationStatus || 'pending';
    const businessName = vendor?.businessName || location.state?.businessName || "";
    
    useEffect(() => {
        if (status === 'approved') {
            navigate('/vendor/dashboard', { replace: true });
        }
    }, [status, navigate]);

    const handleLogout = () => {
        dispatch(vendorLogoutState());
        navigate('/login', { replace: true });
    };

    const renderStatusContent = () => {
        switch (status) {
            case 'rejected':
                return (
                    <div className="w-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
                        {/* Status Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 gap-4">
                            <div>
                                <h3 className="text-white font-medium text-lg">Application Details</h3>
                                <p className="text-gray-500 text-sm mt-1">Submitted on October 24, 2023</p>
                            </div>
                            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full border border-red-500/20 w-fit">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-white/5">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Application ID</p>
                                <p className="text-white font-medium">AVND-2023-8492</p>
                            </div>
                            <div className="md:ml-40">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Business Name</p>
                                <p className="text-white font-medium ">{businessName}</p>
                            </div>
                        </div>

                        {/* Status Message Box */}
                        <div className="p-6 md:p-10">
                            <div className="bg-[#121212] rounded-xl border border-red-500/20 p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                                    <XCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">Your application was not approved</h2>
                                <p className="text-gray-400 max-w-md leading-relaxed mb-8">
                                    We couldn't verify your business details/document. Please ensure the uploaded files are clear and valid, then try applying again.
                                </p>
                                <Link to="/vendor-application" className="bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-white font-medium px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 group">
                                    <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                                    Review & Reapply
                                </Link>
                            </div>
                        </div>
                    </div>
                );

            case 'pending':
            default:
                return (
                    <div className="w-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
                        {/* Status Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 gap-4">
                            <div>
                                <h3 className="text-white font-medium text-lg">Application Details</h3>
                                <p className="text-gray-500 text-sm mt-1">Submitted on October 24, 2023</p>
                            </div>
                            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full border border-yellow-500/20 w-fit">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-white/5">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Application ID</p>
                                <p className="text-white font-medium">AVND-2023-8492</p>
                            </div>
                            <div className="md:ml-40">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Business Name</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-violet-600"></div>
                                    <p className="text-white font-medium">{businessName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Message Box */}
                        <div className="p-6 md:p-10">
                            <div className="bg-[#121212] rounded-xl border border-yellow-500/20 p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                                    <Clock size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">Your application is under review</h2>
                                <p className="text-gray-400 max-w-md leading-relaxed mb-8">
                                    Our admin team is currently reviewing your business details and documentation. This usually takes <span className="text-yellow-500 font-medium">2-3 business days</span>.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>For questions, contact:</span>
                                    <a href="mailto:support@eventconnect.com" className="text-violet-400 hover:text-violet-300 transition-colors">support@eventconnect.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-violet-500/30">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="EventConnect Logo"
                            className="w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                        />
                        <span className="text-white font-bold text-xl tracking-tight">EventConnect</span>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>

                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pt-32 pb-20 px-4 flex flex-col items-center">

                {/* Header Titles */}
                <div className="text-center mb-10 space-y-3 max-w-2xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                        Vendor Application Status
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Track the progress of your vendor application
                    </p>
                </div>

                {/* Dynamic Status Component Container */}
                <div className="w-full max-w-2xl mx-auto">
                    {renderStatusContent()}
                </div>

            </main>
        </div>
    );
};

export default VendorStatus;
