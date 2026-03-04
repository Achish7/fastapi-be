import React, { useState } from "react";

export default function Checkout({ cartItems, userId, onComplete }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxed = total * 1.1;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some((val) => !val.trim())) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // ✅ Now actually calling the backend
      const response = await fetch("http://localhost:8000/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,                          // ✅ pass userId as prop
          cart_items: cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.detail || data.message || "Checkout failed!");
        return;
      }

      alert("✅ Order placed successfully!");
      onComplete();

    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>📦 Checkout</h1>

      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h3>Shipping Information</h3>
            <input type="text" name="firstName" placeholder="First Name"
              value={formData.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Last Name"
              value={formData.lastName} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email"
              value={formData.email} onChange={handleChange} required />
            <input type="text" name="address" placeholder="Street Address"
              value={formData.address} onChange={handleChange} required />
            <input type="text" name="city" placeholder="City"
              value={formData.city} onChange={handleChange} required />
            <input type="text" name="zipCode" placeholder="Zip Code"
              value={formData.zipCode} onChange={handleChange} required />
          </section>

          <section className="form-section">
            <h3>Payment Information</h3>
            <input type="text" name="cardNumber" placeholder="Card Number"
              maxLength="16" value={formData.cardNumber} onChange={handleChange} required />
          </section>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item">
                <span>{item.name}</span>
                <span>x{item.quantity}</span>
                <span>Rs {(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-totals">
            <div className="totals-line">
              <span>Subtotal:</span>
              <span>Rs {total.toFixed(0)}</span>
            </div>
            <div className="totals-line">
              <span>Tax (10%):</span>
              <span>Rs {(taxed - total).toFixed(0)}</span>
            </div>
            <div className="totals-total">
              <span>Total:</span>
              <span>Rs {taxed.toFixed(0)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}