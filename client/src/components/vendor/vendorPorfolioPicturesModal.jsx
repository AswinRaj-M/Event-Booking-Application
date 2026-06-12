import React, { useState } from "react";
import { Image as ImageIcon, X, Trash2 } from "lucide-react";
import ViewImages from "../common/ViewImages";

const VendorPortfolioPicturesModal = ({ isOpen, onClose, portfolios, onRemove }) => {
  const [viewingImageUrl, setViewingImageUrl] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
        onClick={onClose}
      >
        <div 
          className="bg-[#12111A] border border-zinc-800/85 max-w-4xl w-full max-h-[85vh] rounded-3xl p-6 md:p-8 overflow-hidden flex flex-col relative shadow-[0_20px_50px_rgba(0,0,0,0.85)] transform scale-100 transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800/60">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                All Portfolio Highlights
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                A collection of your past work and highlights ({portfolios?.length || 0} images)
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-xl border border-zinc-800/80 cursor-pointer transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable grid */}
          <div className="overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-2">
              {portfolios && portfolios.map((portfolio, index) => (
                <div
                  key={portfolio._id || index}
                  className="relative aspect-square rounded-2xl overflow-hidden group border border-zinc-800/80 cursor-default bg-zinc-900"
                >
                  <img
                    src={portfolio.fileUrl}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setViewingImageUrl(portfolio.fileUrl)}
                      className="text-[10px] uppercase font-bold tracking-wider text-white bg-zinc-950/90 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    {onRemove && (
                      <button
                        onClick={() => onRemove(portfolio._id)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg border border-rose-500/30 hover:border-rose-500 transition-all duration-300 cursor-pointer"
                        title="Delete Portfolio Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ViewImages 
        isOpen={!!viewingImageUrl} 
        onClose={() => setViewingImageUrl(null)} 
        imageUrl={viewingImageUrl} 
        title="Portfolio Image" 
      />
    </>
  );
};

export default VendorPortfolioPicturesModal;
