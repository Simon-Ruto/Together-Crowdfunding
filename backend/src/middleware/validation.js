/**
 * Simple input validation utilities for Together API
 * Does not require external dependencies (no joi, no express-validator)
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 6 characters, no requirements for complexity (you can add more later)
  return password && password.length >= 6;
};

const validateUsername = (username) => {
  // At least 2 characters, alphanumeric + underscore
  return username && username.length >= 2 && /^[a-zA-Z0-9_]+$/.test(username);
};

const validateRegisterInput = (data) => {
  const errors = [];

  if (!data.username) errors.push('Username is required');
  else if (!validateUsername(data.username)) errors.push('Username must be at least 2 characters (alphanumeric, underscore)');

  if (!data.email) errors.push('Email is required');
  else if (!validateEmail(data.email)) errors.push('Invalid email format');

  if (!data.password) errors.push('Password is required');
  else if (!validatePassword(data.password)) errors.push('Password must be at least 6 characters');

  return { valid: errors.length === 0, errors };
};

const validateLoginInput = (data) => {
  const errors = [];

  if (!data.email) errors.push('Email is required');
  else if (!validateEmail(data.email)) errors.push('Invalid email format');

  if (!data.password) errors.push('Password is required');

  return { valid: errors.length === 0, errors };
};

const validateProjectInput = (data) => {
  const errors = [];

  if (!data.title) errors.push('Project title is required');
  else if (data.title.length < 3) errors.push('Title must be at least 3 characters');

  if (!data.description) errors.push('Project description is required');
  else if (data.description.length < 10) errors.push('Description must be at least 10 characters');

  if (!data.goal) errors.push('Funding goal is required');
  else if (typeof data.goal !== 'number' || data.goal <= 0) errors.push('Goal must be a positive number');

  if (data.deadline && isNaN(new Date(data.deadline).getTime())) {
    errors.push('Invalid deadline format');
  }

  return { valid: errors.length === 0, errors };
};

const validatePaymentInput = (data) => {
  const errors = [];

  if (!data.projectId) errors.push('Project ID is required');
  if (!data.amount) errors.push('Amount is required');
  else if (typeof data.amount !== 'number' || data.amount <= 0) errors.push('Amount must be a positive number');

  return { valid: errors.length === 0, errors };
};

/**
 * Middleware to validate input and return consistent error format
 * Usage: app.use(validateInputMiddleware)
 */
const validateInputMiddleware = (req, res, next) => {
  // Attach validation functions to request object
  req.validate = {
    register: validateRegisterInput,
    login: validateLoginInput,
    project: validateProjectInput,
    payment: validatePaymentInput
  };
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateRegisterInput,
  validateLoginInput,
  validateProjectInput,
  validatePaymentInput,
  validateInputMiddleware
};
