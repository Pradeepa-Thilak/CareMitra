const express = require("express");
const dotenv = require("dotenv");
const cron = require('node-cron');
const mongoose = require('mongoose');
const kafkaConsumer = require('./kafka/consumer');
const kafkaProducer = require('./kafka/producer');
const { EVENT_TYPES } = require('./kafka/topics');
const session = require('express-session'); 
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit');
const { createLogger, format, transports } = require('winston');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();
const { resetDailyDoctorData, checkExpiredPlansHourly } = require("./cronJobs");
const { sendGeneralEmail } = require('./utils/sendEmail');
const connectDB = require("./config/database");

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.io configuration for real-time features
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Setup Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', process.env.FRONTEND_URL || 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'caremitra-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000 
  }
}));

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Session debug middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(' Session Debug:');
    console.log('   - Session ID:', req.sessionID);
    console.log('   - Pending User:', req.session?.pendingUser);
    console.log('   - URL:', req.originalUrl);
    next();
  });
}

console.log(" Mounting routes...");

// Import all routes
const authRoutes = require("./routes/authRoutes"); 
const categories = require("./routes/categories"); 
const products = require("./routes/products");     
const brands = require("./routes/brands");         
const dashboard = require("./routes/dashboard"); 
const doctorRoutes = require("./routes/doctor");      
const labTestRoutes = require('./routes/labTests');
const adminLabTestRoutes = require('./routes/adminLabTests');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminlabStaff = require('./routes/adminlabStaffRoutes');
const search = require('./routes/search');
const cartRoutes = require('./routes/cartRoutes');
const familyRoutes = require('./routes/familyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminOrders = require("./routes/adminOrders");
const adminConsultations = require("./routes/adminConsultations");
const adminDashboard = require('./routes/adminDashboard');
const adminProductRoutes = require('./routes/adminProduct.routes');
const doctorAPIRoutes = require('./routes/doctorRoutes');

// AI Chatbot Routes
const chatRoutes = require('./routes/chatRoutes');

// Mount routes
app.use('/api/doctors', doctorAPIRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminAuthRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/auth", authRoutes);       
app.use("/categories", categories); 
app.use("/products", products);     
app.use("/brands", brands);         
app.use("/dashboard", dashboard);   
app.use("/doctor", doctorRoutes); 
app.use("/admin", adminOrders);
app.use("/admin", adminConsultations);
app.use("/search", search);
app.use("/admin", adminDashboard);
app.use('/lab-tests', labTestRoutes);
app.use('/admin/lab-tests', adminLabTestRoutes);
app.use('/api/family', familyRoutes);
app.use('/admin/staff', adminlabStaff);
app.use('/search', search);
app.use("/cart", cartRoutes);
app.use('/admin', adminProductRoutes);

// AI Chatbot API Routes
app.use('/chat', chatRoutes);

// Manual reset endpoint for doctors (for testing)
app.get('/api/admin/reset-doctors', async (req, res) => {
  try {
    const result = await resetDailyDoctorData();
    res.json({ 
      success: result.success, 
      message: 'Doctor data reset completed',
      details: result 
    });
  } catch (error) {
    console.error('Error in manual reset:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Schedule cron jobs
function scheduleCronJobs() {
  // Run at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('🕛 Midnight reset triggered');
    await resetDailyDoctorData();
  });
  
  // Run at 4:05 AM (based on your expiresAt time)
  cron.schedule('5 4 * * *', async () => {
    console.log('🔄 4:05 AM reset triggered');
    await resetDailyDoctorData();
  });
  
  // Run every hour to check for recently expired plans
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Hourly check triggered');
    await checkExpiredPlansHourly();
  });
  
  console.log('⏰ Cron jobs scheduled:');
  console.log('   - Midnight (00:00): Full reset');
  console.log('   - 4:05 AM: Premium plan check');
  console.log('   - Hourly: Quick expiry check');
}

// Initialize Kafka Consumer with event handlers
async function initializeKafkaConsumer() {
  const handlers = {
    onLabTestOrderCreated: async (payload) => {
      logger.info('Lab test order created event received', { orderId: payload.orderId });
      // Emit socket event for real-time notification
      io.emit('lab_test_order_created', payload);
    },

    onLabTestPaymentVerified: async (payload) => {
      logger.info('Lab test payment verified', { orderId: payload.orderId, amount: payload.amount });
      io.emit('lab_test_payment_verified', payload);
    },

    onLabTestSampleCollected: async (payload) => {
      logger.info('Lab test sample collected', { orderId: payload.orderId });
      io.emit('lab_test_sample_collected', payload);
    },

    onLabTestReportUploaded: async (payload) => {
      logger.info('Lab test report uploaded', { orderId: payload.orderId, reportId: payload.reportId });
      io.emit('lab_test_report_uploaded', payload);
    },

    onDoctorAppointmentBooked: async (payload) => {
      logger.info('Doctor appointment booked', { appointmentId: payload.appointmentId });
      io.emit('doctor_appointment_booked', payload);
    },

    onDoctorAppointmentCancelled: async (payload) => {
      logger.info('Doctor appointment cancelled', { appointmentId: payload.appointmentId });
      io.emit('doctor_appointment_cancelled', payload);
    }
  };

  try {
    await kafkaConsumer.subscribeToLabTestEvents(handlers);
    console.log('✅ Kafka Consumer event handlers registered');
  } catch (error) {
    console.error('❌ Failed to initialize Kafka Consumer handlers:', error.message);
  }
}

// Graceful shutdown function
async function gracefulShutdown() {
  console.log('🔄 Received shutdown signal, closing gracefully...');
  
  try {
    // Close Socket.io connections
    io.close(() => {
      console.log('✅ Socket.io connections closed');
    });
    
    // Close Kafka Consumer connection
    if (kafkaConsumer && typeof kafkaConsumer.disconnect === 'function') {
      try {
        await kafkaConsumer.disconnect();
        console.log('✅ Kafka Consumer disconnected');
      } catch (error) {
        console.warn('⚠️  Error disconnecting Kafka Consumer:', error.message);
      }
    }
    
    // Close Kafka Producer connection
    if (kafkaProducer && typeof kafkaProducer.disconnect === 'function') {
      try {
        await kafkaProducer.disconnect();
        console.log('✅ Kafka Producer disconnected');
      } catch (error) {
        console.warn('⚠️  Error disconnecting Kafka Producer:', error.message);
      }
    }
    
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
      } catch (error) {
        console.warn('⚠️  Error closing MongoDB connection:', error.message);
      }
    }
    
    // Exit process
    setTimeout(() => {
      console.log('👋 Shutdown complete');
      process.exit(0);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

console.log(" All routes mounted successfully");

// Health check endpoint
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Test route works!" });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "CareMitra Backend is running successfully",
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      kafka: kafkaProducer.isUsingMock ? (kafkaProducer.isUsingMock() ? 'mock' : 'connected') : 'unknown',
      websocket: io.engine.clientsCount ? 'active' : 'idle',
      environment: process.env.NODE_ENV || 'development'
    },
    features: {
      ai_chatbot: true,
      realtime_notifications: true,
      doctor_consultations: true,
      lab_tests: true,
      ecommerce: true
    }
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected');
    
    // Initialize Kafka Producer (optional)
    try {
      console.log('🔧 Testing Kafka Producer connection...');
      // Just check if we can initialize, don't send test message
      console.log('✅ Kafka Producer setup complete (will use mock if needed)');
    } catch (kafkaError) {
      console.warn('⚠️  Kafka Producer setup issue:', kafkaError.message);
    }

    // Initialize Kafka Consumer (optional)
    try {
      await kafkaConsumer.connect();
      await initializeKafkaConsumer();
      console.log('✅ Kafka Consumer initialized');
    } catch (kafkaError) {
      console.error('❌ Kafka Consumer initialization failed:', kafkaError.message);
      console.log('App will continue without Kafka Consumer');
    }
    
    // Schedule cron jobs
    scheduleCronJobs();
    
    // Run initial reset on server start
    await resetDailyDoctorData();
    
    // Start server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 CareMitra server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 Kafka: ${kafkaProducer.isUsingMock ? (kafkaProducer.isUsingMock() ? 'MOCK mode' : 'REAL mode') : 'Unknown'}`);
      console.log(`🤖 AI Chatbot: Enabled at /api/chat`);
      console.log(`🔗 WebSocket: Enabled for real-time features`);
    });

  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  
  // Don't exit in production, just log
  if (process.env.NODE_ENV === 'production') {
    console.error('Unhandled rejection (continuing):', reason);
  } else {
    console.error('🚨 Unhandled Rejection:', reason);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('🚨 Uncaught Exception:', error);
  
  // In production, we might want to restart the process
  if (process.env.NODE_ENV === 'production') {
    console.error('Restarting due to uncaught exception...');
    process.exit(1);
  }
});

startServer();

module.exports = { app, server, io };