// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: {
    type: String,
    enum: ["admin", "super_admin"],
    default: "admin",
  },
  otp: String,
  otpExpires: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

adminSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

adminSchema.methods.verifyOTP = function (otp) {
  return this.otp === otp && this.otpExpires > Date.now();
};

adminSchema.methods.clearOTP = function () {
  this.otp = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model("Admin", adminSchema);
