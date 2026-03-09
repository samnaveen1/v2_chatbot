const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const transitSchema = new mongoose.Schema({
    transitNumber: { type: String, required: true },
    transitDate: { type: Date, required: true },
    transportVehicleId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    transitRouteId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    transitType: { type: String, required: true },  //WithoutCompanyVehicle WithCompanyVehicle
    transitFrom: { type: String, required: true },
    transitFromId: { type: mongoose.Schema.Types.ObjectId, required: true }, //StoreId WarehouseId VendorId CustomerId
    transitFromMap: {
        latitude: { type: Number, required: false, default: null },
        longitude: { type: Number, required: false, default: null }
    },
    transitTo: { type: String, required: false }, // required: true
    transitToId: { type: mongoose.Schema.Types.ObjectId, required: false }, //StoreId WarehouseId VendorId CustomerId "required: true"
    transitToMap: {
        latitude: { type: Number, required: false, default: null }, // "required: true"
        longitude: { type: Number, required: false, default: null } // "required: true"
    },
    outwardId: { type: mongoose.Schema.Types.ObjectId, required: true },
    transitProducts: [{
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
        masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        scanCodes: [{ type: String, required: false }], //Need to check on this // When fixing the flow need to check the field is mandatory or not required: true
        productQuantity: { type: Number, required: true },
        totalWeightInKG: { type: Number },
        originStockType: { type: String, required: true },
        status: { type: String, required: true },
    }],
    outwardType: { type: String, required: true }, // StockTransfer ,SalesBill, VendorReturn, SalesInvoice
    outwardSubType: { type: String, default: null }, // StockIn, StockOut, CustomerDelivery, TakeHome
    transitStatus: { type: String, required: true },//assigned, loaded, unloaded, delivered, cancelled, completed(It'll complete only after the transit inward is completed)
    transitComments: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, { versionKey: false });

const model = mongoose.model('transits', transitSchema);
const modelSecondary = secondaryDB.model('transits', transitSchema);

/// Transit Activity
const collectionActivitySchema = new mongoose.Schema({
    transitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "transitId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('transit_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('transit_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const transitActivityJoiSchema = Joi.object({
    transitId: Joi.object().required(),
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
const createActivity = async function (transitActivityData) {
    if (transitActivityData.what.oldValues && transitActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(transitActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(transitActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                transitActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                transitActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // transitActivityData.what.oldValues === null && transitActivityData.what.newValues === null ? delete transitActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(transitActivityData, transitActivityJoiSchema, { abortEarly: false }).then(async (transitActivityData) => {
            await modelActivity(transitActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
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
                        "transitId": selectedData._id,
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
                                "collectionName": "transits",
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
                        "transitId": selectedData._id,
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
                                message: "Transit removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "Transit not found!",
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
    activityKey: "transitId"
}