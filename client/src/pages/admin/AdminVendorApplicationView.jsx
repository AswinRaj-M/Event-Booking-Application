import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Printer,
  Mail,
  Utensils,
  Phone,
  Globe,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  ChevronRight,
  User,
  Calendar,
  Building,
  Sidebar,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ViewImages from "../../components/common/ViewImages";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getVendorByIdThunk } from "../../features/admin.slice";
import {
  approveVendorApplication,
  rejectVendorAppplication,
  suspendVendor,
  unsuspendVendor,
  VendorSendEmail,
} from "../../services/admin.api";
import { toast } from "sonner";
import Loader from "../../components/common/Loader";

const AdminVendorApplicationView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vendorDetails, vendorDetailsLoading: loading } = useSelector((state) => state.admin);
  const [message, setMessage] = useState("");
  const [viewingImageUrl, setViewingImageUrl] = useState(null);

  const handlePrint = () => {
    const originalTitle = document.title;
    const vendorName = vendorDetails?.businessName || "Vendor";
    document.title = `Vendor_Application_${vendorName.replace(/[^a-zA-Z0-9]/g, "_")}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  useEffect(() => {
    dispatch(getVendorByIdThunk(id));
  }, [dispatch, id]);

  const approveApplication = async () => {
    try {
      await approveVendorApplication(id, message);
      toast.success("Successfully approved status");
      setMessage("");
      dispatch(getVendorByIdThunk(id));
    } catch (error) {
      console.error("error:", error);
    }
  };


  const rejectApplication = async () => {
    try {
      if (!message) {
        return toast.error("Please enter the rejection reason");
      }
      await rejectVendorAppplication(id, message);
      toast.success("Successfully rejected status");
      setMessage("");
      dispatch(getVendorByIdThunk(id));
    } catch (error) {
      console.error("Error : ", error);
      toast.error("Something went wrong");
    }
  };

  const handleSuspendvendor = async() =>{
    try {
      if(!message) {
        return toast.error("Please enter suspention reason!")
      }
      await suspendVendor(id,message)
      toast.success("Vendor suspended Successfully!")
      setMessage("")
      dispatch(getVendorByIdThunk(id))
    } catch (error) {
      console.error("Error from suspend vendor : ",error)
      toast.error("Something went Wrong! ")
    }
  }

  const handleUnsuspendvendor = async() =>{
    try {
      await unsuspendVendor(id, message)
      toast.success("Vendor unsuspended Successfully!")
      setMessage("")
      dispatch(getVendorByIdThunk(id))
    } catch (error) {
      console.error("Error from unsuspend vendor : ",error)
      toast.error("Something went Wrong! ")
    }
  }
  const sendEmail = async() =>{
    try {
      if(!message){
        return toast.error("Please enter the message")
      }

      await VendorSendEmail(vendorDetails.businessEmail,message)
      toast.success("Email send Successfully")
      setMessage("");
      dispatch(getVendorByIdThunk(id))
    } catch (error) {
      console.error("Error from sendMail Frontend : ",error)
      toast.error("Something Went Wrong")
    }
  }

  const getStatusBadge = () => {
    if (vendorDetails?.isBlocked) {
      return {
        text: "suspended",
        className: "bg-red-500/10 text-red-500 border border-red-500/20"
      };
    }
    const status = vendorDetails?.applicationStatus;
    if (status === "approved") {
      return {
        text: "approved",
        className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
      };
    }
    if (status === "rejected") {
      return {
        text: "rejected",
        className: "bg-rose-500/10 text-rose-500 border border-rose-500/20"
      };
    }
    return {
      text: status || "Status",
      className: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
    };
  };

  const badge = getStatusBadge();

  if (loading) {
    return <Loader />;
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
    <div className="flex h-screen bg-[#0B0914] text-white font-sans overflow-hidden print:h-auto print:overflow-visible print:bg-white print:text-black">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          html, body, #root {
            background: #ffffff !important;
            color: #111827 !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card-clean {
            background-color: #ffffff !important;
            border: 1px solid #e5e7eb !important;
            color: #111827 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 1.25rem !important;
          }
          .print-box-clean {
            background-color: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
            color: #111827 !important;
          }
          .print-text-dark {
            color: #111827 !important;
          }
          .print-text-muted {
            color: #4b5563 !important;
          }
        }
      `}</style>

      {/* Sidebar */}
      <div className="print:hidden h-full">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden print:h-auto print:overflow-visible print:bg-white">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-800 bg-[#0B0914] shrink-0 print:hidden">
          <div className="flex items-center text-gray-400 text-sm">
            <Sidebar className="w-5 h-5 mr-4 text-gray-500 cursor-pointer hover:text-white" />
            <span>Dashboard</span>
            <span className="mx-2">&gt;</span>
            <span className="font-medium">Vendor Applications</span>
            <span className="mx-2">&gt;</span>
            <span className="text-purple-400 font-medium">
              Review Application
            </span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-8 scrollbar-hide flex flex-col min-h-0 print:overflow-visible print:p-0 print:h-auto">
          {/* Print Only Official Document Header */}
          <div className="hidden print:flex items-start justify-between border-b-2 border-purple-600 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Festivo Event Platform</h1>
              <p className="text-sm font-semibold text-purple-700">Vendor Application Official Record</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase border ${
                badge.text === 'approved' 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : badge.text === 'rejected' || badge.text === 'suspended'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                Status: {badge.text}
              </span>
              <p className="text-xs text-gray-500 mt-1 font-mono">App ID: {vendorDetails?._id || "N/A"}</p>
              <p className="text-xs text-gray-500">
                Submitted: {vendorDetails?.createdAt ? new Date(vendorDetails.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          {/* Page Header Area */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8 shrink-0 print:hidden">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-[#151221] hover:bg-[#2A204C] border border-gray-800 hover:border-purple-500/50 rounded-lg text-sm transition-colors text-purple-300 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Back to list</span>
                </button>
                <span className={`px-3 py-1 rounded-md text-xs font-medium uppercase ${badge.className}`}>
                  {badge.text}
                </span>
                <span className="text-sm text-gray-500 font-mono">
                  ID: {vendorDetails?._id?.substring(0, 8) || "#"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Vendor Application Review
              </h1>
              <p className="text-gray-400 text-sm">
                Submitted on{" "}
                {vendorDetails?.createdAt
                  ? new Date(vendorDetails.createdAt).toLocaleDateString()
                  : "Date"}
              </p>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-[#151221] hover:bg-[#2A204C] border border-gray-700 hover:border-purple-500/50 rounded-lg text-sm font-medium transition-colors text-gray-300 hover:text-white cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer size={16} />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button 
                onClick={() => {
                  if (vendorDetails?.businessEmail) {
                    window.location.href = `mailto:${vendorDetails.businessEmail}?subject=Regarding your Festivo Vendor Application`;
                  } else {
                    toast.error("No email address available for this vendor");
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-900/20 cursor-pointer"
              >
                <Mail size={16} />
                <span className="hidden sm:inline">Contact Vendor</span>
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 print:grid-cols-1 print:gap-4">
            {/* Left Column (Main Info) */}
            <div className="lg:col-span-2 space-y-6 print:space-y-4">
              {/* Vendor Header Card */}
              <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden print-card-clean">
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
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {vendorDetails?.businessName || "Business Name"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 mb-6">
                      <div className="flex items-center space-x-1.5">
                        <User size={14} />
                        <span>
                          Organizer: {vendorDetails?.organizerName || "Name"}
                        </span>
                      </div>
                      <div className="hidden sm:block w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar size={14} />
                        <span>
                          {vendorDetails?.experience || "Experience Info"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Category</p>
                        <div className="flex items-center space-x-2">
                          <Utensils size={16} className="text-purple-400" />
                          <span className="font-medium text-gray-200">
                            {vendorDetails?.eventCategory || "Category Name"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          Phone Number
                        </p>
                        <div className="flex items-center space-x-2">
                          <Phone size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-200">
                            {vendorDetails?.contactPhone || "Phone Number"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          Email Address
                        </p>
                        <div className="flex items-center space-x-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-200">
                            {vendorDetails?.businessEmail || "Email Address"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">
                          Website / Instagram
                        </p>
                        <div className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">
                          <Globe size={16} />
                          <span className="font-medium truncate underline-offset-4 hover:underline">
                           <a href={vendorDetails?.websiteOrInstagram || "URL/Handle"} target="_blank"> {vendorDetails?.websiteOrInstagram || "URL/Handle"}</a>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Details Card */}
              <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 print-card-clean">
                <div className="flex items-center space-x-2 mb-6">
                  <Building size={20} className="text-purple-400" />
                  <h3 className="text-lg font-semibold text-white print-text-dark">
                    Business Details
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3 print-text-muted">
                      Short Description
                    </h4>
                    <div className="bg-[#0B0914] border border-gray-800/50 rounded-xl p-5 text-sm leading-relaxed text-gray-300 print-box-clean">
                      <p className="mb-4">
                        {vendorDetails?.description ||
                          "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3 print-text-muted">
                      Uploaded Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vendorDetails?.businessDocument?.fileUrl ? (
                        <button
                          onClick={() => setViewingImageUrl(vendorDetails.businessDocument.fileUrl)}
                          className="flex items-center space-x-4 p-4 border border-gray-800 bg-[#0B0914] rounded-xl cursor-pointer hover:bg-[#2A204C]/50 hover:border-purple-500/30 transition-all duration-200 group text-left font-sans w-full print-box-clean"
                        >
                          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg group-hover:bg-red-500/20 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate group-hover:text-purple-100 transition-colors print-text-dark">
                              Business Document
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 print-text-muted">
                              Attached
                            </p>
                          </div>
                        </button>
                      ) : (
                        <div className="p-4 border border-gray-800/50 bg-[#0B0914] rounded-xl text-xs text-gray-500 print-box-clean">
                          No Business Document uploaded
                        </div>
                      )}

                      {vendorDetails?.idProof?.fileUrl ? (
                        <button
                          onClick={() => setViewingImageUrl(vendorDetails.idProof.fileUrl)}
                          className="flex items-center space-x-4 p-4 border border-gray-800 bg-[#0B0914] rounded-xl cursor-pointer hover:bg-[#2A204C]/50 hover:border-purple-500/30 transition-all duration-200 group text-left font-sans w-full print-box-clean"
                        >
                          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <ImageIcon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate group-hover:text-purple-100 transition-colors print-text-dark">
                              ID Proof
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 print-text-muted">
                              Attached
                            </p>
                          </div>
                        </button>
                      ) : (
                        <div className="p-4 border border-gray-800/50 bg-[#0B0914] rounded-xl text-xs text-gray-500 print-box-clean">
                          No ID Proof uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6 print:space-y-4">
              {/* Location Card */}
              <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 print-card-clean">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                  <h3 className="text-lg font-semibold text-white print-text-dark">
                    Location Detail
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0B0914] border border-gray-800/50 rounded-xl p-4 print-box-clean">
                      <p className="text-xs text-gray-500 mb-1.5 print-text-muted">City</p>
                      <p className="text-sm font-medium text-gray-200 print-text-dark">
                        {vendorDetails?.location?.city || "City name"}
                      </p>
                    </div>
                    <div className="bg-[#0B0914] border border-gray-800/50 rounded-xl p-4 print-box-clean">
                      <p className="text-xs text-gray-500 mb-1.5 print-text-muted">State</p>
                      <p className="text-sm font-medium text-gray-200 print-text-dark">
                        {vendorDetails?.location?.state || "State name"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#0B0914] border border-gray-800/50 rounded-xl p-4 flex justify-between items-center print-box-clean">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5 print-text-muted">Country</p>
                      <p className="text-sm font-medium text-gray-200 print-text-dark">
                        {vendorDetails?.location?.country || "Country name"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Review Action Card */}
              <div className="bg-[#151221] border border-gray-800/80 rounded-xl p-6 relative overflow-hidden print:hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                <div className="flex items-center space-x-2 mb-2 mt-1">
                  <CheckCircle size={18} className="text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Admin Actions
                  </h3>
                </div>
                <p className="text-sm text-gray-400 mb-6 font-medium">
                  Evaluate validation details
                </p>

                <div className="space-y-5">
                  {vendorDetails?.applicationStatus !== "rejected" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Review Notes / Reason
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={3}
                          className="w-full bg-[#0B0914] border border-gray-700/80 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-gray-200 placeholder-gray-600 resize-none transition-all"
                          placeholder="Add internal notes..."
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Vendor Feedback
                        </label>
                        <div className="relative">
                          <select className="w-full bg-[#0B0914] border border-gray-700/80 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-gray-200 appearance-none transition-all cursor-pointer">
                            <option value="">Select a standard response...</option>
                            <option value="incomplete">
                              Incomplete Documentation
                            </option>
                            <option value="unverified">
                              Information Unverified
                            </option>
                            <option value="capacity">Category at Capacity</option>
                            <option value="policy">Does not meet policies</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                            <ChevronRight
                              size={14}
                              className="text-gray-500 rotate-90"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {vendorDetails.applicationStatus === "approved" ? (
                    vendorDetails.isBlocked ? (
                      <button onClick={handleUnsuspendvendor} className="w-full flex items-center justify-center space-x-2 py-3 bg-[#0B0914] hover:bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 text-emerald-500 rounded-xl text-sm font-semibold transition-all">
                        <CheckCircle size={16} />
                        <span>Unsuspend Vendor</span>
                      </button>
                    ) : (
                      <button onClick={handleSuspendvendor} className="w-full flex items-center justify-center space-x-2 py-3 bg-[#0B0914] hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-500 rounded-xl text-sm font-semibold transition-all">
                        <XCircle size={16} />
                        <span>Suspend Vendor</span>
                      </button>
                    )
                  ) : vendorDetails.applicationStatus === "rejected" ? (
                    <div className="pt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Send Email To Vendor
                        </label>

                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          className="w-full bg-[#0B0914] border border-gray-700/80 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-gray-200 placeholder-gray-600 resize-none"
                          placeholder="Type your email message..."
                        />
                      </div>

                      <button
                        onClick={sendEmail}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all"
                      >
                        <Mail size={16} />
                        <span>Send Email</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-3">
                      <button
                        onClick={approveApplication}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      >
                        <CheckCircle size={16} />
                        <span>Approve Request</span>
                      </button>

                      <button
                        onClick={rejectApplication}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-[#0B0914] hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-500 rounded-xl text-sm font-semibold transition-all"
                      >
                        <XCircle size={16} />
                        <span>Reject Application</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Print Only Footer */}
          <div className="hidden print:block text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-300">
            <p className="font-semibold text-gray-700">Festivo Event Booking Platform &bull; Confidential Vendor Application</p>
            <p className="mt-0.5">Printed on {new Date().toLocaleString()}</p>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      <ViewImages 
        isOpen={!!viewingImageUrl} 
        onClose={() => setViewingImageUrl(null)} 
        imageUrl={viewingImageUrl} 
        title="Vendor Document" 
      />
    </div>
  );
};

export default AdminVendorApplicationView;
