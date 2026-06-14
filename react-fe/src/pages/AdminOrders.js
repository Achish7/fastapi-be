import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { ChevronDown, ChevronUp, PackageOpen } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function AdminOrders() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/admin/stats`)
      .then(({ data }) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading orders…" />;
  if (!stats)  return <div className="admin-error">Failed to load orders.</div>;

  const orders = [...stats.orders].reverse();

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <div>
          <h1>Order Management</h1>
          <p className="admin-subhead">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<PackageOpen size={52} strokeWidth={1} />} title="No orders yet" description="Orders will appear here once customers start purchasing." />
      ) : (
        <div className="orders-accordion">
          {orders.map(order => {
            const open = expanded === order.id;
            return (
              <div key={order.id} className={`order-accordion-item ${open ? "open" : ""}`}>
                <button className="order-accordion-head" onClick={() => setExpanded(open ? null : order.id)}>
                  <div className="oa-left">
                    <span className="mono oa-id">#{order.id}</span>
                    <span className="oa-user">User #{order.user_id}</span>
                  </div>
                  <div className="oa-right">
                    <span className="price oa-total">Rs {order.total.toLocaleString()}</span>
                    <span className="status-badge status-completed">{order.status}</span>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="order-accordion-body">
                    <table className="order-items-table">
                      <thead>
                        <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>Rs {item.price?.toLocaleString()}</td>
                            <td className="price">Rs {item.subtotal?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
