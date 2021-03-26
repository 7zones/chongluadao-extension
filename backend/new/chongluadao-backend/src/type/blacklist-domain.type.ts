import { Document } from 'mongoose';

export interface BlacklistDomain extends Document {
  url: string;

  created: Date;
}