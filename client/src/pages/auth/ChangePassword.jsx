import React, { useState } from "react";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("••••••••••••");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("••••••••••••");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .cp-root {
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
        .cp-root::before {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%);
          top: 10%;
          left: -10%;
          pointer-events: none;
        }
        .cp-root::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          bottom: 0%;
          right: -5%;
          pointer-events: none;
        }

        .cp-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(18,16,28,0.9);
          border: 1px solid rgba(255,255,255,0.03);
          border-top: 1px solid rgba(167,139,250,0.5);
          border-radius: 16px;
          padding: 36px 32px;
          backdrop-filter: blur(20px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02) inset;
        }

        /* icon */
        .cp-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(124,58,237,0.8), rgba(91,33,182,0.8));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 4px 20px rgba(109,40,217,0.4);
          position: relative;
        }
        .cp-icon-wrap::before {
           content: '';
           position: absolute;
           inset: -4px;
           border-radius: 14px;
           background: rgba(124,58,237,0.15);
           z-index: -1;
        }
        .cp-icon-wrap svg {
          width: 20px;
          height: 20px;
          color: #fff;
        }

        .cp-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
          text-align: center;
          margin: 0 0 8px;
        }
        .cp-subtitle {
          font-size: 0.85rem;
          color: #8b8ba7;
          text-align: center;
          line-height: 1.5;
          margin: 0 0 32px;
        }

        /* form */
        .cp-form-group {
          margin-bottom: 20px;
        }
        .cp-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #e2e8f0;
          margin-bottom: 8px;
        }
        .cp-input-wrap {
          position: relative;
        }
        .cp-input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: #e5e7eb;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .cp-input::placeholder { color: #4b4b6b; letter-spacing: 2px; font-size: 1rem; transform: translateY(2px); }
        .cp-input:focus {
          border-color: #7c3aed;
          background: rgba(0,0,0,0.4);
          box-shadow: 0 0 0 2px rgba(124,58,237,0.15);
        }

        .cp-toggle-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cp-toggle-dot {
          width: 10px;
          height: 10px;
          background: #a78bfa;
          border-radius: 50%;
        }

        /* password strength */
        .cp-strength-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          margin: 8px 0 6px;
        }
        .cp-strength-header span:first-child {
          color: #8b8ba7;
        }
        .cp-strength-text {
          color: #10b981;
          font-weight: 600;
        }
        .cp-strength-bars {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
        }
        .cp-strength-bar {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: rgba(255,255,255,0.06);
        }
        .cp-strength-bar.active {
          background: #10b981;
        }

        /* requirements box */
        .cp-req-box {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .cp-req-title {
          font-size: 0.7rem;
          color: #8b8ba7;
          margin-bottom: 12px;
          font-weight: 500;
        }
        .cp-req-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cp-req-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: #6b6b86;
        }
        .cp-req-item.valid {
          color: #10b981;
        }
        .cp-req-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a78bfa;
          flex-shrink: 0;
        }
        .cp-req-dot.valid {
          background: #10b981;
        }

        /* button */
        .cp-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 15px rgba(139,92,246,0.3);
          position: relative;
          overflow: hidden;
          margin-top: 10px;
        }
        .cp-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139,92,246,0.4);
        }
        .cp-btn:active { transform: translateY(0); }
        .cp-btn-arrow {
          transition: transform 0.25s ease;
        }
        .cp-btn:hover .cp-btn-arrow {
          transform: translateX(4px);
        }

        /* footer link */
        .cp-forgot-link {
          text-align: center;
          margin-top: 16px;
        }
        .cp-forgot-link a {
          font-size: 0.8rem;
          color: #8b8ba7;
          text-decoration: none;
          transition: color 0.2s;
        }
        .cp-forgot-link a:hover { color: #a78bfa; }

        /* bottom nav / text */
        .cp-bottom-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 32px;
          font-size: 0.75rem;
          color: #4b4b6b;
          position: relative;
          z-index: 1;
        }
        .cp-bottom-text svg {
          width: 12px;
          height: 12px;
        }

        /* toast */
        .cp-toast {
          position: absolute;
          bottom: 24px;
          right: 24px;
          background: rgba(26,24,38,0.95);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 320px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          z-index: 10;
        }
        .cp-toast-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(139,92,246,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cp-toast-icon svg {
          width: 16px;
          height: 16px;
          color: #a78bfa;
        }
        .cp-toast-content {
          flex: 1;
        }
        .cp-toast-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }
        .cp-toast-desc {
          font-size: 0.75rem;
          color: #8b8ba7;
          line-height: 1.4;
        }
        .cp-toast-close {
          background: none;
          border: none;
          padding: 2px;
          color: #6b6b86;
          cursor: pointer;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cp-toast-close:hover {
          color: #e5e7eb;
        }
      `}</style>

      <div className="cp-root">
        <div className="cp-card">
          <div className="cp-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <h1 className="cp-title">Change Password</h1>
          <p className="cp-subtitle">Update your password to keep your account secure</p>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="cp-form-group">
              <label className="cp-label">Current Password</label>
              <div className="cp-input-wrap">
                <input
                  type="password"
                  className="cp-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="cp-form-group" style={{ marginBottom: "0" }}>
              <label className="cp-label">New Password</label>
              <div className="cp-input-wrap">
                <input
                  type="password"
                  className="cp-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: "40px" }}
                />
                <button type="button" className="cp-toggle-btn">
                  <div className="cp-toggle-dot"></div>
                </button>
              </div>
            </div>

            <div className="cp-strength-header">
              <span>Password strength</span>
              <span className="cp-strength-text">Strong</span>
            </div>
            <div className="cp-strength-bars">
              <div className="cp-strength-bar active"></div>
              <div className="cp-strength-bar active"></div>
              <div className="cp-strength-bar active"></div>
              <div className="cp-strength-bar"></div>
            </div>

            <div className="cp-req-box">
              <div className="cp-req-title">Password Requirements</div>
              <div className="cp-req-list">
                <div className="cp-req-item valid">
                  <div className="cp-req-dot valid"></div> At least 8 characters long
                </div>
                <div className="cp-req-item valid">
                  <div className="cp-req-dot valid"></div> Contains at least one number
                </div>
                <div className="cp-req-item valid">
                  <div className="cp-req-dot valid"></div> Contains at least one uppercase letter
                </div>
                <div className="cp-req-item">
                  <div className="cp-req-dot"></div> Contains special character (!@#$%)
                </div>
              </div>
            </div>

            <div className="cp-form-group">
              <label className="cp-label">Confirm New Password</label>
              <div className="cp-input-wrap">
                <input
                  type="password"
                  className="cp-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingRight: "40px" }}
                />
                <button type="button" className="cp-toggle-btn">
                  <div className="cp-toggle-dot"></div>
                </button>
              </div>
            </div>

            <button type="submit" className="cp-btn">
              Update Password
              <svg className="cp-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <div className="cp-forgot-link">
              <a href="#">Forgot current password?</a>
            </div>
          </form>
        </div>

        <div className="cp-bottom-text">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Your security is our top priority.
        </div>

        {/* Security Tip Toast */}
        <div className="cp-toast">
          <div className="cp-toast-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="cp-toast-content">
            <div className="cp-toast-title">Security Tip</div>
            <div className="cp-toast-desc">Enable 2FA for an extra layer of protection on your event bookings.</div>
          </div>
          <button className="cp-toast-close" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
