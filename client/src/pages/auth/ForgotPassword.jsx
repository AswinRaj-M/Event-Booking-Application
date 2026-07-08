import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/user.api";
import { toast } from "sonner";
import { COMMON_ROUTES } from "../../constants/Routes";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    if (!email) return;
    setLoading(true);
    await forgotPassword(email)
    setLoading(false);
    toast.success("Reset Link Send Successfully")
    setSent(true);
    } catch (error) {
      console.log("Error From forgot password: ",error)
      toast.error(error.response?.data?.message || "Something Went Wrong Try Again Latter")
    }

  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .fp-root {
          min-height: 100vh;
          background: #0d0d14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ambient glow blobs */
        .fp-root::before {
          content: '';
          position: absolute;
          width: 460px;
          height: 460px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%);
          top: -80px;
          left: -100px;
          pointer-events: none;
        }
        .fp-root::after {
          content: '';
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%);
          bottom: -60px;
          right: -80px;
          pointer-events: none;
        }

        .fp-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          background: rgba(10,8,20,0.82);
          border: 1px solid rgba(139,92,246,0.25);
          border-top: 2px solid rgba(139,92,246,0.7);
          border-radius: 16px;
          padding: 44px 40px 36px;
          backdrop-filter: blur(18px);
          box-shadow: 0 8px 40px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03) inset;
        }

        /* icon */
        .fp-icon-wrap {
          width: 62px;
          height: 62px;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 4px 20px rgba(109,40,217,0.5);
        }
        .fp-icon-wrap svg {
          width: 30px;
          height: 30px;
          color: #fff;
        }

        .fp-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: #ffffff;
          text-align: center;
          margin: 0 0 10px;
        }
        .fp-subtitle {
          font-size: 0.845rem;
          color: #8b8ba7;
          text-align: center;
          line-height: 1.6;
          margin: 0 0 30px;
        }

        /* form */
        .fp-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 500;
          color: #9ca3af;
          margin-bottom: 8px;
          letter-spacing: 0.03em;
        }
        .fp-input-wrap {
          position: relative;
          margin-bottom: 20px;
        }
        .fp-input-wrap svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #6d6d8a;
          pointer-events: none;
        }
        .fp-input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px 12px 40px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 9px;
          color: #e5e7eb;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .fp-input::placeholder { color: #4b4b6b; }
        .fp-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.2);
        }

        /* button */
        .fp-btn {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #fff;
          font-size: 0.925rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 18px rgba(109,40,217,0.45);
          position: relative;
          overflow: hidden;
        }
        .fp-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .fp-btn:hover::before { opacity: 1; }
        .fp-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(109,40,217,0.6);
        }
        .fp-btn:active { transform: translateY(0); }
        .fp-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .fp-btn-arrow {
          transition: transform 0.25s ease;
        }
        .fp-btn:hover .fp-btn-arrow {
          transform: translateX(5px);
        }

        /* success state */
        .fp-success {
          text-align: center;
          padding: 10px 0 4px;
        }
        .fp-success-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .fp-success-icon svg { width: 26px; height: 26px; color: #22c55e; }
        .fp-success h3 { margin: 0 0 8px; font-size: 1rem; font-weight: 600; color: #fff; }
        .fp-success p { margin: 0; font-size: 0.83rem; color: #8b8ba7; line-height: 1.55; }

        /* footer link */
        .fp-footer-link {
          text-align: center;
          margin-top: 22px;
          font-size: 0.83rem;
          color: #6b6b86;
        }
        .fp-footer-link a {
          color: #7c3aed;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .fp-footer-link a:hover { color: #a78bfa; }

        /* encryption badge */
        .fp-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 999px;
          font-size: 0.76rem;
          color: #6d6d8a;
        }
        .fp-badge svg { width: 13px; height: 13px; color: #7c3aed; }

        /* bottom nav */
        .fp-nav {
          position: relative;
          z-index: 1;
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.78rem;
          color: #4b4b6b;
        }
        .fp-nav a {
          color: #4b4b6b;
          text-decoration: none;
          transition: color 0.2s;
        }
        .fp-nav a:hover { color: #8b8ba7; }
        .fp-nav span { opacity: 0.4; }

        /* spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .fp-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
      `}</style>

      <div className="fp-root">
        <div className="fp-card">
          {/* Lock icon */}
          <div className="fp-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="fp-title">Reset Your Password</h1>
          <p className="fp-subtitle">
            Enter your registered email address to
            <br />
            receive a secure password reset link.
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} noValidate>
              <label className="fp-label" htmlFor="fp-email">
                Email Address
              </label>
              <div className="fp-input-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="fp-email"
                  type="email"
                  className="fp-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className="fp-btn"
                disabled={loading || !email}
              >
                {loading ? (
                  <div className="fp-spinner" />
                ) : (
                  <>
                    Send Reset Link
                    <svg
                      className="fp-btn-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <p className="fp-footer-link">
                Remembered your password?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(COMMON_ROUTES.LOGIN);
                  }}
                >
                  Login
                </a>
              </p>

              <div className="fp-badge">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Secured by 256-bit Encryption
              </div>
            </form>
          ) : (
            <div className="fp-success">
              <div className="fp-success-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3>Check your inbox!</h3>
              <p>
                We've sent a password reset link to
                <br />
                <strong style={{ color: "#a78bfa" }}>{email}</strong>
              </p>
              <p style={{ marginTop: 12 }}>
                Didn't get the email? Check your spam folder or&nbsp;
                <a
                  href="#"
                  style={{ color: "#7c3aed", textDecoration: "none" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSent(false);
                  }}
                >
                  try again
                </a>
                .
              </p>
              <div className="fp-badge" style={{ marginTop: 24 }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Secured by 256-bit Encryption
              </div>
            </div>
          )}
        </div>

        <div className="fp-nav">
          <a href="#">Privacy Policy</a>
          <span>•</span>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </>
  );
}
