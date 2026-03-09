const mongoose = require('mongoose');
const Joi = require('joi');

const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const productSchema = new mongoose.Schema({

  productName: {
    type: String,
    required: [false, "productName is required"]
  },
  productNameId: { type: mongoose.Schema.Types.ObjectId, required: false },
  displayName: {//display name
    type: String
  },
  productCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "productCategoryId is required"]
  },
  businessUnitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "businessUnitId is required"]
  },
  productDescription: {
    type: String
  },
  tags: {
    type: Array,
    required: false,
    default: null
  },
  productCode: {
    type: String,
    required: [true, "productCode is required"]
  },
  inventoryType: {
    type: String,
    required: [true, "inventoryType required"]
  },
  unit: {
    unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
    unitName: { type: String },
    unitSymbol: { type: String },
    unitSize: { type: Number }
  },
  isPurchaseOnly: { type: Boolean, required: false, default: false },
  isVariableSize: { type: Boolean, required: true, default: false },
  hsnCode: {
    type: String,
    required: [true, "hsnCode is required"]
  },
  brand: {
    brandId: { type: mongoose.Schema.Types.ObjectId, required: [true, "brandId is required"] },
    brandName: { type: String }
  },
  manufacturer: {
    manufacturerId: { type: mongoose.Schema.Types.ObjectId, required: [true, "manufacturerId is required"] },
    manufacturerName: { type: String }
  },
  minimumStock: {
    type: Number,
    default: null
  },
  maximumStock: {
    type: Number,
    default: null
  },
  upperCapMaximunStock: {
    type: Number,
    default: null
  },
  previousMaximumStock: {
    type: Number,
    default: null
  },
  isWhiteLabel: {
    type: Boolean,
    default: false
  },
  isHSNReportable: {
    type: Boolean,
    default: false
  },
  attributes: [
    {
      attributeId: { type: mongoose.Schema.Types.ObjectId, required: true },
      attributeName: { type: String, required: true },
      attributeValue: { type: String }
    }
  ],
  package: {
    weight: {
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

  // isNotForSale: {
  //   type: Boolean,
  //   default: false
  // },

  salesTaxes: {
    required: false,
    default: null,
    type: new mongoose.Schema({
      intraStateTaxes: {
        type: [
          new mongoose.Schema({
            taxId: { type: mongoose.Schema.Types.ObjectId },
            taxRegistrarName: { type: String },
            taxPercentage: { type: Number },
            taxGroup: { type: String }
          }, { _id: false })
        ],
        required: false,
        default: undefined
      },
      interStateTaxes: {
        type: [
          new mongoose.Schema({
            taxId: { type: mongoose.Schema.Types.ObjectId },
            taxRegistrarName: { type: String },
            taxPercentage: { type: Number },
            taxGroup: { type: String }
          }, { _id: false })
        ],
        required: false,
        default: undefined
      },
      interNationalTaxes: {
        type: [
          new mongoose.Schema({
            taxId: { type: mongoose.Schema.Types.ObjectId },
            taxRegistrarName: { type: String },
            taxPercentage: { type: Number },
            taxGroup: { type: String }
          }, { _id: false })
        ],
        required: false,
        default: undefined
      },
    }, { _id: false }),

  },

  purchaseTaxes:
  {
    intraStateTaxes: {
      type: [
        new mongoose.Schema({
          taxId: { type: mongoose.Schema.Types.ObjectId },
          taxRegistrarName: { type: String },
          taxPercentage: { type: Number },
          taxGroup: { type: String }
        }, { _id: false })
      ],
      required: false,
      default: undefined
    },
    interStateTaxes: {
      type: [
        new mongoose.Schema({
          taxId: { type: mongoose.Schema.Types.ObjectId },
          taxRegistrarName: { type: String },
          taxPercentage: { type: Number },
          taxGroup: { type: String }
        }, { _id: false })
      ],
      required: false,
      default: undefined
    },
    interNationalTaxes: {
      type: [
        new mongoose.Schema({
          taxId: { type: mongoose.Schema.Types.ObjectId },
          taxRegistrarName: { type: String },
          taxPercentage: { type: Number },
          taxGroup: { type: String }
        }, { _id: false })
      ],
      required: false,
      default: undefined
    },
  },


  productIdentifier: {
    type: String,
    required: [true, "productIdentifier is required"]
  },
  basePurchasePrice: {
    type: Number,
    required: false
  },
  baseSellingPrice: {
    type: Number,
    required: false,
    default: null
  },
  unitMaximumRetailPrice: {
    type: Number,
    required: false,
    default: null
  },

  // ROI calculation fields
  grossROIAmount: {
    type: Number,
    required: false,
    default: null
  },
  grossROIPercentage: {
    type: Number,
    required: false,
    default: null
  },
  netROIAmount: {
    type: Number,
    required: false,
    default: null
  },
  netROIPercentage: {
    type: Number,
    required: false,
    default: null
  },

  scanCodes: {
    type: Array,
    required: false,
    default: null
  },

  applyQuantityDiscount: {
    type: Boolean,
    default: undefined
  },
  toAllCustomers: {
    type: Boolean,
    default: undefined
  },
  customersMapped: {
    type: new mongoose.Schema({
      customerGroups: [{ type: mongoose.Schema.Types.ObjectId }],
      customers: [{ type: mongoose.Schema.Types.ObjectId }],
    }),
    required: false,
    default: undefined
  },
  quantityDiscounts: {
    type: [
      new mongoose.Schema({
        minQuantity: { type: Number },
        isFlatDiscount: { type: Boolean },
        discountValue: { type: Number }
      }),
    ],
    required: false,
    default: undefined
  },

  isReturnable: {
    type: Boolean,
    required: true,
    default: false
  },
  isAllowedOpenPackReturn: {
    type: Boolean,
    default: false
  },

  toAllWarehouses: {
    type: Boolean,
    required: true,
    default: false
  },
  warehouseWiseMinMaxUcap: [
    {
      type: new mongoose.Schema({
        warehouseId: { type: mongoose.Schema.Types.ObjectId },
        minimumStock: { type: Number },
        maximumStock: { type: Number },
        upperCapMaximunStock: { type: Number },
      })
    }
  ],
  // warehousesMapped: {
  //   // type: [{ type: mongoose.Schema.Types.ObjectId }],
  //   [ {type: mongoose.Schema.Types.ObjectId }],
  //   required: false,
  //   default: undefined
  // },
  warehousesMapped: [ {type: mongoose.Schema.Types.ObjectId }],

  toAllStores: {
    type: Boolean,
    required: false,
    default: undefined
  },
  storesMapped: [ {type: mongoose.Schema.Types.ObjectId }],
  storeWiseMinMaxUcap: [
    {
      type: new mongoose.Schema({
        storeId: { type: mongoose.Schema.Types.ObjectId },
        minimumStock: { type: Number },
        maximumStock: { type: Number },
        upperCapMaximunStock: { type: Number },
      })
    }
  ],

  isExpirable: { type: Boolean, required: false },
  selfLifeDays: { type: Number, default: null },
  selfLifeIn: { type: String },// Days, Months
  defaultMarkupPercentage: { type: Number, default: null },
  minSelfLifeDays: { type: Number, default: null },
  minselfLifeIn: { type: String },// Days, Months
  allowStockConversion: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  processedByScript: { type: Boolean, default: false },
  isDeleteLocked: { type: Boolean, default: false },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean },
}, { versionKey: false });

const Product = mongoose.model('master_products', productSchema);
const ProductSecondary = secondaryDB.model('master_products', productSchema);



/// ProductActivity
const productActivitySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: [true, "productId is required"] },
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

const ProductActivity = activitiesDB.model('master_product_activities', productActivitySchema);
const ProductActivitySecondary = activitiesSecondaryDB.model('master_product_activities', productActivitySchema);



/**
 * Activity Schema for Validation
 */
const productActivityJoiSchema = Joi.object({
  productId: Joi.object().required(),
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
  "combos": [
    { "field": "comboBuyProducts.productId", "dataType": "String" },
    { "field": "comboGetProducts.productId", "dataType": "String" },
  ],
  "combo_activities": [
    { "field": "what.oldValues.comboBuyProducts.productId", "dataType": "String" },
    { "field": "what.oldValues.comboGetProducts.productId", "dataType": "String" },
    { "field": "what.newValues.comboBuyProducts.productId", "dataType": "String" },
    { "field": "what.newValues.comboGetProducts.productId", "dataType": "String" },
  ],
  "discounts": [
    { "field": "productsMapped.products", "dataType": "Array" },
  ],
  "discount_activities": [
    { "field": "what.oldValues.productsMapped.products", "dataType": "Array" },
    { "field": "what.newValues.productsMapped.products", "dataType": "Array" },
  ],
  "stock_requests": [
    { "field": "requestProducts.masterProductId", "dataType": "String" }
  ],
  "stock_request_acitivities": [
    { "field": "what.oldValues.requestProducts.masterProductId", "dataType": "String" },
    { "field": "what.newValues.requestProducts.masterProductId", "dataType": "String" }
  ],
  "purchase_orders": [
    { "field": "products.productCategoryId", "dataType": "String" },
  ],
  // "purchase_order_activities": [
  //   { "field": "what.oldValues.products.productCategoryId", "dataType": "String" },
  //   { "field": "what.newValues.products.productCategoryId", "dataType": "String" }
  // ],
  "products": [
    { "field": "masterProductId", "dataType": "String" },
  ],
  "product_activities": [
    { "field": "what.oldValues.masterProductId", "dataType": "String" },
  ],
  "inwards": [
    { "field": "inwardProducts.masterProductId", "dataType": "String" }
  ],
  "inward_activities": [
    { "field": "what.newValues.inwardProducts.masterProductId", "dataType": "String" },
    { "field": "what.oldValues.inwardProducts.masterProductId", "dataType": "String" }
  ],
  "stock_conversions": [
    { "field": "fromStockProducts.masterProductId", "dataType": "String" },
    { "field": "toStockProducts.masterProductId", "dataType": "String" },
  ],
  "stock_conversion_activities": [
    { "field": "fromStockProducts.masterProductId", "dataType": "String" },
    { "field": "toStockProducts.masterProductId", "dataType": "String" },
  ]
};


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
  return Product.find(findCondition, documentFields);
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
    Joi.validate(activityData, productActivityJoiSchema, { abortEarly: false }).then(async (activityData) => {
      await ProductActivity(activityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
    }).catch((error) => { reject(error); });
  });
}

/// remove record.
const removeCollection = function (collectionId, data) {


  return new Promise(function (resolve, reject) {

    let where = { _id: collectionId };
    Product.findOne(where, {}).then(async (selectedData) => {

      if (selectedData && selectedData.isDeleteLocked == false) {

        if (data.approvalRequired) {

          var approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "productId": selectedData._id,
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
                "collectionName": "master_products",
                "collectionId": selectedData._id,
                "activityId": history._id,
                "approvalType": history.approvalType,
                "approvalTitle": selectedData.productName,
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
                ProductActivity.findByIdAndRemove({ '_id': history._id },
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
          const productModel = appHelper.getModel("products");
          const comboModel = appHelper.getModel("combos");
          const discountModel = appHelper.getModel("discounts");
          const purchaseOrderModel = appHelper.getModel("purchase_orders");
          const inwardModel = appHelper.getModel("inwards");
          const stockRequestModel = appHelper.getModel("stock_requests");
          const stockConversionModel = appHelper.getModel("stock_conversions");

          let requiredModels = {
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
                if (promiseResults[i] && isReferenceAvailable == false) {
                  isReferenceAvailable = true;
                }
              }
            }).catch((e) => { reject(e); });
          }

          /// Create Activity data.
          let activityLog = {
            "productId": selectedData._id,
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
              removeFn = Product.findOneAndUpdate({ '_id': selectedData._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = Product.findByIdAndRemove({ '_id': selectedData._id });
            }
            /// Remove product data
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "Product removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else if (selectedData.isDeleteLocked == false) {

        reject({
          error: "Product not allowed to delete!",
          errorCode: "DELETE_NOT_ALLOWED",
        });

      } else {

        reject({
          error: "Product not found!",
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
      const discountModel = appHelper.getModel("discounts");
      const comboModel = appHelper.getModel("combos");
      const purchaseOrderModel = appHelper.getModel("purchase_orders");
      const stockRequestModel = appHelper.getModel("stock_requests");
      const inwardModel = appHelper.getModel("inwards");
      const stockConversionModel = appHelper.getModel("stock_conversions");

      let requiredModels = {
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

        await Product.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isReferenceAvailable } }).then((afterLockData) => {
          if (afterLockData) resolve(afterLockData.isDeleteLocked)
          else resolve(null);
        }).catch((e) => { reject(e); });

      } else {
        resolve(null);
      }

    } else {

      await Product.findOneAndUpdate({ _id: collectionId }, { $set: { isDeleteLocked: isDeleteLocked } }).then((afterLockData) => {
        if (afterLockData) resolve(afterLockData.isDeleteLocked);
        else resolve(null);
      }).catch((e) => { reject(e); });

    }

  });

}

module.exports = {
  collection: Product,
  readOnlyCollection: ProductSecondary,
  activityCollection: ProductActivity,
  readOnlyActivityCollection: ProductActivitySecondary,
  findAll: findAll,
  createActivity: createActivity,
  activityKey: "productId",
  removeCollection: removeCollection,
  availableReferences: availableReferences,
  commonWhereConditions: commonWhereConditions,
  updateIsDeleteLocked: updateIsDeleteLocked
};


