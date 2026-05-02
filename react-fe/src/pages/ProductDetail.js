import React, { useState } from "react";
import { ChevronLeft, ShoppingCart, Music2, Tag, Calendar, Package, Minus, Plus } from "lucide-react";

export default function ProductDetail({ product, onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = () => {
    if (quantity > 0 && !isOutOfStock) {
      onAddToCart(product, quantity);
      setQuantity(1);
    }
  };

  const dec = () => setQuantity(q => Math.max(1, q - 1));
  const inc = () => setQuantity(q => Math.min(product.quantity, q + 1));

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={onBack}>
        <ChevronLeft size={16} />
        Back to Catalog
      </button>

      <div className="product-detail-container">
        {/* Image */}
        <div className="product-detail-image">
          <img
            src={product.image}
            alt={product.name}
            className="image-large"
            onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
          />
          <span className="detail-img-fallback" style={{ display: "none" }}>
            <Music2 size={80} strokeWidth={0.8} />
          </span>
        </div>

        {/* Info */}
        <div className="product-detail-info">
          <span className="product-category-badge">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-brand">By {product.brand}</p>
          <div className="detail-price">Rs {product.price.toLocaleString()}</div>
          <p className="detail-description">{product.description}</p>

          <div className="detail-specs">
            <div className="spec">
              <span className="spec-label"><Tag size={13} /> Brand</span>
              <strong>{product.brand}</strong>
            </div>
            <div className="spec">
              <span className="spec-label"><Calendar size={13} /> Year</span>
              <strong>{product.year}</strong>
            </div>
            <div className="spec">
              <span className="spec-label"><Package size={13} /> Stock</span>
              <strong className={isOutOfStock ? "text-danger" : ""}>
                {isOutOfStock ? "Out of Stock" : `${product.quantity} units`}
              </strong>
            </div>
          </div>

          {!isOutOfStock && (
            <div className="quantity-selector">
              <label>Quantity</label>
              <div className="qty-controls">
                <button className="qty-btn" onClick={dec} disabled={quantity <= 1}><Minus size={14} /></button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={inc} disabled={quantity >= product.quantity}><Plus size={14} /></button>
              </div>
            </div>
          )}

          <button
            className="detail-add-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart size={18} />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
