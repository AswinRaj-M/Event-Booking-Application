import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyOTPThunk } from '../../features/user.slice';

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, success, error } = useSelector((state) => state.user);

  const { email, userId } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);


  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (success) {
      navigate('/home', { replace: true });
    }
  }, [success, navigate]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);


    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    const newOtp = [...otp];
    if (e.key === 'Backspace') {
      e.preventDefault();

      if (otp[index] !== '') {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (!/^\d{6}$/.test(pastedData)) return;

    const otpArray = pastedData.split('');
    setOtp(otpArray);


    otpArray.forEach((digit, index) => {
      if (inputsRef.current[index]) {
        inputsRef.current[index].value = digit;
      }
    });


  };

  const handleSubmit = () => {
    const finalOtp = otp.join('');
    if (finalOtp.length !== 6) return;

    dispatch(
      verifyOTPThunk({
        userId,
        otp: finalOtp,
      })
    );

  };

  const isOtpComplete = otp.join('').length === 6;

  return (
    <div className="h-screen w-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans text-white">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col items-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-900/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-bold mb-2 text-center">Verify Your Account</h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          Enter the 6-digit code sent to your email<br />
          <span className="text-white font-medium">{email || 'your email'}</span>
        </p>

        {/* OTP Inputs */}
        <div onPaste={handlePaste} className="flex gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className="w-12 h-14 bg-black/40 border border-gray-700 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
            />
          ))}
        </div>

        {/* Messages */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading && <p className="text-purple-400 text-sm mb-4">Verifying...</p>}

        {/* Resend Logic */}
        <div className="text-center mb-8 text-sm">
          <span className="text-gray-400">Didn't receive the code?&nbsp; </span>
          <button
            disabled={timer > 0}
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setTimer(60);
            }}
          >
            Resend OTP
          </button>
          {timer > 0 && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <span className="text-gray-400 text-xs">Resend available in </span>
              <span className="text-purple-400 font-mono text-xs">{timer}s</span>
            </div>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !isOtpComplete}
          className={`w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all transform
            ${loading || !isOtpComplete
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:from-purple-500 hover:to-indigo-500 hover:-translate-y-0.5 active:translate-y-0'
            }`}
        >
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Entered the wrong email?{' '}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
              Change details
            </Link>
          </p>
        </div>

        {/* Secure Badge */}
        <div className="mt-8 pt-6 border-t border-white/5 w-full text-center">
          <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1.5 opacity-70">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secured by 256-bit Encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;