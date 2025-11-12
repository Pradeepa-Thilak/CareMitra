// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

// Route files
const categories = require("./routes/categories");
const products = require("./routes/products");
const brands = require("./routes/brands");
const authRoutes = require("./routes/authRoutes"); // OTP auth routes

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// ===== API ROUTES =====
app.use("/api/categories", categories);
app.use("/api/products", products);
app.use("/api/brands", brands);
// app.use("/api/auth", authRoutes); // 🔐 OTP Auth system

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tata 1mg Healthcare API is running",
    timestamp: new Date().toISOString(),
  });
});

//==== home page ====
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running! 🚀',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/signup/send-otp',
      'POST /api/auth/signup/verify-mobile', 
      'POST /api/auth/signup/complete',
      'POST /api/auth/login/send-otp',
      'POST /api/auth/login/verify'
    ]
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
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
