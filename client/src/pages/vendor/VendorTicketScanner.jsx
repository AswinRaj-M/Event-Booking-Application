
import React, { useState, useEffect, useRef } from "react";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import { 
  ScanLine, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Users, 
  Ticket, 
  Calendar, 
  MapPin, 
  RefreshCw, 
  Search,
  Volume2,
  VolumeX,
  Sparkles
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "sonner";

const VendorTicketScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loadingRecents, setLoadingRecents] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = "reader-camera-stream";
  const isProcessingRef = useRef(false);
  const lastScannedTokenRef = useRef({ token: null, timestamp: 0 });

  // Fetch recent check-ins for the vendor
  const fetchRecentCheckIns = async () => {
    try {
      setLoadingRecents(true);
      const res = await axiosInstance.get("/vendor/check-ins/recent");
      if (res.data?.success) {
        setRecentCheckIns(res.data.checkIns || []);
      }
    } catch (err) {
      console.error("Error fetching recent check-ins:", err);
    } finally {
      setLoadingRecents(false);
    }
  };

  useEffect(() => {
    fetchRecentCheckIns();
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const playFeedbackSound = (type = "success") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, audioCtx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  const handleValidateToken = async (tokenString) => {
    if (!tokenString || !tokenString.trim() || validating || isProcessingRef.current) return;

    const cleanToken = tokenString.trim();

    try {
      isProcessingRef.current = true;
      setValidating(true);
      const res = await axiosInstance.post("/vendor/check-in", {
        qrToken: cleanToken
      });

      if (res.data?.success) {
        playFeedbackSound("success");
        setLastScanResult({
          status: "success",
          message: res.data.message,
          admittedCount: res.data.admittedCount || res.data.booking?.quantity || 1,
          booking: res.data.booking
        });
        toast.success(res.data.message || "Attendee successfully admitted!");
        fetchRecentCheckIns();
      }
    } catch (err) {
      playFeedbackSound("error");
      const errMsg = err.response?.data?.message || "Invalid or unrecognized QR Code";
      setLastScanResult({
        status: "error",
        message: errMsg,
        token: cleanToken
      });
      toast.error(errMsg);
    } finally {
      setValidating(false);
      setManualCode("");
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
    }
  };

  const startScanner = async () => {
    try {
      setIsScanning(true);
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (!decodedText) return;
          const cleanToken = decodedText.trim();
          const now = Date.now();
          if (isProcessingRef.current) return;
          if (lastScannedTokenRef.current.token === cleanToken && now - lastScannedTokenRef.current.timestamp < 3000) {
            return;
          }
          lastScannedTokenRef.current = { token: cleanToken, timestamp: now };
          handleValidateToken(cleanToken);
        },
        (error) => {
          // Scan errors / frame misses can be ignored
        }
      );
    } catch (err) {
      console.error("Camera startup failed:", err);
      toast.error("Camera access failed. Please ensure camera permissions are granted.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Please enter a QR token or Booking ID");
      return;
    }
    handleValidateToken(manualCode);
  };

  return (
    <div className="flex bg-[#05050C] h-screen text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      <VendorSidebar />

      <main data-lenis-prevent className="flex-1 ml-64 p-6 md:p-10 pb-24 h-full overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800/80 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800/50">
                Gate Entry
              </span>
              <span className="text-xs text-zinc-500 font-medium">1 QR = 1 Purchase Admittance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <ScanLine className="w-8 h-8 text-purple-400" />
              QR Ticket Validator
            </h1>
          </div>

          {/* Sound & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute beep sound" : "Enable beep sound"}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                soundEnabled 
                  ? "bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/60" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? "Sound On" : "Muted"}</span>
            </button>

            <button
              onClick={fetchRecentCheckIns}
              disabled={loadingRecents}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingRecents ? "animate-spin" : ""}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Scanner & Validation Result */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left Column: Camera Scanner & Manual Input (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Camera Viewfinder Box */}
            <div className="bg-[#0B0914] border border-gray-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Live Optical Scanner
                  </h3>
                </div>

                {isScanning ? (
                  <button
                    onClick={stopScanner}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:bg-rose-900/60 text-xs font-bold rounded-xl transition-all"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    Stop Camera
                  </button>
                ) : (
                  <button
                    onClick={startScanner}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-900/30 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Start Camera
                  </button>
                )}
              </div>

              {/* Viewfinder Stream Area */}
              <div className="relative min-h-[300px] w-full bg-[#05050C] rounded-2xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center overflow-hidden">
                <div id={scannerContainerId} className="w-full max-w-sm rounded-xl overflow-hidden" />
                
                {!isScanning && (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-800/50 flex items-center justify-center text-purple-400">
                      <ScanLine className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Camera is inactive</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                        Click "Start Camera" above to scan attendee QR codes in real-time, or enter the code manually below.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Scanner Helper Note */}
              <div className="flex items-center gap-2 mt-4 text-[11px] text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>
                  One scan automatically validates the full purchase and admits all tickets in the booking.
                </span>
              </div>
            </div>

            {/* Manual Entry Fallback */}
            <div className="bg-[#0B0914] border border-gray-800/80 rounded-3xl p-6 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                Manual QR Token / Order ID Check-in
              </h3>
              
              <form onSubmit={handleManualSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Paste QR token hex string or Order ID (e.g. BK-123456-7890)"
                  disabled={validating}
                  className="flex-1 bg-[#05050C] border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono font-bold transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={validating || !manualCode.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-purple-900/30"
                >
                  {validating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Validation Feedback Card (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#0B0914] border border-gray-800/80 rounded-3xl p-6 shadow-2xl h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-3 border-b border-gray-800/80 mb-6 flex items-center justify-between">
                  <span>Live Scan Result</span>
                  {validating && (
                    <span className="text-purple-400 flex items-center gap-1.5 text-[11px] font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Validating...
                    </span>
                  )}
                </h3>

                {/* Validation Status Display */}
                {lastScanResult ? (
                  lastScanResult.status === "success" ? (
                    /* SUCCESS CARD */
                    <div className="space-y-6 animate-fadeIn">
                      <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                          ADMISSION GRANTED
                        </h2>
                        <span className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase rounded-full">
                          Admit {lastScanResult.admittedCount} {lastScanResult.admittedCount > 1 ? "Attendees" : "Attendee"}
                        </span>
                      </div>

                      {/* Attendee Details */}
                      <div className="bg-[#05050C] border border-gray-800/80 rounded-2xl p-5 space-y-3.5 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Event</span>
                          <span className="text-white font-bold text-right max-w-[200px] truncate">
                            {lastScanResult.booking?.eventTitle}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Attendee Name</span>
                          <span className="text-purple-300 font-bold">
                            {lastScanResult.booking?.attendeeName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Order / Booking ID</span>
                          <span className="text-zinc-300 font-mono font-bold">
                            #{lastScanResult.booking?.bookingId}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Tier & Quantity</span>
                          <span className="text-white font-bold">
                            {lastScanResult.booking?.tierName} • {lastScanResult.booking?.quantity} Pass(es)
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Checked In At</span>
                          <span className="text-zinc-400 font-medium">
                            {lastScanResult.booking?.checkedInAt 
                              ? new Date(lastScanResult.booking.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                              : new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ERROR / REJECTION CARD */
                    <div className="space-y-6 animate-fadeIn">
                      <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-2">
                        <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center mx-auto text-rose-400">
                          <XCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                          ENTRY REJECTED
                        </h2>
                        <p className="text-xs text-rose-300 font-medium leading-relaxed">
                          {lastScanResult.message}
                        </p>
                      </div>

                      <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-2xl text-[11px] text-zinc-400 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>
                          Please ensure the attendee holds a valid, paid booking for this specific event and has not checked in previously.
                        </span>
                      </div>
                    </div>
                  )
                ) : (
                  /* IDLE CARD */
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <ScanLine className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-400">Awaiting QR scan</p>
                      <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                        Scanned attendee information and admittance status will appear here immediately.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Ready Status Bar */}
              <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Validator Active
                </span>
                <span>Security Engine v2.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Check-in Activity Log */}
        <div className="bg-[#0B0914] border border-gray-800/80 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Recent Check-Ins at Gate ({recentCheckIns.length})
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">Auto-updated on admittance</span>
          </div>

          {recentCheckIns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800/60 bg-[#070511] text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    <th className="py-3 px-4">Attendee</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Admitted</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {recentCheckIns.map((item) => (
                    <tr key={item._id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 text-[10px]">
                          {item.userId?.fullName?.charAt(0) || "A"}
                        </div>
                        <div>
                          <p>{item.userId?.fullName || "Guest Attendee"}</p>
                          <p className="text-[10px] text-zinc-500 font-normal">{item.userId?.email || ""}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-300">
                        {item.eventId?.title || "Event Title"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                        #{item.bookingId || item._id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/50 text-purple-300 font-bold text-[10px]">
                          {item.quantity} {item.quantity > 1 ? "Passes" : "Pass"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-medium">
                        {item.checkedInAt ? new Date(item.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Admitted
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
              <p>No attendees checked in yet for your events today.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorTicketScanner;
