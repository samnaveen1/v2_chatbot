const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// transport_vehicle schema
const transportVehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: [true, "Vehicle Number is required"] },
  vehicleName: { type: String, required: [true, "Vehicle name is required"] },
  vehicleIcon: { type: String, default: null },
  vehicleShortName: { type: String },
  inchargeName: { type: String, required: false },
  inchargePhone: { type: String, required: false },
  vehicleCapacity: {
    capacity: {
      value: { type: Number, required: false, default: null },
      unit: {
        unitId: { type: mongoose.Schema.Types.ObjectId },
        unitName: { type: String, required: false, default: null },
        unitSymbol: { type: String, required: false, default: null }
      }
    },
    dimensions: {
      unit: {
        unitId: { type: mongoose.Schema.Types.ObjectId },
        unitName: { type: String, required: false, default: null },
        unitSymbol: { type: String, required: false, default: null }
      },
      height: { type: Number, required: false, default: null },
      length: { type: Number, required: false, default: null },
      width: { type: Number, required: false, default: null },
    }
  },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  status: { type: Boolean, required: true },
  isDeleteLocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, required: false },
  updatedAt: { type: Date, default: Date.now, required: false },
  isDeleted: { type: Boolean }
}, { versionKey: false });
const TransportVehicle = mongoose.model('transport_vehicles', transportVehicleSchema);
const modelSecondary = secondaryDB.model('transport_vehicles', transportVehicleSchema);


/// transport_vehicle_activities schema.
const transportVehicleActivitySchema = new mongoose.Schema({
  transportVehicleId: { type: mongoose.Schema.Types.ObjectId, required: [true, "vehicleId is required"] },
  action: { type: String, required: [true, "action is required"] },
  what: { type: Object, required: [true, "what is required"] },
  who: { type: Object, required: [true, "who is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  isRestored: { type: Boolean, required: false },
  comments: { type: String, required: false, default: undefined },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" }
}, { versionKey: false });
const TransportVehicleActivity = activitiesDB.model('transport_vehicle_activities', transportVehicleActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('transport_vehicle_activities', transportVehicleActivitySchema);

/**
 * Activity Schema for Validation
 */
const vechicleActivityJoiSchema = Joi.object({
  transportVehicleId: Joi.object().required(),
  action: Joi.string().required(),
  who: Joi.object().required(),
  what: Joi.object().required(),
  mode: Joi.string().required(),
  when: Joi.date(),
  isRestored: Joi.bool(),
  comments: Joi.string(),
  approvalType: Joi.string(),
  approvalStatus: Joi.string()
});

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
  return TransportVehicle.find(findCondition, documentFields);
}

/// create activity
const createActivity = async function (vehicleActivityData) {
  if (vehicleActivityData.what.oldValues && vehicleActivityData.what.newValues) {

    let oldValues = JSON.parse(JSON.stringify(vehicleActivityData.what.oldValues))
    let newValues = JSON.parse(JSON.stringify(vehicleActivityData.what.newValues))

    await getDistinctValues(oldValues, newValues).then(async (result) => {
      if (result) {
        vehicleActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
        vehicleActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

        // vehicleActivityData.what.oldValues === null && vehicleActivityData.what.newValues === null ? delete vehicleActivityData.what : null
      }
    })
  }
  return new Promise(function (resolve, reject) {
    Joi.validate(vehicleActivityData, vechicleActivityJoiSchema, { abortEarly: false }).then(async (vehicleActivityData) => {
      await TransportVehicleActivity(vehicleActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
    }).catch((error) => { reject(error); });
  });
}

/// remove record.
const removeCollection = function (collectionId, data) {


  return new Promise(function (resolve, reject) {

    let where = { _id: collectionId };
    TransportVehicle.findOne(where, {}).then(async (selectedData) => {

      if (selectedData && selectedData.isDeleteLocked == false) {

        if (data.approvalRequired) {

          var approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "transportVehicleId": selectedData._id,
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
                "collectionName": "transport_vehicles",
                "collectionId": selectedData._id,
                "activityId": history._id,
                "approvalType": history.approvalType,
                "approvalTitle": selectedData.vehicleNumber,
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
                TransportVehicleActivity.findByIdAndRemove({ '_id': history._id },
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
            "transportVehicleId": selectedData._id,
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
              removeFn = TransportVehicle.findOneAndUpdate({ '_id': selectedData._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = TransportVehicle.findByIdAndRemove({ '_id': selectedData._id });
            }
            /// Remove transport vehicle data             
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "TransportVehicle removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else if (selectedData.isDeleteLocked == false) {

        reject({
          error: "TransportVehicle not allowed to delete!",
          errorCode: "DELETE_NOT_ALLOWED",
        });

      } else {

        reject({
          error: "TransportVehicle not found!",
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

        await TransportVehicle.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isReferenceAvailable } }).then((afterLockData) => {
          if (afterLockData) resolve(afterLockData.isDeleteLocked)
          else resolve(null);
        }).catch((e) => { reject(e); });

      } else {
        resolve(null);
      }

    } else {

      await TransportVehicle.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isDeleteLocked } }).then((afterLockData) => {
        if (afterLockData) resolve(afterLockData.isDeleteLocked);
        else resolve(null);
      }).catch((e) => { reject(e); });

    }

  });

}

module.exports = {
  collection: TransportVehicle,
  activityCollection: TransportVehicleActivity,
  readOnlyCollection: modelSecondary,
  readOnlyActivityCollection: modelActivitySecondary,
  findAll: findAll,
  createActivity: createActivity,
  activityKey: "transportVehicleId",
  removeCollection: removeCollection,
  availableReferences: availableReferences,
  updateIsDeleteLocked: updateIsDeleteLocked
};
