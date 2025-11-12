// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Set OTP expiration (5 minutes from now)
const setOTPExpiration = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

module.exports = {
  generateOTP,
  setOTPExpiration
};