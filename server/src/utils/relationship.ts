import RelationshipModel from '../models/relationship.js';

export const findRelationshipForUser = (userId: string) =>
  RelationshipModel.findOne({ $or: [{ userOne: userId }, { userTwo: userId }] });
