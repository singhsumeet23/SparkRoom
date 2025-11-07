const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/contactMessage.model');

// @route POST /api/contact
// @desc Save a new contact message
router.post('/', async (req, res) => {
  const { name, email, message, userId } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill out all fields.' });
  }

  try {
    const newMessage = new ContactMessage({
      name,
      email,
      message,
      user: userId || null, // Attach user ID if they were logged in
    });

    await newMessage.save();
    
    res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });

  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;