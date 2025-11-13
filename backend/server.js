// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
require("dotenv").config();

// ===== LOAD ENVIRONMENT VARIABLES =====
dotenv.config();

// ===== IMPORT DATABASE CONNECTION =====
const connectDB = require("./config/database");

// ===== ROUTE FILES =====
const authRoutes = require("./routes/authRoutes"); // 🔐 Auth (OTP via SendGrid)
const patientRoutes = require("./routes/patientRoutes"); // 🧍 Patient module
const doctorRoutes = require("./routes/doctorRoutes");   // 👨‍⚕️ Doctor module
const categories = require("./routes/categories"); // 🏷️ Categories
const products = require("./routes/products");     // 💊 Products
const brands = require("./routes/brands");         // 🏢 Brands

// ===== INITIALIZE APP =====
const app = express();

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ===== REQUEST LOGGER (detailed debug logger) =====
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log("📋 Headers:", req.headers);
  console.log("📦 Body:", req.body);
  next();
});

// ===== DEBUG: Confirm Routes Mounted =====
console.log("🔄 Mounting routes...");

// ===== API ROUTES =====
app.use("/auth", authRoutes);       // OTP Auth System (SendGrid)
app.use("/patient", patientRoutes); // Patient APIs
app.use("/doctor", doctorRoutes);   // Doctor APIs
app.use("/categories", categories); // Category APIs
app.use("/products", products);     // Product APIs
app.use("/brands", brands);         // Brand APIs

console.log("✅ All routes mounted successfully");

// ===== TEST ROUTES =====
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Test route works!" });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "CareMitra Backend is running successfully ✅",
    timestamp: new Date().toISOString(),
  });
});

// ===== 404 HANDLER (debug-friendly) =====
app.use((req, res) => {
  console.log("❌ Route not found:", req.method, req.originalUrl);
  console.log("📋 Available routes:");
  console.log("   GET  /health");
  console.log("   GET  /test");
  console.log("   POST /auth/send-otp/signup");
  console.log("   POST /auth/send-otp/login");
  console.log("   POST /auth/verify-otp");
  console.log("   POST /auth/complete-signup");
  console.log("   GET  /auth/me");

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /health",
      "GET /test",
      "POST /auth/send-otp/signup",
      "POST /auth/send-otp/login",
      "POST /auth/verify-otp",
      "POST /auth/complete-signup",
      "GET /auth/me",
    ],
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 CareMitra server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Test route: http://localhost:${PORT}/test`);
    console.log(`📍 Auth routes: http://localhost:${PORT}/auth/*`);
  });
};

// Start the server
startServer();

// ===== HANDLE UNHANDLED PROMISE REJECTIONS =====
process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled Rejection:", err);
  process.exit(1);
});

module.exports = app;
