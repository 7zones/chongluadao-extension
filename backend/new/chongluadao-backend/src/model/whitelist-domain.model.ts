import * as mongoose from 'mongoose';

export const WhitelistDomainSchema = new mongoose.Schema({
  url: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});
