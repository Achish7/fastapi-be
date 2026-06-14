import React, { useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function AdminAuth({ onAdminLogin }) {
  const [email, setEmail] = useState("admin@guitar.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    axios.post(`${API_URL}/admin/login`, { email, password })
      .then(({ data }) => {
        if (data.success) onAdminLogin(data.admin);
        else setError(data.message);
      })
      .catch(() => setError("Admin login failed. Check credentials."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-container">
        <div className="admin-auth-box">
          <div className="admin-auth-header">
            <div className="admin-auth-icon">
              <ShieldCheck size={32} strokeWidth={1.5} />
            </div>
            <h1>Admin Panel</h1>
            <p>GuitarHub Store Management</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin} className="admin-auth-form">
            <div className="form-group">
              <label>Admin Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={16} /></span>
                <input type="email" placeholder="Admin Email" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={16} /></span>
                <input type={showPassword ? "text" : "password"} placeholder="Admin Password"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="toggle-visibility"
                  onClick={() => setShowPassword(s => !s)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: "0.5rem" }}>
              {loading ? "Authenticating…" : "Login as Admin"}
            </button>
          </form>

          <p className="admin-demo-hint">Demo: admin@guitar.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
