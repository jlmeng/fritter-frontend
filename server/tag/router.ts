import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import TagCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as tagValidator from '../tag/middleware';
import * as util from './util';
import * as freetUtil from '../freet/util'

const router = express.Router();

/**
 * Get all the tags
 *
 * @name GET /api/tags
 *
 * @return {TagResponse[]} - A list of all the tags sorted in alphabetical order by content
 */
 router.get(
    '/',
    async (req: Request, res: Response) => {

      const allTags = await TagCollection.findAll();
      const response = allTags.map(util.constructTagResponse);
      res.status(200).json(response);
    },
  );

/**
 * Get all the freets for a tag.
 * 
 * @name GET /api/tags/:tag
 * 
 * @return {FreetResponse[]} - A list of all the freets of freets with the given tag
 * 
 * @throws {400} - If the tag content is empty or a stream of empty spaces
 * @throws {413} - If the tag content is more than 20 characters long
 * @throws {404} - If a tag of that value does not exist
 */

router.get(
  '/:tag?',
  [
    tagValidator.isValidTagContentParams,
    tagValidator.isTagParamsExists
  ],
  async (req: Request, res: Response) => {
    console.log("routed")
    const allFreets = await TagCollection.getTagFreets(req.params.tag);
    const response = allFreets.map(freetUtil.constructFreetResponse);
    res.status(200).json(response);
  },
)

/**
 * Create a new tag.
 *
 * @name POST /api/tags
 *
 * @param {string} tag - The content of the tag
 * @return {TagResponse} - The created tag
 * @throws {400} - If the tag content is empty or a stream of empty spaces
 * @throws {413} - If the tag content is more than 20 characters long
 * @throws {412} - If the tag already exists
 * 
 */
router.post(
  '/',
  [
    tagValidator.isValidTagContent,
    tagValidator.isTagAlreadyExists,  
  ],
  async (req: Request, res: Response) => {
    const tag = await TagCollection.addOne(req.body.tag);

    res.status(201).json({
      message: 'Your tag was created successfully.',
      tag: util.constructTagResponse(tag)
    });
  }
);

/**
 * Add a tag to a freet.
 * 
 * @name PUT /api/tags/add/:freetId?
 * 
 * @param {string} freetId - The ID of freet to add tag to
 * @param {string} tag - The content of the tag
 * 
 * @return {string} A success message
 * 
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid
 * @throws {400} - If the tag content is empty or a stream of empty spaces
 * @throws {413} - If the tag content is more than 20 characters long
 * @throws {404} - If the tag does not exist
 * @throws {412} - If the tag already exists on the freet
 */
 router.put(
    '/add/:freetId?',
    [
      userValidator.isUserLoggedIn,
      freetValidator.isFreetExists,
      freetValidator.isValidFreetModifier,
      tagValidator.isValidTagContent,
      tagValidator.isTagExists,
      tagValidator.isTagAlreadyExistsOnFreet
    ],
    
    async (req: Request, res: Response) => {
      const tag = await TagCollection.addTag(req.params.freetId, req.body.tag);
      
      res.status(200).json({
        message: 'Your tag was added successfully.',
      });
    }
  );


/**
 * Remove a tag from a freet.
 * 
 * @name PUT /api/tags/remove/:freetId?
 * @return {string} A success message
 * 
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid
 * @throws {400} - If the tag content is empty or a stream of empty spaces
 * @throws {413} - If the tag content is more than 20 characters long
 * @throws {404} - If the tag does not exist
 * @throws {412} - If the tag does not exist on the freet
 */
 router.put(
    '/remove/:freetId?',
    [
      userValidator.isUserLoggedIn,
      freetValidator.isFreetExists,
      freetValidator.isValidFreetModifier,
      tagValidator.isValidTagContent,
      tagValidator.isTagExists,
      tagValidator.isTagExistsOnFreet
    ],
    async (req: Request, res: Response) => {
      console.log("validated")
      const tag = await TagCollection.removeTag(req.params.freetId, req.body.tag);
  
      res.status(201).json({
        message: 'Your tag was removed successfully.',
      });
    }
  );

export {router as tagRouter};