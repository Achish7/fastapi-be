import React, { useState } from "react";
import { MapPin, Mail, CreditCard, Loader2, CheckCircle, User } from "lucide-react";
import API_URL from "../config/api";

export default function Checkout({ cartItems, userId, onComplete }) {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    address: "", city: "", zipCode: "", cardNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((s, item) => s + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (Object.values(formData).some(v => !v.trim())) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          cart_items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { alert(data.detail || data.message || "Checkout failed!"); return; }
      alert("Order placed successfully!");
      onComplete();
    } catch {
      alert("Checkout failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {/* Shipping */}
          <section className="form-section">
            <h3>
              <MapPin size={14} style={{ marginRight: 6 }} />
              Shipping Information
            </h3>
            <div className="co-row">
              <div className="co-field">
                <label>First Name</label>
                <div className="input-wrapper">
                  <span className="input-icon"><User size={14} /></span>
                  <input type="text" name="firstName" placeholder="First Name"
                    value={formData.firstName} onChange={handleChange} required />
                </div>
              </div>
              <div className="co-field">
                <label>Last Name</label>
                <div className="input-wrapper">
                  <span className="input-icon"><User size={14} /></span>
                  <input type="text" name="lastName" placeholder="Last Name"
                    value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
            </div>
            <div className="co-field">
              <label>Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={14} /></span>
                <input type="email" name="email" placeholder="Email address"
                  value={formData.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="co-field">
              <label>Street Address</label>
              <div className="input-wrapper">
                <span className="input-icon"><MapPin size={14} /></span>
                <input type="text" name="address" placeholder="Street Address"
                  value={formData.address} onChange={handleChange} required />
              </div>
            </div>
            <div className="co-row">
              <div className="co-field">
                <label>City</label>
                <input type="text" name="city" placeholder="City"
                  value={formData.city} onChange={handleChange} required />
              </div>
              <div className="co-field">
                <label>ZIP Code</label>
                <input type="text" name="zipCode" placeholder="ZIP Code"
                  value={formData.zipCode} onChange={handleChange} required />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="form-section">
            <h3>
              <CreditCard size={14} style={{ marginRight: 6 }} />
              Payment Information
            </h3>
            <div className="co-field">
              <label>Card Number</label>
              <div className="input-wrapper">
                <span className="input-icon"><CreditCard size={14} /></span>
                <input type="text" name="cardNumber" placeholder="1234 5678 9012 3456"
                  maxLength="16" value={formData.cardNumber} onChange={handleChange} required />
              </div>
            </div>
          </section>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading
              ? <><Loader2 size={16} className="spin-icon" /> Placing Order...</>
              : <><CheckCircle size={16} /> Place Order</>}
          </button>
        </form>

        {/* Summary */}
        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="checkout-items">
            {cartItems.map(item => (
              <div key={item.id} className="checkout-item">
                <span className="co-item-name">{item.name}</span>
                <span className="co-item-qty">×{item.quantity}</span>
                <span className="co-item-price">Rs {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="co-totals">
            <div className="co-totals-line">
              <span>Subtotal</span>
              <span>Rs {subtotal.toLocaleString()}</span>
            </div>
            <div className="co-totals-line">
              <span>Tax (10%)</span>
              <span>Rs {tax.toFixed(0)}</span>
            </div>
            <div className="co-totals-total">
              <span>Total</span>
              <span>Rs {total.toFixed(0)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
