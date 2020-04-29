class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr }; // Shallow copy of the query object

    // Exclude Mongoose specific filter fields
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering - less than, greater than
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Build query in order to be able to implement filtering
    this.query = this.query.find(JSON.parse(queryStr));
    //let query = Tour.find(JSON.parse(queryStr));

    return this; // Return the entire object
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' '); // Transform the list of fields to sort by (they are separated by commas in the query, but Mongoose can handle them if they are separated by spaces)
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Default sorting: the newest tours are displayed first in the list
    }

    return this; // Return the entire object
  }

  limitFields() {
    // Field limiting - display only the fields requested by the user
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // Always remove the __v fields from the returned query, because it is only used by Mongoose internally and not relevant to user
    }

    return this;
  }

  paginate() {
    // Pagination
    const page = this.queryStr.page * 1 || 1; // Convert the page value to number, or set the default page to 1
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit; // The results that are actually not shown when we request a page
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
