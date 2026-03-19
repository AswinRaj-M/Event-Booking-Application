import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { forgotPassword } from '../../services/user.api';
import { toast } from 'sonner';
import Loader from '../../components/common/Loader';
import { ROUTES } from '../../constants/routes';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  
  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!email.trim()) {
      return toast.error("Please enter your email address");
    }
    try {
      setLoading(true);
      await forgotPassword(email)
      setTimeout(() => {
        setLoading(false);
      }, 1500);
      toast.success("Reset link send Successfully")
      navigate(ROUTES.LOGIN)
    } catch (error) {
      console.error("Error from the forgot password : ",error)
      toast.error(error)
      setLoading(false);
    }
  };
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
          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">Reset Your Password</h1>
          <p className="text-[14px] text-gray-400 leading-relaxed px-4">
            Enter your registered email address to receive a secure password reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-[12px] font-medium text-gray-400 mb-2 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131313] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-400">Remembered your password? </span>
          <Link to={ROUTES.LOGIN} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Login
          </Link>
        </div>

        <div className="w-full h-px bg-white/5 my-6"></div>

        {/* Security badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#131313] border border-white/5">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Secured by 256-bit Encryption</span>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-8 flex gap-4 text-xs text-gray-600 relative z-10 font-medium">
        <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
        <span className="text-gray-700">•</span>
        <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
      </div>
    </div>
  );
};

export default ForgotPassword;
