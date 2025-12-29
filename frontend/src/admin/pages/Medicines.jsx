import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, Edit, ToggleLeft, ToggleRight, Plus, X } from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    imageUrl: "",
    isActive: true
  });
const [categories, setCategories] = useState([]);
const [brands, setBrands] = useState([]);


useEffect(() => {
  fetchProducts();
  fetchCategories();
  fetchBrands();
}, []);

const fetchCategories = async () => {
  const res = await fetch("http://localhost:5000/admin/categories", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  setCategories(data.data || []);
};

const fetchBrands = async () => {
  const res = await fetch("http://localhost:5000/admin/brands", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  setBrands(data.data || []);
};

  const token = localStorage.getItem("authToken"); // Replace with actual token management

  // 🔹 Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setMedicines(data.data || []);
    } catch (err) {
      console.error("Fetch products failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔎 Search + Filter
  const filtered = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch = m.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && m.isActive) ||
        (statusFilter === "Inactive" && !m.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, medicines]);

  // 📄 Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // 🔁 Toggle Active / Inactive (API)
  const toggleStatus = async (id, currentStatus) => {
    try {
      await fetch(`http://localhost:5000/admin/products/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      setMedicines((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, isActive: !currentStatus } : m
        )
      );
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  // ➕ Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMedicines((prev) => [data.data, ...prev]);
        setShowCreateModal(false);
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          brand: "",
          imageUrl: "",
          isActive: true
        });
      } else {
        alert("Failed to create product");
      }
    } catch (err) {
      console.error("Product creation failed", err);
      alert("Failed to create product");
    }
  };

  // 👁️ View Product
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // ✏️ Edit Product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      category: product.category?._id || product.category || "",
      brand: product.brand?._id || product.brand || "",
      imageUrl: product.imageUrl || "",
      isActive: product.isActive
    });
    setShowEditModal(true);
  };

  // 💾 Update Product
  const handleUpdateProduct = async () => {
    try {
      const res = await fetch(`http://localhost:5000/admin/products/${selectedProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMedicines((prev) =>
          prev.map((m) => (m._id === selectedProduct._id ? data.data : m))
        );
        setShowEditModal(false);
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          brand: "",
          imageUrl: "",
          isActive: true
        });
        setSelectedProduct(null);
      } else {
        alert("Failed to update product");
      }
    } catch (err) {
      console.error("Product update failed", err);
      alert("Failed to update product");
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Medicines Admin
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicine..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">Medicine</th>
                <th className="p-4 text-center font-semibold">Category</th>
                <th className="p-4 text-center font-semibold">Price (₹)</th>
                <th className="p-4 text-center font-semibold">Stock</th>
                <th className="p-4 text-center font-semibold">Status</th>
                <th className="p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && paginated.map((m) => (
                <tr key={m._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{m.name}</td>
                  <td className="p-4 text-center text-gray-600">
                    {m.category?.name || "-"}
                  </td>
                  <td className="p-4 text-center font-semibold text-gray-800">
                    {m.price}
                  </td>
                  <td className="p-4 text-center text-gray-600">{m.stock}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        m.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleViewProduct(m)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                  <button 
                  onClick={() => handleEditProduct(m)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>

                      <button
                        onClick={() => toggleStatus(m._id, m.isActive)}
                        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                          m.isActive ? "text-green-600" : "text-gray-400"
                        }`}
                        title="Toggle Status"
                      >
                        {m.isActive ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && paginated.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No medicines found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create New Product</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Brand</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand name"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Product Image URL</label>
                <input
                  type="url"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                {formData.imageUrl && (
                  <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-32 object-contain rounded"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150?text=Invalid+Image";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Set as Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProduct}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Create Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedProduct && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={() => setShowEditModal(false)}
  >
    <div
      className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Edit Product</h2>
        <button onClick={() => setShowEditModal(false)}>
          <X />
        </button>
      </div>

      <div className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="Price"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: e.target.value })
          }
        />

        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="Stock"
          value={formData.stock}
          onChange={(e) =>
            setFormData({ ...formData, stock: e.target.value })
          }
        />

        {/* CATEGORY */}
<div>
  <label className="text-sm font-medium">Category</label>
  <select
    className="w-full border p-2 rounded"
    value={formData.category}
    onChange={(e) =>
      setFormData({ ...formData, category: e.target.value })
    }
  >
    <option value="">Select Category</option>
    {categories.map((c) => (
      <option key={c._id} value={c._id}>
        {c.name}
      </option>
    ))}
  </select>
</div>

{/* BRAND */}
<div>
  <label className="text-sm font-medium">Brand</label>
  <select
    className="w-full border p-2 rounded"
    value={formData.brand}
    onChange={(e) =>
      setFormData({ ...formData, brand: e.target.value })
    }
  >
    <option value="">Select Brand</option>
    {brands.map((b) => (
      <option key={b._id} value={b._id}>
        {b.name}
      </option>
    ))}
  </select>
</div>

        <div className="flex gap-2 pt-3">
          <button
            className="flex-1 border p-2 rounded"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>

          <button
            className="flex-1 bg-blue-600 text-white p-2 rounded"
            onClick={handleUpdateProduct}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProduct.imageUrl && (
                <div className="col-span-full bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 flex justify-center">
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name}
                    className="max-h-48 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 font-medium mb-2">PRODUCT NAME</p>
                <p className="font-bold text-xl text-gray-800">{selectedProduct.name}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                <p className="text-xs text-purple-600 font-medium mb-2">CATEGORY</p>
                <p className="font-semibold text-lg text-gray-800">
                  {selectedProduct.category?.name || "Not specified"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                <p className="text-xs text-orange-600 font-medium mb-2">BRAND</p>
                <p className="font-semibold text-lg text-gray-800">
                  {selectedProduct.brand?.name || "Not specified"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                <p className="text-xs text-green-600 font-medium mb-2">PRICE</p>
                <p className="font-bold text-2xl text-green-700">₹{selectedProduct.price}</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
                <p className="text-xs text-indigo-600 font-medium mb-2">STOCK QUANTITY</p>
                <p className="font-semibold text-lg text-gray-800">{selectedProduct.stock} units</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl border border-pink-200">
                <p className="text-xs text-pink-600 font-medium mb-2">STATUS</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                    selectedProduct.isActive
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {selectedProduct.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {selectedProduct.description && (
              <div className="mt-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 font-medium mb-2">DESCRIPTION</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedProduct.description}</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full px-4 py-3 bg-gray-800 text-white hover:bg-gray-900 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}