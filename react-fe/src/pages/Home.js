import React from "react";

export default function Home({ onShopClick }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{
        backgroundImage: "url('/images/guitar10.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome to GuitarHub</h1>
          <p>Discover the finest guitars from the world's best brands</p>
          <button className="hero-btn" onClick={onShopClick}>
            Start Shopping 🎸
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3>Premium Quality</h3>
            <p>Handpicked guitars from renowned brands</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚚</span>
            <h3>Fast Shipping</h3>
            <p>Quick delivery to your favorite location</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💯</span>
            <h3>Guaranteed</h3>
            <p>100% authentic instruments with warranty</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎵</span>
            <h3>Expert Support</h3>
            <p>Get advice from guitar enthusiasts</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Find Your Perfect Guitar Today</h2>
        <button className="cta-btn" onClick={onShopClick}>
          Explore Our Collection
        </button>
      </section>
    </div>
  );
}
