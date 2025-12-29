import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Package, 
  Truck, 
  Shield, 
  ArrowLeft,
  Check,
  AlertCircle,
  Plus,
  Minus
} from "lucide-react";
import { useProduct } from "../hooks/useProduct";
import { productAPI } from "../utils/api";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import LoadSpinner from "../components/LoadSpinner";

const containerVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById } = useProduct();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
          const data = res?.data?.data ?? res?.data ?? res;
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

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product._id || product.id, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    setTimeout(() => navigate("/cart"), 500);
  };

  const handleWishlistToggle = () => {
    const productId = product._id || product.id;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) return <LoadSpinner fullPage />;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/medicines")} className="btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || "https://via.placeholder.com/600x400"];

  const isWishlisted = isInWishlist(product._id || product.id);
  const isOutOfStock = (product.stock || 0) === 0;
  const isLowStock = (product.stock || 0) > 0 && (product.stock || 0) <= 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <motion.div 
        className="container-custom max-w-7xl mx-auto px-4"
        variants={containerVariant}
        initial="hidden"
        animate="visible"
      >
        {/* Success Toast */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Added to cart successfully!
          </motion.div>
        )}

        {/* Back Button */}
        <motion.button
          variants={itemVariant}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <motion.div variants={itemVariant} className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-6">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-contain rounded-lg"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column - Details */}
          <motion.div variants={itemVariant} className="space-y-6">
            {/* Product Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {/* Brand & Category */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                {product.brand?.name && (
                  <>
                    <span className="font-medium text-blue-600">{product.brand.name}</span>
                    <span>•</span>
                  </>
                )}
                {product.category?.name && (
                  <span>{product.category.name}</span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              {product.rating && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-blue-600">
                    ₹{product.discountedPrice ?? product.price}
                  </span>
                  {product.discount && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.price}
                      </span>
                      <span className="bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                {product.discount && (
                  <p className="text-sm text-green-700 mt-2 font-medium">
                    You save ₹{(product.price - (product.discountedPrice ?? product.price)).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Out of Stock</span>
                  </div>
                ) : isLowStock ? (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Only {product.stock} left in stock!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">In Stock ({product.stock} available)</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-6 font-semibold text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                        disabled={quantity >= (product.stock || 99)}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Max: {product.stock || 99}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || addingToCart}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </>
                  )}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart}
                  className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>

              {/* Wishlist & Share */}
              <div className="flex gap-3">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 transition-all ${
                    isWishlisted
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-600" : ""}`} />
                  <span className="font-medium">
                    {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                  </span>
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Brand</span>
                  <span className="text-gray-900 font-semibold">
                    {product.brand?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Category</span>
                  <span className="text-gray-900 font-semibold">
                    {product.category?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Price</span>
                  <span className="text-gray-900 font-semibold">
                    ₹{product.discountedPrice ?? product.price}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">Availability</span>
                  <span className={`font-semibold ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
                    {isOutOfStock ? "Out of Stock" : `${product.stock} in stock`}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-900">Free Delivery</p>
                <p className="text-xs text-gray-500">On orders above ₹500</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-500">100% Protected</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-500">7 days return policy</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetails;