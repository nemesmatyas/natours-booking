const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name property'],
    unique: true,
  },
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
  },
  ratingsAverage: { type: Number, default: 4.5 },
  ratingsQuantity: { type: Number, default: 0 },
  price: {
    type: Number,
    required: [true, 'A tour must have a price property'],
  },
  priceDiscount: { type: Number },
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
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
