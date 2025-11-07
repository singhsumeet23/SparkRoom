const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { 
    type: String,
    required: true,
    select: false, // Prevents password from being returned in standard queries
  },
  avatarUrl: {
    type: String,
    default: '',
  },
});

// Middleware: Hash the password before saving (on register/update)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: Compare the input password with the hashed password on login
userSchema.methods.matchPassword = async function (enteredPassword) {
  // CRITICAL: We need to re-fetch the user WITH the password property (since select: false)
  // We use this.model() to access the model without circular dependency issues.
  const userWithPassword = await this.model('User').findById(this._id).select('+password'); 
  
  if (!userWithPassword) return false;
  
  return await bcrypt.compare(enteredPassword, userWithPassword.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;