import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Cropper from "react-easy-crop";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
};

export default function CreateCategoryModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  
  const [errors, setErrors] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const tempFileRef = useRef(null);

  // Crop states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

 
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setIconFile(null);
      setIconPreview("");
      setErrors({ name: "", description: "" });
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validExtensions.includes(file.type)) {
        alert("Please upload a valid image file (JPG, JPEG, PNG, or WEBP)");
        return;
      }
      
      tempFileRef.current = file;
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCancelCrop = () => {
    setIsCropModalOpen(false);
    setTempImageSrc("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels || !tempImageSrc) return;
    try {
      const croppedBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels);
      if (croppedBlob) {
        const croppedFile = new File([croppedBlob], tempFileRef.current.name, {
          type: tempFileRef.current.type || "image/jpeg",
          lastModified: Date.now(),
        });
        setIconFile(croppedFile);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setIconPreview(reader.result);
        };
        reader.readAsDataURL(croppedFile);
      }
    } catch (error) {
      console.error("Failed to crop image:", error);
    } finally {
      setIsCropModalOpen(false);
      setTempImageSrc("");
    }
  };

  const handleRemoveImage = () => {
    setIconFile(null);
    setIconPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const tempErrors = { name: "", description: "" };
    let isValid = true;

    if (!name.trim()) {
      tempErrors.name = "Category Name is required.";
      isValid = false;
    }
    if (!description.trim()) {
      tempErrors.description = "Description is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        icon: iconFile,
      });
      handleClose();
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal-backdrop {
          animation: modalFadeIn 0.2s ease-out forwards;
        }
        .animate-modal-content {
          animation: modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
      
      <div 
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-modal-backdrop"
      >
        <div className="bg-[#151221] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col animate-modal-content max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#120F1D] shrink-0">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Add New Category
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 scrollbar-hide">
            {/* Category Name */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Category Name <span className="text-purple-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Music Concerts, Tech Conferences"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                }}
                disabled={loading}
                className={`w-full bg-[#0B0914] border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${
                  errors.name 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                    : "border-gray-800 focus:border-purple-500 focus:ring-purple-500"
                }`}
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Description <span className="text-purple-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what kinds of events belong in this category..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
                }}
                disabled={loading}
                className={`w-full bg-[#0B0914] border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all resize-none ${
                  errors.description 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                    : "border-gray-800 focus:border-purple-500 focus:ring-purple-500"
                }`}
              />
              {errors.description && (
                <span className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                  {errors.description}
                </span>
              )}
            </div>

            {/* Image Upload for Icon */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Category Icon Image
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />

              {!iconPreview ? (
                <div
                  onClick={() => !loading && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-800 hover:border-purple-500/50 bg-[#0B0914] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-purple-950/5 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium group-hover:text-gray-300">
                    Click to upload category icon
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Supports JPG, JPEG, PNG, or WEBP
                  </span>
                </div>
              ) : (
                <div className="border border-gray-800 bg-[#0B0914] rounded-xl p-4 flex items-center gap-4 relative">
                  <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                    <img 
                      src={iconPreview} 
                      alt="Category Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {iconFile?.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {(iconFile?.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end mt-4 pt-4 border-t border-gray-800 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2.5 bg-transparent border border-gray-850 hover:bg-gray-800/40 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-900/20 transition-all cursor-pointer min-w-[130px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Crop Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-modal-backdrop">
          <div className="bg-[#151221] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col animate-modal-content">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#120F1D] shrink-0">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                Crop Category Icon
              </h3>
              <button
                type="button"
                onClick={handleCancelCrop}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative w-full h-80 bg-[#0B0914] overflow-hidden">
              <Cropper
                image={tempImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls */}
            <div className="p-5 bg-[#120F1D] border-t border-gray-800 flex flex-col gap-3 shrink-0">
              <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>Zoom Scale</span>
                <span className="text-purple-400">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end p-5 border-t border-gray-800 bg-[#120F1D] shrink-0">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="px-4 py-2 bg-transparent border border-gray-850 hover:bg-gray-800/40 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
