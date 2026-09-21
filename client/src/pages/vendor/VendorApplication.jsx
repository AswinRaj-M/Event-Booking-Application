import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';
import { Building2, Info, MapPin, Upload, AlertCircle, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { vendorApplicationThunk, vendorClearMessages, vendorLogoutState } from '../../features/vendorSlice';
import { logoutUserState } from '../../features/user.slice';
import Loader from '../../components/common/Loader';
import { toast } from 'sonner';
import { getAllCategories } from '../../services/common.api';
import { COMMON_ROUTES } from '../../constants/Routes';

const VendorApplication = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.vendor);

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

    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [businessDocument, setBusinessDocument] = useState(null);
    const [idProof, setIdProof] = useState(null);
    const [agreeTermsAndConditions, setAgreeTermsAndConditions] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Scroll to top and ensure smooth scroll/native scroll is active on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        if (window.lenis) {
            window.lenis.start();
            window.lenis.scrollTo(0, { immediate: true });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleBusinessDocChange = (file) => {
        if (!file) return;
        const validExts = ['pdf', 'png', 'jpg', 'jpeg', 'svg'];
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!validExts.includes(fileExt)) {
            setErrors(prev => ({ ...prev, businessDocument: "Allowed formats: PDF, PNG, JPG, JPEG, SVG" }));
            toast.error("Invalid file type for Business Document");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, businessDocument: "Document size must not exceed 10MB" }));
            toast.error("Business Document exceeds 10MB limit");
            return;
        }
        setBusinessDocument(file);
        setErrors(prev => ({ ...prev, businessDocument: "" }));
    };

    const handleIdProofChange = (file) => {
        if (!file) return;
        const validExts = ['pdf', 'png', 'jpg', 'jpeg'];
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!validExts.includes(fileExt)) {
            setErrors(prev => ({ ...prev, idProof: "Allowed formats: PDF, PNG, JPG, JPEG" }));
            toast.error("Invalid file type for ID Proof");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, idProof: "ID Proof size must not exceed 10MB" }));
            toast.error("ID Proof exceeds 10MB limit");
            return;
        }
        setIdProof(file);
        setErrors(prev => ({ ...prev, idProof: "" }));
    };

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            if (response.data && response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories for vendor application page", error);
            toast.error("Failed to Fetch Categories");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        // Organizer Name
        if (!form.organizerName.trim()) {
            newErrors.organizerName = "Organizer name is required";
        } else if (form.organizerName.trim().length < 3) {
            newErrors.organizerName = "Organizer name must be at least 3 characters";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(form.organizerName.trim())) {
            newErrors.organizerName = "Organizer name can only contain letters and spaces";
        }

        // Business Name
        if (!form.businessName.trim()) {
            newErrors.businessName = "Business name is required";
        } else if (form.businessName.trim().length < 3) {
            newErrors.businessName = "Business name must be at least 3 characters";
        }

        // Business Email
        if (!form.businessEmail.trim()) {
            newErrors.businessEmail = "Business email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail.trim())) {
            newErrors.businessEmail = "Please enter a valid business email address";
        }

        // Phone Number
        if (!form.contactPhone.trim()) {
            newErrors.contactPhone = "Phone number is required";
        } else {
            const digits = form.contactPhone.replace(/\D/g, "");
            if (digits.length < 10 || digits.length > 15) {
                newErrors.contactPhone = "Please enter a valid phone number (10-15 digits)";
            }
        }

        // Password
        if (!form.password) {
            newErrors.password = "Password is required";
        } else if (form.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(form.password)) {
            newErrors.password = "Include uppercase, lowercase, number & special character";
        }

        // Confirm Password
        if (!form.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (form.confirmPassword !== form.password) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Event Category
        if (!form.eventCategory) {
            newErrors.eventCategory = "Please select an event category";
        }

        // Experience
        if (!form.experience) {
            newErrors.experience = "Please select years of experience";
        }

        // Description
        if (!form.description.trim()) {
            newErrors.description = "Business description is required";
        } else if (form.description.trim().length < 20) {
            newErrors.description = "Description must be at least 20 characters";
        } else if (form.description.trim().length > 500) {
            newErrors.description = "Description cannot exceed 500 characters";
        }

        // Website or Instagram
        if (form.websiteOrInstagram.trim()) {
            const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/i;
            if (!urlPattern.test(form.websiteOrInstagram.trim()) && !form.websiteOrInstagram.startsWith("@")) {
                newErrors.websiteOrInstagram = "Please enter a valid URL or @handle";
            }
        }

        // Documents
        if (!businessDocument) {
            newErrors.businessDocument = "Business verification document is required";
        }
        if (!idProof) {
            newErrors.idProof = "Government ID proof is required";
        }

        // Location
        if (!form.city.trim()) {
            newErrors.city = "City is required";
        }
        if (!form.state.trim()) {
            newErrors.state = "State/Province is required";
        }
        if (!form.country) {
            newErrors.country = "Please select a country";
        }

        // Terms and conditions
        if (!agreeTermsAndConditions) {
            newErrors.agreeTermsAndConditions = "You must agree to the Vendor Terms and Conditions";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            const firstKey = Object.keys(validationErrors)[0];
            toast.error(validationErrors[firstKey] || "Please fill in all required fields correctly");

            // Scroll smoothly to the first error input
            const targetElement =
                document.querySelector(`[name="${firstKey}"]`) ||
                document.getElementById(`${firstKey}Upload`) ||
                document.getElementById(firstKey);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (typeof targetElement.focus === 'function') {
                    targetElement.focus();
                }
            }
            return;
        }

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
                country: form.country
            })
        );
        formData.append("businessDocument", businessDocument);
        formData.append("idProof", idProof);

        try {
            const data = await dispatch(vendorApplicationThunk(formData)).unwrap();
            dispatch(vendorLogoutState());
            dispatch(logoutUserState());
            navigate(COMMON_ROUTES.VERIFY_OTP, {
                state: {
                    userId: data.vendorId,
                    email: data.email,
                    isVendor: true
                },
                replace: true
            });
            dispatch(vendorClearMessages());
        } catch (err) {
            toast.error(err || "Failed to submit application");
            dispatch(vendorClearMessages());
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-violet-500/30 overflow-x-hidden relative">
            {/* Navigation Layer */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src={logo}
                            alt="Festivo Logo"
                            className="w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform"
                        />
                        <span className="text-white font-bold text-2xl tracking-tight">Festivo</span>
                    </Link>

                    {/* Center Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="#" className="text-gray-400 hover:text-white transition text-sm">How it works</Link>
                        <Link to="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-violet-500"></span> Benefits
                        </Link>
                        <Link to="#" className="text-gray-400 hover:text-white transition text-sm">Support</Link>
                    </div>

                    {/* Right Links */}
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-gray-400 text-sm">Already a vendor?</span>
                        <Link to={COMMON_ROUTES.LOGIN} className="text-white hover:text-violet-400 transition text-sm font-medium">Login</Link>
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
                        Join our curated network of top-tier event professionals. Grow your business and reach thousands of event organizers.
                    </p>
                </div>

                {/* Outer Form Card Box */}
                <div className="w-full max-w-3xl bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Top Violet Gradient Border Effect */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"></div>

                    {/* Form Content Wrapper */}
                    <div className="p-8 md:p-10">
                        <div className="mb-10 text-center border-b border-white/5 pb-8">
                            <h2 className="text-2xl font-semibold text-white mb-2">Vendor Application</h2>
                            <p className="text-sm text-gray-500">Please fill out the form below accurately. All fields marked with * are required.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
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
                                                name='organizerName'
                                                value={form.organizerName}
                                                onChange={handleChange}
                                                className={`w-full bg-[#121212] border ${
                                                    errors.organizerName 
                                                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                        : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                                } rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all`}
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                        </div>
                                        {errors.organizerName && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.organizerName}</span>
                                            </p>
                                        )}
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
                                                name='businessName'
                                                value={form.businessName}
                                                onChange={handleChange}
                                                className={`w-full bg-[#121212] border ${
                                                    errors.businessName 
                                                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                        : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                                } rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all`}
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <div className="w-4 h-4 rounded-[3px] border-2 border-gray-600"></div>
                                            </div>
                                        </div>
                                        {errors.businessName && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.businessName}</span>
                                            </p>
                                        )}
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
                                                name='businessEmail'
                                                value={form.businessEmail}
                                                onChange={handleChange}
                                                className={`w-full bg-[#121212] border ${
                                                    errors.businessEmail 
                                                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                        : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                                } rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all`}
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>
                                        {errors.businessEmail && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.businessEmail}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="tel"
                                                placeholder="+91 9876543210"
                                                name='contactPhone'
                                                autoComplete='tel'
                                                value={form.contactPhone}
                                                onChange={handleChange}
                                                className={`w-full bg-[#121212] border ${
                                                    errors.contactPhone 
                                                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                        : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                                } rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all`}
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            </div>
                                        </div>
                                        {errors.contactPhone && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.contactPhone}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                name='password'
                                                autoComplete='new-password'
                                                value={form.password}
                                                onChange={handleChange}
                                                className={`w-full bg-[#121212] border ${
                                                    errors.password 
                                                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                        : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                                } rounded-xl px-4 py-3.5 pl-10 pr-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all`}
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.password}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                name='confirmPassword'
                                                autoComplete='new-password'
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full bg-[#121212] border ${
                                                    errors.confirmPassword 
                                                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                        : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                                } rounded-xl px-4 py-3.5 pl-10 pr-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all`}
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.confirmPassword}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Event Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name='eventCategory'
                                                value={form.eventCategory}
                                                onChange={handleChange}
                                                className={`w-full bg-[#121212] border ${
                                                    errors.eventCategory 
                                                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                        : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                                } rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-1 transition-all cursor-pointer`}
                                            >
                                                <option value="" disabled>Select a category</option>
                                                {categories.map((category) => {
                                                    if (category.isActive) {
                                                        return (
                                                            <option key={category._id} value={category.name}>
                                                                {category.name}
                                                            </option>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {errors.eventCategory && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.eventCategory}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Experience */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Years of Experience <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name='experience'
                                                value={form.experience}
                                                onChange={handleChange}
                                                className={`w-full bg-[#121212] border ${
                                                    errors.experience 
                                                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                        : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                                } rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-1 transition-all cursor-pointer`}
                                            >
                                                <option value="" disabled className="text-gray-600">Select experience</option>
                                                <option value="0-2">0-2 Years</option>
                                                <option value="3-5">3-5 Years</option>
                                                <option value="5-10">5-10 Years</option>
                                                <option value="10+">10+ Years</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {errors.experience && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.experience}</span>
                                            </p>
                                        )}
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
                                            name='description'
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="Tell us about your services, specialty, and what makes your business unique (min. 20 characters)..."
                                            className={`w-full bg-[#121212] border ${
                                                errors.description 
                                                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                    : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                            } rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all resize-none`}
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        {errors.description ? (
                                            <p className="text-rose-400 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.description}</span>
                                            </p>
                                        ) : (
                                            <span className="text-gray-500">Minimum 20 characters</span>
                                        )}
                                        <span className={`${form.description.length > 500 ? "text-rose-400 font-bold" : "text-gray-500"}`}>
                                            {form.description.length}/500
                                        </span>
                                    </div>
                                </div>

                                {/* Social/Website */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        Website or Instagram <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name='websiteOrInstagram'
                                            value={form.websiteOrInstagram}
                                            onChange={handleChange}
                                            placeholder="https://instagram.com/yourbusiness or @handle"
                                            className={`w-full bg-[#121212] border ${
                                                errors.websiteOrInstagram 
                                                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                    : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                            } rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all`}
                                        />
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        </div>
                                    </div>
                                    {errors.websiteOrInstagram && (
                                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} className="shrink-0" />
                                            <span>{errors.websiteOrInstagram}</span>
                                        </p>
                                    )}
                                </div>

                                {/* File Upload: Business Document */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-300">
                                            Verification Documents <span className="text-red-500">*</span>
                                        </label>
                                        {businessDocument && (
                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Ready to upload
                                            </span>
                                        )}
                                    </div>
                                    <div 
                                        className={`mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${
                                            errors.businessDocument 
                                                ? "border-rose-500/60 bg-rose-500/5 hover:border-rose-500" 
                                                : businessDocument 
                                                    ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60" 
                                                    : "border-white/10 hover:bg-white/5 hover:border-violet-500/50"
                                        }`}
                                        onClick={() => document.getElementById("businessDocumentUpload").click()}
                                    >
                                        <input
                                            id='businessDocumentUpload'
                                            type="file"
                                            accept=".svg,.png,.jpg,.jpeg,.pdf"
                                            hidden
                                            onChange={(e) => handleBusinessDocChange(e.target.files?.[0])}
                                        />

                                        <div className="space-y-3 text-center">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-all ${
                                                businessDocument 
                                                    ? "bg-emerald-500/20 text-emerald-400" 
                                                    : "bg-white/5 group-hover:bg-violet-500/20 group-hover:text-violet-400 text-gray-400"
                                            }`}>
                                                <Upload size={20} />
                                            </div>
                                            <div className="flex text-sm text-gray-400 justify-center">
                                                <span className={`relative font-medium transition-colors ${
                                                    businessDocument ? "text-emerald-300" : "text-violet-400 group-hover:text-violet-300"
                                                }`}>
                                                    {businessDocument
                                                        ? `${businessDocument.name} (${(businessDocument.size / (1024 * 1024)).toFixed(2)} MB)`
                                                        : "Click to upload business document (GST, License, Registration)"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                SVG, PNG, JPG or PDF (max. 10MB)
                                            </p>
                                        </div>
                                    </div>
                                    {errors.businessDocument && (
                                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} className="shrink-0" />
                                            <span>{errors.businessDocument}</span>
                                        </p>
                                    )}
                                </div>

                                {/* File Upload: ID Proof */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-300">
                                            Government ID Proof <span className="text-red-500">*</span>
                                        </label>
                                        {idProof && (
                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Ready to upload
                                            </span>
                                        )}
                                    </div>
                                    <div 
                                        className={`mt-2 flex justify-center px-6 pt-7 pb-7 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${
                                            errors.idProof 
                                                ? "border-rose-500/60 bg-rose-500/5 hover:border-rose-500" 
                                                : idProof 
                                                    ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60" 
                                                    : "border-white/10 hover:bg-white/5 hover:border-violet-500/50"
                                        }`}
                                        onClick={() => document.getElementById("idProofUpload").click()}
                                    >
                                        <input
                                            id='idProofUpload'
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.pdf"
                                            hidden
                                            onChange={(e) => handleIdProofChange(e.target.files?.[0])}
                                        />

                                        <div className="space-y-2 text-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-all ${
                                                idProof 
                                                    ? "bg-emerald-500/20 text-emerald-400" 
                                                    : "bg-white/5 group-hover:bg-violet-500/20 group-hover:text-violet-400 text-gray-400"
                                            }`}>
                                                <Upload size={18} />
                                            </div>
                                            <div className="flex text-sm text-gray-400 justify-center">
                                                <span className={`relative font-medium transition-colors ${
                                                    idProof ? "text-emerald-300" : "text-violet-400 group-hover:text-violet-300"
                                                }`}>
                                                    {idProof
                                                        ? `${idProof.name} (${(idProof.size / (1024 * 1024)).toFixed(2)} MB)`
                                                        : "Click to upload National ID, Passport, or Driver's License"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PDF, JPG or PNG (max 10MB)
                                            </p>
                                        </div>
                                    </div>
                                    {errors.idProof && (
                                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} className="shrink-0" />
                                            <span>{errors.idProof}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* --- Section 3: Location Details --- */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-violet-400 mb-4">
                                    <MapPin size={20} />
                                    <h3 className="text-lg font-medium">Location Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* City */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name='city'
                                            value={form.city}
                                            onChange={handleChange}
                                            placeholder="e.g. Mumbai"
                                            className={`w-full bg-[#121212] border ${
                                                errors.city 
                                                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                    : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                            } rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all`}
                                        />
                                        {errors.city && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.city}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* State */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            State/Province <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name='state'
                                            value={form.state}
                                            onChange={handleChange}
                                            placeholder="e.g. Maharashtra"
                                            className={`w-full bg-[#121212] border ${
                                                errors.state 
                                                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                    : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                            } rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all`}
                                        />
                                        {errors.state && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.state}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Country <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name='country'
                                                value={form.country}
                                                onChange={handleChange}
                                                className={`w-full bg-[#121212] border ${
                                                    errors.country 
                                                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30" 
                                                        : "border-white/5 focus:border-violet-500 focus:ring-violet-500/50"
                                                } rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-1 transition-all cursor-pointer`}
                                            >
                                                <option value="" disabled className="text-gray-600">Select Country</option>
                                                <option value="IN">India</option>
                                                <option value="US">United States</option>
                                                <option value="UK">United Kingdom</option>
                                                <option value="CA">Canada</option>
                                                <option value="AU">Australia</option>
                                                <option value="AE">United Arab Emirates</option>
                                                <option value="SG">Singapore</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {errors.country && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.country}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* T&C Checkbox area */}
                            <div className="pt-4 pb-2 border-t border-white/5">
                                <div className="flex items-start gap-3 mt-4">
                                    <div className="flex items-center h-5 mt-1">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            name='agreeTermsAndConditions'
                                            checked={agreeTermsAndConditions}
                                            onChange={(e) => {
                                                setAgreeTermsAndConditions(e.target.checked);
                                                if (errors.agreeTermsAndConditions) {
                                                    setErrors(prev => ({ ...prev, agreeTermsAndConditions: "" }));
                                                }
                                            }}
                                            className="w-4 h-4 bg-[#121212] border-white/10 rounded focus:ring-violet-500/50 text-violet-500 focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                                        />
                                    </div>
                                    <div className="text-sm">
                                        <label htmlFor="terms" className="font-medium text-white cursor-pointer select-none">
                                            I agree to the Vendor Terms and Conditions <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-gray-500 mt-1 leading-relaxed">
                                            By submitting this application, you confirm that the business information provided is accurate and you are authorized to represent this entity.
                                        </p>
                                        {errors.agreeTermsAndConditions && (
                                            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} className="shrink-0" />
                                                <span>{errors.agreeTermsAndConditions}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-white/5">
                                <button 
                                    type="button" 
                                    onClick={() => navigate(-1)} 
                                    className="w-full md:w-auto px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    Cancel Application
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full md:w-auto px-8 py-3.5 text-white text-sm font-semibold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer ${
                                        loading
                                            ? "bg-gray-600 cursor-not-allowed opacity-75"
                                            : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:translate-y-0"
                                    }`}
                                >
                                    {loading ? "Submitting..." : "Submit Application"}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Process Info Footer */}
                <div className="mt-8 max-w-3xl w-full p-6 bg-[#0a0a0a] rounded-xl border border-white/5 shadow-lg flex items-start gap-4">
                    <div className="mt-0.5 bg-white/10 p-1.5 rounded-full">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-violet-400 mb-1 pointer-events-none">Application Process</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Your application will be reviewed by our admin team within 2-3 business days. You will receive an email notification once your vendor status is approved.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 mt-10">
                <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500">© 2024 Festivo Platform. All rights reserved.</p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                        <Link to="#" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-gray-400 transition-colors">Contact Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default VendorApplication;
