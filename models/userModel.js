const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
  passwordChangedAt: Date,
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

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
