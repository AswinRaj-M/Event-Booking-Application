import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const AdminReasonSending = ({ isOpen, onClose, onSubmit, eventTitle }) => {
  const [blockReason, setBlockReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!blockReason.trim()) {
      toast.error("A reason is required to block an event.", { position: 'bottom-center' });
      return;
    }
    onSubmit(blockReason);
    setBlockReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#151221] border border-gray-800 w-full max-w-md rounded-2xl p-6 relative text-white font-sans shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={() => {
            onClose();
            setBlockReason('');
          }}
          className="absolute top-4 right-4 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg border border-white/10 transition-colors text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-white mb-4">Block Event</h3>
        <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
          Please enter the reason for blocking the event <span className="text-purple-400 font-semibold">"{eventTitle}"</span>:
        </p>

        <textarea
          placeholder="e.g. Violation of terms, Offensive content..."
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          className="w-full bg-[#0B0914] text-white placeholder-zinc-600 p-3 rounded-xl border border-zinc-800/80 focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none leading-relaxed text-xs mb-6"
        />

        <div className="flex gap-3 justify-end">
          <button 
            onClick={() => {
              onClose();
              setBlockReason('');
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer border-none"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)] cursor-pointer border-none"
          >
            Block Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReasonSending;
