import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../services/user.api";
import { toast } from "sonner";
import { COMMON_ROUTES } from "../../constants/Routes";

function calcStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0-4
}

const LEVELS = [
  { label: "Too weak", color: "#ef4444" },
  { label: "Weak",     color: "#f97316" },
  { label: "Fair",     color: "#eab308" },
  { label: "Good",     color: "#22c55e" },
  { label: "Strong",   color: "#10b981" },
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]  = useState(false);
  const {resetToken} = useParams()

  const strength = useMemo(() => calcStrength(password), [password]);
  const level    = password.length === 0 ? null : LEVELS[strength];

  const reqs = [
    { label: "Min. 8 characters",      met: password.length >= 8 },
    { label: "One number",             met: /\d/.test(password) },
    { label: "One special character",  met: /[^A-Za-z0-9]/.test(password) },
    { label: "Uppercase & lowercase",  met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
  ];

  const passwordsMatch = confirm.length > 0 && confirm === password;
  const canSubmit = reqs.every((r) => r.met) && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    if (!canSubmit) return;
    setLoading(true);
    await resetPassword(resetToken,password)
    setLoading(false);
    setDone(true);
    toast.success("Password reset Successfully")
    } catch (error) {
      console.log("Error from reset password : ",error)
      toast.error(error.response?.data?.message || "Something went Wrong Try again latter")
    }
    
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .rp-root {
          min-height: 100vh;
          background: #080810;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ambient blobs */
        .rp-root::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,40,217,0.32) 0%, transparent 70%);
          top: -120px; left: -120px;
          pointer-events: none;
        }
        .rp-root::after {
          content: '';
          position: absolute;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          pointer-events: none;
        }

        /* card */
        .rp-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(10,8,22,0.85);
          border: 1px solid rgba(139,92,246,0.22);
          border-top: 2px solid rgba(139,92,246,0.65);
          border-radius: 16px;
          padding: 44px 40px 36px;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset;
        }

        /* icon */
        .rp-icon-wrap {
          width: 62px; height: 62px;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 22px;
          box-shadow: 0 4px 20px rgba(109,40,217,0.5);
        }
        .rp-icon-wrap svg { width: 28px; height: 28px; color: #fff; }

        .rp-title {
          font-size: 1.45rem; font-weight: 700;
          color: #fff; text-align: center;
          margin: 0 0 10px;
        }
        .rp-subtitle {
          font-size: 0.84rem; color: #7b7b9a;
          text-align: center; line-height: 1.6;
          margin: 0 0 28px;
        }

        /* labels */
        .rp-label {
          display: block;
          font-size: 0.78rem; font-weight: 500;
          color: #9ca3af; margin-bottom: 8px;
          letter-spacing: 0.03em;
        }

        /* input wrapper */
        .rp-input-wrap {
          position: relative;
          margin-bottom: 6px;
        }
        .rp-input-wrap .rp-icon-left {
          position: absolute;
          left: 13px; top: 50%;
          transform: translateY(-50%);
          width: 15px; height: 15px;
          color: #6d6d8a;
          pointer-events: none;
        }
        .rp-input {
          width: 100%; box-sizing: border-box;
          padding: 12px 42px 12px 38px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(139,92,246,0.28);
          border-radius: 9px;
          color: #e5e7eb;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rp-input::placeholder { color: #3e3e5a; }
        .rp-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.18);
        }
        .rp-eye {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          padding: 0; color: #6d6d8a;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .rp-eye:hover { color: #a78bfa; }
        .rp-eye svg { width: 17px; height: 17px; }

        /* match indicator dot */
        .rp-match-dot {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          width: 10px; height: 10px;
          border-radius: 50%;
          transition: background 0.3s;
        }

        /* strength bar */
        .rp-strength-bar-wrap {
          display: flex;
          gap: 4px;
          margin: 10px 0 4px;
        }
        .rp-strength-seg {
          flex: 1;
          height: 4px;
          border-radius: 99px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s;
        }
        .rp-strength-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          font-size: 0.75rem;
        }
        .rp-strength-label { color: #6b6b86; }

        /* requirements */
        .rp-reqs-box {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 22px;
        }
        .rp-reqs-title {
          font-size: 0.76rem; font-weight: 600;
          color: #7b7b9a; margin: 0 0 10px;
          display: flex; align-items: center; gap: 6px;
        }
        .rp-reqs-title svg { width: 13px; height: 13px; }
        .rp-reqs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px 10px;
        }
        .rp-req {
          display: flex; align-items: center; gap: 7px;
          font-size: 0.78rem;
          transition: color 0.2s;
        }
        .rp-req-dot {
          width: 9px; height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background 0.25s, box-shadow 0.25s;
        }
        .rp-req.met  { color: #22c55e; }
        .rp-req.unmet { color: #555570; }
        .rp-req.met  .rp-req-dot {
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34,197,94,0.5);
        }
        .rp-req.unmet .rp-req-dot { background: #3a3a58; }

        /* submit button */
        .rp-btn {
          width: 100%; padding: 13px;
          border: none; border-radius: 9px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #fff;
          font-size: 0.925rem; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 18px rgba(109,40,217,0.45);
          position: relative; overflow: hidden;
          margin-bottom: 16px;
        }
        .rp-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .rp-btn:hover::before { opacity: 1; }
        .rp-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 26px rgba(109,40,217,0.62);
        }
        .rp-btn:active { transform: translateY(0); }
        .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .rp-btn-arrow { transition: transform 0.25s ease; }
        .rp-btn:hover .rp-btn-arrow { transform: translateX(5px); }

        /* footer link */
        .rp-footer-link {
          text-align: center;
          font-size: 0.83rem; color: #6b6b86;
        }
        .rp-footer-link a {
          color: #7c3aed; text-decoration: none; font-weight: 500;
          transition: color 0.2s;
        }
        .rp-footer-link a:hover { color: #a78bfa; }

        /* success */
        .rp-success {
          text-align: center;
          padding: 8px 0;
        }
        .rp-success-icon {
          width: 54px; height: 54px; border-radius: 50%;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.28);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .rp-success-icon svg { width: 26px; height: 26px; color: #22c55e; }
        .rp-success h3 { margin: 0 0 8px; font-size: 1rem; font-weight: 600; color: #fff; }
        .rp-success p { margin: 0; font-size: 0.83rem; color: #7b7b9a; line-height: 1.55; }
        .rp-success .rp-btn { margin-top: 22px; }

        /* bottom nav */
        .rp-footer-enc {
          position: relative; z-index: 1;
          margin-top: 22px;
          display: flex; align-items: center; gap: 7px;
          font-size: 0.7rem; letter-spacing: 0.1em;
          color: #3a3a56; text-transform: uppercase;
        }
        .rp-footer-enc svg { width: 12px; height: 12px; color: #5b5b7a; }

        /* spinner */
        @keyframes rp-spin { to { transform: rotate(360deg); } }
        .rp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rp-spin 0.7s linear infinite;
        }

        /* fade in */
        @keyframes rp-fadein { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: none; } }
        .rp-card { animation: rp-fadein 0.4s ease; }
      `}</style>

      <div className="rp-root">
        <div className="rp-card">
          {/* icon */}
          <div className="rp-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          {!done ? (
            <>
              <h1 className="rp-title">Create New Password</h1>
              <p className="rp-subtitle">
                Your new password must be different from<br />previously used passwords.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {/* New Password */}
                <label className="rp-label" htmlFor="rp-pwd">New Password</label>
                <div className="rp-input-wrap">
                  <svg className="rp-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    id="rp-pwd"
                    type={showPwd ? "text" : "password"}
                    className="rp-input"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowPwd((v) => !v)} tabIndex={-1}>
                    {showPwd ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Strength bar */}
                <div className="rp-strength-bar-wrap">
                  {[0,1,2,3].map((i) => (
                    <div
                      key={i}
                      className="rp-strength-seg"
                      style={{
                        background: password.length > 0 && i < strength
                          ? level?.color
                          : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className="rp-strength-row">
                  <span className="rp-strength-label">Strength</span>
                  {level && (
                    <span style={{ color: level.color, fontWeight: 600, fontSize: "0.78rem" }}>
                      {level.label}
                    </span>
                  )}
                </div>

                {/* Confirm Password */}
                <label className="rp-label" htmlFor="rp-cfm">Confirm Password</label>
                <div className="rp-input-wrap" style={{ marginBottom: 16 }}>
                  <svg className="rp-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <input
                    id="rp-cfm"
                    type={showCfm ? "text" : "password"}
                    className="rp-input"
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                  {confirm.length === 0 ? (
                    <button type="button" className="rp-eye" onClick={() => setShowCfm((v) => !v)} tabIndex={-1}>
                      {showCfm ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  ) : (
                    <span
                      className="rp-match-dot"
                      style={{
                        background: passwordsMatch ? "#22c55e" : "#ef4444",
                        boxShadow: passwordsMatch
                          ? "0 0 8px rgba(34,197,94,0.6)"
                          : "0 0 8px rgba(239,68,68,0.5)",
                      }}
                    />
                  )}
                </div>

                {/* Requirements */}
                <div className="rp-reqs-box">
                  <p className="rp-reqs-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Password Requirements
                  </p>
                  <div className="rp-reqs-grid">
                    {reqs.map((r) => (
                      <div key={r.label} className={`rp-req ${r.met ? "met" : "unmet"}`}>
                        <span className="rp-req-dot" />
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="rp-btn" disabled={!canSubmit || loading}>
                  {loading ? (
                    <div className="rp-spinner" />
                  ) : (
                    <>
                      Update Password
                      <svg className="rp-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="rp-footer-link">
                  Remember your password?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate(COMMON_ROUTES.LOGIN); }}>Log in</a>
                </p>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="rp-success">
              <div className="rp-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3>Password Updated!</h3>
              <p>Your password has been reset successfully.<br />You can now log in with your new password.</p>
              <button className="rp-btn" onClick={() => navigate(COMMON_ROUTES.LOGIN)}>
                Go to Login
                <svg className="rp-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Bottom encryption label */}
        <div className="rp-footer-enc">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Secure Event Booking Encryption
        </div>
      </div>
    </>
  );
}
