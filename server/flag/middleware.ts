import type {Request, Response, NextFunction} from 'express';
import FreetCollection from '../freet/collection';
import {Types} from 'mongoose';
import FlagCollection from '../flag/collection';

/**
 * Checks if a flag with flagId is req.params exists
 */
const isFlagExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.flagId);
  const flag = validFormat ? await FlagCollection.findOne(req.params.flagId) : '';
  if (!flag) {
    res.status(404).json({
      error: {
        flagNotFound: `Flag with flag ID ${req.params.flagId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a user has already challenged a flag
 */
const isUserChallengedFlag = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session.userId;
    const validFormat = Types.ObjectId.isValid(req.params.flagId);
    const flag = validFormat ? await FlagCollection.findOne(req.params.flagId) : '';
    if (flag) {
        const ind = flag.challengeUsers.indexOf(userId);
        if (ind > -1) {
            res.status(403).json({
                error: {
                  flagNotFound: `Current user already challenged flag ${req.params.flagId}.`
                }
              });
            return;
        }    
    }
  
    next();
  };

/**
 * Checks if the content of the source in req.body is valid, i.e not a stream of empty
 * spaces and not more than 100 characters
 */
 const isValidFlagContent = (req: Request, res: Response, next: NextFunction) => {
    const {source} = req.body as {source: string};
  
    if (!source.trim()) {
      res.status(400).json({
        error: 'Flag source must be at least one character long.'
      });
      return;
    }
  
    if (source.length > 140) {
      res.status(413).json({
        error: 'Flag source must be no more than 100 characters.'
      });
      return;
    }
  
    next();
  };

/**
 * Checks if freet already has a flag of the same type
 */
const isFlagOnFreet = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.body.freetId);
    const freet = validFormat ? await FreetCollection.findOne(req.body.freetId) : '';
    if (freet) {
      const flags = freet.flags;
      for (const i in flags) {
        console.log("1")
        console.log(flags[i])
        const flag = await FlagCollection.findOne(flags[i]);
        console.log("2")
        if (flag.kind === "Fact") {
            res.status(412).json({
                error: {
                  flagNotFound: `Freet with freet ID ${req.body.freetId} already has a flag of type ${flag.kind}.`
                }
              });
            return;
        }
      }
    }
  
    next();
  };

/**
 * Checks if the user has permissions to modify a flag
 */
 const isValidFlagModifier = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.params.flagId);
    const flag = validFormat ? await FlagCollection.findOne(req.params.flagId) : '';
    if (flag) {
      const freetId = flag.freetId;
      const freet = await FreetCollection.findOne(freetId);
      const userId = freet.authorId;

      if (req.session.userId !== userId.toString()) {
        res.status(403).json({
          error: 'Cannot modify other users\' freets.'
        });
        return;
      }
    }
  
    next();
  };

export {
    isFlagExists,
    isUserChallengedFlag,
    isValidFlagContent,
    isFlagOnFreet,
    isValidFlagModifier
  };