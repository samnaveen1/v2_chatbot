const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const stockConversionSchema = new mongoose.Schema({
    stockConversionNumber: { type: String, required: false },
    stockConversionDate: { type: Date, default: Date },
    stockConversionAt: {
        branchType: { type: String, required: false },
        storeId: { type: mongoose.Schema.Types.ObjectId },
        storeName: { type: String },
        warehouseId: { type: mongoose.Schema.Types.ObjectId },
        warehouseName: { type: String }
    },
    stockConverstionReason: { type: String, required: false },
    fromStockTotalSize: { type: Number, required: false },
    toStockTotalSize: { type: Number, required: false },
    fromStockTotalUnitSize: { type: Number, required: false },
    toStockTotalUnitSize: { type: Number, required: false },
    fromStockTotalUnitSizeSymbol: { type: String, required: false },
    toStockTotalUnitSizeSymbol: { type: String, required: false },
    stockConversionDeviation: { type: Number, required: false },
    stockConversionDeviationSymbol: { type: String, required: false },
    fromStockProducts: [{
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: false },
        masterProductId: { type: mongoose.Schema.Types.ObjectId },
        productName: { type: String, required: false },
        displayName: { type: String },
        productCategoryName: { type: String, required: false },
        productId: { type: mongoose.Schema.Types.ObjectId },
        scanCode: { type: String },
        inventoryType: { type: String, required: false },
        stockType: { type: String, required: false },
        unitMaximumRetailPrice: { type: Number, default: null },
        unit: {
            unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
            unitName: { type: String },
            unitSymbol: { type: String },
            unitSize: { type: Number }
        },
        isVariableSize: { type: Boolean, required: false, default: false },
        batchNumber: { type: String },
        quantity: { type: Number, required: false },
        createdBy: {
            userId: { type: mongoose.Schema.Types.ObjectId },
            name: { type: String }
        },
        barcodeStatus: { type: String },
        storageStatus: { type: String }
    }],
    toStockProducts: [{
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: false },
        productCategoryName: [{ type: String, default: null }],
        masterProductId: { type: mongoose.Schema.Types.ObjectId },
        productName: { type: String, required: false },
        displayName: { type: String },
        productCategoryName: { type: String, required: false },
        productId: { type: mongoose.Schema.Types.ObjectId, default: null },
        scanCodes: [{ type: String, default: null }],
        hasVendorScanCode: { type: Boolean, default: false },
        isUniqueScanCode: { type: Boolean, default: false },
        inventoryType: { type: String, required: false },
        stockType: { type: String, required: false },
        unit: {
            unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
            unitName: { type: String },
            unitSymbol: { type: String },
            unitSize: { type: Number }
        },
        printTemplateId: { type: mongoose.Schema.Types.ObjectId, default: null },
        isVariableSize: { type: Boolean, required: false, default: false },
        batchNumber: { type: String },
        packedDate: { type: Date, default: null },
        expiryDate: { type: Date, default: null },
        unitMaximumRetailPrice: { type: Number, default: null },
        basePurchasePrice: { type: Number, default: null },
        baseSellingPrice: { type: Number, default: null },
        sellingPrice: { type: Number, default: null },
        grossROIAmount: { type: Number, default: null },
        grossROIPercentage: { type: Number, default: null },
        netROIAmount: { type: Number, default: null },
        netROIPercentage: { type: Number, default: null },

        // Purchase taxes array
        purchaseTaxes: [{ 
            taxId: { type: mongoose.Schema.Types.ObjectId },
            taxRegistrarName: { type: String },
            taxPercentage: { type: Number },
            taxGroup: { type: String }
        }],

        // Sales taxes array  
        salesTaxes: [{
            taxId: { type: mongoose.Schema.Types.ObjectId },
            taxRegistrarName: { type: String },
            taxPercentage: { type: Number },
            taxGroup: { type: String }
        }],

        quantity: { type: Number, required: false, default: null },
        createdBy: {
            userId: { type: mongoose.Schema.Types.ObjectId },
            name: { type: String }
        },
        storage: [{
            stockType: { type: String, default: null }, // Sale, Damaged
            cellName: { type: String, default: null },
            quantity: { type: Number, default: null },
            blockId: { type: mongoose.Schema.Types.ObjectId, default: null },
            cellId: { type: mongoose.Schema.Types.ObjectId, default: null },
        }],
        barcodeStatus: { type: String, default: "pending" }, //pending, completed
        storageStatus: { type: String, default: "pending" } //pending, completed
    }],
    overAllBarcodeStatus: { type: String, default: "pending" },
    overAllStorageStatus: { type: String, default: "pending" },
    stockConversionWastageQuantity: { type: Number, default: 0 },
    stockConversionWastageNotes: { type: String, required: false, default: null },
    status: { type: String, required: false, default: "draft" },
    processedByScript: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String }
    },
    updatedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, default: null },
        name: { type: String, default: null }
    },
    approvalStatus: { type: String, required: false, default: "pending" },
    rejectReason: { type: String },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, { versionKey: false });

const model = mongoose.model('stock_conversions', stockConversionSchema);
const modelSecondary = secondaryDB.model('stock_conversions', stockConversionSchema);


/// Stock conversions Activity
const collectionActivitySchema = new mongoose.Schema({
    stockConversionId: { type: mongoose.Schema.Types.ObjectId, required: [true, "stockConversionId is required"] },
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

const modelActivity = activitiesDB.model('stock_conversion_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('stock_conversion_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const stockConversionActivityJoiSchema = Joi.object({
    stockConversionId: Joi.object().required(),
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
const createActivity = async function (stockConversionActivityData) {
    if (stockConversionActivityData.what.oldValues && stockConversionActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(stockConversionActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(stockConversionActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                stockConversionActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                stockConversionActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // stockConversionActivityData.what.oldValues === null && stockConversionActivityData.what.newValues === null ? delete stockConversionActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(stockConversionActivityData, stockConversionActivityJoiSchema, { abortEarly: false }).then(async (stockConversionActivityData) => {
            await modelActivity(stockConversionActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
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
                        "stockConversionId": selectedData._id,
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
                                "collectionName": "stock_conversions",
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
                                    message: "Delete approval request created successfully!",
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
                        "stockConversionId": selectedData._id,
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
                                message: "Stock conversion removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "Stock conversion not found!",
                    errorCode: "VALIDATION_ERROR",
                });

            }

        }).catch((error) => { reject(error); });

    });

}


module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    createActivity: createActivity,
    removeCollection: removeCollection,
    activityKey: "stockConversionId",
}