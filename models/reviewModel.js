const mongoose = require('mongoose');
// review, rating, createdAt, reference to tour, ref to user

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'The review cannot be empty'],
      trim: true,
      minLength: [30, 'The review must be at least 30 characters long'],
      maxLength: [4000, "The review can't be longer than 4000 characters"],
    },
    rating: {
      type: Number,
      default: 3,
      min: [1, 'The rating must be between 1 and 5'],
      max: [5, 'The rating must be between 1 and 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
      },
    ],
    author: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Get the user and tour for the review
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
