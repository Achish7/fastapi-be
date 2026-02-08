import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Profile({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/orders/${userId}`)
      .then(({ data }) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className="profile-page">
      <h1>👤 My Profile</h1>

      <section className="orders-section">
        <h2>📋 Order History</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <p>Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="orders-container">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.id}</h3>
                  <span className={`order-status status-${order.status}`}>
                    {order.status?.toUpperCase()}
                  </span>
                </div>

                <div className="order-items">
                  <h4>Items:</h4>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x {item.quantity} @ Rs {item.price.toFixed(0)} each
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-total">
                  <strong>Total: Rs {order.total.toFixed(0)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
