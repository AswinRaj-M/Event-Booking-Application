import React, { useEffect, useState } from 'react';
import {
    ArrowLeft, Printer, Mail, Utensils, Phone, Globe,
    FileText, Image as ImageIcon, CheckCircle, XCircle, ChevronRight,
    User, Calendar, Building, Search, Bell, Sidebar
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getVendorByIdThunk } from '../../features/admin.slice';
import { approveVendorApplication, rejectVendorAppplication } from '../../services/admin.api';
import { toast } from 'sonner';
import Loader from '../../components/common/Loader';

const AdminVendorApplicationView = () => {

    const { id } = useParams()
    const dispatch = useDispatch()
   

    const { vendorDetails, loading } = useSelector((state) => state.admin)
    const [message,setMessage] = useState('')
    
    useEffect(() => {
        dispatch(getVendorByIdThunk(id))
    }, [dispatch, id])

    const approveApplication = async () =>{
        try {
            await approveVendorApplication(id,message)
            toast.success('Successfully approved status')
            dispatch(getVendorByIdThunk(id))
        } catch (error) {
            console.error('error:',error)
        }
    }

    const rejectApplication = async() =>{
        try {
            if(!message){
                toast.error("Please enter the rejection reason")
            }
            await rejectVendorAppplication(id,message)
            toast.success("Successfully rejected status")
            dispatch(getVendorByIdThunk(id))
        } catch (error) {
            console.error("Error : ",error)
        }
    }

    if (loading) {
        return (
           <Loader/>
        );
    }

    if (!vendorDetails) {
        return (
            <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden">
                <AdminSidebar />
                <main className="flex-1 flex flex-col h-full bg-[#0B0914] items-center justify-center">
                    <h2 className="text-2xl font-bold text-gray-400">Vendor Not Found</h2>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-800 bg-[#0B0914] shrink-0">
                    <div className="flex items-center text-gray-400 text-sm">
                        <Sidebar className="w-5 h-5 mr-4 text-gray-500 cursor-pointer hover:text-white" />
                        <span>Dashboard</span>
                        <span className="mx-2">&gt;</span>
                        <span className="font-medium">Vendor Applications</span>
                        <span className="mx-2">&gt;</span>
                        <span className="text-purple-400 font-medium">Review Application</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-[#151221] border border-gray-800 text-sm rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-64 transition-colors"
                                autoComplete="off"
                            />
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-purple-500 ring-2 ring-[#0B0914]" />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide flex flex-col min-h-0">

                    {/* Page Header Area */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8 shrink-0">
                        <div>
                            <div className="flex items-center space-x-4 mb-2">
                                <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#151221] hover:bg-[#2A204C] border border-gray-800 hover:border-purple-500/50 rounded-lg text-sm transition-colors text-purple-300">
                                    <ArrowLeft size={16} />
                                    <span className="hidden sm:inline">Back to list</span>
                                </button>
                                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md text-xs font-medium uppercase">
                                    {vendorDetails?.applicationStatus || 'Status'}
                                </span>
                                <span className="text-sm text-gray-500">ID: {vendorDetails?._id?.substring(0, 8) || '#'}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">Vendor Application Review</h1>
                            <p className="text-gray-400 text-sm">Submitted on {vendorDetails?.createdAt ? new Date(vendorDetails.createdAt).toLocaleDateString() : 'Date'}</p>
                        </div>

                        <div className="flex space-x-3">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-[#151221] hover:bg-[#2A204C] border border-gray-700 hover:border-purple-500/50 rounded-lg text-sm font-medium transition-colors text-gray-300">
                                <Printer size={16} />
                                <span className="hidden sm:inline">Print</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-900/20">
                                <Mail size={16} />
                                <span className="hidden sm:inline">Contact Vendor</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">

                        {/* Left Column (Main Info) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Vendor Header Card */}
                            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-6 relative z-10">
                                    <div className="relative shrink-0">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-700/50 bg-[#2A204C] flex items-center justify-center text-3xl font-bold text-purple-300">
                                            {vendorDetails?.businessName?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-[#151221] rounded-full p-1">
                                            <div className="bg-emerald-500 rounded-full p-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                                <CheckCircle size={14} className="text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-white mb-2">{vendorDetails?.businessName || 'Business Name'}</h2>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 mb-6">
                                            <div className="flex items-center space-x-1.5">
                                                <User size={14} />
                                                <span>Organizer: {vendorDetails?.organizerName || 'Name'}</span>
                                            </div>
                                            <div className="hidden sm:block w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                                            <div className="flex items-center space-x-1.5">
                                                <Calendar size={14} />
                                                <span>{vendorDetails?.experience || 'Experience Info'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1.5">Category</p>
                                                <div className="flex items-center space-x-2">
                                                    <Utensils size={16} className="text-purple-400" />
                                                    <span className="font-medium text-gray-200">{vendorDetails?.eventCategory || 'Category Name'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1.5">Phone Number</p>
                                                <div className="flex items-center space-x-2">
                                                    <Phone size={16} className="text-gray-400" />
                                                    <span className="font-medium text-gray-200">{vendorDetails?.contactPhone || 'Phone Number'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1.5">Email Address</p>
                                                <div className="flex items-center space-x-2">
                                                    <Mail size={16} className="text-gray-400" />
                                                    <span className="font-medium text-gray-200">{vendorDetails?.businessEmail || 'Email Address'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1.5">Website / Instagram</p>
                                                <div className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">
                                                    <Globe size={16} />
                                                    <span className="font-medium truncate underline-offset-4 hover:underline">
                                                        {vendorDetails?.websiteOrInstagram || 'URL/Handle'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Details Card */}
                            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6">
                                <div className="flex items-center space-x-2 mb-6">
                                    <Building size={20} className="text-purple-400" />
                                    <h3 className="text-lg font-semibold text-white">Business Details</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-400 mb-3">Short Description</h4>
                                        <div className="bg-[#0B0914] border border-gray-800/50 rounded-xl p-5 text-sm leading-relaxed text-gray-300">
                                            <p className="mb-4">
                                                {vendorDetails?.description || 'No description provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-400 mb-3">Uploaded Documents</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {vendorDetails?.businessDocument?.fileUrl && (
                                                <a href={vendorDetails.businessDocument.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 p-4 border border-gray-800 bg-[#0B0914] rounded-xl cursor-pointer hover:bg-[#2A204C]/50 hover:border-purple-500/30 transition-all duration-200 group">
                                                    <div className="p-3 bg-red-500/10 text-red-400 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-200 truncate group-hover:text-purple-100 transition-colors">Business Document</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">Click to view</p>
                                                    </div>
                                                </a>
                                            )}

                                            {vendorDetails?.idProof?.fileUrl && (
                                                <a href={vendorDetails.idProof.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 p-4 border border-gray-800 bg-[#0B0914] rounded-xl cursor-pointer hover:bg-[#2A204C]/50 hover:border-purple-500/30 transition-all duration-200 group">
                                                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-200 truncate group-hover:text-purple-100 transition-colors">ID Proof</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">Click to view</p>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Column (Sidebar) */}
                        <div className="space-y-6">

                            {/* Location Card */}
                            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6">
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                                    <h3 className="text-lg font-semibold text-white">Location Detail</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#0B0914] border border-gray-800/50 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 mb-1.5">City</p>
                                            <p className="text-sm font-medium text-gray-200">{vendorDetails?.location?.city || 'City name'}</p>
                                        </div>
                                        <div className="bg-[#0B0914] border border-gray-800/50 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 mb-1.5">State</p>
                                            <p className="text-sm font-medium text-gray-200">{vendorDetails?.location?.state || 'State name'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#0B0914] border border-gray-800/50 rounded-xl p-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1.5">Country</p>
                                            <p className="text-sm font-medium text-gray-200">{vendorDetails?.location?.country || 'Country name'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Review Action Card */}
                            <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                                <div className="flex items-center space-x-2 mb-2 mt-1">
                                    <CheckCircle size={18} className="text-purple-400" />
                                    <h3 className="text-lg font-semibold text-white">Admin Actions</h3>
                                </div>
                                <p className="text-sm text-gray-400 mb-6 font-medium">Evaluate validation details</p>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Review Notes / Reason</label>
                                        <textarea
                                        value={message}
                                        onChange={(e)=>setMessage(e.target.value)}
                                            rows={3}
                                            className="w-full bg-[#0B0914] border border-gray-700/80 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-gray-200 placeholder-gray-600 resize-none transition-all"
                                            placeholder="Add internal notes..."
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Vendor Feedback</label>
                                        <div className="relative">
                                            <select className="w-full bg-[#0B0914] border border-gray-700/80 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-gray-200 appearance-none transition-all cursor-pointer">
                                                <option value="">Select a standard response...</option>
                                                <option value="incomplete">Incomplete Documentation</option>
                                                <option value="unverified">Information Unverified</option>
                                                <option value="capacity">Category at Capacity</option>
                                                <option value="policy">Does not meet policies</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                                <ChevronRight size={14} className="text-gray-500 rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                   {vendorDetails.applicationStatus !== 'approved' ?( <div className="pt-4 space-y-3">
                                        <button onClick={approveApplication} className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                            <CheckCircle size={16} />
                                            <span>Approve Request</span>
                                        </button>
                                        <button onClick={rejectApplication} className="w-full flex items-center justify-center space-x-2 py-3 bg-[#0B0914] hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-500 rounded-xl text-sm font-semibold transition-all">
                                            <XCircle size={16} />
                                            <span>Reject Application</span>
                                        </button>
                                    </div>) :( <button className="w-full flex items-center justify-center space-x-2 py-3 bg-[#0B0914] hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-500 rounded-xl text-sm font-semibold transition-all">
                                            <XCircle size={16} />
                                            <span>Suspend Vendor</span>
                                        </button>)}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AdminVendorApplicationView;
