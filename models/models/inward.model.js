const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const inwardSchema = new mongoose.Schema({
    inwardAt: {
        branchType: { type: String, default: null },
        storeId: { type: mongoose.Schema.Types.ObjectId },
        storeName: { type: String },
        warehouseId: { type: mongoose.Schema.Types.ObjectId },
        warehouseName: { type: String }
    },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false }
    },
    dcAttachments: [{
        fileName: { type: String, required: false, default: null },
        displayName: { type: String, required: false, default: null },
    }],
    inwardNumber: { type: String, default: null },
    inwardDate: { type: Date, default: null },
    inwardType: { type: String, required: true }, // Purchase, StockTransfer, CustomerReturn
    vendorType: { type: String }, // Internal, External
    vendorId: { type: mongoose.Schema.Types.ObjectId },
    vendorAddress: {
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
        }
    },
    purchaseOrderIds: [{ type: mongoose.Schema.Types.ObjectId }],
    stockTransferIds: [{ type: mongoose.Schema.Types.ObjectId }],
    purchaseInvoiceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    invoiceNumber: { type: String },
    vehicleNumber: { type: String },
    transportNumber: { type: String },
    isDiscountBeforeTax: { type: Boolean },
    freightCharge: { type: Number, default: null },
    deliveryChallanNumber: { type: String, default: null },
    deliveryChallanDate: { type: Date, default: null },
    inwardProducts: [
        {
            type: new mongoose.Schema({
                rowIndexVal: { type: Number },
                productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
                masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
                productCategoryName: { type: String, default: null },
                inventoryType: { type: String },
                unit: {
                    unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
                    unitName: { type: String },
                    unitSymbol: { type: String },
                    unitSize: { type: Number }
                },
                brand: {
                    type: new mongoose.Schema({
                        brandId: { type: mongoose.Schema.Types.ObjectId, required: [true, "brandId is required"] },
                        brandName: { type: String }
                    }, { _id: false }),
                    required: false,
                },
                taxes: [{
                    taxId: { type: mongoose.Schema.Types.ObjectId },
                    taxGroup: { type: String },
                    taxRegistrarName: { type: String },
                    taxPercentage: { type: Number, required: true }
                }],
                purchaseTaxes: [{
                    taxId: { type: mongoose.Schema.Types.ObjectId },
                    taxGroup: { type: String },
                    taxRegistrarName: { type: String },
                    taxPercentage: { type: Number, required: true }
                }],
                salesTaxes: [{
                    taxId: { type: mongoose.Schema.Types.ObjectId },
                    taxGroup: { type: String },
                    taxRegistrarName: { type: String },
                    taxPercentage: { type: Number, required: true }
                }],
                productItemId: { type: mongoose.Schema.Types.ObjectId, default: null },
                poId: { type: mongoose.Schema.Types.ObjectId, default: null },
                poNumber: [{ type: String, default: null }],
                stockTransferId: { type: mongoose.Schema.Types.ObjectId, default: null },
                poStock: { type: Number, default: 0 },
                receivedStock: { type: Number, default: 0 },
                missingStock: { type: Number, default: 0 },
                approvedQuantity: { type: Number, default: 0 },
                giftStock: { type: Number, default: 0 },
                bundleGiftItem: { type: String, default: null },
                damagedStock: { type: Number, default: 0 },
                stockDeviation: { type: Number, default: 0 },
                basePurchasePrice: { type: Number, required: true },
                unitDiscountPercentage: { type: Number },
                discountName: { type: String, default: null },
                discountAmount: { type: Number, default: 0 },
                discountPercentage: { type: Number, default: 0 },
                packedDate: { type: Date, default: null },
                expiryDate: { type: Date, default: null },
                hasVendorScanCode: { type: Boolean, default: null },
                isUniqueScanCode: { type: Boolean, default: null },
                isAlreadyGeneratedScanCode: { type: Boolean, required: false, default: null },
                mismatchFlag: { type: Boolean, required: false, default: false },
                batchNumber: { type: String, default: null },
                scanCodeBatchNumber: { type: String, default: null },
                unitMaximumRetailPrice: { type: Number, default: null },
                manufacturerBatchNumber: { type: String, required: false },
                manufacturerBarcode: { type: String, required: false },
                masterScanCode: { type: String, default: null },
                startSerial: { type: Number, default: null },
                endSerial: { type: Number, default: null },
                scanCodes: [{ type: String, default: null }],
                baseSellingPrice: { type: Number, default: null },
                sellingPrice: { type: Number, default: null },
                grossROIAmount: { type: String, default: null },
                grossROIPercentage: { type: String, default: null },
                netROIAmount: { type: String, default: null },
                netROIPercentage: { type: String, default: null },
                templateName: { type: String, default: null },
                templateId: { type: mongoose.Schema.Types.ObjectId, default: null },
                // rackId: { type: mongoose.Schema.Types.ObjectId, default: null },
                storage: [{
                    stockType: { type: String, default: null }, // Sale, Damaged
                    cellName: { type: String, default: null },
                    quantity: { type: Number, default: null },
                    blockId: { type: mongoose.Schema.Types.ObjectId, default: null },
                    cellId: { type: mongoose.Schema.Types.ObjectId, default: null },
                    storageBlockName: { type: String, default: null },
                }],
                // blockId: { type: mongoose.Schema.Types.ObjectId, default: null },
                isPurchaseOnly: { type: Boolean, required: false, default: false },
                isVariableSize: { type: Boolean, required: false, default: false },
                isExpirable: { type: Boolean, required: false, default: false },
            })
        }
    ],
    salesReturnId: { type: mongoose.Schema.Types.ObjectId },
    step1Status: { type: String, default: null },
    step2Status: { type: String, default: null },
    step3Status: { type: String, default: null },
    step4Status: { type: String, default: null },
    step5Status: { type: String, default: null },
    inwardStatus: { type: String, default: "draft" }, // draft, approval, completed
    approvalStatus: { type: String, required: false, default: "auto approved" }, // pending, approved, auto approved
    totalQuantity: { type: Number, default: null },
    // currentlyLockedBy: {type: String, default: null},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    processedByScript: { type: Boolean, default: false },
    collaborators: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, required: false },
            name: { type: String, required: false },
            _id: false
        },
    ]
}, { versionKey: false });

const model = mongoose.model('inwards', inwardSchema);
const readOnlyModel = secondaryDB.model('inwards', inwardSchema);

/// Inward Activity
const collectionActivitySchema = new mongoose.Schema({
    inwardId: { type: mongoose.Schema.Types.ObjectId, required: [true, "InwardId is required"] },
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

const modelActivity = activitiesDB.model('inward_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('inward_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const inwardActivityJoiSchema = Joi.object({
    inwardId: Joi.object().required(),
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

/// create activity
const createActivity = async function (inwardActivityData) {

    if (inwardActivityData.what.oldValues && inwardActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(inwardActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(inwardActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                inwardActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                inwardActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // inwardActivityData.what.oldValues === null && inwardActivityData.what.newValues === null ? delete inwardActivityData.what : null
            }
        })
    }

    return new Promise(function (resolve, reject) {

        if (inwardActivityData.what) {
            Joi.validate(inwardActivityData, inwardActivityJoiSchema, { abortEarly: false }).then(async (inwardActivityData) => {
                await modelActivity(inwardActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
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
        model.findOne(where, {}).then(async (selectedData) => {

            if (selectedData) {

                if (data.approvalRequired) {

                    var approvalModel = require('./approval.model');

                    /// Create activity log for approval request.
                    let activityLog = {
                        "inwardId": selectedData._id,
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
                                "collectionName": "inwards",
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
                        "inwardId": selectedData._id,
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
                                message: "Inward removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "Inward not found!",
                    errorCode: "VALIDATION_ERROR",
                });

            }

        }).catch((error) => { reject(error); });

    });

}

module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    activityKey: "inwardId",
    createActivity: createActivity,
    removeCollection: removeCollection,
}