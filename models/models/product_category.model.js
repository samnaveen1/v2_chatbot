const mongoose = require('mongoose');
const Joi = require('joi');
//const autoIncrement = require("mongoose-auto-increment");
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Product Category.
const productCategorySchema = new mongoose.Schema({
  productCategoryName: { type: String, required: true },
  productCategoryDescription: { type: String, required: false },
  // productCategoryDescription: { type: String, required: true },
  //categoryType: { type: String,  required: true },
  // categoryGroup: { type: String, required: true },
  categoryGroup: { type: String, required: false },
  productCategoryIcon: { type: String, default: null },
  hasParentCategory: { type: Boolean, required: true },
  parentCategoryId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
  productCategoryUnits: [{
    unitId: { type: mongoose.Schema.Types.ObjectId, required: true },
    unitName: { type: String },
    unitSymbol: { type: String },
  }],
  productCategorySizes: [{
    unitId: { type: mongoose.Schema.Types.ObjectId, required: true },
    unitName: { type: String },
    unitSymbol: { type: String },
    unitSize: { type: Number }
  }],
  // attributes: [{
  //   attributeId:{ type: mongoose.Schema.Types.ObjectId, required: true },
  //   attributeName: { type: String, required: true  },
  //   attributeType: { type: String  },
  //   attributeOptions: [ { type: String } ],
  //   isRequired:{  type: Boolean, default: false }
  // }],
  attributes: [{
    attributeId: { type: mongoose.Schema.Types.ObjectId, required: false },
    attributeName: { type: String, required: false },
    attributeType: { type: String },
    attributeOptions: [{ type: String }],
    isRequired: { type: Boolean, default: false }
  }],
  isDeleteLocked: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean }
}, { versionKey: false });

const ProductCategory = mongoose.model('product_categories', productCategorySchema);
const readOnlyProductCategory = secondaryDB.model('product_categories', productCategorySchema);


/// ProductCategoryActivity
const ProductCategoryActivitySchema = new mongoose.Schema({
  productCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "productCategoryId is required"]
  },
  action: {
    type: String,
    required: [true, "action is required"]
  },
  who: {
    type: Object,
    required: [true, "who is required"]
  },
  what: {
    type: Object,
    required: [true, "what is required"]
  },
  mode: {
    type: String, required: [true, "mode is required"]
  },
  when: {
    type: Date,
    default: Date.now,
    required: [true, "when is required"]
  },
  approvalType: {
    type: String,
    required: false,
    default: null
  },
  approvalStatus: {
    type: String,
    required: false,
    default: "auto approved"
  },
  isRestored: {
    type: Boolean,
    required: false
  },
  comments: { type: String, required: false, default: undefined },
}, { versionKey: false });

const ProductCategoryActivity = activitiesDB.model('product_category_activities', ProductCategoryActivitySchema);
const readOnlyProductCategoryActivity = activitiesSecondaryDB.model('product_category_activities', ProductCategoryActivitySchema);


/**
 * Activity Schema for Validation
 */
const productCategoryActivityJoiSchema = Joi.object({
  productCategoryId: Joi.object().required(),
  action: Joi.string().required(),
  who: Joi.object().required(),
  what: Joi.object().required(),
  mode: Joi.string().required(),
  when: Joi.date(),
  isRestored: Joi.bool(),
  approvalType: Joi.string(),
  approvalStatus: Joi.string(),
  comments: Joi.string(),
});


/// references are available.
const availableReferences = {
  "master_products": [{ "field": "productCategoryId", "dataType": "String" }],
  "master_product_activities": [
    { "field": "what.oldValues.productCategoryId", "dataType": "String" },
    { "field": "what.newValues.productCategoryId", "dataType": "String" }
  ],
  "combos": [
    { "field": "comboBuyProducts.productCategoryId", "dataType": "String" },
    { "field": "comboGetProducts.productCategoryId", "dataType": "String" },
  ],
  "combo_activities": [
    { "field": "what.oldValues.comboBuyProducts.productCategoryId", "dataType": "String" },
    { "field": "what.oldValues.comboGetProducts.productCategoryId", "dataType": "String" },
    { "field": "what.newValues.comboBuyProducts.productCategoryId", "dataType": "String" },
    { "field": "what.newValues.comboGetProducts.productCategoryId", "dataType": "String" },
  ],
  "discounts": [
    { "field": "productsMapped.productCategories", "dataType": "Array" },
  ],
  "discount_activities": [
    { "field": "what.oldValues.productsMapped.productCategories", "dataType": "Array" },
    { "field": "what.newValues.productsMapped.productCategories", "dataType": "Array" },
  ],
  "products": [
    { "field": "productCategoryId", "dataType": "String" },
  ],
  "product_activities": [
    { "field": "what.newValues.productCategoryId", "dataType": "String" },
    { "field": "what.oldValues.productCategoryId", "dataType": "String" },
  ],
  "purchase_orders": [
    { "field": "products.productCategoryId", "dataType": "String" },
  ],
  // "purchase_order_actitivies": [
  //   { "field": "what.oldValues.products.productCategoryId", "dataType": "String" },
  //   { "field": "what.newValues.products.productCategoryId", "dataType": "String" },
  // ],
  "inwards": [
    { "field": "inwardProducts.productCategoryId", "dataType": "String" }
  ],
  "inward_activities": [
    { "field": "what.newValues.inwardProducts.productCategoryId", "dataType": "String" },
    { "field": "what.oldValues.inwardProducts.productCategoryId", "dataType": "String" }
  ],
  "stock_requests": [
    { "field": "requestProducts.productCategoryId", "dataType": "String" }
  ],
  "stock_request_activities": [
    { "field": "what.oldValues.requestProducts.productCategoryId", "dataType": "String" },
    { "field": "what.newValues.requestProducts.productCategoryId", "dataType": "String" }
  ],
  "stock_converstions": [
    { "field": "fromStockProducts.productCategoryId", "dataType": "String" },
    { "field": "toStockProducts.productCategoryId", "dataType": "String" }
  ],
  "stock_converstion_activities": [
    { "field": "what.oldValues.fromStockProducts.productCategoryId", "dataType": "String" },
    { "field": "what.oldValues.toStockProducts.productCategoryId", "dataType": "String" }
  ]
};


/// common conditions.
let commonWhereConditions = {
  "status": true,
  "approvalStatus": { "$in": ["approved", "auto approved"] },
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
    return readOnlyProductCategory.find(findCondition, documentFields);
  } else
    return ProductCategory.find(findCondition, documentFields);
}

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
    Joi.validate(activityData, productCategoryActivityJoiSchema, { abortEarly: false }).then(async (activityData) => {
      await ProductCategoryActivity(activityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
    }).catch((error) => { reject(error); });
  });
}


/// remove record.
const removeCollection = function (collectionId, data) {


  return new Promise(function (resolve, reject) {

    let where = { _id: collectionId };
    ProductCategory.findOne(where, {}).then(async (selectedData) => {

      if (selectedData && selectedData.isDeleteLocked == false) {

        if (data.approvalRequired) {

          var approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "productCategoryId": selectedData._id,
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
                "collectionName": "product_categories",
                "collectionId": selectedData._id,
                "activityId": history._id,
                "approvalType": history.approvalType,
                "approvalTitle": selectedData.productCategoryName,
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
                ProductCategoryActivity.findByIdAndRemove({ '_id': history._id },
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
          const productModel = appHelper.getModel("products");
          const comboModel = appHelper.getModel("combos");
          const discountModel = appHelper.getModel("discounts");
          const purchaseOrderModel = appHelper.getModel("purchase_orders");
          const inwardModel = appHelper.getModel("inwards");
          const stockRequestModel = appHelper.getModel("stock_requests");
          const stockConversionModel = appHelper.getModel("stock_conversions");

          let requiredModels = {
            "master_products": masterProductModel.collection,
            "master_product_activities": masterProductModel.activityCollection,
            "products": productModel.collection,
            "product_acitivities": productModel.activityCollection,
            "combos": comboModel.collection,
            "combo_activities": comboModel.activityCollection,
            "discounts": discountModel.collection,
            "discount_activities": discountModel.activityCollection,
            "purchase_orders": purchaseOrderModel.collection,
            "purchase_order_activities": purchaseOrderModel.activityCollection,
            "inwards": inwardModel.collection,
            "inward_activities": inwardModel.activityCollection,
            "stock_requests": stockRequestModel.collection,
            "stock_request_activities": stockRequestModel.activityCollection,
            "stock_conversions": stockConversionModel.collection,
            "stock_conversion_activities": stockConversionModel.activityCollection
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
          }

          /// Create Activity data.
          let activityLog = {
            "productCategoryId": selectedData._id,
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
              removeFn = ProductCategory.findOneAndUpdate({ '_id': selectedData._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = ProductCategory.findByIdAndRemove({ '_id': selectedData._id });
            }
            /// Remove businessUnit data             
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "Product category removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else if (selectedData.isDeleteLocked == false) {

        reject({
          error: "Product category not allowed to delete!",
          errorCode: "DELETE_NOT_ALLOWED",
        });

      } else {

        reject({
          error: "Product category not found!",
          errorCode: "VALIDATION_ERROR",
        });

      }

    }).catch((error) => { reject(error); });

  });

}



/// remove record.
const updateIsDeleteLocked = function (collectionId, isDeleteLocked = null) {

  return new Promise(async function (resolve, reject) {

    ProductCategory.findOne({ _id: collectionId }, {}).then(async (productCategoryData) => {

      if (isDeleteLocked === null) {

        const appHelper = require('../helpers/app_helper');
        const masterProductModel = appHelper.getModel("master_products");
        //const productModel = appHelper.getModel("products");
        const discountModel = appHelper.getModel("discounts");
        // const purchaseOrderModel = appHelper.getModel("purchase_orders");
        // const inwardModel = appHelper.getModel("inwards");
        // const stockRequestModel = appHelper.getModel("stock_requests");
        // const stockConversionModel = appHelper.getModel("stock_conversions");

        let requiredModels = {
          "master_products": masterProductModel.collection,
          "master_product_activities": masterProductModel.activityCollection,
          // "products": productModel.collection,
          // "product_acitivities": productModel.activityCollection,
          "discounts": discountModel.collection,
          "discount_activities": discountModel.activityCollection,
          // "purchase_orders": purchaseOrderModel.collection,
          // "purchase_order_activities": purchaseOrderModel.activityCollection,
          // "inwards": inwardModel.collection,
          // "inward_activities": inwardModel.activityCollection,
          // "stock_requests": stockRequestModel.collection,
          // "stock_request_activities": stockRequestModel.activityCollection,
          // "stock_conversions":stockConversionModel.collection,
          // "stock_conversion_activities": stockConversionModel.activityCollection
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
        }

        await ProductCategory.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isReferenceAvailable } }).then((afterLockData) => {
          resolve(isReferenceAvailable);
        }).catch((e) => { reject(e); });

      } else if (productCategoryData.isDeleteLocked != isDeleteLocked) {

        await ProductCategory.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isDeleteLocked } }).then((afterLockData) => {
          resolve(isDeleteLocked);
        }).catch((e) => { reject(e); });

      } else {
        resolve(productCategoryData);
      }

    }).catch((e) => { reject(e); });


  });

}





module.exports = {
  collection: ProductCategory,
  activityCollection: ProductCategoryActivity,
  readOnlyCollection: readOnlyProductCategory,
  readOnlyActivityCollection: readOnlyProductCategoryActivity,
  commonWhereConditions: commonWhereConditions,
  findAll: findAll,
  createActivity: createActivity,
  activityKey: "productCategoryId",
  removeCollection: removeCollection,
  updateIsDeleteLocked: updateIsDeleteLocked,
  availableReferences: availableReferences,
};
