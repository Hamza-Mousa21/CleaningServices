const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePhone = (phone) => {
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
};

const validatePassword = (password) => {
  return password.length >= 6;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword
};