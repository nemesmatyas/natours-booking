const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Send a JSON Web Token to the newly created user
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and passwords exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists & password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Log the user in & send JWT to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

/**
 * Protect the get all tours route
 * Only logged in users with a valid JSON Web Token can get a list of available tours
 */
exports.protect = catchAsync(async (req, res, next) => {
  // Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please log in to access this resource.', 401));
  }

  // Token verification
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check if user still exists
  const freshUser = await User.findById(decodedToken.id);

  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }

  // Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfterTokenIssue(decodedToken.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again', 401)
    );
  }

  req.user = freshUser;
  next();
});
