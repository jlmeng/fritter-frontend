import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Flag} from '../flag/model';

// Update this if you add a property to the Flag type!
type FlagResponse = {
  _id: string;
  freetId: string;
  kind: string;
  source: string;
  challenges: number;
  challengeUsers: string[];
};

/**
 * Transform a raw Flag object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Flag>} flag - A flag
 * @returns {FlagResponse} - The flag object formatted for the frontend
 */
const constructFlagResponse = (flag: HydratedDocument<Flag>): FlagResponse => {
  const flagCopy: Flag = {
    ...flag.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  console.log(flagCopy)

  return {
    ...flagCopy,
    _id: flagCopy._id.toString(),
    freetId: flagCopy.freetId.toString(),
    challengeUsers: flagCopy.challengeUsers.map(user => user.toString())
  };
};

export {
  constructFlagResponse
};