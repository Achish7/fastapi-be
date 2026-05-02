import React, { useState, useMemo } from "react";
import { SlidersHorizontal, Eye, ShoppingCart, PackageOpen, Music2 } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function ProductCatalog({ products, onViewProduct, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => (
    ["All", ...new Set(products.map(p => p.category))]
  ), [products]);

  const filteredProducts = useMemo(() => (
    selectedCategory === "All" ? products : products.filter(p => p.category === selectedCategory)
  ), [products, selectedCategory]);

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1>Guitar Collection</h1>
        <p>Browse our premium selection of guitars</p>
      </div>

      <div className="catalog-container">
        {/* Filters */}
        <aside className="filters">
          <h3>
            <SlidersHorizontal size={13} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Category
          </h3>
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* Products Grid */}
        <main>
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={<PackageOpen size={48} strokeWidth={1} />}
              title="No guitars found"
              description="Try selecting a different category"
            />
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={onViewProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProductCard({ product, onView, onAddToCart }) {
  const isOutOfStock = product.quantity === 0;
  return (
    <div className="product-card">
      <div className="product-image" onClick={() => onView(product)} style={{ cursor: "pointer" }}>
        <img
          src={product.image}
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
        />
        <span className="product-img-fallback" style={{ display: "none" }}>
          <Music2 size={40} strokeWidth={1} />
        </span>
        {isOutOfStock && <div className="out-of-stock-badge">Sold Out</div>}
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-brand">{product.brand}</p>
        <div className="product-price">Rs {product.price.toLocaleString()}</div>

        <div className="product-actions">
          <button className="view-btn" onClick={() => onView(product)}>
            <Eye size={14} /> Details
          </button>
          <button
            className="add-cart-btn"
            onClick={() => !isOutOfStock && onAddToCart(product, 1)}
            disabled={isOutOfStock}
          >
            <ShoppingCart size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
