import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Feed} from '../feed/model';

// Update this if you add a property to the Flag type!
type FeedResponse = {
  _id: string;
  ownerId: string;
  tags: string[];
  users: string[];
};

/**
 * Transform a raw Feed object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Feed>} feed - A feed
 * @returns {FeedResponse} - The feed object formatted for the frontend
 */
const constructFeedResponse = (feed: HydratedDocument<Feed>): FeedResponse => {
  const feedCopy: Feed = {
    ...feed.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  console.log(feedCopy)

  return {
    ...feedCopy,
    _id: feedCopy._id.toString(),
    ownerId: feedCopy.ownerId.toString(),
    tags: feedCopy.tags.map(tag => tag.toString()),
    users: feedCopy.users.map(user => user.toString())
  };
};

export {
  constructFeedResponse
};