import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProduct } from "../../hooks/useProduct";
import ProductCard from "../product/ProductCard";
import LoadSpinner from "../LoadSpinner";
import { useNavigate } from "react-router-dom";

const listVariants = {
  visible: { transition: { staggerChildren: 0.06 } },
  hidden: {},
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.995 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.18 } },
};

const ProductList = ({ onViewDetails }) => {
  const { filteredProducts, loading } = useProduct();
  const navigate = useNavigate();

  if (loading) return <LoadSpinner fullPage={false} />;

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No products found.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {filteredProducts.map((p) => (
          <motion.div key={p._id ?? p.id} variants={itemVariants} layout>
            <ProductCard
              product={p}
              onViewDetails={() =>
                onViewDetails ? onViewDetails(p) : navigate(`/medicine/${p._id ?? p.id}`)
              }
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductList;
