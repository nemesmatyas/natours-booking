const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide a name'] },
  email: {
    type: String,
    required: [true, 'Please provide a valid email address'],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'Please provide a valid email address'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: { type: String, required: true, minlength: 8, select: false },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      // eslint-disable-next-line prettier/prettier
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password and confirm password must match',
    },
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Password hashing
// eslint-disable-next-line prettier/prettier
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // Don't store passwordConfirm in the database. Just needed for validation

  next();
});

// Used to filter out inactive users when returning list of users
userSchema.pre(/^find/, function(next) {
  // 'this' keyword points to the current query
  this.find({ active: { $ne: false } });
  next();
});

/**
 * Check if the password given by the user is the same as the one stored in the document
 * This is an instance method - a method that is available on all documents of a certain collection
 * this keyword points to the current document (user object)
 * @param candidatePassword - the password currently given by the user
 * @param userPassword - the correct password for a certain user (expected password)
 * @return { Boolean } - true or false whether the passwords match or not
 */
// eslint-disable-next-line prettier/prettier
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Check if the user changed password after the token was issued
 * Adds another layer of security
 * @param jwtTimestamp - time when the JWT was issued
 * @return { Boolean } - whether or not the user has changed password after token issue
 */
// eslint-disable-next-line prettier/prettier
userSchema.methods.changedPasswordAfterTokenIssue = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedAtTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTimestamp < changedAtTimestamp;
  }

  // If user didn't change password
  return false;
};

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000; // Ensure that the token is always created after modifying the passwordChangedAt property (so the user will be able to login)
  next();
});

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // eslint-disable-next-line prettier/prettier
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Modify the first number to set the password expiration time in minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
