import * as mongoose from 'mongoose';

export const BlacklistLinkSchema = new mongoose.Schema({
  url: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});
