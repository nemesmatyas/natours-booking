const Tour = require('../models/tourModel');

/************************************************* ALIAS ROUTES ********************************************************/
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

/************************************************* ROUTE HANDLERS ********************************************************/
exports.getAllTours = async (req, res) => {
  try {
    const queryObj = { ...req.query }; // Shallow copy of the query object

    // Exclude Mongoose specific filter fields
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering - less than, greater than
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Build query in order to be able to implement filtering
    let query = Tour.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' '); // Transform the list of fields to sort by (they are separated by commas in the query, but Mongoose can handle them if they are separated by spaces)
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sorting: the newest tours are displayed first in the list
    }

    // Field limiting - display only the fields requested by the user
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); // Always remove the __v fields from the returned query, because it is only used by Mongoose internally and not relevant to user
    }

    // Pagination
    const page = req.query.page * 1 || 1; // Convert the page value to number, or set the default page to 1
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit; // The results that are actually not shown when we request a page
    query = query.skip(skip).limit(limit);

    // Check if the number of skipped documents is bigger than the number of existing documents
    if (req.query.page) {
      const numOfTours = await Tour.countDocuments();
      if (skip >= numOfTours) {
        throw new Error('This page does not exist');
      }
    }

    // Run query
    const tours = await query;

    return res.status(200).json({
      status: 'success',
      numberOfResults: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    return res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: "The required tour ID doesn't exist",
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
