const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const warehouseSchema = new mongoose.Schema({
  businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "businessUnitId is required"] },
  businessUnitName: { type: String, required: [true, "businessUnit name is required"] },
  businessUnitShortName: { type: String, required: [true, "businessUnit short name is required"] },
  warehouseName: { type: String, required: [true, "Warehouse name is required"] },
  shortName: { type: String, required: [true, "Short name is required"] },
  warehouseIncharge: { type: String, required: false, default: null },
  warehousePhone: { type: String, required: false, default: null },
  warehouseEmail: { type: String, required: false, default: null },
  warehouseTags: { type: Array, required: false, default: null },
  mapLocation: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
  },
  address: {
    addressLine1: { type: String, required: [true, "Address line 1 is required"] },
    addressLine2: { type: String, required: false },
    pinCode: { type: String, required: false },
    city: {
      cityId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String }
    },
    state: {
      stateId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      stateCode: { type: String }
    },
    country: {
      countryId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      countryCode: { type: String }
    }
  },
  businessAddress: {
    addressLine1: { type: String, required: [true, "Address line 1 is required"] },
    addressLine2: { type: String, required: false },
    //city:{ type: String,  required: [true, "City is required"]  },     
    pinCode: { type: String, required: false },
    city: {
      cityId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
    },
    state: {
      stateId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      stateCode: { type: String }
    },
    country: {
      countryId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      countryCode: { type: String }
    }
  },
  warehouseCapacity: {
    capacity: {
      value: { type: Number, required: false, default: null },
      unit: {
        unitId: { type: mongoose.Schema.Types.ObjectId },
        unitName: { type: String, required: false, default: null },
        unitCategory: { type: String, required: false, default: null },
        unitSymbol: { type: String, required: false, default: null }
      }
    },
    dimensions: {
      unit: {
        unitId: { type: mongoose.Schema.Types.ObjectId },
        unitName: { type: String, required: false, default: null },
        unitCategory: { type: String, required: false, default: null },
        unitSymbol: { type: String, required: false, default: null }
      },
      height: { type: Number, required: false, default: null },
      length: { type: Number, required: false, default: null },
      width: { type: Number, required: false, default: null },
    }
  },
  helpline: [{
    _id: { type: mongoose.Schema.Types.ObjectId },
    phoneNumber: { type: String, required: false, default: null },
    personName: { type: String, required: false, default: null },
  }],
  warehousePreferences: [{
    preferenceName: { type: String, required: true },
    preferenceValue: { type: String, required: true }
  }],
  warehouseReports: [{
    moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reportType: { type: String, required: true },
    reportId: { type: String, required: true }
  }],
  inwardNumberStartFrom: { type: Number, default: 0 },
  inwardLastSequenceNumber: { type: Number, required: false, default: null },
  status: { type: Boolean, default: true },
  isDeleteLocked: { type: Boolean, default: false },
  autoCompletePODOutwards: { type: Boolean, default: false },
  autoCompleteInvoiceOutwards: { type: Boolean, default: false },
  autoCompleteSalesBillsOutwards: { type: Boolean, default: false },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean }
}, { versionKey: false });

const warehouseModel = mongoose.model('warehouses', warehouseSchema);
const modelSecondary = secondaryDB.model('warehouses', warehouseSchema);

const warehouseActivitySchema = new mongoose.Schema({
  warehouseId: { type: mongoose.Schema.Types.ObjectId, default: null },
  action: { type: String, required: [true, "action is required"] },
  who: { type: Object, required: [true, "who is required"] },
  what: { type: Object, required: [true, "what is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  comments: { type: String, required: false, default: undefined },
  isRestored: { type: Boolean, required: false },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" },
}, { versionKey: false });

const modelActivity = activitiesDB.model('warehouse_activities', warehouseActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('warehouse_activities', warehouseActivitySchema);

/**
 * Activity Schema for Validation
 */
const warehouseActivityJoiSchema = Joi.object({
  warehouseId: Joi.object(),
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
const createActivity = async function (activityDetails) {
  if (activityDetails.what.oldValues && activityDetails.what.newValues) {

    let oldValues = JSON.parse(JSON.stringify(activityDetails.what.oldValues))
    let newValues = JSON.parse(JSON.stringify(activityDetails.what.newValues))

    await getDistinctValues(oldValues, newValues).then(async (result) => {
      if (result) {
        activityDetails.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
        activityDetails.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

        // activityDetails.what.oldValues === null && activityDetails.what.newValues === null ? delete activityDetails.what : null
      }
    })
  }
  return new Promise(function (resolve, reject) {
    if(activityDetails.what){
      Joi.validate(activityDetails, warehouseActivityJoiSchema, { abortEarly: false }).then(async (activityData) => {
        await modelActivity(activityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
      }).catch((error) => { reject(error); });
    } else{
      resolve(true);
    }
  });
}


/// references are available.
const availableReferences = {};


/// common conditions.
let commonWhereConditions = {
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
  return warehouseModel.find(findCondition, documentFields);
}

/// remove record.
const removeCollection = function (collectionId, data) {


  return new Promise(function (resolve, reject) {

    let where = { _id: collectionId };
    model.findOne(where, {}).then(async (selectedData) => {

      if (selectedData && selectedData.isDeleteLocked == false) {

        if (data.approvalRequired) {

          var approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "storeId": selectedData._id,
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
                "collectionName": "warehouses",
                "collectionId": selectedData._id,
                "activityId": history._id,
                "approvalType": history.approvalType,
                "approvalTitle": selectedData.warehouseName,
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
                modelActivity.findByIdAndRemove({ '_id': history._id },
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
            "storeId": selectedData._id,
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
              removeFn = model.findOneAndUpdate({ '_id': selectedData._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = model.findByIdAndRemove({ '_id': selectedData._id });
            }
            /// Remove warehouse data             
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "warehouse removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else if (selectedData.isDeleteLocked == false) {

        reject({
          error: "warehouse not allowed to delete!",
          errorCode: "DELETE_NOT_ALLOWED",
        });

      } else {

        reject({
          error: "warehouse not found!",
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

        await model.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isReferenceAvailable } }).then((afterLockData) => {
          if (afterLockData) resolve(afterLockData.isDeleteLocked)
          else resolve(null);
        }).catch((e) => { reject(e); });

      } else {
        resolve(null);
      }

    } else {

      await model.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isDeleteLocked } }).then((afterLockData) => {
        if (afterLockData) resolve(afterLockData.isDeleteLocked);
        else resolve(null);
      }).catch((e) => { reject(e); });

    }

  });

}


module.exports = {
  collection: warehouseModel,
  activityCollection: modelActivity,
  readOnlyCollection: modelSecondary,
  readOnlyActivityCollection: modelActivitySecondary,
  findAll: findAll,
  activityKey: "warehouseId",
  commonWhereConditions: commonWhereConditions,
  removeCollection: removeCollection,
  availableReferences: availableReferences,
  createActivity: createActivity,
  updateIsDeleteLocked: updateIsDeleteLocked
};

