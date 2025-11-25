const express = require("express");
const dotenv = require("dotenv");
const session = require('express-session'); 
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
require("dotenv").config();
const familyRoutes = require('./routes/familyRoutes');

dotenv.config();


const connectDB = require("./config/database");

const authRoutes = require("./routes/authRoutes"); 
const categories = require("./routes/categories"); 
const products = require("./routes/products");     
const brands = require("./routes/brands");         
const dashboard = require("./routes/dashboard"); 
const doctor = require("./routes/doctor");      
const labTestRoutes = require('./routes/labTests');
const adminLabTestRoutes = require('./routes/adminLabTests');


const app = express();


app.use(session({
  secret: process.env.JWT_SECRET || 'caremitra-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 15 * 60 * 1000 
  }
}));
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(` ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(" Headers:", req.headers);
  console.log(" Body:", req.body);
  next();
});

app.use((req, res, next) => {
  console.log(' Session Debug:');
  console.log('   - Session ID:', req.sessionID);
  console.log('   - Pending User:', req.session.pendingUser);
  console.log('   - URL:', req.originalUrl);
  next();
});

console.log(" Mounting routes...");


app.use("/auth", authRoutes);       
app.use("/categories", categories); 
app.use("/products", products);     
app.use("/brands", brands);         
app.use("/dashboard",dashboard)     
app.use("/doctor" , doctor); 
app.use("/search", require("./routes/search"));
app.use('/lab-tests', labTestRoutes);
app.use('/admin/lab-tests', adminLabTestRoutes);
app.use('/api/family', familyRoutes);

console.log(" All routes mounted successfully");


app.get("/test", (req, res) => {
  res.json({ success: true, message: "Test route works!" });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "CareMitra Backend is running successfully ",
    timestamp: new Date().toISOString(),
  });
});


app.use((req, res) => {
  console.log(" Route not found:", req.method, req.originalUrl);
  console.log(" Available routes:");
  console.log(" GET    /health");
  console.log(" GET    /test");
  console.log(" POST   /auth/send-otp/signup");
  console.log(" POST   /auth/send-otp/login");
  console.log(" POST   /auth/verify-otp");
  console.log(" POST   /auth/complete-signup");
  console.log(" GET    /auth/me");
  console.log(" GET    /dashboard/viewProfile");
  console.log(" POST   /dashbord/editProfile");
  console.log(" GET    /dashboard/doctorAll");
  console.log(" GET    /dashboard/myAppointments");
  console.log(" POST   /dashboard/bookAppointment/:doctorId");
  console.log(" GET    /doctor/appointments");
  console.log(" PATCH  /doctor//appointment/:patientId/status");
  console.log(" PATCH  /doctor//appointment/:patientId/reschedule");

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET    /health',
      'GET    /test',
      'POST   /auth/send-otp/signup',
      'POST   /auth/send-otp/login', 
      'POST   /auth/verify-otp',
      'POST   /auth/complete-signup',
      'GET    /auth/me',
      'GET    /dashboard/viewProfile',
      'POST   /dashboard/editProfile',
      'GET    /dashboard/doctorAll',
      'POST   /dashboard/bookAppointment/:doctorId',
      'GET    /dashboard/myAppointments',
      'GET    /doctor/appointments',
      'PATCH  /doctor/appointment/:patientId/status',
      'PATCH  /doctor/appointment/:patientId/reschedule'
    ],
  });
});


const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, "0.0.0.0",  () => {
    console.log(` CareMitra server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Test route: http://localhost:${PORT}/test`);
    console.log(` Auth routes: http://localhost:${PORT}/auth/*`);
  });
};

startServer();


process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled Rejection:", err);
  process.exit(1);
});

module.exports = app;
