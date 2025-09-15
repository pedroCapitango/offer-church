const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['tithe', 'offering'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  comments: {
    type: String,
    trim: true
  },
  proofFile: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  },
  status: {
    type: String,
    enum: ['pending', 'validated', 'rejected'],
    default: 'pending'
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
    type: Date
  },
  validationNotes: {
    type: String,
    trim: true
  },
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptFile: {
    filename: String,
    path: String
  }
}, {
  timestamps: true
});

// Index for better query performance
PaymentSchema.index({ member: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);