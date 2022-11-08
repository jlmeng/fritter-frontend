import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FeedCollection from './collection';
import * as userValidator from '../user/middleware';
import * as feedValidator from '../feed/middleware';
import * as tagValidator from '../tag/middleware';
import * as util from './util';
import * as freetUtil from '../freet/util'

const router = express.Router();

/**
 * Get all the feeds
 *
 * @name GET /api/feeds
 *
 * @return {FeedResponse[]} - A list of all the feeds
 */

router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    const allFeeds = await FeedCollection.findAll();
    const response = allFeeds.map(util.constructFeedResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new feed.
 *
 * @name POST /api/feeds
 *
 * @return {FeedResponse} - The created feed
 * @throws {403} - If the user is not logged in
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const feed = await FeedCollection.addOne(userId);

    res.status(201).json({
      message: 'Your feed was created successfully.',
      feed: util.constructFeedResponse(feed)
    });
  }
);

/**
 * View a feed with feedId
 * 
 * @name GET /api/feeds/:feedId?
 * 
 * @return {FeedResponse} - The feed with id FeedId
 * @throws {403} - If user is not logged in or is not owner of feed
 * @throws {404} - If the feedId is not valid
 */
 router.get(
    '/:feedId?',
    [
        userValidator.isUserLoggedIn,
        feedValidator.isFeedExists,
        feedValidator.isFeedOwner,
    ],
    async (req: Request, res: Response, next: NextFunction) => {
      const freets = await FeedCollection.viewFeed(req.params.feedId);
      console.log(freets);
      const response = freets.map(freetUtil.constructFreetResponse);
      res.status(200).json(response);
    }
  );


/**
 * Delete a feed
 *
 * @name DELETE /api/feeds/:feedId?
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the owner of the freet
 * @throws {404} - If the feedId is not valid
 */
router.delete(
  '/:feedId?',
  [
    userValidator.isUserLoggedIn,
    feedValidator.isFeedExists,
    feedValidator.isFeedOwner,
  ],
  async (req: Request, res: Response) => {
    await FeedCollection.deleteOne(req.params.feedId);
    res.status(200).json({
      message: 'Your feed was deleted successfully.'
    });
  }
);

/**
 * Add a tag to a feed.
 * 
 * @name PUT /api/feeds/addtag/:feedId?
 * 
 * @param {string} feedId - The ID of feed to add tag to
 * @param {string} tag - The content of the tag
 * 
 * @return {string} A success message
 * 
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the feed
 * @throws {404} - If the feedId is not valid
 * @throws {400} - If the tag content is empty or a stream of empty spaces
 * @throws {413} - If the tag content is more than 20 characters long
 * @throws {404} - If the tag does not exist
 * @throws {412} - If the tag already exists on the feed
 */
 router.put(
    '/addtag/:feedId?',
    [
        userValidator.isUserLoggedIn,
        feedValidator.isFeedExists,
        feedValidator.isFeedOwner,
        tagValidator.isValidTagContent,
        tagValidator.isTagExists,
        feedValidator.isTagAlreadyExistsOnFeed

    ],
    async (req: Request, res: Response) => {
      const tag = await FeedCollection.addTagToFeed(req.params.feedId, req.body.tag);
      res.status(200).json({
        message: 'Your tag was added successfully.',
      });
    }
  );

/**
 * Remove a tag from a feed.
 * 
 * @name PUT /api/feeds/removetag/:feedId?
 * @return {string} A success message
 * 
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the feed
 * @throws {404} - If the feedId is not valid
 * @throws {400} - If the tag content is empty or a stream of empty spaces
 * @throws {413} - If the tag content is more than 20 characters long
 * @throws {404} - If the tag does not exist
 * @throws {412} - If the tag does not exist on the feed
 */
 router.put(
    '/removetag/:feedId?',
    [
        userValidator.isUserLoggedIn,
        feedValidator.isFeedExists,
        feedValidator.isFeedOwner,
        tagValidator.isValidTagContent,
        tagValidator.isTagExists,
        feedValidator.isTagExistsOnFeed
    ],
    async (req: Request, res: Response) => {
      const tag = await FeedCollection.removeTagFromFeed(req.params.feedId, req.body.tag);
  
      res.status(201).json({
        message: 'Your tag was removed successfully.',
      });
    }
  );

/**
 * Add a user to a feed.
 * 
 * @name PUT /api/feeds/adduser/:feedId?
 * 
 * @param {string} feedId - The ID of feed to add user to
 * @param {string} username - The username
 * 
 * @return {string} A success message
 * 
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the feed
 * @throws {404} - If the feedId is not valid
 * @throws {404} - If the user does not exist
 * @throws {412} - If the user already exists on the feed
 */
 router.put(
    '/adduser/:feedId?',
    [
        // userValidator.isUserLoggedIn,
        // feedValidator.isFeedExists,
        // feedValidator.isFeedOwner,
        // feedValidator.isUserExists,
        // feedValidator.isUserAlreadyExistsOnFeed
    ],
    async (req: Request, res: Response) => {
      const user = await FeedCollection.addUserToFeed(req.params.feedId, req.body.username);
      res.status(200).json({
        message: 'Your user was added successfully.',
      });
    }
  );

/**
 * Remove a user from a feed.
 * 
 * @name PUT /api/feeds/removeuser/:feedId?
 * 
 * @param {string} feedId - The ID of feed to add user to
 * @param {string} username - The username
 * 
 * @return {string} A success message
 * 
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the feed
 * @throws {404} - If the feedId is not valid
 * @throws {404} - If the user does not exist
 * @throws {412} - If the user does not exist on the feed
 */
 router.put(
    '/removeuser/:feedId?',
    [
        userValidator.isUserLoggedIn,
        feedValidator.isFeedExists,
        feedValidator.isFeedOwner,
        feedValidator.isUserExists,
        feedValidator.isUserExistsOnFeed
    ],
    async (req: Request, res: Response) => {
      const user = await FeedCollection.removeUserFromFeed(req.params.feedId, req.body.username);
  
      res.status(201).json({
        message: 'Your user was removed successfully.',
      });
    }
  );

export {router as feedRouter};
