import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    axios
      .get("http://localhost:8000/admin/stats")
      .then(({ data }) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
        setLoading(false);
      });
  };

  if (loading) return <div className="admin-content">Loading...</div>;
  if (!stats) return <div className="admin-content">Failed to load users</div>;

  return (
    <div className="admin-users">
      <h1>👥 User Management</h1>

      <div className="users-stats">
        <div className="stat-summary">
          <span>Total Users: {stats.total_users}</span>
        </div>
      </div>

      {stats.users.length === 0 ? (
        <div className="no-data">
          <p>No registered users yet</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td className="username">{user.username}</td>
                  <td className="email">{user.email}</td>
                  <td>Recently</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
