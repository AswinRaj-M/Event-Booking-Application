import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import { useDispatch, useSelector } from "react-redux";
// import { registerUser } from "../../services/user.api";
import { clearMessages, registerUserThunk } from "../../features/user.slice";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success , userId } = useSelector((state) => state.user);
  const [isSignUp, setIsSignUp] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email : "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeTermsAndConditions: false,
  });

  const [localError, setLocalError] = useState("");

  const {
    fullName,
    email,
    phoneNumber,
    password,
    confirmPassword,
    agreeTermsAndConditions,
  } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeTermsAndConditions) {
      return setLocalError("You must have to agree the terms and conditions");
    }

    if (password !== confirmPassword) {
      return setLocalError("Password do not Match");
    }

    setLocalError("");
    dispatch(
      registerUserThunk({
        fullName,
        email,
        password,
        confirmPassword,
        phoneNumber,
        agreeTermsAndConditions,
      }),
    );
  };

    const handleTabSwitch = (SignUpMode) => {
    setIsSignUp(SignUpMode);
    if (!SignUpMode) {
      navigate('/login');
    }
  };


  useEffect(() => {
    if (success&&userId) {
      dispatch(clearMessages());
      navigate("/verify-otp",{
        state : {
          userId,
          email : email,
        }
      });
    }
  }, [success, dispatch, navigate]);

  return (
    <div className="flex min-h-screen w-full bg-black text-foreground font-sans selection:bg-primary/30 overflow-hidden">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-end p-12 w-full h-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 w-fit mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-medium tracking-wide text-white/90">
              Live Events
            </span>
          </div>

          {/* Hero Text */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4 tracking-tight text-white drop-shadow-2xl">
            Join the Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 drop-shadow-lg">
              Event
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-indigo-400 drop-shadow-lg">
              Experience
            </span>
          </h1>

          <p className="text-lg text-gray-200 max-w-lg mb-8 leading-relaxed drop-shadow-md">
            Create an account today to unlock exclusive access to concerts,
            festivals, and nightlife events. Start booking unforgettable
            moments.
          </p>

          {/* Social Proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/150?img=${i + 20}`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-xs font-bold text-white">
                +2k
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                2,000+ events joined this week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-black relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

        {/* Card Container */}
        <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
          {/* Logo & Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex justify-center">
              <img
                src={logo}
                alt="Festivo"
                className="w-16 h-16 rounded-full object-cover shadow-[0_0_20px_rgba(139,92,246,0.6)]"
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
              Festivo
            </h2>
          </div>

          {/* Sliding Tabs */}
          <div className="relative flex bg-gray-900/50 p-1 rounded-xl mb-6 border border-white/5">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gray-800 rounded-lg shadow-sm transition-all duration-300 ease-spring left-[calc(50%+4px)]`}
            ></div>
            <button
            onClick={() => handleTabSwitch(false)}
              className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-400 hover:text-gray-200`}
            >
              Log In
            </button>
            <button
            onClick={() => handleTabSwitch(true)}
              className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white`}
            >
              Sign Up
            </button>
          </div>

          {/* Signup Form */}
          <div className="space-y-5">
            <div className="space-y-1 text-center">
              <h3 className="text-xl font-semibold text-white">
                Create Your Account
              </h3>
              <p className="text-sm text-gray-400">
                Sign up to discover and book amazing events
              </p>
            </div>

            {(error || localError) && (
              <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm">
                {error || localError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-gray-300 ml-1"
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 pl-10 bg-black/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-gray-600 text-white group-hover:border-gray-700 text-sm"
                    value={fullName}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-gray-300 ml-1"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 pl-10 bg-black/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-gray-600 text-white group-hover:border-gray-700 text-sm"
                    value={email}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-gray-300 ml-1"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <div className="relative group">
                  <input
                    id="phone"
                    type="tel"
                    name="phoneNumber"
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 pl-10 bg-black/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-gray-600 text-white group-hover:border-gray-700 text-sm"
                    value={phoneNumber}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Password */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-medium text-gray-300 ml-1"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pl-10 bg-black/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-gray-600 text-white group-hover:border-gray-700 text-sm"
                      value={password}
                      name="password"
                      onChange={handleChange}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-medium text-gray-300 ml-1"
                    htmlFor="confirmPassword"
                  >
                    Confirm
                  </label>
                  <div className="relative group">
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pl-10 bg-black/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-gray-600 text-white group-hover:border-gray-700 text-sm"
                      value={confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="agreeTermsAndConditions"
                  name="agreeTermsAndConditions"
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-gray-800 bg-black/50 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-0 transition-colors cursor-pointer"
                  checked={agreeTermsAndConditions}
                  onChange={handleChange}
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-xs text-gray-400 cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <span className="text-purple-400 hover:text-purple-300 transition-colors">
                    Terms of Service
                  </span>{" "}
                  &{" "}
                  <span className="text-purple-400 hover:text-purple-300 transition-colors">
                    Privacy Policy
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transition-all duration-200 transform hover:-translate-y-0.5 mt-2"
              >
                Create Account
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-800"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/50 px-2 text-gray-500 backdrop-blur-sm">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#121212] hover:bg-[#1a1a1a] border border-gray-800 rounded-xl transition-colors group">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                  Google
                </span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#121212] hover:bg-[#1a1a1a] border border-gray-800 rounded-xl transition-colors group">
                {/* Apple Icon */}
                <svg
                  className="h-4 w-4 text-gray-300 group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.64 3.57-1.67 1.37-.03 2.65.65 3.34 1.71-2.92 1.63-2.39 5.86.32 7.07-.63 1.83-1.47 3.65-2.31 5.12zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                  Apple
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
