import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { ClipboardList, PackageOpen, CheckCircle } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function Profile({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/orders/${userId}`)
      .then(({ data }) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  return (
    <div className="profile-page">
      <h1 className="page-title">
        <ClipboardList size={26} strokeWidth={1.5} />
        Order History
      </h1>

      <div className="orders-section">
        {loading ? (
          <LoadingSpinner message="Loading your orders…" />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<PackageOpen size={52} strokeWidth={1} />}
            title="No orders yet"
            description="Start shopping to see your order history here."
          />
        ) : (
          <div className="orders-container">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-meta">
                    <h3>Order #{order.id}</h3>
                    <span className="order-items-count">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                  </div>
                  <span className={`order-status status-${order.status}`}>
                    <CheckCircle size={12} />
                    {order.status?.toUpperCase()}
                  </span>
                </div>

                <ul className="order-items-list">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="order-item-row">
                      <span className="oi-name">{item.name}</span>
                      <span className="oi-qty">×{item.quantity}</span>
                      <span className="oi-price">Rs {(item.price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>

                <div className="order-total">
                  <span>Total</span>
                  <span>Rs {order.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
