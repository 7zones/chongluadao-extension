import { Document } from 'mongoose';

export interface BlacklistLink extends Document {
  url: string;

  created: Date;
}