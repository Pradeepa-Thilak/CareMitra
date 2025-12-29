const Doctor = require('../models/Doctor');

// Premium plan configurations
const PREMIUM_PLANS = {
  basic: {
    name: 'Basic',
    amount: 2000,
    patientLimit: 5,
    features: ['Video Consultations', 'Chat Support', 'Basic Analytics']
  },
  standard: {
    name: 'Standard',
    amount: 3000,
    patientLimit: 8,
    features: ['All Basic features', 'Priority Support', 'Advanced Analytics']
  },
  premium: {
    name: 'Premium',
    amount: 4000,
    patientLimit: 12,
    features: ['All Standard features', 'Unlimited Storage', 'Custom Branding']
  },
  professional: {
    name: 'Professional',
    amount: 5000,
    patientLimit: 20,
    features: ['All Premium features', 'API Access', 'Dedicated Account Manager']
  }
};

// Get available premium plans
const getPremiumPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      data: PREMIUM_PLANS
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Select a premium plan (before payment)
const selectPremiumPlan = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { planType } = req.body;
    console.log(doctorId);
    console.log(planType);
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const plan = PREMIUM_PLANS[planType];
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Update doctor with selected plan
      doctor.premiumPlan = {
      amount: Number(plan.amount),
      patientLimit: Number(plan.patientLimit),
      isActive: false,       // stays false until payment & verification
      purchasedAt: null,
      expiresAt: null
    };


    await doctor.save();

    res.json({
      success: true,
      message: 'Premium plan selected. Please proceed to payment.',
      data: {
        doctorId: doctor._id,
        plan: plan,
        amount: plan.amount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPremiumPlans,
  selectPremiumPlan
};