import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Sparkles, 
  Plus, 
  Upload, 
  Info,
  ChevronDown,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import VendorSidebar from '../../components/vendor/VendorSidebar';

// Asset imports for high-quality pre-existing images
import avatarImg from '../../assets/vendor/common_avatar.png';
import { fetchCategories, createEventApi } from '../../services/vendor.api';

const VendorCreateEvent = () => {
  const navigate = useNavigate();
  const vendor = useSelector((state) => state.vendor?.vendor);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for form inputs
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventType, setEventType] = useState('in-person');
  const [shortDescription, setShortDescription] = useState('');
  
  const [enableOffer, setEnableOffer] = useState(true);
  const [offerType, setOfferType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minTickets, setMinTickets] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  
  const [date, setDate] = useState('2024-10-24');
  const [startTime, setStartTime] = useState('07:00 PM');
  const [endTime, setEndTime] = useState('11:00 PM');
  
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [ageRestriction, setAgeRestriction] = useState(true);
  
  const [ticketType, setTicketType] = useState('paid');
  const [price, setPrice] = useState('0.00');
  const [totalSeats, setTotalSeats] = useState('');
  const [maxTicketsPerPerson, setMaxTicketsPerPerson] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // File states & previews
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // File input refs
  const thumbnailInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetchCategories();
        if (response.data && response.data.success) {
          setCategories(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    getCategories();
  }, []);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setGalleryImages(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!eventTitle.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (!eventCategory) {
      toast.error('Event category is required');
      return;
    }
    if (!shortDescription.trim()) {
      toast.error('Event description is required');
      return;
    }
    if (!thumbnail) {
      toast.error('Cover image (thumbnail) is required');
      return;
    }
    if (!date) {
      toast.error('Event date is required');
      return;
    }
    if (!venueName.trim()) {
      toast.error('Venue name is required');
      return;
    }
    if (!address.trim()) {
      toast.error('Address is required');
      return;
    }
    if (!city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!state.trim()) {
      toast.error('State is required');
      return;
    }
    if (!totalSeats) {
      toast.error('Total seats limit is required');
      return;
    }
    if (ticketType === 'paid' && (!price || parseFloat(price) <= 0)) {
      toast.error('Ticket price must be greater than 0 for paid events');
      return;
    }
    if (!agreedTerms) {
      toast.error('You must agree to the Vendor Terms to publish the event');
      return;
    }

    const formData = new FormData();
    formData.append('title', eventTitle);
    formData.append('description', shortDescription);
    formData.append('category', eventCategory);
    
    const formattedEventType = eventType === 'in-person' ? 'In-person' : 'Online';
    formData.append('eventType', formattedEventType);
    
    formData.append('date', date);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    
    formData.append('venue', venueName);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('state', state);
    
    formData.append('latitude', '0');
    formData.append('longitude', '0');
    
    formData.append('ageRestriction', ageRestriction ? 'true' : 'false');
    
    const formattedTicketType = ticketType === 'paid' ? 'Paid' : 'Free';
    formData.append('ticketType', formattedTicketType);
    formData.append('ticketPrice', ticketType === 'paid' ? price : '0');
    formData.append('totalTickets', totalSeats);
    formData.append('maxTicketPerPerson', maxTicketsPerPerson || '5');
    
    formData.append('offerEnabled', enableOffer ? 'true' : 'false');
    if (enableOffer) {
      formData.append('discountValue', discountValue || '0');
      formData.append('minTicketsRequired', minTickets || '0');
      formData.append('validFrom', validFrom || '');
      formData.append('validUntil', validUntil || '');
    }
    
    formData.append('thumbnail', thumbnail);
    
    galleryImages.forEach((img) => {
      formData.append('images', img);
    });

    setLoading(true);
    try {
      const response = await createEventApi(formData);
      if (response.data && response.data.success) {
        toast.success('Event created successfully!');
        navigate('/vendor/events');
      } else {
        toast.error(response.data?.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070514] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <VendorSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create New Event</h1>
            <p className="text-sm text-zinc-400">Fill in the details below to publish your next big event.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-zinc-400 hover:text-white transition-colors text-sm font-semibold px-4 py-2">
              Cancel
            </button>
            <button className="px-5 py-2.5 bg-[#1C1A30] hover:bg-[#252245] text-white text-sm font-semibold rounded-xl transition-all border border-purple-500/20">
              Save as Draft
            </button>
          </div>
        </div>

        {/* 2 Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Form Details (approx 2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Basic Details */}
            <div className="bg-[#0B0A11] border border-white/5 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Basic Details</h2>
              </div>

              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Neon Nights Music Festival 2024"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-[#12101F] text-white placeholder-zinc-600 px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Category & Event Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Event Category</label>
                  <div className="relative">
                    <select 
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                      className="w-full bg-[#12101F] text-white px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Event Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setEventType('in-person')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        eventType === 'in-person' 
                          ? 'bg-[#1D1936] border-purple-500/40 text-white' 
                          : 'bg-[#12101F] border-zinc-800/80 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${eventType === 'in-person' ? 'bg-purple-500' : 'bg-zinc-600'}`} />
                      In-Person
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEventType('online')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        eventType === 'online' 
                          ? 'bg-[#1D1936] border-purple-500/40 text-white' 
                          : 'bg-[#12101F] border-zinc-800/80 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${eventType === 'online' ? 'bg-purple-500' : 'bg-zinc-600'}`} />
                      Online
                    </button>
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400">Short Description</label>
                  <span className="text-[10px] text-zinc-500 font-semibold">{shortDescription.length}/500</span>
                </div>
                <textarea 
                  maxLength={500}
                  placeholder="Describe what makes your event special..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-[#12101F] text-white placeholder-zinc-600 p-4 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none leading-relaxed text-sm"
                />
              </div>
            </div>

            {/* 2. Event Media */}
            <div className="bg-[#0B0A11] border border-white/5 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                  2
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold text-white tracking-wide">Event Media</h2>
                  <p className="text-xs text-zinc-400">Upload high-quality images to attract more attendees.</p>
                </div>
              </div>

              {/* Cover Image Box */}
              <div 
                onClick={() => thumbnailInputRef.current.click()}
                className="border border-dashed border-zinc-800 hover:border-purple-500/40 bg-[#12101F]/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer overflow-hidden relative min-h-[200px]"
              >
                <input 
                  type="file" 
                  ref={thumbnailInputRef} 
                  onChange={handleThumbnailChange} 
                  className="hidden" 
                  accept="image/*" 
                />
                {thumbnailPreview ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={thumbnailPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs font-bold bg-[#1C1A30]/85 px-3 py-1.5 rounded-lg border border-purple-500/35">Change Cover Image</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-bold text-white">Upload Cover Image</h3>
                      <p className="text-xs text-zinc-500 max-w-[280px] mx-auto">
                        Drag and drop or click to upload. Recommended size: 1920x1080px (Max 5MB)
                      </p>
                    </div>
                    <button type="button" className="px-5 py-2.5 bg-[#1C1A30] hover:bg-[#252245] border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-xl transition-all">
                      Choose File
                    </button>
                  </>
                )}
              </div>

              {/* Gallery Images */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-400">Gallery Images</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  <input 
                    type="file" 
                    ref={galleryInputRef} 
                    onChange={handleGalleryChange} 
                    className="hidden" 
                    multiple 
                    accept="image/*" 
                  />
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
                      <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGalleryImage(index);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg border border-white/10 hover:bg-rose-600 transition-colors text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Gallery Slot */}
                  <div 
                    onClick={() => galleryInputRef.current.click()}
                    className="border-2 border-dashed border-zinc-800 hover:border-purple-500/40 hover:bg-purple-950/5 rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Offers & Discounts */}
            <div className="bg-[#0B0A11] border border-white/5 p-6 rounded-2xl space-y-6 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-500 to-indigo-600" />

              {/* Header with Enable Toggle */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-wide">Offers & Discounts</h2>
                    <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      New Feature
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-400">Enable Offer</span>
                  <button 
                    type="button"
                    onClick={() => setEnableOffer(!enableOffer)}
                    className={`w-11 h-6 rounded-full transition-all relative p-0.5 cursor-pointer ${enableOffer ? 'bg-purple-600' : 'bg-zinc-800'}`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-white transition-all block ${enableOffer ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {enableOffer && (
                <div className="space-y-6 pt-2">
                  {/* Info alert banner */}
                  <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 flex gap-3 items-center text-xs text-purple-300">
                    <Info className="w-4 h-4 shrink-0 text-purple-400" />
                    <span>This offer will apply automatically to all ticket bookings for this event.</span>
                  </div>

                  {/* Offer Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400">Offer Type</label>
                      <div className="relative">
                        <select 
                          value={offerType}
                          onChange={(e) => setOfferType(e.target.value)}
                          className="w-full bg-[#12101F] text-white px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="percentage">Percentage Discount (%)</option>
                          <option value="flat">Flat Discount ($)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-zinc-500 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400">Discount Value</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="e.g. 10"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          className="w-full bg-[#12101F] text-white px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors pr-12 text-sm font-semibold"
                        />
                        <span className="absolute right-4 top-3.5 text-sm text-zinc-500 font-bold">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Minimum Tickets constraint */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">
                      Minimum Tickets (How many tickets user have to purchase to unlock this offer)
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g. 2"
                      value={minTickets}
                      onChange={(e) => setMinTickets(e.target.value)}
                      className="w-full bg-[#12101F] text-white px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    />
                  </div>

                  {/* Validity periods */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400">Valid From</label>
                      <input 
                        type="date" 
                        value={validFrom}
                        onChange={(e) => setValidFrom(e.target.value)}
                        className="w-full bg-[#12101F] text-zinc-400 px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400">Valid Until</label>
                      <input 
                        type="date" 
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className="w-full bg-[#12101F] text-zinc-400 px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Secondary parameters (approx 1/3 width) */}
          <div className="space-y-8">
            
            {/* Schedule block */}
            <div className="bg-[#0B0A11] border border-white/5 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Schedule</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#12101F] text-zinc-400 px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">Start Time</label>
                    <div className="relative">
                      <select 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-[#12101F] text-white px-3 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-xs"
                      >
                        <option value="07:00 PM">07:00 PM</option>
                        <option value="08:00 PM">08:00 PM</option>
                        <option value="09:00 PM">09:00 PM</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-4 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">End Time</label>
                    <div className="relative">
                      <select 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-[#12101F] text-white px-3 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-xs"
                      >
                        <option value="11:00 PM">11:00 PM</option>
                        <option value="12:00 AM">12:00 AM</option>
                        <option value="01:00 AM">01:00 AM</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-4 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location block */}
            <div className="bg-[#0B0A11] border border-white/5 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Location</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Venue Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Grand Arena"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full bg-[#12101F] text-white placeholder-zinc-600 px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Address</label>
                  <input 
                    type="text" 
                    placeholder="Street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#12101F] text-white placeholder-zinc-600 px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">City</label>
                    <input 
                      type="text" 
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#12101F] text-white placeholder-zinc-600 px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">State</label>
                    <input 
                      type="text" 
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#12101F] text-white placeholder-zinc-600 px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Map preview box */}
                <div className="h-32 rounded-xl bg-zinc-800/30 border border-zinc-800/80 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px]">
                  <button type="button" className="px-4 py-2 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    Pin Location on Map
                  </button>
                </div>

                {/* Age Restriction Toggle */}
                <div className="flex justify-between items-center pt-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-white">Age Restriction</label>
                    <p className="text-[10px] text-zinc-400">Strictly 18+ only</p>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setAgeRestriction(!ageRestriction)}
                    className={`w-10 h-5.5 rounded-full transition-all relative p-0.5 cursor-pointer ${ageRestriction ? 'bg-purple-600' : 'bg-zinc-800'}`}
                  >
                    <span className={`w-4.5 h-4.5 rounded-full bg-white transition-all block ${ageRestriction ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tickets block */}
            <div className="bg-[#0B0A11] border border-white/5 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Ticket className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Tickets</h2>
              </div>

              <div className="space-y-4">
                {/* Segmented control Paid / Free */}
                <div className="bg-[#12101F] p-1 rounded-xl grid grid-cols-2 border border-zinc-800/80">
                  <button 
                    type="button"
                    onClick={() => setTicketType('paid')}
                    className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      ticketType === 'paid' 
                        ? 'bg-[#1C1A30] text-white border border-purple-500/15' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Paid
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTicketType('free')}
                    className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      ticketType === 'free' 
                        ? 'bg-[#1C1A30] text-white border border-purple-500/15' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Free
                  </button>
                </div>

                {ticketType === 'paid' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">Price per Ticket</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-sm text-zinc-500 font-bold">$</span>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#12101F] text-white pl-8 pr-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Total Seats</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full bg-[#12101F] text-white px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  />
                  <p className="text-[10px] text-zinc-500 leading-relaxed">We'll stop sales once this limit is reached.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Maximum Tickets per Person</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 10"
                    value={maxTicketsPerPerson}
                    onChange={(e) => setMaxTicketsPerPerson(e.target.value)}
                    className="w-full bg-[#12101F] text-white px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                  />
                  <p className="text-[10px] text-zinc-500 leading-relaxed">Limit the number of tickets a single customer can purchase.</p>
                </div>
              </div>
            </div>

            {/* Checklist agreement */}
            <label className="flex items-start gap-3 cursor-pointer group pt-2 select-none">
              <input 
                type="checkbox" 
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-1 accent-purple-600 rounded bg-[#12101F] border-zinc-800 cursor-pointer"
              />
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                I agree to the Vendor Terms and certify that I have the rights to host this event.
              </span>
            </label>

            {/* Poster identification footer card */}
            <div className="bg-[#12101F]/60 border border-zinc-800/50 p-4 rounded-2xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full border border-purple-500/20 overflow-hidden bg-zinc-900">
                <img src={vendor?.profilePicture?.fileUrl || avatarImg} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-zinc-400">Posting as <span className="text-purple-400">{vendor?.organizerName || 'Vendor'}</span></p>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Pro Vendor Account</p>
              </div>
            </div>

            {/* Main Submit Button */}
            <button 
              type="button" 
              onClick={handlePublish}
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.99] duration-200 cursor-pointer flex justify-center items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing Event...
                </>
              ) : (
                'Publish Event Now'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorCreateEvent;
