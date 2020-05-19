const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourAndUserIds = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  // Same thing with the user
  if (!req.body.author) {
    req.body.author = req.user.id;
  }
  next();
};

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
