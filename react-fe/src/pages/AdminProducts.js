import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "Electric",
    description: "",
    brand: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios
      .get("http://localhost:8000/admin/products")
      .then(({ data }) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:8000/admin/products", {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        description: formData.description,
        brand: formData.brand,
        image: "🎸",
        year: new Date().getFullYear().toString(),
      })
      .then(({ data }) => {
        if (data.success) {
          setProducts([...products, data.product]);
          setFormData({
            name: "",
            price: "",
            quantity: "",
            category: "Electric",
            description: "",
            brand: "",
          });
          setShowAddForm(false);
          alert("Product added successfully!");
        }
      })
      .catch(() => alert("Failed to add product"));
  };

  const handleUpdateProduct = (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    setEditingId(id);
    setFormData({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      description: product.description,
      brand: product.brand,
    });
    setShowAddForm(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();

    axios
      .put(`http://localhost:8000/admin/products/${editingId}`, {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        description: formData.description,
        brand: formData.brand,
      })
      .then(({ data }) => {
        if (data.success) {
          setProducts(
            products.map((p) => (p.id === editingId ? data.product : p))
          );
          resetForm();
          alert("Product updated successfully!");
        }
      })
      .catch(() => alert("Failed to update product"));
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    axios
      .delete(`http://localhost:8000/admin/products/${id}`)
      .then(({ data }) => {
        if (data.success) {
          setProducts(products.filter((p) => p.id !== id));
          alert("Product deleted successfully!");
        }
      })
      .catch(() => alert("Failed to delete product"));
  };

  const handleMarkSoldOut = (id) => {
    if (!window.confirm("Mark this product as sold out?")) return;

    axios
      .put(`http://localhost:8000/admin/products/${id}/soldout`)
      .then(({ data }) => {
        if (data.success) {
          setProducts(
            products.map((p) => (p.id === id ? data.product : p))
          );
          alert("Product marked as sold out!");
        }
      })
      .catch(() => alert("Failed to mark as sold out"));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      quantity: "",
      category: "Electric",
      description: "",
      brand: "",
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  if (loading) return <div className="admin-content">Loading...</div>;

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h1>🎸 Manage Products</h1>
        <button
          className="admin-btn-primary"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          + Add New Product
        </button>
      </div>

      {showAddForm && (
        <div className="admin-form-container">
          <form
            onSubmit={editingId ? handleSaveEdit : handleAddProduct}
            className="admin-form"
          >
            <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
            />

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="Electric">Electric</option>
              <option value="Acoustic">Acoustic</option>
            </select>

            <input
              type="text"
              name="brand"
              placeholder="Brand"
              value={formData.brand}
              onChange={handleInputChange}
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />

            <div className="form-actions">
              <button type="submit" className="btn-save">
                {editingId ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={product.quantity === 0 ? "sold-out-row" : ""}>
                <td>#{product.id}</td>
                <td className="product-name">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <img src={product.image} alt={product.name} className="admin-thumb" onError={(e) => e.currentTarget.src = '/images/fallback.svg'} />
                    {product.name}
                  </div>
                </td>
                <td>{product.brand}</td>
                <td>{product.category}</td>
                <td className="price">Rs {product.price.toFixed(0)}</td>
                <td className={product.quantity === 0 ? "stock-alert" : ""}>
                  {product.quantity === 0 ? "SOLD OUT" : product.quantity}
                </td>
                <td className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleUpdateProduct(product.id)}
                  >
                    ✏️
                  </button>
                  {product.quantity > 0 && (
                    <button
                      className="btn-sold-out"
                      onClick={() => handleMarkSoldOut(product.id)}
                      title="Mark as sold out"
                    >
                      ⛔
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
