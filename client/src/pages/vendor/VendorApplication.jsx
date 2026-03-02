import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';
import { Building2, Info, MapPin, Upload } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { vendorApplicationThunk } from '../../features/vendorSlice';
import { useEffect } from 'react';

const VendorApplication = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {loading, success } = useSelector((state) => state.vendor)
    const [form ,setForm ] = useState({
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
    })

    const [businessDocument , setBusinessDocument] = useState(null)
    const [idProof, setIdProof] = useState(null)
    const [agreeTermsAndConditions, setAgreeTermsAndConditions] = useState(false)
    const [errors, setErrors] = useState({})
    

    const handleChange  = (e) => {
        setForm({...form, [e.target.name] : e.target.value})
    }


     const validate = () => {
    const newErrors = {};

    if (!form.organizerName.trim())
      newErrors.organizerName = "Organizer name required";

    if (!form.businessName.trim())
      newErrors.businessName = "Business name required";

    if (!form.businessEmail.trim())
      newErrors.businessEmail = "Email required";

    if (!form.contactPhone.trim())
      newErrors.contactPhone = "Phone required";

    if (!form.password)
      newErrors.password = "Password required";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!form.eventCategory)
      newErrors.eventCategory = "Select category";

    if (!form.experience)
      newErrors.experience = "Select experience";

    if (!form.description.trim())
      newErrors.description = "Description required";

    if (!businessDocument)
      newErrors.businessDocument = "Business document required";

    if (!idProof)
      newErrors.idProof = "ID proof required";

    if (!agreeTermsAndConditions)
      newErrors.agreeTermsAndConditions = "You must accept terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    if(!validate()) return;
    const formData =   new FormData()

    formData.append("organizerName",form.organizerName)
    formData.append("businessName", form.businessName)
    formData.append("businessEmail",form.businessEmail)
    formData.append("contactPhone",form.contactPhone)
    formData.append("password",form.password)
    formData.append("eventCategory",form.eventCategory)
    formData.append("experience",form.experience)
    formData.append("description",form.description)
    formData.append("websiteOrInstagram",form.websiteOrInstagram)
    formData.append("agreeTermsAndConditions",agreeTermsAndConditions)
    formData.append(
        "location",
        JSON.stringify({
            city : form.city,
            state : form.state,
            country : form.country
        })
    )
    formData.append("businessDocument" ,businessDocument)
    formData.append("idProof",idProof)

    dispatch(vendorApplicationThunk(formData))

  }

  useEffect(()=>{
    if(success){
        navigate("/vendor/status",{
            state : {
                businessName : form.businessName
            }
        })
    }
  },[success,dispatch,navigate])
    

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
                        <span className="text-white font-bold text-2xl tracking-tight">Festivo</span>
                    </div>

                    {/* Center Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="#" className="text-gray-400 hover:text-white transition text-sm">How it works</Link>
                        <Link to="#" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-violet-500"></span> Benefits
                        </Link>
                        <Link to="#" className="text-gray-400 hover:text-white transition text-sm">Support</Link>
                    </div>

                    {/* Right Links */}
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-gray-400 text-sm">Already a vendor?</span>
                        <Link to="/login" className="text-white hover:text-violet-400 transition text-sm font-medium">Login</Link>
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
                                                name='organizerName'
                                                value={form.organizerName}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className='error'>{errors.organizerName}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
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
                                                name='businessName'
                                                value={form.businessName}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className='error'>{errors.businessName}</p>
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
                                                name='businessEmail'
                                                value={form.businessEmail}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className='error'>{errors.businessEmail}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
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
                                                placeholder="+1 (555) 000-0000"
                                                name='contactPhone'
                                                autoComplete='tel'
                                                value={form.contactPhone}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className='error'>{errors.contactPhone}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
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
                                                name='password'
                                                autoComplete='new-password'
                                                value={form.password}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className='error'>{errors.password}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
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
                                                name='confirmPassword'
                                                autoComplete='new-password'
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            />
                                            <p className='error'>{errors.confirmPassword}</p>
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
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
                                            name='eventCategory'
                                            value={form.eventCategory}
                                            onChange={handleChange}
                                            className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all">
                                                <option value="" disabled className="text-gray-600">Select a category</option>
                                                <option value="catering">Catering & Food</option>
                                                <option value="photography">Photography & Video</option>
                                                <option value="decor">Decor & Design</option>
                                                <option value="music">Music & Entertainment</option>
                                                <option value="venue">Venue & Locations</option>
                                            </select>
                                            <p className='error'>{errors.eventCategory}</p>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
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

                                            className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all">
                                                <option value="" disabled  className="text-gray-600">Select experience</option>
                                                <option value="0-2">0-2 Years</option>
                                                <option value="3-5">3-5 Years</option>
                                                <option value="5-10">5-10 Years</option>
                                                <option value="10+">10+ Years</option>
                                            </select>
                                            <p className='error'>{errors.experience}</p>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
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
                                            name='description'
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="Tell us about your services, specialty, and what makes your business unique..."
                                            className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none"
                                        ></textarea>

                                    </div>
                                    <div className="flex justify-end">
                                        <span className="text-xs text-gray-500">{form.description.length}/500 characters</span>
                                    </div>
                                    <p className='error'>{errors.description}</p>
                                </div>

                                {/* Social/Website */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        Website or Instagram (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="url"
                                            name='websiteOrInstagram'
                                            value={form.websiteOrInstagram}
                                            onChange={handleChange}
                                            placeholder="https://instagram.com/yourbusiness"
                                            className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                        />
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        Verification Documents
                                    </label>
                                    <div className="mt-2 flex justify-center px-6 pt-10 pb-10 border-2 border-white/5 border-dashed rounded-xl cursor-pointer hover:bg-white/5 hover:border-violet-500/50 transition-all group"
                                    onClick={()=> document.getElementById("businessDocumentUpload").click()}
                                    >
                                            
                                        <input 
                                        id='businessDocumentUpload'
                                        type="file"
                                        accept=".svg,.png,.jpg,.jpeg,.pdf"
                                        hidden
                                        onChange={(e) => setBusinessDocument(e.target.files[0])}
                                        />
                                        
                                        <div className="space-y-3 text-center">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:bg-violet-500/20 group-hover:text-violet-400 transition-all text-gray-400">
                                                <Upload size={20} />
                                            </div>
                                            <div className="flex text-sm text-gray-400 justify-center">
                                                <span className="relative font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
                                                    {businessDocument
                                                    ?businessDocument.name
                                                    : "Click to upload or drag and drop"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                SVG, PNG, JPG or PDF (max. 5MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {errors.businessDocument&&(
                                    <p className='error'>{errors.businessDocument}</p>
                                )}

                                {/* ID Proof Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        ID Proof
                                    </label>
                                    <div className="mt-2 flex justify-center px-6 pt-6 pb-6 border-2 border-white/5 border-dashed rounded-xl cursor-pointer hover:bg-white/5 hover:border-violet-500/50 transition-all group"
                                    onClick={() => document.getElementById("idProofUpload").click()}
                                    >
                                        
                                        <input 
                                        id='idProofUpload'
                                        type="file"
                                        accept=".png,.jpg,.pdf"
                                        hidden
                                        onChange={(e) => setIdProof(e.target.files[0])}
                                        />
                                        
                                        <div className="space-y-2 text-center">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:bg-violet-500/20 group-hover:text-violet-400 transition-all text-gray-400">
                                                <Upload size={18} />
                                            </div>
                                            <div className="flex text-sm text-gray-400 justify-center">
                                                <span className="relative font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
                                                    {idProof
                                                    ?idProof.name
                                                    :"Click to upload or drag and drop"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PDF, JPG or PNG
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {errors.idProof &&(
                                <p className='error'>{errors.idProof}</p>
                            )}

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
                                            placeholder="San Francisco"
                                            className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                        />
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
                                            placeholder="California"
                                            className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                        />
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
                                            className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500 transition-all">
                                                <option value="" disabled  className="text-gray-600">Select Country</option>
                                                <option value="US">United States</option>
                                                <option value="UK">United Kingdom</option>
                                                <option value="CA">Canada</option>
                                                <option value="AU">Australia</option>
                                                <option value="IN">India</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
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
                                            onChange={(e) => setAgreeTermsAndConditions(e.target.checked)}
                                            className="w-4 h-4 bg-[#121212] border-white/10 rounded focus:ring-violet-500/50 text-violet-500 focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                                        />
                                    </div>
                                    <div className="text-sm">
                                        <label htmlFor="terms" className="font-medium text-white cursor-pointer select-none">
                                            I agree to the Vendor Terms and Conditions
                                        </label>
                                        <p className="text-gray-500 mt-1 leading-relaxed">
                                            By submitting this application, you confirm that the business information provided is accurate and you are authorized to represent this entity.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-white/5">
                                <button type="button" className="w-full md:w-auto px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                    Cancel Application
                                </button>
                                <button
                                    type="submit"
                                    className={`w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2
                                            ${loading 
                                            ? "bg-gray-600 cursor-not-allowed" 
                                            : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                                            }
                                            `}
                               >
                                      
                                    {loading ? "Submiting..." : "Submit Application"}
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
                    <p className="text-xs text-gray-500">© 2024 EventConnect Platform. All rights reserved.</p>
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
