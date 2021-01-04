import { Document } from 'mongoose';

export interface BlacklistFacebook extends Document {
  url: string;

  created: Date;
}