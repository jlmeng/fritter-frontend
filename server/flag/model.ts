import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a Flag
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Flag on the backend
export type Flag = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  freetId: Types.ObjectId;
  kind: string;
  source: string;
  challenges: number;
  challengeUsers: string[];
};

// Mongoose schema definition for interfacing with a MongoDB table
// Flags stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const FlagSchema = new Schema<Flag>({
  // The content of the flag
  kind: {
    type: String,
    required: true,
    default: 'Fact'
  },
  // The id of the associated freet
  freetId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Freet'
  },
  source: {
    type: String,
    required: true,
  },
  challenges: {
    type: Number,
    required: true,
    default: 0
  },
  challengeUsers: {
    type: [String],
    required: true,
    default: []
  }
});

const FlagModel = model<Flag>('Flag', FlagSchema);
export default FlagModel;