import React from "react";
import { X } from "lucide-react";

const ViewImages = ({ isOpen, onClose, imageUrl, title = "View Image" }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
    >
      {/* Close Button top-right */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 rounded-full transition-all duration-300 cursor-pointer shadow-lg"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Image Container */}
      <div 
        className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt={title}
          className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-zinc-800/40 select-none animate-in fade-in zoom-in duration-200"
        />
      </div>

      {/* Title / Info Footer */}
      {title && (
        <div className="mt-4 text-center">
          <p className="text-sm font-semibold tracking-wide text-zinc-300 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/60 px-4 py-2 rounded-xl">
            {title}
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewImages;
