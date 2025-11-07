const express = require('express');
const router = express.Router();
const Document = require('../models/document.model');
const User = require('../models/user.model'); // Make sure User model is imported
const { protect } = require('../middleware/auth.middleware'); 
const nodemailer = require('nodemailer'); // <-- 1. IMPORTED nodemailer

// Helper to check if user can access the document
const hasAccess = (document, userId) => {
    const userIdString = String(userId);
    return document.accessList.some(id => String(id) === userIdString);
};
// --- 2. REMOVED controller import ---
// const { 
//   createDocument, 
//   getDocument, 
//   shareDocument 
// } = require('../controllers/document.controller');

// --- GET /api/documents (List all rooms) ---
router.get('/', protect, async (req, res) => {
  try {
    const documents = await Document.find({ accessList: req.user._id }).sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents' });
  }
});
// --- 3. REMOVED stray /share route ---
// router.post('/share', authMiddleware, shareDocument); 

// --- POST /api/documents (Create new room) ---
router.post('/', protect, async (req, res) => { 
  const { name } = req.body;
  const ownerId = req.user._id;

  try {
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5); 

    const newDocument = await Document.create({
      _id: uniqueId, 
      name: name || 'Untitled Private Room',
      elements: [],
      accessList: [ownerId], 
    });
    
    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Error creating document:', error); 
    res.status(500).json({ message: 'Error creating document. Check server logs.' });
  }
});

// --- PUT /api/documents/:documentId/access (Grant Access by Email) ---
router.put('/:documentId/access', protect, async (req, res) => {
    const { documentId } = req.params;
    const { email } = req.body; 
    const ownerId = req.user._id;

    try {
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: 'User not found with that email address.' });
        }
        
        const document = await Document.findOne({ _id: documentId }).select('+accessList');
        
        // Use accessList[0] to check for owner
        if (!document || !document.accessList[0] || !document.accessList[0].equals(ownerId)) {
            return res.status(403).json({ message: 'Only the room owner can manage access.' });
        }

        const userToAddId = userToAdd._id;

        if (document.accessList.some(id => id.equals(userToAddId))) {
            return res.status(200).json({ message: 'User already has access to this room.' });
        }

        document.accessList.push(userToAddId);
        await document.save();

        res.status(200).json({ message: `${userToAdd.name} has been granted access.` });

    } catch (error) {
        console.error('Error granting access:', error);
        res.status(500).json({ message: 'Server error while granting access.' });
    }
});

// --- 4. NEW: POST /api/documents/share (Send Email Invite) ---
router.post('/share', protect, async (req, res) => {
  const { documentId, emailTo } = req.body;
  const senderUser = req.user; // Comes from 'protect' middleware

  if (!documentId || !emailTo) {
    return res.status(400).json({ message: 'Missing documentId or email' });
  }

  // 1. Configure Nodemailer Transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Create Email Content
  const joinLink = `http://localhost:3000/whiteboard/${documentId}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>You're invited to collaborate!</h2>
      <p><b>${senderUser.name}</b> (${senderUser.email}) has invited you to join a whiteboard.</p>
      
      <p>Click the link below to join the room:</p>
      <a 
        href="${joinLink}" 
        style="display: inline-block; padding: 12px 20px; background-color: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;"
      >
        Join Whiteboard
      </a>
      
      <p style="margin-top: 20px;">Or, copy and paste this Room Code into the "Join Room" option:</p>
      <p style="background-color: #f4f4f4; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 16px;">
        ${documentId}
      </p>
    </div>
  `;

  // 3. Send Email
  try {
    await transporter.sendMail({
      from: `"Your Whiteboard App" <${process.env.EMAIL_USER}>`,
      to: emailTo,
      subject: `You're invited to a whiteboard by ${senderUser.name}`,
      html: htmlContent,
    });

    res.status(200).json({ message: 'Invite sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Failed to send invite' });
  }
});


// --- GET /api/documents/:documentId (Check access and open editor) ---
router.get('/:documentId', protect, async (req, res) => {
  const { documentId } = req.params;

  try {
    const document = await Document.findOne({ _id: documentId }).select('+accessList');

    if (!document) {
      return res.status(404).json({ message: 'Document Not Found' });
    }

    if (!hasAccess(document, req.user._id)) {
        return res.status(403).json({ message: 'Access Denied to this private room' });
    }
    
    // NEW: Find the owner's name
    const ownerId = document.accessList[0];
    const owner = await User.findById(ownerId).select('name');

    // Success: Return all data needed for the editor
    res.json({
        _id: document._id,
        name: document.name,
        elements: document.elements,
        accessList: document.accessList, 
        ownerName: owner ? owner.name : 'Unknown Owner' // <-- SEND OWNER NAME
    });
    
  } catch (error) {
    console.error('CRITICAL JOIN ERROR:', error); 
    res.status(500).json({ message: 'Error loading document. Check server logs for details.' });
  }
});

module.exports = router;