const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../jwt'); // Use our JWT utility
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Register request:', { name, email });

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields required' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token using our utility
    const token = generateToken(user._id.toString());

    console.log('✅ Registration successful');
    console.log('Token generated:', token.substring(0, 50) + '...');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login request for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token using our utility
    const token = generateToken(user._id.toString());

    console.log('✅ Login successful');
    console.log('Token generated:', token.substring(0, 50) + '...');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;