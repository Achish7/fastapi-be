import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard({ onNavigate }) {
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
  if (!stats) return <div className="admin-content">Failed to load stats</div>;

  return (
    <div className="admin-dashboard">
      <h1>📊 Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <h3>Total Products</h3>
          <p className="stat-value">{stats.total_products}</p>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.total_orders}</p>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <h3>Total Revenue</h3>
          <p className="stat-value">Rs {stats.total_revenue.toFixed(0)}</p>
        </div>

        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <h3>Total Users</h3>
          <p className="stat-value">{stats.total_users}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          className="admin-btn"
          onClick={() => onNavigate("admin-products")}
        >
          🎸 Manage Products
        </button>
        <button
          className="admin-btn"
          onClick={() => onNavigate("admin-orders")}
        >
          📋 View Orders
        </button>
        <button
          className="admin-btn"
          onClick={() => onNavigate("admin-users")}
        >
          👥 View Users
        </button>
      </div>

      <section className="recent-orders">
        <h2>Recent Orders</h2>
        {stats.orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.orders.slice(-5).reverse().map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>#{order.user_id}</td>
                  <td>Rs {order.total.toFixed(0)}</td>
                  <td className="status-completed">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
