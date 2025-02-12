const mongoose = require('mongoose');
const Tour = require('./tourModel');
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
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
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

// Prevent users to write multiple reviews for the same tour
reviewSchema.index(
  {
    tour: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

// Get the user and tour for the review
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourID) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourID },
    },
    {
      $group: {
        _id: '$tour',
        nRating: {
          $sum: 1,
        },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function() {
  // 'this' points to current review

  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
