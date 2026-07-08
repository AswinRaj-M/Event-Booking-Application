import React, { useState, useEffect, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
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
  X,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import VendorSidebar from '../../components/vendor/VendorSidebar';


import avatarImg from '../../assets/vendor/common_avatar.png';
import { fetchCategories, createEventApi } from '../../services/vendor.api';

const VendorCreateEvent = () => {
  const navigate = useNavigate();
  const vendor = useSelector((state) => state.vendor?.vendor);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  

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
  const [onlineLink, setOnlineLink] = useState('');
  const [ageRestriction, setAgeRestriction] = useState(true);
  
  const [ticketType, setTicketType] = useState('paid');
  const [price, setPrice] = useState('0.00');
  const [totalSeats, setTotalSeats] = useState('');
  const [maxTicketsPerPerson, setMaxTicketsPerPerson] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [ticketTiers, setTicketTiers] = useState([
    {
      name: '',
      price: '',
      capacity: '',
      benefits: ['']
    }
  ]);

  const addTier = () => {
    setTicketTiers(prev => [
      ...prev,
      {
        name: '',
        price: '',
        capacity: '',
        benefits: ['']
      }
    ]);
  };

  const removeTier = (index) => {
    setTicketTiers(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleTierChange = (index, field, value) => {
    setTicketTiers(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const addBenefit = (tierIndex) => {
    setTicketTiers(prev => {
      const updated = [...prev];
      updated[tierIndex] = {
        ...updated[tierIndex],
        benefits: [...updated[tierIndex].benefits, '']
      };
      return updated;
    });
  };

  const removeBenefit = (tierIndex, benefitIndex) => {
    setTicketTiers(prev => {
      const updated = [...prev];
      updated[tierIndex] = {
        ...updated[tierIndex],
        benefits: updated[tierIndex].benefits.filter((_, idx) => idx !== benefitIndex)
      };
      return updated;
    });
  };

  const handleBenefitChange = (tierIndex, benefitIndex, value) => {
    setTicketTiers(prev => {
      const updated = [...prev];
      const updatedBenefits = [...updated[tierIndex].benefits];
      updatedBenefits[benefitIndex] = value;
      updated[tierIndex] = {
        ...updated[tierIndex],
        benefits: updatedBenefits
      };
      return updated;
    });
  };


  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);


  const thumbnailInputRef = useRef(null);
  const galleryInputRef = useRef(null);


  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const imgRef = useRef(null);

  const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  };

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
      setCurrentFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result?.toString() || '');
        setCrop({
          unit: '%',
          width: 90,
          aspect: 16 / 9
        });
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  };

  const handleSaveCrop = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error('Please select a crop area');
      return;
    }

    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Canvas is empty');
          return;
        }

        const croppedFile = new File(
          [blob],
          currentFile ? `cropped-${currentFile.name}` : 'cropped-cover.jpg',
          { type: 'image/jpeg' }
        );

        setThumbnail(croppedFile);
        setThumbnailPreview(URL.createObjectURL(croppedFile));
        setShowCropModal(false);
        setCropImageSrc('');
        setCurrentFile(null);
        toast.success('Cover image cropped successfully!');
      }, 'image/jpeg', 0.95);

    } catch (err) {
      console.error(err);
      toast.error('Failed to crop image');
    }
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setCropImageSrc('');
    setCurrentFile(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
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

  const handlePublish = async (status = 'pending') => {
    if (!eventTitle.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (status !== 'draft') {
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
      if (eventType === 'online') {
        if (!onlineLink.trim()) {
          toast.error('Google Meet / Online Link is required');
          return;
        }
        try {
          new URL(onlineLink.trim());
        } catch (_) {
          toast.error('Please enter a valid Google Meet or Online Link URL');
          return;
        }
      } else {
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
      }
      if (ticketType === 'paid') {
        if (!ticketTiers || ticketTiers.length === 0) {
          toast.error('At least one ticket tier is required for paid events');
          return;
        }
        for (let i = 0; i < ticketTiers.length; i++) {
          const tier = ticketTiers[i];
          if (!tier.name || !tier.name.trim()) {
            toast.error(`Tier ${i + 1} name is required`);
            return;
          }
          const priceNum = parseFloat(tier.price);
          if (isNaN(priceNum) || priceNum <= 0) {
            toast.error(`Tier ${i + 1} price must be greater than 0`);
            return;
          }
          const capacityNum = parseInt(tier.capacity, 10);
          if (isNaN(capacityNum) || capacityNum <= 0) {
            toast.error(`Tier ${i + 1} capacity must be greater than 0`);
            return;
          }
          const validBenefits = tier.benefits ? tier.benefits.filter(b => b.trim() !== '') : [];
          if (validBenefits.length === 0) {
            toast.error(`Tier ${i + 1} must have at least one benefit`);
            return;
          }
        }
      } else {
        if (!totalSeats) {
          toast.error('Total seats limit is required');
          return;
        }
      }
      if (!agreedTerms) {
        toast.error('You must agree to the Vendor Terms to publish the event');
        return;
      }
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
    
    if (eventType === 'online') {
      formData.append('onlineLink', onlineLink.trim());
      formData.append('venue', 'Online');
      formData.append('address', 'Online');
      formData.append('city', 'Online');
      formData.append('state', 'Online');
    } else {
      formData.append('venue', venueName);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('onlineLink', '');
    }
    
    formData.append('latitude', '0');
    formData.append('longitude', '0');
    
    formData.append('ageRestriction', ageRestriction ? 'true' : 'false');
    
    const formattedTicketType = ticketType === 'paid' ? 'Paid' : 'Free';
    formData.append('ticketType', formattedTicketType);
    
    if (formattedTicketType === 'Paid') {
      const sumSeats = ticketTiers.reduce((sum, tier) => sum + (parseInt(tier.capacity, 10) || 0), 0);
      const minPrice = Math.min(...ticketTiers.map(tier => parseFloat(tier.price) || 0));
      
      formData.append('ticketTiers', JSON.stringify(ticketTiers.map(t => ({
        name: t.name,
        price: parseFloat(t.price) || 0,
        capacity: parseInt(t.capacity, 10) || 0,
        benefits: (t.benefits || []).filter(b => b.trim() !== '')
      }))));
      formData.append('ticketPrice', isFinite(minPrice) ? minPrice.toString() : '0');
      formData.append('totalTickets', sumSeats.toString());
    } else {
      formData.append('ticketPrice', '0');
      formData.append('totalTickets', totalSeats || '0');
    }
    formData.append('maxTicketPerPerson', maxTicketsPerPerson || '5');
    
    formData.append('offerEnabled', enableOffer ? 'true' : 'false');
    if (enableOffer) {
      formData.append('discountValue', discountValue || '0');
      formData.append('minTicketsRequired', minTickets || '0');
      formData.append('validFrom', validFrom || '');
      formData.append('validUntil', validUntil || '');
    }
    
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    
    galleryImages.forEach((img) => {
      formData.append('images', img);
    });

    formData.append('eventStatus', status);

    setLoading(true);
    try {
      const response = await createEventApi(formData);
      if (response.data && response.data.success) {
        if (status === 'draft') {
          toast.success('Event saved as draft successfully!');
          navigate('/vendor/events/drafts');
        } else {
          toast.success('Event created successfully!');
          navigate('/vendor/events');
        }
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
            <button 
              type="button"
              onClick={() => handlePublish('draft')}
              className="px-5 py-2.5 bg-[#1C1A30] hover:bg-[#252245] text-white text-sm font-semibold rounded-xl transition-all border border-purple-500/20 cursor-pointer"
            >
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">Start Time</label>
                    <div className="flex items-center bg-[#12101F] rounded-xl border border-zinc-800/80 p-1.5 focus-within:border-purple-500 transition-colors w-full min-w-0">
                      <input 
                        type="text" 
                        maxLength={2}
                        placeholder="07"
                        value={startTime.split(' ')[0]?.split(':')[0] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const parts = startTime.split(' ');
                          const period = parts[1] || 'PM';
                          const mm = parts[0]?.split(':')[1] || '00';
                          setStartTime(`${val}:${mm} ${period}`);
                        }}
                        onBlur={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val) {
                            let num = parseInt(val, 10);
                            if (num > 12) num = 12;
                            if (num < 1) num = 1;
                            val = String(num).padStart(2, '0');
                          } else {
                            val = '07';
                          }
                          const parts = startTime.split(' ');
                          const period = parts[1] || 'PM';
                          const mm = parts[0]?.split(':')[1] || '00';
                          setStartTime(`${val}:${mm} ${period}`);
                        }}
                        className="w-8 shrink-0 bg-transparent text-white text-center focus:outline-none text-sm font-semibold"
                      />
                      <span className="text-zinc-600 font-bold mx-0.5 shrink-0">:</span>
                      <input 
                        type="text" 
                        maxLength={2}
                        placeholder="00"
                        value={startTime.split(' ')[0]?.split(':')[1] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const parts = startTime.split(' ');
                          const period = parts[1] || 'PM';
                          const hh = parts[0]?.split(':')[0] || '07';
                          setStartTime(`${hh}:${val} ${period}`);
                        }}
                        onBlur={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val) {
                            let num = parseInt(val, 10);
                            if (num > 59) num = 59;
                            val = String(num).padStart(2, '0');
                          } else {
                            val = '00';
                          }
                          const parts = startTime.split(' ');
                          const period = parts[1] || 'PM';
                          const hh = parts[0]?.split(':')[0] || '07';
                          setStartTime(`${hh}:${val} ${period}`);
                        }}
                        className="w-8 shrink-0 bg-transparent text-white text-center focus:outline-none text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const parts = startTime.split(' ');
                          const period = parts[1] === 'AM' ? 'PM' : 'AM';
                          const timePart = parts[0] || '07:00';
                          setStartTime(`${timePart} ${period}`);
                        }}
                        className="ml-auto px-1.5 py-0.5 shrink-0 bg-[#1C1A30] hover:bg-[#252245] border border-purple-500/20 text-purple-300 text-[10px] font-bold rounded-md transition-all cursor-pointer"
                      >
                        {startTime.split(' ')[1] || 'PM'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">End Time</label>
                    <div className="flex items-center bg-[#12101F] rounded-xl border border-zinc-800/80 p-1.5 focus-within:border-purple-500 transition-colors w-full min-w-0">
                      <input 
                        type="text" 
                        maxLength={2}
                        placeholder="11"
                        value={endTime.split(' ')[0]?.split(':')[0] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const parts = endTime.split(' ');
                          const period = parts[1] || 'PM';
                          const mm = parts[0]?.split(':')[1] || '00';
                          setEndTime(`${val}:${mm} ${period}`);
                        }}
                        onBlur={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val) {
                            let num = parseInt(val, 10);
                            if (num > 12) num = 12;
                            if (num < 1) num = 1;
                            val = String(num).padStart(2, '0');
                          } else {
                            val = '11';
                          }
                          const parts = endTime.split(' ');
                          const period = parts[1] || 'PM';
                          const mm = parts[0]?.split(':')[1] || '00';
                          setEndTime(`${val}:${mm} ${period}`);
                        }}
                        className="w-8 shrink-0 bg-transparent text-white text-center focus:outline-none text-sm font-semibold"
                      />
                      <span className="text-zinc-600 font-bold mx-0.5 shrink-0">:</span>
                      <input 
                        type="text" 
                        maxLength={2}
                        placeholder="00"
                        value={endTime.split(' ')[0]?.split(':')[1] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const parts = endTime.split(' ');
                          const period = parts[1] || 'PM';
                          const hh = parts[0]?.split(':')[0] || '11';
                          setEndTime(`${hh}:${val} ${period}`);
                        }}
                        onBlur={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val) {
                            let num = parseInt(val, 10);
                            if (num > 59) num = 59;
                            val = String(num).padStart(2, '0');
                          } else {
                            val = '00';
                          }
                          const parts = endTime.split(' ');
                          const period = parts[1] || 'PM';
                          const hh = parts[0]?.split(':')[0] || '11';
                          setEndTime(`${hh}:${val} ${period}`);
                        }}
                        className="w-8 shrink-0 bg-transparent text-white text-center focus:outline-none text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const parts = endTime.split(' ');
                          const period = parts[1] === 'AM' ? 'PM' : 'AM';
                          const timePart = parts[0] || '11:00';
                          setEndTime(`${timePart} ${period}`);
                        }}
                        className="ml-auto px-1.5 py-0.5 shrink-0 bg-[#1C1A30] hover:bg-[#252245] border border-purple-500/20 text-purple-300 text-[10px] font-bold rounded-md transition-all cursor-pointer"
                      >
                        {endTime.split(' ')[1] || 'PM'}
                      </button>
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
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {eventType === 'online' ? 'Online Details' : 'Location'}
                </h2>
              </div>

              {eventType === 'online' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">Google Meet / Online Link</label>
                    <input 
                      type="url" 
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      value={onlineLink}
                      onChange={(e) => setOnlineLink(e.target.value)}
                      className="w-full bg-[#12101F] text-white placeholder-zinc-600 px-4 py-3.5 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    />
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
              ) : (
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
              )}
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

                {ticketType === 'paid' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-zinc-400">Ticket Tiers</label>
                      <button
                        type="button"
                        onClick={addTier}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1A30] hover:bg-[#252245] border border-purple-500/20 text-purple-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Add Tier
                      </button>
                    </div>

                    <div className="space-y-4">
                      {ticketTiers.map((tier, idx) => (
                        <div key={idx} className="bg-[#12101F] border border-zinc-800/80 rounded-2xl p-5 space-y-4 relative group">
                          <div className="flex justify-between items-center">
                            <div className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Tier #{idx + 1}</div>
                            {ticketTiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTier(idx)}
                                className="p-1.5 bg-[#0B0A11]/60 hover:bg-rose-950/20 border border-zinc-800/80 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tier Name</label>
                              <input
                                type="text"
                                placeholder="e.g. VIP"
                                value={tier.name}
                                onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                                className="w-full bg-[#0B0A11] text-white px-3 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs transition-colors"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Price ($)</label>
                                <input
                                  type="number"
                                  placeholder="e.g. 99"
                                  value={tier.price}
                                  onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                                  className="w-full bg-[#0B0A11] text-white px-3 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs transition-colors"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Capacity</label>
                                <input
                                  type="number"
                                  placeholder="e.g. 50"
                                  value={tier.capacity}
                                  onChange={(e) => handleTierChange(idx, 'capacity', e.target.value)}
                                  className="w-full bg-[#0B0A11] text-white px-3 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs transition-colors"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Benefits section */}
                          <div className="space-y-2 pt-2 border-t border-zinc-800/40">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Benefits</label>
                            <div className="space-y-2">
                              {(tier.benefits || []).map((benefit, bIdx) => (
                                <div key={bIdx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    placeholder="e.g. Backstage pass, Free drinks"
                                    value={benefit}
                                    onChange={(e) => handleBenefitChange(idx, bIdx, e.target.value)}
                                    className="flex-1 bg-[#0B0A11] text-white px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs transition-colors"
                                  />
                                  {tier.benefits.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeBenefit(idx, bIdx)}
                                      className="p-2 bg-[#0B0A11] hover:bg-rose-950/20 border border-zinc-800 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => addBenefit(idx)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0A11] hover:bg-[#1A182E] border border-purple-500/20 text-purple-300 text-[10px] font-bold rounded-lg transition-all mt-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Add Benefit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs text-zinc-500 pt-1">
                      <span>Total Capacity across tiers:</span>
                      <span className="text-white font-bold text-sm">
                        {ticketTiers.reduce((sum, t) => sum + (parseInt(t.capacity, 10) || 0), 0)} seats
                      </span>
                    </div>
                  </div>
                ) : (
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
                )}

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
              onClick={()=>handlePublish("pending")}
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

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0A11] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#12101F]/50">
              <h3 className="text-lg font-bold text-white tracking-wide">Crop Cover Image</h3>
              <button 
                type="button"
                onClick={handleCancelCrop}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Workspace */}
            <div className="p-6 overflow-auto flex-1 flex justify-center items-center bg-[#070514]">
              {cropImageSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={16 / 9}
                  className="max-h-[50vh]"
                >
                  <img
                    ref={imgRef}
                    alt="Crop workspace"
                    src={cropImageSrc}
                    onLoad={onImageLoad}
                    className="max-h-[50vh] object-contain"
                  />
                </ReactCrop>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3 bg-[#12101F]/50">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="px-5 py-2.5 bg-[#1C1A30] hover:bg-[#252245] border border-purple-500/20 text-purple-300 hover:text-purple-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
              >
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorCreateEvent;
