import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Music2 } from "lucide-react";

export default function Auth({ onSignUp, onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !username || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    onSignUp(email, username, password);
    setEmail(""); setUsername(""); setPassword("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    onLogin(email, password);
    setEmail(""); setPassword("");
  };

  const toggleMode = () => {
    setIsSignUp(s => !s);
    setError(""); setEmail(""); setUsername(""); setPassword(""); setShowPassword(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-wrap">
              <Music2 size={32} strokeWidth={1.5} />
            </div>
            <h1 className="auth-title">GuitarHub</h1>
            <p className="auth-subtitle">Premium Guitar Store</p>
          </div>

          <div className="auth-toggle-group">
            <button
              type="button"
              className={`auth-toggle-btn ${!isSignUp ? "active" : ""}`}
              onClick={() => isSignUp && toggleMode()}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-toggle-btn ${isSignUp ? "active" : ""}`}
              onClick={() => !isSignUp && toggleMode()}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {!isSignUp ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon"><Mail size={16} /></span>
                  <input id="login-email" type="email" placeholder="Enter your email"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><Lock size={16} /></span>
                  <input id="login-password" type={showPassword ? "text" : "password"}
                    placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="toggle-visibility"
                    onClick={() => setShowPassword(s => !s)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn">Login</button>

              <p className="auth-switch">
                Don't have an account?{" "}
                <button type="button" onClick={toggleMode} className="switch-link">Create one</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon"><Mail size={16} /></span>
                  <input id="signup-email" type="email" placeholder="Enter your email"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-username">Username</label>
                <div className="input-wrapper">
                  <span className="input-icon"><User size={16} /></span>
                  <input id="signup-username" type="text" placeholder="Choose a username"
                    value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><Lock size={16} /></span>
                  <input id="signup-password" type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password" value={password}
                    onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="toggle-visibility"
                    onClick={() => setShowPassword(s => !s)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <small className="password-hint">Min. 6 characters</small>
              </div>

              <button type="submit" className="auth-submit-btn">Create Account</button>

              <p className="auth-switch">
                Already have an account?{" "}
                <button type="button" onClick={toggleMode} className="switch-link">Login</button>
              </p>
            </form>
          )}

          <div className="auth-footer">
            <p className="demo-hint">Demo: Use any email &amp; password (6+ chars) to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
}
