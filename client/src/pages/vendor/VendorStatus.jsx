import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';
import { CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';


const VendorStatus = ({ status = 'pending' }) => {

    
    const renderStatusContent = () => {
        switch (status) {
            case 'approved':
                return (
                    <div className="w-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
                        {/* Status Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 gap-4">
                            <div>
                                <h3 className="text-white font-medium text-lg">Application Details</h3>
                                <p className="text-gray-500 text-sm mt-1">Submitted on October 24, 2023</p>
                            </div>
                            <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 w-fit">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-white/5">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Application ID</p>
                                <p className="text-white font-medium">AVND-2023-8492</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Business Name</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <p className="text-white font-medium">Gourmet Delights Co.</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Message Box */}
                        <div className="p-6 md:p-10">
                            <div className="bg-[#121212] rounded-xl border border-green-500/20 p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">Your application has been approved!</h2>
                                <p className="text-gray-400 max-w-md leading-relaxed mb-8">
                                    Welcome aboard. Your vendor account is now active. You can start setting up your profile and listing events immediately.
                                </p>
                                <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] transform hover:-translate-y-0.5">
                                    Go to Vendor Dashboard
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                );

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
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Business Name</p>
                                <p className="text-white font-medium">Gourmet Delights Co.</p>
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
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Business Name</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-violet-600"></div>
                                    <p className="text-white font-medium">Gourmet Delights Co.</p>
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

                    {/* Desktop Right Side - User Profile Mini */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-white">Olivia Martinez</p>
                            <p className="text-xs text-gray-500">olivia@gourmetdelights.com</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-white/10 overflow-hidden">
                            <img
                                src="https://i.pravatar.cc/150?u=olivia"
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
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
