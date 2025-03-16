const attempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Get credentials from environment variables
const CREDENTIALS = {
  username: process.env.REACT_APP_USERNAME,
  password: process.env.REACT_APP_PASSWORD
};

const checkRateLimit = (username) => {
  const now = Date.now();
  const userAttempts = attempts.get(username) || { count: 0, timestamp: now };
  
  if (now - userAttempts.timestamp > LOCKOUT_TIME) {
    attempts.delete(username);
    return { allowed: true };
  }
  
  if (userAttempts.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_TIME - (now - userAttempts.timestamp)) / 1000);
    return { 
      allowed: false, 
      message: `Too many attempts. Please try again in ${remainingTime} seconds.`
    };
  }
  
  userAttempts.count++;
  userAttempts.timestamp = now;
  attempts.set(username, userAttempts);
  return { allowed: true };
};

export const validateCredentials = async (username, password) => {
  try {
    // Check rate limiting first
    const rateLimitCheck = checkRateLimit(username);
    if (!rateLimitCheck.allowed) {
      throw new Error(rateLimitCheck.message);
    }

    // Compare with environment variables
    const isValid = 
      username === CREDENTIALS.username && 
      password === CREDENTIALS.password;
    
    // Reset attempts on successful login
    if (isValid) {
      attempts.delete(username);
    }

    return isValid;
  } catch (error) {
    throw error;
  }
}; 