const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;


const purchaseOrderSchema = new mongoose.Schema({
  businessUnitId: { type: mongoose.Schema.Types.ObjectId },
  billingAddress: {
    type: new mongoose.Schema({
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: null },
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
      pinCode: { type: Number, required: true }
    }, { _id: false }),
  },
  poNumber: { type: String },
  poDate: { type: Date },
  poFor: {
    type: new mongoose.Schema({
      branchType: { type: String },
      storeId: { type: mongoose.Schema.Types.ObjectId },
      storeName: { type: String },
      warehouseId: { type: mongoose.Schema.Types.ObjectId },
      warehouseName: { type: String }
    }, { _id: false }),
    required: false
  },
  deliveryAddress: {
    type: new mongoose.Schema({
      attention: { type: String },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: null },
      pinCode: { type: Number, required: true },
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
      }
    }, { _id: false }),
  },
  deliveryDate: { type: Date },
  quoteNumber: { type: String },
  vendorId: { type: mongoose.Schema.Types.ObjectId },
  vendorAddress: {
    type: new mongoose.Schema({
      addressLine1: { type: String, required: false },
      // addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      // pinCode: { type: Number, required: true },
      pinCode: { type: Number, required: false },
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
    }, { _id: false })
  },
  vendorManager: {
    type: new mongoose.Schema({
      // managerName: { type: String, required: true },
      managerName: { type: String, required: false },
      managerEmail: { type: String },
      // managerMobile: { type: String, required: true }
      managerMobile: { type: String, required: false }
    }, { _id: false })
  },
  paymentTerms: { type: String },
  comments: { type: String },
  products: {
    type: [new mongoose.Schema({
      productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
      masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
      inventoryType: { type: String },
      unit: {
        unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
        unitName: { type: String },
        unitSymbol: { type: String },
        unitSize: { type: Number }
      },
      isVariableSize: { type: Boolean, default: false },
      isPurchaseOnly: { type: Boolean, default: false },
      productQuantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      unitMaximumRetailPrice: { type: Number, required: false },
      discountName: { type: String, default: null },
      unitDiscountPercentage: { type: Number },
      taxes: [{
        taxId: { type: mongoose.Schema.Types.ObjectId },
        taxGroup: { type: String },
        taxRegistrarName: { type: String },
        taxPercentage: { type: Number, required: true }
      }],
      poProductInward: [{
        inwardId: { type: mongoose.Schema.Types.ObjectId, required: true, default: null },
        inwardItemId: { type: mongoose.Schema.Types.ObjectId, required: true, default: null },
        receivingQuantity: { type: Number, required: true, default: null },
        giftQuantity: { type: Number, default: null },
        damageQuantity: { type: Number, default: null }
      }]
    })],
  },
  termsConditions: {
    priceBasis: { type: String },
    taxes: { type: String },
    modeOfDispatch: { type: String },
    paymentTerms: { type: String },
    leadTime: { type: String }
  },
  poNotes: { type: String },
  frieghtCharge: { type: Number },
  packingCharge: { type: Number },
  otherCharge: { type: Number },
  insurance: { type: Number },
  discount: { type: Number },
  emailStatus: { type: String, default: "pending" },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  poStatus: { type: String, default: "draft" },
  poTotalQuantity: { type: Number },
  poTotalAmount: { type: Number },
  receivedTotalProducts: { type: Number },
  receivedTotalQuantity: { type: Number },
  createdAt: { type: Date, default: Date.now, required: false },
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean }
}, { versionKey: false });

const model = mongoose.model('purchase_orders', purchaseOrderSchema);
const modelSecondary = secondaryDB.model('purchase_orders', purchaseOrderSchema);



/// PurchaseOrderActivity
const purchaseOrderActivitySchema = new mongoose.Schema({
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, required: [true, "purchaseOrderId is required"] },
  action: { type: String, required: [true, "action is required"] },
  what: { type: Object, required: [true, "what is required"] },
  who: { type: Object, required: [true, "who is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const purchaseOrderActivity = activitiesDB.model('purchase_order_activities', purchaseOrderActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('purchase_order_activities', purchaseOrderActivitySchema);

/**
 * Activity Schema for Validation
 */
const purchaseOrderActivityJoiSchema = Joi.object({
  purchaseOrderId: Joi.object().required(),
  action: Joi.string().required(),
  who: Joi.object().required(),
  what: Joi.object().required(),
  mode: Joi.string().required(),
  when: Joi.date(),
  isRestored: Joi.bool(),
  approvalType: Joi.string(),
  approvalStatus: Joi.string()
});

/// create activity
const createActivity = async function (purchaseOrderActivityData) {
  if (purchaseOrderActivityData.what.oldValues && purchaseOrderActivityData.what.newValues) {

    let oldValues = JSON.parse(JSON.stringify(purchaseOrderActivityData.what.oldValues))
    let newValues = JSON.parse(JSON.stringify(purchaseOrderActivityData.what.newValues))

    await getDistinctValues(oldValues, newValues).then(async (result) => {
      if (result) {
        purchaseOrderActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
        purchaseOrderActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

        // purchaseOrderActivityData.what.oldValues === null && purchaseOrderActivityData.what.newValues === null ? delete purchaseOrderActivityData.what : null
      }
    })
  }
  return new Promise(function (resolve, reject) {
    Joi.validate(purchaseOrderActivityData, purchaseOrderActivityJoiSchema, { abortEarly: false }).then(async (purchaseOrderActivityData) => {
      await purchaseOrderActivity(purchaseOrderActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
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
    model.findOne(where, {}).then(async (purchaseOrder) => {

      if (purchaseOrder) {

        if (data.approvalRequired) {

          var approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "purchaseOrderId": purchaseOrder._id,
            "action": "Delete",
            "who": { "userId": data.user._id, "name": data.user.name },
            "what": { "oldValues": purchaseOrder },
            "when": data.timeStamp,
            "mode": data.mode,
            "approvalType": data.approvalType,
            "approvalStatus": "pending"
          };

          createActivity(activityLog).then((history) => {

            if (history) {

              let approvalRequest = {
                "moduleName": data.moduleName,
                "collectionName": "purchase_orders",
                "collectionId": purchaseOrder._id,
                "activityId": history._id,
                "approvalType": history.approvalType,
                "approvalTitle": purchaseOrder.legalName,
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

                /// Roleback transpor purchase order request.
                purchaseOrderActivity.findByIdAndRemove({ '_id': history._id },
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
            "purchaseOrderId": purchaseOrder._id,
            "action": "Delete",
            "who": { "userId": data.user._id, "name": data.user.name },
            "what": { "oldValues": purchaseOrder },
            "when": data.timeStamp,
            "mode": data.mode
          };

          /// validate and Create Activity. 
          createActivity(activityLog).then((activity) => {
            let removeFn = null;
            if (isReferenceAvailable) {
              removeFn = model.findOneAndUpdate({ '_id': purchaseOrder._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = model.findByIdAndRemove({ '_id': purchaseOrder._id });
            }
            /// Remove purchase order data             
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "Purchase order removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else {

        reject({
          error: "Purchase order not found!",
          errorCode: "VALIDATION_ERROR",
        });

      }

    }).catch((error) => { reject(error); });

  });

}

module.exports = {
  collection: model,
  activityCollection: purchaseOrderActivity,
  readOnlyCollection: modelSecondary,
  readOnlyActivityCollection: modelActivitySecondary,
  createActivity: createActivity,
  activityKey: "purchaseOrderId",
  removeCollection: removeCollection
}