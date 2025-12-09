const mongoose = require("mongoose");

const ReportFileSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LabTestOrder",
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileData: {
    type: Buffer,      // STORES BINARY DATA (NOT BASE64)
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ReportFile", ReportFileSchema);
