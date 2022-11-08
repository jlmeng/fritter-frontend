import type {HydratedDocument, Types} from 'mongoose';
import type {Tag} from './model';
import TagModel from './model';
import FreetModel, { Freet } from '../freet/model';
import FreetCollection from '../freet/collection';

/**
 * This files contains a class that has the functionality to explore tags
 * stored in MongoDB, including adding, finding, updating, and deleting tags.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Tag> is the output of the TagModel() constructor,
 * and contains all the information in Tag. https://mongoosejs.com/docs/typescript.html
 */
class TagCollection {
  /**
   * Add a tag to the collection
   *
   * @param {string} content - The content of the tag
   * @return {Promise<HydratedDocument<Tag>>} - The newly created tag
   */
  static async addOne(content: string): Promise<HydratedDocument<Tag>> {
    const tag = new TagModel({
      content,
      tagged: []
    });
    await tag.save(); // Saves tag to MongoDB
    return tag;
  }

  /**
   * Find a tag by tagId
   *
   * @param {string} tagId - The id of the tag to find
   * @return {Promise<HydratedDocument<Tag>> | Promise<null> } - The tag with the given tagId, if any
   */
  static async findOne(tagId: Types.ObjectId | string): Promise<HydratedDocument<Tag>> {
    return TagModel.findOne({_id: tagId});
  }

   /**
   * Find a tag by content
   *
   * @param {string} tagContent - The content of the tag to find
   * @return {Promise<HydratedDocument<Tag>> | Promise<null> } - The tag with the given tagId, if any
   */
    static async findByContent(tagContent: string): Promise<HydratedDocument<Tag>> {
        return TagModel.findOne({content: tagContent});
      }

  /**
   * Get all the tags in the database
   *
   * @return {Promise<HydratedDocument<Tag>[]>} - An array of all of the tags
   */
  static async findAll(): Promise<Array<HydratedDocument<Tag>>> {
    // Retrieves tags and sorts them alphabetically
    return TagModel.find({}).sort({content: 1});
  }

  /**
   * Get all the tags for a given freet
   *
   * @param {string} freetId - The ID of the freet
   * @return {Promise<HydratedDocument<Tag>[]>} - An array of all of the tags
   */
  static async findAllByFreet(freetId: string): Promise<Array<HydratedDocument<Tag>>> {
    const freet = await FreetCollection.findOne(freetId);
    return FreetModel.find({tags: freet.tags});
  }

  /**
   * Get all the freets for a given tag
   * 
   * @param {string} tagContent - The content of the tag
   * @return {Promise<HydratedDocument<Freet>> | Promise<null>} - the freets for the given tag, if any
   */

  static async getTagFreets(tagContent: string): Promise<Array<HydratedDocument<Freet>>> {
    const tag = await TagModel.findOne({content: tagContent});
    const freetIds = tag.tagged;
    return FreetModel.find({'_id': {$in: freetIds}});
  } 
    

  /**
   * Add a tag to a freet
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} tagContent - The content of the tag to be added
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async addTag(freetId: Types.ObjectId | string, tagContent: string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    const tag = await TagCollection.findByContent(tagContent);
    if (tag !== null) {
        freet.tags.push(tag._id);
        tag.tagged.push(freet._id);

        await freet.save();
        await tag.save();
    }
    return freet;
  }

  /**
   * Remove a tag from a freet
   *
   * @param {string} freetId - The freetId of freet to delete
   * @param {string} tagContent - The content of the tag to be removed
   * @return {Promise<Boolean>} - true if the tag has been deleted, false otherwise
   */
  static async removeTag(freetId: Types.ObjectId | string, tagContent: string): Promise<boolean> {
    const freet = await FreetModel.findOne({_id: freetId});
    // console.log("freet", freet)
    const tag = await TagCollection.findByContent(tagContent);
    // console.log("tag", tag)

    if (freet !== null && tag !== null) {
        
        const tagInd = freet.tags.indexOf(tag._id);
        const freetInd = tag.tagged.indexOf(freet._id);
        
        freet.tags.splice(tagInd, 1);
        tag.tagged.splice(freetInd, 1);

        await freet.save();
        await tag.save();

        return true;
    }

    return false;
  }

}

export default TagCollection;