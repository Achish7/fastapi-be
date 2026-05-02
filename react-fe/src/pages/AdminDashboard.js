import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, ClipboardList, TrendingUp, Users, Music2, ArrowRight } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const STAT_CONFIG = [
  { key: "total_products", label: "Products",  icon: Package,       color: "#3b82f6" },
  { key: "total_orders",   label: "Orders",    icon: ClipboardList, color: "#10b981" },
  { key: "total_revenue",  label: "Revenue",   icon: TrendingUp,    color: "#c9883a", prefix: "Rs " },
  { key: "total_users",    label: "Users",     icon: Users,         color: "#8b5cf6" },
];

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8000/admin/stats")
      .then(({ data }) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;
  if (!stats)  return <div className="admin-error">Failed to load stats.</div>;

  const recentOrders = [...stats.orders].reverse().slice(0, 5);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-subhead">Your store at a glance</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {STAT_CONFIG.map(({ key, label, icon: Icon, color, prefix = "" }) => (
          <div className="stat-card" key={key}>
            <div className="stat-card-icon" style={{ background: `${color}18`, color }}>
              <Icon size={22} />
            </div>
            <div className="stat-card-body">
              <span className="stat-label">{label}</span>
              <span className="stat-value">
                {prefix}{typeof stats[key] === "number" && key === "total_revenue"
                  ? stats[key].toLocaleString()
                  : stats[key]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-quick-actions">
        {[
          { label: "Manage Products", page: "admin-products", icon: Music2 },
          { label: "View Orders",     page: "admin-orders",   icon: ClipboardList },
          { label: "View Users",      page: "admin-users",    icon: Users },
        ].map(({ label, page, icon: Icon }) => (
          <button key={page} className="quick-action-btn" onClick={() => onNavigate(page)}>
            <Icon size={18} />
            <span>{label}</span>
            <ArrowRight size={16} className="qa-arrow" />
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="recent-orders-section">
        <div className="section-head">
          <h2>Recent Orders</h2>
          <button className="section-link" onClick={() => onNavigate("admin-orders")}>
            View all <ArrowRight size={13} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="no-data-text">No orders yet</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>User</th><th>Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><span className="mono">#{order.id}</span></td>
                    <td>User #{order.user_id}</td>
                    <td className="price">Rs {order.total.toLocaleString()}</td>
                    <td><span className="status-badge status-completed">{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
