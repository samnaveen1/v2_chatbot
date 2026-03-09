const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// customer groups
const collectionSchema = new mongoose.Schema({
  customerGroupName: { type: String, required: [true, "customerGroupName is required"] },
  customerGroupDesc: { type: String, required: [true, "customerGroupDesc is required"] },
  customers: [{ type: mongoose.Schema.Types.ObjectId }],
  status: { type: Boolean, default: true },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, required: false, default: false },
  isDeleted: { type: Boolean }
}, { versionKey: false });
const Collection = mongoose.model('customer_segments', collectionSchema);
const readOnlyCollection = secondaryDB.model('customer_segments', collectionSchema);

/// Customer Group Activity
const collectionActivitySchema = new mongoose.Schema({
  customerGroupId: { type: mongoose.Schema.Types.ObjectId, required: [true, "customerGroupId is required"] },
  action: { type: String, required: [true, "action is required"] },
  what: { type: Object, required: [true, "what is required"] },
  who: { type: Object, required: [true, "who is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  comments: { type: String, required: false, default: undefined },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });
const ActivityCollection = activitiesDB.model('customer_segment_activities', collectionActivitySchema);
const readOnlyActivityCollection = activitiesSecondaryDB.model('customer_segment_activities', collectionActivitySchema);


/**
 * Activity Schema for Validation
 */
const customerGroupActivityJoiSchema = Joi.object({
  customerGroupId: Joi.object().required(),
  action: Joi.string().required(),
  who: Joi.object().required(),
  what: Joi.object().required(),
  mode: Joi.string().required(),
  when: Joi.date(),
  comments: Joi.string(),
  isRestored: Joi.bool(),
  approvalType: Joi.string(),
  approvalStatus: Joi.string()
});


/// create activity
const createActivity = async function (customerGroupActivityData) {
  if (customerGroupActivityData.what.oldValues && customerGroupActivityData.what.newValues) {

    let oldValues = JSON.parse(JSON.stringify(customerGroupActivityData.what.oldValues))
    let newValues = JSON.parse(JSON.stringify(customerGroupActivityData.what.newValues))

    await getDistinctValues(oldValues, newValues).then(async (result) => {
      if (result) {
        customerGroupActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
        customerGroupActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

        // customerGroupActivityData.what.oldValues === null && customerGroupActivityData.what.newValues === null ? delete customerGroupActivityData.what : null
      }
    })
  }
  return new Promise(function (resolve, reject) {
    if (customerGroupActivityData.what) {
      Joi.validate(customerGroupActivityData, customerGroupActivityJoiSchema, { abortEarly: false }).then(async (customerGroupActivityData) => {
        await ActivityCollection(customerGroupActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
      }).catch((error) => { reject(error); });
    } else {
      resolve("")
    }
  });
}


/// references are available.
const availableReferences = {
  // "users": [{"field":"warehouseMapped","dataType":"Array"}],
  // "user_activities": [
  //   {"field":"what.oldValues.warehouseMapped","dataType":"Array"},
  //   {"field":"what.newValues.warehouseMapped","dataType":"Array"}
  // ],
  // "transport_activites": [
  //   {"field":"_id","dataType":"String"}
  // ]
};


/// remove record.
const removeCollection = function (collectionId, data) {


  return new Promise(function (resolve, reject) {

    let where = { _id: collectionId };
    Collection.findOne(where, {}).then(async (customer) => {

      if (customer) {

        if (data.approvalRequired) {

          var approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "customerGroupId": customer._id,
            "action": "Delete",
            "who": { "userId": data.user._id, "name": data.user.name },
            "what": { "oldValues": customer },
            "when": data.timeStamp,
            "mode": data.mode,
            "approvalType": data.approvalType,
            "approvalStatus": "pending"
          };

          createActivity(activityLog).then((history) => {

            if (history) {
              let approvalRequest = {
                "moduleName": data.moduleName,
                "collectionName": "customer_segments",
                "collectionId": customer._id,
                "activityId": history._id,
                "approvalType": history.approvalType,
                "approvalTitle": customer.legalName,
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

                /// Roleback transpor customer request.
                ActivityCollection.findByIdAndRemove({ '_id': history._id },
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
            "customerGroupId": customer._id,
            "action": "Delete",
            "who": { "userId": data.user._id, "name": data.user.name },
            "what": { "oldValues": customer },
            "when": data.timeStamp,
            "mode": data.mode
          };

          /// validate and Create Activity. 
          createActivity(activityLog).then((activity) => {
            let removeFn = null;
            if (isReferenceAvailable) {
              removeFn = Collection.findOneAndUpdate({ '_id': customer._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = Collection.findByIdAndRemove({ '_id': customer._id });
            }
            /// Remove customer data             
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "Customer group removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else {

        reject({
          error: "Customer group not found!",
          errorCode: "VALIDATION_ERROR",
        });

      }

    }).catch((error) => { reject(error); });

  });

}

/// common conditions.
let commonWhereConditions = { "approvalStatus": { "$in": ["approved", "auto approved"] }, "isDeleted": { $ne: true } };


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
  return Collection.find(findCondition, documentFields);
}

module.exports = {
  collection: Collection,
  activityCollection: ActivityCollection,
  readOnlyCollection: readOnlyCollection,
  readOnlyActivityCollection: readOnlyActivityCollection,
  findAll: findAll,
  activityKey: "customerGroupId",
  createActivity: createActivity,
  removeCollection: removeCollection,
  commonWhereConditions: commonWhereConditions
};

