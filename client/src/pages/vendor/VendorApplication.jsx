import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import { Building2, Info, MapPin, Upload } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { vendorApplicationThunk, vendorClearMessages } from "../../features/vendorSlice";
import { useEffect } from "react";
import { toast } from "sonner";
import Loader from "../../components/common/Loader";
import { ROUTES } from "../../constants/routes";

const VendorApplication = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, success, error } = useSelector((state) => state.vendor);
    const [form, setForm] = useState({
        organizerName: "",
        businessName: "",
        businessEmail: "",
        password: "",
        confirmPassword: "",
        contactPhone: "",
        eventCategory: "",
        experience: "",
        description: "",
        websiteOrInstagram: "",
        city: "",
        state: "",
        country: "",
    });

    const [businessDocument, setBusinessDocument] = useState(null);
    const [idProof, setIdProof] = useState(null);
    const [agreeTermsAndConditions, setAgreeTermsAndConditions] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors = {};
        if (!form.organizerName.trim())
            newErrors.organizerName = "Organizer name required";
        else if (form.organizerName.trim().length < 3)
            newErrors.organizerName = "Organizer name must be at least 3 characters";

        if (!form.businessName.trim())
            newErrors.businessName = "Business name required";

        if (!form.businessEmail.trim()) newErrors.businessEmail = "Email required";

        if (!form.contactPhone.trim()) newErrors.contactPhone = "Phone required";
        else if (!/^[\+\d\s\(\)\-]{10,20}$/.test(form.contactPhone.trim()))
            newErrors.contactPhone = "Invalid phone number format";

        if (!form.password) newErrors.password = "Password required";
        else if (form.password.length < 6)
            newErrors.password = "Password must be at least 6 characters";

        if (form.password !== form.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        if (!form.eventCategory) newErrors.eventCategory = "Select category";

        if (!form.experience) newErrors.experience = "Select experience";

        if (!form.description.trim())
            newErrors.description = "Description required";
        else if (form.description.trim().length < 20)
            newErrors.description = "Description must be at least 20 characters long";

        if (!form.city.trim()) newErrors.city = "City required";

        if (!form.state.trim()) newErrors.state = "State required";

        if (!form.country) newErrors.country = "Country required";

        if (!businessDocument)
            newErrors.businessDocument = "Business document required";

        if (!idProof) newErrors.idProof = "ID proof required";

        if (!agreeTermsAndConditions)
            newErrors.agreeTermsAndConditions = "You must accept terms";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            toast.error(firstError);
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const formData = new FormData();

        formData.append("organizerName", form.organizerName.trim());
        formData.append("businessName", form.businessName.trim());
        formData.append("businessEmail", form.businessEmail.trim());
        formData.append("contactPhone", form.contactPhone.trim());
        formData.append("password", form.password);
        formData.append("eventCategory", form.eventCategory);
        formData.append("experience", form.experience);
        formData.append("description", form.description.trim());
        formData.append("websiteOrInstagram", form.websiteOrInstagram.trim());
        formData.append("agreeTermsAndConditions", agreeTermsAndConditions);
        formData.append(
            "location",
            JSON.stringify({
                city: form.city.trim(),
                state: form.state.trim(),
                country: form.country,
            }),
        );
        formData.append("businessDocument", businessDocument);
        formData.append("idProof", idProof);

        dispatch(vendorApplicationThunk(formData));
    };

    useEffect(() => {
        dispatch(vendorClearMessages());
        return () => {
            dispatch(vendorClearMessages());
        };
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success("Application submitted successfully!");
            dispatch(vendorClearMessages());
            navigate(ROUTES.VENDOR_STATUS, {
                state: {
                    businessName: form.businessName,
                },
            });
        }
    }, [success, dispatch, navigate, form.businessName]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-violet-500/30">
            {/* Navigation Layer */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="EventConnect Logo"
                            className="w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                        />
                        <span className="text-white font-bold text-2xl tracking-tight">
                            Festivo
                        </span>
                    </div>

                    {/* Center Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            to="#"
                            className="text-gray-400 hover:text-white transition text-sm"
                        >
                            How it works
                        </Link>
                        <Link
                            to="#"
                            className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1"
                        >
                            <span className="w-2 h-2 rounded-full bg-violet-500"></span>{" "}
                            Benefits
                        </Link>
                        <Link
                            to="#"
                            className="text-gray-400 hover:text-white transition text-sm"
                        >
                            Support
                        </Link>
                    </div>

                    {/* Right Links */}
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-gray-400 text-sm">Already a vendor?</span>
                        <Link
                            to={ROUTES.LOGIN}
                            className="text-white hover:text-violet-400 transition text-sm font-medium"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pt-32 pb-20 px-4 flex flex-col items-center">
                {/* Header Titles */}
                <div className="text-center mb-10 space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                        Apply to Become a Vendor
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Join our curated network of top-tier event professionals. Grow your
                        business and reach thousands of event organizers.
                    </p>
                </div>

                {/* Outer Form Card Box */}
                <div className="w-full max-w-3xl bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Top Violet Gradient Border Effect */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-100 to-indigo-600"></div>

                    {/* Form Content Wrapper */}
                    <div className="p-8 md:p-10">
                        <div className="mb-10 text-center border-b border-white/5 pb-8">
                            <h2 className="text-2xl font-semibold text-white mb-2">
                                Vendor Application
                            </h2>
                            <p className="text-sm text-gray-500">
                                Please fill out the form below accurately. All fields marked
                                with * are required.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* --- Section 1: Business Information --- */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-violet-400 mb-4">
                                    <Building2 size={20} />
                                    <h3 className="text-lg font-medium">Business Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Organizer Name */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Organizer Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="e.g. John Doe"
                                                name="organizerName"
                                                value={form.organizerName}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className="error">{errors.organizerName}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Name */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Business Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="e.g. Elite Catering Services"
                                                name="businessName"
                                                value={form.businessName}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className="error">{errors.businessName}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <div className="w-4 h-4 rounded-[3px] border-2 border-gray-600"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Business Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="email"
                                                placeholder="contact@business.com"
                                                name="businessEmail"
                                                value={form.businessEmail}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className="error">{errors.businessEmail}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="tel"
                                                placeholder="10 digit number"
                                                name="contactPhone"
                                                autoComplete="tel"
                                                value={form.contactPhone}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className="error">{errors.contactPhone}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                name="password"
                                                autoComplete="new-password"
                                                value={form.password}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className="error">{errors.password}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                name="confirmPassword"
                                                autoComplete="new-password"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className="error">{errors.confirmPassword}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Event Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="eventCategory"
                                                value={form.eventCategory}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            >
                                                <option value="" disabled className="text-gray-600">
                                                    Select a category
                                                </option>
                                                <option value="catering">Catering & Food</option>
                                                <option value="photography">Photography & Video</option>
                                                <option value="decor">Decor & Design</option>
                                                <option value="music">Music & Entertainment</option>
                                                <option value="venue">Venue & Locations</option>
                                            </select>
                                            <p className="error">{errors.eventCategory}</p>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Years of Experience{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="experience"
                                                value={form.experience}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            >
                                                <option value="" disabled className="text-gray-600">
                                                    Select experience
                                                </option>
                                                <option value="0-2">0-2 Years</option>
                                                <option value="3-5">3-5 Years</option>
                                                <option value="5-10">5-10 Years</option>
                                                <option value="10+">10+ Years</option>
                                            </select>
                                            <p className="error">{errors.experience}</p>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* --- Section 2: Business Details --- */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-violet-400 mb-4">
                                    <Info size={20} />
                                    <h3 className="text-lg font-medium">Business Details</h3>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        Short Description <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            rows="4"
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="Tell us about your services..."
                                            className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none"
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end">
                                        <span className="text-xs text-gray-500">
                                            {form.description.length}/500 chars
                                        </span>
                                    </div>
                                    <p className="error">{errors.description}</p>
                                </div>

                                {/* File Uploads */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Business Document <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            id="businessDocument"
                                            className="hidden"
                                            onChange={(e) => setBusinessDocument(e.target.files[0])}
                                        />
                                        <div
                                            onClick={() => document.getElementById("businessDocument").click()}
                                            className="cursor-pointer border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition"
                                        >
                                            <Upload size={20} className="text-gray-500" />
                                            <span className="text-xs text-gray-400">
                                                {businessDocument ? businessDocument.name : "Upload Document"}
                                            </span>
                                        </div>
                                        {errors.businessDocument && <p className="error">{errors.businessDocument}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            ID Proof <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            id="idProof"
                                            className="hidden"
                                            onChange={(e) => setIdProof(e.target.files[0])}
                                        />
                                        <div
                                            onClick={() => document.getElementById("idProof").click()}
                                            className="cursor-pointer border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition"
                                        >
                                            <Upload size={20} className="text-gray-500" />
                                            <span className="text-xs text-gray-400">
                                                {idProof ? idProof.name : "Upload ID Proof"}
                                            </span>
                                        </div>
                                        {errors.idProof && <p className="error">{errors.idProof}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* --- Section 3: Location --- */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-violet-400 mb-4">
                                    <MapPin size={20} />
                                    <h3 className="text-lg font-medium">Location</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" className="bg-[#121212] border border-white/5 rounded-xl px-4 py-3 text-sm" />
                                    <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="State" className="bg-[#121212] border border-white/5 rounded-xl px-4 py-3 text-sm" />
                                    <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="Country" className="bg-[#121212] border border-white/5 rounded-xl px-4 py-3 text-sm" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="agree"
                                    checked={agreeTermsAndConditions}
                                    onChange={(e) => setAgreeTermsAndConditions(e.target.checked)}
                                />
                                <label htmlFor="agree" className="text-xs text-gray-400">I agree to the terms and conditions</label>
                            </div>
                            {errors.agreeTermsAndConditions && <p className="error">{errors.agreeTermsAndConditions}</p>}

                            <button
                                type="submit"
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-4 rounded-xl transition"
                            >
                                {loading ? "Submiting..." : "Submit Application"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/5 py-8 mt-10">
                <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500">
                        © 2024 EventConnect Platform. All rights reserved.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                        <Link to="#" className="hover:text-gray-400 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="#" className="hover:text-gray-400 transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default VendorApplication;
