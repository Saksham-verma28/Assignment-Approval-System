const crypto = require('crypto')

function generateSecureOTP() {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}


module.exports = {generateSecureOTP}
