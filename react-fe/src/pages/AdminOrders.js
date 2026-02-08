import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOrders() {
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
  if (!stats) return <div className="admin-content">Failed to load orders</div>;

  return (
    <div className="admin-orders">
      <h1>📋 Order Management</h1>

      {stats.orders.length === 0 ? (
        <div className="no-data">
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>User #{order.user_id}</td>
                  <td className="order-items-cell">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="price">Rs {order.total.toFixed(0)}</td>
                  <td>
                    <span className="status-badge completed">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="order-details">
        <h2>Order Details Summary</h2>
        {stats.orders.map((order) => (
          <details key={order.id} className="order-detail">
            <summary>Order #{order.id} - Rs {order.total.toFixed(0)}</summary>
            <div className="detail-content">
              <p><strong>User ID:</strong> {order.user_id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Items Ordered:</strong></p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} - Qty: {item.quantity} @ Rs {item.price.toFixed(0)} = Rs {item.subtotal.toFixed(0)}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
