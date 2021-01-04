import { Document } from 'mongoose';

export interface WhitelistYoutube extends Document {
  url: string;

  created: Date;
}