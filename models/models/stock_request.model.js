const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const stockRequestSchema = new mongoose.Schema({
    requestType: { type: String, required: true }, // StockIn, StockOut
    requestNumber: { type: String, required: true },
    requestDate: { type: Date, required: true },
    requestFrom: {
        branchType: { type: String, required: true }, //Store, Warehouse
        storeId: { type: mongoose.Schema.Types.ObjectId },
        storeName: { type: String },
        warehouseId: { type: mongoose.Schema.Types.ObjectId },
        warehouseName: { type: String },
    },
    requestProducts: [{
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
        masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, default: null },
        scanCode: { type: String, default: null },
        inventoryType: { type: String, required: false },
        stockType: { type: String, required: false, default: null },
        unit: {
            unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
            unitName: { type: String },
            unitSymbol: { type: String },
            unitSize: { type: Number }
        },
        isVariableSize: { type: Boolean, required: false, default: false },
        batchNumber: { type: String },
        brand: {
            type: new mongoose.Schema({
                brandId: { type: mongoose.Schema.Types.ObjectId, required: [true, "brandId is required"] },
                brandName: { type: String }
            }, { _id: false }),
            required: false,
        },
        requestQuantity: { type: Number, required: true },
        reason: { type: String },
        createdBy: {
            userId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
            name: { type: String, required: false, default: null }
        },
        approvedQuantity: { type: Number },
        approvedBy: {
            userId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
            name: { type: String, required: false, default: null }
        },
        assignedBy: {
            userId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
            name: { type: String, required: false, default: null }
        },
        assignedTo: [
            {
                branchType: { type: String, required: true },
                storeId: { type: mongoose.Schema.Types.ObjectId },
                storeName: { type: String },
                warehouseId: { type: mongoose.Schema.Types.ObjectId },
                warehouseName: { type: String },
                stockType: { type: String }, // Return, Sale, Converted, Scrap
                assignedQuantity: { type: Number, required: true },
                assignedProducts: [{
                    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
                    batchNumber: { type: String },
                    scanCodes: [{ type: String }],
                    productQuantity: { type: Number, required: true }
                }],
                outwardId: { type: mongoose.Schema.Types.ObjectId, required: false },
                deliveredQuantity: { type: Number, required: false },
                deliveredProducts: { type: Number, required: false },
            }
        ]
    }],
    approvalStatus: { type: String, required: false },//default: "auto approved"
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    stockStatus: { type: String, required: true, default: "draft" }, // draft, active, completed, cancelled, closed
    totalQuantity: { type: Number },
    requestPriority: { type: String, default: "Normal" }, //Low, Normal, Urgent
    requestReasonId: { type: mongoose.Schema.Types.ObjectId },
    rejectReasonId: { type: mongoose.Schema.Types.ObjectId },
    rejectReason: { type: String },
    rejectComment: { type: String },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    approvedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        name: { type: String, required: false, default: null }
    },
    approvalDate: { type: Date, default: Date.now, required: false },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
    isDeleted: { type: Boolean }
}, { versionKey: false });

const model = mongoose.model('stock_requests', stockRequestSchema);
const modelSecondary = secondaryDB.model('stock_requests', stockRequestSchema);


/// Stock request Activity
const collectionActivitySchema = new mongoose.Schema({
    stockRequestId: { type: mongoose.Schema.Types.ObjectId, required: [true, "stockRequestId is required"] },
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

const modelActivity = activitiesDB.model('stock_request_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('stock_request_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const stockRequestActivityJoiSchema = Joi.object({
    stockRequestId: Joi.object().required(),
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
const createActivity = async function (stockRequestActivityData) {
    if (stockRequestActivityData.what.oldValues && stockRequestActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(stockRequestActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(stockRequestActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                stockRequestActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                stockRequestActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // stockRequestActivityData.what.oldValues === null && stockRequestActivityData.what.newValues === null ? delete stockRequestActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(stockRequestActivityData, stockRequestActivityJoiSchema, { abortEarly: false }).then(async (stockRequestActivityData) => {
            await modelActivity(stockRequestActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
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
                        "stockRequestId": selectedData._id,
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
                                "collectionName": "stock_requests",
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
                        "stockRequestId": selectedData._id,
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
                                message: "Stock request removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "Stock request not found!",
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
    activityKey: "stockRequestId",
}