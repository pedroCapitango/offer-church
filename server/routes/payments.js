const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `payment-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Submit payment (member only)
router.post('/submit', auth, requireRole(['member']), upload.single('proofFile'), [
  body('type').isIn(['tithe', 'offering']).withMessage('Type must be tithe or offering'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('comments').optional().trim().isLength({ max: 1000 }).withMessage('Comments too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, description, comments } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Payment proof file is required' });
    }

    const payment = new Payment({
      member: req.user._id,
      type,
      amount: parseFloat(amount),
      description,
      comments,
      proofFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

    await payment.save();
    await payment.populate('member', 'name email');

    res.status(201).json({
      message: 'Payment submitted successfully',
      payment
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Payment submission error:', error);
    res.status(500).json({ message: 'Server error during payment submission' });
  }
});

// Get member's payments
router.get('/my-payments', auth, requireRole(['member']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { member: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('member', 'name email')
      .populate('validatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
});

// Get all payments (treasurer/pastor only)
router.get('/', auth, requireRole(['treasurer', 'pastor']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, memberName } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }

    let query = Payment.find(filter)
      .populate('member', 'name email phone')
      .populate('validatedBy', 'name')
      .sort({ createdAt: -1 });

    if (memberName) {
      // This is a simplified search - in production, you'd want full-text search
      const members = await Payment.find(filter).populate('member').then(payments => 
        payments.filter(p => p.member.name.toLowerCase().includes(memberName.toLowerCase()))
      );
      return res.json({
        payments: members.slice((page - 1) * limit, page * limit),
        totalPages: Math.ceil(members.length / limit),
        currentPage: page,
        total: members.length
      });
    }

    const payments = await query
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
});

// Validate payment (treasurer only)
router.put('/:id/validate', auth, requireRole(['treasurer']), [
  body('status').isIn(['validated', 'rejected']).withMessage('Status must be validated or rejected'),
  body('validationNotes').optional().trim().isLength({ max: 1000 }).withMessage('Validation notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, validationNotes } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment has already been processed' });
    }

    payment.status = status;
    payment.validatedBy = req.user._id;
    payment.validatedAt = new Date();
    payment.validationNotes = validationNotes;

    if (status === 'validated') {
      // Generate receipt file reference (simplified - in production you'd generate actual PDF)
      payment.receiptGenerated = true;
      payment.receiptFile = {
        filename: `receipt-${payment._id}-${Date.now()}.pdf`,
        path: `receipts/receipt-${payment._id}-${Date.now()}.pdf`
      };
    }

    await payment.save();
    await payment.populate(['member', 'validatedBy']);

    res.json({
      message: `Payment ${status} successfully`,
      payment
    });
  } catch (error) {
    console.error('Payment validation error:', error);
    res.status(500).json({ message: 'Server error during payment validation' });
  }
});

// Get payment details
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('member', 'name email phone')
      .populate('validatedBy', 'name');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check permissions - members can only see their own payments
    if (req.user.role === 'member' && payment.member._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ message: 'Server error fetching payment details' });
  }
});

// Download receipt (member only, for validated payments)
router.get('/:id/receipt', auth, requireRole(['member']), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.member.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (payment.status !== 'validated' || !payment.receiptGenerated) {
      return res.status(400).json({ message: 'Receipt not available' });
    }

    // In a real implementation, you would generate and return the actual PDF receipt
    res.json({
      message: 'Receipt available for download',
      receiptInfo: {
        paymentId: payment._id,
        amount: payment.amount,
        type: payment.type,
        validatedAt: payment.validatedAt,
        receiptFile: payment.receiptFile
      }
    });
  } catch (error) {
    console.error('Download receipt error:', error);
    res.status(500).json({ message: 'Server error downloading receipt' });
  }
});

module.exports = router;