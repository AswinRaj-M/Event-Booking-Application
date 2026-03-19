  import { useState } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import logo from "../../assets/logo.jpeg";
  import { useDispatch, useSelector } from "react-redux";
  import { clearMessages, loginUserThunk } from "../../features/user.slice";
  import { useEffect } from "react";
  import { toast } from "sonner";
  import {
    vendorClearMessages,
    vendorLoginThunk,
  } from "../../features/vendorSlice";

  const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    const dispatch = useDispatch();
    const userState = useSelector((state) => state.user);
    const vendorState = useSelector((state) => state.vendor);
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const handleSubmit = (e) => {
      e.preventDefault();

      if (isLogin) {
        dispatch(
          loginUserThunk({
            email,
            password,
          }),
        );
      }
       else {
        dispatch(
          vendorLoginThunk({
            businessEmail: email,
            password,
          }),
        );
      }
    };

    useEffect(() => {
      dispatch(clearMessages());
      dispatch(vendorClearMessages());
    }, [dispatch]);

    useEffect(() => {
      if (isLogin && userState.success) {
        dispatch(clearMessages());
        navigate("/home", { replace: true });
      }

      if (!isLogin && vendorState.success) {
        dispatch(vendorClearMessages());

        if (
          vendorState.vendor?.applicationStatus === "pending" ||
          vendorState.vendor?.applicationStatus === "rejected"
        ) {
          navigate("/vendor/status", {
            replace: true,
            state: {
              businessName: vendorState.vendor?.businessName,
            },
          });
        } else {
          navigate("/vendor/dashboard", { replace: true });
        }
      }

      if (isLogin && userState.error) {

        if(userState.errorCode === "EMAIL_NOT_VERIFIED"){
          toast.warning("Verify your email")
          navigate("/verify-otp",{
            state : {email,userId : userState.userId}
          });
        }else{
          toast.error(userState.error);
        }
        dispatch(clearMessages());
      }

      if (!isLogin && vendorState.error) {
        toast.error(vendorState.error);
        dispatch(vendorClearMessages());
      }
    }, [
      isLogin,
      userState.success,
      userState.error,
      vendorState.success,
      vendorState.error,
      dispatch,
      navigate,
    ]);

    const handleTabSwitch = (mode) => {
      setIsLogin(mode);
      dispatch(clearMessages());
      dispatch(vendorClearMessages());
    };

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
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-white/90">
                Live Events Near You
              </span>
            </div>

            {/* Hero Text - Improved Visibility */}
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4 tracking-tight text-white drop-shadow-2xl">
              Welcome Back to <br />
              the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 drop-shadow-lg">
                Event
              </span>{" "}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-indigo-400 drop-shadow-lg">
                Experience
              </span>
            </h1>

            <p className="text-lg text-gray-200 max-w-lg mb-8 leading-relaxed drop-shadow-md">
              Discover the best concerts, parties, and exclusive gatherings. Book
              your spot, celebrate with friends, and create memories that last
              forever.
            </p>

            {/* Social Proof / Community */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/150?img=${i + 10}`}
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
                  Join the community
                </p>
                <p className="text-xs text-gray-400">
                  Trusted by event goers worldwide
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-black relative">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

          {/* Card Container with Border */}
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
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gray-800 rounded-lg shadow-sm transition-all duration-300 ease-spring ${isLogin ? "left-1" : "left-[calc(50%+4px)]"}`}
              ></div>
              <button
                onClick={() => handleTabSwitch(true)}
                className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isLogin ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              >
                User
              </button>
              <button
                onClick={() => handleTabSwitch(false)}
                className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${!isLogin ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
              >
                Vendor
              </button>
            </div>
            {/* Login Form */}
            <div className="space-y-5">
              <div className="space-y-1 text-center">
                <h3 className="text-xl font-semibold text-white">
                  {isLogin ? "Welcome back" : "Welcome back, Vendor"}
                </h3>
                <p className="text-sm text-gray-400">
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-300 ml-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 pl-11 bg-black/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-600 text-white group-hover:border-gray-700"
                      value={email}
                      autoComplete="email"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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

                <div className="space-y-2">
                  <div className="ml-1">
                    <label
                      className="text-sm font-medium text-gray-300"
                      htmlFor="password"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative group">
                    <input
                      id="password"
                      type={showPassword ? "password" : "text"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pl-11 pr-11 bg-black/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-600 text-white group-hover:border-gray-700"
                      value={password}
                      autoComplete="current-password"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLogin ? userState.loading : vendorState.loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-primary to-violet-600 hover:from-violet-600 hover:to-primary text-white font-medium rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(isLogin ? userState.loading : vendorState.loading) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    isLogin ? "Log In" : "Vendor Log In"
                  )}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-800"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black/50 px-2 text-gray-500 backdrop-blur-sm">
                    or continue with
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#121212] hover:bg-[#1a1a1a] border border-gray-800 rounded-xl transition-colors group">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                    Continue with Google
                  </span>
                </button>
                <div className="flex justify-center mt-2">
                  <p className="text-sm text-gray-400">
                    Don't have an account?{" "}
                    {isLogin ? (
                      <Link
                        to="/signup"
                        className=" text-purple-500 hover:text-purple-400  text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Sign up
                      </Link>
                    ) : (
                      <Link
                        to="/vendor/application"
                        className=" text-purple-500 hover:text-purple-400  text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Appply as a Vendor
                      </Link>
                    )}
                  </p>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                © 2024 Festivo Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Login;
