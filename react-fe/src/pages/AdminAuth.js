import React, { useState } from "react";
import axios from "axios";

export default function AdminAuth({ onAdminLogin }) {
  const [email, setEmail] = useState("admin@guitar.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    axios
      .post("http://localhost:8000/admin/login", { email, password })
      .then(({ data }) => {
        if (data.success) {
          onAdminLogin(data.admin);
        } else {
          setError(data.message);
        }
      })
      .catch(() => setError("Admin login failed!"));
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-container">
        <div className="admin-auth-box">
          <h1>🎸 Guitar Admin Panel</h1>
          <p>Manage your guitar store</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <h2>Admin Login</h2>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="admin-login-btn">
              Login as Admin
            </button>
            <p className="hint">
              Demo: admin@guitar.com / admin123
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
