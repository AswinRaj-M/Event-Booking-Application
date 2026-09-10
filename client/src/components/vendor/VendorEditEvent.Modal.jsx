import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Upload, 
  X,
  ChevronDown,
  Sparkles,
  Info,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchCategories, updateEventApi } from '../../services/vendor.api';

const VendorEditEventModal = ({ isOpen, onClose, event, onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventType, setEventType] = useState('in-person');
  const [onlineLink, setOnlineLink] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('07:00 PM');
  const [endTime, setEndTime] = useState('11:00 PM');
  
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  const [ticketType, setTicketType] = useState('paid');
  const [price, setPrice] = useState('0.00');
  const [totalSeats, setTotalSeats] = useState('');
  const [maxTicketsPerPerson, setMaxTicketsPerPerson] = useState('');
  
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
  
  // Offer states
  const [enableOffer, setEnableOffer] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [minTickets, setMinTickets] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  const [existingImages, setExistingImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  
  const thumbnailInputRef = useRef(null);
  const galleryInputRef = useRef(null);


  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
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
    if (isOpen) {
      getCategories();
    }
  }, [isOpen]);

  // Prepopulate form when event changes
  useEffect(() => {
    if (event) {
      const raw = event.rawEvent || event;
      setEventTitle(raw.title || '');
      setShortDescription(raw.description || '');
      setEventCategory(raw.category?._id || raw.category || '');
      setEventType(raw.eventType === 'Online' ? 'online' : 'in-person');
      setOnlineLink(raw.onlineLink || '');
      
      const eventDate = raw.schedule?.date || raw.date;
      setDate(formatDateForInput(eventDate));
      setStartTime(raw.schedule?.startTime || raw.startTime || '07:00 PM');
      setEndTime(raw.schedule?.endTime || raw.endTime || '11:00 PM');
      
      setVenueName(raw.venue || '');
      setAddress(raw.address || '');
      setCity(raw.city || '');
      setState(raw.state || '');
      
      setTicketType(raw.ticketType === 'Free' ? 'free' : 'paid');
      setPrice(raw.ticketPrice !== undefined ? String(raw.ticketPrice) : '0.00');
      setTotalSeats(raw.totalTickets !== undefined ? String(raw.totalTickets) : '');
      setMaxTicketsPerPerson(raw.maxTicketPerPerson !== undefined ? String(raw.maxTicketPerPerson) : '');
      
      if (raw.ticketTiers && raw.ticketTiers.length > 0) {
        setTicketTiers(raw.ticketTiers.map(t => ({
          _id: t._id,
          sold: t.sold || 0,
          name: t.name || '',
          price: t.price !== undefined ? String(t.price) : '',
          capacity: t.capacity !== undefined ? String(t.capacity) : '',
          benefits: t.benefits && t.benefits.length > 0 ? [...t.benefits] : ['']
        })));
      } else {
        setTicketTiers([
          {
            name: '',
            price: '',
            capacity: '',
            benefits: ['']
          }
        ]);
      }
      
      const offer = raw.offer || {};
      setEnableOffer(offer.enabled || false);
      setDiscountValue(offer.discountValue !== undefined ? String(offer.discountValue) : '');
      setMinTickets(offer.minTicketsRequired !== undefined ? String(offer.minTicketsRequired) : '');
      setValidFrom(formatDateForInput(offer.validFrom));
      setValidUntil(formatDateForInput(offer.validUntil));

      setThumbnail(null);
      setThumbnailPreview(raw.thumbnail?.fileUrl || null);
      
      setExistingImages(raw.images || []);
      setGalleryImages([]);
      setGalleryPreviews([]);
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

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
      setGalleryImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeNewImage = (indexToRemove) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setGalleryPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const parseEventDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const parts = timeStr.trim().split(/\s+/);
    const timePart = parts[0];
    const modifier = parts[1]; // AM or PM
    if (!timePart) return null;
    
    const timeComponents = timePart.split(':');
    let hours = parseInt(timeComponents[0], 10);
    let minutes = parseInt(timeComponents[1] || '0', 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    if (modifier) {
      const mod = modifier.toUpperCase();
      if (mod === 'PM' && hours < 12) hours += 12;
      if (mod === 'AM' && hours === 12) hours = 0;
    }
    
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) return null;
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  };

  const handleSave = async () => {
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
    if (!date) {
      toast.error('Event date is required');
      return;
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    if (date < todayStr) {
      toast.error('Event date cannot be in the past');
      return;
    }
    const startDateTime = parseEventDateTime(date, startTime);
    if (!startDateTime) {
      toast.error('Please enter a valid start time');
      return;
    }
    if (startDateTime <= new Date()) {
      toast.error('Event start time must be in the future');
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

    if (enableOffer) {
      if (!discountValue) {
        toast.error('Discount value is required when offer is enabled');
        return;
      }
      const val = parseFloat(discountValue);
      if (isNaN(val) || val <= 0 || val > 100) {
        toast.error('Discount percentage must be between 1 and 100');
        return;
      }
      if (!minTickets) {
        toast.error('Minimum tickets required is required when offer is enabled');
        return;
      }
      const minTkts = parseInt(minTickets, 10);
      if (isNaN(minTkts) || minTkts < 1) {
        toast.error('Minimum tickets must be at least 1');
        return;
      }
      if (!validFrom) {
        toast.error('Offer Start Date is required when offer is enabled');
        return;
      }
      if (!validUntil) {
        toast.error('Offer End Date is required when offer is enabled');
        return;
      }
      const todayStr = formatDateForInput(new Date());
      if (validFrom < todayStr) {
        toast.error('Offer Start Date cannot be in the past');
        return;
      }
      if (validUntil <= validFrom) {
        toast.error('Offer End Date must be after Offer Start Date');
        return;
      }
      if (date && validUntil > date) {
        toast.error('Offer End Date cannot be set after the Event Date');
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', eventTitle);
    formData.append('description', shortDescription);
    formData.append('category', eventCategory);
    formData.append('eventType', eventType === 'in-person' ? 'In-person' : 'Online');
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
    const formattedTicketType = ticketType === 'paid' ? 'Paid' : 'Free';
    formData.append('ticketType', formattedTicketType);
    
    if (formattedTicketType === 'Paid') {
      const sumSeats = ticketTiers.reduce((sum, tier) => sum + (parseInt(tier.capacity, 10) || 0), 0);
      const minPrice = Math.min(...ticketTiers.map(tier => parseFloat(tier.price) || 0));
      
      formData.append('ticketTiers', JSON.stringify(ticketTiers.map(t => ({
        _id: t._id || undefined,
        sold: t.sold !== undefined ? Number(t.sold) : 0,
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
    } else {
      formData.append('discountValue', '0');
      formData.append('minTicketsRequired', '0');
      formData.append('validFrom', '');
      formData.append('validUntil', '');
    }

    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    formData.append('existingImages', JSON.stringify(existingImages));
    galleryImages.forEach((img) => {
      formData.append('images', img);
    });

    setLoading(true);
    try {
      const response = await updateEventApi(event.id, formData);
      if (response.data && response.data.success) {
        toast.success('Event updated successfully!');
        onUpdate(response.data.event);
        onClose();
      } else {
        toast.error(response.data?.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div data-lenis-prevent className="bg-[#0B0A11] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative text-white font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-[#12101F]/50 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold">Edit Event</h2>
            <p className="text-xs text-zinc-400">Update the details of your event below.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg border border-white/10 transition-colors text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left side inputs */}
            <div className="space-y-6">
              
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">Event Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Neon Nights Music Festival"
                  className="w-full bg-[#12101F] text-white px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                />
              </div>

              {/* Category & Event Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Category</label>
                  <div className="relative">
                    <select 
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                      className="w-full bg-[#12101F] text-white px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">Event Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setEventType('in-person')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        eventType === 'in-person' 
                          ? 'bg-[#1D1936] border-purple-500/40 text-white' 
                          : 'bg-[#12101F] border-zinc-800/80 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      In-Person
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEventType('online')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        eventType === 'online' 
                          ? 'bg-[#1D1936] border-purple-500/40 text-white' 
                          : 'bg-[#12101F] border-zinc-800/80 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Online
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">Description</label>
                <textarea 
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Describe your event..."
                  className="w-full bg-[#12101F] text-white p-4 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors h-28 resize-none text-sm"
                />
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-zinc-400">Date</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#12101F] text-zinc-400 px-3 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-zinc-400">Start Time</label>
                    <div className="flex items-center bg-[#12101F] rounded-xl border border-zinc-800 p-1.5 focus-within:border-purple-500 transition-colors w-full min-w-0">
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
                        className="w-8 shrink-0 bg-transparent text-white text-center focus:outline-none text-xs font-semibold"
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
                        className="w-8 shrink-0 bg-transparent text-white text-center focus:outline-none text-xs font-semibold"
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
                    <label className="text-[10px] font-semibold text-zinc-400">End Time</label>
                    <div className="flex items-center bg-[#12101F] rounded-xl border border-zinc-800 p-1.5 focus-within:border-purple-500 transition-colors w-full min-w-0">
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
                        className="w-8 shrink-0 bg-transparent text-white text-center focus:outline-none text-xs font-semibold"
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
                        className="w-8 shrink-0 bg-transparent text-white text-center focus:outline-none text-xs font-semibold"
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

              {/* Offers & Discounts */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Offers & Discounts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-zinc-400">Enable Offer</span>
                    <button 
                      type="button"
                      onClick={() => setEnableOffer(!enableOffer)}
                      className={`w-9 h-5 rounded-full transition-all relative p-0.5 cursor-pointer ${enableOffer ? 'bg-purple-600' : 'bg-zinc-800'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-all block ${enableOffer ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {enableOffer && (
                  <div className="space-y-4 bg-[#12101F]/50 border border-white/5 p-4 rounded-xl">
                    <div className="flex gap-2 items-center text-[10px] text-purple-300 bg-purple-950/20 border border-purple-500/20 rounded-lg p-2.5">
                      <Info className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                      <span>This offer will apply automatically to all ticket bookings for this event.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-400">Discount Value (%)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="e.g. 10"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            className="w-full bg-[#12101F] text-white px-3 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs font-semibold pr-8"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-bold">%</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-400">Min Tickets Required</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 2"
                          value={minTickets}
                          onChange={(e) => setMinTickets(e.target.value)}
                          className="w-full bg-[#12101F] text-white px-3 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-400">Valid From</label>
                        <input 
                          type="date" 
                          value={validFrom}
                          min={formatDateForInput(new Date())}
                          onChange={(e) => setValidFrom(e.target.value)}
                          className="w-full bg-[#12101F] text-zinc-400 px-3 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-400">Valid Until</label>
                        <input 
                          type="date" 
                          value={validUntil}
                          min={validFrom || formatDateForInput(new Date())}
                          max={date || undefined}
                          onChange={(e) => setValidUntil(e.target.value)}
                          className="w-full bg-[#12101F] text-zinc-400 px-3 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side inputs */}
            <div className="space-y-6">

              {/* Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>{eventType === 'online' ? 'Online Details' : 'Location'}</span>
                </div>
                {eventType === 'online' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400">Google Meet / Online Link</label>
                    <input 
                      type="url"
                      value={onlineLink}
                      onChange={(e) => setOnlineLink(e.target.value)}
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      className="w-full bg-[#12101F] text-white px-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-400">Venue Name</label>
                        <input 
                          type="text"
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          placeholder="Venue"
                          className="w-full bg-[#12101F] text-white px-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-400">Address</label>
                        <input 
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Street Address"
                          className="w-full bg-[#12101F] text-white px-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-400">City</label>
                        <input 
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="w-full bg-[#12101F] text-white px-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-zinc-400">State</label>
                        <input 
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          className="w-full bg-[#12101F] text-white px-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tickets */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <Ticket className="w-4 h-4" />
                  <span>Tickets</span>
                </div>
                <div className="space-y-4 bg-[#12101F]/50 border border-white/5 p-4 rounded-xl">
                  {/* Paid / Free */}
                  <div className="bg-[#12101F] p-1 rounded-xl grid grid-cols-2 border border-zinc-850">
                    <button 
                      type="button"
                      onClick={() => setTicketType('paid')}
                      className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
                      className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
                          <div key={idx} className="bg-[#12101F]/85 border border-zinc-800/80 rounded-2xl p-5 space-y-4 relative group">
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
                                <Plus className="w-3.5 h-3.5" />
                                Add Benefit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs text-zinc-500 pt-1">
                        <span>Total Capacity:</span>
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
                        className="w-full bg-[#12101F] text-white px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">Maximum Tickets per Person</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 10"
                      value={maxTicketsPerPerson}
                      onChange={(e) => setMaxTicketsPerPerson(e.target.value)}
                      className="w-full bg-[#12101F] text-white px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">Cover Image</label>
                <div 
                  onClick={() => thumbnailInputRef.current.click()}
                  className="border border-dashed border-zinc-800 hover:border-purple-500/40 bg-[#12101F]/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative min-h-[110px]"
                >
                  <input 
                    type="file" 
                    ref={thumbnailInputRef} 
                    onChange={handleThumbnailChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  {thumbnailPreview ? (
                    <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
                      <img src={thumbnailPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-[10px] font-bold bg-[#1C1A30]/80 px-2 py-1 rounded border border-purple-500/20">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-purple-400" />
                      <p className="text-[10px] text-zinc-500">Upload cover image. Recommended: 1920x1080px</p>
                    </>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">Gallery Images</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Render Existing Gallery Images */}
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative aspect-video rounded-xl overflow-hidden group border border-white/5 bg-[#12101F]/30 animate-fade-in">
                      <img src={img.fileUrl} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-black/90 border border-white/10 text-white rounded-lg transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Render Newly Selected Gallery Images */}
                  {galleryPreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative aspect-video rounded-xl overflow-hidden group border border-white/5 bg-[#12101F]/30 animate-fade-in">
                      <img src={preview} alt={`New Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-black/90 border border-white/10 text-white rounded-lg transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Gallery Image Slot */}
                  <div 
                    onClick={() => galleryInputRef.current.click()}
                    className="border border-dashed border-zinc-800 hover:border-purple-500/40 bg-[#12101F]/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer aspect-video min-h-[80px] hover:bg-[#12101F]/50 group"
                  >
                    <input 
                      type="file" 
                      ref={galleryInputRef} 
                      onChange={handleGalleryChange} 
                      className="hidden" 
                      multiple 
                      accept="image/*" 
                    />
                    <Upload className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] text-zinc-500 text-center font-medium group-hover:text-zinc-300 transition-colors">Add Gallery Image</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5 bg-[#12101F]/30 sticky bottom-0 z-10 backdrop-blur-md">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VendorEditEventModal;
