import { Document } from 'mongoose';

export interface BlacklistYoutube extends Document {
  url: string;

  created: Date;
}