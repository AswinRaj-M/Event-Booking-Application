import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  HelpCircle,
  Camera,
  Check,
  Edit3,
  Store,
  Globe,
  FileText,
  Download,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Mail,
  Phone,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorPortfolioPicturesModal from "../../components/vendor/vendorPorfolioPicturesModal";
import ViewImages from "../../components/common/ViewImages";

// Asset imports
import coverImg from "../../assets/vendor/vendor_cover_image.png";
import avatarImg from "../../assets/vendor/common_avatar.png";
import { vendorProfile,
   updateVendorImages,
    addVendorPortfolio, 
    deleteVendorImage, 
    deleteVendorPortfolio,
     updateVendorProfile, 
     fetchCategories,                          
    } from "../../services/vendor.api";
import { useAsyncError } from "react-router-dom";
import { toast } from "sonner";

const VendorProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("8");
  const [businessEmail, setBusinessEmail] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [businessDocument, setBusinessDocument] = useState({});
  const [idProof, setIdProof] = useState({});
  const [aboutText, setAboutText] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [profilePic, setProfilePic] = useState(avatarImg);
  const [coverImage, setCoverImage] = useState(coverImg);
  const [portfolios, setPortfolios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const latestPortfolios = (portfolios || []).slice(-3).reverse();

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const portfolioInputRef = useRef(null);

  useEffect(() => {
    const getVendorDetails = async () => {
      setLoading(false);
      try {
        const response = await vendorProfile();
        if (response.data && response.data.success) {
          const vendorDetails = response.data.vendor;
          setBusinessName(vendorDetails.businessName);
          setOrganizerName(vendorDetails.organizerName);
          setCategory(vendorDetails.eventCategory);
          setExperience(vendorDetails.experience);
          setBusinessEmail(vendorDetails.businessEmail);
          setAboutText(vendorDetails.description);
          setSocialMedia(vendorDetails.websiteOrInstagram);
          setContactPhone(vendorDetails.contactPhone);
          setPortfolios(vendorDetails.portfolioPictures || []);
          setBusinessDocument(vendorDetails.businessDocument);
          setIdProof(vendorDetails.idProof || {});
          if (vendorDetails.profilePicture?.fileUrl) {
            setProfilePic(vendorDetails.profilePicture.fileUrl);
          }
          if (vendorDetails.coverImage?.fileUrl) {
            setCoverImage(vendorDetails.coverImage.fileUrl);
          }
        }
      } catch (error) {
        console.error("Error from Vendor profile : ", error);
        toast.error("Something went Wrong!");
      }
    };

    getVendorDetails();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        if (response.data && response.data.success) {
          setAvailableCategories(response.data.data || []);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  const handleImageChange = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, or WEBP images are allowed!");
      return;
    }

    const formData = new FormData();
    formData.append(imageType, file);

    setLoading(true);
    try {
      const response = await updateVendorImages(formData);
      if (response.data && response.data.success) {
        const vendorDetails = response.data.vendor;
        if (vendorDetails.profilePicture?.fileUrl) {
          setProfilePic(vendorDetails.profilePicture.fileUrl);
        }
        if (vendorDetails.coverImage?.fileUrl) {
          setCoverImage(vendorDetails.coverImage.fileUrl);
        }
        toast.success("Image updated successfully!");
      }
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error(error.response?.data?.message || "Failed to update image!");
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, or WEBP images are allowed!");
      return;
    }

    const formData = new FormData();
    formData.append("portfolio", file);

    setLoading(true);
    try {
      const response = await addVendorPortfolio(formData);
      if (response.data && response.data.success) {
        const vendorDetails = response.data.vendor;
        setPortfolios(vendorDetails.portfolioPictures || []);
        toast.success("Portfolio image added successfully!");
      }
    } catch (error) {
      console.error("Error uploading portfolio image:", error);
      toast.error(error.response?.data?.message || "Failed to upload portfolio image!");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (imageType) => {
    setLoading(true);
    try {
      const response = await deleteVendorImage(imageType);
      if (response.data && response.data.success) {
        if (imageType === "profilePicture") {
          setProfilePic(avatarImg);
        } else if (imageType === "coverImage") {
          setCoverImage(coverImg);
        }
        toast.success(`${imageType === "profilePicture" ? "Profile picture" : "Cover image"} removed successfully!`);
      }
    } catch (error) {
      console.error(`Error removing ${imageType}:`, error);
      toast.error("Failed to remove image!");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePortfolio = async (portfolioId) => {
    setLoading(true);
    try {
      const response = await deleteVendorPortfolio(portfolioId);
      if (response.data && response.data.success) {
        const vendorDetails = response.data.vendor;
        setPortfolios(vendorDetails.portfolioPictures || []);
        toast.success("Portfolio picture removed successfully!");
      }
    } catch (error) {
      console.error("Error removing portfolio picture:", error);
      toast.error("Failed to remove portfolio picture!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (isEditing) {
      setLoading(true);
      try {
        const response = await updateVendorProfile({
          organizerName,
          eventCategory: category,
          experience,
          description: aboutText,
          websiteOrInstagram: socialMedia,
        });
        if (response.data && response.data.success) {
          toast.success("Profile updated successfully!");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile!");
      } finally {
        setLoading(false);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleAboutChange = (e) => {
    if (e.target.value.length <= 1000) {
      setAboutText(e.target.value);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070514] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <VendorSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Top Header / Breadcrumbs */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="hover:text-zinc-200 transition-colors cursor-pointer">
              Settings
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-purple-400 font-medium cursor-pointer">
              Profile Management
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* Bell Notifications */}
            <button className="relative p-2 text-zinc-400 hover:text-white transition-all bg-zinc-900/60 hover:bg-zinc-800/60 rounded-full border border-zinc-800/80 cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
            </button>

            {/* FAQ Icon */}
            <button className="p-2 text-zinc-400 hover:text-white transition-all bg-zinc-900/60 hover:bg-zinc-800/60 rounded-full border border-zinc-800/80 cursor-pointer">
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Support Link */}
            <a
              href="#support"
              className="text-zinc-400 hover:text-purple-400 text-sm font-medium tracking-wide transition-colors duration-300"
            >
              Support
            </a>
          </div>
        </div>

        {/* Hero Banner Area */}
        <div className="relative mb-8 rounded-3xl overflow-hidden border border-zinc-800/40 bg-zinc-950 group">
          {/* Cover Image */}
          <div className="h-64 md:h-72 w-full relative overflow-hidden">
            <img
              src={coverImage}
              alt="Vendor Cover"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
            {/* Dark radial overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070514] via-transparent to-transparent opacity-60" />
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            {coverImage !== coverImg && (
              <button 
                onClick={() => handleRemoveImage("coverImage")}
                className="flex items-center gap-2 px-4 py-2 bg-rose-950/45 hover:bg-rose-900/70 backdrop-blur-md border border-rose-900/50 text-rose-300 hover:text-white rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer shadow-lg shadow-black/20"
              >
                <Trash2 className="w-4 h-4" />
                Remove Cover
              </button>
            )}
            <button 
              onClick={() => coverInputRef.current.click()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-950/60 hover:bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer shadow-lg shadow-black/20"
            >
              <Camera className="w-4 h-4" />
              Edit Cover
            </button>
          </div>
          <input
            type="file"
            ref={coverInputRef}
            onChange={(e) => handleImageChange(e, "coverImage")}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Profile Identity Info Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 mb-10 relative z-10 -mt-20 pointer-events-none">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left pointer-events-auto">
            {/* Avatar image container with overlapping styling */}
            <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-[#070514] bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.6)] group/avatar">
              <img
                src={profilePic}
                alt="Vendor Avatar"
                className="w-full h-full object-cover"
              />
              {/* Edit/Delete overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center gap-3.5 transition-opacity duration-300">
                <button 
                  onClick={() => profileInputRef.current.click()}
                  className="p-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transform translate-y-2 group-hover/avatar:translate-y-0 transition-all duration-300 cursor-pointer shadow-md"
                  title="Upload New Profile Picture"
                >
                  <Camera className="w-4.5 h-4.5" />
                </button>
                {profilePic !== avatarImg && (
                  <button 
                    onClick={() => handleRemoveImage("profilePicture")}
                    className="p-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-white transform translate-y-2 group-hover/avatar:translate-y-0 transition-all duration-300 cursor-pointer shadow-md"
                    title="Remove Profile Picture"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={profileInputRef}
                onChange={(e) => handleImageChange(e, "profilePicture")}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="mb-2">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                  {businessName}
                </h2>
                <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                  <Check className="w-3 h-3 text-purple-400 stroke-[3px]" />
                  Verified Vendor
                </div>
              </div>
              <p className="text-zinc-400 text-sm font-medium tracking-wide">
                {category}
              </p>
            </div>
          </div>

          {/* Edit Profile Action */}
          <button
            onClick={handleEditProfile}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide border cursor-pointer transition-all duration-300 shadow-md pointer-events-auto ${
              isEditing
                ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 shadow-emerald-900/20"
                : "bg-zinc-950/40 hover:bg-purple-950/20 border-purple-500/40 text-purple-300 hover:text-white shadow-purple-900/10 hover:border-purple-500/60"
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Wider Panels (Business info, description, portfolio) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Information Card */}
            <div className="bg-[#12111A]/80 backdrop-blur-md border border-zinc-800/70 p-6 rounded-2xl relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-500">
                <Store className="w-24 h-24" />
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
                  <Store className="w-5 h-5 text-purple-400" />
                  Business Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name Field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Organizer Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      className="w-full bg-[#1A1825] text-white px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  ) : (
                    <div className="w-full bg-white text-zinc-950 px-4 py-3 rounded-xl border border-zinc-200 font-bold transition-all">
                      {organizerName}
                    </div>
                  )}
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Category
                  </label>
                  {isEditing ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#1A1825] text-white px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {availableCategories && availableCategories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#1A1825] text-zinc-300 px-4 py-3 rounded-xl border border-zinc-800/80 font-medium transition-all">
                      {category}
                    </div>
                  )}
                </div>

                {/* Years of Experience Field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Years of Experience
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-[#1A1825] text-white px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  ) : (
                    <div className="w-full bg-white text-zinc-950 px-4 py-3 rounded-xl border border-zinc-200 font-bold transition-all">
                      {experience}
                    </div>
                  )}
                </div>

                {/* Website Field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Social Media
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Globe className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={socialMedia}
                        onChange={(e) => setSocialMedia(e.target.value)}
                        className="w-full bg-[#1A1825] text-white pl-11 pr-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 w-4 h-4 rounded-full bg-zinc-200 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                      </div>
                      <div className="w-full bg-white text-zinc-950 pl-11 pr-4 py-3 rounded-xl border border-zinc-200 font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                        <a href={socialMedia} target="_blank">
                          {socialMedia}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About Your Brand Card */}
            <div className="bg-[#12111A]/80 backdrop-blur-md border border-zinc-800/70 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-purple-400" />
                  About Your Brand
                </h3>
              </div>

              <div className="relative">
                <textarea
                  disabled={!isEditing}
                  value={aboutText}
                  onChange={handleAboutChange}
                  rows={5}
                  className={`w-full bg-[#1A1825]/90 text-zinc-100 p-5 rounded-2xl border transition-all duration-300 resize-none leading-relaxed text-sm ${
                    isEditing
                      ? "border-purple-500/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      : "border-zinc-800/80 cursor-default"
                  }`}
                />
                <div className="absolute bottom-4 right-5 text-[10px] font-semibold tracking-wider text-zinc-500">
                  {aboutText.length} / 1000
                </div>
              </div>
            </div>

            {/* Portfolio Highlights Card */}
            <div className="bg-[#12111A]/80 backdrop-blur-md border border-zinc-800/70 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                    Portfolio Highlights
                  </h3>
                  <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md text-xs font-semibold">
                    {portfolios?.length || 0}
                  </span>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Manage All
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of images */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {latestPortfolios &&
                  latestPortfolios.map((portfolio, index) => (
                    <div
                      key={portfolio._id || index}
                      className="relative aspect-square rounded-2xl overflow-hidden group border border-zinc-800 cursor-default bg-zinc-900"
                    >
                      <img
                        src={portfolio.fileUrl}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingImageUrl(portfolio.fileUrl);
                          }}
                          className="text-[10px] uppercase font-bold tracking-wider text-white bg-zinc-950/90 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePortfolio(portfolio._id);
                          }}
                          className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg border border-rose-500/30 hover:border-rose-500 transition-all duration-300 cursor-pointer"
                          title="Delete Portfolio Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {/* Upload Slot */}
                <div 
                  onClick={() => portfolioInputRef.current.click()}
                  className="border-2 border-dashed border-zinc-800 hover:border-purple-500/40 hover:bg-purple-950/5 rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                >
                  <div className="p-2.5 bg-zinc-900/60 rounded-xl text-zinc-400 group-hover:text-purple-400 border border-zinc-800">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Upload New
                  </span>
                  <input
                    type="file"
                    ref={portfolioInputRef}
                    onChange={handlePortfolioUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right / Narrower Panels (Stats, contact info, status) */}
          <div className="space-y-8">
            {/* Quick Stats Block */}
            <div className="grid grid-cols-2 gap-4">
              {/* Total Events */}
              <div className="bg-[#12111A]/80 backdrop-blur-md border border-zinc-800/70 p-5 rounded-2xl text-center shadow-lg hover:border-zinc-700/70 transition-all">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  42
                </span>
                <p className="text-[9px] uppercase font-extrabold tracking-widest text-zinc-500 mt-2">
                  Total Events
                </p>
              </div>

              {/* Active Bookings */}
              <div className="bg-[#12111A]/80 backdrop-blur-md border border-zinc-800/70 p-5 rounded-2xl text-center shadow-lg hover:border-zinc-700/70 transition-all relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="text-3xl font-extrabold text-purple-400 tracking-tight">
                  12
                </span>
                <p className="text-[9px] uppercase font-extrabold tracking-widest text-purple-400/80 mt-2">
                  Active Bookings
                </p>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-[#12111A]/80 backdrop-blur-md border border-zinc-800/70 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5 mb-6">
                <Phone className="w-5 h-5 text-purple-400" />
                Contact Info
              </h3>

              <div className="space-y-5">
                {/* Primary Email */}
                <div className="space-y-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500">
                    Primary Email
                  </span>
                  <div className="bg-[#1A1825]/90 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3 text-sm text-zinc-300 font-medium">
                    <Mail className="w-4 h-4 text-purple-400/80" />
                    <span>{businessEmail}</span>
                  </div>
                </div>

                {/* Business Phone */}
                <div className="space-y-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500">
                    Business Phone
                  </span>
                  <div className="bg-[#1A1825]/90 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3 text-sm text-zinc-300 font-medium">
                    <Phone className="w-4 h-4 text-purple-400/80" />
                    <span>{contactPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Verified Success Status Card */}
            <div className="bg-[#0D2218]/30 backdrop-blur-md border border-emerald-950/60 p-6 rounded-3xl relative overflow-hidden shadow-xl shadow-emerald-950/5">
              <div className="flex gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0 h-10 w-10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-emerald-400">
                    Account Verified
                  </h4>
                  <p className="text-xs text-emerald-500/85 leading-relaxed font-medium">
                    Your business credentials have been reviewed and approved.
                  </p>
                </div>
              </div>

              {/* License File Download Slot */}
              <div className="mt-5 pt-1 space-y-3">
                {/* Business Document */}
                <button 
                  onClick={() => setViewingImageUrl(businessDocument?.fileUrl)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 hover:border-purple-500 transition-colors duration-300 p-3.5 rounded-xl flex items-center gap-3 text-left cursor-pointer"
                >
                  <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 border border-zinc-800">
                    <FileText className="w-4 h-4" />
                  </div>

                  <span className="flex-1 min-w-0 text-xs font-semibold tracking-wide truncate text-zinc-300">
                    Business Document
                  </span>
                </button>

                {/* ID Proof */}
                <button 
                  onClick={() => setViewingImageUrl(idProof?.fileUrl)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 hover:border-purple-500 transition-colors duration-300 p-3.5 rounded-xl flex items-center gap-3 text-left cursor-pointer"
                >
                  <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 border border-zinc-800">
                    <FileText className="w-4 h-4" />
                  </div>

                  <span className="flex-1 min-w-0 text-xs font-semibold tracking-wide truncate text-zinc-300">
                    ID Proof
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for all portfolio images */}
      <VendorPortfolioPicturesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        portfolios={portfolios} 
        onRemove={handleRemovePortfolio}
      />

      {/* Lightbox Modal */}
      <ViewImages 
        isOpen={!!viewingImageUrl} 
        onClose={() => setViewingImageUrl(null)} 
        imageUrl={viewingImageUrl} 
        title="Portfolio Image" 
      />
    </div>
  );
};

export default VendorProfilePage;
