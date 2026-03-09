const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const tripSchema = new mongoose.Schema({
    tripNumber: { type: String, required: true },
    tripName: { type: String, required: true },
    tripDate: { type: Date, required: true },
    vehicle: {
        vehicleId: { type: mongoose.Schema.Types.ObjectId, required: true },
        vehicleName: { type: String, required: true },
        vehicleNumber: { type: String, required: true },
        vehicleCapacity: {
            value: { type: Number, required: false, default: null },
            unit: {
                unitId: { type: mongoose.Schema.Types.ObjectId },
                unitName: { type: String, required: false, default: null },
                unitSymbol: { type: String, required: false, default: null }
            }
        },
    },
    driver: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        email: { type: String, required: false },
    },
    transitRouteId: { type: mongoose.Schema.Types.ObjectId, required: false },
    transitRouteName: { type: String, required: false },
    transitRouteType: { type: String, required: true }, //The isn't madatory for the this flow of the trip.
    transitPoints: [{
        mapLocation: {
            latitude: { type: Number, required: false },
            longitude: { type: Number, required: false }
        },
        transitPoint: {
            branchType: { type: String, required: true }, // Store, Warehouse, customerDelivery
            storeId: { type: mongoose.Schema.Types.ObjectId },
            storeName: { type: String },
            warehouseId: { type: mongoose.Schema.Types.ObjectId },
            warehouseName: { type: String },
            locationName: { type: String }
        },
        transitStopOrderNumber: { type: Number, required: true },
    }],
    outwardId: [{ type: mongoose.Schema.Types.ObjectId, required: false }],
    totalLoadedWeightInKg: { type: Number, required: false },
    transitStatus: { type: String, required: true },//assigned, loaded, unloaded, delivered, cancelled, completed(It'll complete only after the transit inward is completed)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    tripStatus: { type: String, required: true }, //Active //The isn't madatory for the this flow of the trip.
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, { versionKey: false })

const model = mongoose.model('trips', tripSchema);
const modelSecondary = secondaryDB.model('trips', tripSchema);


/// Trip Activity
const collectionActivitySchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, required: [true, "tripId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('trip_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('trip_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const tripActivityJoiSchema = Joi.object({
    tripId: Joi.object().required(),
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
const createActivity = async function (tripActivityData) {
    if (tripActivityData.what.oldValues && tripActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(tripActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(tripActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                tripActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                tripActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // tripActivityData.what.oldValues === null && tripActivityData.what.newValues === null ? delete tripActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(tripActivityData, tripActivityJoiSchema, { abortEarly: false }).then(async (tripActivityData) => {
            await modelActivity(tripActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
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
                        "tripId": selectedData._id,
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
                                "collectionName": "trips",
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
                        "tripId": selectedData._id,
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
                                message: "Trip removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "Trip not found!",
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
}