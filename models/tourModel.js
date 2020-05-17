const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name property'],
      unique: true,
      trim: true,
      maxLength: [50, 'The tour name must not be longer than 50 characters'],
      minLength: [10, 'The tour name must be at least 10 characters long'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration property'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize property'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty property'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be be either easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The rating must be between 1 and 5'],
      max: [5, 'The rating must be between 1 and 5'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'A tour must have a price property'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // eslint-disable-next-line prettier/prettier
        validator: function(val) {
          return val < this.price;
        },
        message: 'The price discount must be smaller than the original price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary property'],
      trim: true,
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
    startLocation: {
      // GeoJSON for geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
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

// eslint-disable-next-line prettier/prettier
tourSchema.virtual('durationInWeeks').get(function() {
  return this.duration / 7;
});

// Mongoose middleware - 'pre' hook - runs before the document is saved to the database (on .save() and . create() methods)
// eslint-disable-next-line prettier/prettier
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middleware
// eslint-disable-next-line prettier/prettier
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  next();
});

// Aggregation middleware
// eslint-disable-next-line prettier/prettier
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
