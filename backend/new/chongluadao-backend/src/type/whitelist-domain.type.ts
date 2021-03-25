import { Document } from 'mongoose';

export interface WhitelistDomain extends Document {
  url: string;

  created: Date;
}