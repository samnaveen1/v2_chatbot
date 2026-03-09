const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const vendorSchema = new mongoose.Schema({

  vendorType: { type: String },
  vendorSubType: { type: String },

  vendorCategory: { type: String },
  legalName: { type: String },
  legalNameCategory: { type: String },
  legalNameProof: { type: Array, default: null },
  aadharNumber: { type: String },

  tradeName: { type: String },
  tradeNameProof: { type: Array, default: null },


  vendorCode: { type: String },
  fssaiCode: { type: String },
  fssaiProof: { type: Array, default: null },
  vendorEmail: { type: String },
  vendorMobile: { type: String },
  address: {
    attention: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
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
    pinCode: { type: String },
    mapLocation: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false }
    },
  },

  taxNumber: { type: String },
  taxProof: { type: Array, default: null },

  vendorPanNumber: { type: String },
  vendorPanProof: { type: Array, default: null },

  isMSME: { type: Boolean, default: false },
  msmeNumber: { type: String },
  msmeProof: { type: Array, default: null },

  mapProducts: {
    // toAllProductsInCategory: { type: Boolean,  required: false, default: false },
    // markupPercentage: {type: Number,  required: false, default: null },
    productCategories: [{ productCategoryId: { type: mongoose.Schema.Types.ObjectId }, markupPercentage: { type: Number } }],
    products: [{ masterProductId: { type: mongoose.Schema.Types.ObjectId }, markupPercentage: { type: Number } }],
  },

  allowExpiryGoodsReturn: { type: Boolean, default: false },
  allowDamagedGoodsReturn: { type: Boolean, default: false },

  areaManagers: [{
    managerName: { type: String },
    managerEmail: { type: String },
    managerMobile: { type: String }
  }],

  vendorCreditLimit: { type: Number },
  vendorCreditPeriod: { type: Number },
  paymentTerm: { type: String },

  allowPaymentViaBank: { type: Boolean, default: false },
  bankAccount: [{
    accountName: { type: String },
    accountNumber: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    bankIFSC: { type: String },
    bankProof: { type: Array, default: null },
  }],

  allowPaymentViaUPI: { type: Boolean, default: false },
  upiId: { type: String, default: null },
  upiProof: { type: Array, default: null },

  allowPaymentViaCash: { type: Boolean, default: false },

  allowPaymentViaDDCheque: { type: Boolean, default: false },
  ddChequeName: { type: String, default: null },
  ddChequePayable: { type: String, default: null },

  defaultMarkupPercentage: { type: Number, default: 1 },
  status: { type: Boolean, default: true },

  approvalStatus: { type: String, default: "auto approved" },

  isInDraft: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean }

}, { versionKey: false });

const model = mongoose.model('vendors', vendorSchema);
const modelSecondary = secondaryDB.model('vendors', vendorSchema);


/// VendorActivity
const vendorActivitySchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, required: [true, "vendorId is required"] },
  action: { type: String, required: [true, "action is required"] },
  what: { type: Object, required: [true, "what is required"] },
  who: { type: Object, required: [true, "who is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  comments: { type: String, required: false, default: undefined },
  isRestored: { type: Boolean, required: false },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" }
}, { versionKey: false });

const modelActivity = activitiesDB.model('vendor_activities', vendorActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('vendor_activities', vendorActivitySchema);

/**
 * Activity Schema for Validation
 */
const vendorActivityJoiSchema = Joi.object({
  vendorId: Joi.object().required(),
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
const createActivity = async function (vendorActivityData) {
  if (vendorActivityData.what.oldValues && vendorActivityData.what.newValues) {

    let oldValues = JSON.parse(JSON.stringify(vendorActivityData.what.oldValues))
    let newValues = JSON.parse(JSON.stringify(vendorActivityData.what.newValues))

    await getDistinctValues(oldValues, newValues).then(async (result) => {
      if (result) {
        vendorActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
        vendorActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

        // vendorActivityData.what.oldValues === null && vendorActivityData.what.newValues === null ? delete vendorActivityData.what : null
      }
    })
  }
  return new Promise(function (resolve, reject) {
    Joi.validate(vendorActivityData, vendorActivityJoiSchema, { abortEarly: false }).then(async (vendorActivityData) => {
      await modelActivity(vendorActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
    }).catch((error) => { reject(error); });
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
    model.findOne(where, {}).then(async (selectedData) => {

      if (selectedData) {

        if (data.approvalRequired) {

          var approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "vendorId": selectedData._id,
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
                "collectionName": "vendors",
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
            "vendorId": selectedData._id,
            "action": "Delete",
            "who": { "userId": data.user._id, "name": data.user.name },
            "what": { "oldValues": selectedData },
            "when": data.timeStamp,
            "mode": data.mode
          };

          /// validate and Create Activity. 
          createActivity(activityLog).then((activity) => {
            let removeFn = null;
            if (isReferenceAvailable) {
              removeFn = model.findOneAndUpdate({ '_id': selectedData._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = model.findByIdAndRemove({ '_id': selectedData._id });
            }
            /// Remove product data             
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "Vendor removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else {

        reject({
          error: "Vendor not found!",
          errorCode: "VALIDATION_ERROR",
        });

      }

    }).catch((error) => { reject(error); });

  });

}

/// common conditions.
let commonWhereConditions = {
  "approvalStatus": { "$in": ["approved", "auto approved"] },
  "isDeleted": { $ne: true },
  "isInDraft": false
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
  return model.find(findCondition, documentFields);
}

module.exports = {
  collection: model,
  activityCollection: modelActivity,
  readOnlyCollection: modelSecondary,
  readOnlyActivityCollection: modelActivitySecondary,
  createActivity: createActivity,
  activityKey: "vendorId",
  removeCollection: removeCollection,
  availableReferences: availableReferences,
  findAll: findAll,
  commonWhereConditions: commonWhereConditions
};
