import type {Request, Response, NextFunction} from 'express';
import FeedCollection from '../feed/collection';
import {Types} from 'mongoose';
import TagCollection from '../tag/collection';
import UserCollection from '../user/collection';

/**
 * Checks if a feed with feedId is req.params exists
 */
const isFeedExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.feedId);
  const feed = validFormat ? await FeedCollection.findOne(req.params.feedId) : '';
  if (!feed) {
    res.status(404).json({
      error: {
        feedNotFound: `Feed with feed ID ${req.params.feedId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if the user owns the feed with feedId
 */
 const isFeedOwner = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.params.feedId);
    const feed = validFormat ? await FeedCollection.findOne(req.params.feedId) : '';
    if (feed) {
      const userId = feed.ownerId;
      if (req.session.userId !== userId.toString()) {
        res.status(403).json({
          error: `You do not own feed with id ${req.params.feedId}`
        });
        return;
      }
    }
  
    next();
  };

/**
 * Checks if tag is on feed
 */
 const isTagExistsOnFeed = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.params.feedId);
    const feed = validFormat ? await FeedCollection.findOne(req.params.feedId) : '';
    const tag = await TagCollection.findByContent(req.body.tag);

    if (feed) {
      const tags = feed.tags;
      const ind = tags.map(tagId => tagId.toString()).indexOf(tag._id.toString());
      console.log(ind);
      if (ind < 0) {
        res.status(412).json({
            error: {
              tagAlreadyFound: `Tag ${req.body.tag} does not exist on Feed with feed ID ${req.params.feedId}.`
            }
          });
        return;
      }    
    }
  
    next();
};

/**
 * Checks if tag is already on feed
 */
 const isTagAlreadyExistsOnFeed = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.params.feedId);
    const feed = validFormat ? await FeedCollection.findOne(req.params.feedId) : '';
    const tag = await TagCollection.findByContent(req.body.tag);

    if (feed) {
      const tags = feed.tags;
      const ind = tags.map(tagId => tagId.toString()).indexOf(tag._id.toString());
      if (ind > -1) {
        res.status(412).json({
            error: {
              tagAlreadyFound: `Tag ${req.body.tag} already exists on Feed with feed ID ${req.params.feedId}.`
            }
          });
          return;
      }    
    }
  
    next();
};

/**
 * Checks if user is on feed
 */
 const isUserExistsOnFeed = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.params.feedId);
    const feed = validFormat ? await FeedCollection.findOne(req.params.feedId) : '';
    const user = await UserCollection.findOneByUsername(req.body.username);
 
    if (feed) {
      const users = feed.users;
      const ind = users.map(userId => userId.toString()).indexOf(user._id.toString());
      if (ind < 0) {
        res.status(412).json({
            error: {
              userAlreadyFound: `user ${req.body.username} does not exist on Feed with feed ID ${req.params.feedId}.`
            }
          });
      return;

      }    
    }
  
    next();
};

/**
 * Checks if user is already on feed
 */
 const isUserAlreadyExistsOnFeed = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.params.feedId);
    const feed = validFormat ? await FeedCollection.findOne(req.params.feedId) : '';
    const user = await UserCollection.findOneByUsername(req.body.username);
    if (feed) {
        console.log(feed.users);
        console.log(user);
      const users = feed.users;
      const ind = users.map(userId => userId.toString()).indexOf(user._id.toString());
      if (ind > -1) {
        res.status(412).json({
            error: {
              userAlreadyFound: `user ${req.body.username} already exists on Feed with feed ID ${req.params.feedId}.`
            }
          });
        return;

      }    
    }
  
    next();
};

/**
 * Checks if user exists
 */
 const isUserExists = async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserCollection.findOneByUsername(req.body.username);
  
    if (!user) {
        res.status(404).json({
            error: {
              username: `No account with username ${req.body.username} exists.`
            }
          });
    }
  };

export {
    isFeedExists,
    isFeedOwner,
    isTagExistsOnFeed,
    isTagAlreadyExistsOnFeed,
    isUserExistsOnFeed,
    isUserAlreadyExistsOnFeed,
    isUserExists
};