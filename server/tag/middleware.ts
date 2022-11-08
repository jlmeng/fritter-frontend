import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import TagCollection from '../tag/collection';
import FreetCollection from '../freet/collection';
import TagModel from './model';

/**
 * Checks if a tag with given content exists
 */
 const isTagExists = async (req: Request, res: Response, next: NextFunction) => {
    const tag = await TagModel.findOne({content: req.body.tag});
    if (!tag) {
        res.status(404).json({
            error: {
                tagNotFound: `Tag ${req.body.tag} does not exist.`
            }
            });
            
        return;
    }
  
    next();
};

/**
 * Checks if a tag with given content already exists
 */
const isTagAlreadyExists = async (req: Request, res: Response, next: NextFunction) => {
    const tag = await TagModel.findOne({content: req.body.tag});
    if (tag) {
        res.status(404).json({
            error: {
                tagAlreadyFound: `Tag ${req.body.tag} already exists.`
            }
            });
            
        return;
    }
  
    next();
};

/**
 * Checks if a tag in the parameter with given content exists
 */
 const isTagParamsExists = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.params)
    const tag = await TagModel.findOne({content: req.params.tag});
    if (!tag) {
        res.status(404).json({
            error: {
                tagNotFound: `Tag ${req.params.tag} does not exist.`
            }
            });
            
        return;
    }
  
    next();
};

/**
 * Checks if content of tag is valid (not empty and not more than 20 characters)
 */
const isValidTagContent = (req: Request, res: Response, next: NextFunction) => {
  console.log("L")
  console.log(req.body)

  const {tag} = req.body as {tag: string};

  if (!tag.trim()) {
    res.status(400).json({
      error: 'Freet tag must be at least one character long.'
    });
    return;
  }

  if (tag.length > 20) {
    res.status(413).json({
      error: 'Freet tag must be no more than 20 characters.'
    });
    return;
  }

  next();
};

/**
 * Checks if content of tag is valid (not empty and not more than 20 characters)
 */
 const isValidTagContentParams = (req: Request, res: Response, next: NextFunction) => {
    console.log("L")
    console.log(req.params)
  
    const {tag} = req.params as {tag: string};
  
    if (!tag.trim()) {
      res.status(400).json({
        error: 'Freet tag must be at least one character long.'
      });
      return;
    }
  
    if (tag.length > 20) {
      res.status(413).json({
        error: 'Freet tag must be no more than 20 characters.'
      });
      return;
    }
  
    next();
  };

/**
 * Checks if tag is already on freet
 */
const isTagAlreadyExistsOnFreet = async (req: Request, res: Response, next: NextFunction) => {
    const validFormat = Types.ObjectId.isValid(req.params.freetId);
    const tag = validFormat ? await TagModel.findOne({content: req.body.tag}) : '';
    // console.log("TAG", tag);
    if (tag) {
      const freets = tag.tagged
      const ind = freets.map(freet => freet.toString()).indexOf(req.params.freetId);
      if (ind > -1) {
        res.status(412).json({
            error: {
              tagAlreadyFound: `Tag ${req.body.tag} already exists on Freet with freet ID ${req.params.freetId}.`
            }
          });
          return;
      }    
        
    }
  
    next();
};

/**
 * Checks if tag to remove is on freet
 */
const isTagExistsOnFreet = async (req: Request, res: Response, next: NextFunction) => {
  console.log("checking if tag exists on freet")
    const validFormat = Types.ObjectId.isValid(req.params.freetId);
    const tag = validFormat ? await TagModel.findOne({content: req.body.tag}) : '';
    if (tag) {
      const freets = tag.tagged
      const ind = freets.map(freet => freet.toString()).indexOf(req.params.freetId);
      if (ind < 0) {
        res.status(412).json({
            error: {
              tagNotFound: `Tag ${req.body.tag} does not exist on Freet with freet ID ${req.params.freetId}.`
            }
          });
          return;
      }    

    }
  
    next();
};

export {
    isTagExists,
    isTagAlreadyExists,
    isTagParamsExists,
    isValidTagContent,
    isValidTagContentParams,
    isTagAlreadyExistsOnFreet,
    isTagExistsOnFreet
}