import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { Plus, Pencil, Trash2, AlertCircle, Music2, X } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const BLANK = { name: "", price: "", quantity: "", category: "Electric", description: "", brand: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(BLANK);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = () => {
    axios.get(`${API_URL}/admin/products`)
      .then(({ data }) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const resetForm = () => { setFormData(BLANK); setShowForm(false); setEditingId(null); };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
    };
    if (editingId) {
      axios.put(`${API_URL}/admin/products/${editingId}`, payload)
        .then(({ data }) => {
          if (data.success) { setProducts(ps => ps.map(p => p.id === editingId ? data.product : p)); resetForm(); }
        }).catch(() => alert("Failed to update product"));
    } else {
      axios.post(`${API_URL}/admin/products`, { ...payload, image: "🎸", year: String(new Date().getFullYear()) })
        .then(({ data }) => {
          if (data.success) { setProducts(ps => [...ps, data.product]); resetForm(); }
        }).catch(() => alert("Failed to add product"));
    }
  };

  const handleEdit = id => {
    const p = products.find(p => p.id === id);
    if (!p) return;
    setEditingId(id);
    setFormData({ name: p.name, price: p.price, quantity: p.quantity, category: p.category, description: p.description, brand: p.brand });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = id => {
    if (!window.confirm("Delete this product?")) return;
    axios.delete(`${API_URL}/admin/products/${id}`)
      .then(({ data }) => { if (data.success) setProducts(ps => ps.filter(p => p.id !== id)); })
      .catch(() => alert("Failed to delete"));
  };

  const handleSoldOut = id => {
    if (!window.confirm("Mark as sold out?")) return;
    axios.put(`${API_URL}/admin/products/${id}/soldout`)
      .then(({ data }) => { if (data.success) setProducts(ps => ps.map(p => p.id === id ? data.product : p)); })
      .catch(() => alert("Failed to mark as sold out"));
  };

  if (loading) return <LoadingSpinner message="Loading products…" />;

  return (
    <div className="admin-products">
      <div className="admin-header">
        <div>
          <h1>Manage Products</h1>
          <p className="admin-subhead">{products.length} product{products.length !== 1 ? "s" : ""} listed</p>
        </div>
        <button className="admin-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-form-container">
          <div className="admin-form-header">
            <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
            <button className="form-close-btn" onClick={resetForm}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-grid">
              <div className="admin-field">
                <label>Product Name</label>
                <input type="text" name="name" placeholder="e.g. Fender Stratocaster"
                  value={formData.name} onChange={handleChange} required />
              </div>
              <div className="admin-field">
                <label>Brand</label>
                <input type="text" name="brand" placeholder="e.g. Fender"
                  value={formData.brand} onChange={handleChange} required />
              </div>
              <div className="admin-field">
                <label>Price (Rs)</label>
                <input type="number" name="price" placeholder="0.00" step="0.01"
                  value={formData.price} onChange={handleChange} required />
              </div>
              <div className="admin-field">
                <label>Quantity</label>
                <input type="number" name="quantity" placeholder="0"
                  value={formData.quantity} onChange={handleChange} required />
              </div>
              <div className="admin-field">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Electric">Electric</option>
                  <option value="Acoustic">Acoustic</option>
                  <option value="Classical">Classical</option>
                  <option value="Bass">Bass</option>
                </select>
              </div>
            </div>
            <div className="admin-field" style={{ marginTop: "1rem" }}>
              <label>Description</label>
              <textarea name="description" placeholder="Product description…" rows={3}
                value={formData.description} onChange={handleChange} required />
            </div>
            <div className="form-actions" style={{ marginTop: "1.25rem" }}>
              <button type="submit" className="btn-save">{editingId ? "Update Product" : "Add Product"}</button>
              <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className={p.quantity === 0 ? "sold-out-row" : ""}>
                <td><span className="mono">#{p.id}</span></td>
                <td>
                  <div className="product-cell">
                    <div className="admin-thumb-wrap">
                      <img src={p.image} alt={p.name} className="admin-thumb"
                        onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
                      <span className="admin-thumb-fallback" style={{ display: "none" }}>
                        <Music2 size={18} strokeWidth={1.5} />
                      </span>
                    </div>
                    <span className="product-name">{p.name}</span>
                  </div>
                </td>
                <td>{p.brand}</td>
                <td><span className="category-chip">{p.category}</span></td>
                <td className="price">Rs {p.price.toLocaleString()}</td>
                <td>
                  {p.quantity === 0
                    ? <span className="stock-alert">Sold Out</span>
                    : <span className="stock-num">{p.quantity}</span>}
                </td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => handleEdit(p.id)} title="Edit">
                    <Pencil size={14} />
                  </button>
                  {p.quantity > 0 && (
                    <button className="btn-sold-out" onClick={() => handleSoldOut(p.id)} title="Mark sold out">
                      <AlertCircle size={14} />
                    </button>
                  )}
                  <button className="btn-delete" onClick={() => handleDelete(p.id)} title="Delete">
                    <Trash2 size={14} />
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
