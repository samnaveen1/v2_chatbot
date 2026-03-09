const mongoose = require('mongoose');
//const autoIncrement = require("mongoose-auto-increment");
const uniqueValidator = require('mongoose-unique-validator');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "name is required"] },
  shortName: { type: String, required: [false, "name is required"] },
  username: { type: String, unique: true, required: [true, "username is required"] },
  password: { type: String, required: [true, "password is required"] },
  hashedPassword: { type: String, required: [true, "hashedPassword is required"] },
  hassedPin: { type: String, required: [true, "hashedPassword is required"] },
  userRole: { type: String, required: false },
  userRoleId: { type: mongoose.Schema.Types.ObjectId, required: false },
  warehouseMapped: [{ type: mongoose.Schema.Types.ObjectId }],
  storesMapped: [{ type: mongoose.Schema.Types.ObjectId }],
  email: {
    type: String, unique: true, required: [true, "email is required"],
    // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
    match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
  },
  mobile: { type: String, required: [true, "mobile is required"] },
  designation: { type: String, required: [true, "designation is required"] },
  defaultWarehouse: { type: mongoose.Schema.Types.ObjectId, default: null },
  defaultStore: { type: mongoose.Schema.Types.ObjectId, default: null },
  profilePicture: { type: String, default: null },
  recentAppId: { type: mongoose.Schema.Types.ObjectId, default: null },
  preferences: {
    timeZone: { type: String, default: null },
    themeMode: { type: String, default: null }
  },
  status: { type: Boolean, required: true, default: true },
  isDeleteLocked: { type: Boolean, default: false },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean },
  appSwitchToken: { type: String },
  appSwitchTokenCreatedAt: { type: Date, default: null },
  linkedRoleId: { type: String, required: false, default: null },
  grafana: {
    type: {
      id: { type: String, required: true },
      username: { type: String, required: true },
      password: { type: String, required: true },
    }, required: false, default: null,
  }
}, { versionKey: false });

// autoIncrement.initialize(mongoose.connection);
// UserSchema.plugin(autoIncrement.plugin, {
//   model: "User", // collection or table name in which you want to apply auto increment
//   field: "_id", // field of model which you want to auto increment
//   startAt: 1, // start your auto increment value from 1
//   incrementBy: 1, // incremented by 1
// });
userSchema.plugin(uniqueValidator);
const User = mongoose.model('users', userSchema);
const modelSecondary = secondaryDB.model('users', userSchema);


/// UserActivity
const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: [true, "userId is required"] },
  action: { type: String, required: [true, "action is required"] },
  who: { type: Object, required: [true, "who is required"] },
  what: { type: Object, required: [true, "what is required"] },
  comments: { type: String, required: false, default: undefined },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const UserActivity = activitiesDB.model('user_activities', userActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('user_activities', userActivitySchema);

/**
 * Activity Schema for Validation
 */
const userActivityJoiSchema = Joi.object({
  userId: Joi.object().required(),
  action: Joi.string().required(),
  comments: Joi.string(),
  who: Joi.object().required(),
  what: Joi.object().required(),
  mode: Joi.string().required(),
  when: Joi.date(),
  isRestored: Joi.bool(),
  approvalType: Joi.string().allow(null),
  approvalStatus: Joi.string()
});

/// create activity
const createActivity = async function (activityData) {
  if (activityData.what.oldValues && activityData.what.newValues) {

    let oldValues = JSON.parse(JSON.stringify(activityData.what.oldValues))
    let newValues = JSON.parse(JSON.stringify(activityData.what.newValues))

    await getDistinctValues(oldValues, newValues).then(async (result) => {
      if (result) {
        activityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
        activityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

        // activityData.what.oldValues === null && activityData.what.newValues === null ? delete activityData.what : null
      }
    })
  }
  return new Promise(function (resolve, reject) {
    Joi.validate(activityData, userActivityJoiSchema, { abortEarly: false }).then(async (activityData) => {
      await UserActivity(activityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
    }).catch((error) => { reject(error); });
  });
}

/// references are available.
const availableReferences = {};

/// common conditions.
let commonWhereConditions = {
  "status": true,
  "approvalStatus": { "$in": ["approved", "auto approved"] },
  "isDeleted": { $ne: true }
};
/// find all records.
const findAll = function ({ where = null, allowCondition = true, documentFields = {} } = {}) {
  let findCondition = {};
  if (where && allowCondition) {
    findCondition["$and"] = [where, commonWhereConditions];
  } else if (where) {
    findCondition = where;
  } else if (allowCondition) {
    findCondition = commonWhereConditions;
  }
  return User.find(findCondition, documentFields);
}

/// remove record.
const removeCollection = function (collectionId, data) {


  return new Promise(function (resolve, reject) {

    let where = { _id: collectionId };
    User.findOne(where, {}).then(async (selectedData) => {

      if (selectedData && selectedData.isDeleteLocked == false) {

        if (data.approvalRequired) {

          var approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "userId": selectedData._id,
            "action": "Delete",
            "who": { "userId": data.user._id, "name": data.user.name },
            "what": { "oldValues": selectedData },
            "when": data.timeStamp,
            "mode": data.mode,
            "approvalType": data.approvalType,
            "approvalStatus": "pending"
          };

          createActivity(activityLog).then((history) => {

            if (history) {

              let approvalRequest = {
                "moduleName": data.moduleName,
                "collectionName": "users",
                "collectionId": selectedData._id,
                "activityId": history._id,
                "approvalType": history.approvalType,
                "approvalTitle": selectedData.name,
                "requestType": "Delete",
                "who": {
                  "userId": data.user._id,
                  "name": data.user.name,
                  "phone": data.user.phone,
                },
                "createdAt": data.timeStamp,
                "updatedAt": data.timeStamp,
                "approvalStatus": "pending"
              };

              approvalModel(approvalRequest).save().then((approvalRequest) => {

                resolve({
                  success: true,
                  message: "delete approval request created successfully!",
                  data: history,
                  approvalRequest: history,
                  isApprovalRequired: true
                });

              }).catch((e) => {

                /// Roleback request.
                UserActivity.findByIdAndRemove({ '_id': history._id },
                  function (errHistory, historyObject) {
                    if (errHistory) { reject(errHistory); } else { reject(e); }
                  });

              });


            } else {

              reject({
                message: "Opps! something went wrong.",
                errorCode: "ERROR"
              });

            }
          }).catch((error) => { reject(error); });


        } else {

          const appHelper = require('../helpers/app_helper');

          let requiredModels = {};

          let isReferenceAvailable = false;
          let promiseCollections = [];

          for (referenceCollectionName in availableReferences) {
            let referenceCollection = requiredModels[referenceCollectionName];
            if (referenceCollection) {
              let referenceConditions = availableReferences[referenceCollectionName];
              let where = {};
              let conditionCount = referenceConditions.length;
              let orConditions = [];
              for (let i = 0; i < conditionCount; i++) {
                let condition = {};
                if (referenceConditions[i]['dataType'] == "Array") {
                  condition[referenceConditions[i]['field']] = { $elemMatch: { $eq: collectionId } };
                  orConditions.push(condition);
                } else {
                  condition[referenceConditions[i]['field']] = collectionId;
                  orConditions.push(condition);
                }
              }
              if (conditionCount > 1) {
                where["$or"] = orConditions;
              } else {
                where = orConditions[0];
              }
              promiseCollections.push(referenceCollection.findOne(where, { _id: 1 }));
            }
          }

          let promiseLength = promiseCollections.length;
          if (promiseLength > 0) {
            await Promise.allSettled(promiseCollections).then((promiseResults) => {
              for (let i = 0; i < promiseResults.length; i++) {
                if (promiseResults[i] && isReferenceAvailable == false) {
                  isReferenceAvailable = true;
                }
              }
            }).catch((e) => { reject(e); });
          }

          /// Create Activity data.
          let activityLog = {
            "userId": selectedData._id,
            "action": "Delete",
            "who": { "userId": data.user._id, "name": data.user.name },
            "what": { "oldValues": selectedData },
            "when": data.timeStamp,
            "mode": data.mode
          };

          /// validate and Create Activity. 
          createActivity(activityLog).then((_activity) => {
            let removeFn = null;
            if (isReferenceAvailable) {
              removeFn = User.findOneAndUpdate({ '_id': selectedData._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = User.findByIdAndRemove({ '_id': selectedData._id });
            }
            /// Remove transport vehicle data             
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "User removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else if (selectedData.isDeleteLocked == false) {

        reject({
          error: "User not allowed to delete!",
          errorCode: "DELETE_NOT_ALLOWED",
        });

      } else {

        reject({
          error: "User not found!",
          errorCode: "VALIDATION_ERROR",
        });

      }

    }).catch((error) => { reject(error); });

  });

}

/// remove record.
const updateIsDeleteLocked = function (collectionId, isDeleteLocked = null) {

  return new Promise(async function (resolve, reject) {

    if (isDeleteLocked === null) {

      const appHelper = require('../helpers/app_helper');


      let requiredModels = {};


      let isReferenceAvailable = false;
      let promiseCollections = [];

      for (referenceCollectionName in availableReferences) {
        let referenceCollection = requiredModels[referenceCollectionName];
        if (referenceCollection) {
          let referenceConditions = availableReferences[referenceCollectionName];
          let where = {};
          let conditionCount = referenceConditions.length;
          let orConditions = [];
          for (let i = 0; i < conditionCount; i++) {
            let condition = {};
            if (referenceConditions[i]['dataType'] == "Array") {
              condition[referenceConditions[i]['field']] = { $elemMatch: { $eq: collectionId } };
              orConditions.push(condition);
            } else {
              condition[referenceConditions[i]['field']] = collectionId;
              orConditions.push(condition);
            }
          }
          if (conditionCount > 1) {
            where["$or"] = orConditions;
          } else {
            where = orConditions[0];
          }
          promiseCollections.push(referenceCollection.findOne(where, { _id: 1 }));
        }
      }

      let promiseLength = promiseCollections.length;
      if (promiseLength > 0) {

        await Promise.allSettled(promiseCollections).then((promiseResults) => {
          for (let i = 0; i < promiseResults.length; i++) {
            if (promiseResults[i]['status'] == "fulfilled" && promiseResults[i]['value'] !== null && isReferenceAvailable == false) {
              isReferenceAvailable = true;
            }
          }
        }).catch((e) => { reject(e); });

        await User.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isReferenceAvailable } }).then((afterLockData) => {
          if (afterLockData) resolve(afterLockData.isDeleteLocked)
          else resolve(null);
        }).catch((e) => { reject(e); });

      } else {
        resolve(null);
      }

    } else {

      await User.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isDeleteLocked } }).then((afterLockData) => {
        if (afterLockData) resolve(afterLockData.isDeleteLocked);
        else resolve(null);
      }).catch((e) => { reject(e); });

    }

  });

}



module.exports = {
  collection: User,
  activityCollection: UserActivity,
  readOnlyCollection: modelSecondary,
  readOnlyActivityCollection: modelActivitySecondary,
  createActivity: createActivity,
  activityKey: "userId",
  findAll: findAll,
  removeCollection: removeCollection,
  availableReferences: availableReferences,
  updateIsDeleteLocked: updateIsDeleteLocked
};
