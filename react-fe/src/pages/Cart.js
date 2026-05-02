import React from "react";
import { ShoppingCart, Minus, Plus, Trash2, Music2, ArrowRight, PackageOpen } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function Cart({ cartItems, onUpdateQuantity, onRemove, onCheckout }) {
  const subtotal = cartItems.reduce((s, item) => s + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="page-title">
          <ShoppingCart size={26} strokeWidth={1.5} />
          Your Cart
        </h1>
        <EmptyState
          icon={<PackageOpen size={56} strokeWidth={1} />}
          title="Your cart is empty"
          description="Discover our premium guitar collection and add your favourites."
        />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">
        <ShoppingCart size={26} strokeWidth={1.5} />
        Your Cart
        <span className="page-title-badge">{cartItems.length}</span>
      </h1>

      <div className="cart-container">
        {/* Items */}
        <div className="cart-items-wrap">
          {cartItems.map(item => (
            <CartRow
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
        </div>

        {/* Summary */}
        <aside className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-line">
            <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>
            <span>Rs {subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <span className="text-success">Free</span>
          </div>
          <div className="summary-line">
            <span>Tax (10%)</span>
            <span>Rs {tax.toFixed(0)}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>Rs {total.toFixed(0)}</span>
          </div>

          <button className="checkout-btn" onClick={onCheckout}>
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </aside>
      </div>
    </div>
  );
}

function CartRow({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="cart-row">
      {/* Thumbnail */}
      <div className="cart-thumb-wrap">
        <img
          src={item.image}
          alt={item.name}
          className="cart-thumb"
          onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
        />
        <span className="cart-thumb-fallback" style={{ display: "none" }}>
          <Music2 size={22} strokeWidth={1.5} />
        </span>
      </div>

      {/* Info */}
      <div className="cart-row-info">
        <p className="cart-item-name">{item.name}</p>
        <p className="cart-item-brand">{item.brand}</p>
      </div>

      {/* Qty controls */}
      <div className="cart-qty">
        <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}>
          <Minus size={13} />
        </button>
        <span className="qty-value">{item.quantity}</span>
        <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
          <Plus size={13} />
        </button>
      </div>

      {/* Subtotal */}
      <div className="cart-subtotal">
        Rs {(item.price * item.quantity).toLocaleString()}
      </div>

      {/* Remove */}
      <button className="cart-remove-btn" onClick={() => onRemove(item.id)} title="Remove item">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
