import React, { useState, useMemo } from "react";

export default function ProductCatalog({ products, onViewProduct, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quantity, setQuantity] = useState({});

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(products.map((p) => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1>🎸 Guitar Collection</h1>
        <p>Browse our premium selection of guitars</p>
      </div>

      <div className="catalog-container">
        {/* Filters */}
        <aside className="filters">
          <h3>Category</h3>
          <div className="filter-buttons">
            {categories.map((cat) => (
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
        <main className="products-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="product-img"
                  loading="lazy"
                  onError={(e) => e.currentTarget.src = '/images/fallback.svg'}
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <p className="product-category">{product.category}</p>
                <div className="product-price">Rs {product.price.toFixed(0)}</div>
                <div className="product-actions">
                  <button
                    className="view-btn"
                    onClick={() => onViewProduct(product)}
                  >
                    View Details
                  </button>
                  <button
                    className="add-cart-btn"
                    onClick={() => onAddToCart(product, 1)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
