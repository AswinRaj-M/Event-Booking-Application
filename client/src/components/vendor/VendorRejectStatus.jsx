import React from 'react';
import { XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorRejectStatus = ({ businessName }) => {
    return (
        <div className="w-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
            {/* Status Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 gap-4">
                <div>
                    <h3 className="text-white font-medium text-lg">Application Details</h3>
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
};

export default VendorRejectStatus;
