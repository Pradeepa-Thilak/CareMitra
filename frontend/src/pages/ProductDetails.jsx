import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useProduct } from "../hooks/useProduct";
import { productAPI } from "../utils/api";
import LoadSpinner from "../components/LoadSpinner";

const containerVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const ProductDetails = () => {
  const { id } = useParams();
  const { getProductById } = useProduct();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const local = getProductById(id);
        if (local) {
          if (mounted) setProduct(local);
        } else {
          const res = await productAPI.getById(id);
          const data = res?.data?.data ?? res;
          if (mounted) setProduct(data);
        }
      } catch (err) {
        console.error("product details fetch failed", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id, getProductById]);

  if (loading) return <LoadSpinner fullPage />;

  if (!product) {
    return <div className="container-custom py-12">Product not found.</div>;
  }

  return (
    <motion.div className="container-custom py-12" variants={containerVariant} initial="hidden" animate="visible">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div className="bg-white p-4 rounded-lg shadow" layoutId={`product-image-${product._id ?? id}`}>
          <img
            src={(product.images && product.images[0]) || product.image || "https://via.placeholder.com/600x400"}
            alt={product.name}
            className="w-full h-80 object-cover rounded"
          />
        </motion.div>

        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">{product.brand?.name || ""} • {product.category?.name || ""}</p>

          <div className="mb-4 flex items-center gap-4">
            <span className="text-2xl font-bold text-primary">₹{product.discountedPrice ?? product.price}</span>
            {product.discount && (
              <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
            )}
            {product.discount && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded">{product.discount}% OFF</span>}
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{product.description ?? "No description available."}</p>

          <div className="flex gap-3">
            <button className="btn-primary">Buy Now</button>
            <button className="btn-outline">Add to Cart</button>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Details</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Pack Size: {product.packSize ?? "N/A"}</li>
              <li>Manufacturer: {product.manufacturer ?? "Unknown"}</li>
              <li>Stock: {product.stock > 0 ? `${product.stock} available` : "Out of stock"}</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
