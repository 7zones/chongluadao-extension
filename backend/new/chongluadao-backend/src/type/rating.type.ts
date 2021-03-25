import { Document } from 'mongoose';

export interface Rating extends Document {
  time: Date;

  url: string;

  rating: number;

  client: string;

  ip: string;
}
