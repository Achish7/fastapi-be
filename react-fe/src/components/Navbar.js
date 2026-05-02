import React from "react";
import { Home, ShoppingBag, ShoppingCart, User, LogOut, Music2 } from "lucide-react";

export default function Navbar({ currentPage, onNavigate, username, onLogout, cartItemsCount }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => onNavigate("home")}>
          <Music2 size={20} className="brand-icon" />
          <span className="logo">GuitarHub</span>
        </div>

        <ul className="navbar-menu">
          <li>
            <button
              className={`nav-link ${currentPage === "home" ? "active" : ""}`}
              onClick={() => onNavigate("home")}
            >
              <Home size={15} />
              Home
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === "catalog" ? "active" : ""}`}
              onClick={() => onNavigate("catalog")}
            >
              <ShoppingBag size={15} />
              Shop
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === "cart" ? "active" : ""}`}
              onClick={() => onNavigate("cart")}
            >
              <ShoppingCart size={15} />
              Cart
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
              <User size={15} />
              Profile
            </button>
          </li>
        </ul>

        <div className="navbar-user">
          <div className="navbar-avatar">
            {username?.charAt(0).toUpperCase()}
          </div>
          <span className="username">Hi, {username}</span>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
