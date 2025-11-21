const admin = (req, res, next) => {
  try {
    // Check if user exists and has admin role
    // Adjust this based on your user model structure
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    // Adjust field name based on your user model (could be role, isAdmin, userType, etc.)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    if(req.user.role === 'admin'){
      console.log("Hi janaki raman....");
      
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in admin verification'
    });
  }
};

module.exports = admin;