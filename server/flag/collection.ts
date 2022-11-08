import type {HydratedDocument, Types} from 'mongoose';
import type {Flag} from './model';
import FlagModel from './model';
import FreetModel, { Freet } from '../freet/model';
import FreetCollection from '../freet/collection';

/**
 * This files contains a class that has the functionality to explore flags
 * stored in MongoDB, including adding, finding, updating, and deleting flags.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Flag> is the output of the FlagModel() constructor,
 * and contains all the information in Flag. https://mongoosejs.com/docs/typescript.html
 */
class FlagCollection {
  /**
   * Add a flag to the collection
   *
   * @param {string} content - The content of the flag
   * @return {Promise<HydratedDocument<Flag>>} - The newly created flag
   */
  static async addOne(freetId: Types.ObjectId | string, kind: string, source: string): Promise<HydratedDocument<Flag>> {
    const flag = new FlagModel({
      freetId,
      kind,
      source,
      challenges: 0,
      challengeUsers: []
    });
    console.log(flag)
    await flag.save(); // Saves flag to MongoDB
    return flag;
  }

  /**
   * Find a flag by flagId
   *
   * @param {string} flagId - The id of the tag to find
   * @return {Promise<HydratedDocument<Flag>> | Promise<null> } - The flag with the given flagId, if any
   */
  static async findOne(flagId: Types.ObjectId | string): Promise<HydratedDocument<Flag>> {
    return FlagModel.findOne({_id: flagId});
  }

  /**
   * Get all the flags in the database
   *
   * @return {Promise<HydratedDocument<Tag>[]>} - An array of all of the tags
   */
  static async findAll(): Promise<Array<HydratedDocument<Flag>>> {
    // Retrieves tags and sorts them from most to least recent
    return FlagModel.find({});
  }

  /**
   * Get all the flags for a given freet
   *
   * @param {string} freetId - The ID of the freet
   * @return {Promise<HydratedDocument<Tag>[]>} - An array of all of the tags
   */
  static async findAllByFreet(freetId: string): Promise<Array<HydratedDocument<Flag>>> {
    const freet = await FreetCollection.findOne(freetId);
    return FreetModel.find({flags: freet.flags});
  }

  /**
   * Create a flag for a freet
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} flagId - The id of the flag to be added
   * @return {Promise<HydratedDocument<Flag>>} - The flag
   */
  static async createFlag(freetId: Types.ObjectId | string, source: string): Promise<HydratedDocument<Flag>> {
    const freet = await FreetModel.findOne({_id: freetId});
    const flag = await FlagCollection.addOne(freetId, 'Fact', source);

    freet.flags.push(flag._id);

    await freet.save();
    await flag.save();

    return flag;
  }

  /**
   * Challenge a flag
   * 
   * @param {string} flagId - The id of the flag to challenge
   * @param {string} userId - The user of the current session
   * @return {Promise<HydratedDocument<Flag>>} - the updated number of challenges
   */
   static async challengeFlag(flagId: Types.ObjectId | string, userId: string): Promise<HydratedDocument<Flag>> {
    const flag = await FlagCollection.findOne(flagId);

    flag.challenges += 1;
    flag.challengeUsers.push(userId);
    await flag.save();

    if (flag.challenges >= 11) {
        await FlagCollection.deleteFlag(flagId)
    }

    return flag;
  }

  /**
   * Delete a flag
   *
   * @param {string} flagId - The id of the flag to be removed
   * @return {Promise<Boolean>} - true if the flag has been deleted, false otherwise
   */
  static async deleteFlag(flagId: Types.ObjectId | string): Promise<boolean> {
    const flag = await FlagCollection.findOne(flagId);
    const freet = await FreetModel.findOne({_id: flag.freetId});
    console.log(freet)
    console.log('flag')
    console.log(flag)
    if (freet !== null && flag !== null) {
        
        const flagInd = freet.flags.indexOf(flag._id);
        freet.flags.splice(flagInd, 1);

        await FlagModel.findByIdAndDelete(flag._id);

        await freet.save();
        // await flag.save();

        return true;
    }
    return false;
  }

}

export default FlagCollection;