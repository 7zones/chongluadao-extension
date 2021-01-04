import * as mongoose from 'mongoose';

export const RatingSchema = new mongoose.Schema({
  rating: {
    type: Number,
  },
  url: {
    type: String,
  },
  client: {
    type: String,
  },
  ip: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'rating' });
