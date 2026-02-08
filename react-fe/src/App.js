import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductCatalog from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";

function App() {
  const [mode, setMode] = useState("customer"); // "customer" or "admin"
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Restore user session from localStorage and fetch products on mount
  useEffect(() => {
    // Restore user session if exists
    const savedUser = localStorage.getItem("currentUser");
    const savedCart = localStorage.getItem("cart");
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Failed to restore user session:", e);
        localStorage.removeItem("currentUser");
      }
    }
    
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        setCart(cartItems);
      } catch (e) {
        console.error("Failed to restore cart:", e);
        localStorage.removeItem("cart");
      }
    }
    
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios
      .get("http://localhost:8000/products")
      .then(({ data }) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  const handleSignUp = (email, username, password) => {
    axios
      .post("http://localhost:8000/signup", { email, username, password })
      .then(({ data }) => {
        if (data.success) {
          setCurrentUser(data.user);
          setIsLoggedIn(true);
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          setCurrentPage("home");
          alert("Welcome " + data.user.username + "!");
        } else {
          alert(data.message);
        }
      })
      .catch(() => alert("Sign up failed!"));
  };

  const handleLogin = (email, password) => {
    axios
      .post("http://localhost:8000/login", { email, password })
      .then(({ data }) => {
        if (data.success) {
          setCurrentUser(data.user);
          setIsLoggedIn(true);
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          setCurrentPage("home");
          alert("Login successful!");
        } else {
          alert(data.message);
        }
      })
      .catch(() => alert("Login failed!"));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCart([]);
    setCurrentPage("home");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("cart");
  };

  const handleAdminLogin = (admin) => {
    setAdminUser(admin);
    setMode("admin");
    setCurrentPage("admin-dashboard");
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setMode("customer");
    setCurrentPage("home");
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    alert("Added to cart!");
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      alert("Please log in first!");
      setCurrentPage("auth");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const cartItems = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));

    axios
      .post("http://localhost:8000/checkout", {
        user_id: currentUser.id,
        cart_items: cartItems,
      })
      .then(({ data }) => {
        if (data.success) {
          alert("Order placed successfully!");
          setCart([]);
          setCurrentPage("profile");
        } else {
          alert(data.message);
        }
      })
      .catch(() => alert("Checkout failed!"));
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product-detail");
  };

  return (
    <div className="app">
      {/* ADMIN MODE */}
      {mode === "admin" && adminUser ? (
        <>
          <div className="admin-navbar">
            <div className="admin-navbar-container">
              <div className="admin-logo">🎸 GuitarHub Admin</div>
              <div className="admin-menu">
                <button
                  className={`admin-menu-btn ${currentPage === "admin-dashboard" ? "active" : ""}`}
                  onClick={() => setCurrentPage("admin-dashboard")}
                >
                  Dashboard
                </button>
                <button
                  className={`admin-menu-btn ${currentPage === "admin-products" ? "active" : ""}`}
                  onClick={() => setCurrentPage("admin-products")}
                >
                  Products
                </button>
                <button
                  className={`admin-menu-btn ${currentPage === "admin-orders" ? "active" : ""}`}
                  onClick={() => setCurrentPage("admin-orders")}
                >
                  Orders
                </button>
                <button
                  className={`admin-menu-btn ${currentPage === "admin-users" ? "active" : ""}`}
                  onClick={() => setCurrentPage("admin-users")}
                >
                  Users
                </button>
              </div>
              <div className="admin-info">
                <span>Admin: {adminUser.name}</span>
                <button className="admin-logout-btn" onClick={handleAdminLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="admin-content">
            {currentPage === "admin-dashboard" && (
              <AdminDashboard onNavigate={setCurrentPage} />
            )}
            {currentPage === "admin-products" && <AdminProducts />}
            {currentPage === "admin-orders" && <AdminOrders />}
            {currentPage === "admin-users" && <AdminUsers />}
          </div>
        </>
      ) : mode === "admin" && !adminUser ? (
        // Admin auth screen
        <AdminAuth onAdminLogin={handleAdminLogin} />
      ) : (
        /* CUSTOMER MODE */
        <>
          <div className="customer-mode-header">
            <button
              className="switch-to-admin-btn"
              onClick={() => setMode("admin")}
              title="Admin Login"
            >
              Admin Login
            </button>
          </div>

          {isLoggedIn && (
            <Navbar
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              username={currentUser?.username}
              onLogout={handleLogout}
              cartItemsCount={cart.length}
            />
          )}

          {!isLoggedIn ? (
            <Auth onSignUp={handleSignUp} onLogin={handleLogin} />
          ) : (
            <div className="main-content">
              {currentPage === "home" && (
                <Home onShopClick={() => setCurrentPage("catalog")} />
              )}
              {currentPage === "catalog" && (
                <ProductCatalog
                  products={products}
                  onViewProduct={handleViewProduct}
                  onAddToCart={addToCart}
                />
              )}
              {currentPage === "product-detail" && selectedProduct && (
                <ProductDetail
                  product={selectedProduct}
                  onAddToCart={addToCart}
                  onBack={() => setCurrentPage("catalog")}
                />
              )}
              {currentPage === "cart" && (
                <Cart
                  cartItems={cart}
                  onUpdateQuantity={updateCartQuantity}
                  onRemove={removeFromCart}
                  onCheckout={handleCheckout}
                />
              )}
              {currentPage === "checkout" && (
                <Checkout
                  cartItems={cart}
                  onComplete={() => {
                    setCart([]);
                    setCurrentPage("profile");
                  }}
                />
              )}
              {currentPage === "profile" && currentUser && (
                <Profile userId={currentUser.id} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;