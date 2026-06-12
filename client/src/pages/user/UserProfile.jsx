import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../../components/layout/Navbar";
import UserSideBar from "../../components/user/UserSideBar";
import { User, Mail, Wallet, Calendar, Pencil, KeyRound, CheckCircle, Shield, Sparkles, Phone, Camera, Loader2 } from "lucide-react";
import { updateUserData } from "../../features/user.slice";
import { getUserProfile, updateUserProfile, updateUserProfilePicture } from "../../services/user.api";
import { toast } from "sonner";
import avatarImg from "../../assets/vendor/common_avatar.png";

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit details states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch real profile details on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        if (response.data?.success) {
          dispatch(updateUserData(response.data.user));
        }
      } catch (error) {
        toast.error("Failed to load user profile");
      }
    };
    fetchProfile();
  }, [dispatch]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    setIsUploading(true);
    const toastId = toast.loading("Uploading profile picture...");

    try {
      const response = await updateUserProfilePicture(formData);
      if (response.data?.success) {
        dispatch(updateUserData(response.data.user));
        toast.success("Profile picture updated successfully", { id: toastId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload profile picture", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEditModal = () => {
    setFullName(user?.fullName || "");
    setPhoneNumber(user?.phoneNumber || "");
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateUserProfile({ fullName, phoneNumber });
      if (response.data?.success) {
        dispatch(updateUserData(response.data.user));
        toast.success("Profile updated successfully");
        setIsEditModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Format user ID to look like: usr-XXXXXX-x
  const formattedUserId = user?.id 
    ? `usr-${user.id.substring(user.id.length - 8)}-x` 
    : "usr-003920-x";

  // Format member since date
  const memberSinceDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "January 2026";

  return (
    <div className="flex min-h-screen bg-[#03010a] text-white font-sans selection:bg-purple-600/30 overflow-hidden relative">
      <Navbar />
      
      {/* Premium Background Ambient Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo-900/15 rounded-full blur-[180px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[30%] left-[40%] w-[450px] h-[450px] bg-fuchsia-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-violet-950/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid line effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f123510_1px,transparent_1px),linear-gradient(to_bottom,#1f123510_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Sidebar */}
      <UserSideBar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 pt-28 pb-16 px-8 md:px-12 relative z-10 flex flex-col justify-center items-center min-h-screen">
        <div className="max-w-4xl w-full space-y-8">
          
          {/* Header Card (Glassmorphism & Neon Glow) */}
          <div className="bg-[#0b061e]/40 backdrop-blur-xl border border-purple-500/15 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] hover:border-purple-500/25 transition-all duration-500 relative group overflow-hidden">
            {/* Top gradient highlight bar */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-purple-500 to-fuchsia-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-y-0 -left-10 w-28 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[600%] transition-transform duration-[1.5s] ease-in-out" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              {/* Glowing Avatar */}
              <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-600 opacity-60 blur-md group-hover/avatar:opacity-100 transition duration-500" />
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-purple-500/40 p-1 bg-[#05030b] relative z-10 shadow-[0_0_35px_rgba(147,51,234,0.3)] transition-all duration-500">
                  <img 
                    src={user?.profilePicture?.fileUrl || avatarImg} 
                    alt="User Avatar" 
                    className="w-full h-full rounded-full object-cover transform scale-100 group-hover/avatar:scale-105 transition duration-500"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 z-20">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white mb-1" />
                    )}
                    <span className="text-[9px] uppercase font-bold tracking-widest text-gray-300">
                      {isUploading ? "Uploading" : "Change"}
                    </span>
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 w-4.5 h-4.5 bg-green-500 border-3 border-[#0b061e] rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] z-20" />
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              {/* Profile Meta Info */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="bg-purple-950/40 text-purple-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-purple-500/20 tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Premium Member
                  </span>
                  <span className="bg-white/5 text-zinc-400 text-[10px] font-semibold px-3 py-1 rounded-full border border-white/5 tracking-wider">
                    {formattedUserId}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight bg-clip-text bg-gradient-to-r from-white via-white to-purple-200">
                  {user?.fullName || "Guest User"}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 font-medium pt-0.5">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span>Joined {memberSinceDate}</span>
                </div>
              </div>
            </div>

            {/* Actions (Edit, Password) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button 
                onClick={handleOpenEditModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all duration-300 font-bold text-sm cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.07] text-white rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 font-bold text-sm cursor-pointer">
                <KeyRound className="w-4 h-4 text-purple-400" />
                Change Password
              </button>
            </div>
          </div>

          {/* Grid Layout for Personal Info & Wallet */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Wallet Widget Card (styled like a premium credit/debit card) */}
            <div className="lg:col-span-1 bg-gradient-to-br from-[#1b0a3a] via-[#0b031b] to-[#04010a] border border-purple-500/15 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-purple-500/30 transition-all duration-500 relative group flex flex-col justify-between overflow-hidden h-[280px]">
              {/* Background abstract glowing circles */}
              <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] bg-purple-500/10 rounded-full blur-[30px] group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[120px] h-[120px] bg-indigo-500/10 rounded-full blur-[25px]" />
              
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-[10px] text-purple-300 uppercase tracking-widest font-extrabold">Active Balance</span>
                  <span className="text-zinc-500 text-[10px] font-bold tracking-widest mt-0.5">EVENTFLOW PAY</span>
                </div>
                {/* Premium Card Chip SVG */}
                <div className="w-10 h-8 bg-gradient-to-br from-yellow-600 to-amber-300 rounded-md p-1.5 opacity-80 shadow-md">
                  <div className="w-full h-full border border-yellow-800/40 rounded flex flex-col justify-between">
                    <div className="h-[2px] bg-yellow-900/20" />
                    <div className="h-[2px] bg-yellow-900/20" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-4">
                <div className="text-xs text-zinc-400 font-semibold mb-1">Available Funds</div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300 tracking-tight flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-purple-400">$</span>
                  <span>{(user?.walletBalance !== undefined ? user.walletBalance : 0.0).toFixed(2)}</span>
                </div>
              </div>

              <div className="relative z-10 flex items-end justify-between border-t border-purple-500/10 pt-4 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Card Holder</span>
                  <span className="text-xs font-semibold text-white tracking-wide truncate max-w-[120px]">{user?.fullName || "Guest User"}</span>
                </div>
                {/* Contactless payment logo SVG / styling */}
                <div className="flex items-center gap-1 opacity-60">
                  <div className="w-3.5 h-3.5 rounded-full bg-purple-500" />
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 -ml-2.5 opacity-80" />
                </div>
              </div>
            </div>

            {/* Personal Info Cards Container */}
            <div className="lg:col-span-2 bg-[#080417]/45 backdrop-blur-xl border border-purple-500/15 rounded-[2rem] p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5)] hover:border-purple-500/25 transition-all duration-500 relative group flex flex-col justify-between">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <h2 className="text-lg font-bold tracking-wide text-white flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-purple-500" />
                  Account Security & Info
                </h2>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* Info Details fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                {/* Name Card */}
                <div className="bg-[#0b0621]/30 border border-purple-500/5 hover:border-purple-500/15 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400/80 mb-2">Display Name</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-white text-sm font-semibold tracking-wide truncate">{user?.fullName || "Guest User"}</span>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-[#0b0621]/30 border border-purple-500/5 hover:border-purple-500/15 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400/80 mb-2">Email Address</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-white text-sm font-semibold tracking-wide truncate">{user?.email || "Not Provided"}</span>
                  </div>
                </div>

                {/* Phone Number Card */}
                <div className="bg-[#0b0621]/30 border border-purple-500/5 hover:border-purple-500/15 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400/80 mb-2">Phone Number</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-white text-sm font-semibold tracking-wide truncate">{user?.phoneNumber || "Not Provided"}</span>
                  </div>
                </div>

                {/* Account Status Card */}
                <div className="bg-[#0b0621]/30 border border-purple-500/5 hover:border-purple-500/15 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400/80 mb-2">Verification Status</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400">
                      Account Verified & Active
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsEditModalOpen(false)}
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-[#0d0722]/95 border border-purple-500/20 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Top gradient highlight */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-purple-500 to-fuchsia-500" />
            
            <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-purple-400" />
              Edit Profile
            </h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#04020a]/80 text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 hover:border-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-[#04020a]/80 text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 hover:border-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all duration-300 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
