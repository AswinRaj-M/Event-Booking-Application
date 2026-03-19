import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Key, Shield, Eye, EyeOff, ArrowRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { resetPassword } from '../../services/user.api';
import Loader from '../../components/common/Loader';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const {token} = useParams()


  const [reqs, setReqs] = useState({
    length: false,
    number: false,
    special: false,
    casing: false,
  });

  const [strength, setStrength] = useState(0); 

  useEffect(() => {
    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasCasing = /[a-z]/.test(password) && /[A-Z]/.test(password);

    setReqs({
      length: hasLength,
      number: hasNumber,
      special: hasSpecial,
      casing: hasCasing,
    });


    let score = 0;
    if (hasLength) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (hasCasing) score++;
    
    setStrength(score);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || !confirmPassword.trim()) {
      return toast.error("Please fill in all password fields");
    }
    if (strength < 4) {
      toast.error('Please meet all password requirements');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      await resetPassword(token,password)
      setTimeout(() => {
        setLoading(false);
        toast.success("Password reset Successfully");
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error("Error from reset password: ", error);
      toast.error(error?.message || 'An error occurred during password reset');
      setLoading(false);
    }
  };

  const getStrengthText = () => {
    if (strength === 0) return { text: '', color: 'text-gray-500' };
    if (strength === 1) return { text: 'Weak', color: 'text-red-500' };
    if (strength === 2) return { text: 'Fair', color: 'text-amber-500' };
    if (strength === 3) return { text: 'Good', color: 'text-emerald-500' };
    return { text: 'Strong', color: 'text-emerald-500' };
  };

  const strengthData = getStrengthText();
  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[0%] right-[-10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[420px] bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-8 relative z-10 shadow-2xl">
        {/* Icon Header */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-b from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">Create New Password</h1>
          <p className="text-[14px] text-gray-400 leading-relaxed px-2">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Field */}
          <div>
            <label className="block text-[12px] font-medium text-gray-400 mb-2 ml-1">
              New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#131313] border border-white/5 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength Meter */}
            <div className="mt-3">
              <div className="flex gap-1.5 mb-1.5 h-1">
                {[1, 2, 3, 4].map((index) => {
                  let bgColor = "bg-white/10"; 
                  if (index <= strength) {
                    if (strength <= 1) bgColor = "bg-red-500";
                    else if (strength === 2) bgColor = "bg-amber-500";
                    else if (strength >= 3) bgColor = "bg-emerald-500";
                  }
                  return (
                    <div
                      key={index}
                      className={`h-full flex-1 rounded-full transition-colors duration-300 ${bgColor}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[11px] px-0.5">
                <span className="text-gray-500 font-medium tracking-wide">Strength</span>
                <span className={`${strengthData.color} font-medium transition-colors`}>
                  {strengthData.text}
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-[12px] font-medium text-gray-400 mb-2 ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Shield className="h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#131313] border border-white/5 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                placeholder="••••••••••••"
              />
              {confirmPassword.length > 0 && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  {password === confirmPassword ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Requirements Box */}
          <div className="bg-[#131313] border border-white/5 rounded-xl p-4 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[12px] font-medium text-gray-400">Password Requirements</span>
            </div>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-2">
              <RequirementItem met={reqs.length} text="Min. 8 characters" />
              <RequirementItem met={reqs.number} text="One number" />
              <RequirementItem met={reqs.special} text="One special character" />
              <RequirementItem met={reqs.casing} text="Uppercase & lowercase" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-[0.98] mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Update Password
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-400">Remember your password? </span>
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Log in
          </Link>
        </div>
      </div>

      {/* Footer secure text */}
      <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-gray-500 relative z-10 font-medium uppercase tracking-[0.2em]">
        <Shield className="w-3 h-3" />
        <span>Secure Event Booking Encryption</span>
      </div>
    </div>
  );
};

const RequirementItem = ({ met, text }) => (
  <div className="flex items-center gap-2">
    {met ? (
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)] flex-shrink-0"></div>
    ) : (
      <div className="w-2.5 h-2.5 rounded-full border border-gray-600 bg-transparent flex-shrink-0"></div>
    )}
    <span className={`text-[11px] font-medium ${met ? 'text-emerald-500/90' : 'text-gray-500'} transition-colors`}>
      {text}
    </span>
  </div>
);

export default ResetPassword;