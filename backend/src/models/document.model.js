const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    // CRITICAL FIX: We set _id type to String to use readable IDs (like 'hackathon-test-doc')
    _id: { 
      type: String,
      required: true,
    },
    
    name: {
      type: String,
      required: true,
      default: 'Untitled Document',
    },
    accessList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    elements: [Object],
  },
  { 
    timestamps: true,
    _id: false // Tell Mongoose we are managing the _id, don't auto-create one
  }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;