const otpGenerator = require("otp-generator");
const OTP_CONFIG = {
  upperCaseAlphabets: false,
  specialChars: false,
};
module.exports.generateOTP = () => {
  const OTP = otpGenerator.generate(6, OTP_CONFIG);
  return OTP;
};
