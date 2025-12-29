const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

// Create storage engine for prescriptions
const prescriptionStorage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'prescriptions',
          metadata: {
            userId: req.user ? req.user.userId : null,
            uploadType: 'prescription',
            originalName: file.originalname,
            uploadDate: new Date()
          }
        };
        resolve(fileInfo);
      });
    });
  }
});

// Create storage engine for reports
const reportStorage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'reports',
          metadata: {
            userId: req.user ? req.user.userId : null,
            orderId: req.params.id,
            uploadType: 'lab_report',
            originalName: file.originalname,
            uploadDate: new Date()
          }
        };
        resolve(fileInfo);
      });
    });
  }
});

// Handle storage errors
prescriptionStorage.on('connection', (db) => {
  console.log('Prescription GridFS Storage Connected');
});

prescriptionStorage.on('connectionFailed', (err) => {
  console.error(' Prescription GridFS Connection Failed:', err);
});

reportStorage.on('connection', (db) => {
  console.log('Report GridFS Storage Connected');
});

reportStorage.on('connectionFailed', (err) => {
  console.error('Report GridFS Connection Failed:', err);
});

module.exports = {
  prescriptionStorage,
  reportStorage
};