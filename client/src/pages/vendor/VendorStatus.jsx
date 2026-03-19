import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vendorLogoutState } from '../../features/vendorSlice';
import logo from '../../assets/logo.jpeg';
import { LogOut } from 'lucide-react';
import VendorRejectStatus from '../../components/vendor/VendorRejectStatus';
import VendorPendingStatus from '../../components/vendor/VendorPendingStatus';

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
                return <VendorRejectStatus businessName={businessName} />;
            case 'pending':
            default:
                return <VendorPendingStatus businessName={businessName} />;
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
