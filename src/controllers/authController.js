const bcrypt = require('bcrypt');
const { findUserByEmail, createUser } = require('../models/userModel');
const logger = require('../utils/logger');

async function register(req, res) {
  const { email, password, first_name, last_name } = req.body;
  
  console.log("register");

  // Validation
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({
      message: 'Email, password, first name and last name are required'
    });
  }
	
  try {
    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
	
	// Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await createUser(email, hashedPassword, first_name, last_name);

    res.status(201).json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
  } catch (err) {
    logger.error('Registration error', {
	  message: err.message,
	  stack: err.stack,
	  email
	});
    res.status(500).json({ message: 'Internal server error' });
  }
}

const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });
  
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: user.role, email: user.email });
  } catch (err) {
    logger.error('Registration error', {
	  message: err.message,
	  stack: err.stack,
	  email
	});
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { register, login };