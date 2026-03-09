const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const salesOrderSchema = new mongoose.Schema({
    offlineId: { type: String, default: null, required: false },
    offlineBillNumber: { type: String, default: null, required: false },
    storeId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    parentSalesOrder: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    salesOrderType: { type: String, required: true }, //SalesOrder
    tempSalesOrderNumber: { type: String, required: true },
    salesOrderNumber: { type: String, required: true },
    salesOrderDate: { type: Date, required: true },
    saleIncharge: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    customer: {
        customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
        customerType: { type: String, required: true },
        displayName: { type: String, required: true },
        customerName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        emailAddress: { type: String },
        billingAddress: {
            attention: { type: String },
            addressLine1: { type: String, required: true },
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
            pinCode: { type: String },
            country: {
                countryId: { type: mongoose.Schema.Types.ObjectId },
                name: { type: String },
                countryCode: { type: String }
            },
        },
        deliveryAddress: {
            attention: { type: String },
            addressLine1: { type: String, required: true },
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
            pinCode: { type: String },
            country: {
                countryId: { type: mongoose.Schema.Types.ObjectId },
                name: { type: String },
                countryCode: { type: String }
            },
            mapLocation: {
                latitude: { type: Number, required: false },
                longitude: { type: Number, required: false }
            }
        },
        GSTIN: { type: String }
    },
    billProducts: [{
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
        masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productCode: { type: String, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productName: { type: String, required: true },
        productDescription: { type: String },
        displayName: { type: String },
        invoiceDisplayName: { type: String },
        HSNCode: { type: String, required: true },
        inventoryType: { type: String },
        scanCodes: [{ type: String, required: true }],
        batchNumber: { type: String, required: true },
        packedDate: { type: Date, required: true },
        expiryDate: { type: Date, required: true },
        unit: {
            unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
            unitName: { type: String },
            unitSymbol: { type: String },
            unitSize: { type: Number }
        },
        isVariableSize: { type: Boolean, required: true, default: false },
        productQuantity: { type: Number, required: true },
        baseSellingPrice: { type: Number, required: true },
        unitMaximumPrice: { type: Number, required: true },
        productDiscounts: [{
            discountType: { type: String, required: true },
            discountName: { type: String, required: true },
            isFlatDiscount: { type: Boolean, required: true, default: false },
            discountValue: { type: Number, required: true }
        }],
        totalDiscountPrice: { type: Number },
        taxes: [{
            taxId: { type: mongoose.Schema.Types.ObjectId, required: true },
            taxName: { type: String, required: true },
            taxPercentage: { type: Number, required: true }
        }],
        comboProducts: [{
            productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
            masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
            productCode: { type: String, required: true },
            scanCodes: [{ type: String }],
            isMandatory: { type: Boolean, required: true, default: false },
            quantity: { type: Number, required: true },
            isFlatValue: { type: Boolean, required: true, default: false },
            discountValue: { type: Number, required: true }
        }],
        totalProductPrice: { type: Number, required: true },
        stockHolder: {
            branchtype: { type: String, required: true },
            storeId: { type: mongoose.Schema.Types.ObjectId },
            storeName: { type: String },
            warehouseId: { type: mongoose.Schema.Types.ObjectId },
            warehouseName: { type: String }
        }
    }],
    productSubTotal: { type: Number, required: true }, /// Total of all products without discount & taxes
    billDiscounts: [{
        discountType: { type: String, required: true },
        discountName: { type: String, required: true },
        isFlatDiscount: { type: Boolean, required: true, default: false },
        discountValue: { type: Number, required: true }
    }],
    totalDiscountAmount: { type: Number, required: true },/// Total amount of all discounts(includes product based & bill based discounts)
    totalTaxableAmount: { type: Number, required: true },/// Total amount with all discounts
    totalTaxAmount: { type: Number, required: true },/// Total amount for tax calculation
    billTaxSummary: [{
        taxName: { type: String, required: true },
        taxPercentage: { type: Number, required: true },
        taxAmount: { type: Number, required: true }
    }],
    totalBillAmount: { type: Number, required: true },
    frightCharge: { type: Number, required: true },
    otherCharges: { type: Number, required: true },
    billRoundOff: { type: Number, required: true },/// Round off amount
    netPayableAmount: { type: Number, required: true },/// Total payable includes all taxes, discounts, frightcharges, othercharges and bill round off
    totalSavedAmount: { type: Number, required: true },
    billNotes: { type: String },
    billCurrency: {
        currencyCode: { type: String },
        currencySymbol: { type: String }
    },
    saleOrderValidUpto: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false }
}, { versionKey: false });

const model = mongoose.model('sale_orders', salesOrderSchema);
const modelSecondary = secondaryDB.model('sale_orders', salesOrderSchema);

/// SalesOrder request Activity
const collectionActivitySchema = new mongoose.Schema({
    salesOrderId: { type: mongoose.Schema.Types.ObjectId, required: [true, "salesOrderId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('sale_order_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('sale_order_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const salesOrderActivityJoiSchema = Joi.object({
    salesOrderId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool()
});

/// create activity
const createActivity = async function (salesOrderActivityData) {
    if (salesOrderActivityData.what.oldValues && salesOrderActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(salesOrderActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(salesOrderActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                salesOrderActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                salesOrderActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // salesOrderActivityData.what.oldValues === null && salesOrderActivityData.what.newValues === null ? delete salesOrderActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(salesOrderActivityData, salesOrderActivityJoiSchema, { abortEarly: false }).then(async (salesOrderActivityData) => {
            await modelActivity(salesOrderActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};

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
                        "salesOrderId": selectedData._id,
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
                        "salesOrderId": selectedData._id,
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
                                message: "Sales order removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "Sales order not found!",
                    errorCode: "VALIDATION_ERROR",
                });

            }

        }).catch((error) => { reject(error); });

    });

}

module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    activityCollection: modelActivity,
    createActivity: createActivity,
    removeCollection: removeCollection,
}