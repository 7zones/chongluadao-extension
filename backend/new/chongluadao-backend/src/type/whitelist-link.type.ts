import { Document } from 'mongoose';

export interface WhitelistLink extends Document {
  url: string;

  created: Date;
}