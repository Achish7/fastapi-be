import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, UserX } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function AdminUsers() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8000/admin/stats")
      .then(({ data }) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading users…" />;
  if (!stats)  return <div className="admin-error">Failed to load users.</div>;

  return (
    <div className="admin-users">
      <div className="admin-header">
        <div>
          <h1>User Management</h1>
          <p className="admin-subhead">{stats.total_users} registered user{stats.total_users !== 1 ? "s" : ""}</p>
        </div>
        <div className="stat-card-mini">
          <Users size={18} />
          <span>{stats.total_users} Users</span>
        </div>
      </div>

      {stats.users.length === 0 ? (
        <EmptyState icon={<UserX size={52} strokeWidth={1} />} title="No users yet" description="Registered users will appear here." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>User</th><th>Email</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {stats.users.map(user => (
                <tr key={user.id}>
                  <td><span className="mono">#{user.id}</span></td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="username">{user.username}</span>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td><span className="recently-badge">Recently</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
