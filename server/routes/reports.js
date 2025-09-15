const express = require('express');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Financial summary report (treasurer/pastor only)
router.get('/financial-summary', auth, requireRole(['treasurer', 'pastor']), async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    
    // Build match filter
    const matchFilter = { status: 'validated' };
    if (Object.keys(dateFilter).length > 0) {
      matchFilter.validatedAt = dateFilter;
    }
    if (type) {
      matchFilter.type = type;
    }

    // Aggregate financial data
    const summary = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Get monthly breakdown
    const monthlyBreakdown = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$validatedAt' },
            month: { $month: '$validatedAt' },
            type: '$type'
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Calculate totals
    const totalTithes = summary.find(s => s._id === 'tithe')?.totalAmount || 0;
    const totalOfferings = summary.find(s => s._id === 'offering')?.totalAmount || 0;
    const grandTotal = totalTithes + totalOfferings;

    res.json({
      summary: {
        totalTithes,
        totalOfferings,
        grandTotal,
        titheCount: summary.find(s => s._id === 'tithe')?.count || 0,
        offeringCount: summary.find(s => s._id === 'offering')?.count || 0
      },
      breakdown: summary,
      monthlyBreakdown
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({ message: 'Server error generating financial summary' });
  }
});

// Member contribution report (treasurer/pastor only)
router.get('/member-contributions', auth, requireRole(['treasurer', 'pastor']), async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    
    const matchFilter = { status: 'validated' };
    if (Object.keys(dateFilter).length > 0) {
      matchFilter.validatedAt = dateFilter;
    }

    const memberContributions = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$member',
          totalTithes: {
            $sum: { $cond: [{ $eq: ['$type', 'tithe'] }, '$amount', 0] }
          },
          totalOfferings: {
            $sum: { $cond: [{ $eq: ['$type', 'offering'] }, '$amount', 0] }
          },
          totalAmount: { $sum: '$amount' },
          titheCount: {
            $sum: { $cond: [{ $eq: ['$type', 'tithe'] }, 1, 0] }
          },
          offeringCount: {
            $sum: { $cond: [{ $eq: ['$type', 'offering'] }, 1, 0] }
          },
          totalCount: { $sum: 1 },
          lastContribution: { $max: '$validatedAt' }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate member details
    const memberIds = memberContributions.map(mc => mc._id);
    const members = await User.find({ _id: { $in: memberIds } }).select('name email phone');
    const memberMap = members.reduce((acc, member) => {
      acc[member._id] = member;
      return acc;
    }, {});

    const enrichedContributions = memberContributions.map(contribution => ({
      ...contribution,
      member: memberMap[contribution._id]
    }));

    res.json({ memberContributions: enrichedContributions });
  } catch (error) {
    console.error('Member contributions error:', error);
    res.status(500).json({ message: 'Server error generating member contributions report' });
  }
});

// Payment status report (treasurer/pastor only)
router.get('/payment-status', auth, requireRole(['treasurer', 'pastor']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    
    const matchFilter = {};
    if (Object.keys(dateFilter).length > 0) {
      matchFilter.createdAt = dateFilter;
    }

    const statusSummary = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get recent pending payments for treasurer attention
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('member', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      statusSummary,
      pendingPayments
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ message: 'Server error generating payment status report' });
  }
});

// Dashboard statistics (treasurer/pastor only)
router.get('/dashboard-stats', auth, requireRole(['treasurer', 'pastor']), async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Current month stats
    const monthlyStats = await Payment.aggregate([
      {
        $match: {
          status: 'validated',
          validatedAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Yearly stats
    const yearlyStats = await Payment.aggregate([
      {
        $match: {
          status: 'validated',
          validatedAt: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Pending payments count
    const pendingCount = await Payment.countDocuments({ status: 'pending' });

    // Active members count
    const activeMembersCount = await User.countDocuments({ role: 'member', isActive: true });

    res.json({
      monthly: {
        tithes: monthlyStats.find(s => s._id === 'tithe') || { amount: 0, count: 0 },
        offerings: monthlyStats.find(s => s._id === 'offering') || { amount: 0, count: 0 }
      },
      yearly: {
        tithes: yearlyStats.find(s => s._id === 'tithe') || { amount: 0, count: 0 },
        offerings: yearlyStats.find(s => s._id === 'offering') || { amount: 0, count: 0 }
      },
      pendingCount,
      activeMembersCount
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error generating dashboard statistics' });
  }
});

module.exports = router;