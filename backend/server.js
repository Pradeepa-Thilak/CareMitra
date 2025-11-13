// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const connectDB = require("./config/database"); // unified DB connector
const errorHandler = require("./middleware/errorHandler");

// ===== ROUTE FILES =====
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const categories = require("./routes/categories");
const products = require("./routes/products");
const brands = require("./routes/brands");

// ===== LOAD ENVIRONMENT VARIABLES =====
dotenv.config();

// ===== CONNECT TO DATABASE =====
connectDB();

// ===== INITIALIZE APP =====
const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// ===== API ROUTES =====
app.use("/api/auth", authRoutes); // 🔐 OTP Auth system
app.use("/api/patient", patientRoutes); // 🧍‍♀️ Patient module
app.use("/api/doctor", doctorRoutes);   // 👨‍⚕️ Doctor module
app.use("/api/categories", categories); // 🏷️ Extra modules (optional)
app.use("/api/products", products);
app.use("/api/brands", brands);

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Healthcare System API is running ✅",
    timestamp: new Date().toISOString(),
  });
});

// ===== 404 HANDLER =====
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ===== CENTRALIZED ERROR HANDLER =====
app.use(errorHandler);

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `✅ Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});

// ===== HANDLE UNHANDLED PROMISE REJECTIONS =====
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

module.exports = app;
