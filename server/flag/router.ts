import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FlagCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as flagValidator from '../flag/middleware';
import * as util from './util';
import * as flagUtil from '../flag/util'
import FreetCollection from '../freet/collection';
import FlagModel from './model';

const router = express.Router();

/**
 * Get all the flags
 *
 * @name GET /api/flags
 *
 * @return {FlagResponse[]} - A list of all the flags
 */
 router.get(
    '/',
    async (req: Request, res: Response) => {
      console.log(req)
      const allFlags = await FlagCollection.findAll();
      const response = allFlags.map(util.constructFlagResponse);
      console.log(response)
      res.status(200).json(response);
    },
  );

/**
 * Get all the flags for a freet.
 * 
 * @name GET /api/flags/:freetId
 * 
 * @return {FlagResponse[]} - A list of all the flags on a freet
 * 
 * @throws {404} - If a freet with that id doesn't exist
 */

router.get(
  '/:freetId?',
  [
    freetValidator.isFreetExists
  ],
  async (req: Request, res: Response) => {
    const freet = await FreetCollection.findOne(req.params.freetId);
    const flagIds = freet.flags;
    const flags = await FlagModel.find({'_id': {$in: flagIds}});
    const response = flags.map(util.constructFlagResponse);
    res.status(200).json(response);
  },
)

/**
 * Create a flag
 *
 * @name POST /api/flags
 *
 * @param {string} freetId - The id of the freet to add the flag to
 * @param {string} source - the cited source for the flag
 * @return {FlagResponse} - The created flag
 * 
 * @throws {403} - If the user is not logged in or does not have permission to modify the freet
 * @throws {400} - If the flag source is empty or a stream of empty spaces
 * @throws {413} - If the flag source is more than 100 characters long
 * @throws {412} - If the freet already has a flag of the same kind
 * 
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    // freetValidator.isValidFreetModifier,
    // flagValidator.isValidFlagContent,
    flagValidator.isFlagOnFreet
  ],
  async (req: Request, res: Response) => {
    const flag = await FlagCollection.createFlag(req.body.freetId, req.body.source);

    res.status(201).json({
      message: 'Your flag was created successfully.',
      flag: util.constructFlagResponse(flag)
    });
  }
);

/**
 * Challenge a flag
 * 
 * @name PUT /api/flags/challenge/:flagId?
 * @param {string} flagId - The id of the flag to challenge
 * @return {string} A success message
 * 
 * @throws {403} - If user is not logged in
 * @throws {404} - if flag with flagId does not exist
 * @throws {412} - if user has already challenged this flag
 * */ 
router.put(
    '/challenge/:flagId?',
    [
      userValidator.isUserLoggedIn,
      flagValidator.isFlagExists,
      flagValidator.isUserChallengedFlag
    ],
  async (req: Request, res: Response) => {
    const challenges = await FlagCollection.challengeFlag(req.params.flagId, req.session.userId);

    res.status(201).json({
      message: 'The flag was challenged successfully.',
      challenges: challenges
    });
  }
);

/**
 * Delete a flag
 * 
 * @name DELETE /api/flags/:flagId?
 * @param {string} flagId - The id of the flag to delete
 * @return {string} A success message
 * 
 * @throws {404} - If the flagId is not valid
 * @throws {403} - If user is not logged in or not authorized to modify the associated freet
 */
 router.delete(
    '/:flagId?',
    [
      userValidator.isUserLoggedIn,
      flagValidator.isFlagExists,
      // flagValidator.isValidFlagModifier
    ],
    async (req: Request, res: Response) => {
      
      const flag = await FlagCollection.deleteFlag(req.params.flagId);
  
      res.status(201).json({
        message: 'Your flag was removed successfully.',
      });
    }
  );

export {router as flagRouter};