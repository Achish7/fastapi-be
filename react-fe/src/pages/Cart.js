import React from "react";

export default function Cart({ cartItems, onUpdateQuantity, onRemove, onCheckout }) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h1>🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <p>👉 Start shopping to add guitars to your cart!</p>
        </div>
      ) : (
        <div className="cart-container">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} className="cart-item">
                  <td className="cart-product-name">
                    <span className="product-emoji">{item.image}</span>
                    {item.name}
                  </td>
                  <td className="cart-price">Rs {item.price.toFixed(0)}</td>
                  <td className="cart-quantity">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                      }
                    />
                  </td>
                  <td className="cart-subtotal">
                    Rs {(item.price * item.quantity).toFixed(0)}
                  </td>
                  <td className="cart-action">
                    <button
                      className="remove-btn"
                      onClick={() => onRemove(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>Rs {total.toFixed(0)}</span>
            </div>
            <div className="summary-line">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-line">
              <span>Tax:</span>
              <span>Rs {(total * 0.1).toFixed(0)}</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span>Rs {(total * 1.1).toFixed(0)}</span>
            </div>

            <button className="checkout-btn" onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
