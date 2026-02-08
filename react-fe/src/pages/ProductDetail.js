import React, { useState } from "react";

export default function ProductDetail({ product, onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart(product, quantity);
      setQuantity(1);
    }
  };

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Catalog
      </button>

      <div className="product-detail-container">
        <div className="product-detail-image">
          <img 
            src={product.image} 
            alt={product.name}
            className="image-large"
            onError={(e) => e.currentTarget.src = '/images/fallback.svg'}
          />
        </div>

        <div className="product-detail-info">
          <span className="product-category-badge">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-brand">By {product.brand}</p>

          <div className="detail-price">Rs {product.price.toFixed(0)}</div>

          <p className="detail-description">{product.description}</p>

          <div className="detail-specs">
            <div className="spec">
              <span>Brand:</span>
              <strong>{product.brand}</strong>
            </div>
            <div className="spec">
              <span>Year:</span>
              <strong>{product.year}</strong>
            </div>
            <div className="spec">
              <span>In Stock:</span>
              <strong>{product.quantity} units</strong>
            </div>
          </div>

          <div className="quantity-selector">
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              max={product.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <button className="detail-add-btn" onClick={handleAddToCart}>
            🛒 Add to Cart
          </button>

          {product.quantity === 0 && (
            <p className="out-of-stock">Out of Stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
