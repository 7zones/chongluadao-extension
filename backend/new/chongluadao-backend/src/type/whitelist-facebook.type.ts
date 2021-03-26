import { Document } from 'mongoose';

export interface WhitelistFacebook extends Document {
  url: string;

  created: Date;
}