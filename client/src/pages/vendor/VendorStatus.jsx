import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vendorLogoutState, setVendorData } from '../../features/vendorSlice';
import { checkVendorStatus } from '../../services/vendor.api';
import logo from '../../assets/logo.jpeg';
import { CheckCircle2, Clock, XCircle, RefreshCw, LogOut } from 'lucide-react';
import { COMMON_ROUTES, VENDOR_ROUTES } from '../../constants/Routes';
import { toast } from 'sonner';

const VendorStatus = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const vendor = useSelector((state) => state.vendor?.vendor);

    const [isChecking, setIsChecking] = useState(false);
    const status = vendor?.applicationStatus || 'pending';
    const businessName = vendor?.businessName || location.state?.businessName || "Your Business";
    const appId = (vendor?.id || vendor?._id)
        ? `AVND-${(vendor.id || vendor._id).toString().slice(-6).toUpperCase()}`
        : "AVND-8492";

    const submittedDate = vendor?.createdAt
        ? new Date(vendor.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : "Recent";

    // Immediate check function to fetch fresh vendor status from server
    const fetchStatus = useCallback(async (manual = false) => {
        if (manual) setIsChecking(true);
        try {
            const response = await checkVendorStatus();
            if (response.data && response.data.success) {
                const currentStatus = response.data.status || response.data.vendor?.applicationStatus;
                const updatedVendor = response.data.vendor || (vendor ? { ...vendor, applicationStatus: currentStatus } : null);

                if (updatedVendor) {
                    dispatch(setVendorData(updatedVendor));
                }

                if (currentStatus === 'approved') {
                    toast.success("Application Approved! Redirecting to vendor dashboard...");
                    navigate(VENDOR_ROUTES.DASHBOARD, { replace: true });
                    return;
                } else if (manual) {
                    toast.info(`Application is currently ${currentStatus || 'under review'}.`);
                }
            }
        } catch (error) {
            console.error("Failed to fetch fresh vendor status:", error);
            if (manual) {
                toast.error("Failed to check status. Please try again.");
            }
        } finally {
            if (manual) setIsChecking(false);
        }
    }, [dispatch, navigate, vendor]);

    // Check status immediately on mount (such as page reload)
    useEffect(() => {
        if (status === 'approved') {
            navigate(VENDOR_ROUTES.DASHBOARD, { replace: true });
            return;
        }

        fetchStatus();

        // Background polling every 10 seconds for real-time transitions
        const interval = setInterval(() => {
            fetchStatus();
        }, 10000);

        return () => clearInterval(interval);
    }, [status, fetchStatus, navigate]);

    // Listen for real-time notification socket events dispatched on window
    useEffect(() => {
        const handleNotification = () => {
            fetchStatus();
        };

        window.addEventListener("festivo:notification", handleNotification);
        return () => window.removeEventListener("festivo:notification", handleNotification);
    }, [fetchStatus]);

    const handleLogout = () => {
        dispatch(vendorLogoutState());
        navigate(COMMON_ROUTES.LOGIN, { replace: true });
    };

    const renderStatusContent = () => {
        switch (status) {
            case 'rejected':
                return (
                    <div className="w-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                        {/* Status Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 gap-4">
                            <div>
                                <h3 className="text-white font-medium text-lg">Application Details</h3>
                                <p className="text-gray-500 text-sm mt-1">Submitted on {submittedDate}</p>
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
                                <p className="text-white font-medium">{appId}</p>
                            </div>
                            <div className="md:ml-auto">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Business Name</p>
                                <p className="text-white font-medium">{businessName}</p>
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
                                    We couldn't verify your business details or documents. Please ensure the uploaded files are clear, valid, and authentic, then re-apply.
                                </p>
                                <Link to={VENDOR_ROUTES.APPLICATION} className="bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-white font-medium px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 group cursor-pointer">
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
                    <div className="w-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                        {/* Status Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 gap-4">
                            <div>
                                <h3 className="text-white font-medium text-lg">Application Details</h3>
                                <p className="text-gray-500 text-sm mt-1">Submitted on {submittedDate}</p>
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
                                <p className="text-white font-medium">{appId}</p>
                            </div>
                            <div className="md:ml-auto">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Business Name</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-violet-600 shrink-0"></div>
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
                                <p className="text-gray-400 max-w-md leading-relaxed mb-6">
                                    Our admin team is currently reviewing your business details and documentation. Once approved, you will automatically gain access to your vendor dashboard.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => fetchStatus(true)}
                                    disabled={isChecking}
                                    className="mb-8 px-6 py-2.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 hover:text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <RefreshCw size={15} className={isChecking ? "animate-spin" : ""} />
                                    <span>{isChecking ? "Checking Status..." : "Check Status Now"}</span>
                                </button>

                                <div className="flex items-center gap-2 text-sm text-gray-500 border-t border-white/5 pt-6 w-full justify-center">
                                    <span>For urgent queries, contact:</span>
                                    <a href="mailto:support@festivo.com" className="text-violet-400 hover:text-violet-300 transition-colors">support@festivo.com</a>
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
                            alt="Festivo Logo"
                            className="w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                        />
                        <span className="text-white font-bold text-xl tracking-tight">Festivo</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer"
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
                        Track the progress of your vendor application in real time
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
