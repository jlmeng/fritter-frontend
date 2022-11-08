import type {HydratedDocument, Types} from 'mongoose';
import type {Feed} from './model';
import FeedModel from './model';
import FreetModel, { Freet } from '../freet/model';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';
import TagModel from '../tag/model';

/**
 * This files contains a class that has the functionality to explore feeds
 * stored in MongoDB, including adding, finding, updating, and deleting feeds.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Feed> is the output of the FeedModel() constructor,
 * and contains all the information in Feed. https://mongoosejs.com/docs/typescript.html
 */
class FeedCollection {
  /**
   * Add a feed to the collection
   * @param {string} ownerId - id of the user that owns the feed
   * @return {Promise<HydratedDocument<Feed>>} - The newly created feed
   */
  static async addOne(ownerId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {
    const feed = new FeedModel({
      ownerId,
      tags: [],
      users: []
    });
    await feed.save(); // Saves feed to MongoDB
    return feed;
  }

  /**
   * Find a feed by feedId
   *
   * @param {string} feedId - The id of the feed to find
   * @return {Promise<HydratedDocument<Feed>> | Promise<null> } - The feed with the given feedId, if any
   */
  static async findOne(feedId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {
    return FeedModel.findOne({_id: feedId});
  }

  /**
   * View feed with feedId
   * 
   * @param {string} feedId - The id of the feed to view
   * @return {Promise<HydratedDocument<Freet>[]> | Promise<null> } - The feed with the given feedId, if any
   */
   static async viewFeed(feedId: Types.ObjectId | string): Promise<Array<HydratedDocument<Freet>>> {
    const feed = await FeedModel.findOne({_id: feedId});
    const tags = feed.tags;
    const users = feed.users;
    console.log(tags);
    console.log(users);
    if (users.length === 0 && tags.length === 0) {
        console.log('1');
        return FreetCollection.findAll();
    }
    if (tags.length === 0) {
        console.log('2');

        return FreetModel.find({'authorId': {$in: users}}).sort({dateModified: -1}).populate('authorId');
    }
    if (users.length === 0) {
        console.log('3');

        return FreetModel.find({'tags': {$in: tags}}).sort({dateModified: -1}).populate('authorId');
    }
    console.log('4');

    return FreetModel.find({'authorId': {$in: users}, 'tags': {$in: tags}}).sort({dateModified: -1}).populate('authorId');
   }
  
  /**
   * Get all the feeds in the database
   *
   * @return {Promise<HydratedDocument<Feed>[]>} - An array of all of the feeds
   */
  static async findAll(): Promise<Array<HydratedDocument<Feed>>> {
    // Retrieves feeds
    return FeedModel.find({});
  }

  /**
   * Add a tag to the feed filter
   *
   * @param {string} feedId - The id of the feed to edit
   * @param {string} tagContent - The content of the tag to add
   * @return {Promise<HydratedDocument<Feed>>} - The newly updated feed
   */
  static async addTagToFeed(feedId: Types.ObjectId | string, tagContent: string): Promise<HydratedDocument<Feed>> {
    const tag = await TagModel.findOne({content: tagContent});
    const feed = await FeedCollection.findOne(feedId);
    feed.tags.push(tag._id);
    await feed.save();
    return feed;
  }

   /**
   * Add a user to the feed filter
   *
   * @param {string} feedId - The id of the feed to edit
   * @param {string} username - The username of the user to add
   * @return {Promise<HydratedDocument<Feed>>} - The newly updated feed
   */
    static async addUserToFeed(feedId: Types.ObjectId | string, username: string): Promise<HydratedDocument<Feed>> {
        const user = await UserCollection.findOneByUsername(username);
        const feed = await FeedCollection.findOne(feedId);
        feed.users.push(user._id);
        await feed.save();
        return feed;
    }

  /**
   * Remove a tag from the feed filter
   *
   * @param {string} feedId - The id of the feed to edit
   * @param {string} tagContent - The content of the tag to remove
   * @return {Promise<HydratedDocument<Feed>>} - The newly updated feed
   */
  static async removeTagFromFeed(feedId: Types.ObjectId | string, tagContent: string): Promise<HydratedDocument<Feed>> {
    const tag = await TagModel.findOne({content: tagContent});
    const feed = await FeedCollection.findOne(feedId);

    const tagInd = feed.tags.indexOf(tag._id);
    feed.tags.splice(tagInd, 1);

    await feed.save();
    return feed;
  }

  /**
   * Remove a user from the feed filter
   *
   * @param {string} feedId - The id of the feed to edit
   * @param {string} username - The username of the user to remove
   * @return {Promise<HydratedDocument<Feed>>} - The newly updated feed
   */
   static async removeUserFromFeed(feedId: Types.ObjectId | string, username: string): Promise<HydratedDocument<Feed>> {
    const user = await UserCollection.findOneByUsername(username);
    const feed = await FeedCollection.findOne(feedId);

    const userInd = feed.users.indexOf(user._id);
    feed.users.splice(userInd, 1);

    await feed.save();
    return feed;
  }

  /**
   * Delete a feed with given feedId.
   *
   * @param {string} feedId - The feedId of feed to delete
   * @return {Promise<Boolean>} - true if the feed has been deleted, false otherwise
   */
  static async deleteOne(feedId: Types.ObjectId | string): Promise<boolean> {
    const feed = await FeedModel.deleteOne({_id: feedId});
    return feed !== null;
  }

}

export default FeedCollection;
