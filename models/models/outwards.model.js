const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const outwardSchema = new mongoose.Schema({
    outWardAt: {
        branchType: { type: String, required: true }, //Store, Warehouse
        storeId: { type: mongoose.Schema.Types.ObjectId },
        storeName: { type: String },
        warehouseId: { type: mongoose.Schema.Types.ObjectId },
        warehouseName: { type: String }
    },

    outwardNumber: { type: String, required: true },
    outwardDate: { type: Date, default: Date.now },
    outwardType: { type: String, required: true }, // StockTransfer ,SalesBill, VendorReturn, SalesInvoice
    outwardSubType: { type: String, default: null }, // StockIn, StockOut, CustomerDelivery, TakeHome

    stockRequestId: { type: mongoose.Schema.Types.ObjectId, default: null },
    stockRequestNumber: { type: String, default: null },

    salesBillId: { type: mongoose.Schema.Types.ObjectId, default: null }, // It contains both sales bill & sale invoice id's 
    salesBillNumber: { type: String, default: null },
    podBillNumber: { type: String, default: null },
    salesInvoiceNumber: { type: String, default: null },
    saleBillType: { type: String, default: null },

    returnOrderId: { type: mongoose.Schema.Types.ObjectId, default: null },
    returnOrderNumber: { type: String, default: null },

    phoneNumber: { type: String },
    emailAddress: { type: String },
    GSTIN: { type: String },

    outwardProducts: [{
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
        masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        scanCodes: [{ type: String }],
        productCode: { type: String, required: false },
        productQuantity: { type: Number, required: true },
        totalWeightInKG: { type: Number },
        originStockType: { type: String, required: true },
        unitMaximumPrice: { type: Number, required: false },
        baseSellingPrice: { type: Number, required: false },
        sellingPrice: { type: Number, required: false },
        sellingPriceWithDiscount: { type: Number, required: false },
        status: { type: String, default: "pending" } // pending, in-transit, completed
    }],
    totalQuantity: { type: Number },
    deliveryName: { type: String, required: true },
    deliveryWarehouseId: { type: mongoose.Schema.Types.ObjectId, default: null },
    deliveryStoreId: { type: mongoose.Schema.Types.ObjectId, default: null },
    deliveryAddresses: {
        attention: { type: String, default: null },
        addressLine1: { type: String, default: null },
        addressLine2: { type: String, default: null },
        city: {
            cityId: { type: mongoose.Schema.Types.ObjectId, default: null },
            name: { type: String, default: null }
        },
        state: {
            stateId: { type: mongoose.Schema.Types.ObjectId, default: null },
            name: { type: String, default: null },
            stateCode: { type: String, default: null }
        },
        country: {
            countryId: { type: mongoose.Schema.Types.ObjectId, default: null },
            name: { type: String, default: null }
        },
        pinCode: { type: String, default: null },
        mapLocation: {
            latitude: { type: Number, required: false, default: null },
            longitude: { type: Number, required: false, default: null }
        },
    },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    outwardStatus: { type: String, default: "pending" }, // pending, assigned, onTrip, waitingToUnload, delivered, completed, cancelled
    transitType: { type: String, default: null }, // Active, New, WithoutCompanyVehicle
    tripId: { type: mongoose.Schema.Types.ObjectId, default: null },
    tripNumber: { type: String, default: null },
    tripStartDate: { type: Date },
    tripTransitStatus: { type: String, default: null }, // pending, assigned, onTrip, waitingToUnload, delivered, completed, cancelled
    tripComments: { type: String, default: null },
    notes: { type: String, default: null },
    inwardStatus: { type: String, default: "pending" }, // pending, completed
    vehicle: {
        vehicleId: { type: mongoose.Schema.Types.ObjectId, required: false },
        vehicleName: { type: String, required: false },
        vehicleNumber: { type: String, required: false },
        vehicleCapacity: {
            value: { type: Number, required: false },
            unit: {
                unitId: { type: mongoose.Schema.Types.ObjectId },
                unitName: { type: String, required: false },
                unitSymbol: { type: String, required: false }
            }
        },
    },
    driver: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false },
        mobile: { type: String, required: false },
        email: { type: String, required: false },
    },
    deliveryDate: { type: Date },
    verifiedDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    cancelledDate: { type: Date },
    isDeleted: { type: Boolean }
}, { versionKey: false })

const model = mongoose.model('outwards', outwardSchema);
const modelSecondary = secondaryDB.model('outwards', outwardSchema);

/// outward Activity
const collectionActivitySchema = new mongoose.Schema({
    outwardId: { type: mongoose.Schema.Types.ObjectId, required: [true, "outwardId is required"] },
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

const modelActivity = activitiesDB.model('outward_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('outward_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const outwardActivityJoiSchema = Joi.object({
    outwardId: Joi.object().required(),
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
const createActivity = async function (outwardActivityData, mongoSession = null) {
    if (outwardActivityData.what.oldValues && outwardActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(outwardActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(outwardActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                outwardActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                outwardActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // outwardActivityData.what.oldValues === null && outwardActivityData.what.newValues === null ? delete outwardActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(outwardActivityData, outwardActivityJoiSchema, { abortEarly: false }).then(async (outwardActivityData) => {
            await modelActivity(outwardActivityData).save({session: mongoSession}).then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
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
                        "outwardId": selectedData._id,
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
                                "collectionName": "outwards",
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
                        "outwardId": selectedData._id,
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
                                message: "Outward removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "Outward not found!",
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
    activityKey: "outwardId"
}