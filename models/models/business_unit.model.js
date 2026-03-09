const mongoose = require('mongoose');
//const uniqueValidator = require('mongoose-unique-validator');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const businessUnitSchema = new mongoose.Schema({
  legalName: { type: String, required: [true, "Legal Name is required"] },
  legalNameProof: { type: Array, default: null },
  tradeName: { type: String, required: [true, "Trade name is required"] },
  tradeNameProof: { type: Array, default: null },
  shortName: { type: String, required: true },
  phone: { type: String },
  mobile: { type: String },
  email: { type: String, required: true },
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
    },
    mapLocation: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false }
    },
  },
  taxRegistrarName: { type: String, required: true },
  taxRegistrationNumber: { type: String, required: true },
  taxRegistrationProof: { type: Array, default: null },
  cinNumber: { type: String },
  panNumber: { type: String },
  FSSAI_No: { type: String },
  bankAccount: {
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    branchName: { type: String, required: true },
    bankIFSC: { type: String, required: true },
    bankProof: { type: Array, default: null },
    upiDetails: [{
      upiId: { type: String },
      upiNo: { type: String },
      upiDisplayName: { type: String },
      upiPaymentUrl: { type: String },
      status: { type: Boolean },
    }],
  },

  salesInvoiceStartFrom: { type: Number, default: 1 },
  salesInvoiceLastSequenceNumber: { type: Number, required: false, default: null },

  salesDraftInvoiceStartFrom: { type: Number, default: 1 },
  salesDraftInvoiceLastSequenceNumber: { type: Number, required: false, default: null },

  performaInvoiceStartFrom: { type: Number, default: 1 },
  performaInvoiceLastSequenceNumber: { type: Number, required: false, default: null },

  estimateStartFrom: { type: Number, default: 1 },
  estimateLastSequenceNumber: { type: Number, required: false, default: null },

  ledgerTransactionStartFrom: { type: Number, default: 1 },
  ledgerTransactionLastSequenceNumber: { type: Number, required: false, default: null },

  creditNoteStartFrom: { type: Number, default: 1 },
  creditNoteLastSequenceNumber: { type: Number, required: false, default: null },

  debitNoteStartFrom: { type: Number, default: 1 },
  debitNoteLastSequenceNumber: { type: Number, required: false, default: null },

  approvalStatus: { type: String, required: false, default: "auto approved" },
  status: { type: Boolean, required: true, default: true },
  isDeleteLocked: { type: Boolean, default: false },
  autoCompletePODOutwards: { type: Boolean, default: false },
  autoCompleteInvoiceOutwards: { type: Boolean, default: false },
  autoCompleteSalesBillsOutwards: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, required: false },
  updatedAt: { type: Date, default: Date.now, required: false },
  isDeleted: { type: Boolean }
}, { versionKey: false });

// businessUnitSchema.plugin(uniqueValidator);
const BusinessUnit = mongoose.model('business_units', businessUnitSchema);
const readOnlyBusinessUnit = secondaryDB.model('business_units', businessUnitSchema);


/// BusinessUnitActivity
const businessUnitActivitySchema = new mongoose.Schema({
  businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "businessUnitId is required"] },
  action: { type: String, required: [true, "action is required"] },
  what: { type: Object, required: [true, "what is required"] },
  comments: { type: String, required: false, default: undefined },
  who: { type: Object, required: [true, "who is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const BusinessUnitActivity = activitiesDB.model('business_unit_activities', businessUnitActivitySchema);
const readOnlyBusinessUnitActivity = activitiesSecondaryDB.model('business_unit_activities', businessUnitActivitySchema);

/**
 * Activity Schema for Validation
 */
const businessUnitActivityJoiSchema = Joi.object({
  businessUnitId: Joi.object().required(),
  action: Joi.string().required(),
  comments: Joi.string(),
  who: Joi.object().required(),
  what: Joi.object().required(),
  mode: Joi.string().required(),
  when: Joi.date(),
  isRestored: Joi.bool(),
  approvalType: Joi.string(),
  approvalStatus: Joi.string()
});

/// references are available.
const availableReferences = {
  "purchase_orders": [
    { "field": "businessUnitId", "dataType": "String" },
  ],
  // "purchase_order_activities": [
  //   { "field": "what.oldValues.businessUnitId", "dataType": "String" },
  //   { "field": "what.newValues.businessUnitId", "dataType": "String" }
  // ],
  "master_products": [
    { "field": "businessUnitId", "dataType": "String" },
  ],
  "master_product_activities": [
    { "field": "what.oldValues.businessUnitId", "dataType": "String" },
    { "field": "what.newValues.businessUnitId", "dataType": "String" },
  ],
};

/// common conditions.
let commonWhereConditions = {
  "status": true,
  "approvalStatus": { $in: ["approved", "auto approved"] },
  "isDeleted": { $ne: true }
};

/// find all records.
const findAll = function ({ where = null, allowCondition = true, documentFields = {}, readOnlyModel = false } = {}) {
  let findCondition = {};
  if (where && allowCondition) {
    findCondition["$and"] = [where, commonWhereConditions];
  } else if (where) {
    findCondition = where;
  } else if (allowCondition) {
    findCondition = commonWhereConditions;
  }
  if (readOnlyModel == true) {
    return readOnlyBusinessUnit.find(findCondition, documentFields);
  } else {
    return BusinessUnit.find(findCondition, documentFields);
  }
}

/// create activity
const createActivity = async function (businessUnitActivityData) {
  if (businessUnitActivityData.what.oldValues && businessUnitActivityData.what.newValues) {

    let oldValues = JSON.parse(JSON.stringify(businessUnitActivityData.what.oldValues))
    let newValues = JSON.parse(JSON.stringify(businessUnitActivityData.what.newValues))

    await getDistinctValues(oldValues, newValues).then(async (result) => {
      if (result) {
        businessUnitActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
        businessUnitActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

            // businessUnitActivityData.what.oldValues === null && businessUnitActivityData.what.newValues === null ? delete businessUnitActivityData.what : null
        }
    })
  }
  return new Promise(function (resolve, reject) {
    if (businessUnitActivityData.what) {
      Joi.validate(businessUnitActivityData, businessUnitActivityJoiSchema, { abortEarly: false }).then(async (businessUnitActivityData) => {
        await BusinessUnitActivity(businessUnitActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
      }).catch((error) => { reject(error); });
    } else {
      resolve("")
    }
  });
}

/// remove record.
const removeCollection = function (collectionId, data) {


  return new Promise(function (resolve, reject) {

    let where = { _id: collectionId };
    BusinessUnit.findOne(where, {}).then(async (selectedData) => {

      if (selectedData && selectedData.isDeleteLocked == false) {

        if (data.approvalRequired) {

          var approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "businessUnitId": selectedData._id,
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
                "collectionName": "business_units",
                "collectionId": selectedData._id,
                "activityId": history._id,
                "approvalType": history.approvalType,
                "approvalTitle": selectedData.legalName,
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

              approvalModel(approvalRequest).save().then((_approvalRequest) => {

                resolve({
                  success: true,
                  message: "delete approval request created successfully!",
                  data: history,
                  approvalRequest: history,
                  isApprovalRequired: true
                });

              }).catch((e) => {

                /// Roleback request.
                BusinessUnitActivity.findByIdAndRemove({ '_id': history._id },
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
          const masterProductModel = appHelper.getModel("master_products");
          const purchaseOrderModel = appHelper.getModel("purchase_orders");
          let requiredModels = {
            "master_products": masterProductModel.collection,
            "master_product_activities": masterProductModel.collection,
            "purchase_orders": purchaseOrderModel.collection,
            "purchase_order_activities": purchaseOrderModel.activityCollection
          };

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
            "businessUnitId": selectedData._id,
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
              removeFn = BusinessUnit.findOneAndUpdate({ '_id': selectedData._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = BusinessUnit.findByIdAndRemove({ '_id': selectedData._id });
            }
            /// Remove business unit data             
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "BusinessUnit removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else if (selectedData.isDeleteLocked == false) {

        reject({
          error: "BusinessUnit not allowed to delete!",
          errorCode: "DELETE_NOT_ALLOWED",
        });

      } else {

        reject({
          error: "BusinessUnit not found!",
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
      const purchaseOrderModel = appHelper.getModel("purchase_orders");
      const masterProductModel = appHelper.getModel("master_products");
      let requiredModels = {
        "master_products": masterProductModel.collection,
        "master_product_activities": masterProductModel.collection,
        "purchase_orders": purchaseOrderModel.collection,
        "purchase_order_activities": purchaseOrderModel.activityCollection
      };


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

        await BusinessUnit.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isReferenceAvailable } }).then((afterLockData) => {
          if (afterLockData) resolve(afterLockData.isDeleteLocked)
          else resolve(null);
        }).catch((e) => { reject(e); });

      } else {
        resolve(null);
      }

    } else {

      await BusinessUnit.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isDeleteLocked } }).then((afterLockData) => {
        if (afterLockData) resolve(afterLockData.isDeleteLocked);
        else resolve(null);
      }).catch((e) => { reject(e); });

    }

  });

}

module.exports = {
  collection: BusinessUnit,
  activityCollection: BusinessUnitActivity,
  readOnlyCollection: readOnlyBusinessUnit,
  readOnlyActivityCollection: readOnlyBusinessUnitActivity,
  findAll: findAll,
  createActivity: createActivity,
  activityKey: "businessUnitId",
  removeCollection: removeCollection,
  availableReferences: availableReferences,
  commonWhereConditions: commonWhereConditions,
  updateIsDeleteLocked: updateIsDeleteLocked
};
