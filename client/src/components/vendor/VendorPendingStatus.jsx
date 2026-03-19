import React from 'react';
import { Clock } from 'lucide-react';

const VendorPendingStatus = ({ businessName }) => {
    return (
        <div className="w-full bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
            {/* Status Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 gap-4">
                <div>
                    <h3 className="text-white font-medium text-lg">Application Details</h3>
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
};

export default VendorPendingStatus;
