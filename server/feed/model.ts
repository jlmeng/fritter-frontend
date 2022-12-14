import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a Feed
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Feed on the backend
export type Feed = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  ownerId: Types.ObjectId;
  tags: Types.ObjectId[];
  users: Types.ObjectId[];
};

// Mongoose schema definition for interfacing with a MongoDB table
// Feeds stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const FeedSchema = new Schema<Feed>({
  // Add tags field to the schema
  ownerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  tags: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Tag'
  },
  // Add users field to the schema
  users: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'User'
  }
});

const FeedModel = model<Feed>('Feed', FeedSchema);
export default FeedModel;
