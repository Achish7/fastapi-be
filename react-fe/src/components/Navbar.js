import React from "react";

export default function Navbar({ currentPage, onNavigate, username, onLogout, cartItemsCount }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => onNavigate("home")}>
          <span className="logo">🎸 GuitarHub</span>
        </div>

        <ul className="navbar-menu">
          <li>
            <button
              className={`nav-link ${currentPage === "home" ? "active" : ""}`}
              onClick={() => onNavigate("home")}
            >
              Home
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === "catalog" ? "active" : ""}`}
              onClick={() => onNavigate("catalog")}
            >
              Shop
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === "cart" ? "active" : ""}`}
              onClick={() => onNavigate("cart")}
            >
              🛒 Cart
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === "profile" ? "active" : ""}`}
              onClick={() => onNavigate("profile")}
            >
              👤 Profile
            </button>
          </li>
        </ul>

        <div className="navbar-user">
          <span className="username">Hi, {username}</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
