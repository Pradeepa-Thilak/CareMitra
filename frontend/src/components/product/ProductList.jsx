import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../product/ProductCard";
import LoadSpinner from "../LoadSpinner";
import { useNavigate } from "react-router-dom";

const listVariants = {
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.2 } },
};

const ProductList = ({ products, loading, currentPage }) => {
  const navigate = useNavigate();

  if (loading) return <LoadSpinner fullPage={false} />;

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products found.</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentPage}   // ⭐ CRITICAL FIX
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={listVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {products.map((p) => (
          <motion.div
            key={p._id ?? p.id}
            variants={itemVariants}
          >
            <ProductCard
              product={p}
              onViewDetails={() =>
                navigate(`/medicine/${p._id ?? p.id}`)
              }
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductList;
